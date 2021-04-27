import { Log, User, UserManager } from 'oidc-client';

export class AuthService {
  public userManager: UserManager;

  constructor() {
    const settings = {
      authority: process.env.REACT_APP_STSAUTHORITY,
      client_id: process.env.REACT_APP_CLIENTID,
      redirect_uri: `${process.env.REACT_APP_CLIENTROOT}signin-callback.html`,
      silent_redirect_uri: `${process.env.REACT_APP_CLIENTROOT}silent-renew.html`,
      // tslint:disable-next-line:object-literal-sort-keys
      post_logout_redirect_uri: `${process.env.REACT_APP_CLIENTROOT}`,
      response_type: 'code',
      prompt: 'login',
      scope: 'openid ' + process.env.REACT_APP_CLIENTSCOPE,
    };
    this.userManager = new UserManager(settings);

    Log.logger = console;
    Log.level = Log.INFO;
  }

  public getUser(): Promise<User | null> {
    return this.userManager.getUser();
  }

  public login(): Promise<void> {
    return this.userManager.signinRedirect();
  }

  public renewToken(): Promise<User> {
    return this.userManager.signinSilent();
  }

  public logout(): Promise<void> {
    return this.userManager.signoutRedirect();
  }
}
