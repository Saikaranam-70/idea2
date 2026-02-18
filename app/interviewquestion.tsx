import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Video } from "expo-av";
import { Camera, CameraView } from "expo-camera";
import * as FileSystem from "expo-file-system/legacy";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

const { width, height } = Dimensions.get("window");

const InterviewQuestionsBySubject = () => {
  const navigation = useNavigation();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [groupedQuestions, setGroupedQuestions] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Video recording states
  const [showCamera, setShowCamera] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [uploading, setUploading] = useState(false);
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

  // Dropdown states
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("INTERVIEW");
  const [items, setItems] = useState([
    { label: "🎤 Interview", value: "INTERVIEW" },
    { label: "💻 Operating Systems", value: "OS" },
    { label: "🗄️ Database Management", value: "DBMS" },
    { label: "🌐 Computer Networks", value: "CN" },
    { label: "🔄 Object Oriented Programming", value: "OOPS" },
    { label: "📊 Data Structures & Algorithms", value: "DSA" },
    { label: "🧮 Aptitude", value: "APTITUDE" },
  ]);

  const categoryColors = {
    INTERVIEW: { primary: "#9C27B0", secondary: "#E1BEE7" },
    OS: { primary: "#2196F3", secondary: "#BBDEFB" },
    DBMS: { primary: "#4CAF50", secondary: "#C8E6C9" },
    CN: { primary: "#FF9800", secondary: "#FFE0B2" },
    OOPS: { primary: "#F44336", secondary: "#FFCDD2" },
    DSA: { primary: "#673AB7", secondary: "#D1C4E9" },
    APTITUDE: { primary: "#009688", secondary: "#B2DFDB" },
  };

  const categoryIcons = {
    INTERVIEW: "mic-outline",
    OS: "desktop-outline",
    DBMS: "server-outline",
    CN: "git-network-outline",
    OOPS: "cube-outline",
    DSA: "code-slash-outline",
    APTITUDE: "calculator-outline",
  };

  useEffect(() => {
    fetchQuestions(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const fetchQuestions = async (category) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://oneserve.in/interview/category/${category.toLowerCase()}`,
      );
      const data = await response.json();

      if (data.success && data.data) {
        setQuestions(data.data);
        groupQuestionsByTopic(data.data);
      } else {
        setQuestions([]);
        setGroupedQuestions({});
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      Alert.alert("Error", "Failed to fetch questions");
      setQuestions([]);
      setGroupedQuestions({});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const groupQuestionsByTopic = (questionsList) => {
    const grouped = {};
    questionsList.forEach((question) => {
      const topicTitle = question.topicId?.title || "General Questions";
      if (!grouped[topicTitle]) {
        grouped[topicTitle] = [];
      }
      grouped[topicTitle].push(question);
    });
    setGroupedQuestions(grouped);

    // Expand first topic by default
    const topics = Object.keys(grouped);
    if (topics.length > 0) {
      const initialExpanded = {};
      topics.forEach((topic) => {
        initialExpanded[topic] = true;
      });
      setExpandedTopics(initialExpanded);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchQuestions(value);
  };

  const toggleTopic = (topic) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topic]: !prev[topic],
    }));
  };

  // Video Recording Functions
  const handleAnswerClick = async (question) => {
    setSelectedQuestion(question);

    const { status: cameraStatus } =
      await Camera.requestCameraPermissionsAsync();
    const { status: audioStatus } =
      await Camera.requestMicrophonePermissionsAsync();

    if (cameraStatus === "granted" && audioStatus === "granted") {
      setHasPermission(true);
      setShowCamera(true);
      setTranscriptionResult(null);
      setShowTranscription(false);
      setVideoUri(null);
      setRecordingTime(0);
    } else {
      Alert.alert(
        "Permission required",
        "Camera and microphone permissions are required to record your answer.",
      );
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current || !selectedQuestion) return;

    setRecording(true);
    setRecordingTime(0);

    const interval = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    setTimerInterval(interval);

    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: selectedQuestion?.timeLimit || 60,
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
    setSelectedQuestion(null);
  };

  const retakeVideo = () => {
    setVideoUri(null);
    setRecordingTime(0);
    setTranscriptionResult(null);
    setShowTranscription(false);
  };

  const uploadVideo = async () => {
    if (!videoUri || !selectedQuestion) return;

    try {
      setUploading(true);

      const fileInfo = await FileSystem.getInfoAsync(videoUri);
      if (!fileInfo.exists) {
        throw new Error("Video file not found");
      }

      const token = await AsyncStorage.getItem("token");

      const formData = new FormData();
      const uriParts = videoUri.split("/");
      const fileName = uriParts[uriParts.length - 1] || "interview_video.mp4";
      const fileType = "video/mp4";

      formData.append("video", {
        uri: videoUri,
        type: fileType,
        name: fileName,
      });

      formData.append("topicId", selectedQuestion.topicId?._id || "");
      formData.append("questionId", selectedQuestion._id);
      formData.append("duration", recordingTime);
      formData.append("category", value);

      console.log("Uploading video...", {
        questionId: selectedQuestion._id,
        duration: recordingTime,
        category: value,
      });

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
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

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "trending-up-outline";
      case "medium":
        return "trending-up";
      case "hard":
        return "trending-up-sharp";
      default:
        return "help-outline";
    }
  };

  const filteredQuestions = searchQuery
    ? Object.keys(groupedQuestions).reduce((acc, topic) => {
        const filtered = groupedQuestions[topic].filter(
          (q) =>
            q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.topicId?.title.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        if (filtered.length > 0) acc[topic] = filtered;
        return acc;
      }, {})
    : groupedQuestions;

  const renderQuestionItem = ({ item }) => (
    <View style={styles.questionCard}>
      <LinearGradient
        colors={["#FFFFFF", "#F8F9FA"]}
        style={styles.questionGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.questionHeader}>
          <View style={styles.questionMeta}>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(item.difficulty) + "20" },
              ]}
            >
              <Ionicons
                name={getDifficultyIcon(item.difficulty)}
                size={14}
                color={getDifficultyColor(item.difficulty)}
              />
              <Text
                style={[
                  styles.difficultyText,
                  { color: getDifficultyColor(item.difficulty) },
                ]}
              >
                {item.difficulty?.toUpperCase()}
              </Text>
            </View>
            <View style={styles.timeBadge}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.timeText}>{item.timeLimit}s</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.cameraButton,
              { backgroundColor: categoryColors[value]?.primary + "20" },
            ]}
            onPress={() => handleAnswerClick(item)}
          >
            <Ionicons
              name="videocam-outline"
              size={22}
              color={categoryColors[value]?.primary}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.questionText}>{item.question}</Text>

        {item.structureHints && item.structureHints.length > 0 && (
          <View style={styles.hintsContainer}>
            <Text style={styles.hintsLabel}>Structure Hints:</Text>
            <View style={styles.hintsList}>
              {item.structureHints.slice(0, 2).map((hint, index) => (
                <View
                  key={index}
                  style={[
                    styles.hintTag,
                    { backgroundColor: categoryColors[value]?.secondary },
                  ]}
                >
                  <Ionicons
                    name="bulb-outline"
                    size={12}
                    color={categoryColors[value]?.primary}
                  />
                  <Text
                    style={[
                      styles.hintText,
                      { color: categoryColors[value]?.primary },
                    ]}
                  >
                    {hint}
                  </Text>
                </View>
              ))}
              {item.structureHints.length > 2 && (
                <View
                  style={[
                    styles.hintTag,
                    { backgroundColor: categoryColors[value]?.secondary },
                  ]}
                >
                  <Text
                    style={[
                      styles.hintText,
                      { color: categoryColors[value]?.primary },
                    ]}
                  >
                    +{item.structureHints.length - 2} more
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.answerButtonContainer}>
          <TouchableOpacity
            style={[
              styles.answerButton,
              { backgroundColor: categoryColors[value]?.primary },
            ]}
            onPress={() => handleAnswerClick(item)}
          >
            <Ionicons name="play-circle-outline" size={20} color="white" />
            <Text style={styles.answerButtonText}>Record Answer</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderTopicSection = (topic) => (
    <View key={topic} style={styles.topicSection}>
      <TouchableOpacity
        style={[
          styles.topicHeader,
          { backgroundColor: categoryColors[value]?.primary + "10" },
        ]}
        onPress={() => toggleTopic(topic)}
        activeOpacity={0.8}
      >
        <View style={styles.topicHeaderLeft}>
          <View
            style={[
              styles.topicIcon,
              { backgroundColor: categoryColors[value]?.primary + "20" },
            ]}
          >
            <Ionicons
              name="folder-outline"
              size={24}
              color={categoryColors[value]?.primary}
            />
          </View>
          <View>
            <Text
              style={[
                styles.topicTitle,
                { color: categoryColors[value]?.primary },
              ]}
            >
              {topic}
            </Text>
            <Text style={styles.topicCount}>
              {groupedQuestions[topic]?.length || 0} questions
            </Text>
          </View>
        </View>
        <Ionicons
          name={expandedTopics[topic] ? "chevron-up" : "chevron-down"}
          size={24}
          color={categoryColors[value]?.primary}
        />
      </TouchableOpacity>

      {expandedTopics[topic] && (
        <View style={styles.questionsList}>
          {groupedQuestions[topic]?.map((question, index) => (
            <View key={question._id} style={styles.questionItem}>
              {renderQuestionItem({ item: question })}
            </View>
          ))}
        </View>
      )}
    </View>
  );

  // Camera Screen
  if (showCamera && hasPermission) {
    return (
      <SafeAreaView style={styles.cameraContainer}>
        <View style={styles.cameraWrapper}>
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
                    {selectedQuestion?.question}
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
                    {selectedQuestion?.question}
                  </Text>
                </View>
              </View>

              {showTranscription && transcriptionResult ? (
                // Transcription View
                <ScrollView style={styles.transcriptionContainer}>
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
                  <View style={styles.videoActionButtons}>
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

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={categoryColors[value]?.primary}
        />
        <Text style={styles.loadingText}>
          Loading {items.find((item) => item.value === value)?.label}{" "}
          questions...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Ionicons name="help-circle-outline" size={32} color="white" />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Interview Questions</Text>
              <Text style={styles.headerSubtitle}>
                Prepare for your next interview
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.contentContainer}>
        <View style={styles.controlsContainer}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={20}
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search questions..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.dropdownContainer}>
            <View style={styles.categoryLabel}>
              <Ionicons name="apps-outline" size={20} color="#666" />
              <Text style={styles.categoryLabelText}>Category:</Text>
            </View>
            <DropDownPicker
              open={open}
              value={value}
              items={items}
              setOpen={setOpen}
              setValue={setValue}
              setItems={setItems}
              style={[
                styles.dropdown,
                { borderColor: categoryColors[value]?.primary },
              ]}
              dropDownContainerStyle={styles.dropdownMenu}
              textStyle={styles.dropdownText}
              labelStyle={styles.dropdownLabel}
              selectedItemContainerStyle={{
                backgroundColor: categoryColors[value]?.primary + "20",
              }}
              selectedItemLabelStyle={{
                color: categoryColors[value]?.primary,
                fontWeight: "600",
              }}
              ArrowUpIconComponent={() => (
                <Ionicons
                  name="chevron-up"
                  size={24}
                  color={categoryColors[value]?.primary}
                />
              )}
              ArrowDownIconComponent={() => (
                <Ionicons
                  name="chevron-down"
                  size={24}
                  color={categoryColors[value]?.primary}
                />
              )}
              TickIconComponent={() => (
                <Ionicons
                  name="checkmark"
                  size={24}
                  color={categoryColors[value]?.primary}
                />
              )}
            />
          </View>
        </View>

        {questions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={80} color="#E0E0E0" />
            <Text style={styles.emptyStateTitle}>No questions found</Text>
            <Text style={styles.emptyStateText}>
              No questions available for{" "}
              {items.find((item) => item.value === value)?.label}
            </Text>
            <TouchableOpacity
              style={[
                styles.refreshButton,
                { backgroundColor: categoryColors[value]?.primary },
              ]}
              onPress={onRefresh}
            >
              <Ionicons name="refresh-outline" size={20} color="white" />
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[categoryColors[value]?.primary]}
                tintColor={categoryColors[value]?.primary}
              />
            }
          >
            <View style={styles.statsCard}>
              <LinearGradient
                colors={[
                  categoryColors[value]?.primary,
                  categoryColors[value]?.primary + "DD",
                ]}
                style={styles.statsGradient}
              >
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Ionicons
                      name="document-text-outline"
                      size={30}
                      color="white"
                    />
                    <Text style={styles.statNumber}>{questions.length}</Text>
                    <Text style={styles.statLabel}>Total Questions</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Ionicons name="folder-outline" size={30} color="white" />
                    <Text style={styles.statNumber}>
                      {Object.keys(groupedQuestions).length}
                    </Text>
                    <Text style={styles.statLabel}>Topics</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Ionicons name="time-outline" size={30} color="white" />
                    <Text style={styles.statNumber}>
                      {questions.reduce((sum, q) => sum + q.timeLimit, 0)}
                    </Text>
                    <Text style={styles.statLabel}>Total Time</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {Object.keys(filteredQuestions).map((topic) =>
              renderTopicSection(topic),
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  cameraWrapper: {
    flex: 1,
  },
  // Camera Styles from your original component
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
    paddingBottom: 40,
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
  // Main UI Styles
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    paddingHorizontal: 20,
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: 60,
    zIndex: 10,
    padding: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  headerTextContainer: {
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  controlsContainer: {
    marginTop: -30,
    marginBottom: 20,
    zIndex: 1000,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  dropdownContainer: {
    zIndex: 1000,
  },
  categoryLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingLeft: 5,
  },
  categoryLabelText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    marginLeft: 8,
  },
  dropdown: {
    backgroundColor: "white",
    borderWidth: 2,
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
  },
  dropdownMenu: {
    backgroundColor: "white",
    borderWidth: 2,
    borderRadius: 15,
    marginTop: 5,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  statsCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  statsGradient: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "700",
    color: "white",
    marginTop: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 5,
  },
  topicSection: {
    marginBottom: 20,
  },
  topicHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  topicHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  topicIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  topicCount: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  questionsList: {
    paddingHorizontal: 5,
  },
  questionItem: {
    marginBottom: 12,
  },
  questionCard: {
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  questionGradient: {
    padding: 20,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  questionMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  difficultyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  timeText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    marginLeft: 4,
  },
  cameraButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  questionText: {
    fontSize: 17,
    lineHeight: 24,
    color: "#333",
    marginBottom: 15,
    fontWeight: "500",
  },
  hintsContainer: {
    marginBottom: 15,
  },
  hintsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  hintsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  hintTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  hintText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  answerButtonContainer: {
    marginTop: 5,
  },
  answerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  answerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  loadingContainer: {
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#666",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  refreshButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
});

export default InterviewQuestionsBySubject;
