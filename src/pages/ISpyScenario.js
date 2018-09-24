import * as React from 'react';
import { CircularProgress, Typography, IconButton, Button } from '@material-ui/core';
import DeleteForever from '@material-ui/icons/DeleteForever';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Slider from 'react-slick';
import FileUpload from '../components/FileUpload';
import ScenarioMediaItem from '../components/ScenarioMediaItem';
import { withFirebase } from '../store/firebase';
import { withAuth } from '../store/auth';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

class ISpyScenario extends React.Component {
	state = {
		scenario: null,
		media: null,
		scenarioMedia: null,
		activeSlideIdx: 0,
	}

	sliderSettings = {
    dots: true,
    speed: 500,
		infinite: false,
		centerMode: true,
    slidesToShow: 1,
    slidesToScroll: 1,
		arrows: false,
		// adaptiveHeight:  true,
		className: 'slide-container',
		beforeChange: () => this.setState({ activeSlideIdx: null }),
		afterChange: index => this.setState({ activeSlideIdx: index }),
  };

	constructor(props) {
		super(props);
		const { scenarioId } = props.match.params;
		this.scenarioFirestoreRef = props.firestore.doc(`games/ispy/scenarios/${scenarioId}`);
	}

	componentDidMount() {
		this.subscribeToUserMediaForActiveScenario();
		this.scenarioFirestoreRef.get().then(snapshot => {
			const scenario = {
				id: snapshot.id,
				ref: snapshot.ref,
				...snapshot.data(),
			};
			this.setState({ scenario });
		});
	}

	subscribeToUserMediaForActiveScenario() {
		const { scenarioId } = this.props.match.params;
		this.scenarioFirestoreRef
			.collection('media')
			.onSnapshot(snap => {
				const scenarioMedia = snap.docs.map(doc => ({
					id: doc.id,
					ref: doc.ref,
					...doc.data(),
				}));
				this.setState({ scenarioMedia });
			})
	}

	createFirestorePhotoDocument(storageReferenceId) {
		const photoCollectionRef = this.props.firestore.collection('photos');
		return photoCollectionRef.doc(storageReferenceId).set({
			userId: this.props.auth.user.uid,
			storageReferenceId,
		})
		.then(() => {
			return photoCollectionRef.doc(storageReferenceId)
		})
	}

	createFirestoreVideoDocument(storageReferenceId) {
		const videoCollectionRef = this.props.firestore.collection('videos');
		return videoCollectionRef.doc(storageReferenceId).set({
			userId: this.props.auth.user.uid,
			storageReferenceId,
		})
		.then(() => {
			return videoCollectionRef.doc(storageReferenceId)
		})
	}

	createGameScenarioMedia(mediaType, photoOrVideoReference) {
		const scenarioMediaRef = this.scenarioFirestoreRef.collection('media');
		return scenarioMediaRef.doc(photoOrVideoReference.id).set({
			userId: this.props.auth.user.uid,
			mediaType,
			mediaReference: photoOrVideoReference,
		});
	}

	addNewFeedPost(mediaType, photoOrVideoReference) {
		return this.props.firestore.collection('feed').add({
			userId: this.props.auth.user.uid,
			mediaType,
			mediaReference: photoOrVideoReference,
			gameId: this.props.firestore.doc('games/ispy'),
			scenarioRef: this.scenarioFirestoreRef,
		})
	}

	onUploadSuccess = async (uploadedMediaSnapshot) => {
		const { contentType } = uploadedMediaSnapshot.metadata;
		const storageReferenceId =  uploadedMediaSnapshot.metadata.name;

		if (!contentType.includes('video') && !contentType.includes('image')) {
			return;
		}

		const mediaType = contentType.includes('video') ? 'video' : 'image'
		const photoOrVideoReference = mediaType === 'video'
			? await this.createFirestoreVideoDocument(storageReferenceId)
			: await this.createFirestorePhotoDocument(storageReferenceId);
		await this.createGameScenarioMedia(mediaType, photoOrVideoReference);
		await this.addNewFeedPost(mediaType, photoOrVideoReference);
	}

