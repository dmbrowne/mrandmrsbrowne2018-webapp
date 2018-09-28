import { GamesProvider } from './games';
import { FeedProvider } from './feed';
import { AuthProvider } from './auth';
import { compose } from '../utils';

export default (Component) => compose(
	GamesProvider,
	FeedProvider,
	AuthProvider,
)(Component)
