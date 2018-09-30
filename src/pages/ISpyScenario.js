import * as React from 'react';
import {
	Typography,
	IconButton,
	GridList,
	GridListTile,
	GridListTileBar
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import FavoriteIcon from '@material-ui/icons/Favorite';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import Paper from '@material-ui/core/Paper';
import { withGames } from '../store/games';
import { withFirebase } from '../firebase';
import { withAuth } from '../store/auth';
import NewPostButton from '../components/AddNewPostButton';
import { compose } from '../utils';
import MediaItem from '../components/MediaItem';
import PageLoader from '../components/PageLoader';

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

	scenarioFirestoreRef = this.props.firestore.doc(
		`games/ispy/scenarios/${this.props.match.params.scenarioId}`
	);

	constructor(props) {
		super(props);
	}

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
		const { scenarioId } = this.props.match.params;
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

		return <div className="ispyScenario">
			<header>
				<Typography variant="title">{scenario.title}</Typography>
				{scenario.description &&
					<Typography> {scenario.description}</Typography>
				}
			</header>
			<div className="relative-container">
				<div className="top">
					<Typography variant="body2">
						Add up to a total of 3 photos or videos
					</Typography>
					<div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-around", overflow: "hidden" }}>
						{scenarioMedia &&
							<GridList cellHeight={250} style={{ transform: "translateZ(0)", flexWrap: "nowrap" }} cols={1.5}>
								{scenarioMedia.map((media, idx) => (
									<GridListTile key={media.id} className="mediaItemContainer">
										<MediaItem
											mediaReference={media.mediaReference}
											mediaType={media.mediaType}
										/>
										<GridListTileBar
											classes={{root: classes.titleBar}}
											actionIcon={
												<IconButton onClick={() => this.onDeleteMedia(media.ref)}>
													<DeleteOutlineIcon className={classes.title} />
												</IconButton>
											}
										/>
									</GridListTile>
								))}
							</GridList>
						}
					</div>
				</div>
				<div className="body">
					<div className="content-scroll">
						<Paper elevation={3} className="content">
							{otherUserScenarioMedia &&
								<GridList cellHeight={100} cols={4}>
									{otherUserScenarioMedia.map(scenarioMedia => (
										<GridListTile
											classes={{ tile: classes.tile }}
											className="other-user-media-item"
											key={scenarioMedia.id}
										>
											<MediaItem
												mediaReference={scenarioMedia.mediaReference}
												mediaType={scenarioMedia.mediaType}
											/>
										</GridListTile>
									))}
								</GridList>
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
				video,
				img {
					max-width: 100%;
					max-height: 100%;
				}
				.ispyScenario {
					display: flex;
					flex-direction: column;
					height: calc(100vh - 112px);
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
					padding-top: 270px;
					height: 100%;
				}
				.content-scroll :global(.content) {
					position: relative;
					z-index: 2;
					background: #fff;
					min-height: 100%;
				}
				.content-scroll :global(.other-user-media-item img) {
					width: 130%;
				}
				.ispyScenario :global(.mediaItemContainer img),
				.ispyScenario :global(.mediaItemContainer video) {
					height: 100%;
				}
				.action {
					margin-bottom: 24px;
				}
			`}</style>
		</div>;
	}
}

export default withStyles(styles)(
	compose(withAuth, withFirebase, withGames)(ISpyScenario)
)
