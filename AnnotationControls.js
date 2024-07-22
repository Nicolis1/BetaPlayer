import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import Draggable from 'react-native-draggable';

const colors = ['red', 'blue', 'green', 'orange'];
function Color(props) {
	return (
		<TouchableOpacity onPress={props.onPress}>
			<View
				style={[
					{ backgroundColor: props.color },
					styles.colorButton,
					props.selected && styles.selectedColor,
				]}
			></View>
		</TouchableOpacity>
	);
}

export default function AnnotationControls(props) {
	const [selectedColor, setSelectedColor] = useState(props.annotationColor);

	return (
		<Draggable x={10} y={40}>
			<View style={styles.annotationControls}>
				<Image
					source={require('./assets/grip.png')}
					style={{ height: 40, width: 40, margin: 5 }}
				/>

				<>
					{colors.map((color, index) => {
						return (
							<Color
								key={color}
								color={color}
								onPress={() => {
									setSelectedColor(colors[index]);
									props.setAnnotationColor(colors[index]);
								}}
								selected={selectedColor == colors[index]}
							/>
						);
					})}
					<TouchableOpacity
						onPress={() => {
							props.onClear();
						}}
					>
						<Image
							source={require('./assets/trash.png')}
							style={{ height: 40, width: 40, margin: 5 }}
						/>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={() => {
							props.onUndo();
						}}
					>
						<Image
							source={require('./assets/delete-left.png')}
							style={{ height: 40, width: 40, margin: 5 }}
						/>
					</TouchableOpacity>
				</>
			</View>
		</Draggable>
	);
}
const styles = StyleSheet.create({
	annotationControls: {
		backgroundColor: 'white',
		borderColor: 'black',
		borderWidth: 1,
	},
	selectedColor: {
		borderWidth: 2,
		borderColor: 'black',
	},
	colorButton: {
		height: 40,
		width: 40,
		borderRadius: 40,
		margin: 5,
		borderWidth: 5,
		borderColor: 'white',
	},
});
