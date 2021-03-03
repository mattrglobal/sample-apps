import * as React from 'react';

interface IButtonsProps {
  login: () => void;
  getUser: () => void;
  logout: () => void;
}

const Buttons: React.SFC<IButtonsProps> = props => {
  return (
    <div className="row">
      <div className="col-md-12 text-center" style={{ marginTop: '30px' }}>
        <button className="btn btn-primary btn-login" style={{ margin: '10px' }} onClick={props.login}>
          Verify
        </button>
        <button className="btn btn-secondary btn-getuser" style={{ margin: '10px' }} onClick={props.getUser}>
          Get User info
        </button>
        <button className="btn btn-dark btn-logout" style={{ margin: '10px' }} onClick={props.logout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Buttons;
