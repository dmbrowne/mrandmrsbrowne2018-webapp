import React from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import HomeIcon from '@material-ui/icons/Home';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { palette } from '../style';

const theme = createMuiTheme({
  palette: {
    primary: { main: palette.gold }, // Purple and green play nicely together.
    secondary: { main: palette.dark }, // This is just green.A700 as hex.
  },
});

export default function BottomTabNavigation(props) {
	return (
		<div>
			<MuiThemeProvider theme={theme}>
				<BottomNavigation
					className={'bottom-tab-navigation ' + props.className || ''}
					value={props.value}
					onChange={props.onChange}
					showLabels
				>
					<BottomNavigationAction label="Updates" icon={<HomeIcon />} />
					<BottomNavigationAction label="I-Spy" icon={<RemoveRedEyeIcon />} />
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
