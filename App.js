import { StatusBar } from 'expo-status-bar';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Button, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { Slider } from '@react-native-assets/slider';

function Color(props) {
	return (
		<TouchableOpacity onPress={props.onPress}>
			<View style={{ backgroundColor: props.color }}></View>
		</TouchableOpacity>
	);
}

export default function App() {
	const [video, setVideo] = useState(null);
	const [currentPosition, setCurrentPosition] = useState(0);
	const [playbackStatus, setPlaybackStatus] = useState({});
	const [fineControl, setFineControl] = useState(false);
	const [loading, setLoading] = useState(false);
	const [annotating, setAnnotating] = useState(false);
	const [duration, setDuration] = useState(0);

	const videoRef = useRef(null);
	// todo add loading state
	const pickVideo = async () => {
		setLoading(true);
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Videos,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		});

		if (!result.canceled) {
			console.log(result.assets[0]);
			setVideo(result.assets[0].uri);
			setCurrentPosition(0);
			setPlaybackStatus({});
			setDuration(result.assets[0].duration);
		}
	};

	const decrement = useCallback(() => {
		const newTime = currentPosition - (fineControl ? 5 : 30);
		setCurrentPosition(newTime);
		// videoRef.current.setStatusAsync({
		// 	shouldPlay: false,
		// 	positionMillis: newTime,
		// 	seekMillisToleranceAfter: 5,
		// 	seekMillisToleranceBefore: 5,
		// });
	}, [currentPosition, videoRef.current, setCurrentPosition]);

	const increment = useCallback(() => {
		const newTime = currentPosition + (fineControl ? 5 : 30);
		setCurrentPosition(newTime);
		// videoRef.current.setStatusAsync({
		// 	shouldPlay: false,
		// 	positionMillis: newTime,
		// 	seekMillisToleranceAfter: 5,
		// 	seekMillisToleranceBefore: 5,
		// });
	}, [currentPosition, videoRef.current, setCurrentPosition]);

	// const updateSliderValue = useCallback(
	// 	,
	// 	[videoRef.current, currentPosition, setCurrentPosition],
	// );

	const controlButtons = (
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
	);

	return (
		<View style={styles.container}>
			<StatusBar style='auto' />
			<View style={styles.header} />
			<View style={styles.videoWrapper}>
				<Slider
					style={styles.progressBar}
					value={currentPosition}
					minmumValue={0}
					maximumValue={duration}
					onSlidingStart={() => {
						videoRef.current.pauseAsync();
					}}
					step={Math.round(Math.abs(duration) / 100)}
					slideOnTap={true}
					thumbSize={30}
					onSlidingComplete={(value) => {
						let floorVal = Math.floor(value);
						console.log('cpos', currentPosition);
						console.log(value);
						console.log('dur ', duration);
						setCurrentPosition(floorVal);
						videoRef.current.setStatusAsync({
							shouldPlay: true,
							positionMillis: floorVal,
							seekMillisToleranceAfter: 5,
							seekMillisToleranceBefore: 5,
						});
					}}
				/>
				{loading && <Text>Loading...</Text>}
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
					progressUpdateIntervalMillis={50}
					onPlaybackStatusUpdate={(status) => {
						setPlaybackStatus(status);
						if (!status.isLoaded) {
							// Update your UI for the unloaded state
							if (status.error) {
								console.log(
									`Encountered a fatal error during playback: ${status.error}`,
								);
							}
						} else {
							if (status.isLoaded) {
								setLoading(false);
							}
							if (status.isPlaying) {
								// console.log('playing');
								// console.log(status.positionMillis);
								setCurrentPosition(status.positionMillis);
							} else {
								// console.log('paused');
							}
							if (status.isBuffering) {
								// console.log('buffering');
							}

							if (status.didJustFinish && !status.isLooping) {
								// console.log('finsihed');
							}
						}
					}}
				/>
				<View style={styles.opacityButtons}>
					<TouchableOpacity style={styles.opacityButton} onPress={decrement} />
					<TouchableOpacity
						style={styles.opacityButton}
						onPress={() => {
							if (playbackStatus.isPlaying) {
								videoRef.current.pauseAsync();
							} else {
								videoRef.current.playAsync();
							}
						}}
					/>
					<TouchableOpacity style={styles.opacityButton} onPress={increment} />

					<Button
						title='edit'
						onPress={() => {
							setAnnotating(true);
						}}
					></Button>
					{annotating && (
						<View>
							<Color
								color={'blue'}
								onPress={() => {
									console.log('bluie');
								}}
							/>
						</View>
					)}
				</View>
			</View>

			{controlButtons}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		height: '100%',
		width: '100%',
		justifyContent: 'center',
		backgroundColor: '#ecf0f1',
		display: 'flex',
	},
	header: {
		height: 50,
		width: '100%',
		backgroundColor: 'brown',
	},
	videoWrapper: {
		height: '100%',
	},
	progressBar: {
		paddingTop: 10,
		paddingBottom: 10,
		width: '90%',
		zIndex: 2,
		alignSelf: 'center',
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
		backgroundColor: 'white',
		opacity: 0.1,
	},
});
