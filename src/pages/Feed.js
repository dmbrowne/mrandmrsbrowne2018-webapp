import React from 'react';
import { Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { withFirebase } from '../store/firebase';
import FeedCard from '../components/FeedCard';
import NewPostButton from '../components/AddNewPostButton';

class Feed extends React.Component {
	state = {
		feedItems: [],
		fetched: false,
	}

	componentDidMount() {
		this.props.firestore.collection('feed').get().then(snapshot => {
			const feedItems = snapshot.docs.map(doc => ({
				id: doc.id,
				ref: doc.ref,
				...doc.data(),
			}))
			this.setState({ feedItems })
		})
	}

	componentWillUnmount() {
		console.info('feed is unmounting')
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
			<div>
				{this.state.feedItems.map(feedItem =>
					<div key={feedItem.id}>
						<FeedCard {...feedItem} ref={undefined}/>
					</div>
				)}
				<div className="add-feed-post-container">
					<NewPostButton onFileChange={this.onAddFile} />
				</div>
				<style jsx>{`
					.add-feed-post-container {
						position: fixed;
						bottom: 72px;
						right: 24px;
					}
				`}</style>
			</div>
		)
	}
}

export default withFirebase(Feed);
