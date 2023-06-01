import { CreateClaimSourceArgs } from '@/types/create-claim-source.args';
import { AppConfig } from '@/validators/env.validator';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import {
  CreateClaimSourceResBody,
  createClaimSourceResBodySchema,
} from '@/types/create-claim-source.res.body';
import {
  GetAuthProvidersResBody,
  getAuthProvidersResBodySchema,
} from '@/types/get-auth-providers.res.body';
import {
  CreateCredentialConfigResBody,
  createCredentialConfigResBodySchema,
} from '@/types/create-credential-config.res.body';
import { CreateCredentialConfigArgs } from '@/types/create-credential-config.args';
import {
  CreateUriResBody,
  createUriResBodySchema,
} from '@/types/create-uri.res.body';
import { CreateUriArgs } from '@/types/create-uri.args';
import {
  GetCredentialConfigsResBody,
  getCredentialConfigsResBodySchema,
} from '@/types/get-credential-config.res.body';
import {
  GetClaimSourcesResBody,
  getClaimSourcesResBodySchema,
} from '@/types/get-claim-sources.res.body';
import { DeleteClaimSourceArgs } from '@/types/delete-claim-source.args';
import { GetCredentialConfigsArgs } from '@/types/get-credential-configs.args';
import { DeleteCredentialConfigArgs } from '@/types/delete-credential-config.args';
import { GetClaimSourcesArgs } from '@/types/get-claim-sources.args';
import { GetAuthProvidersArgs } from '@/types/get-auth-providers.args';
import { UpdateOpenIdConfigArgs } from '@/types/update-openid-config.args';
import {
  UpdateOpenIdConfigResBody,
  updateOpenIdConfigResBodySchema,
} from '@/types/update-openid-config.res.body';
import { GetOpenIdConfig } from '@/types/get-openid-config.args';
import {
  GetOpenIdConfigResBody,
  getOpenIdConfigResBodySchema,
} from '@/types/get-openid-config.res.body';

@Injectable()
export class MattrService {
  private readonly logger = new Logger(MattrService.name);

  constructor(
    private readonly config: ConfigService<AppConfig>,
    private readonly http: HttpService,
  ) {}

  public get BASE_URL(): string {
    return `https://${this.config.get('MATTR_TENANT')}`;
  }

  public buildConfig(token: string): AxiosRequestConfig {
    return {
      headers: { Authorization: `Bearer ${token}` },
    };
  }

  public async createClaimSource(
    args: CreateClaimSourceArgs,
  ): Promise<AxiosResponse<CreateClaimSourceResBody>> {
    const url = `${this.BASE_URL}/core/v1/claimsources`;
    const body = args.body;
    const config = this.buildConfig(args.token);
    const res = this.http
      .post(url, body, config)
      .pipe(
        map((res) => ({
          ...res,
          data: createClaimSourceResBodySchema.parse(res.data),
        })),
      )
      .pipe(
        catchError((error: AxiosError) => {
          this.logger.error(
            `createClaimSource - ${JSON.stringify(error.response.data)}`,
          );
          throw 'An error happened!';
        }),
      );
    return await firstValueFrom(res);
  }

  public async getAuthProviders(
    args: GetAuthProvidersArgs,
  ): Promise<AxiosResponse<GetAuthProvidersResBody>> {
    const url = `${this.BASE_URL}/v1/users/authenticationproviders`;
    const config = this.buildConfig(args.token);
    const res = this.http
      .get(url, config)
      .pipe(
        map((res) => ({
          ...res,
          data: getAuthProvidersResBodySchema.parse(res.data),
        })),
      )
      .pipe(
        catchError((error: AxiosError) => {
          this.logger.error(
            `getAuthProviders - ${JSON.stringify(error.response.data)}`,
          );
          throw 'An error happened!';
        }),
      );
    return await firstValueFrom(res);
  }

  public async createCredentialConfig(
    args: CreateCredentialConfigArgs,
  ): Promise<AxiosResponse<CreateCredentialConfigResBody>> {
    const url = `${this.BASE_URL}/v2/credentials/web-semantic/configurations`;
    const body = args.body;
    const config = this.buildConfig(args.token);
    const res = this.http
      .post(url, body, config)
      .pipe(
        map((res) => ({
          ...res,
          data: createCredentialConfigResBodySchema.parse(res.data),
        })),
      )
      .pipe(
        catchError((error: AxiosError) => {
          this.logger.error(
            `createCredentialConfig - ${JSON.stringify(error.response.data)}`,
          );
          throw 'An error happened!';
        }),
      );
    return await firstValueFrom(res);
  }

