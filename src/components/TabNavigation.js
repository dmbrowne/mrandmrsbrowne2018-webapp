import React from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import RestoreIcon from '@material-ui/icons/Restore';
import FavoriteIcon from '@material-ui/icons/Favorite';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { palette } from '../style';

const theme = createMuiTheme({
  palette: {
    primary: { main: palette.gold }, // Purple and green play nicely together.
    secondary: { main: palette.dark }, // This is just green.A700 as hex.
  },
});

export default function BottomTabNavigation(props) {
	const { classes } = props;
	return (
		<div>
			<MuiThemeProvider theme={theme}>
				<BottomNavigation
					className={'bottom-tab-navigation ' + props.className || ''}
					value={props.value}
					onChange={props.onChange}
					showLabels
				>
					<BottomNavigationAction label="Recents" icon={<RestoreIcon />} />
					<BottomNavigationAction label="I-Spy" icon={<FavoriteIcon />} />
					<BottomNavigationAction label="Account" icon={<AccountCircle />} />
				</BottomNavigation>
			</MuiThemeProvider>
			<style jsx>{`
				:global(.bottom-tab-navigation) {
					background: ${palette.champagne};
					border-top: 1px solid ${palette.gold};
				}
			`}</style>
		</div>
	)
};
