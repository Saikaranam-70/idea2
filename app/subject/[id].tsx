import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ImageBackground,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Subject {
  _id: string;
  title: string;
  category: string;
  descriptions: Array<{
    heading: string;
    content: string;
    images: any[];
  }>;
  difficulty: string;
  createdAt: string;
}

export default function SubjectsScreen() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const { id, name } = useLocalSearchParams();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      // Using your provided API endpoint
      const response = await fetch(`https://oneserve.in/topic/subject/${name}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setSubjects(result.data);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      } else {
        throw new Error("Failed to fetch subjects");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      // Fallback to your provided data if API fails
      const fallbackData = {
        success: true,
        data: [
          {
            _id: "6975023145db1b690b3edd20",
            title: "Operating System Basics",
            category: "OS",
            descriptions: [],
            difficulty: "easy",
            createdAt: "2026-01-24T17:32:33.056Z",
          },
          {
            _id: "69750a67f4cb5b70b1f99f27",
            title: "Process Management",
            category: "OS",
            descriptions: [],
            difficulty: "easy",
            createdAt: "2026-01-24T18:07:35.973Z",
          },
          {
            _id: "6975f25ab341ad6abf084f8f",
            title: "Memory Management",
            category: "OS",
            descriptions: [],
            difficulty: "easy",
            createdAt: "2026-01-25T10:37:14.563Z",
          },
          {
            _id: "6975f45fb341ad6abf084f92",
            title: "I/O Management",
            category: "OS",
            descriptions: [],
            difficulty: "easy",
            createdAt: "2026-01-25T10:45:51.236Z",
          },
        ],
      };
      setSubjects(fallbackData.data);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectPress = (subject: Subject) => {
    // Navigate to topic screen with subject ID
    router.push({
      pathname: "/topic/[topicId]",
      params: {
        topicId: subject._id,
        title: subject.title,
      },
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "#4CAF50";
      case "medium":
        return "#FF9800";
      case "hard":
        return "#F44336";
      default:
        return "#6B7280";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleBackPress = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.gradientBackground}
        >
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading Subjects...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (error && subjects.length === 0) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchSubjects}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800",
        }}
        style={styles.backgroundImage}
        blurRadius={10}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.9)"]}
          style={styles.overlay}
        >
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackPress}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>{name} Subjects</Text>
                <Text style={styles.headerSubtitle}>Explore {name} Topics</Text>
              </View>
              <View style={styles.headerRightPlaceholder} />
            </View>
          </View>

          <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {subjects.map((subject, index) => (
                <TouchableOpacity
                  key={subject._id}
                  onPress={() => handleSubjectPress(subject)}
                  activeOpacity={0.9}
                  style={styles.subjectCardContainer}
                >
                  <LinearGradient
                    colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
                    style={styles.cardGradient}
                  >
                    <BlurView
                      intensity={80}
                      tint="dark"
                      style={styles.blurContainer}
                    >
                      <View style={styles.cardHeader}>
                        <View style={styles.titleContainer}>
                          <Text style={styles.subjectTitle}>
                            {subject.title}
                          </Text>
                          <View
                            style={[
                              styles.difficultyBadge,
                              {
                                backgroundColor: getDifficultyColor(
                                  subject.difficulty,
                                ),
                              },
                            ]}
                          >
                            <Text style={styles.difficultyText}>
                              {subject.difficulty}
                            </Text>
                          </View>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={24}
                          color="#9CA3AF"
                        />
                      </View>

                      <View style={styles.cardBody}>
                        <View style={styles.categoryContainer}>
                          <Ionicons
                            name="folder-outline"
                            size={16}
                            color="#9CA3AF"
                          />
                          <Text style={styles.categoryText}>
                            {subject.category}
                          </Text>
                        </View>

                        <View style={styles.metaInfo}>
                          <View style={styles.metaItem}>
                            <Ionicons
                              name="time-outline"
                              size={14}
                              color="#9CA3AF"
                            />
                            <Text style={styles.metaText}>
                              {formatDate(subject.createdAt)}
                            </Text>
                          </View>

                          <View style={styles.metaItem}>
                            <Ionicons
                              name="document-text-outline"
                              size={14}
                              color="#9CA3AF"
                            />
                            <Text style={styles.metaText}>
                              {subject.descriptions?.length || 0} sections
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.cardFooter}>
                        <Text style={styles.tapToExplore}>
                          Tap to explore topics →
                        </Text>
                      </View>
                    </BlurView>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {subjects.length} subjects available
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
    textAlign: "center",
  },
  headerRightPlaceholder: {
    width: 44,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  subjectCardContainer: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  cardGradient: {
    borderRadius: 20,
  },
  blurContainer: {
    padding: 20,
    borderRadius: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  subjectTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginRight: 12,
    flexShrink: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  cardBody: {
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryText: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  metaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    color: "#9CA3AF",
    fontSize: 13,
    marginLeft: 6,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 16,
  },
  tapToExplore: {
    color: "#667eea",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  footer: {
    padding: 20,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  footerText: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 20,
  },
  errorText: {
    color: "#F44336",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#667eea",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
});
