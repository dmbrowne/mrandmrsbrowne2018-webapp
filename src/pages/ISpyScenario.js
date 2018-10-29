import * as React from 'react';
import {
	Typography,
	IconButton,
	GridListTileBar
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import Paper from '@material-ui/core/Paper';
import { withGames } from '../store/games';
import { withFirebase } from '../firebase';
import { withAuth } from '../store/auth';
import NewPostButton from '../components/AddNewPostButton';
import { compose } from '../utils';
import MediaItem from '../components/MediaItem';
import PageLoader from '../components/PageLoader';
import MonitorUploadProgress from '../icons/MonitorLoadingProgress';
import { palette, fontMap } from '../style';

const styles = {
	tile: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	title: {
		color: '#fff',
	},
  titleBar: {
    background:
      'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
  },
}

class ISpyScenario extends React.Component {
	state = {
		scenario: null,
		media: null,
		scenarioMedia: null,
	}

	windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

	scenarioFirestoreRef = this.props.firestore.doc(
		`games/ispy/scenarios/${this.props.match.params.scenarioId}`
	);

	componentDidMount() {
		const { games, match: {params}, auth: {user} } = this.props;
		games.fetchScenarioMediaByOtherUsers("ispy", params.scenarioId, user.uid);
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
		this.scenarioFirestoreRef
			.collection('media')
			.where('userId', '==', this.props.auth.user.uid)
			.onSnapshot(snap => {
				const scenarioMedia = snap.docs.map(doc => ({
					id: doc.id,
					ref: doc.ref,
					...doc.data(),
				}));
				this.setState({ scenarioMedia });
			})
	}

	onRemoveMediaFromScenario = (mediaDocument) => {
		return this.scenarioFirestoreRef.collection(`media`).doc(mediaDocument.id).delete();
	}

	onDeleteMedia = async (scenarioMediaDocument) => {
		if (window.confirm('Are you sure you want to delete this item?')) {
			const scenarioMediaSnapshot = await scenarioMediaDocument.get();
			const mediaSnapshot = await scenarioMediaSnapshot.data().mediaReference.get();
			this.onRemoveMediaFromScenario(scenarioMediaDocument);
			this.deleteStorage(mediaSnapshot.data());
		}
	}

	deleteStorage(mediaDocument) {
		return this.props.firebaseStorage
			.ref()
			.child(mediaDocument.storageReference)
			.delete()
	}

	onAddFile = (file, fileType) => {
		this.props.history.push({
			pathname: `${this.props.match.url}/add-media`,
			state: {
				file,
				fileType,
				hideNavigationTabs: true,
			}
		})
	}

	render() {
		const { classes } = this.props;
		const { scenarioMedia, scenario } = this.state;
		const otherUserScenarioMedia = scenario && this.props.games.otherUserMedia[scenario.id];

		if (!scenario) {
			return <PageLoader />
		}

		return (
			<div className="ispyScenario">
				<div className="scenario-title-container">
					<Typography variant="title" style={{ fontFamily: fontMap[scenario.font] }}>{scenario.title}</Typography>
				</div>
				<div className="relative-container">
					<div className="top" style={{ height: 400 }}>
						<div className="info">
							{scenario.description && <Typography variant="subheading" style={{marginBottom: 8}}>{scenario.description}</Typography>}
							<Typography variant="caption">
								Add up to a total of 3 photos or videos
							</Typography>
						</div>
						{!scenarioMedia || !scenarioMedia.length 
							? (
								<div className="no-uploaded-media">
									<MonitorUploadProgress />
									<Typography variant="caption" style={{ color: palette.gold }}>
										You haven't added any photos or videos yet, once you have, they will appear here.
									</Typography>
								</div>
							)
							: (
								<div style={{ transform: 'translateZ(0)', overflowX: 'auto' }}>
									<div style={{ display: 'inline-flex', flexWrap: 'nowrap' }}>
										{scenarioMedia.map((media, idx) => (
											<div key={media.id} className="mediaItemContainer" style={{ width: 250, height: 250}}>
												<MediaItem
													mediaReference={media.mediaReference}
													mediaType={media.mediaType}
													squareThumb
												/>
												<nav>
													<GridListTileBar
														classes={{root: classes.titleBar}}
														actionIcon={
															<IconButton onClick={() => this.onDeleteMedia(media.ref)}>
																<DeleteOutlineIcon className={classes.title} />
															</IconButton>
														}
													/>
												</nav>
											</div>
										))}
									</div>
								</div>
							)
						}
					</div>
					<div className="body">
						<div className="content-scroll">
							<Paper elevation={5} className="content">
								{otherUserScenarioMedia && !!otherUserScenarioMedia.length &&
									<React.Fragment>
										<div className="info">
											<Typography variant="body2">Media by other guests</Typography>
										</div>
										<div className="other-user-media">
											{otherUserScenarioMedia.map(scenarioMedia => (
												<div
													className="other-user-media-item"
													key={scenarioMedia.id}
												>
													<MediaItem
														mediaReference={scenarioMedia.mediaReference}
														mediaType={scenarioMedia.mediaType}
														squareThumb
														noMinHeight
													/>
												</div>
											))}
										</div>
									</React.Fragment>
								}
							</Paper>
						</div>
					</div>
				</div>
				<div className="add-scenario-media">
					<NewPostButton onFileChange={this.onAddFile} />
				</div>
				<style jsx>{`
					.add-scenario-media {
						position: fixed;
						bottom: 72px;
						right: 24px;
						z-index: 100;
					}
				`}</style>
				<style jsx>{`
					.ispyScenario {
						display: flex;
						flex-direction: column;
						height: calc(100vh - 112px);
					}
					.scenario-title-container {
						padding: 16px 24px 0;
						background: #fff;
					}
					.info {
						padding: 16px 24px 8px;
						background: #fff;
					}
					.relative-container {
						position: relative;
						overflow: hidden;
						height: 100%;
						flex-grow: 1;
						background: #f4f4f4;
					}
					.top {
						position: absolute;
						top: 0;
						left: 0;
						width: 100%;
						z-index: 1;
					}
					.body {
						height: 100%;
						overflow: auto;
					}
					.content-scroll {
						padding-top: 350px;
						height: 100%;
					}
					.content-scroll :global(.content) {
						position: relative;
						z-index: 2;
						background: #fff;
						min-height: calc(100% + 350px);
					}
					.mediaItemContainer,
					.mediaItemContainer > :global(div) {
						position: relative;
					}
					.mediaItemContainer > nav {
						width: 100%;
						height: 48px;
						position: absolute;
						bottom: 0;
					}
					.other-user-media:after {
						content: '';
						display: block;
						clear: both;
					}
					.other-user-media-item {
						float: left;
						width: 25%;
					}
					.ispyScenario :global(.mediaItemContainer img),
					.ispyScenario :global(.mediaItemContainer video) {
						width: 100%;
					}
					.action {
						margin-bottom: 24px;
					}
					.no-uploaded-media {
						text-align: center;
						padding: 24px 40px 0;
						opacity: 0.8;
					}
					.no-uploaded-media :global(svg) {
						height: 130px;
						opacity: 0.8;
						margin-bottom: 16px;
					}
				`}</style>
			</div>
		);
	}
}

export default withStyles(styles)(
	compose(withAuth, withFirebase, withGames)(ISpyScenario)
)
