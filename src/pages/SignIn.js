import React from 'react';
import 'firebaseui/dist/firebaseui.css';
import { Typography, CircularProgress } from '@material-ui/core';
import { withFirebase } from '../firebase';
import { generateIdenticon } from '../utils';
import { palette } from '../style';

class SignIn extends React.Component {
	state = {
		loading: true
	}

	async updateUser(authResult) {
		const { additionalUserInfo, user } = authResult
		const { displayName, email, photoURL, uid } = user
		const avatar = photoURL || generateIdenticon(uid);

		if (!photoURL) {
			await user.updateProfile({ photoURL: avatar });
		}

		if (additionalUserInfo.isNewUser) {
			await this.props.firestore.doc(`users/${uid}`).set({
				email,
				photoURL: avatar,
				displayName,
			});
		}

		return true;
	}

	uiConfig = {
		signInFlow: 'popup',
		signInSuccessUrl: '/',
		callbacks: {
			signInSuccessWithAuthResult: (authResult, redirectUrl) => {
				this.setState({ loading: true });
				this.updateUser(authResult).then(() => {
					this.props.history.replace('/');
				})
	      return false;
    	},
			uiShown: () => {
				this.setState({ loading: false })
			}
		},
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
					<h1 className="app-name">Y & D Browne 2018</h1>
					<div>
						<div id="firebaseui-auth-container" />
						<section>
							{this.state.loading
								? <CircularProgress />
								: (
									<Typography component="p" className="body">
										Thanks for downloading the app, sign in below and join in the fun for our special day.
									</Typography>
								)
							}
						</section>
					</div>
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
						height: 100%;
						width: 100%;
						display: flex;
						flex-direction: column;
						justify-content: space-between;
          }
					section {
						height: 35vh;
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
					.app-name {
						font-family: 'Great Vibes';
						color ${palette.champagne};
						text-shadow: 1px 1px 4px ${palette.gold};
						height: 25vh;
						display: flex;
						align-items: center;
						justify-content: center;
					}
				`}</style>
      </div>
		);
	}
}

export default withFirebase(SignIn);
