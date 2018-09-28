import React from 'react';
import { Paper, CardContent, Typography } from '@material-ui/core'
import MediaItem from './MediaItem';
// import GridListTileBar from '@material-ui/core/GridListTileBar';

export default class ScenarioMediaItem extends React.Component {
	constructor(props) {
		super(props);
		this.rotations = [this.randomDegree(), this.randomDegree()];
		this.resetRotation = this.rotations.reduce((accum, rotation) => accum + rotation, 0);
	}

	randomDegree() {
		return Math.floor(Math.random() * (5 - -5) + -5);
	}

	render() {
		return (
			<MediaItem
				mediaReference={this.props.mediaReference}
				mediaType={this.props.mediaType}
			/>
		)
	}
}
