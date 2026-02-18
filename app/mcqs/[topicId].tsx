// screens/MCQsScreen.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// Define TypeScript interfaces for better type safety
interface MCQ {
  _id: string;
  topicId: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  createdAt: string;
  __v: number;
}

interface APIResponse {
  success: boolean;
  source: string;
  mcqs: MCQ[];
}

interface MCQProgress {
  isCompleted: boolean;
  selectedOptionIndex: number | null;
  isCorrect: boolean;
  timeSpentSeconds?: number;
}

type MCQProgressMap = {
  [mcqId: string]: MCQProgress;
};

interface SubjectResponse {
  success: boolean;
  topicId: string;
  subject: string;
  title: string;
}

const API_BASE_URL = "https://oneserve.in";

const MCQsScreen = () => {
  const route = useRoute();
  const router = useRouter();
  const navigation = useNavigation();
  const { topicId } = route.params as { topicId: string };

  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [mcqProgress, setMcqProgress] = useState<MCQProgressMap>({});

  const [checkingStatus, setCheckingStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [subject, setSubject] = useState<string>("");
  const [topicTitle, setTopicTitle] = useState<string>("");

  useEffect(() => {
    startTimer();
    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (topicId) {
      fetchMCQs();
      checkMCQStatus();
      fetchSubjectName();
    }
  }, [topicId]);

  useEffect(() => {
    if (mcqs.length > 0 && currentQuestion < mcqs.length) {
      checkIfQuestionCompleted(mcqs[currentQuestion]._id);
    }
  }, [currentQuestion, mcqs]);

  const startTimer = () => {
    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    setTimer(interval);
  };

  const fetchMCQs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/mcq/topic/${topicId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: APIResponse = await response.json();

      if (data.success) {
        setMcqs(data.mcqs);
      } else {
        throw new Error("Failed to fetch MCQs");
      }
    } catch (error) {
      console.error("Error fetching MCQs:", error);
      setError("Failed to load questions. Please try again.");
      Alert.alert(
        "Error",
        "Failed to load questions. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectName = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/topic/subject-name/${topicId}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SubjectResponse = await response.json();

      if (data.success) {
        setSubject(data.subject);
        setTopicTitle(data.title);
      } else {
        console.warn("Failed to fetch subject name:", data.message);
        setSubject("General");
      }
    } catch (error) {
      console.error("Error fetching subject name:", error);
      setSubject("General");
    }
  };

  const checkMCQStatus = async () => {
    try {
      setCheckingStatus(true);
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/user/mcq-progress-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setMcqProgress(result.data || {});
      }
    } catch (error) {
      console.error("Error fetching MCQ progress:", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    if (Object.keys(mcqProgress).length === 0) return;

    let correctCount = 0;

    Object.values(mcqProgress).forEach((progress) => {
      if (progress.isCompleted && progress.isCorrect) {
        correctCount += 1;
      }
    });

    setScore(correctCount);
  }, [mcqProgress]);

  const checkIfQuestionCompleted = (mcqId: string) => {
    const progress = mcqProgress[mcqId];

    if (progress?.isCompleted) {
      setSelectedOption(progress.selectedOptionIndex ?? null);
      setShowExplanation(true);
    } else {
      setSelectedOption(null);
      setShowExplanation(false);
    }
  };

  const submitMCQ = async (isCorrect: boolean) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const currentMCQ = mcqs[currentQuestion];

      const response = await fetch(`${API_BASE_URL}/user/submit-mcq`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mcqId: currentMCQ._id,
          topicId: currentMCQ.topicId,
          subject: subject || "General",
          selectedOptionIndex: selectedOption,
          isCorrect,
          timeSpentSeconds: timeSpent,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // ✅ UPDATE MCQ PROGRESS HERE
        setMcqProgress((prev) => ({
          ...prev,
          [currentMCQ._id]: {
            isCompleted: true,
            selectedOptionIndex: selectedOption,
            isCorrect,
          },
        }));

        // ✅ UPDATE SCORE ONLY ON FIRST ATTEMPT
        if (isCorrect) {
          setScore((s) => s + 1);
        }

        setUserPoints(result.points || 0);
        return true;
      }

      Alert.alert("Error", result.message || "Failed to submit MCQ");
      return false;
    } catch (error) {
      console.error("Error submitting MCQ:", error);
      Alert.alert("Error", "Failed to submit MCQ");
      return false;
    }
  };

  const handleOptionSelect = async (optionIndex: number) => {
    // Don't allow selection if question is already completed
    const currentMCQ = mcqs[currentQuestion];
    if (mcqProgress[currentMCQ._id]?.isCompleted) {
      Alert.alert(
        "Already Attempted",
        "This question has already been attempted.",
      );
      return;
    }

    setSelectedOption(optionIndex);
  };

  const handleNext = async () => {
    const currentMCQ = mcqs[currentQuestion];
    const isAlreadyCompleted = mcqProgress[currentMCQ._id]?.isCompleted;

    if (!isAlreadyCompleted) {
      setSubmitting(true);
      const submitted = await submitMCQ(
        selectedOption === currentMCQ.correctOptionIndex,
      );
      setSubmitting(false);

      if (!submitted) return;
    }

    // 👉 Move to next question
    if (currentQuestion < mcqs.length - 1) {
      setCurrentQuestion((q) => q + 1);
      setSelectedOption(null);
      setShowExplanation(false);
      setTimeSpent(0);
    } else {
      if (timer) clearInterval(timer);
      setShowResult(true);
    }
  };

  const handleShowExplanation = () => {
    setShowExplanation(true);
  };

  const handleRetry = () => {
    // Reset only non-completed questions
    const newCurrentQuestion = 0;
    setCurrentQuestion(newCurrentQuestion);
    const firstId = mcqs[newCurrentQuestion]._id;
    setSelectedOption(mcqProgress[firstId]?.selectedOptionIndex ?? null);

    setScore(0);
    setShowResult(false);
    setShowExplanation(false);
    setTimeSpent(0);
    startTimer();
  };

  const handleContinue = () => {
    router.push(`/interview/${topicId}`);
  };

  const getCompletionStatus = (mcqId: string) => {
    return mcqProgress[mcqId]?.isCompleted === true;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (loading || checkingStatus) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>
          {checkingStatus
            ? "Checking completion status..."
            : "Loading questions..."}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Icon name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchMCQs}>
          <Icon name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButtonAlt}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#7C3AED" />
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (mcqs.length === 0 && !loading) {
    return (
      <View style={styles.centered}>
        <Icon name="file-question-outline" size={64} color="#6B7280" />
        <Text style={styles.emptyText}>No questions available</Text>
        <TouchableOpacity
          style={styles.backButtonAlt}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#7C3AED" />
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showResult) {
    const percentage = (score / mcqs.length) * 100;
    let resultTitle = "";
    let resultMessage = "";

    if (percentage === 100) {
      resultTitle = "Perfect! 🎯";
      resultMessage = "You aced all questions!";
    } else if (percentage >= 70) {
      resultTitle = "Great Job! 👏";
      resultMessage = "You're doing excellent!";
    } else if (percentage >= 50) {
      resultTitle = "Good Work! 👍";
      resultMessage = "You're on the right track!";
    } else {
      resultTitle = "Keep Practicing! 📚";
      resultMessage = "Review the material and try again!";
    }

    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={["#7C3AED", "#8B5CF6"]}
          style={styles.resultGradient}
        >
          <View style={styles.resultContainer}>
            <View style={styles.resultCircle}>
              <Text style={styles.resultScore}>
                {score}/{mcqs.length}
              </Text>
              <Text style={styles.resultPercentage}>
                {percentage.toFixed(0)}%
              </Text>
            </View>

            <Text style={styles.resultTitle}>{resultTitle}</Text>

            <Text style={styles.resultMessage}>{resultMessage}</Text>

            {userPoints > 0 && (
              <View style={styles.pointsContainer}>
                <Icon name="star" size={24} color="#FFD700" />
                <Text style={styles.pointsText}>
                  +{userPoints} Points Earned
                </Text>
              </View>
            )}

            <View style={styles.resultButtons}>
              <TouchableOpacity
                style={styles.retryButtonResult}
                onPress={handleRetry}
              >
                <Icon name="refresh" size={20} color="#7C3AED" />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinue}
              >
                <Icon name="check-circle" size={20} color="#FFFFFF" />
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const currentMCQ = mcqs[currentQuestion];
  const isCompleted = getCompletionStatus(currentMCQ._id);
  const isCorrect = selectedOption === currentMCQ.correctOptionIndex;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />

      <LinearGradient
        colors={["#7C3AED", "#8B5CF6"]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            {subject ? (
              <Text style={styles.subjectBadge}>{subject.toUpperCase()}</Text>
            ) : null}
            {topicTitle ? (
              <Text style={styles.topicTitle} numberOfLines={1}>
                {topicTitle}
              </Text>
            ) : null}
          </View>

          <View style={styles.scoreContainer}>
            <Icon
              name="trophy"
              size={16}
              color="#FFFFFF"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.scoreText}>{score} pts</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Question {currentQuestion + 1} of {mcqs.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentQuestion + 1) / mcqs.length) * 100}%` },
              ]}
            />
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <View style={styles.questionNumberContainer}>
                <Text style={styles.questionNumber}>
                  Q{currentQuestion + 1}
                </Text>
                {isCompleted && (
                  <View style={styles.completedBadge}>
                    <Icon name="check-circle" size={12} color="#10B981" />
                    <Text style={styles.completedBadgeText}>Completed</Text>
                  </View>
                )}
              </View>
              <View style={styles.questionHeaderRight}>
                <View style={styles.timeContainer}>
                  <Icon name="clock-outline" size={12} color="#6B7280" />
                  <Text style={styles.timeText}>{formatTime(timeSpent)}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.questionText}>{currentMCQ.question}</Text>
          </View>

          <View style={styles.optionsContainer}>
            {currentMCQ.options.map((option, index) => {
              const isCorrectOption = index === currentMCQ.correctOptionIndex;
              const isSelected = selectedOption === index;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionSelected,
                    showExplanation && isCorrectOption && styles.optionCorrect,
                    showExplanation &&
                      isSelected &&
                      !isCorrectOption &&
                      styles.optionWrong,
                    isCompleted &&
                      isCorrectOption &&
                      styles.optionCorrectCompleted,
                  ]}
                  onPress={() => handleOptionSelect(index)}
                  disabled={showExplanation || isCompleted}
                >
                  <View
                    style={[
                      styles.optionIndicator,
                      isSelected && styles.optionIndicatorSelected,
                      showExplanation &&
                        isCorrectOption &&
                        styles.optionIndicatorCorrect,
                      showExplanation &&
                        isSelected &&
                        !isCorrectOption &&
                        styles.optionIndicatorWrong,
                      isCompleted &&
                        isCorrectOption &&
                        styles.optionIndicatorCorrect,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionLetter,
                        isSelected && styles.optionLetterSelected,
                        showExplanation &&
                          isCorrectOption &&
                          styles.optionLetterCorrect,
                        showExplanation &&
                          isSelected &&
                          !isCorrectOption &&
                          styles.optionLetterWrong,
                        isCompleted &&
                          isCorrectOption &&
                          styles.optionLetterCorrect,
                      ]}
                    >
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={styles.optionText}>{option}</Text>
                  {isSelected && !isCompleted && (
                    <Icon
                      name={isCorrectOption ? "check-circle" : "close-circle"}
                      size={24}
                      color={isCorrectOption ? "#10B981" : "#EF4444"}
                    />
                  )}
                  {(showExplanation || isCompleted) &&
                    isCorrectOption &&
                    !isSelected && (
                      <Icon name="check-circle" size={24} color="#10B981" />
                    )}
                </TouchableOpacity>
              );
            })}
          </View>

          {(showExplanation || isCompleted) && (
            <View style={styles.explanationCard}>
              <View style={styles.explanationHeader}>
                <Icon name="lightbulb-on-outline" size={20} color="#7C3AED" />
                <Text style={styles.explanationTitle}>Explanation</Text>
                {isCompleted && (
                  <View style={styles.pointsBadge}>
                    <Icon name="star" size={12} color="#FFD700" />
                    <Text style={styles.pointsBadgeText}>
                      {isCorrect ? "+4 points" : "No points"}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.explanationText}>
                {currentMCQ.explanation.replace(/\\n/g, "\n")}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {submitting ? (
          <View style={styles.submittingContainer}>
            <ActivityIndicator size="small" color="#7C3AED" />
            <Text style={styles.submittingText}>Submitting...</Text>
          </View>
        ) : !showExplanation && !isCompleted ? (
          <TouchableOpacity
            style={[
              styles.nextButton,
              selectedOption === null && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={selectedOption === null}
          >
            <Text style={styles.nextButtonText}>
              {currentQuestion === mcqs.length - 1 ? "Finish" : "Next Question"}
            </Text>
            <Icon name="arrow-right" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentQuestion === mcqs.length - 1 ? "See Results" : "Continue"}
            </Text>
            <Icon name="arrow-right" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {selectedOption !== null && !showExplanation && !isCompleted && (
          <TouchableOpacity
            style={styles.explanationButton}
            onPress={handleShowExplanation}
          >
            <Icon name="help-circle-outline" size={20} color="#7C3AED" />
            <Text style={styles.explanationButtonText}>Show Explanation</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
  },
  backButtonAlt: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 20,
  },
  backButtonText: {
    color: "#7C3AED",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  headerGradient: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
    marginLeft: 16,
  },
  subjectBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 2,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  progressText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  questionNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7C3AED",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  completedBadgeText: {
    fontSize: 10,
    color: "#10B981",
    fontWeight: "600",
    marginLeft: 4,
  },
  questionHeaderRight: {
    alignItems: "flex-end",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    marginLeft: 4,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    lineHeight: 26,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionSelected: {
    borderColor: "#7C3AED",
    backgroundColor: "#F5F3FF",
  },
  optionCorrect: {
    borderColor: "#10B981",
    backgroundColor: "#D1FAE5",
  },
  optionCorrectCompleted: {
    borderColor: "#10B981",
    backgroundColor: "#D1FAE5",
    opacity: 0.8,
  },
  optionWrong: {
    borderColor: "#EF4444",
    backgroundColor: "#FEE2E2",
  },
  optionIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionIndicatorSelected: {
    backgroundColor: "#7C3AED",
  },
  optionIndicatorCorrect: {
    backgroundColor: "#10B981",
  },
  optionIndicatorWrong: {
    backgroundColor: "#EF4444",
  },
  optionLetter: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6B7280",
  },
  optionLetterSelected: {
    color: "#FFFFFF",
  },
  optionLetterCorrect: {
    color: "#FFFFFF",
  },
  optionLetterWrong: {
    color: "#FFFFFF",
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 24,
  },
  explanationCard: {
    backgroundColor: "#F0F9FF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0369A1",
    marginLeft: 8,
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  pointsBadgeText: {
    fontSize: 12,
    color: "#92400E",
    fontWeight: "600",
    marginLeft: 4,
  },
  explanationText: {
    fontSize: 14,
    color: "#0C4A6E",
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  nextButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 12,
  },
  explanationButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 12,
  },
  explanationButtonText: {
    color: "#7C3AED",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  submittingContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  submittingText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  resultGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  resultContainer: {
    alignItems: "center",
    padding: 40,
    width: "100%",
  },
  resultCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  resultScore: {
    fontSize: 48,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  resultPercentage: {
    fontSize: 24,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  resultMessage: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 26,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 40,
  },
  pointsText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  resultButtons: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  retryButtonResult: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    minWidth: 140,
    justifyContent: "center",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7C3AED",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
    marginTop: 20,
  },
  retryButtonText: {
    color: "#7C3AED",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    minWidth: 140,
    justifyContent: "center",
  },
  homeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default MCQsScreen;
