// @flow
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import css from 'styled-jsx/css'
import AppBar from '@material-ui/core/AppBar';
import CircularProgress from '@material-ui/core/CircularProgress';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import RestoreIcon from '@material-ui/icons/Restore';
import FavoriteIcon from '@material-ui/icons/Favorite';
import AccountBox from '@material-ui/icons/AccountBox';
import ISpy from './ISpy';
import ISpyScenario from './ISpyScenario';
import Feed from './Feed';
import NewPost from './NewPost';
import { withFirebase } from '../store/firebase';
import { withAuth } from '../store/auth';
import { width } from 'window-size';
import { Toolbar, Typography, IconButton } from '@material-ui/core';

const appContainerStyles = css`
	.app-container {
		padding-bottom: 56px;
	}

	.app-container :global(.tab-navigation) {
		height: 56px;
		width: 100%;
		position: fixed;
		bottom: 0;
	}
`;

class IndexPage extends React.Component {
	static tabs = [
		'/',
		'/i-spy',
	]

	state = {
		hideNavigationTabs: false,
		currentTab: IndexPage.tabs.indexOf(this.props.location.pathname),
	}

	componentDidMount() {
		if (this.props.auth.user === null) {
			this.props.history.push("/signin");
			return null;
		}

		this.props.firestore.collection('games').get().then(snapshot => {
			const games = snapshot.docs.map(doc => ({
				id: doc.id,
				ref: doc.ref,
				...doc.data(),
			}));
			this.setState({ games });
		});
	}

	handleChange = (event: e, value: number) => {
    this.setState({ currentTab: value });
	};

	componentDidUpdate(prevProps, prevState) {
		const { currentTab } = this.state;
		const locationState = this.props.location.state;
		if (prevState.currentTab !== currentTab) {
			this.props.history.push(IndexPage.tabs[currentTab])
		}
		if (locationState && locationState.hideNavigationTabs) {
			if (!prevState.hideNavigationTabs) {
				this.setState({ hideNavigationTabs: true })
			}
		} else {
			if (this.state.hideNavigationTabs) {
				this.setState({ hideNavigationTabs: false })
			}
		}
	}

	render() {
		if (this.props.auth.user === null) {
      return null;
		}

		return (
			<div className="app-container">
				<AppBar position="fixed">
					<Toolbar>
						<Typography variant="title" color="inherit" style={{ flexGrow: 1 }}>The App</Typography>
						<IconButton color="inherit" onClick={() => this.props.history.push('/me')}>
							<img src={this.props.auth.user.photoURL} className="toolbar-avatar"/>
						</IconButton>
					</Toolbar>
				</AppBar>
				<main>
						<Route exact path={'/'} component={Feed} />
						<Route path={'/new-post'} component={NewPost} />
						<Route path={'/i-spy'} component={ISpy} />
						<Route path={'/i-spy/:scenarioId'} component={ISpyScenario} />
				</main>
				{!this.state.hideNavigationTabs &&
					<BottomNavigation
						className="tab-navigation"
						value={this.state.currentTab}
						onChange={this.handleChange}
						showLabels
					>
						<BottomNavigationAction label="Recents" icon={<RestoreIcon />} />
						<BottomNavigationAction label="I-Spy" icon={<FavoriteIcon />} />
						<BottomNavigationAction label="Bingo" icon={<FavoriteIcon />} />
					</BottomNavigation>
				}
				<style jsx>{appContainerStyles}</style>
				<style jsx>{`
				.app-container {
					padding-bottom: ${this.state.hideNavigationTabs ? '0px' : '56px'};
				}
				`}</style>
				<style jsx>{`
					.toolbar-avatar {
						width: 80%;
						border-radius: 50%;
					}
					main {
						margin-top: 56px;
					}
				`}</style>
			</div>
		)
	}
}

export default withFirebase(
	withAuth(IndexPage, () => (
		<div className="app-container">
			<CircularProgress />
			<style jsx>{appContainerStyles}</style>
		</div>
	))
);
