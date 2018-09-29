import React from 'react';
import {
	Card,
	CardContent,
	Typography,
	CardActions,
	IconButton,
	Paper,
	CircularProgress,
} from '@material-ui/core';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import FeedCardHeader from './FeedCardHeader';
import FeedCardGameUpdateHeader from './FeedCardGameUpdateHeader';
import MediaItem from './MediaItem';

export default class FeedCard extends React.Component {
	render() {
		return (
			<div className={`feedcard${this.props.gameReference ? ' game': ''}`}>
				{this.props.gameReference &&
					<FeedCardGameUpdateHeader
						className="game-update"
						userId={this.props.userId}
						gameRef={this.props.gameReference}
						scenarioRef={this.props.scenarioReference}
						mediaType={this.props.mediaType}
					/>
				}
				<Card square={true} className="card">
					{!this.props.gameReference &&
						<FeedCardHeader
							className="game-update"
							userId={this.props.userId}
							headline={this.props.headline}
						/>
					}
					<MediaItem
						mediaReference={this.props.mediaReference}
						mediaType={this.props.mediaType}
					/>
					{this.props.caption &&
						<CardContent>
							<Typography component="p">
								{this.props.caption}
							</Typography>
						</CardContent>
					}
					<CardActions disableActionSpacing>
						<IconButton aria-label="Add to favorites">
							<FavoriteIcon />
						</IconButton>
						<IconButton aria-label="Share">
							<ShareIcon />
						</IconButton>
					</CardActions>
				</Card>
				<style jsx>{`
					.feedcard :global(img),
					.feedcard :global(video){
						max-width: 100%;
						max-height: 100%;
					}
				`}</style>
			</div>
		)
	}
}
