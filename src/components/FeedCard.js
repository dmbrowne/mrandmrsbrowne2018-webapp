import React from 'react';
import {
	Card,
	CardContent,
	Typography,
	CardActions,
	IconButton,
} from '@material-ui/core';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FeedCardHeader from './FeedCardHeader';
import FeedCardGameUpdateHeader from './FeedCardGameUpdateHeader';
import MediaItem from './MediaItem';
import { withAuth } from '../store/auth';
import { withFirebase } from '../firebase';
import { palette } from '../style';

class FeedCard extends React.Component {
	addPostLike() {
		const { auth, likes } = this.props;
		const key = `likes.${auth.user.uid}`;
		const currentLikesByUser = (likes && likes[auth.user.uid]) || 0;
		this.props.reference.update({
			[key]: currentLikesByUser + 1,
		})
	}

	removePostLike() {
		const key = `likes.${this.props.auth.user.uid}`;
		this.props.reference.update({
			[key]: false,
		})
	}

	isLikedByUser() {
		return this.props.likes && this.props.likes[this.props.auth.user.uid];
	}

	toggleLike = () => {
		this.isLikedByUser()
			? this.removePostLike()
			: this.addPostLike();
	}

	render() {
		const noOfLikes = this.props.likes 
			? Object.entries(this.props.likes).filter(([userId, liked]) => liked).length
			: 0;

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
					<div onDoubleClick={this.toggleLike}>
						<MediaItem
							mediaReference={this.props.mediaReference}
							mediaType={this.props.mediaType}
							imgProps={{
								allowFullscreen: true,
								disableDoubleClick: true,
							}}
							videoProps={{
								allowFullscreen: true,
								autoPlayOnScroll: true,
							}}
						/>
					</div>
					<CardActions disableActionSpacing style={{ paddingBottom: 0 }}>
						<IconButton aria-label="Add to favorites" onClick={this.toggleLike}>
							{this.isLikedByUser()
								? <FavoriteIcon style={{ fontSize: 32, color: palette.gold }} />
								: <FavoriteBorderIcon style={{ color: palette.dark }} />
							}
						</IconButton>
					</CardActions>
					<CardContent style={{ paddingTop: 0 }}>
						{!!noOfLikes && <Typography variant="body2">{noOfLikes} likes</Typography>}
						<Typography component="p" style={{paddingTop: 8}}>
							{this.props.caption}
						</Typography>
					</CardContent>
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

export default withFirebase(withAuth(FeedCard));
