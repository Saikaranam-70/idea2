import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const BASE_URL = "https://oneserve.in";

// 👉 Subject → completed count mapping
const getCompletedSubjectsCount = (currentSubject?: string): number => {
  if (!currentSubject) return 0;

  const subjectMap: Record<string, number> = {
    OS: 0,
    DBMS: 1,
    CN: 2,
    OOPS: 3,
    APTITUDE: 4,
    INTERVIEW: 5,
  };

  return subjectMap[currentSubject.toUpperCase()] ?? 0;
};

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [localProgress, setLocalProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const completedSubjectsCount = getCompletedSubjectsCount(
    localProgress?.subject || user?.progress?.currentSubject,
  );

  // Fallback profile image (local asset or placeholder)
  const defaultProfileImage =
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // AdMob Required Pages
  const admobRequiredPages = [
    {
      id: 1,
      name: "Privacy Policy",
      icon: "shield-checkmark",
      description:
        "Legal document disclosing how user data is collected and used",
      route: "/privacy-policy", // Replace with actual URL
    },
    {
      id: 2,
      name: "Terms of Service",
      icon: "document-text",
      description: "Rules and guidelines users must agree to",
      route: "/terms", // Replace with actual URL
    },
    {
      id: 3,
      name: "About Us",
      icon: "information-circle",
      description: "Information about your app and company",
      route: "/about",
    },
    {
      id: 4,
      name: "Contact Us",
      icon: "mail",
      description: "Contact information for support and inquiries",
      route: "/contact",
    },
    {
      id: 5,
      name: "FAQ",
      icon: "help-circle",
      description: "Frequently asked questions about the app",
      route: "/faq",
    },
    {
      id: 6,
      name: "App Feedback",
      icon: "chatbubble",
      description: "User feedback and rating page",
      route: "/feedback",
    },
    // {
    //   id: 7,
    //   name: "Remove Ads (Premium)",
    //   icon: "diamond",
    //   description: "In-app purchase page for ad-free experience",
    //   isPremium: true,
    // },
  ];

  const fetchLocalProgress = async () => {
    try {
      const data = await AsyncStorage.getItem("current_learning_progress");
      if (data) {
        setLocalProgress(JSON.parse(data));
      }
    } catch (err) {
      console.error("Failed to load local progress", err);
    } finally {
      setProgressLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/user/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.log("Profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert("Delete", "Are you sure you want to delete account?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            const res = await fetch(`${BASE_URL}/user/delete-account`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });

            const data = await res.json();

            if (res.ok) {
              Alert.alert("Deleted", "Your Account Deleted Successfully", [
                {
                  text: "OK",
                  style: "destructive",
                  onPress: async () => {
                    await AsyncStorage.removeItem("token");
                    router.replace("/login");
                  },
                },
              ]);
            } else {
              Alert.alert("Error", data.message || "Deleted Failed");
            }
          } catch (err) {
            console.log(err);
            Alert.alert("Error", "Something went wrong");
          }
        },
      },
    ]);
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            // Clear all stored data
            await AsyncStorage.multiRemove(["token", "user"]);

            // Navigate to login screen
            router.replace("/login");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  const refreshProfile = async () => {
    setLoading(true);
    await fetchProfile();
  };

  const handlePageClick = (page) => {
    setSettingsModalVisible(false);
    if (page.route) {
      router.push(page.route);
    } else {
      Alert.alert(page.name, "This page will be implemented soon.");
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchLocalProgress();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="sad-outline" size={60} color="#8B5CF6" />
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* HEADER WITH GRADIENT */}
      <View style={styles.header}>
        <View style={styles.headerBackground} />

        {/* Settings Button - Left side */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setSettingsModalVisible(true)}
        >
          <Ionicons name="settings-outline" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Refresh Button */}
        <TouchableOpacity style={styles.refreshButton} onPress={refreshProfile}>
          <Ionicons name="refresh" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri: user.profileImage || defaultProfileImage,
                cache: "force-cache",
              }}
              style={styles.profileImage}
              onError={(e) => {
                console.log("Image loading error:", e.nativeEvent.error);
                // You can set state to use default image on error
              }}
              defaultSource={{ uri: defaultProfileImage }}
            />
            {user.isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="diamond" size={16} color="#FFD700" />
              </View>
            )}
          </View>

          <Text style={styles.name}>{user.name || "User"}</Text>
          <Text style={styles.username}>@{user.username}</Text>

          <View style={styles.roleContainer}>
            <Text style={styles.roleText}>
              {user.isPremium ? "Premium Member" : "Free Member"}
            </Text>
          </View>

          {/* {!user.isPremium && (
            <TouchableOpacity style={styles.upgradeButton}>
              <Ionicons name="sparkles" size={16} color="#fff" />
              <Text style={styles.upgradeText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          )} */}
        </View>
      </View>

      {/* STATS CARDS */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View
            style={[
              styles.statIcon,
              { backgroundColor: "rgba(139, 92, 246, 0.1)" },
            ]}
          >
            <Ionicons name="flame" size={24} color="#8B5CF6" />
          </View>
          <Text style={styles.statNumber}>{user.streak || 0}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>

        <View style={styles.statCard}>
          <View
            style={[
              styles.statIcon,
              { backgroundColor: "rgba(34, 197, 94, 0.1)" },
            ]}
          >
            <FontAwesome5 name="brain" size={20} color="#22C55E" />
          </View>
          <Text style={styles.statNumber}>{user.confidenceScore || 0}</Text>
          <Text style={styles.statLabel}>Confidence</Text>
        </View>

        <View style={styles.statCard}>
          <View
            style={[
              styles.statIcon,
              { backgroundColor: "rgba(239, 68, 68, 0.1)" },
            ]}
          >
            <Feather name="activity" size={22} color="#EF4444" />
          </View>
          <Text style={styles.statNumber}>{user.fearLevel || 0}/5</Text>
          <Text style={styles.statLabel}>Fear Level</Text>
        </View>
        <View style={styles.statCard}>
          <View
            style={[
              styles.statIcon,
              { backgroundColor: "rgba(234, 179, 8, 0.1)" },
            ]}
          >
            <Ionicons name="star" size={24} color="#EAB308" />
          </View>
          <Text style={styles.statNumber}>{user.points || 0}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
      </View>

      {/* PROGRESS SECTION */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="timeline" size={24} color="#8B5CF6" />
          <Text style={styles.sectionTitle}>Learning Progress</Text>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressItem}>
            <View style={styles.progressIcon}>
              <Ionicons name="book" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Current Subject</Text>
              <Text style={styles.progressValue}>
                {localProgress?.subject ||
                  user.progress?.currentSubject ||
                  "Not started"}
              </Text>
            </View>
          </View>

          <View style={styles.progressItem}>
            <View style={styles.progressIcon}>
              <Ionicons name="document-text" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Current Topic</Text>
              <Text style={styles.progressValue}>
                {localProgress?.topicTitle ||
                  user.progress?.currentTopic ||
                  "—"}
              </Text>
            </View>
          </View>

          <View style={styles.progressItem}>
            <View style={styles.progressIcon}>
              <MaterialIcons name="check-circle" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Completed Subjects</Text>
              <Text style={styles.progressValue}>{completedSubjectsCount}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ACTIVITY SECTION */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="activity" size={24} color="#8B5CF6" />
          <Text style={styles.sectionTitle}>Activity Stats</Text>
        </View>

        <View style={styles.activityGrid}>
          <View style={styles.activityCard}>
            <View style={styles.activityIconContainer}>
              <Ionicons name="mic" size={20} color="#fff" />
            </View>
            <Text style={styles.activityNumber}>
              {user.totalSpeakingSeconds || 0}
            </Text>
            <Text style={styles.activityLabel}>Seconds Speaking</Text>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityIconContainer}>
              <Ionicons name="time" size={20} color="#fff" />
            </View>
            <Text style={styles.activityNumber}>
              {user.lastActiveDate
                ? new Date(user.lastActiveDate).getDate()
                : "—"}
            </Text>
            <Text style={styles.activityLabel}>Last Active</Text>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityIconContainer}>
              <Ionicons name="notifications" size={20} color="#fff" />
            </View>
            <Text style={styles.activityNumber}>
              {user.notificationsEnabled ? "ON" : "OFF"}
            </Text>
            <Text style={styles.activityLabel}>Notifications</Text>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityIconContainer}>
              <FontAwesome5 name="book-reader" size={18} color="#fff" />
            </View>
            <Text style={styles.activityNumber}>
              {user.progress?.totalTopicsRead || 0}
            </Text>
            <Text style={styles.activityLabel}>Topics Read</Text>
          </View>
        </View>
      </View>

      {/* PERSONAL INFO */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person" size={24} color="#8B5CF6" />
          <Text style={styles.sectionTitle}>Personal Information</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons
              name="mail"
              size={18}
              color="#8B5CF6"
              style={styles.infoIcon}
            />
            <View>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="game-controller"
              size={18}
              color="#8B5CF6"
              style={styles.infoIcon}
            />
            <View>
              <Text style={styles.infoLabel}>Preferred Mode</Text>
              <Text style={styles.infoValue}>
                {user.preferredMode || "Not set"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="checkmark-done"
              size={18}
              color="#8B5CF6"
              style={styles.infoIcon}
            />
            <View>
              <Text style={styles.infoLabel}>Profile Status</Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: user.isProfileComplete ? "#22C55E" : "#EF4444" },
                ]}
              >
                {user.isProfileComplete ? "Complete" : "Incomplete"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="calendar"
              size={18}
              color="#8B5CF6"
              style={styles.infoIcon}
            />
            <View>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* PREMIUM FEATURES SECTION (Only shown for premium users) */}
      {user.isPremium && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="diamond" size={24} color="#FFD700" />
            <Text style={styles.sectionTitle}>Premium Features</Text>
          </View>

          <View style={styles.premiumFeaturesCard}>
            <View style={styles.premiumFeature}>
              <Ionicons name="infinite" size={20} color="#FFD700" />
              <Text style={styles.premiumFeatureText}>Unlimited Practice</Text>
            </View>
            <View style={styles.premiumFeature}>
              <Ionicons name="download" size={20} color="#FFD700" />
              <Text style={styles.premiumFeatureText}>Download Content</Text>
            </View>
            <View style={styles.premiumFeature}>
              <Ionicons name="stats-chart" size={20} color="#FFD700" />
              <Text style={styles.premiumFeatureText}>Advanced Analytics</Text>
            </View>
            <View style={styles.premiumFeature}>
              <Ionicons name="sparkles" size={20} color="#FFD700" />
              <Text style={styles.premiumFeatureText}>AI Tutor Access</Text>
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.bottomSettingsButton}
        onPress={() => setSettingsModalVisible(true)}
      >
        <Ionicons name="settings-outline" size={22} color="#fff" />
        <Text style={styles.bottomSettingText}>Settings</Text>
      </TouchableOpacity>

      {/* LOGOUT BUTTON AT BOTTOM */}
      <TouchableOpacity
        style={styles.bottomLogoutButton}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.bottomLogoutText}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.bottomLogoutButton}
        onPress={handleDeleteAccount}
      >
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
        <Text style={styles.bottomLogoutText}>Delete Account</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Keep up the great work! 🚀</Text>
      </View>

      {/* SETTINGS MODAL FOR ADMOB PAGES */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={settingsModalVisible}
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TouchableOpacity
                onPress={() => setSettingsModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
            >
              {/* <View style={styles.modalInfoBox}>
                <Ionicons name="information-circle" size={24} color="#8B5CF6" />
                <Text style={styles.modalInfoText}>
                  These pages are required for AdMob app approval. Make sure all
                  pages are properly implemented with actual content.
                </Text>
              </View> */}

              {admobRequiredPages.map((page) => (
                <TouchableOpacity
                  key={page.id}
                  style={[
                    styles.pageItem,
                    page.isPremium && styles.premiumPageItem,
                  ]}
                  onPress={() => handlePageClick(page)}
                >
                  <View style={styles.pageIconContainer}>
                    <Ionicons
                      name={page.icon}
                      size={24}
                      color={page.isPremium ? "#FFD700" : "#8B5CF6"}
                    />
                  </View>
                  <View style={styles.pageInfo}>
                    <Text style={styles.pageName}>{page.name}</Text>
                    <Text style={styles.pageDescription}>
                      {page.description}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                </TouchableOpacity>
              ))}

              {/* <View style={styles.modalFooter}>
                <Text style={styles.modalFooterText}>
                  ⚠️ Important: All these pages must contain actual content, not
                  placeholders, for AdMob approval.
                </Text>
              </View> */}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#6B7280",
    marginTop: 12,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    position: "relative",
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
    marginBottom: 20,
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#8B5CF6",
    opacity: 0.9,
  },
  logoutButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  refreshButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  settingsButton: {
    position: "absolute",
    top: 50,
    left: 75,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  profileSection: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: "#fff",
  },
  premiumBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#1F2937",
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 10,
  },
  roleContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 15,
  },
  roleText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.9)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
  },
  upgradeText: {
    color: "#1F2937",
    fontWeight: "600",
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  progressCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  progressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  progressInfo: {
    flex: 1,
  },
  progressLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  activityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  activityCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  activityNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  activityLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  infoIcon: {
    marginRight: 12,
    width: 24,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  premiumFeaturesCard: {
    backgroundColor: "rgba(139, 92, 246, 0.05)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.2)",
  },
  premiumFeature: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  premiumFeatureText: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
  },
  bottomLogoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  bottomLogoutText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  modalCloseButton: {
    padding: 5,
  },
  modalScrollView: {
    padding: 20,
  },
  modalInfoBox: {
    flexDirection: "row",
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
    alignItems: "center",
  },
  modalInfoText: {
    flex: 1,
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  pageItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  premiumPageItem: {
    backgroundColor: "rgba(255, 215, 0, 0.05)",
    borderColor: "rgba(255, 215, 0, 0.3)",
  },
  pageIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pageInfo: {
    flex: 1,
  },
  pageName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  pageDescription: {
    fontSize: 12,
    color: "#6B7280",
  },
  modalFooter: {
    marginTop: 20,
    marginBottom: 30,
    padding: 16,
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
  },
  modalFooterText: {
    fontSize: 12,
    color: "#EF4444",
    textAlign: "center",
    lineHeight: 18,
  },
  bottomSettingsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(16, 6, 6, 0.98)",
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  bottomSettingText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
