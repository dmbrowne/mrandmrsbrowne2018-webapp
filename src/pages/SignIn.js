import React from 'react';
import 'firebaseui/dist/firebaseui.css';
import { Typography, CircularProgress } from '@material-ui/core';
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
	      this.props.history.push('/');
	      return false;
    	},
			uiShown: () => {
				this.setState({ loading: false })
			}
		},
		signInSuccessUrl: '',
		signInOptions: [
			this.props.firebase.auth.GoogleAuthProvider.PROVIDER_ID,
			this.props.firebase.auth.FacebookAuthProvider.PROVIDER_ID,
			this.props.firebase.auth.TwitterAuthProvider.PROVIDER_ID,
			{
				provider: this.props.firebase.auth.PhoneAuthProvider.PROVIDER_ID,
				defaultCountry: 'GB'
			},
		],
	};

	componentDidMount() {
		this.props.firebaseUI.start('#firebaseui-auth-container', this.uiConfig);
	}

	render() {
		return (
			<div className="sign-in-root">
        <div className="content">
          <div id="firebaseui-auth-container" />
					<section>
						<Typography component="p" className="body">
							Thanks for downloading the app, sign in below and join in the fun for our special day.
						</Typography>
					</section>
          {this.state.loading && <CircularProgress />}
        </div>
        <style jsx>{`
          .sign-in-root {
            background: url('/assets/signInBg.jpg') no-repeat 37%/cover;
						height: calc(100vh);
						overflow: hidden;
          }
          .content {
            position: absolute;
						bottom: 0;
            z-index: 1;
						text-align: center;
						overflow: hidden;
						height: 40%;
						min-height: 400px;
          }
					section {
						height: 50vh;
						background: rgba(255,255,255,0.6);
						margin-top: -106px;
						padding: 80px 32px 16px;
						overflow: hidden;
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
