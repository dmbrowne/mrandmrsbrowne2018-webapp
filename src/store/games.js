import * as React from 'react';
import { withFirebase } from '../firebase';
import { withAuth } from '../store/auth';
import { debounce } from '../utils';

const Context = React.createContext({
	gamesById: {},
	scenariosById: {},
	scenariosByGame: {},
	otherUserMedia: {},
	getGame: () => {},
	getGameScenarios: () => {},
	fetchScenario: () => {},
	getScenarioMediaByUser: () => {},
});

class GamesProviderComponent extends React.Component {
	state = {
		games: {},
		scenariosById: {},
		scenariosByGame: {},
		otherUserMedia: {},
	}

	getGame = (gameUuid) => {
		const unsubscribe = this.props.firestore.doc(`games/${gameUuid}`).onSnapshot(snapshot => {
			if (snapshot.exists) {
				this.setState(state => ({
					games: {
						...state.games,
						[gameUuid]: {
							id: snapshot.id,
							ref: snapshot.ref,
							...snapshot.data(),
						},
					},
				}));
				unsubscribe()
			}
		})
	}

	getScenarioMediaByUser = (scenario) => {
		scenario.ref
			.collection('media')
			.where('userId', '==', this.props.auth.user.uid)
			.get()
			.then(snapshot => {
				const empty = snapshot.empty;
				console.log(empty)
				this.setState(state => ({
					scenariosById: {
						...state.scenariosById,
						[scenario.id]: {
							...state.scenariosById[scenario.id],
							userHasAddedMedia: !empty,
						}
					},
				}))
			})
	}

	getGameScenarios = (gameUuid) => {
		const unsubscribe = this.props.firestore
			.collection(`games/${gameUuid}/scenarios`)
			.onSnapshot(snapshot => {
				debounce(unsubscribe, 3000);
				const scenarios = snapshot.docs.map(doc => ({
					id: doc.id,
					ref: doc.ref,
					...doc.data(),
				}));
				const scenariosById = scenarios.reduce((accum, scene) => ({
					...accum,
					[scene.id]: scene,
				}), {})

				this.setState(state => ({
					scenariosById,
					scenariosByGame: {
						...state.scenariosByGame,
						[gameUuid]: scenarios.map(scene => scene.id),
					},
				}));
			});
	}

	fetchScenario = (gameUuid, scenarioId) => {
		const unsubscribe = this.props.firestore
			.doc(`games/${gameUuid}/scenarios/${scenarioId}`).onSnapshot(snapshot => {
				unsubscribe()
				if (snapshot.exists) {
					this.setState(state => {
						const scenarios = state.scenariosByGame[gameUuid] || [];
						return {
							scenariosById: {
								...state.scenariosById,
								[scenarioId]: {
									...state.scenariosById[scenarioId],
									id: snapshot.id,
									ref: snapshot.ref,
									...snapshot.data(),
								}
							},
							scenariosByGame: {
								...state.scenariosByGame,
								[gameUuid]: scenarios.includes(snapshot.id)
									? scenarios
									: [...scenarios, snapshot.id],
							},
						}
					});
				}
			})
	}

	fetchScenarioMediaByOtherUsers = (gameId, scenarioId, excludingUserId, after) => {
		let mediaRef = this.props.firestore
			.collection(`games/${gameId}/scenarios/${scenarioId}/media`)
			.orderBy("userId");

		Promise.all([
			mediaRef.endBefore(excludingUserId).get(),
			mediaRef.startAfter(excludingUserId).get(),
		])
		.then(([ preUserQuerySnapshot, postUserQuerySnapshot ]) => {
			const sortedPosts = [
				...preUserQuerySnapshot.docs,
				...postUserQuerySnapshot.docs,
			]
			.map(documentRef => {
				const { id, ref } = documentRef;
				return { id, ref, ...documentRef.data() }
			})
			.sort(function (a, b) {
				return b.createdAt.seconds - a.createdAt.seconds;
			})

			this.setState({
				otherUserMedia: {
					...this.state.otherUserMedia || {},
					[scenarioId]: sortedPosts,
				}
			})
		})
	}

	render() {
		return (
			<Context.Provider value={{
				gamesById: this.state.games,
				scenariosById: this.state.scenariosById,
				scenariosByGame: this.state.scenariosByGame,
				otherUserMedia: this.state.otherUserMedia,
				getGame: this.getGame,
				getGameScenarios: this.getGameScenarios,
				fetchScenario: this.fetchScenario,
				fetchScenarioMediaByOtherUsers: this.fetchScenarioMediaByOtherUsers,
				getScenarioMediaByUser: this.getScenarioMediaByUser,
			}}>
				{this.props.children}
			</Context.Provider>
		)
	}
}
export const GamesProvider = withAuth(withFirebase(GamesProviderComponent));

export function withGames(Component) {
	return function ComponentWrappedWithFirestore(props) {
		return (
			<Context.Consumer>
				{context => <Component {...props} games={context} />}
			</Context.Consumer>
		)
	}
}
