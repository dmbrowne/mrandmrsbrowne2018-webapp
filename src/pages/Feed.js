import React from 'react';
import cx from 'classnames';
import { withFeed } from '../store/feed';
import FeedCard from '../components/FeedCard';
import NewPostButton from '../components/AddNewPostButton';
import { debounce } from '../utils'
import { CircularProgress } from '@material-ui/core';

class Feed extends React.Component {
	constructor(props) {
		super(props);
		this.updateLastKnownScrollPosition = this.updateLastKnownScrollPosition.bind(this);
	}

	componentDidMount() {
		const locationState = this.props.location.state;

		if (!this.props.feed.items.length || (locationState && locationState.refresh)) {
			this.props.feed.getItems().then(() => this.props.feed.subscribe());
		}

		// HACK :(
		// =======
		// When react router loads a route with a lot of data - it takes a few seconds to update
		// the display. the below hack causes the page to blank, causing it to load instantly.
		setTimeout(() => {
				window.scrollTo({ top: this.props.feed.feedPageLastScrollPos });
				window.addEventListener('scroll', this.updateLastKnownScrollPosition);
				window.addEventListener('scroll', debounce(this.loadMoreOnScrollBottom, 100));
		});
	}
	
	componentWillUnmount() {
		window.removeEventListener('scroll', this.updateLastKnownScrollPosition);
		window.removeEventListener('scroll', debounce);

	}

	updateLastKnownScrollPosition(e) {
		this.props.feed.setFeedScrollPos(window.pageYOffset);
	}

	loadMoreOnScrollBottom = () => {
		const thirdOfPage = document.body.offsetHeight / 3
		if ((window.innerHeight + thirdOfPage) + window.scrollY >= document.body.offsetHeight) {
			this.props.feed.loadMore();
		}
	}

	onAddFile = (files) => {
		this.props.history.push({
			pathname: '/new-post',
			state: {
				files,
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
			<div className="feed" ref={this.feedScroll}>
				{this.props.feed.items.map(feedItem => {
					const { ref, ...item } = feedItem;
					return (
						<div
							key={feedItem.id}
							className={cx('feed-card-container', { 'game-feed-card': feedItem.gameReference })}
						>
							<FeedCard {...item} onDelete={() => this.confirmDelete(feedItem)} />
						</div>
					)
				})}
				{this.props.feed.loadingMore &&
					<div style={{ textAlign: 'center', padding: 24 }}>
						<CircularProgress />
					</div>
				}
				<div className="add-feed-post-container">
					<NewPostButton onFileChange={this.onAddFile} />
				</div>
				<style jsx>{`
					.feed {
						overflow: hidden;
						width: 100%;
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
						margin-top: 16px;
					}
				`}</style>
			</div>
		)
	}
}

export default withFeed(Feed);