  public async getOpenIdConfig(
    args: GetOpenIdConfig,
  ): Promise<AxiosResponse<GetOpenIdConfigResBody>> {
    const url = `${this.BASE_URL}/core/v1/openid/configuration`;
    const config = this.buildConfig(args.token);
    const res = this.http
      .get(url, config)
      .pipe(
        map((res) => ({
          ...res,
          data: getOpenIdConfigResBodySchema.parse(res.data),
        })),
      )
      .pipe(
        catchError((error: AxiosError) => {
          this.logger.error(
            `getOpenIdConfig - ${JSON.stringify(error.response.data)}`,
          );
          throw 'An error happened!';
        }),
      );
    return await firstValueFrom(res);
  }

  public async updateOpenIdConfig(
    args: UpdateOpenIdConfigArgs,
  ): Promise<AxiosResponse<UpdateOpenIdConfigResBody>> {
    const url = `${this.BASE_URL}/core/v1/openid/configuration`;
    const body = args.body;
    const config = this.buildConfig(args.token);
    const res = this.http
      .put(url, body, config)
      .pipe(
        map((res) => ({
          ...res,
          data: updateOpenIdConfigResBodySchema.parse(res.data),
        })),
      )
      .pipe(
        catchError((error: AxiosError) => {
          this.logger.error(
            `updateOpenIdConfig - ${JSON.stringify(error.response.data)}`,
          );
          throw 'An error happened!';
        }),
      );
    return await firstValueFrom(res);
  }

  public async createUri(
    args: CreateUriArgs,
  ): Promise<AxiosResponse<CreateUriResBody>> {
    const url = `${this.BASE_URL}/core/v1/openid/offers`;
    const body = args.body;
    const config = this.buildConfig(args.token);
    const res = this.http
      .post(url, body, config)
      .pipe(
        map((res) => ({
          ...res,
          data: createUriResBodySchema.parse(res.data),
        })),
      )
      .pipe(
        catchError((error: AxiosError) => {
          this.logger.error(
            `createUri - ${JSON.stringify(error.response.data)}`,
          );
          throw 'An error happened!';
        }),
      );
    return await firstValueFrom(res);
  }

  public async getCredentialConfigs(
    args: GetCredentialConfigsArgs,
  ): Promise<AxiosResponse<GetCredentialConfigsResBody>> {
    const url = `${this.BASE_URL}/v2/credentials/web-semantic/configurations`;
    const config = this.buildConfig(args.token);
    const res = this.http
      .get(url, config)
      .pipe(
        map((res) => ({
          ...res,
          data: getCredentialConfigsResBodySchema.parse(res.data),
        })),
      )
      .pipe(
        catchError((error: AxiosError) => {
          this.logger.error(
            `getCredentialConfigs - ${JSON.stringify(error.response.data)}`,
          );
          throw 'An error happened!';
        }),
      );
    return await firstValueFrom(res);
  }

  public async getClaimSources(
    args: GetClaimSourcesArgs,
  ): Promise<AxiosResponse<GetClaimSourcesResBody>> {
    const url = `${this.BASE_URL}/v1/claimsources`;
    const config = this.buildConfig(args.token);
    const res = this.http
      .get(url, config)
      .pipe(
        map((res) => ({
          ...res,
          data: getClaimSourcesResBodySchema.parse(res.data),
        })),
      )
      .pipe(
        catchError((error: AxiosError) => {
          this.logger.error(
            `getClaimSources - ${JSON.stringify(error.response.data)}`,
          );
          throw 'An error happened!';
        }),
      );
    return await firstValueFrom(res);
  }

  public async deleteCredentialConfig(
    args: DeleteCredentialConfigArgs,
  ): Promise<AxiosResponse> {
    const url = `${this.BASE_URL}/v2/credentials/web-semantic/configurations/${args.query.id}`;
    const config = this.buildConfig(args.token);
    const res = this.http
      .delete(url, config)
      .pipe((res) => res)
      .pipe(
        catchError((error: AxiosError) => {
          this.logger.error(
            `deleteCredentialConfig - ${JSON.stringify(error.response.data)}`,
          );
          throw 'An error happened!';
        }),
      );
    return await firstValueFrom(res);
  }

  public async deleteClaimSource(
    args: DeleteClaimSourceArgs,
  ): Promise<AxiosResponse> {
    const url = `${this.BASE_URL}/v1/claimsources/${args.query.id}`;
    const config = this.buildConfig(args.token);
    const res = this.http
      .delete(url, config)
      .pipe((res) => res)
      .pipe(
        catchError((error: AxiosError) => {
          this.logger.error(
            `deleteClaimSource - ${JSON.stringify(error.response.data)}`,
          );
          throw 'An error happened!';
        }),
      );
    return await firstValueFrom(res);
  }
}