	onRemoveMediaFromScenario = (mediaDocument) => {
		mediaDocument = mediaDocument || this.state.activeMediaDocument;
		return this.scenarioFirestoreRef.collection(`media`).doc(mediaDocument.id).delete();
	}

	onDeleteMedia = () => {
		const mediaDocument = this.state.activeMediaDocument;
		const deleteDocument = mediaDocument.mediaType === 'video'
			? this.deleteVideoDocument
			: this.deletePhotoDocument
		this.onRemoveMediaFromScenario(mediaDocument);
		this.deleteStorage(mediaDocument);
		deleteDocument.call(this, mediaDocument);
	}

	deleteStorage(mediaDocument) {
		return this.props.firebaseStorage
		.ref()
		.child(mediaDocument.storageReferenceId)
		.delete()
	}

	deletePhotoDocument(mediaDocument) {
		const photoCollectionRef = this.props.firestore.collection('photos');
		return photoCollectionRef.doc(mediaDocument.storageReferenceId).delete()
	}

	deleteVideoDocument(mediaDocument) {
		const videoCollectionRef = this.props.firestore.collection('videos');
		return videoCollectionRef.doc(mediaDocument.storageReferenceId).delete()
	}

	render() {
		const { scenarioMedia, scenario } = this.state;

		if (!scenario) {
			return <CircularProgress />
		}

		return (
			<div className="ispyScenario">
				<Typography variant="title">{scenario.title}</Typography>
				<Typography>{scenario.description}</Typography>
				<div className="sliderContainer">
					<Slider {...this.sliderSettings}>
						{scenarioMedia.length <=4 &&
							<div key={'upload-new-media'}>
								<div className="mediaItemContainer">
									<FileUpload onUploadSuccess={this.onUploadSuccess} />
								</div>
							</div>
						}
						{scenarioMedia && scenarioMedia.map((media, idx) =>
							<div key={media.id}>
								<div className="mediaItemContainer">
									<ScenarioMediaItem
										mediaReference={media.mediaReference}
										mediaType={media.mediaType}
										isActive={this.state.activeSlideIdx === idx + 1}
										onActive={activeMediaDocument => this.setState({ activeMediaDocument })}
									/>
								</div>
							</div>
						)}
					</Slider>
				</div>
				<section className="info">
					{this.state.activeSlideIdx === 0 && (
						<Typography>Add new media</Typography>
					)}
					{this.state.activeSlideIdx > 0 && (
						<React.Fragment>
							<div className="action">
								<Button
									color="primary"
									size="small"
									style={{ marginLeft: -8 }}
									onClick={e => this.onRemoveMediaFromScenario()}
								>
									Remove
								</Button>
								<Typography variant="caption">This will remove the above item from your scenario entry, but keep it visible in the everyone's feed</Typography>
							</div>
							<div className="action">
								<Button
									color="secondary"
									size="small"
									style={{ marginLeft: -8 }}
									onClick={e => this.onDeleteMedia()}
								>
									Delete
								</Button>
								<Typography variant="caption">This will delete the image from your scenario entry and delete it everywhere else!</Typography>
							</div>
						</React.Fragment>
					)}
				</section>
				<style jsx>{`
					video, img { max-width: 100%; max-height: 100%; }
					.mediaItemContainer {
						padding: 25px 20px;
						display: flex;
						align-items: center;
						justify-content: center;
					}
					.sliderContainer {
						padding-bottom: 40px;
					}
					.info {
						padding: 0 24px;
					}
					.action {
						margin-bottom: 24px;
					}
					.ispyScenario :global(.slick-track) {
						display: flex;
						align-items: center;
					}
				`}</style>
			</div>
		)
	}
}

export default withAuth(withFirebase(ISpyScenario));
