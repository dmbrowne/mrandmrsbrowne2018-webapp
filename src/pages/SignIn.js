import React from 'react';
import firebase from 'firebase/app';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import { Typography } from '@material-ui/core';
import logo from '../icons/yd-logo.png';
import { withFirebase } from '../firebase';
import { generateIdenticon } from '../utils';


class SignIn extends React.Component {
	state = {
		loading: true
	}

	uiConfig = {
		callbacks: {
			signInSuccessWithAuthResult: async (authResult, redirectUrl) => {
				const { additionalUserInfo, user } = authResult
				const { displayName, email, photoURL, uid } = user

				const avatar = photoURL || generateIdenticon(uid);

				if (!photoURL) {
					user.updateProfile({ photoURL: avatar });
				}

				if (additionalUserInfo.isNewUser) {
					await this.props.firestore.doc(`users/${uid}`).set({
						email,
						photoURL: avatar,
						displayName,
					})
				}
	      this.props.history.push('/i-spy');
	      return false;
    	},
			uiShown: () => {
				this.setState({ loading: false })
			}
		},
		signInSuccessUrl: '',
		signInOptions: [
			firebase.auth.GoogleAuthProvider.PROVIDER_ID,
			firebase.auth.FacebookAuthProvider.PROVIDER_ID,
			firebase.auth.TwitterAuthProvider.PROVIDER_ID,
			{
				provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
				defaultCountry: 'GB'
			},
		],
	};

	componentDidMount() {
		const ui = new firebaseui.auth.AuthUI(firebase.auth());
		ui.start('#firebaseui-auth-container', this.uiConfig);
	}

	render() {
		return (
			<div className="sign-in-root">
        <div className="content">
          <Typography variant="display3" component="h1" className="title">
            Welcome
          </Typography>
          <Typography component="p" className="body">
            Thanks for downloading the app, sign in below and join in the fun for our special day.
          </Typography>
          <div id="firebaseui-auth-container" />
          {this.state.loading && <div id="loader">Loading...</div>}
        </div>
        <style jsx>{`
          .sign-in-root {
            background: #efefef;
            padding: 32px;
						min-height: calc(100vh - 64px);
          }
          .content {
            position: relative;
            z-index: 1;
						text-align: center;
          }
					.sign-in-root :global(.title) {
						margin: 24px 0;
					}
					.sign-in-root :global(.body) {
						margin: 24px 0;
					}
					:global(#firebaseui-auth-container) {
						margin: 40px 16px 32px;
					}
				`}</style>
      </div>
		);
	}
}

export default withFirebase(SignIn);
