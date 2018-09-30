import React from 'react';
import cx from 'classnames';
import { Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { withFirebase } from '../firebase';
import { withFeed } from '../store/feed';
import FeedCard from '../components/FeedCard';
import NewPostButton from '../components/AddNewPostButton';
import { palette } from '../style';

class Feed extends React.Component {
	componentDidMount() {
		this.props.feed.getItems().then(() => this.props.feed.subscribe());
	}

	onAddFile = (file, mediaType) => {
		this.props.history.push({
			pathname: '/new-post',
			state: {
				file,
				mediaType,
				hideNavigationTabs: true,
			}
		})
	}

	confirmDelete = (feedItem) => {
		if (window.confirm('Are you sure you want to delete this post?')) {
			this.props.feed.onDelete(feedItem);
		}
	}

	render() {
		return (
			<div className="feed">
				{this.props.feed.items.map(feedItem =>
					<div
						key={feedItem.id}
						className={cx('feed-card-container', {
							'game-feed-card': feedItem.gameReference
						})}
					>
						<FeedCard {...feedItem} ref={undefined} onDelete={() => this.confirmDelete(feedItem)}/>
					</div>
				)}
				<div className="add-feed-post-container">
					<NewPostButton onFileChange={this.onAddFile} />
				</div>
				<style jsx>{`
					.feed {
						background: #f4f4f4;
						overflow: hidden;
					}
					.add-feed-post-container {
						position: fixed;
						bottom: 72px;
						right: 24px;
					}
					.game-feed-card {
						margin: 32px 24px;
					}
					.game-feed-card:first-child {
						margin-top: 0;
					}
				`}</style>
			</div>
		)
	}
}

export default withFeed(Feed);
