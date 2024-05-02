import { StatusBar } from 'expo-status-bar';
import { useState, useRef } from 'react';
import { Button, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
	const [video, setVideo] = useState(null);
	const [playBackStatus, setPlaybackStatus] = useState({});
	const [fineControl, setFineControl] = useState(false);
	const videoRef = useRef(null);
	// todo add loading state
	const pickVideo = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Videos,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		});

		if (!result.canceled) {
			setVideo(result.assets[0].uri);
		}
	};
	let playedPercent =
		(playBackStatus.positionMillis * 100) /
		playBackStatus.playableDurationMillis;
	return (
		<View style={styles.container}>
			<StatusBar style='auto' />
			<View>
				<View style={styles.progressBar}>
					<View
						onPress={() => {
							console.log('et');
						}}
						style={{
							height: 20,
							width: `${playedPercent}%`,
							backgroundColor: 'red',
						}}
					/>
				</View>
				<Video
					ref={videoRef}
					style={styles.video}
					source={{
						uri: video,
					}}
					useNativeControls={false}
					resizeMode={ResizeMode.CONTAIN}
					isLooping={false}
					onLoad={() => {
						videoRef.current.playAsync();
					}}
					onPlaybackStatusUpdate={(status) => {
						setPlaybackStatus(status);
					}}
				/>
			</View>
			<View style={styles.opacityButtons}>
				<TouchableOpacity
					style={styles.opacityButton}
					onPress={() => {
						const currentPosition = playBackStatus.positionMillis;
						videoRef.current.setStatusAsync({
							shouldPlay: false,
							positionMillis: currentPosition - (fineControl ? 5 : 30),
							seekMillisToleranceAfter: 5,
							seekMillisToleranceBefore: 5,
						});
					}}
				/>
				<TouchableOpacity
					style={styles.opacityButton}
					onPress={() => {
						if (playBackStatus.isPlaying) {
							videoRef.current.pauseAsync();
						} else {
							videoRef.current.playAsync();
						}
					}}
				/>
				<TouchableOpacity
					style={styles.opacityButton}
					onPress={() => {
						const currentPosition = playBackStatus.positionMillis;
						videoRef.current.setStatusAsync({
							shouldPlay: false,
							positionMillis: currentPosition + (fineControl ? 5 : 30),
							seekMillisToleranceAfter: 5,
							seekMillisToleranceBefore: 5,
						});
					}}
				/>
			</View>
			<View style={styles.buttons}>
				<Button
					onPress={() => {
						pickVideo();
					}}
					title='Pick Video'
				/>
				<Button
					onPress={() => {
						setFineControl(!fineControl);
					}}
					title={fineControl ? 'Fast Advance' : 'Fine Control'}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		backgroundColor: '#ecf0f1',
	},
	progressBar: {
		width: '100%',
		height: 20,
	},
	video: {
		width: '99%',
		height: '90%',
	},
	buttons: {
		width: '100%',
		position: 'absolute',
		bottom: 0,
		display: 'flex',
		flexDirection: 'row',
	},
	opacityButtons: {
		position: 'absolute',
		width: '100%',
		height: '100%',
		display: 'flex',
		flexDirection: 'row',
	},
	opacityButton: {
		width: '33%',
		height: '100%',
	},
});
