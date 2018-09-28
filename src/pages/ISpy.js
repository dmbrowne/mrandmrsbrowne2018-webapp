import React from 'react';
import { CircularProgress } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { withGames } from '../store/games';

class ISpy extends React.Component {
	componentDidMount() {
		this.props.games.getGame('ispy');
		this.props.games.getGameScenarios('ispy');
	}

	render() {
		const { match, games } = this.props;
		const { gamesById, scenariosById, scenariosByGame } = games;
		const game = gamesById.ispy;
		const scenarioIds = scenariosByGame.ispy;
		const scenarios = scenarioIds && scenarioIds.map(id => scenariosById[id]);
		return (
			<div>
				{!game
					? <CircularProgress />
					: (
						<React.Fragment>
							<h1>{game.title}</h1>
							{game.description && <p>{game.description}</p>}
							{scenarios && scenarios.map(scenario =>
								<p key={scenario.id}>
									<Link to={`${match.url}/${scenario.id}`}>{scenario.title}</Link>
								</p>
							)}
						</React.Fragment>
					)
				}
			</div>
		)
	}
}

export default withGames(ISpy);
