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
import moment from 'moment';
import cx from 'classnames';
import FeedCardHeader from './FeedCardHeader';
import FeedCardGameUpdateHeader from './FeedCardGameUpdateHeader';
import MediaItem from './MediaItem';
import { withAuth } from '../store/auth';
import { withFirebase } from '../firebase';
import { palette } from '../style';
import FeedCardComments from './FeedCardComments';
import { withComments } from '../store/comments';
import { compose, isInViewport } from '../utils';
import { withFeed } from '../store/feed';


class FeedCard extends React.Component {
	windowWidth = window.innerWidth || document.documentElement.clientWidth;

	addPostLike() {
		this.props.feed.likePost(this.props.id);
	}

	removePostLike() {
		this.props.feed.unlikePost(this.props.id);
	}

	isLikedByUser() {
		return this.props.likes && this.props.likes[this.props.auth.user.uid];
	}

	toggleLike = (e) => {
		if (e && e.preventDefault) {
			e.preventDefault();
		}

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
			<div className={cx('feedcard', { game: !!this.props.gameReference })}>
				{this.props.gameReference &&
					<FeedCardGameUpdateHeader
						userId={this.props.userId}
						gameRef={this.props.gameReference}
						scenarioRef={this.props.scenarioReference}
						mediaType={Array.isArray(this.props.mediaReference)
							? this.props.mediaReference[0].path.includes('video') ? 'video' : 'image'
							: this.props.mediaReference.path.includes('video') ? 'video' : 'image'
						}
					/>
				}
				<Card square={true} className="card">
					{!this.props.gameReference &&
						<FeedCardHeader
							userId={this.props.userId}
							headline={this.props.headline}
							onDelete={cardBelongsToAuthUser && this.props.onDelete}
						/>
					}
				</Card>
				<div onDoubleClick={this.toggleLike} style={{overflowX: 'auto', overflowY: 'hidden'}}>
					<div style={{
						width: this.props.mediaIds.length > 1
							? (this.windowWidth * 0.8) * this.props.mediaReference.length
							: '100%',
					}}>
						{this.props.mediaIds.map((id, idx) => (
							<div
								key={id}
								style={{ 
									width: this.props.mediaIds.length > 1 ? this.windowWidth * 0.8 : '100%',
									float: 'left',
									padding: '0 16px',
								}}
							>
								<MediaItem
									mediaId={id}
									imgProps={{
										allowFullscreen: true,
										disableImageClick: true,
									}}
									videoProps={{
										allowFullscreen: true,
										autoPlayOnScroll: true,
										showPlayButton: true,
									}}
								/>
							</div>
						))}
						<div style={{clear: 'both'}} />
					</div>
				</div>
				<Card className="card">
					<CardActions
						disableActionSpacing
						style={{
							paddingBottom: 0,
							justifyContent: 'space-between',
						}}
					>
						<IconButton aria-label="Add to favorites" onClick={this.toggleLike}>
							{this.isLikedByUser()
								? <FavoriteIcon style={{ fontSize: 32, color: palette.gold }} />
								: <FavoriteBorderIcon style={{ color: palette.dark }} />
							}
						</IconButton>
						{this.props.createdAt &&
							<div className="created-at">
								<Typography variant="caption">
									{moment.unix(this.props.createdAt.seconds).fromNow()}
								</Typography>
							</div>
						}
					</CardActions>
					{(!!noOfLikes || this.props.caption) && 
						<CardContent style={{paddingTop: 0, paddingBottom: 8}}>
							{!!noOfLikes && <Typography variant="body2">{noOfLikes} likes</Typography>}
							{this.props.caption && 
								<Typography component="p">
									{this.props.caption}
								</Typography>
							}
						</CardContent>
					}
					<FeedCardComments feedPostId={this.props.id} />
				</Card>
				<style jsx>{`
					.feedcard {
						margin-top: 16px;
						margin-bottom: 16px;
					}
					.feedcard :global(img),
					.feedcard :global(video) {
						max-width: 100%;
						max-height: 100%;
					}
					.feedcard :global(.card) {
						margin: 0 16px;
					}
					.add-new-comment {
						padding: 8px 16px 16px;
						background: #fff;
					}
					.created-at {
						padding: 16px;
					}
					.card-container {
						margin: 0 16px;
					}
				`}</style>
			</div>
		)
	}
}

export default compose(
	withFirebase,
	withAuth,
	withComments,
	withFeed,
)(FeedCard);
