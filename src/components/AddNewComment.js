import React from 'react';
import { FormControl, Input, InputAdornment, Button, Fade } from '@material-ui/core';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { palette } from '../style';
import {withAuth} from '../store/auth';
import UserAvatar from './UserAvatar';

const theme = createMuiTheme({
	palette: {
		primary: { main: palette.gold }, // Purple and green play nicely together.
		secondary: { main: palette.gold }, // This is just green.A700 as hex.
	},
});


export default withAuth(
	class AddNewComment extends React.Component {
		state = {
			comment: '',
			disabled: false,
		}
		
		submit = () => {
			this.setState({ disabled: true });
			this.props.onSubmit(this.state)
				.then(() => {
					this.setState({ comment: '', disabled: false });
				})
				.catch(() => {
					this.setState({ disabled: false });
				})
		}
	
		render() {
			return (
				<div className="add-new-comment">
					<MuiThemeProvider theme={theme}>
						<FormControl style={{ marginBottom: 8 }} fullWidth>
							<Input
								disabled={this.state.disabled}
								placeholder="add a comment"
								value={this.state.comment}
								onChange={e => this.setState({ comment: e.target.value })}
								style={{ fontSize: 14 }}
								startAdornment={
									<InputAdornment position="start">
										<UserAvatar style={{width: 24, height: 24}} user={this.props.auth.user} />
									</InputAdornment>
								}
							/>
						</FormControl>
					</MuiThemeProvider>
					<Fade in={!!this.state.comment} mountOnEnter unmountOnExit>
						<div className="controls">
							<Button
								disabled={this.state.disabled}
								size="small"
								color="secondary"
								variant="contained"
								style={{fontWeight: 400, textTransform: 'capitalize'}}
								onClick={() => this.submit()}
							>
								Post Comment
							</Button>
							<Button
								size="small"
								color="secondary"
								variant="text"
								style={{fontWeight: 400, textTransform: 'capitalize'}}
								onClick={() => this.setState({ comment: '' })}
							>
								Cancel
							</Button>
						</div>
					</Fade>
					<style jsx>{`
						.add-new-comment {
							padding: 0 16px 16px;
						}
					`}</style>
				</div>
			)
		}
	}
)