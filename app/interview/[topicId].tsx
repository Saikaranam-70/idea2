import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Video } from "expo-av";
import { Camera, CameraView } from "expo-camera";
import * as FileSystem from "expo-file-system/legacy";

const { width, height } = Dimensions.get("window");

const InterviewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { topicId } = route.params;
  const [questions, setQuestions] = useState([]);
  const [randomQuestion, setRandomQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [recording, setRecording] = useState(false);
  const [videoUri, setVideoUri] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [videoStatus, setVideoStatus] = useState({});
  const [transcriptionResult, setTranscriptionResult] = useState(null);
  const [showTranscription, setShowTranscription] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://oneserve.in/interview/topic/${topicId}`,
      );

      const text = await response.text();

      if (!text) {
        throw new Error("Empty response from server");
      }

      const data = JSON.parse(text);

      if (data.success && data.data.length > 0) {
        setQuestions(data.data);
        const randomIndex = Math.floor(Math.random() * data.data.length);
        setRandomQuestion(data.data[randomIndex]);
      } else {
        Alert.alert("Error", "No questions found for this topic");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch questions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerClick = async () => {
    // Request permissions when user clicks answer
    const { status: cameraStatus } =
      await Camera.requestCameraPermissionsAsync();
    const { status: audioStatus } =
      await Camera.requestMicrophonePermissionsAsync();

    if (cameraStatus === "granted" && audioStatus === "granted") {
      setHasPermission(true);
      setShowCamera(true);
      setTranscriptionResult(null);
      setShowTranscription(false);
    } else {
      Alert.alert(
        "Permission required",
        "Camera and microphone permissions are required to record your answer.",
      );
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current) return;

    setRecording(true);
    setRecordingTime(0);

    // Start timer
    const interval = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    setTimerInterval(interval);

    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: randomQuestion?.timeLimit || 60,
      });

      setVideoUri(video.uri);
    } catch (error) {
      console.error("Recording failed:", error);
      Alert.alert("Error", "Failed to record video");
    } finally {
      setRecording(false);
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && recording) {
      cameraRef.current.stopRecording();
      setRecording(false);
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }
  };

  const closeCamera = () => {
    if (recording) {
      stopRecording();
    }
    setShowCamera(false);
    setVideoUri(null);
    setRecordingTime(0);
    setTranscriptionResult(null);
    setShowTranscription(false);
  };

  const retakeVideo = () => {
    setVideoUri(null);
    setRecordingTime(0);
    setTranscriptionResult(null);
    setShowTranscription(false);
  };

  const uploadVideo = async () => {
    if (!videoUri || !randomQuestion) return;

    try {
      setUploading(true);

      // Get file information using the new File System API
      const fileInfo = await FileSystem.getInfoAsync(videoUri);

      if (!fileInfo.exists) {
        throw new Error("Video file not found");
      }

      // Get auth token (implement based on your auth system)
      const token = await getAuthToken();

      // Create form data
      const formData = new FormData();

      // Extract filename from URI
      const uriParts = videoUri.split("/");
      const fileName = uriParts[uriParts.length - 1] || "interview_video.mp4";
      const fileType = "video/mp4";

      // Append file
      formData.append("video", {
        uri: videoUri,
        type: fileType,
        name: fileName,
      });

      // Append other data
      formData.append("topicId", topicId);
      formData.append("questionId", randomQuestion._id);
      formData.append("duration", recordingTime);

      console.log("Uploading video...", {
        topicId,
        questionId: randomQuestion._id,
        duration: recordingTime,
        fileSize: fileInfo.size || "unknown",
      });

      // Upload to backend
      const response = await fetch("https://oneserve.in/answer/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.log("Raw server response:", text);
        throw new Error("Invalid server response");
      }

      if (data.success) {
        Alert.alert(
          "Success",
          "Your answer has been saved and transcribed successfully!",
          [
            {
              text: "View Transcription",
              onPress: () => {
                setTranscriptionResult(data.data);
                setShowTranscription(true);
              },
            },
            {
              text: "OK",
              style: "default",
              onPress: closeCamera,
            },
          ],
        );
      } else {
        Alert.alert("Error", data.message || "Failed to upload video");
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Upload Failed", error.message || "Network error occurred");
    } finally {
      setUploading(false);
    }
  };

  // Placeholder for auth token - implement based on your auth system
  const getAuthToken = async () => {
    // Implement this based on your auth system
    return await AsyncStorage.getItem("token");
    // Replace with actual token retrieval
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "#4CAF50";
      case "medium":
        return "#FF9800";
      case "hard":
        return "#F44336";
      default:
        return "#757575";
    }
  };

  // Camera Screen
  if (showCamera && hasPermission) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["top", "left", "right", "bottom"]}
      >
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.cameraContainer}>
          {!videoUri ? (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="front"
              mode="video"
              mute={false}
              videoQuality="480p"
            >
              {/* Camera Header */}
              <View style={styles.cameraHeader}>
                <TouchableOpacity
                  style={styles.closeCameraButton}
                  onPress={closeCamera}
                >
                  <Ionicons name="close" size={28} color="white" />
                </TouchableOpacity>
                <View style={styles.questionPreview}>
                  <Text style={styles.questionPreviewText} numberOfLines={2}>
                    {randomQuestion?.question}
                  </Text>
                </View>
              </View>

              {/* Timer Display */}
              {recording && (
                <View style={styles.timerContainer}>
                  <View style={styles.timerBubble}>
                    <Ionicons name="recording" size={20} color="#FF3B30" />
                    <Text style={styles.timerText}>
                      {formatTime(recordingTime)}
                    </Text>
                  </View>
                </View>
              )}

              {/* Camera Controls */}
              <View style={styles.cameraControls}>
                {!recording ? (
                  <>
                    <TouchableOpacity
                      style={styles.recordButton}
                      onPress={startRecording}
                    >
                      <View style={styles.recordButtonInner} />
                    </TouchableOpacity>
                    <Text style={styles.recordPrompt}>
                      Tap to start recording your answer
                    </Text>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.stopButton}
                      onPress={stopRecording}
                    >
                      <View style={styles.stopButtonInner} />
                    </TouchableOpacity>
                    <Text style={styles.recordPrompt}>
                      Tap to stop recording
                    </Text>
                  </>
                )}
              </View>

              {/* Recording Status */}
              {recording && (
                <View style={styles.recordingStatus}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.recordingText}>RECORDING</Text>
                </View>
              )}
            </CameraView>
          ) : (
            // Video Preview Screen
            <View style={styles.videoPreviewScreen}>
              <View style={styles.videoPreviewHeader}>
                <TouchableOpacity
                  style={styles.closeCameraButton}
                  onPress={closeCamera}
                >
                  <Ionicons name="close" size={28} color="white" />
                </TouchableOpacity>
                <View style={styles.questionPreview}>
                  <Text style={styles.questionPreviewText} numberOfLines={2}>
                    {randomQuestion?.question}
                  </Text>
                </View>
              </View>

              {showTranscription && transcriptionResult ? (
                // Transcription View
                <ScrollView
                  style={styles.transcriptionContainer}
                  contentContainerStyle={{ paddingBottom: 120 }}
                >
                  <View style={styles.transcriptionHeader}>
                    <Ionicons name="document-text" size={32} color="#007AFF" />
                    <Text style={styles.transcriptionTitle}>
                      Transcription Result
                    </Text>
                  </View>

                  <View style={styles.transcriptionCard}>
                    <Text style={styles.transcriptionLabel}>Your Answer:</Text>
                    <Text style={styles.transcriptionText}>
                      {transcriptionResult.transcriptText}
                    </Text>
                  </View>

                  <View style={styles.metadataContainer}>
                    <View style={styles.metadataItem}>
                      <Ionicons name="time-outline" size={20} color="#666" />
                      <Text style={styles.metadataText}>
                        Duration:{" "}
                        {formatTime(
                          transcriptionResult.duration || recordingTime,
                        )}
                      </Text>
                    </View>
                    <View style={styles.metadataItem}>
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#666"
                      />
                      <Text style={styles.metadataText}>
                        {new Date(
                          transcriptionResult.createdAt,
                        ).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.backToVideoButton}
                    onPress={() => setShowTranscription(false)}
                  >
                    <Ionicons name="play-circle" size={24} color="#007AFF" />
                    <Text style={styles.backToVideoText}>Back to Video</Text>
                  </TouchableOpacity>
                </ScrollView>
              ) : (
                // Video Player View
                <>
                  {/* Video Player */}
                  <View style={styles.videoPlayerContainer}>
                    <Video
                      ref={videoRef}
                      source={{ uri: videoUri }}
                      style={styles.videoPlayer}
                      useNativeControls
                      resizeMode="contain"
                      isLooping={false}
                      onPlaybackStatusUpdate={(status) =>
                        setVideoStatus(() => status)
                      }
                    />
                  </View>

                  {/* Video Info */}
                  <View style={styles.videoInfo}>
                    <Text style={styles.videoDuration}>
                      Duration: {formatTime(recordingTime)}
                    </Text>
                  </View>

                  {/* Action Buttons */}
                  <View style={[styles.videoActionButtons, styles.bottomSafe]}>
                    <TouchableOpacity
                      style={styles.videoActionButton}
                      onPress={retakeVideo}
                    >
                      <Ionicons name="refresh" size={24} color="#007AFF" />
                      <Text style={styles.videoActionButtonText}>Retake</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.videoActionButton, styles.playButton]}
                      onPress={() => {
                        if (videoStatus.isPlaying) {
                          videoRef.current.pauseAsync();
                        } else {
                          videoRef.current.playAsync();
                        }
                      }}
                    >
                      <Ionicons
                        name={videoStatus.isPlaying ? "pause" : "play"}
                        size={24}
                        color="white"
                      />
                      <Text
                        style={[
                          styles.videoActionButtonText,
                          styles.playButtonText,
                        ]}
                      >
                        {videoStatus.isPlaying ? "Pause" : "Play"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.videoActionButton, styles.saveButton]}
                      onPress={uploadVideo}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Ionicons name="cloud-upload" size={24} color="white" />
                      )}
                      <Text
                        style={[
                          styles.videoActionButtonText,
                          styles.saveButtonText,
                        ]}
                      >
                        {uploading ? "Uploading..." : "Save & Transcribe"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading question...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Interview Question</Text>
        </View>

        {randomQuestion && (
          <View style={styles.questionContainer}>
            <View style={styles.difficultyBadge}>
              <Text
                style={[
                  styles.difficultyText,
                  {
                    color: getDifficultyColor(randomQuestion.difficulty),
                  },
                ]}
              >
                {randomQuestion.difficulty.toUpperCase()}
              </Text>
            </View>

            <Text style={styles.questionText}>{randomQuestion.question}</Text>

            <View style={styles.timeLimitContainer}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.timeLimitText}>
                Suggested Time: {randomQuestion.timeLimit} seconds
              </Text>
            </View>

            <View style={styles.hintsContainer}>
              <Text style={styles.hintsTitle}>Structure Hints:</Text>
              {randomQuestion.structureHints?.map((hint, index) => (
                <View key={index} style={styles.hintItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.hintText}>{hint}</Text>
                </View>
              ))}
            </View>

            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>📝 Tips for Answering:</Text>
              <Text style={styles.tipText}>
                • Speak clearly and confidently
              </Text>
              <Text style={styles.tipText}>
                • Structure your answer using the hints
              </Text>
              <Text style={styles.tipText}>
                • Take a moment to think before speaking
              </Text>
              <Text style={styles.tipText}>
                • Stay within the suggested time
              </Text>
            </View>

            <TouchableOpacity
              style={styles.answerButton}
              onPress={handleAnswerClick}
            >
              <Ionicons name="videocam-outline" size={24} color="white" />
              <Text style={styles.answerButtonText}>Record Answer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={fetchQuestions}
            >
              <Ionicons name="refresh" size={20} color="#007AFF" />
              <Text style={styles.refreshButtonText}>Get Another Question</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginLeft: 16,
  },
  questionContainer: {
    margin: 20,
    padding: 24,
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  difficultyBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    marginBottom: 16,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "600",
  },
  questionText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    lineHeight: 32,
    marginBottom: 24,
  },
  timeLimitContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  timeLimitText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  hintsContainer: {
    marginBottom: 24,
  },
  hintsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  hintItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F0F9F0",
    borderRadius: 8,
  },
  hintText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
  tipsContainer: {
    marginBottom: 32,
    padding: 16,
    backgroundColor: "#F0F7FF",
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    marginLeft: 4,
  },
  answerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 16,
  },
  answerButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginLeft: 12,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    marginLeft: 8,
  },
  // Camera Styles
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  cameraHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  closeCameraButton: {
    padding: 8,
  },
  questionPreview: {
    flex: 1,
    marginLeft: 16,
  },
  questionPreviewText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  timerContainer: {
    position: "absolute",
    top: 120,
    alignSelf: "center",
  },
  timerBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  cameraControls: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    alignItems: "center",
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  recordButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FF3B30",
  },
  stopButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  stopButtonInner: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
  },
  recordPrompt: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 8,
  },
  recordingStatus: {
    position: "absolute",
    top: 40,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
    marginRight: 6,
  },
  recordingText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  // Video Preview Screen Styles
  videoPreviewScreen: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "space-between",
  },
  videoPreviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  videoPlayerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 40,
  },
  videoPlayer: {
    width: width * 0.9,
    height: height * 0.5,
    backgroundColor: "#000",
    borderRadius: 10,
  },
  videoInfo: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  videoDuration: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  videoActionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingBottom: 60, // increase space
    paddingTop: 10,
    backgroundColor: "#000",
  },

  videoActionButton: {
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#007AFF",
    backgroundColor: "rgba(0,0,0,0.7)",
    minWidth: 100,
  },
  videoActionButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 5,
  },
  playButton: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  playButtonText: {
    color: "white",
  },
  saveButton: {
    backgroundColor: "#34C759",
    borderColor: "#34C759",
  },
  saveButtonText: {
    color: "white",
  },
  // Transcription Styles
  transcriptionContainer: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  transcriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  transcriptionTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
    marginLeft: 12,
  },
  transcriptionCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  transcriptionLabel: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  transcriptionText: {
    color: "white",
    fontSize: 18,
    lineHeight: 28,
  },
  metadataContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  metadataText: {
    color: "white",
    fontSize: 14,
    marginLeft: 8,
  },
  backToVideoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,122,255,0.8)",
    paddingVertical: 15,
    borderRadius: 12,
    marginHorizontal: 40,
  },
  backToVideoText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
  bottomSafe: {
    paddingBottom: 20,
  },
});

export default InterviewScreen;
