// app/(tabs)/jobs.tsx
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Using @expo/vector-icons as an alternative
import {
  Feather,
  FontAwesome,
  FontAwesome5,
  MaterialIcons,
} from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface Job {
  _id: string;
  companyName: string;
  position: string;
  experience: number;
  location: string;
  graduationYear: number[];
  isInternship: boolean;
  isHackathon: boolean;
  stipend?: number;
  applicationLink: string;
  createdAt: string;
}

export default function JobsScreen() {
  const [jobs, setJobs] = useState<Job[]>([
    {
      _id: "6978ee085cdf4f739a939312",
      companyName: "Iris",
      position: "UI Engineer (React)",
      experience: 0,
      location: "Noida",
      graduationYear: [2022, 2023, 2024],
      isInternship: false,
      isHackathon: false,
      applicationLink:
        "https://careers.irissoftware.com/job/Noida-UI-React-Engineer-UP/51500644/",
      createdAt: "2026-01-27T16:55:36.676Z",
    },
    {
      _id: "6978ec805cdf4f739a939310",
      companyName: "Wells Fargo",
      position: "Quantitative Analytics Program Intern",
      experience: 0,
      location: "Bengaluru/Hyderabad",
      graduationYear: [2026, 2027],
      isInternship: true,
      isHackathon: false,
      stipend: 50000,
      applicationLink:
        "https://www.wellsfargojobs.com/en/jobs/r-473284/intern-analyst-quantitative-analytics-profile/",
      createdAt: "2026-01-27T16:49:05.000Z",
    },
    {
      _id: "6978eaff5cdf4f739a93930d",
      companyName: "Rockwell Automation",
      position: "Associate Software Engineer",
      experience: 0,
      location: "Chennai/Pune",
      graduationYear: [2023, 2024, 2025],
      isInternship: false,
      isHackathon: false,
      applicationLink:
        "https://rockwellautomation.wd1.myworkdayjobs.com/en-GB/External_Rockwell_Automation/job/Associate-Software-Engineer--JAVA-MES-_R25-9120",
      createdAt: "2026-01-27T16:42:39.177Z",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState<"all" | "internship" | "hackathon">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.95))[0];

  const fetchJobs = async () => {
    try {
      const response = await fetch("https://oneserve.in/job/all");
      const data = await response.json();
      if (data.success) {
        setJobs(data.data);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      // Using mock data if API fails
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchJobs();
  };

  const handleJobPress = (job: Job) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedJob(job);
    setModalVisible(true);
  };

  const handleApply = async (link: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Linking.openURL(link);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const filteredJobs = jobs.filter((job) => {
    if (filter === "internship" && !job.isInternship) return false;
    if (filter === "hackathon" && !job.isHackathon) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        job.companyName.toLowerCase().includes(query) ||
        job.position.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <View style={styles.spinnerContainer}>
            <View style={styles.spinnerOuter} />
            <View style={styles.spinnerInner} />
          </View>
          <Text style={styles.loadingText}>
            Loading Premium Opportunities...
          </Text>
          <Text style={styles.loadingSubtext}>
            Curating top-tier positions for you
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.animatedContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>
                Premium <Text style={styles.titleGradient}>Careers</Text>
              </Text>
              <Text style={styles.subtitle}>
                Exclusive opportunities for top talent
              </Text>
            </View>
            {/*<View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <Feather name="search" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconButton, styles.filterButton]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <Feather name="filter" size={20} color="#fff" />
              </TouchableOpacity>
            </View>*/}
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Feather name="search" size={20} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search companies, positions, locations..."
                placeholderTextColor="#6B7280"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Feather name="x" size={20} color="#6B7280" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Stats Cards */}
          {/* <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statsScroll}
          >
           <View style={styles.statsRow}>
              <View style={[styles.statCard, styles.statCardBlue]}>
                <View style={styles.statIconContainer}>
                  <View style={[styles.statIcon, styles.statIconBlue]}>
                    <FontAwesome5 name="briefcase" size={20} color="#60A5FA" />
                  </View>
                </View>
                <Text style={styles.statNumber}>{jobs.length}</Text>
                <Text style={styles.statLabel}>Total Opportunities</Text>
              </View>

              <View style={[styles.statCard, styles.statCardGreen]}>
                <View style={styles.statIconContainer}>
                  <View style={[styles.statIcon, styles.statIconGreen]}>
                    <FontAwesome5 name="award" size={20} color="#34D399" />
                  </View>
                </View>
                <Text style={styles.statNumber}>
                  {jobs.filter(job => job.isInternship).length}
                </Text>
                <Text style={[styles.statLabel, styles.statLabelGreen]}>Internships</Text>
              </View>

              <View style={[styles.statCard, styles.statCardPurple]}>
                <View style={styles.statIconContainer}>
                  <View style={[styles.statIcon, styles.statIconPurple]}>
                    <FontAwesome5 name="users" size={20} color="#A78BFA" />
                  </View>
                </View>
                <Text style={styles.statNumber}>
                  {jobs.filter(job => job.isHackathon).length}
                </Text>
                <Text style={[styles.statLabel, styles.statLabelPurple]}>Hackathons</Text>
              </View>
            </View>
          </ScrollView>*/}

          {/* Filter Chips */}
          <View style={styles.filterContainer}>
            {(["all", "internship", "hackathon"] as const).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFilter(type);
                }}
                style={[
                  styles.filterChip,
                  filter === type
                    ? styles.filterChipActive
                    : styles.filterChipInactive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filter === type
                      ? styles.filterChipTextActive
                      : styles.filterChipTextInactive,
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Jobs List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.jobsScroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#60A5FA"
              colors={["#60A5FA"]}
            />
          }
        >
          <View style={styles.jobsList}>
            {filteredJobs.map((job, index) => (
              <TouchableOpacity
                key={job._id}
                onPress={() => handleJobPress(job)}
                activeOpacity={0.9}
              >
                <Animated.View
                  style={[
                    styles.jobCardContainer,
                    {
                      opacity: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                      transform: [
                        {
                          translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.jobCard}>
                    {/* Background Glow Effect */}
                    <View style={styles.cardGlow} />

                    {/* Job Header */}
                    <View style={styles.jobHeader}>
                      <View style={styles.jobHeaderLeft}>
                        <View style={styles.badgeContainer}>
                          <View
                            style={[
                              styles.typeBadge,
                              job.isHackathon
                                ? styles.hackathonBadge
                                : styles.hiringBadge,
                            ]}
                          >
                            <Text
                              style={[
                                styles.badgeText,
                                job.isHackathon
                                  ? styles.hackathonBadgeText
                                  : styles.hiringBadgeText,
                              ]}
                            >
                              {job.isHackathon ? "🏆 HACKATHON" : "💼 HIRING"}
                            </Text>
                          </View>
                          {job.isInternship && (
                            <View style={styles.internshipBadge}>
                              <Text style={styles.internshipBadgeText}>
                                INTERNSHIP
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.jobPosition}>{job.position}</Text>
                        <View style={styles.companyInfo}>
                          <MaterialIcons
                            name="verified"
                            size={16}
                            color="#9CA3AF"
                          />
                          <Text style={styles.companyName}>
                            {job.companyName}
                          </Text>
                          <FontAwesome
                            name="star"
                            size={14}
                            color="#FBBF24"
                            style={styles.starIcon}
                          />
                          <Text style={styles.rating}>4.8</Text>
                        </View>
                      </View>
                      <View style={styles.trendingIcon}>
                        <MaterialIcons
                          name="trending-up"
                          size={24}
                          color="#60A5FA"
                        />
                      </View>
                    </View>

                    {/* Job Details */}
                    <View style={styles.jobDetails}>
                      <View style={styles.detailsRow}>
                        <View style={styles.detailItem}>
                          <Feather name="map-pin" size={14} color="#9CA3AF" />
                          <Text style={styles.detailText}>{job.location}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <FontAwesome5
                            name="briefcase"
                            size={14}
                            color="#9CA3AF"
                          />
                          <Text style={styles.detailText}>
                            {job.experience}+ years
                          </Text>
                        </View>
                        <View style={styles.detailItem}>
                          <FontAwesome5
                            name="graduation-cap"
                            size={14}
                            color="#9CA3AF"
                          />
                          <Text style={styles.detailText}>
                            {job.graduationYear.join(", ")}
                          </Text>
                        </View>
                        {job.stipend && (
                          <View style={[styles.detailItem, styles.stipendItem]}>
                            <FontAwesome5
                              name="dollar-sign"
                              size={14}
                              color="#34D399"
                            />
                            <Text style={styles.stipendText}>
                              ₹{job.stipend.toLocaleString()}/mo
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.jobFooter}>
                      <View style={styles.timeContainer}>
                        <Feather name="clock" size={14} color="#9CA3AF" />
                        <Text style={styles.timeText}>
                          {getTimeAgo(job.createdAt)}
                        </Text>
                      </View>
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleApply(job.applicationLink);
                          }}
                          style={styles.applyButton}
                        >
                          <Text style={styles.applyButtonText}>Apply Now</Text>
                          <Feather
                            name="external-link"
                            size={16}
                            color="#fff"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.detailsButton}
                          onPress={() => handleJobPress(job)}
                        >
                          <Feather
                            name="chevron-right"
                            size={20}
                            color="#9CA3AF"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Animated.View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Job Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Job Details</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {selectedJob && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.modalScroll}
              >
                {/* Company Header */}
                <View style={styles.modalCompanyHeader}>
                  <View style={styles.modalCompanyTop}>
                    <View style={styles.modalCompanyIcon}>
                      <FontAwesome5
                        name="briefcase"
                        size={28}
                        color="#60A5FA"
                      />
                    </View>
                    <View style={styles.modalCompanyInfo}>
                      <Text style={styles.modalPosition}>
                        {selectedJob.position}
                      </Text>
                      <Text style={styles.modalCompany}>
                        {selectedJob.companyName}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.modalTypeBadge,
                      selectedJob.isHackathon
                        ? styles.modalHackathonBadge
                        : styles.modalHiringBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalBadgeText,
                        selectedJob.isHackathon
                          ? styles.modalHackathonBadgeText
                          : styles.modalHiringBadgeText,
                      ]}
                    >
                      {selectedJob.isHackathon
                        ? "🚀 HACKATHON EVENT"
                        : "🏢 DIRECT HIRING"}
                    </Text>
                  </View>
                </View>

                {/* Requirements Section */}
                <View style={styles.requirementsSection}>
                  <Text style={styles.requirementsTitle}>Requirements</Text>
                  <View style={styles.requirementsList}>
                    <View style={styles.requirementItem}>
                      <FontAwesome5
                        name="graduation-cap"
                        size={20}
                        color="#9CA3AF"
                        style={styles.requirementIcon}
                      />
                      <View style={styles.requirementContent}>
                        <Text style={styles.requirementLabel}>
                          Eligible Graduation Years
                        </Text>
                        <Text style={styles.requirementValue}>
                          {selectedJob.graduationYear.join(", ")}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.requirementItem}>
                      <FontAwesome5
                        name="briefcase"
                        size={20}
                        color="#9CA3AF"
                        style={styles.requirementIcon}
                      />
                      <View style={styles.requirementContent}>
                        <Text style={styles.requirementLabel}>
                          Experience Required
                        </Text>
                        <Text style={styles.requirementValue}>
                          {selectedJob.experience}+ years
                        </Text>
                      </View>
                    </View>
                    <View style={styles.requirementItem}>
                      <Feather
                        name="map-pin"
                        size={20}
                        color="#9CA3AF"
                        style={styles.requirementIcon}
                      />
                      <View style={styles.requirementContent}>
                        <Text style={styles.requirementLabel}>Location</Text>
                        <Text style={styles.requirementValue}>
                          {selectedJob.location}
                        </Text>
                      </View>
                    </View>
                    {selectedJob.stipend && (
                      <View
                        style={[
                          styles.requirementItem,
                          styles.stipendRequirement,
                        ]}
                      >
                        <FontAwesome5
                          name="dollar-sign"
                          size={20}
                          color="#34D399"
                          style={styles.requirementIcon}
                        />
                        <View style={styles.requirementContent}>
                          <Text style={styles.stipendLabel}>
                            Monthly Stipend
                          </Text>
                          <Text style={styles.stipendValue}>
                            ₹{selectedJob.stipend.toLocaleString()}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() => handleApply(selectedJob.applicationLink)}
                    style={styles.modalApplyButton}
                  >
                    <Text style={styles.modalApplyButtonText}>Apply Now</Text>
                    <Text style={styles.modalApplyButtonSubtext}>
                      Direct Application
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.favoriteButton}>
                    <FontAwesome name="star" size={24} color="#FBBF24" />
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },

  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  spinnerContainer: {
    position: "relative",
    width: 80,
    height: 80,
  },

  spinnerOuter: {
    width: 80,
    height: 80,
    borderWidth: 4,
    borderColor: "rgba(59, 130, 246, 0.3)",
    borderRadius: 40,
    position: "absolute",
  },

  spinnerInner: {
    width: 80,
    height: 80,
    position: "absolute",
    borderWidth: 4,
    borderTopColor: "#3b82f6",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    borderRadius: 40,
  },

  loadingText: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
  },

  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.4)",
  },

  animatedContainer: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },

  titleGradient: {
    color: "#60a5fa",
  },

  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.6)",
  },

  headerIcons: {
    flexDirection: "row",
    gap: 12,
  },

  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  filterButton: {
    backgroundColor: "#3b82f6",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },

  // Search
  searchContainer: {
    marginBottom: 24,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#ffffff",
  },

  // Stats Cards
  statsScroll: {
    marginBottom: 24,
  },

  statsRow: {
    flexDirection: "row",
    gap: 16,
    paddingRight: 24,
  },

  statCard: {
    width: 180,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  statCardBlue: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
  },

  statCardGreen: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
  },

  statCardPurple: {
    backgroundColor: "rgba(168, 85, 247, 0.2)",
  },

  statIconContainer: {
    marginBottom: 12,
  },

  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  statIconBlue: {
    backgroundColor: "rgba(59, 130, 246, 0.3)",
  },

  statIconGreen: {
    backgroundColor: "rgba(34, 197, 94, 0.3)",
  },

  statIconPurple: {
    backgroundColor: "rgba(168, 85, 247, 0.3)",
  },

  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(96, 165, 250, 0.8)",
  },

  statLabelGreen: {
    color: "rgba(52, 211, 153, 0.8)",
  },

  statLabelPurple: {
    color: "rgba(167, 139, 250, 0.8)",
  },

  // Filter Chips
  filterContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },

  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },

  filterChipActive: {
    backgroundColor: "#3b82f6",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },

  filterChipInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },

  filterChipText: {
    fontSize: 16,
    fontWeight: "500",
  },

  filterChipTextActive: {
    color: "#ffffff",
  },

  filterChipTextInactive: {
    color: "rgba(255, 255, 255, 0.6)",
  },

  // Jobs List
  jobsScroll: {
    paddingHorizontal: 24,
  },

  jobsList: {
    paddingBottom: 100,
  },

  jobCardContainer: {
    marginBottom: 16,
  },

  jobCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },

  cardGlow: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 160,
    height: 160,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 80,
  },

  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  jobHeaderLeft: {
    flex: 1,
  },

  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },

  hiringBadge: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderColor: "rgba(59, 130, 246, 0.3)",
  },

  hackathonBadge: {
    backgroundColor: "rgba(168, 85, 247, 0.2)",
    borderColor: "rgba(168, 85, 247, 0.3)",
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },

  hiringBadgeText: {
    color: "rgba(96, 165, 250, 1)",
  },

  hackathonBadgeText: {
    color: "rgba(192, 132, 252, 1)",
  },

  internshipBadge: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(52, 211, 153, 0.2)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.3)",
  },

  internshipBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "rgba(52, 211, 153, 1)",
  },

  jobPosition: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },

  companyInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  companyName: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
  },

  starIcon: {
    marginLeft: 12,
  },

  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(251, 191, 36, 0.8)",
  },

  trendingIcon: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(59, 130, 246, 0.3)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  // Job Details
  jobDetails: {
    marginBottom: 24,
  },

  detailsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  detailText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.7)",
  },

  stipendItem: {
    backgroundColor: "rgba(52, 211, 153, 0.2)",
  },

  stipendText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(52, 211, 153, 1)",
  },

  // Job Footer
  jobFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },

  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  timeText: {
    marginLeft: 8,
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.5)",
  },

  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },

  applyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },

  applyButtonText: {
    marginRight: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },

  detailsButton: {
    width: 40,
    height: 40,
    marginLeft: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },

  modalBackground: {
    flex: 1,
  },

  modalContent: {
    backgroundColor: "#0a0a0a",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: "85%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    paddingBottom: 0,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },

  modalCloseButton: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  modalScroll: {
    padding: 24,
  },

  modalCompanyHeader: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  modalCompanyTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  modalCompanyIcon: {
    width: 64,
    height: 64,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  modalCompanyInfo: {
    marginLeft: 16,
    flex: 1,
  },

  modalPosition: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },

  modalCompany: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
  },

  modalTypeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: "flex-start",
  },

  modalHiringBadge: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderColor: "rgba(59, 130, 246, 0.3)",
  },

  modalHackathonBadge: {
    backgroundColor: "rgba(168, 85, 247, 0.2)",
    borderColor: "rgba(168, 85, 247, 0.3)",
  },

  modalBadgeText: {
    fontSize: 14,
    fontWeight: "bold",
  },

  modalHiringBadgeText: {
    color: "rgba(96, 165, 250, 1)",
  },

  modalHackathonBadgeText: {
    color: "rgba(192, 132, 252, 1)",
  },

  // Requirements
  requirementsSection: {
    marginBottom: 24,
  },

  requirementsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
  },

  requirementsList: {
    gap: 12,
  },

  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 16,
  },

  requirementIcon: {
    marginRight: 12,
  },

  requirementContent: {
    flex: 1,
  },

  requirementLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
  },

  requirementValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
  },

  stipendRequirement: {
    backgroundColor: "rgba(52, 211, 153, 0.2)",
  },

  stipendLabel: {
    fontSize: 14,
    color: "rgba(52, 211, 153, 0.8)",
  },

  stipendValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "rgba(52, 211, 153, 1)",
  },

  // Modal Actions
  modalActions: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 32,
  },

  modalApplyButton: {
    flex: 1,
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },

  modalApplyButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },

  modalApplyButtonSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },

  favoriteButton: {
    width: 56,
    height: 56,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
