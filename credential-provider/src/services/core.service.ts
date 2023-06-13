import { logger } from '@/common/helpers';
import { users } from '@/constants/claim-source';
import { CreateClaimSourceReqBody } from '@/types/create-claim-source.args';
import { CreateCredentialConfigReqBody } from '@/types/create-credential-config.req.body';
import { CreateResponseTokenArgs } from '@/types/create-response-token.args';
import { AuthProvider } from '@/types/get-auth-providers.res.body';
import { GetUserArgs } from '@/types/get-user.args';
import { SetupInteractionHookArgs } from '@/types/setuup-interacton-hook.args';
import { UpdateOpenIdConfigReqBody } from '@/types/update-openid-config.req.body';
import { User } from '@/types/User';
import { AppConfig } from '@/validators/env.validator';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MattrService } from './mattr.service';
import { jwtVerify, decodeJwt, SignJWT } from 'jose';

@Injectable()
export class CoreService {
  private readonly logger = new Logger(CoreService.name);

  constructor(
    private readonly mattrService: MattrService,
    private readonly config: ConfigService<AppConfig>,
    private readonly jwt: JwtService,
  ) {}

  public getUser(args: GetUserArgs): User | object {
    this.logger.log(`Email from AuthenticationProvider: ${args.email}`);
    const res = users.find((r) => r.email === args.email);
    this.logger.log(`User retrieved from ClaimSource: ${JSON.stringify(res)}`);
    if (!res) {
      this.logger.warn(
        `User with email '${args.email}' not found, returning {}`,
      );
      return {};
    }
    return res;
  }

  /**
   * Performs the following to create response token for interaction-hook
   *
   * 1. Get secret from interaction-hook config - MattrService.getOpenIdConfig() -> res.data.secret
   * 2. Get tenant_domain from ENV/config -> issuer
   * 3. Get URL for interaction-hook UI -> NGROK_URL/core/2fa -> audience
   * 4. Validate session_token using info above -> verifyResult
   * 5. Extract state & redirectUrl from verifyResult.payload
   * 6. Create responseTokenPayload using state & any claims
   * 7. Create responseToken using SignJWT(...etc)
   * 8. Construct callbackUrl for redirect on interaction-hook
   * 9 Return callbackUrl
   * @param CreateResponseTokenArgs
   * @returns string
   * @example
   * await createResponseToken({
   *   session_token: "ONE_TIME_JWT_TOKEN",
   * })
   */
  public async createResponseToken(
    args: CreateResponseTokenArgs,
  ): Promise<string> {
    const { session_token } = args;

    const getOpenIdConfigRes = await this.mattrService.getOpenIdConfig({
      token: this.config.get('MATTR_AUTH_TOKEN'),
    });
    const encodedSecret = getOpenIdConfigRes.data.interactionHook.secret;
    this.logger.log(`res.data.interactionHook.secret  -> ${encodedSecret}`);
    const secret = Buffer.from(encodedSecret, 'base64');
    this.logger.log(`secret -> ${JSON.stringify(secret)}`);

    const decoded = decodeJwt(session_token);
    const audience = decoded.aud as string;
    const issuer = decoded.iss;
    this.logger.log(`issuer > ${issuer}`);
    const verifyResult = await jwtVerify(session_token, secret, {
      issuer,
      audience,
    }).catch((error) => {
      this.logger.error('Invalid session token', error);
      throw new Error('Invalid session token');
    });
    this.logger.log('Verified session token', verifyResult);

    const { state, redirectUrl } = verifyResult.payload;

    const responseTokenPayload = {
      /**
       * IMPORTANT: The state must be signed to prevent CSRF attacks.
       */
      state,
      /**
       * The claims to be merged is optional.
       */
      claims: {},
    };
    const responseToken = await new SignJWT(responseTokenPayload)
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime('1m')
      .setIssuer(audience as string)
      .setAudience(issuer)
      .sign(secret);

    this.logger.log(
      `Generated response session token --> ${JSON.stringify(
        decodeJwt(responseToken),
      )}`,
    );

    const callbackUrl = `${redirectUrl}?session_token=${responseToken}`;
    this.logger.log(
      `Finished processing Interaction Hook request, user will be redirected to ${callbackUrl}`,
    );
    /**
     * Return callbackUrl so that view template can initiate redirecting user
     */
    return callbackUrl;
  }

