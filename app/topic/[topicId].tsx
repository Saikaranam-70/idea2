// screens/TopicScreen.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
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

const API_BASE_URL = "https://oneserve.in";

interface TopicData {
  _id: string;
  title?: string;
  category?: string;
  descriptions?: Array<{
    heading?: string;
    content?: string;
    images?: string[];
  }>;
  difficulty?: string;
  order?: number | null;
}

const TopicScreen = () => {
  const router = useRouter();
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const id = topicId;

  const [topic, setTopic] = useState<TopicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTopic();
      checkTopicStatus();
    }
  }, [id]);

  const fetchTopic = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/topic/${id}`);
      const data = await response.json();
      setTopic(data);
    } catch (error) {
      console.error("Error fetching topic:", error);
      Alert.alert("Error", "Failed to load topic");
    } finally {
      setLoading(false);
    }
  };

  const checkTopicStatus = async () => {
    try {
      setCheckingStatus(true);
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/user/topic-read-status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result && result[id]) {
        setIsRead(true);
      }
    } catch (error) {
      console.error("Error checking topic status:", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleMarkAsRead = async () => {
    try {
      setMarkingAsRead(true);
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/user/mark-as-read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topicId: id,
          subject: topic?.category,
          topicTitle: topic?.title,
          order: topic?.order,
        }),
      });

      const result = await response.json();

      if (result?.success) {
        setIsRead(true);
        router.push(`/mcqs/${topicId}`);
      } else {
        Alert.alert("Error", "Failed to mark as read");
      }
    } catch (error) {
      console.error("Error marking as read:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setMarkingAsRead(false);
    }
  };

  const handleGoToMCQs = () => {
    router.push(`/mcqs/${topicId}`);
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "easy":
        return "#10B981";
      case "medium":
        return "#F59E0B";
      case "hard":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getDifficultyIcon = (difficulty?: string) => {
    switch (difficulty) {
      case "easy":
        return "trending-up";
      case "medium":
        return "trending-flat";
      case "hard":
        return "trending-down";
      default:
        return "help-circle";
    }
  };

  const formatDifficulty = (difficulty?: string) => {
    if (!difficulty) return "Unknown";
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!topic) {
    return (
      <View style={styles.centered}>
        <Icon name="alert-circle" size={60} color="#9CA3AF" />
        <Text style={styles.errorText}>Topic not found</Text>
      </View>
    );
  }

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
            onPress={() => router.navigate("/(tabs)")}
          >
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.categoryBadge}>
              {topic.category ?? "GENERAL"}
            </Text>

            <Text style={styles.title}>{topic.title ?? "Untitled Topic"}</Text>

            <View style={styles.difficultyContainer}>
              <Icon
                name={getDifficultyIcon(topic.difficulty)}
                size={16}
                color={getDifficultyColor(topic.difficulty)}
              />
              <Text
                style={[
                  styles.difficultyText,
                  { color: getDifficultyColor(topic.difficulty) },
                ]}
              >
                {formatDifficulty(topic.difficulty)}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.content}>
          {(topic.descriptions ?? []).map((section, index) => (
            <View key={index} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumber}>
                  <Text style={styles.sectionNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.sectionHeading}>
                  {section.heading ?? "Section"}
                </Text>
              </View>

              <View style={styles.sectionContent}>
                {(section.content ?? "")
                  .split("\n")
                  .filter(Boolean)
                  .map((line, lineIndex) => (
                    <View key={lineIndex} style={styles.listItem}>
                      {line.startsWith("*") ? (
                        <>
                          <Icon
                            name="circle-small"
                            size={24}
                            color="#7C3AED"
                            style={styles.bullet}
                          />
                          <Text style={styles.listText}>
                            {line.substring(1).trim()}
                          </Text>
                        </>
                      ) : (
                        <Text style={styles.paragraph}>{line}</Text>
                      )}
                    </View>
                  ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <LinearGradient
          colors={["rgba(255,255,255,0)", "#FFFFFF"]}
          style={styles.footerGradient}
        >
          {checkingStatus ? (
            <View style={styles.statusCheckingButton}>
              <ActivityIndicator size="small" color="#7C3AED" />
              <Text style={styles.statusCheckingText}>Checking status...</Text>
            </View>
          ) : isRead ? (
            <TouchableOpacity
              style={styles.completedButton}
              onPress={handleGoToMCQs}
            >
              <Icon name="arrow-right-circle" size={24} color="#FFFFFF" />
              <Text style={styles.completedButtonText}>
                Completed - Go To MCQs
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.markAsReadButton}
              onPress={handleMarkAsRead}
              disabled={markingAsRead}
            >
              {markingAsRead ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="bookmark-check" size={24} color="#FFFFFF" />
                  <Text style={styles.markAsReadText}>Mark as Read</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

export default TopicScreen;

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
  },
  errorText: {
    fontSize: 18,
    color: "#9CA3AF",
    marginTop: 16,
  },
  headerGradient: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
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
  categoryBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  difficultyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  headerRight: {
    width: 44,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F3FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sectionNumberText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#7C3AED",
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  sectionContent: {
    marginLeft: 44,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bullet: {
    marginTop: 2,
    marginRight: 8,
  },
  listText: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
    flex: 1,
  },
  paragraph: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
    marginBottom: 12,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerGradient: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  statusCheckingButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  statusCheckingText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  markAsReadButton: {
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
  markAsReadText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 12,
  },
  completedButton: {
    backgroundColor: "#10B981",
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  completedButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 12,
  },
});
