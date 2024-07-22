import { StatusBar } from 'expo-status-bar';
import { useState, useRef, useCallback } from 'react';
import {
	StyleSheet,
	TouchableOpacity,
	View,
	Text,
	Image,
	ActivityIndicator,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { RootSiblingParent } from 'react-native-root-siblings';
import Toast from 'react-native-root-toast';
import AnnotationControls from './AnnotationControls';
import AnnotationLayer from './AnnotationLayer';

export default function App() {
	const [video, setVideo] = useState(null);
	const [currentPosition, setCurrentPosition] = useState(0);
	const [playbackStatus, setPlaybackStatus] = useState({});
	const [fineControl, setFineControl] = useState(false);
	const [loading, setLoading] = useState(false);
	const [duration, setDuration] = useState(0);
	const [wasVideoPlaying, setWasVideoPlaying] = useState(false);
	const [annotating, setAnnotating] = useState(false);
	const [annotationColor, setAnnotationColor] = useState('red');
	const [annotationKeyShift, setAnnotationKeyShift] = useState(0);

	const videoRef = useRef(null);

	const pickVideo = async () => {
		let currentVideo = video;
		setLoading(true);
		setVideo(null);
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Videos,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		});

		if (!result.canceled) {
			setVideo(result.assets[0].uri);
			setCurrentPosition(0);
			setPlaybackStatus({});
			setDuration(result.assets[0].duration);
		} else {
			setVideo(currentVideo);
			setLoading(false);
		}
	};

	const controlButtons = (
		<View style={styles.buttons}>
			<TouchableOpacity
				onPress={() => {
					pickVideo();
				}}
				style={styles.button}
			>
				<Image style={styles.button} source={require('./assets/films.png')} />
			</TouchableOpacity>

			<TouchableOpacity
				onPress={() => {
					setFineControl(!fineControl);
					Toast.show(`Switched to ${!fineControl ? 'slow' : 'fast'} step`, {
						duration: Toast.durations.SHORT,
					});
				}}
				style={styles.button}
			>
				<Image
					style={styles.button}
					source={
						fineControl
							? require('./assets/forward-fast.png')
							: require('./assets/forward-step.png')
					}
				/>
			</TouchableOpacity>
		</View>
	);

	if (!video && !loading) {
		return (
			<RootSiblingParent>
				<View style={styles.container}>
					<StatusBar style='auto' />
					<View style={styles.header} />
					<View style={styles.spinnerWrapper}>
						<Text>Pick a video to get started.</Text>
					</View>
					{controlButtons}
				</View>
			</RootSiblingParent>
		);
	}
	if (!video && loading) {
		return (
			<View style={styles.container}>
				<StatusBar style='auto' />
				<View style={styles.header} />
				<View style={styles.spinnerWrapper}>
					<ActivityIndicator size={50} color={'brown'} />
				</View>
			</View>
		);
	}
	let step = duration ? Math.round(Math.abs(duration) / 100) : 10;

	return (
		<RootSiblingParent>
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
							setWasVideoPlaying(playbackStatus.isPlaying);

							videoRef.current.pauseAsync();
						}}
						step={step}
						tapToSeek={true}
						thumbSize={30}
						onSlidingComplete={(value) => {
							let floorVal = Math.floor(value);
							setCurrentPosition(floorVal);
							videoRef.current.setStatusAsync({
								shouldPlay: wasVideoPlaying,
								positionMillis: floorVal,
								seekMillisToleranceAfter: 5,
								seekMillisToleranceBefore: 5,
							});
						}}
					/>
					<ReactNativeZoomableView
						maxZoom={5}
						minZoom={1}
						zoomStep={0.5}
						initialZoom={1}
						bindToBorders={true}
					>
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
						{!annotating && (
							<AnnotationLayer
								annotationColor={annotationColor}
								key={`aLayer${annotationKeyShift}`}
							/>
						)}
						<View style={styles.opacityButtons}>
							<TouchableOpacity
								style={styles.opacityButton}
								onPress={() => {
									const newTime = currentPosition - (fineControl ? 5 : 30);
									setCurrentPosition(newTime);
									videoRef.current.setStatusAsync({
										shouldPlay: false,
										positionMillis: newTime,
										seekMillisToleranceAfter: 5,
										seekMillisToleranceBefore: 5,
									});
								}}
							/>
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
							<TouchableOpacity
								style={styles.opacityButton}
								onPress={() => {
									const newTime = currentPosition + (fineControl ? 5 : 30);
									setCurrentPosition(newTime);
									videoRef.current.setStatusAsync({
										shouldPlay: false,
										positionMillis: newTime,
										seekMillisToleranceAfter: 5,
										seekMillisToleranceBefore: 5,
									});
								}}
							/>
						</View>
						{annotating && (
							<AnnotationLayer
								annotationColor={annotationColor}
								key={`aLayer${annotationKeyShift}`}
							/>
						)}
					</ReactNativeZoomableView>
					<AnnotationControls
						annotating={annotating}
						setAnnotating={setAnnotating}
						annotationColor={annotationColor}
						setAnnotationColor={setAnnotationColor}
						incrementAnnotationKeyShift={() => {
							setAnnotationKeyShift(annotationKeyShift + 1);
						}}
					/>
				</View>
				{controlButtons}
			</View>
		</RootSiblingParent>
	);
}

const styles = StyleSheet.create({
	container: {
		height: '100%',
		width: '100%',
		backgroundColor: '#ecf0f1',
		display: 'flex',
		flexDirection: 'column',
	},
	header: {
		height: 30,
		width: '100%',
		backgroundColor: 'brown',
	},
	videoWrapper: {
		flexGrow: 1,
		display: 'flex',
		flexDirection: 'column',
	},
	progressBar: {
		marginTop: 5,
		marginBottom: 5,
		height: 50,
		width: '90%',
		zIndex: 2,
		alignSelf: 'center',
	},
	video: {
		flex: 1,
		width: '100%',
	},
	buttons: {
		width: '100%',
		height: 50,
		display: 'flex',
		flexDirection: 'row',
		marginTop: 10,
		marginBottom: 10,
		justifyContent: 'space-evenly',
		alignItems: 'center',
	},
	button: {
		height: 50,
		width: 50,
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
	spinnerWrapper: {
		display: 'flex',
		flexGrow: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
