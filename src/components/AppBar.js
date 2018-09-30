import React from 'react';
import { withRouter } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton, Button } from '@material-ui/core';
import ArrowBackIos from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIos from '@material-ui/icons/ArrowForwardIos';
import { palette } from '../style';

function Appbar(props) {
	return (
		<div className="app-bar-root">
			<AppBar
				position="fixed"
				className="app-bar"
				style={{backgroundColor: palette.champagne }}
			>
				<Toolbar className="toolbar">
					{props.showBackButton &&
						<IconButton
							style={{ color: palette.dark }}
							onClick={() => props.history.goBack()}
						>
							<ArrowBackIos />
						</IconButton>
					}
					<span className="app-name">Mr. & Mrs. Browne</span>
					{props.nextComponent &&
						<Button
							style={{ color: palette.dark }}
							onClick={props.nextComponent.onClick}
						>
							<Typography>{props.nextComponent.text}</Typography>
							<ArrowForwardIos />
						</Button>
					}
				</Toolbar>
			</AppBar>
			<style jsx>{`
				.app-bar-root :global(.app-bar) {
					backgroundColor: ${palette.champagne};
				}
				.app-name {
					font-family: 'Great Vibes';
					color ${palette.dark};
					font-size: 24px;
					flex-grow: 1;
					margin-top: 5px;
				}
				`}</style>
		</div>
	)
}

export default withRouter(Appbar);
