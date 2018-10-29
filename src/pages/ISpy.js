import React from 'react';
import { Link } from 'react-router-dom';
import { withGames } from '../store/games';
import PageLoader from '../components/PageLoader';
import { palette, fontMap } from '../style';
import HeartIcon from '../icons/Heart';
import Decoration from '../icons/OrdinateLineDivider';
import { Typography } from '@material-ui/core';

class ISpy extends React.Component {
	fonts = {
		bungee: 'Bungee Inline',
		fredricka: 'Fredricka the Great',
		handlee: 'Handlee',
		indie: 'Indie Flower',
		monoton: 'Monoton',
		montserrat: 'Montserrat',
		shrikhand: 'Shrikhand',
		spirax: 'Spirax',
		yellowtail: 'Yellowtail',
	};

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
			<div className="ispy">
				{!game
					? <PageLoader />
					: <React.Fragment>
						<h1 className="title">{game.title}</h1>
						<div className="decoration">
							<Decoration />
						</div>
						{game.description &&
							<Typography variant="body1" syle={{marginBottom: 32}}>{game.description}</Typography>
						}
						{scenarios && scenarios.map((scenario, idx) => (
							<p key={scenario.id} className="scenario" style={{ fontFamily: fontMap[scenario.font] }}>
								<Link to={`${match.url}/${scenario.id}`}>
									<HeartIcon 
										style={{
											width: 24,
											marginRight: 8,
										}}
										border="#555"
									/>
									<span>{scenario.title}</span>
								</Link>
							</p>
						))}
					</React.Fragment>
				}
				<style jsx>{`
					.ispy {
						padding: 0 24px 16px;
					}
					.title {
						font-family: Pacifico;
						text-align: center;
						font-size: 2.5em;
					}
					.decoration {
						width: 50%;
						margin: 32px auto;
					}
					.scenario {
						text-align: center;
						margin: 8px 0;
					}
					.scenario :global(a) {
						font-size: 1.3em;
						line-height: 0;
						text-decoration: none;
						color: ${palette.navy};
						color: #273c74;
					}
					.scenario :global(a *) {
						vertical-align: middle;
					}
				`}</style>
			</div>
		)
	}
}

export default withGames(ISpy);
