import * as Identicon from 'identicon.js';

export function generateIdenticon(hash) {
	var data = new Identicon(hash, 420).toString();
	return `data:image/png;base64,${data}`;
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
