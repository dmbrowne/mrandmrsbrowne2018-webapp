import React from 'react';
import { Route } from 'react-router-dom';
import ISpy from './ISpy';
import ISpyScenario from './ISpyScenario';
import Feed from './Feed';
import NewPost from './NewPost';
import AddScenarioMedia from './AddScenarioMedia';
import Account from './Account';
import { withAuth } from '../store/auth';
import Appbar from '../components/AppBar';
import BottomTabNavigation from '../components/TabNavigation';

class IndexPage extends React.Component {
	static tabs = [
		'/',
		'/i-spy',
		'/me',
	]

	state = {
		appBarTitle: 'Mr. & Mrs. Browne',
		nextComponent: null,
		onBack: null,
		hideNavigationTabs: false,
		currentTab: IndexPage.tabs.indexOf(this.props.location.pathname),
	}

	componentDidMount() {
		if (this.props.auth.user === null) {
			this.props.history.push("/signin");
			return null;
		}
		if (!this.props.auth.user.displayName) {
			this.props.history.push("/me");
			return null;
		}
	}

	handleChange = (event, value) => {
		this.setState({ currentTab: value });
		this.props.history.push(IndexPage.tabs[value])
	};

	componentWillUpdate(nextProps) {
		if (this.props.location.pathname !== nextProps.location.pathname) {
			this.setState({ appBarTitle: 'Mr. & Mrs. Browne', nextComponent: null, onBack: null })
		}
	}

	componentDidUpdate(prevProps, prevState) {
		const locationState = this.props.location.state;

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

	setAppBarNext = (component) => {
		this.setState({ nextComponent: component })
	}

	currentRouteIsATabRoute() {
		return IndexPage.tabs.some(tab => tab === this.props.location.pathname);
	}

	render() {
		if (this.props.auth.user === null) {
      return null;
		}

		const appActions = {
			setAppBarTitle: this.setAppBarTitle,
			setAppBarNext: this.setAppBarNext,
		}

		return (
			<div className="app-container">
				<Appbar
					appBarTitle={this.state.appBarTitle}
					showBackButton={!this.currentRouteIsATabRoute()}
					nextComponent={this.state.nextComponent}
				/>
				<main>
					<Route
						exact
						path={'/'}
						render={props => <Feed {...props} appActions={appActions} />}
					/>
					<Route
						path={'/new-post'}
						render={props => <NewPost {...props} appActions={appActions} />}
					/>
					<Route
						exact
						path={'/i-spy'}
						render={props => <ISpy {...props} appActions={appActions} />}
					/>
					<Route
						exact
						path={'/me'}
						render={props => <Account {...props} appActions={appActions} />}
					/>
					<Route
						exact
						path={'/i-spy/:scenarioId'}
						render={props => <ISpyScenario {...props} appActions={appActions} />}
					/>
					<Route
						path={'/i-spy/:scenarioId/add-media'}
						render={props => <AddScenarioMedia {...props} appActions={appActions} />}
					/>
				</main>
				{!this.state.hideNavigationTabs &&
					<BottomTabNavigation
						className="tab-navigation"
						value={this.state.currentTab}
						onChange={this.handleChange}
					/>
				}
				<style jsx>{`
					.app-container {
						padding-bottom: ${this.state.hideNavigationTabs ? '0px' : '56px'};
						overflow: hidden;
					}
					.app-container :global(.tab-navigation) {
						height: 56px;
						width: 100%;
						position: fixed;
						bottom: 0;
					}
					main {
						margin-left: auto;
						margin-right: auto;
						margin-top: 56px;
						max-width: 760px;
					}
				`}</style>
			</div>
		)
	}
}

export default withAuth(IndexPage)
