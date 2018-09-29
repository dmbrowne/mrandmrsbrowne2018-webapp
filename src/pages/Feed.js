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

	onAddFile = (file, fileType) => {
		this.props.history.push({
			pathname: '/new-post',
			state: {
				file,
				fileType,
				hideNavigationTabs: true,
			}
		})
	}

	render() {
		return (
			<div className="feed">
				{this.props.feed.items.map(feedItem => console.log(feedItem) ||
					<div
						key={feedItem.id}
						className={cx('feed-card-container', {
							'game-feed-card': feedItem.gameReference
						})}
					>
						<FeedCard {...feedItem} ref={undefined}/>
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
						margin: 24px 16px;
					}
				`}</style>
			</div>
		)
	}
}

export default withFeed(Feed);
