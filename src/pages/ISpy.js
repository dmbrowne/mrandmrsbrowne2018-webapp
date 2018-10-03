import React from 'react';
import { Link } from 'react-router-dom';
import { withGames } from '../store/games';
import PageLoader from '../components/PageLoader';
import { palette } from '../style';
import HeartIcon from '../icons/Heart';
import Decoration from '../icons/OrdinateLineDivider';

class ISpy extends React.Component {
	fonts = [
		'Bungee Inline',
		'Fredricka the Great',
		'Handlee',
		'Indie Flower',
		'Monoton',
		'Montserrat',
		'Shrikhand',
		'Spirax',
		'Yellowtail',
	];

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
		
		let fontLoopVal = 0
		return (
			<div className="ispy">
				{!game
					? <PageLoader />
					: <React.Fragment>
						<h1 className="title">{game.title}</h1>
						<div className="decoration">
							<Decoration />
						</div>
						{game.description && <p>{game.description}</p>}
						{scenarios && scenarios.map((scenario, idx) => {
							if (fontLoopVal >= this.fonts.length) {
								fontLoopVal = 0;
							}
							const fontFamily = this.fonts[fontLoopVal];
							fontLoopVal++;
							return (
								<p key={scenario.id} className="scenario" style={{ fontFamily }}>
									<Link to={`${match.url}/${scenario.id}`}>
										<HeartIcon border="#555" />
										<span>{scenario.title}</span>
									</Link>
								</p>
							)
						})}
					</React.Fragment>
				}
				<style jsx>{`
					.ispy {
						padding: 24px;
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
					}
					.scenario :global(a) {
						font-size: 1.2em;
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
