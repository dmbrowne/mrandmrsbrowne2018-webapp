import React from 'react';
import { CircularProgress } from '@material-ui/core';

export default function PageLoader() {
	return (
		<div>
			<CircularProgress color="secondary" size={80} thickness={3} />
			<style jsx>{`
				div {
					height: 70vh;
					width: 100%;
					display: flex;
					align-items: center; justify-content: center;
				}
				`}</style>
		</div>
	)
}
