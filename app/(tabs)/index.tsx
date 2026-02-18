// import axios from "axios";
// import { LinearGradient } from "expo-linear-gradient";
// import { useCallback, useEffect, useState } from "react";
// import {
//   Dimensions,
//   RefreshControl,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   View,
// } from "react-native";
//
// import Header from '@/components/Header';
// import { SafeAreaView } from 'react-native-safe-area-context';
//
// import { ThemedText } from "@/components/themed-text";
// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useTheme } from "@react-navigation/native";
// import { Link, useRouter } from "expo-router";
//
// const { width } = Dimensions.get("window");
//
// // API Configuration
// const API_BASE_URL = "https://m6sqbdzm-5000.inc1.devtunnels.ms"; // Replace with your actual API URL
//
// interface Subject {
//   id: string;
//   name: string;
//   icon: string;
//   color: string;
//   gradient: [string, string];
//   topicCount?: number;
//   progress?: number;
// }
//
// interface TodayTopic {
//   _id: string;
//   title: string;
//   category: string;
//   difficulty: string;
//   descriptions: { heading: string; content: string; images: string[] }[];
//   animationUrl?: string;
//   order: number;
// }
//
// interface Topic {
//   _id: string;
//   title: string;
//   category: string;
//   difficulty: string;
// }
//
// interface UserStats {
//   topicsMastered: number;
//   streak: number;
//   overallProgress: number;
// }
//
// const SUBJECTS: Subject[] = [
//   {
//     id: "OS",
//     name: "OS",
//     icon: "desktop-outline",
//     color: "#6366f1",
//     gradient: ["#6366f1", "#8b5cf6"],
//   },
//   {
//     id: "DBMS",
//     name: "DBMS",
//     icon: "server-outline",
//     color: "#10b981",
//     gradient: ["#10b981", "#34d399"],
//   },
//   {
//     id: "CN",
//     name: "CN",
//     icon: "wifi-outline",
//     color: "#f59e0b",
//     gradient: ["#f59e0b", "#fbbf24"],
//   },
//   {
//     id: "OOPS",
//     name: "OOPS",
//     icon: "cube-outline",
//     color: "#ef4444",
//     gradient: ["#ef4444", "#f87171"],
//   },
//   {
//     id: "DSA",
//     name: "DSA",
//     icon: "git-branch-outline",
//     color: "#8b5cf6",
//     gradient: ["#8b5cf6", "#a78bfa"],
//   },
//   {
//     id: "APTITUDE",
//     name: "Aptitude",
//     icon: "calculator-outline",
//     color: "#06b6d4",
//     gradient: ["#06b6d4", "#22d3ee"],
//   },
//   {
//     id: "INTERVIEW",
//     name: "Interview",
//     icon: "chatbubble-ellipses-outline",
//     color: "#f97316",
//     gradient: ["#f97316", "#fb923c"],
//   },
// ];
//
// const CACHE_KEYS = {
//   TODAY_TOPIC: "today_topic",
//   SUBJECT_STATS: "subject_stats",
//   USER_STATS: "user_stats",
//   SUBJECT_TOPICS: (subject: string) => `topics_${subject}`,
// };
//
// export default function HomeScreen() {
//   const theme = useTheme();
//   const router = useRouter();
//
//   const [todayTopic, setTodayTopic] = useState<TodayTopic | null>(null);
//   const [subjectStats, setSubjectStats] = useState<
//     Record<string, { count: number; progress: number }>
//   >({});
//   const [userStats, setUserStats] = useState<UserStats>({
//     topicsMastered: 0,
//     streak: 0,
//     overallProgress: 0,
//   });
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//
//   // Fetch Today's Topic
//   const fetchTodayTopic = useCallback(async () => {
//     try {
//       // Check cache first
//       const cached = await AsyncStorage.getItem(CACHE_KEYS.TODAY_TOPIC);
//       if (cached) {
//         const parsed = JSON.parse(cached);
//         if (Date.now() - parsed.timestamp < 3600000) {
//           // 1 hour cache
//           setTodayTopic(parsed.data);
//           return;
//         }
//       }
//
//       const response = await axios.get(`${API_BASE_URL}/topic/today`);
//       if (response.data.success) {
//         const topicData = response.data.data;
//         setTodayTopic(topicData);
//
//         // Cache the result
//         await AsyncStorage.setItem(
//           CACHE_KEYS.TODAY_TOPIC,
//           JSON.stringify({
//             data: topicData,
//             timestamp: Date.now(),
//           }),
//         );
//       }
//     } catch (err) {
//       console.error("Error fetching today topic:", err);
//       setError("Failed to load today's lecture");
//     }
//   }, []);
//
//
//
//   // Fetch Subject Statistics
// //   const fetchSubjectStats = useCallback(async () => {
// //     try {
// //       const cached = await AsyncStorage.getItem(CACHE_KEYS.SUBJECT_STATS);
// //       if (cached) {
// //         const parsed = JSON.parse(cached);
// //         if (Date.now() - parsed.timestamp < 1800000) {
// //           // 30 minutes cache
// //           setSubjectStats(parsed.data);
// //           return;
// //         }
// //       }
// //
// //       const stats: Record<string, { count: number; progress: number }> = {};
// //
// //       // Fetch topics for each subject
// //       await Promise.all(
// //         SUBJECTS.map(async (subject) => {
// //           try {
// //             const response = await axios.get(
// //               `${API_BASE_URL}/topic/subject/${subject.id}`,
// //             );
// //             if (response.data.success) {
// //               const topics = response.data.data;
// //               stats[subject.id] = {
// //                 count: topics.length,
// //                 progress: Math.floor(Math.random() * 100), // Replace with actual progress from backend if available
// //               };
// //             }
// //           } catch (err) {
// //             console.error(`Error fetching ${subject.name} topics:`, err);
// //             stats[subject.id] = { count: 0, progress: 0 };
// //           }
// //         }),
// //       );
// //
// //       setSubjectStats(stats);
// //       await AsyncStorage.setItem(
// //         CACHE_KEYS.SUBJECT_STATS,
// //         JSON.stringify({
// //           data: stats,
// //           timestamp: Date.now(),
// //         }),
// //       );
// //     } catch (err) {
// //       console.error("Error fetching subject stats:", err);
// //     }
// //   }, []);
//
// const fetchSubjectStats = useCallback(async () => {
//   try {
//     const cached = await AsyncStorage.getItem(CACHE_KEYS.SUBJECT_STATS);
//     if (cached) {
//       const parsed = JSON.parse(cached);
//       if (Date.now() - parsed.timestamp < 1800000) {
//         setSubjectStats(parsed.data);
//         return;
//       }
//     }
//
//     const stats: Record<string, { count: number; progress: number }> = {};
//
//     await Promise.all(
//       SUBJECTS.map(async (subject) => {
//         try {
//           // 👇 API expects lowercase subject
//           const response = await fetch(
//             `${API_BASE_URL}/topic/subject/${subject.id.toLowerCase()}`
//           );
//
//           const json = await response.json();
//
//           console.log(json)
//           console.log("gdgd")
//
//           if (json.success) {
//             const topics = json.data;
//             console.log(topics)
//
//             stats[subject.id] = {
//               count: topics.length,          // ✅ REAL topic count
//               progress: Math.min(
//                 Math.round((topics.length / 50) * 100), // optional logic
//                 100
//               ),
//             };
//           } else {
//             stats[subject.id] = { count: 0, progress: 0 };
//             console.log("fail")
//           }
//         } catch (error) {
//           console.error(`Error fetching ${subject.id}:`, error);
//           stats[subject.id] = { count: 0, progress: 0 };
//         }
//       })
//     );
//
//     setSubjectStats(stats);
//
//     await AsyncStorage.setItem(
//       CACHE_KEYS.SUBJECT_STATS,
//       JSON.stringify({
//         data: stats,
//         timestamp: Date.now(),
//       })
//     );
//   } catch (error) {
//     console.error("Error fetching subject stats:", error);
//   }
// }, []);
//
//
//   // Fetch User Statistics
//   const fetchUserStats = useCallback(async () => {
//     try {
//       const cached = await AsyncStorage.getItem(CACHE_KEYS.USER_STATS);
//       if (cached) {
//         const parsed = JSON.parse(cached);
//         if (Date.now() - parsed.timestamp < 300000) {
//           // 5 minutes cache
//           setUserStats(parsed.data);
//           return;
//         }
//       }
//
//       // Simulated stats - replace with actual API call
//       const stats: UserStats = {
//         topicsMastered: Math.floor(Math.random() * 100),
//         streak: Math.floor(Math.random() * 30),
//         overallProgress: Math.floor(Math.random() * 100),
//       };
//
//       setUserStats(stats);
//       await AsyncStorage.setItem(
//         CACHE_KEYS.USER_STATS,
//         JSON.stringify({
//           data: stats,
//           timestamp: Date.now(),
//         }),
//       );
//     } catch (err) {
//       console.error("Error fetching user stats:", err);
//     }
//   }, []);
//
//   // Load all data
//   const loadData = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//
//     try {
//       await Promise.all([
//         fetchTodayTopic(),
//         fetchSubjectStats(),
//         fetchUserStats(),
//       ]);
//     } catch (err) {
//       console.error("Error loading data:", err);
//       setError("Failed to load data. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   }, [fetchTodayTopic, fetchSubjectStats, fetchUserStats]);
//
//   // Pull to refresh
//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await AsyncStorage.multiRemove([
//       CACHE_KEYS.TODAY_TOPIC,
//       CACHE_KEYS.SUBJECT_STATS,
//       CACHE_KEYS.USER_STATS,
//     ]);
//     await loadData();
//     setRefreshing(false);
//   }, [loadData]);
//
//   // Initial load
//   useEffect(() => {
//     loadData();
//   }, []);
//
//   const getDifficultyColor = (difficulty: string) => {
//     switch (difficulty?.toLowerCase()) {
//       case "easy":
//         return "#10b981";
//       case "medium":
//         return "#f59e0b";
//       case "hard":
//         return "#ef4444";
//       default:
//         return "#6b7280";
//     }
//   };
//
//   const getSubjectStats = (subjectId: string) => {
//     return subjectStats[subjectId] || { count: 0, progress: 0 };
//   };
//
//   const statsData = [
//     {
//       label: "Topics Mastered",
//       value: userStats.topicsMastered.toString(),
//       icon: "trophy",
//       color: "#8b5cf6",
//     },
//     {
//       label: "Days Streak",
//       value: userStats.streak.toString(),
//       icon: "flame",
//       color: "#f59e0b",
//     },
//     {
//       label: "Progress",
//       value: `${userStats.overallProgress}%`,
//       icon: "trending-up",
//       color: "#10b981",
//     },
//   ];
//
//   if (loading && !refreshing) {
//     return (
//       <View style={styles.loadingContainer}>
//         <View style={styles.loadingContent}>
//           <View style={styles.loadingAnimation} />
//           <ThemedText type="title" style={styles.loadingText}>
//             Loading your dashboard...
//           </ThemedText>
//         </View>
//       </View>
//     );
//   }
//
//   return (
//       <SafeAreaView style={styles.safe}>
//     <View style={styles.container}>
//     <Header title="Home" />
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.scrollContent}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={["#6366f1"]}
//             tintColor="#6366f1"
//           />
//         }
//       >
//         {/* Header */}
//
//
//         {/* Error Message */}
//         {error && (
//           <View style={styles.errorContainer}>
//             <Ionicons name="alert-circle-outline" size={24} color="#ef4444" />
//             <ThemedText type="default" style={styles.errorText}>
//               {error}
//             </ThemedText>
//             <TouchableOpacity onPress={loadData}>
//               <ThemedText type="link" style={styles.retryText}>
//                 Retry
//               </ThemedText>
//             </TouchableOpacity>
//           </View>
//         )}
//
//         {/* Stats Overview */}
//
//
//         {/* Today's Lecture */}
//         <View style={styles.sectionHeader}>
//           <ThemedText type="title" style={styles.sectionTitle}>
//             Today's Lecture
//           </ThemedText>
//           {/*<Link href="/schedule" asChild>
//             <TouchableOpacity>
//               <ThemedText type="link" style={styles.seeAll}>
//                 View All
//               </ThemedText>
//             </TouchableOpacity>
//           </Link>*/}
//         </View>
//
//         {todayTopic ? (
//           <Link href={`/topic/${todayTopic._id}`} asChild>
//             <TouchableOpacity style={styles.todayCard}>
//               <LinearGradient
//                 colors={["#6366f1", "#8b5cf6"]}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 1 }}
//                 style={styles.todayCardGradient}
//               >
//                 <View style={styles.todayCardHeader}>
//                   <View style={styles.categoryBadge}>
//                     <ThemedText
//                       type="defaultSemiBold"
//                       style={styles.categoryText}
//                     >
//                       {todayTopic.category}
//                     </ThemedText>
//                   </View>
//                   <View
//                     style={[
//                       styles.difficultyBadge,
//                       {
//                         backgroundColor: `${getDifficultyColor(todayTopic.difficulty)}20`,
//                       },
//                     ]}
//                   >
//                     <ThemedText
//                       type="defaultSemiBold"
//                       style={[
//                         styles.difficultyText,
//                         { color: getDifficultyColor(todayTopic.difficulty) },
//                       ]}
//                     >
//                       {todayTopic.difficulty?.charAt(0).toUpperCase() +
//                         todayTopic.difficulty?.slice(1)}
//                     </ThemedText>
//                   </View>
//                 </View>
//
//                 <ThemedText type="title" style={styles.todayTitle}>
//                   {todayTopic.title}
//                 </ThemedText>
//
//                 <ThemedText
//                   type="default"
//                   style={styles.todayDescription}
//                   numberOfLines={2}
//                 >
//                   {todayTopic.descriptions?.[0]?.content ||
//                     "Start learning today's topic..."}
//                 </ThemedText>
//
//                 <View style={styles.todayCardFooter}>
//                   <View style={styles.timeInfo}>
//                     <Ionicons
//                       name="calendar-outline"
//                       size={16}
//                       color="rgba(255,255,255,0.8)"
//                     />
//                     <ThemedText type="default" style={styles.timeText}>
//                       {todayTopic.date
//                         ? new Date(todayTopic.date).toLocaleDateString("en-IN", {
//                             day: "2-digit",
//                             month: "short",
//                             year: "numeric",
//                           })
//                         : "Today"}
//                     </ThemedText>
//                   </View>
//
//                   <View style={styles.startButton}>
//                     <ThemedText
//                       type="defaultSemiBold"
//                       style={styles.startButtonText}
//                     >
//                       Start Now
//                     </ThemedText>
//                     <Ionicons name="arrow-forward" size={16} color="#fff" />
//                   </View>
//                 </View>
//               </LinearGradient>
//             </TouchableOpacity>
//           </Link>
//         ) : (
//           <TouchableOpacity
//             style={styles.emptyTodayCard}
//             onPress={fetchTodayTopic}
//           >
//             <Ionicons name="book-outline" size={48} color="#94a3b8" />
//             <ThemedText type="default" style={styles.emptyText}>
//               No lecture scheduled for today
//             </ThemedText>
//             <ThemedText type="link" style={styles.exploreText}>
//               Explore Topics
//             </ThemedText>
//           </TouchableOpacity>
//         )}
//
//         {/* Subjects */}
//         <View style={styles.sectionHeader}>
//           <ThemedText type="title" style={styles.sectionTitle}>
//             Subjects
//           </ThemedText>
//           <ThemedText type="default" style={styles.subjectCount}>
//             {SUBJECTS.length} subjects
//           </ThemedText>
//         </View>
//
//         <View style={styles.subjectsGrid}>
//           {SUBJECTS.map((subject) => {
//             const stats = getSubjectStats(subject.id);
//             return (
//               <Link
//                 href={{
//                   pathname: "/subject/[id]",
//                   params: { id: subject.id, name: subject.name },
//                 }}
//                 key={subject.id}
//                 asChild
//               >
//                 <TouchableOpacity style={styles.subjectCard}>
//                   <LinearGradient
//                     colors={subject.gradient}
//                     start={{ x: 0, y: 0 }}
//                     end={{ x: 1, y: 1 }}
//                     style={styles.subjectGradient}
//                   >
//                     <Ionicons
//                       name={subject.icon as any}
//                       size={32}
//                       color="#fff"
//                     />
//                     <ThemedText type="title" style={styles.subjectName}>
//                       {subject.name}
//                     </ThemedText>
//                     <ThemedText type="default" style={styles.subjectTopics}>
//                       {stats.count} Topics
//                     </ThemedText>
//
//                     {/* Progress bar
//                     <View style={styles.progressContainer}>
//                       <View style={styles.progressBackground}>
//                         <View
//                           style={[
//                             styles.progressFill,
//                             {
//                               width: `${stats.progress}%`,
//                               backgroundColor: "#fff",
//                             },
//                           ]}
//                         />
//                       </View>
//                       <ThemedText type="default" style={styles.progressText}>
//                         {stats.progress}%
//                       </ThemedText>
//                     </View>*/}
//                   </LinearGradient>
//                 </TouchableOpacity>
//               </Link>
//             );
//           })}
//         </View>
//
//
//       </ScrollView>
//     </View>
//     </SafeAreaView>
//   );
// }
//
// const styles = StyleSheet.create({
//     safe: { flex: 1, backgroundColor: 'green' },
//   container: {
//     flex: 1,
//     backgroundColor: "#f8fafc",
//   },
//   scrollContent: {
//     padding: 20,
//     paddingBottom: 40,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f8fafc",
//   },
//   loadingContent: {
//     alignItems: "center",
//   },
//   loadingAnimation: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: "#e2e8f0",
//     marginBottom: 16,
//   },
//   loadingText: {
//     fontSize: 16,
//     color: "#64748b",
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 24,
//   },
//   greeting: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#1e293b",
//   },
//   date: {
//     fontSize: 14,
//     color: "#64748b",
//     marginTop: 4,
//   },
//   profileButton: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: "#fff",
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   errorContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fef2f2",
//     padding: 12,
//     borderRadius: 12,
//     marginBottom: 16,
//     gap: 8,
//   },
//   errorText: {
//     flex: 1,
//     fontSize: 14,
//     color: "#dc2626",
//   },
//   retryText: {
//     fontSize: 14,
//     color: "#6366f1",
//     marginLeft: 8,
//   },
//   statsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 32,
//   },
//   statCard: {
//     flex: 1,
//     marginHorizontal: 4,
//     padding: 16,
//     borderRadius: 16,
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.2)",
//     backgroundColor: "#fff",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.05,
//     shadowRadius: 12,
//     elevation: 3,
//   },
//   statValue: {
//     fontSize: 24,
//     fontWeight: "700",
//     marginTop: 8,
//     color: "#1e293b",
//   },
//   statLabel: {
//     fontSize: 12,
//     color: "#64748b",
//     marginTop: 4,
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#1e293b",
//   },
//   seeAll: {
//     fontSize: 14,
//     color: "#6366f1",
//   },
//   subjectCount: {
//     fontSize: 14,
//     color: "#64748b",
//   },
//   todayCard: {
//     borderRadius: 20,
//     overflow: "hidden",
//     marginBottom: 32,
//     shadowColor: "#6366f1",
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.2,
//     shadowRadius: 16,
//     elevation: 8,
//   },
//   todayCardGradient: {
//     padding: 24,
//   },
//   todayCardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   categoryBadge: {
//     backgroundColor: "rgba(255,255,255,0.2)",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   categoryText: {
//     fontSize: 12,
//     color: "#fff",
//   },
//   difficultyBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   difficultyText: {
//     fontSize: 12,
//   },
//   todayTitle: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#fff",
//     marginBottom: 8,
//   },
//   todayDescription: {
//     fontSize: 14,
//     color: "rgba(255,255,255,0.9)",
//     marginBottom: 24,
//     lineHeight: 20,
//   },
//   todayCardFooter: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   timeInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//   },
//   timeText: {
//     fontSize: 14,
//     color: "rgba(255,255,255,0.8)",
//   },
//   startButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     backgroundColor: "rgba(255,255,255,0.2)",
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 12,
//   },
//   startButtonText: {
//     fontSize: 14,
//     color: "#fff",
//   },
//   emptyTodayCard: {
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     padding: 40,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 32,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.05,
//     shadowRadius: 12,
//     elevation: 3,
//   },
//   emptyText: {
//     fontSize: 16,
//     color: "#64748b",
//     marginTop: 12,
//     marginBottom: 16,
//   },
//   exploreText: {
//     fontSize: 14,
//     color: "#6366f1",
//   },
//   subjectsGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//     marginBottom: 32,
//   },
//   subjectCard: {
//     width: (width - 48) / 2,
//     height: 180,
//     marginBottom: 16,
//     borderRadius: 20,
//     overflow: "hidden",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 4,
//   },
//   subjectGradient: {
//     flex: 1,
//     padding: 16,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   subjectName: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#fff",
//     marginTop: 12,
//     marginBottom: 4,
//   },
//   subjectTopics: {
//     fontSize: 12,
//     color: "rgba(255,255,255,0.9)",
//     marginBottom: 12,
//   },
//   progressContainer: {
//     width: "100%",
//     alignItems: "center",
//     marginTop: 8,
//   },
//   progressBackground: {
//     width: "100%",
//     height: 4,
//     backgroundColor: "rgba(255,255,255,0.3)",
//     borderRadius: 2,
//     marginBottom: 4,
//   },
//   progressFill: {
//     height: "100%",
//     borderRadius: 2,
//   },
//   progressText: {
//     fontSize: 10,
//     color: "rgba(255,255,255,0.9)",
//   },
//   activityList: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 32,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   activityItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f1f5f9",
//   },
//   activityIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#f0fdf4",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },
//   activityContent: {
//     flex: 1,
//   },
//   activityTime: {
//     fontSize: 12,
//     color: "#64748b",
//     marginTop: 2,
//   },
//   actionsRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     gap: 12,
//   },
//   actionCard: {
//     flex: 1,
//     borderRadius: 16,
//     overflow: "hidden",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   actionGradient: {
//     padding: 20,
//     alignItems: "center",
//     justifyContent: "center",
//     height: 100,
//   },
//   actionText: {
//     fontSize: 13,
//     marginTop: 8,
//     color: "#334155",
//   },
// });

