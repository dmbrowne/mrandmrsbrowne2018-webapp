import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton, Button } from '@material-ui/core';
import ArrowBackIos from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIos from '@material-ui/icons/ArrowForwardIos';
import { palette } from '../style';
import YDLogo from '../icons/YDLogo';

function Appbar(props) {
	return (
		<div className="app-bar-root">
			<AppBar
				position="fixed"
				className="app-bar"
				style={{backgroundColor: palette.navy }}
			>
				<Toolbar className="toolbar">
					{props.showBackButton &&
						<IconButton
							style={{ color: palette.champagne }}
							onClick={() => props.history.goBack()}
						>
							<ArrowBackIos />
						</IconButton>
					}
					<Link
						className="app-name"
						to={{pathname: '/', state: { refresh: true }}}
						onClick={() => { window.scrollTo({ top: 0 })}}
					>
						<YDLogo fill={palette.champagne} /> Y & D Browne 2018
					</Link>
					{props.nextComponent &&
						<Button
							style={{ color: palette.champagne, padding: 0 }}
							onClick={props.nextComponent.onClick}
						>
							<Typography style={{color: palette.champagne}}>
								{props.nextComponent.text}
							</Typography>
							<ArrowForwardIos />
						</Button>
					}
				</Toolbar>
			</AppBar>
			<style jsx>{`
				.app-bar-root :global(.app-bar) {
					backgroundColor: ${palette.champagne};
				}
				.app-bar-root :global(.toolbar) {
					max-width: 760px;
					width:100%;
    			margin: auto;
					justify-content: space-between;
				}
				.app-bar-root :global(.app-name) {
					font-family: 'Great Vibes';
					color ${palette.champagne};
					font-size: 5vw;
					text-align: center;
					position: absolute;
					width: 60vw;
					left: calc(50% - 30vw);
					top: 0;
					height: 100%;
					display: flex;
					align-items: center;
					justify-content: ${props.nextComponent ? 'flex-start' : 'center'};
					text-decoration: none;
				}
				.app-bar-root :global(.app-name svg) {
					margin: 8px 4px 8px 0;
					height: 24px;
				}
				@media only screen and (min-width: 500px) {
					.app-bar-root :global(.app-name) {
						font-size: 24px;
					}
				}
				`}</style>
		</div>
	)
}

export default withRouter(Appbar);
