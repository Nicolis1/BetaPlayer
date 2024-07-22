import Svg, { Path } from 'react-native-svg';

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

export default function AnnotationLayer(props) {
	const [paths, setPaths] = useState([]);

	const setNewPath = (x, y) => {
		setPaths((prev) => {
			const result = [
				...prev,
				{ path: [`M${x} ${y}`], color: props.annotationColor },
			];
			return result;
		});
	};
	const updatePath = (x, y) => {
		setPaths((prev) => {
			const currentPath = paths[paths.length - 1];
			currentPath && currentPath.path.push(`L${x} ${y}`);

			return currentPath ? [...prev.slice(0, -1), currentPath] : prev;
		});
	};

	return (
		<View
			style={[StyleSheet.absoluteFill, styles.annotationLayer]}
			onStartShouldSetResponder={() => true}
			onMoveShouldSetResponder={() => true}
			onResponderStart={(e) => {
				console.log(props.annotationColor);
				setNewPath(e?.nativeEvent?.locationX, e?.nativeEvent?.locationY);
			}}
			onResponderMove={(e) => {
				updatePath(e?.nativeEvent?.locationX, e?.nativeEvent?.locationY);
			}}
		>
			<Svg>
				{paths.map(({ path, color: c, stroke: s }, i) => {
					return (
						<Path
							key={i}
							d={`${path.join(' ')}`}
							fill='none'
							strokeWidth={2}
							stroke={c}
						/>
					);
				})}
			</Svg>
		</View>
	);
}

const styles = StyleSheet.create({
	annotationLayer: {
		alignItems: 'center',
		justifyContent: 'center',
	},
});