  public get TOKEN(): string {
    return this.config.get('MATTR_AUTH_TOKEN');
  }

  public isValidToken(token: string): boolean {
    this.logger.warn(`Checking if MATTR auth token is expired`);
    try {
      const res = this.jwt.decode(token) as { exp: number };
      const exp = new Date(res.exp * 1000);
      const valid = exp > new Date();
      if (!valid) {
        this.logger.error(
          `Your MATTR_AUTH_TOKEN from .env has expired, please replace it with a valid one`,
        );
      } else {
        this.logger.log(`✅ Token is valid`);
      }
      return valid;
    } catch (e) {
      this.logger.error(`Please provide a proper MATTR_AUTH_TOKEN in .env`);
    }
  }

  public checkIssuesAuthProviderConfigs(authProvider: AuthProvider): boolean {
    // Checking authProvider.scope
    if (!authProvider.scope.includes('openid')) {
      this.logger.warn(
        `Please make sure you include "openid" in the "scopes" array`,
      );
      return true;
    }
    if (!authProvider.scope.includes('email')) {
      this.logger.warn(
        `Please make sure you include "email" in the "scopes" array`,
      );
      return true;
    }

    // Checking authProvider.claimsToSync
    if (!authProvider.claimsToSync.includes('email')) {
      this.logger.warn(
        'Please make sure you include "email" in the "claimsToSync" array',
      );
      return true;
    }
  }

  public async setupInteractionHook(
    args: SetupInteractionHookArgs,
  ): Promise<boolean> {
    this.logger.warn(`Setting up interaction hook for 2FA`);
    const { token, interactionHookUrl } = args;

    // UPDATE_OPEN_ID_CONFIG
    const updateOpenIdConfigReqBody: UpdateOpenIdConfigReqBody = {
      interactionHook: {
        url: interactionHookUrl,
        disabled: false,
      },
    };
    const updateOpenIdConfigRes = await this.mattrService.updateOpenIdConfig({
      token,
      body: updateOpenIdConfigReqBody,
    });

    if (updateOpenIdConfigRes.status === 200) {
      this.logger.log(`🪝 Successfully setup interaction hook for 2FA`);
      return true;
    } else {
      return false;
    }
  }

