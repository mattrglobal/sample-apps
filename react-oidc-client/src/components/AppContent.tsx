import * as React from 'react';

import * as toastr from 'toastr';
import { AuthService } from '../services/AuthService';

import AuthContent from './AuthContent';
import Buttons from './Buttons';

export default class AppContent extends React.Component<any, any> {
  public authService: AuthService;
  private shouldCancel: boolean;

  constructor(props: any) {
    super(props);

    this.authService = new AuthService();
    this.state = { user: {}, api: {} };
    this.shouldCancel = false;
  }

  public componentDidMount() {
    this.getUser();
  }

  public login = () => {
    this.authService.login();
  };


  public componentWillUnmount() {
    this.shouldCancel = true;
  }

  public logout = () => {
    this.authService.logout();
  };

  public getUser = () => {
    this.authService.getUser().then(user => {
      if (user) {
        toastr.success('User has been successfully loaded from store.');
      } else {
        toastr.info('You have not been verified.');
      }

      if (!this.shouldCancel) {
        this.setState({ user });
      }
    });
  };

  public render() {
    return (
      <>
        <Buttons
          login={this.login}
          logout={this.logout}
          getUser={this.getUser}
        />

        <AuthContent api={this.state.api} user={this.state.user} />
      </>
    );
  }
}
