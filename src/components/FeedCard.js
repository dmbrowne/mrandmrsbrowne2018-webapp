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
import FeedCardHeader from './FeedCardHeader';
import FeedCardGameUpdateHeader from './FeedCardGameUpdateHeader';
import MediaItem from './MediaItem';
import { withAuth } from '../store/auth';

class FeedCard extends React.Component {
	render() {
		const cardBelongsToAuthUser = this.props.userId === this.props.auth.user.uid;
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
							onDelete={cardBelongsToAuthUser && this.props.onDelete}
						/>
					}
					<MediaItem
						mediaReference={this.props.mediaReference}
						mediaType={this.props.mediaType}
						autoPlayOnScroll
					/>
					<CardActions disableActionSpacing>
						<IconButton aria-label="Add to favorites">
							<FavoriteIcon />
						</IconButton>
					</CardActions>
					{this.props.caption &&
						<CardContent>
							<Typography component="p">
								{this.props.caption}
							</Typography>
						</CardContent>
					}
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

export default withAuth(FeedCard);