  public async createQrCodeUrl(ngrokUrl: string): Promise<string> {
    this.logger.log(`==========`);

    const token = this.TOKEN;

    const hasValidToken = this.isValidToken(token);
    if (!hasValidToken) return;

    await this.deleteSampleAppData();

    const getAuthProvidersRes = await this.mattrService.getAuthProviders({
      token,
    });
    if (getAuthProvidersRes.data.data.length >= 1) {
      this.logger.log(`🔒 Authentication Provider retrieved`);
      const authProvider = getAuthProvidersRes.data.data[0];
      const terminate = this.checkIssuesAuthProviderConfigs(authProvider);
      if (terminate) return;
    } else {
      this.logger.warn(`❗ Please create an Authentication Provider`);
      return;
    }

    // Create claim source
    const createClaimSourceReqBody: CreateClaimSourceReqBody = {
      name: 'SAMPLE_APP_CLAIM_SOURCE',
      url: `${ngrokUrl}/core/user`,
      authorization: {
        type: 'api-key',
        value: 'DEMO_SECRET',
      },
      requestParameters: {
        email: {
          mapFrom: 'claims.email',
          defaultValue: 'NOT_PROVIDED',
        },
      },
    };
    const createClaimSourceRes = await this.mattrService.createClaimSource({
      token,
      body: createClaimSourceReqBody,
    });
    const claimSourceId = createClaimSourceRes.data.id;
    this.logger.log(`ClaimSource created, ID -> ${claimSourceId}`);

    // Setup Interaction Hook (OpenID Config)
    const interactionHookSetup = await this.setupInteractionHook({
      token,
      interactionHookUrl: `${ngrokUrl}/core/2fa`,
    });
    if (!interactionHookSetup) {
      this.logger.error(`Failed to setup Interaction Hook`);
      return;
    }

    // Create Credential Configuration
    const createCredentialConfigReqBody: CreateCredentialConfigReqBody = {
      name: 'Kakapo Drivers License',
      issuer: { name: 'Kakapo Transport Agency' },
      type: 'DriversLicense',
      persist: true,
      claimSourceId,
      claimMappings: {
        email: {
          mapFrom: 'claims.email',
          defaultValue: 'NOT_PROVIDED',
          required: true,
        },
        name: {
          mapFrom: 'claims.name',
          defaultValue: 'NOT_PROVIDED',
          required: true,
        },
        licenseNumber: {
          mapFrom: 'claims.licenseNumber',
          defaultValue: 'NOT_PROVIDED',
          required: true,
        },
        issuedDate: {
          mapFrom: 'claims.issuedDate',
          defaultValue: 'NOT_PROVIDED',
        },
        expiryDate: {
          mapFrom: 'claims.expiryDate',
          defaultValue: 'NOT_PROVIDED',
        },
        donor: {
          // Intentionally mapping to a non-existent field from our claim source
          // 'N/A' will appear on your issued credential for the 'donor' field since it failed to map
          mapFrom: 'claims.donor',
          required: true,
          defaultValue: 'N/A',
        },
      },
    };
    const createredentialConfigRes =
      await this.mattrService.createCredentialConfig({
        token,
        body: createCredentialConfigReqBody,
      });
    const credentialId = createredentialConfigRes.data.id;
    this.logger.log(`Credential Configuration created, ID -> ${credentialId}`);

    // Create Credential Issuance Offer URI
    const createdUriRes = await this.mattrService.createUri({
      token,
      body: { credentials: [credentialId] },
    });
    const uri = createdUriRes.data.uri;
    this.logger.log(`⚡ QR Code URI retrieved`);

    const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${uri}`;
    this.printQrCodeUrlInConsole(url);
    return url;
  }

  public async printQrCodeUrlInConsole(url: string): Promise<void> {
    logger(`====👇 Copy and paste the URL below into your browser 👇 ===`);
    logger(`\n${url}\n`);
    logger(`===== Scan the QR code and claim your credential =====`);
  }

  public async deleteSampleAppData(): Promise<void> {
    this.logger.warn(
      `Deleting Claim Sources & Credential Configurations generated by this sample app`,
    );
    await this.deleteClaimSources();
    await this.deleteCredentialConfigs();
  }

  public async deleteClaimSources(): Promise<void> {
    const token = this.TOKEN;
    const getClaimSourcesRes = await this.mattrService.getClaimSources({
      token,
    });

    const claimSources = getClaimSourcesRes.data.data;
    const toDelete = claimSources.filter(
      (d) =>
        d.name === 'SAMPLE_APP_CLAIM_SOURCE' && d.url.includes('.ngrok.app'),
    );
    toDelete.forEach(async (d, i) => {
      this.logger.warn(`⏳ Deleting ClaimSource ${d.id}`);
      setTimeout(async () => {
        const deletion = await this.mattrService.deleteClaimSource({
          token,
          query: { id: d.id },
        });
        if (deletion.status === 204) {
          this.logger.log(`✅ ClaimSource deletion successful for ${d.id}`);
        } else {
          this.logger.log(`❌ ClaimSource deletion failed for ${d.id}`);
        }
      }, i * 3000);
    });
  }

  public async deleteCredentialConfigs(): Promise<void> {
    const token = this.TOKEN;
    const getCredentialConfigsRes =
      await this.mattrService.getCredentialConfigs({ token });
    const credentialConfigs = getCredentialConfigsRes.data.data;
    const toDelete = credentialConfigs.filter(
      (d) => d.name === 'Kakapo Drivers License' && d.type === 'DriversLicense',
    );
    toDelete.forEach((d, i) => {
      this.logger.warn(`⏳ Deleting CredentialConfig ${d.id}`);
      setTimeout(async () => {
        const deletion = await this.mattrService.deleteCredentialConfig({
          token,
          query: { id: d.id },
        });
        if (deletion.status === 204) {
          this.logger.log(
            `✅ CredentialConfiguration deletion successful for ${d.id}`,
          );
        } else {
          this.logger.log(
            `❌ CredentialConfiguration deletion failed for ${d.id}`,
          );
        }
      }, i * 1500);
    });
  }
}
