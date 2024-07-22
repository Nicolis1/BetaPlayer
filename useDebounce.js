import { useState } from 'react';
export function useDebounce(callback, timeout) {
	const [timeoutId, setTimeoutID] = useState(-1);

	return () => {
		clearTimeout(timeoutId);
		setTimeoutID(setTimeout(callback, timeout));
	};
}
