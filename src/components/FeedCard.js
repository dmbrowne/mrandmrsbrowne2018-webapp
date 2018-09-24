import React from 'react';
import {
	Card,
	CardContent,
	Typography,
	CardActions,
	IconButton,
} from '@material-ui/core';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import FeedCardHeader from './FeedCardHeader';
import MediaItem from './MediaItem';

export default class FeedCard extends React.Component {
	render() {
		return (
			<Card square={true}>
				<FeedCardHeader
					userId={this.props.userId}
					headline={this.props.headline}
				/>
				<MediaItem
					mediaReference={this.props.mediaReference}
					mediaType={this.props.mediaType}
				/>
        <CardContent>
          <Typography component="p">
            This impressive paella is a perfect party dish and a fun meal to cook together with your
            guests. Add 1 cup of frozen peas along with the mussels, if you like.
          </Typography>
        </CardContent>
        <CardActions disableActionSpacing>
          <IconButton aria-label="Add to favorites">
            <FavoriteIcon />
          </IconButton>
          <IconButton aria-label="Share">
            <ShareIcon />
          </IconButton>
        </CardActions>
			</Card>
		)
	}
}
