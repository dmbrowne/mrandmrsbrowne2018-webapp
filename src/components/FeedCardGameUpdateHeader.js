import React from 'react';
import {
	Typography,
	Paper,
	LinearProgress,
} from '@material-ui/core';
import { withGames } from '../store/games';
import { withUsers } from '../store/users';
import UserAvatar from './UserAvatar';
import { palette } from '../style';

class FeedCardGameUpdate extends React.Component {
	componentDidMount() {
		this.props.users.fetchUserIfNonExistent(this.props.userId);
		this.getGame();
	}

	getGame() {
		const { games, gameRef } = this.props;
		const game = games.gamesById[gameRef.id];
		if (!game) {
			// games.getGame(gameRef.id);
			// games.getGameScenarios(gameRef.id);
			games.fetchScenario(gameRef.id, this.props.scenarioRef.id);
		}
	}

	render() {
		const { mediaType, userId, gameRef, scenarioRef, users, games, scenarios, className, ...rootProps } = this.props;
		const mediaNiceName = mediaType === 'image' ? 'photo' : mediaType;
		const user = users.usersById[userId];
		const game = games.gamesById[gameRef.id];
		const scenario = games.scenariosById[scenarioRef.id];
		return (
			<div
				{...rootProps}
				className={`feed-card-game-update ${className ? className : ''}`}
			>
				{<UserAvatar user={user}/>}
				<Paper className="content">
					{user && scenario
						? <Typography variant="caption" style={{ color: palette.gold }}>
							<span className="username"><strong>{user.displayName}</strong></span> posted a{' '}
							<em>{mediaNiceName}</em> for <strong>{scenario.title}</strong>.
						</Typography>
						: <LinearProgress color="secondary" variant="query" />
					}
				</Paper>
				<style jsx>{`
					.feed-card-game-update {
						margin-bottom: 16px;
						display: flex;
					}
					.feed-card-game-update :global(.content){
						padding: 8px;
						margin-left: 16px;
						position: relative;
						flex: 1;
						min-height: calc(48px - 16px);
					}
					.feed-card-game-update :global(.content:before),
					.feed-card-game-update :global(.content:after){
						content: '';
						position: absolute;
						left: 0.3px;
				    top: calc(20px - 9px);
				    width: 0;
				    height: 0;
				    border: 9px solid transparent;
				    border-right-color: #ccc;
				    border-left: 0;
				    margin-top: 0px;
				    margin-left: -9px;
					}
					.feed-card-game-update :global(.content:after){
						border-right-color: #fff;
						top: calc(20px - 8px);
						left: 0;
						border-width: 8px;
						margin-left: -8px;
					}
				`}</style>
			</div>
		)
	}
}
export default withGames(
	withUsers(FeedCardGameUpdate)
);
