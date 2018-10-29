import * as Identicon from 'identicon.js';

export function generateIdenticon(hash) {
	var data = new Identicon(hash, { size: 420, format: 'svg' }).toString();
	return `data:image/svg+xml;base64,${data}`;
}

export function debounce(func, delay) {
  let inDebounce
  return function() {
    const context = this
    const args = arguments
    clearTimeout(inDebounce)
    inDebounce = setTimeout(() => func.apply(context, args), delay)
  }
}

export function compose(...composers) {
	return function WrapComposedComponent(Component) {
		return composers.reduce((WrappedComponent, composer) =>
			composer(WrappedComponent)
		, Component)
	}
}

export function isInViewport(elem) {
	var bounding = elem.getBoundingClientRect();
	return (
		bounding.top >= 0 &&
		bounding.left >= 0 &&
		bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
		bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
	);
};

export function throttle(fn, wait) {
	let time = Date.now();
	return function () {
		if ((time + wait - Date.now()) < 0) {
			fn();
			time = Date.now();
		}
	}
}

export function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

export function getAspectRatioHeight({width, height}, elementWidth) {
	elementWidth = elementWidth || (document.documentElement.clientWidth, window.innerWidth);
	return (elementWidth / width) * height;
}