import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

// import Header from "@/components/Header";
import { ThemedText } from "@/components/themed-text";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { Link, useRouter } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// API Configuration5000
const API_BASE_URL = "https://oneserve.in";

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: [string, string];
}

interface TodayTopic {
  _id: string;
  title: string;
  category: string;
  difficulty: string;
  descriptions: { heading: string; content: string; images: string[] }[];
  animationUrl?: string;
  order: number;
}

const SUBJECTS: Subject[] = [
  {
    id: "OS",
    name: "OS",
    icon: "desktop-outline",
    color: "#6366f1",
    gradient: ["#6366f1", "#8b5cf6"],
  },
  {
    id: "DBMS",
    name: "DBMS",
    icon: "server-outline",
    color: "#10b981",
    gradient: ["#10b981", "#34d399"],
  },
  {
    id: "CN",
    name: "CN",
    icon: "wifi-outline",
    color: "#f59e0b",
    gradient: ["#f59e0b", "#fbbf24"],
  },
  {
    id: "OOPS",
    name: "OOPS",
    icon: "cube-outline",
    color: "#ef4444",
    gradient: ["#ef4444", "#f87171"],
  },
  {
    id: "DSA",
    name: "DSA",
    icon: "git-branch-outline",
    color: "#8b5cf6",
    gradient: ["#8b5cf6", "#a78bfa"],
  },
  {
    id: "APTITUDE",
    name: "Aptitude",
    icon: "calculator-outline",
    color: "#06b6d4",
    gradient: ["#06b6d4", "#22d3ee"],
  },
  {
    id: "INTERVIEW",
    name: "Interview",
    icon: "chatbubble-ellipses-outline",
    color: "#f97316",
    gradient: ["#f97316", "#fb923c"],
  },
];

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [todayTopic, setTodayTopic] = useState<TodayTopic | null>(null);
  const [subjectStats, setSubjectStats] = useState<
    Record<string, { count: number; progress: number }>
  >({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState(null);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        console.log("No token found");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/user/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("API error:", data);
        return;
      }

      console.log("Profile data:", data);
      setUserData(data);
      await AsyncStorage.setItem("streak", userData.streak);
    } catch (error) {
      console.log("Profile error:", error);
    }
  };

  // Fetch Today's Topic
  const fetchTodayTopic = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/topic/today`);
      if (response.data.success) {
        setTodayTopic(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching today topic:", err);
      setError("Failed to load today's lecture");
    }
  }, []);

  // Fetch Subject Statistics
  const fetchSubjectStats = useCallback(async () => {
    try {
      const stats: Record<string, { count: number; progress: number }> = {};

      await Promise.all(
        SUBJECTS.map(async (subject) => {
          try {
            const response = await fetch(
              `${API_BASE_URL}/topic/subject/${subject.id.toLowerCase()}`,
            );
            const json = await response.json();

            if (json.success) {
              const topics = json.data;
              stats[subject.id] = {
                count: topics.length,
                progress: Math.min(Math.round((topics.length / 50) * 100), 100),
              };
            } else {
              stats[subject.id] = { count: 0, progress: 0 };
            }
          } catch (error) {
            console.error(`Error fetching ${subject.id}:`, error);
            stats[subject.id] = { count: 0, progress: 0 };
          }
        }),
      );

      setSubjectStats(stats);
    } catch (error) {
      console.error("Error fetching subject stats:", error);
    }
  }, []);

  // Load all data

  const handleGroupDiscussion = () => {
    // Navigate to group discussion screen
    // If you have a specific screen for group discussions:
    router.push("/interviewquestion");

    // For now, show a placeholder alert
    //     Alert.alert(
    //       "Group Discussion",
    //       "This feature is coming soon! You'll be able to join study groups and discuss topics with peers.",
    //       [
    //         { text: "OK", style: "default" }
    //       ]
    //     );
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([fetchTodayTopic(), fetchSubjectStats()]);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [fetchTodayTopic, fetchSubjectStats]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    await fetchProfile();
    setRefreshing(false);
  }, [loadData]);

  // Initial load
  useEffect(() => {
    loadData();
    fetchProfile();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "#10b981";
      case "medium":
        return "#f59e0b";
      case "hard":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <View style={styles.loadingAnimation} />
          <ThemedText type="title" style={styles.loadingText}>
            Loading your dashboard...
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/*<Header title="Home" /> */}
        <View style={styles.header}>
          {/* Left: Stats Container */}
          <View style={styles.statsContainer}>
            {/* Streak */}
            <View style={styles.statItem}>
              <View style={styles.iconContainer}>
                <Text style={styles.fireIcon}>🔥</Text>
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>Streak</Text>
                <Text style={styles.statValue}>{userData?.streak || 0}d</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Points */}
            <View style={styles.statItem}>
              <View style={styles.iconContainer}>
                <Text style={styles.starIcon}>⭐</Text>
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>Points</Text>
                <Text style={styles.statValue}>{userData?.points || 0}</Text>
              </View>
            </View>
          </View>

          {/* Right: Action Buttons */}
          <View style={styles.actionsContainer}>
            {/* Group Discussion Button */}
            <TouchableOpacity
              onPress={handleGroupDiscussion}
              style={styles.groupButton}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="account-group"
                size={22}
                color="#7C3AED"
              />
              {/*   <Text style={styles.groupButtonText}></Text> */}
            </TouchableOpacity>

            {/* Profile Button
                <TouchableOpacity
                  onPress={() => router.push('/profile')}
                  style={styles.profileButton}
                  activeOpacity={0.7}
                >
                  <View style={styles.profileIcon}>
                    {userData?.name ? (
                      <Text style={styles.profileInitials}>
                        {userData.name.substring(0, 2).toUpperCase()}
                      </Text>
                    ) : (
                      <Ionicons name="person-outline" size={20} color="#fff" />
                    )}
                  </View>
                </TouchableOpacity>*/}
          </View>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#6366f1"]}
              tintColor="#6366f1"
            />
          }
        >
          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={24} color="#ef4444" />
              <ThemedText type="default" style={styles.errorText}>
                {error}
              </ThemedText>
              <TouchableOpacity onPress={loadData}>
                <ThemedText type="link" style={styles.retryText}>
                  Retry
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {/* Today's Lecture */}
          <View style={styles.sectionHeader}>
            <ThemedText type="title" style={styles.sectionTitle}>
              Today's Lecture
            </ThemedText>
          </View>

          {todayTopic ? (
            <Link href={`/topic/${todayTopic._id}`} asChild>
              <TouchableOpacity style={styles.todayCard}>
                <LinearGradient
                  colors={["#6366f1", "#8b5cf6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.todayCardGradient}
                >
                  <View style={styles.todayCardHeader}>
                    <View style={styles.categoryBadge}>
                      <ThemedText
                        type="defaultSemiBold"
                        style={styles.categoryText}
                      >
                        {todayTopic.category}
                      </ThemedText>
                    </View>
                    <View
                      style={[
                        styles.difficultyBadge,
                        {
                          backgroundColor: `${getDifficultyColor(todayTopic.difficulty)}20`,
                        },
                      ]}
                    >
                      <ThemedText
                        type="defaultSemiBold"
                        style={[
                          styles.difficultyText,
                          { color: getDifficultyColor(todayTopic.difficulty) },
                        ]}
                      >
                        {todayTopic.difficulty?.charAt(0).toUpperCase() +
                          todayTopic.difficulty?.slice(1)}
                      </ThemedText>
                    </View>
                  </View>

                  <ThemedText type="title" style={styles.todayTitle}>
                    {todayTopic.title}
                  </ThemedText>

                  <ThemedText
                    type="default"
                    style={styles.todayDescription}
                    numberOfLines={2}
                  >
                    {todayTopic.descriptions?.[0]?.content ||
                      "Start learning today's topic..."}
                  </ThemedText>

                  <View style={styles.todayCardFooter}>
                    <View style={styles.startButton}>
                      <ThemedText
                        type="defaultSemiBold"
                        style={styles.startButtonText}
                      >
                        Start Now
                      </ThemedText>
                      <Ionicons name="arrow-forward" size={16} color="#fff" />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Link>
          ) : (
            <TouchableOpacity
              style={styles.emptyTodayCard}
              onPress={fetchTodayTopic}
            >
              <Ionicons name="book-outline" size={48} color="#94a3b8" />
              <ThemedText type="default" style={styles.emptyText}>
                No lecture scheduled for today
              </ThemedText>
              <ThemedText type="link" style={styles.exploreText}>
                Explore Topics
              </ThemedText>
            </TouchableOpacity>
          )}

          {/* Subjects */}
          <View style={styles.sectionHeader}>
            <ThemedText type="title" style={styles.sectionTitle}>
              Subjects
            </ThemedText>
            <ThemedText type="default" style={styles.subjectCount}>
              {SUBJECTS.length} subjects
            </ThemedText>
          </View>

          <View style={styles.subjectsGrid}>
            {SUBJECTS.map((subject) => {
              const stats = subjectStats[subject.id] || {
                count: 0,
                progress: 0,
              };
              return (
                <Link
                  href={{
                    pathname: "/subject/[id]",
                    params: { id: subject.id, name: subject.name },
                  }}
                  key={subject.id}
                  asChild
                >
                  <TouchableOpacity style={styles.subjectCard}>
                    <LinearGradient
                      colors={subject.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.subjectGradient}
                    >
                      <Ionicons
                        name={subject.icon as any}
                        size={32}
                        color="#fff"
                      />
                      <ThemedText type="title" style={styles.subjectName}>
                        {subject.name}
                      </ThemedText>
                      <ThemedText type="default" style={styles.subjectTopics}>
                        {stats.count} Topics
                      </ThemedText>
                    </LinearGradient>
                  </TouchableOpacity>
                </Link>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "green" },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingAnimation: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e2e8f0",
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#64748b",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: "#dc2626",
  },
  retryText: {
    fontSize: 14,
    color: "#6366f1",
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },
  subjectCount: {
    fontSize: 14,
    color: "#64748b",
  },
  todayCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 32,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  todayCardGradient: {
    padding: 24,
  },
  todayCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: "#fff",
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
  },
  todayTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  todayDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 24,
    lineHeight: 20,
  },
  todayCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 14,
    color: "#fff",
  },
  emptyTodayCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 12,
    marginBottom: 16,
  },
  exploreText: {
    fontSize: 14,
    color: "#6366f1",
  },
  subjectsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  subjectCard: {
    width: (width - 48) / 2,
    height: 180,
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  subjectGradient: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  subjectName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginTop: 12,
    marginBottom: 4,
  },
  subjectTopics: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 8,
  },
  fireIcon: {
    fontSize: 20,
  },
  starIcon: {
    fontSize: 20,
    color: "#fbbf24",
  },
  statTextContainer: {
    marginRight: 12,
  },
  statLabel: {
    fontSize: 10,
    color: "#64748b",
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 8,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  groupButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F3FF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    gap: 6,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  groupButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7C3AED",
    marginTop: 1,
  },
  profileButton: {
    padding: 4,
  },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  profileInitials: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
