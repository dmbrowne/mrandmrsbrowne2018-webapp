import React from 'react';
import { Paper, CardContent, Typography } from '@material-ui/core'
import MediaItem from './MediaItem';
// import GridListTileBar from '@material-ui/core/GridListTileBar';

export default class ScenarioMediaItem extends React.Component {
	state = {
		media: {}
	}

	constructor(props) {
		super(props);
		this.rotations = [this.randomDegree(), this.randomDegree()];
		this.resetRotation = this.rotations.reduce((accum, rotation) => accum + rotation, 0);
	}

	onGetMediaSuccess = media => {
		this.setState({ media })
	}

	randomDegree() {
		return Math.floor(Math.random() * (5 - -5) + -5);
	}

	componentDidUpdate(prevProps) {
		if (!prevProps.isActive && this.props.isActive) {
			if (this.props.onActive) {
				this.props.onActive(this.state.media);
			}
		}
	}

	render() {
		return (
			<Paper style={{ transform: `rotate(${this.rotations[0]}deg)` }}>
				<Paper style={{ transform: `rotate(${this.rotations[1]}deg)` }}>
					<Paper style={{ transform: `rotate(-${this.resetRotation}deg)` }}>
						<CardContent>
							<MediaItem
								mediaReference={this.props.mediaReference}
								mediaType={this.props.mediaType}
								onGetMediaSuccess={this.onGetMediaSuccess}
							/>
							<p>{''}</p>
						</CardContent>
					</Paper>
				</Paper>
			</Paper>
		)
	}
}
