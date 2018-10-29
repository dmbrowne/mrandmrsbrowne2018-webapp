import React from 'react';
import { CircularProgress } from '@material-ui/core';
import { withFirebase } from '../firebase/context';

class FullPageMedia extends React.Component {
	state = {
		media: null
	}
	componentDidMount() {
		const {id, mediaType} = this.props.match.params;
		const collection = mediaType === 'video' ? 'videos' : 'photos';
		this.props.firestore.collection(collection).doc(id).get().then(snapshot => {
			this.setState({
				media: {
					id: snapshot.id,
					ref: snapshot.ref,
					...snapshot.data(),
				}
			});
		});
	}

	render() {
		const { mediaType } = this.props.match.params;

		if (!this.state.media) {
			return <CircularProgress />
		}

		return (
			<div>
				{mediaType === 'video'
						? <video src={this.state.media.cloudinary.secure_url} autoPlay loop controls/>
						: <img src={this.state.media.cloudinary.secure_url} />}
				<style jsx>{`
					div {
						background: #000;
						display: flex;
						align-items: center;
						justify-content: center;
						height: calc(100vh - 56px);
					}
					img, video {
						max-height: 100%;
					}
				`}</style>
			</div>
		)
	}
}

export default withFirebase(FullPageMedia);
