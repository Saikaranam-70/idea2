// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import React, { useState, useEffect, useRef } from "react";
// import {
//   Animated,
//   Dimensions,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   Easing,
//   ActivityIndicator,
//   RefreshControl
// } from "react-native";
// import { useRouter } from "expo-router";
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const { width, height } = Dimensions.get("window");

// // API helper function with token
// const fetchWithToken = async (url, options = {}) => {
//   const token = await AsyncStorage.getItem('token');

//   const headers = {
//     ...options.headers,
//     'Content-Type': 'application/json',
//     ...(token ? { 'Authorization': `Bearer ${token}` } : {})
//   };

//   const response = await fetch(url, {
//     ...options,
//     headers
//   });

//   if (!response.ok) {
//     throw new Error(`API error: ${response.status}`);
//   }

//   return response.json();
// };

// // Helper function to group topics by category
// const groupTopicsByCategory = (topics, readStatusMap = {}) => {
//   const categories = {};

//   topics.forEach(topic => {
//     if (!categories[topic.category]) {
//       categories[topic.category] = {
//         title: topic.category,
//         icon: getIconForCategory(topic.category),
//         topics: []
//       };
//     }

//     // Calculate completion for this topic
//     const isTopicRead = readStatusMap[topic._id] || false;
//     const totalSubtopics = topic.descriptions?.length || 0;

//     // Transform the API response to match our component's structure
//     const formattedTopic = {
//       name: topic.title,
//       subtopics: topic.descriptions?.map(desc => desc.heading) || [],
//       // Store the full topic data for navigation
//       fullTopic: topic,
//       isRead: isTopicRead,
//       totalSubtopics: totalSubtopics,
//       completedSubtopics: isTopicRead ? totalSubtopics : 0
//     };

//     categories[topic.category].topics.push(formattedTopic);
//   });

//   return Object.values(categories);
// };

// // Helper function to get icons for categories
// const getIconForCategory = (category) => {
//   const iconMap = {
//     "OS": "hardware-chip-outline",
//     "DBMS": "server-outline",
//     "CN": "globe-outline",
//     "OOPS": "cube-outline",
//     "SQL": "document-text-outline",
//     "COA": "settings-outline"
//   };

//   return iconMap[category] || "help-circle-outline";
// };

// const TopicCard = ({ section, index, isExpanded, onToggle, topicReadStatus, onMarkAsRead }) => {
//   const [selectedTopic, setSelectedTopic] = useState(null);
//   const cardAnim = useRef(new Animated.Value(0)).current;
//   const rotateAnim = useRef(new Animated.Value(0)).current;
//   const router = useRouter();

//   useEffect(() => {
//     Animated.spring(cardAnim, {
//       toValue: isExpanded ? 1 : 0,
//       tension: 50,
//       friction: 7,
//       useNativeDriver: true,
//     }).start();

//     Animated.spring(rotateAnim, {
//       toValue: isExpanded ? 1 : 0,
//       tension: 50,
//       friction: 7,
//       useNativeDriver: true,
//     }).start();
//   }, [isExpanded]);

//   const cardScale = cardAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [1, 1.02],
//   });

//   const rotate = rotateAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: ["0deg", "180deg"],
//   });

//   const handleTopicPress = (topicIndex) => {
//     setSelectedTopic(selectedTopic === topicIndex ? null : topicIndex);
//   };

//   const handleSubtopicPress = async (subtopicIndex, topicId) => {
//     // First mark as read if not already read
//     if (onMarkAsRead && topicId) {
//       await onMarkAsRead(topicId);
//     }

//     // Then navigate to the topic
//     if (selectedTopic !== null) {
//       const topic = section.topics[selectedTopic];
//       if (topic && topic.fullTopic) {
//         router.push(`/topic/${topic.fullTopic._id}`);
//       }
//     }
//   };

//   // Calculate completion percentage for this section
//   const calculateSectionProgress = () => {
//     const totalSubtopics = section.topics.reduce((acc, topic) => acc + topic.totalSubtopics, 0);
//     const completedSubtopics = section.topics.reduce((acc, topic) => acc + topic.completedSubtopics, 0);
//     return totalSubtopics > 0 ? (completedSubtopics / totalSubtopics) * 100 : 0;
//   };

//   const sectionProgress = calculateSectionProgress();

//   return (
//     <Animated.View
//       style={[
//         styles.cardWrapper,
//         {
//           transform: [{ scale: cardScale }],
//         },
//       ]}
//     >
//       <LinearGradient
//         colors={["#1A1F38", "#2D3748", "#1E293B"]}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={styles.card}
//       >
//         <TouchableOpacity onPress={onToggle} activeOpacity={0.8}>
//           <View style={styles.cardHeader}>
//             <View style={styles.titleContainer}>
//               <View style={[
//                 styles.iconContainer,
//                 sectionProgress === 100 && styles.iconContainerCompleted
//               ]}>
//                 <Ionicons
//                   name={section.icon}
//                   size={28}
//                   color={sectionProgress === 100 ? "#81C784" : "#64B5F6"}
//                 />
//                 {sectionProgress === 100 && (
//                   <View style={styles.completedBadge}>
//                     <Ionicons name="checkmark" size={12} color="#FFF" />
//                   </View>
//                 )}
//               </View>
//               <View style={styles.titleContent}>
//                 <View style={styles.titleRow}>
//                   <Text style={styles.cardTitle}>{section.title}</Text>
//                   <Text style={styles.sectionProgress}>
//                     {Math.round(sectionProgress)}%
//                   </Text>
//                 </View>
//                 <Text style={styles.topicCount}>
//                   {section.topics.length} Topics • {section.topics.reduce((acc, t) => acc + t.subtopics.length, 0)} Subtopics
//                 </Text>
//               </View>
//             </View>
//             <Animated.View style={{ transform: [{ rotate }] }}>
//               <Ionicons name="chevron-down" size={28} color="#CBD5E0" />
//             </Animated.View>
//           </View>
//         </TouchableOpacity>

//         <Animated.View
//           style={[
//             styles.expandableContent,
//             {
//               maxHeight: cardAnim.interpolate({
//                 inputRange: [0, 1],
//                 outputRange: [0, 600],
//               }),
//               opacity: cardAnim,
//             },
//           ]}
//         >
//           {isExpanded && (
//             <View style={styles.contentInner}>
//               <View style={styles.sectionProgressContainer}>
//                 <View style={styles.progressBar}>
//                   <View
//                     style={[
//                       styles.progressFill,
//                       { width: `${sectionProgress}%` }
//                     ]}
//                   />
//                 </View>
//                 <Text style={styles.progressText}>
//                   {Math.round(sectionProgress)}% Complete
//                 </Text>
//               </View>

//               <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topicsScroll}>
//                 {section.topics.map((topic, topicIndex) => (
//                   <TouchableOpacity
//                     key={topicIndex}
//                     style={[
//                       styles.topicChip,
//                       selectedTopic === topicIndex && styles.topicChipActive,
//                       topic.isRead && styles.topicChipRead,
//                     ]}
//                     onPress={() => handleTopicPress(topicIndex)}
//                     activeOpacity={0.7}
//                   >
//                     <View style={styles.topicNumberContainer}>
//                       <Text style={[
//                         styles.topicNumber,
//                         topic.isRead && styles.topicNumberRead
//                       ]}>
//                         0{topicIndex + 1}
//                       </Text>
//                       {topic.isRead && (
//                         <Ionicons name="checkmark-circle" size={14} color="#81C784" style={styles.topicCheckmark} />
//                       )}
//                     </View>
//                     <Text style={[
//                       styles.topicText,
//                       selectedTopic === topicIndex && styles.topicTextActive,
//                       topic.isRead && styles.topicTextRead
//                     ]}>
//                       {topic.name}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </ScrollView>

//               {selectedTopic !== null && (
//                 <Animated.View style={styles.subtopicsContainer}>
//                   <View style={styles.subtopicsHeader}>
//                     <View style={styles.subtopicTitleContainer}>
//                       <View style={[
//                         styles.subtopicIcon,
//                         section.topics[selectedTopic].isRead && styles.subtopicIconCompleted
//                       ]}>
//                         <Ionicons
//                           name="bookmarks-outline"
//                           size={20}
//                           color={section.topics[selectedTopic].isRead ? "#81C784" : "#81C784"}
//                         />
//                       </View>
//                       <View>
//                         <Text style={styles.subtopicsTitle}>
//                           {section.topics[selectedTopic].name}
//                         </Text>
//                         <Text style={styles.subtopicProgress}>
//                           {section.topics[selectedTopic].completedSubtopics} of {section.topics[selectedTopic].totalSubtopics} subtopics completed
//                         </Text>
//                       </View>
//                     </View>
//                     {section.topics[selectedTopic].isRead ? (
//                       <View style={styles.readBadge}>
//                         <Ionicons name="checkmark-circle" size={20} color="#81C784" />
//                         <Text style={styles.readText}>Completed</Text>
//                       </View>
//                     ) : (
//                       <TouchableOpacity
//                         style={styles.markAsReadButton}
//                         onPress={() => onMarkAsRead && onMarkAsRead(section.topics[selectedTopic].fullTopic._id)}
//                       >
//                         <Text style={styles.markAsReadText}>Mark as Read</Text>
//                       </TouchableOpacity>
//                     )}
//                   </View>

//                   <View style={styles.subtopicsGrid}>
//                     {section.topics[selectedTopic].subtopics.map(
//                       (subtopic, idx) => (
//                         <TouchableOpacity
//                           key={idx}
//                           style={styles.subtopicChip}
//                           onPress={() => handleSubtopicPress(idx, section.topics[selectedTopic].fullTopic._id)}
//                           activeOpacity={0.8}
//                         >
//                           <View style={styles.subtopicLeft}>
//                             <View style={[
//                               styles.checkbox,
//                               section.topics[selectedTopic].isRead && styles.checkboxCompleted
//                             ]}>
//                               {section.topics[selectedTopic].isRead && (
//                                 <Ionicons name="checkmark" size={12} color="#4FC3F7" />
//                               )}
//                             </View>
//                             <Text style={[
//                               styles.subtopicText,
//                               section.topics[selectedTopic].isRead && styles.subtopicTextCompleted
//                             ]}>
//                               {subtopic}
//                             </Text>
//                           </View>
//                           <TouchableOpacity
//                             style={styles.playButton}
//                             onPress={() => handleSubtopicPress(idx, section.topics[selectedTopic].fullTopic._id)}
//                           >
//                             <Ionicons name="play-circle" size={22} color="#4FC3F7" />
//                           </TouchableOpacity>
//                         </TouchableOpacity>
//                       )
//                     )}
//                   </View>
//                 </Animated.View>
//               )}
//             </View>
//           )}
//         </Animated.View>
//       </LinearGradient>
//     </Animated.View>
//   );
// };

// export default function CoreRoadmap() {
//   const [expandedIndex, setExpandedIndex] = useState(0);
//   const [progress, setProgress] = useState(0);
//   const [roadmapData, setRoadmapData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [readStatusMap, setReadStatusMap] = useState({});
//   const [refreshing, setRefreshing] = useState(false);
//   const scrollViewRef = useRef();
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     fetchRoadmapData();
//   }, []);

//   const fetchRoadmapData = async () => {
//     try {
//       setLoading(true);

//       // Fetch topics data
//       const topicsResponse = await fetchWithToken('https://m6sqbdzm-5000.inc1.devtunnels.ms/user/topics-order');

//       if (!topicsResponse.success) {
//         throw new Error('Failed to fetch topics');
//       }

//       // Fetch read status
//       let readStatus = {};
//       try {
//         const readStatusResponse = await fetchWithToken('https://m6sqbdzm-5000.inc1.devtunnels.ms/user/topic-read-status');
//         readStatus = readStatusResponse;
//       } catch (err) {
//         console.warn('Could not fetch read status:', err);
//       }

//       setReadStatusMap(readStatus);

//       // Group topics by category with read status
//       const groupedData = groupTopicsByCategory(topicsResponse.data, readStatus);
//       setRoadmapData(groupedData);

//       // Calculate overall progress
//       const totalTopics = topicsResponse.data.length;
//       const completedTopics = Object.values(readStatus).filter(status => status).length;
//       const calculatedProgress = totalTopics > 0 ? completedTopics / totalTopics : 0;
//       setProgress(calculatedProgress);

//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 1000,
//         useNativeDriver: true,
//       }).start();
//     } catch (err) {
//       setError('Error connecting to server: ' + err.message);
//       console.error('Error fetching roadmap:', err);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const markTopicAsRead = async (topicId) => {
//     try {
//       // Call your API endpoint to mark topic as read
//       const response = await fetchWithToken('https://m6sqbdzm-5000.inc1.devtunnels.ms/user/mark-topic-read', {
//         method: 'POST',
//         body: JSON.stringify({ topicId })
//       });

//       if (response.success) {
//         // Update local state
//         setReadStatusMap(prev => ({
//           ...prev,
//           [topicId]: true
//         }));

//         // Refresh data
//         await fetchRoadmapData();
//       }
//     } catch (err) {
//       console.error('Error marking topic as read:', err);
//     }
//   };

//   const handleCardToggle = (index) => {
//     setExpandedIndex(expandedIndex === index ? -1 : index);
//     setTimeout(() => {
//       scrollViewRef.current?.scrollTo({
//         y: index * 200,
//         animated: true,
//       });
//     }, 100);
//   };

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchRoadmapData();
//   };

//   // Calculate statistics
//   const totalTopics = roadmapData.reduce((acc, section) => acc + section.topics.length, 0);
//   const totalSubtopics = roadmapData.reduce((acc, section) =>
//     acc + section.topics.reduce((topicAcc, topic) =>
//       topicAcc + topic.totalSubtopics, 0
//     ), 0
//   );
//   const completedTopics = roadmapData.reduce((acc, section) =>
//     acc + section.topics.filter(topic => topic.isRead).length, 0
//   );

//   if (loading && !refreshing) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4FC3F7" />
//         <Text style={styles.loadingText}>Loading Roadmap...</Text>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.errorContainer}>
//         <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
//         <Text style={styles.errorText}>{error}</Text>
//         <TouchableOpacity style={styles.retryButton} onPress={fetchRoadmapData}>
//           <Text style={styles.retryButtonText}>Retry</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Animated.View
//         style={[styles.headerGradient, { opacity: fadeAnim }]}
//       >
//         <LinearGradient
//           colors={["#0F172A", "#1E293B", "#0F172A"]}
//           style={styles.headerGradientInner}
//         >
//           <View style={styles.header}>
//             <View>
//               <Text style={styles.heading}>Core CS Journey</Text>
//               <Text style={styles.subHeading}>
//                 Track your learning progress
//               </Text>
//             </View>
//           </View>

//           <View style={styles.progressContainer}>
//             <View style={styles.progressInfo}>
//               <Text style={styles.progressText}>Overall Progress</Text>
//               <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
//             </View>
//             <View style={styles.progressBarLarge}>
//               <View
//                 style={[
//                   styles.progressFillLarge,
//                   { width: `${progress * 100}%` }
//                 ]}
//               />
//             </View>
//           </View>

//           <View style={styles.statsContainer}>
//             <View style={styles.stat}>
//               <Text style={styles.statNumber}>{completedTopics}/{totalTopics}</Text>
//               <Text style={styles.statLabel}>Topics Done</Text>
//             </View>
//             <View style={styles.stat}>
//               <Text style={styles.statNumber}>{roadmapData.length}</Text>
//               <Text style={styles.statLabel}>Domains</Text>
//             </View>
//             <View style={styles.stat}>
//               <Text style={styles.statNumber}>{totalSubtopics}</Text>
//               <Text style={styles.statLabel}>Subtopics</Text>
//             </View>
//           </View>
//         </LinearGradient>
//       </Animated.View>

//       <ScrollView
//         ref={scrollViewRef}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={["#4FC3F7"]}
//             tintColor="#4FC3F7"
//           />
//         }
//       >
//         <View style={styles.roadmapContainer}>
//           {roadmapData.map((section, index) => (
//             <React.Fragment key={index}>
//               <View style={styles.sectionMarker}>
//                 <View style={styles.markerLine} />
//                 <View style={[
//                   styles.markerDot,
//                   index <= expandedIndex && styles.markerDotActive
//                 ]}>
//                   <Text style={styles.markerText}>{index + 1}</Text>
//                 </View>
//                 <View style={styles.markerLine} />
//               </View>
//               <TopicCard
//                 section={section}
//                 index={index}
//                 isExpanded={expandedIndex === index}
//                 onToggle={() => handleCardToggle(index)}
//                 topicReadStatus={readStatusMap}
//                 onMarkAsRead={markTopicAsRead}
//               />
//             </React.Fragment>
//           ))}
//         </View>
//         <View style={styles.bottomSpacing} />
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#0F172A",
//   },
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: "#0F172A",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     color: "#CBD5E0",
//     fontSize: 16,
//     marginTop: 20,
//   },
//   errorContainer: {
//     flex: 1,
//     backgroundColor: "#0F172A",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   errorText: {
//     color: "#F44336",
//     fontSize: 18,
//     textAlign: "center",
//     marginTop: 20,
//     marginBottom: 30,
//   },
//   retryButton: {
//     backgroundColor: "#4FC3F7",
//     paddingHorizontal: 30,
//     paddingVertical: 12,
//     borderRadius: 25,
//   },
//   retryButtonText: {
//     color: "#FFF",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   headerGradient: {
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     overflow: 'hidden',
//   },
//   headerGradientInner: {
//     paddingTop: 60,
//     paddingBottom: 30,
//     paddingHorizontal: 20,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   heading: {
//     fontSize: 36,
//     fontWeight: "800",
//     color: "#FFF",
//     letterSpacing: -0.5,
//   },
//   subHeading: {
//     fontSize: 16,
//     color: "#94A3B8",
//     marginTop: 4,
//   },
//   progressContainer: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 20,
//     padding: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   progressInfo: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   progressText: {
//     fontSize: 14,
//     color: "#CBD5E0",
//   },
//   progressPercent: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#4FC3F7",
//   },
//   progressBarLarge: {
//     height: 6,
//     backgroundColor: "rgba(255,255,255,0.1)",
//     borderRadius: 3,
//     overflow: "hidden",
//   },
//   progressFillLarge: {
//     height: "100%",
//     backgroundColor: "#4FC3F7",
//     borderRadius: 3,
//   },
//   statsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 20,
//     padding: 15,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   stat: {
//     alignItems: "center",
//   },
//   statNumber: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#64B5F6",
//   },
//   statLabel: {
//     fontSize: 12,
//     color: "#CBD5E0",
//     marginTop: 4,
//   },
//   scrollContent: {
//     paddingBottom: 120,
//   },
//   roadmapContainer: {
//     padding: 20,
//   },
//   sectionMarker: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 10,
//   },
//   markerLine: {
//     flex: 1,
//     height: 1,
//     backgroundColor: "rgba(100, 181, 246, 0.2)",
//   },
//   markerDot: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: "#334155",
//     alignItems: "center",
//     justifyContent: "center",
//     marginHorizontal: 15,
//     borderWidth: 2,
//     borderColor: "transparent",
//   },
//   markerDotActive: {
//     backgroundColor: "#1E293B",
//     borderColor: "#4FC3F7",
//   },
//   markerText: {
//     color: "#CBD5E0",
//     fontSize: 12,
//     fontWeight: "600",
//   },
//   cardWrapper: {
//     marginBottom: 20,
//   },
//   card: {
//     borderRadius: 28,
//     padding: 24,
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 15,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 25,
//     elevation: 15,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.05)",
//   },
//   cardHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   titleContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//   },
//   titleContent: {
//     flex: 1,
//   },
//   titleRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   iconContainer: {
//     width: 52,
//     height: 52,
//     borderRadius: 26,
//     backgroundColor: "rgba(100, 181, 246, 0.1)",
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 16,
//     borderWidth: 1,
//     borderColor: "rgba(100, 181, 246, 0.2)",
//     position: 'relative',
//   },
//   iconContainerCompleted: {
//     backgroundColor: "rgba(129, 199, 132, 0.1)",
//     borderColor: "rgba(129, 199, 132, 0.3)",
//   },
//   completedBadge: {
//     position: 'absolute',
//     top: -5,
//     right: -5,
//     backgroundColor: '#81C784',
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 2,
//     borderColor: '#1E293B',
//   },
//   cardTitle: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#FFF",
//     letterSpacing: -0.3,
//     flex: 1,
//   },
//   sectionProgress: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#4FC3F7",
//     marginLeft: 10,
//   },
//   topicCount: {
//     fontSize: 12,
//     color: "#94A3B8",
//     marginTop: 2,
//   },
//   expandableContent: {
//     overflow: "hidden",
//   },
//   contentInner: {
//     paddingTop: 20,
//   },
//   sectionProgressContainer: {
//     marginBottom: 20,
//   },
//   progressBar: {
//     height: 4,
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 2,
//     overflow: "hidden",
//     marginBottom: 8,
//   },
//   progressFill: {
//     height: "100%",
//     backgroundColor: "#4FC3F7",
//     borderRadius: 2,
//   },
//   progressText: {
//     fontSize: 12,
//     color: "#94A3B8",
//     textAlign: 'center',
//   },
//   topicsScroll: {
//     marginBottom: 20,
//   },
//   topicChip: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(255,255,255,0.05)",
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 25,
//     marginRight: 12,
//     borderWidth: 1,
//     borderColor: "transparent",
//   },
//   topicChipActive: {
//     backgroundColor: "rgba(79, 195, 247, 0.15)",
//     borderColor: "#4FC3F7",
//   },
//   topicChipRead: {
//     backgroundColor: "rgba(129, 199, 132, 0.1)",
//     borderColor: "rgba(129, 199, 132, 0.3)",
//   },
//   topicNumberContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   topicNumber: {
//     fontSize: 10,
//     color: "#94A3B8",
//     marginRight: 8,
//   },
//   topicNumberRead: {
//     color: "#81C784",
//   },
//   topicCheckmark: {
//     marginRight: 6,
//   },
//   topicText: {
//     color: "#E2E8F0",
//     fontSize: 14,
//     fontWeight: "500",
//   },
//   topicTextActive: {
//     color: "#4FC3F7",
//     fontWeight: "600",
//   },
//   topicTextRead: {
//     color: "#81C784",
//   },
//   subtopicsContainer: {
//     backgroundColor: "rgba(15, 23, 42, 0.9)",
//     borderRadius: 24,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.05)",
//   },
//   subtopicsHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   subtopicTitleContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//   },
//   subtopicIcon: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: "rgba(129, 199, 132, 0.1)",
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 12,
//     borderWidth: 1,
//     borderColor: "rgba(129, 199, 132, 0.2)",
//   },
//   subtopicIconCompleted: {
//     backgroundColor: "rgba(129, 199, 132, 0.2)",
//     borderColor: "rgba(129, 199, 132, 0.4)",
//   },
//   subtopicsTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#FFF",
//   },
//   subtopicProgress: {
//     fontSize: 12,
//     color: "#94A3B8",
//     marginTop: 2,
//   },
//   readBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(129, 199, 132, 0.1)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: 'rgba(129, 199, 132, 0.3)',
//   },
//   readText: {
//     color: '#81C784',
//     fontSize: 12,
//     fontWeight: '600',
//     marginLeft: 6,
//   },
//   markAsReadButton: {
//     backgroundColor: 'rgba(79, 195, 247, 0.1)',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: 'rgba(79, 195, 247, 0.3)',
//   },
//   markAsReadText: {
//     color: '#4FC3F7',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   subtopicsGrid: {
//     marginBottom: 20,
//   },
//   subtopicChip: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     backgroundColor: "rgba(255,255,255,0.03)",
//     padding: 16,
//     borderRadius: 16,
//     marginBottom: 10,
//   },
//   subtopicLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//   },
//   checkbox: {
//     width: 20,
//     height: 20,
//     borderRadius: 6,
//     borderWidth: 2,
//     borderColor: "#4FC3F7",
//     marginRight: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   checkboxCompleted: {
//     borderColor: "#81C784",
//     backgroundColor: "rgba(129, 199, 132, 0.1)",
//   },
//   subtopicText: {
//     flex: 1,
//     color: "#E2E8F0",
//     fontSize: 14,
//   },
//   subtopicTextCompleted: {
//     color: "#81C784",
//     textDecorationLine: 'line-through',
//   },
//   playButton: {
//     padding: 4,
//   },
//   bottomSpacing: {
//     height: 0,
//   },
// });

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

// API helper function with token
const fetchWithToken = async (url, options = {}) => {
  const token = await AsyncStorage.getItem("token");

  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
};

// Helper function to group topics by category
const groupTopicsByCategory = (topics, readStatusMap = {}) => {
  const categories = {};

  topics.forEach((topic) => {
    if (!categories[topic.category]) {
      categories[topic.category] = {
        title: topic.category,
        icon: getIconForCategory(topic.category),
        topics: [],
      };
    }

    // Calculate completion for this topic
    const isTopicRead = readStatusMap[topic._id] || false;
    const totalSubtopics = topic.descriptions?.length || 0;

    // Transform the API response to match our component's structure
    const formattedTopic = {
      name: topic.title,
      subtopics: topic.descriptions?.map((desc) => desc.heading) || [],
      // Store the full topic data for navigation
      fullTopic: topic,
      isRead: isTopicRead,
      totalSubtopics: totalSubtopics,
      completedSubtopics: isTopicRead ? totalSubtopics : 0,
    };

    categories[topic.category].topics.push(formattedTopic);
  });

  return Object.values(categories);
};

// Helper function to get icons for categories
const getIconForCategory = (category) => {
  const iconMap = {
    OS: "hardware-chip-outline",
    DBMS: "server-outline",
    CN: "globe-outline",
    OOPS: "cube-outline",
    SQL: "document-text-outline",
    COA: "settings-outline",
  };

  return iconMap[category] || "help-circle-outline";
};

const TopicCard = ({
  section,
  index,
  isExpanded,
  onToggle,
  topicReadStatus,
  onMarkAsRead,
}) => {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const cardAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: isExpanded ? 1 : 0,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    Animated.spring(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Animate content opacity
    Animated.timing(contentAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isExpanded]);

  const cardScale = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const handleTopicPress = (topicIndex) => {
    setSelectedTopic(selectedTopic === topicIndex ? null : topicIndex);
  };

  const handleSubtopicPress = async (subtopicIndex, topicId) => {
    // First mark as read if not already read
    if (onMarkAsRead && topicId) {
      await onMarkAsRead(topicId);
    }

    // Then navigate to the topic
    if (selectedTopic !== null) {
      const topic = section.topics[selectedTopic];
      if (topic && topic.fullTopic) {
        router.push(`/topic/${topic.fullTopic._id}`);
      }
    }
  };

  // Calculate completion percentage for this section
  const calculateSectionProgress = () => {
    const totalSubtopics = section.topics.reduce(
      (acc, topic) => acc + topic.totalSubtopics,
      0,
    );
    const completedSubtopics = section.topics.reduce(
      (acc, topic) => acc + topic.completedSubtopics,
      0,
    );
    return totalSubtopics > 0 ? (completedSubtopics / totalSubtopics) * 100 : 0;
  };

  const sectionProgress = calculateSectionProgress();

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          transform: [{ scale: cardScale }],
        },
      ]}
    >
      <LinearGradient
        colors={["#1A1F38", "#2D3748", "#1E293B"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <TouchableOpacity onPress={onToggle} activeOpacity={0.8}>
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <View
                style={[
                  styles.iconContainer,
                  sectionProgress === 100 && styles.iconContainerCompleted,
                ]}
              >
                <Ionicons
                  name={section.icon}
                  size={28}
                  color={sectionProgress === 100 ? "#81C784" : "#64B5F6"}
                />
                {sectionProgress === 100 && (
                  <View style={styles.completedBadge}>
                    <Ionicons name="checkmark" size={12} color="#FFF" />
                  </View>
                )}
              </View>
              <View style={styles.titleContent}>
                <View style={styles.titleRow}>
                  <Text style={styles.cardTitle}>{section.title}</Text>
                  <Text style={styles.sectionProgress}>
                    {Math.round(sectionProgress)}%
                  </Text>
                </View>
                <Text style={styles.topicCount}>
                  {section.topics.length} Topics •{" "}
                  {section.topics.reduce(
                    (acc, t) => acc + t.subtopics.length,
                    0,
                  )}{" "}
                  Subtopics
                </Text>
              </View>
            </View>
            <Animated.View style={{ transform: [{ rotate }] }}>
              <Ionicons name="chevron-down" size={28} color="#CBD5E0" />
            </Animated.View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <Animated.View
            style={[
              styles.expandableContent,
              {
                opacity: contentAnim,
              },
            ]}
          >
            <View style={styles.contentInner}>
              <View style={styles.sectionProgressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${sectionProgress}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(sectionProgress)}% Complete
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.topicsScroll}
              >
                {section.topics.map((topic, topicIndex) => (
                  <TouchableOpacity
                    key={topicIndex}
                    style={[
                      styles.topicChip,
                      selectedTopic === topicIndex && styles.topicChipActive,
                      topic.isRead && styles.topicChipRead,
                    ]}
                    onPress={() => handleTopicPress(topicIndex)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.topicNumberContainer}>
                      <Text
                        style={[
                          styles.topicNumber,
                          topic.isRead && styles.topicNumberRead,
                        ]}
                      >
                        0{topicIndex + 1}
                      </Text>
                      {topic.isRead && (
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color="#81C784"
                          style={styles.topicCheckmark}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.topicText,
                        selectedTopic === topicIndex && styles.topicTextActive,
                        topic.isRead && styles.topicTextRead,
                      ]}
                    >
                      {topic.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {selectedTopic !== null && (
                <Animated.View
                  style={[styles.subtopicsContainer, { opacity: contentAnim }]}
                >
                  <View style={styles.subtopicsHeader}>
                    <View style={styles.subtopicTitleContainer}>
                      <View
                        style={[
                          styles.subtopicIcon,
                          section.topics[selectedTopic].isRead &&
                            styles.subtopicIconCompleted,
                        ]}
                      >
                        <Ionicons
                          name="bookmarks-outline"
                          size={20}
                          color={
                            section.topics[selectedTopic].isRead
                              ? "#81C784"
                              : "#81C784"
                          }
                        />
                      </View>
                      <View>
                        <Text style={styles.subtopicsTitle}>
                          {section.topics[selectedTopic].name}
                        </Text>
                        <Text style={styles.subtopicProgress}>
                          {section.topics[selectedTopic].completedSubtopics} of{" "}
                          {section.topics[selectedTopic].totalSubtopics}{" "}
                          subtopics completed
                        </Text>
                      </View>
                    </View>
                    {section.topics[selectedTopic].isRead ? (
                      <View style={styles.readBadge}>
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#81C784"
                        />
                        <Text style={styles.readText}>Completed</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.markAsReadButton}
                        onPress={() =>
                          onMarkAsRead &&
                          onMarkAsRead(
                            section.topics[selectedTopic].fullTopic._id,
                          )
                        }
                      >
                        <Text style={styles.markAsReadText}>Mark as Read</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.subtopicsGrid}>
                    {section.topics[selectedTopic].subtopics.map(
                      (subtopic, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={styles.subtopicChip}
                          onPress={() =>
                            handleSubtopicPress(
                              idx,
                              section.topics[selectedTopic].fullTopic._id,
                            )
                          }
                          activeOpacity={0.8}
                        >
                          <View style={styles.subtopicLeft}>
                            <View
                              style={[
                                styles.checkbox,
                                section.topics[selectedTopic].isRead &&
                                  styles.checkboxCompleted,
                              ]}
                            >
                              {section.topics[selectedTopic].isRead && (
                                <Ionicons
                                  name="checkmark"
                                  size={12}
                                  color="#4FC3F7"
                                />
                              )}
                            </View>
                            <Text
                              style={[
                                styles.subtopicText,
                                section.topics[selectedTopic].isRead &&
                                  styles.subtopicTextCompleted,
                              ]}
                            >
                              {subtopic}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={styles.playButton}
                            onPress={() =>
                              handleSubtopicPress(
                                idx,
                                section.topics[selectedTopic].fullTopic._id,
                              )
                            }
                          >
                            <Ionicons
                              name="play-circle"
                              size={22}
                              color="#4FC3F7"
                            />
                          </TouchableOpacity>
                        </TouchableOpacity>
                      ),
                    )}
                  </View>
                </Animated.View>
              )}
            </View>
          </Animated.View>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

export default function CoreRoadmap() {
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [roadmapData, setRoadmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readStatusMap, setReadStatusMap] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchRoadmapData();
  }, []);

  const fetchRoadmapData = async () => {
    try {
      setLoading(true);

      // Fetch topics data
      const topicsResponse = await fetchWithToken(
        "https://oneserve.in/user/topics-order",
      );

      if (!topicsResponse.success) {
        throw new Error("Failed to fetch topics");
      }

      // Fetch read status
      let readStatus = {};
      try {
        const readStatusResponse = await fetchWithToken(
          "https://oneserve.in/user/topic-read-status",
        );
        readStatus = readStatusResponse;
      } catch (err) {
        console.warn("Could not fetch read status:", err);
      }

      setReadStatusMap(readStatus);

      // Group topics by category with read status
      const groupedData = groupTopicsByCategory(
        topicsResponse.data,
        readStatus,
      );
      setRoadmapData(groupedData);

      // Calculate overall progress
      const totalTopics = topicsResponse.data.length;
      const completedTopics = Object.values(readStatus).filter(
        (status) => status,
      ).length;
      const calculatedProgress =
        totalTopics > 0 ? completedTopics / totalTopics : 0;
      setProgress(calculatedProgress);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      setError("Error connecting to server: " + err.message);
      console.error("Error fetching roadmap:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markTopicAsRead = async (topicId) => {
    try {
      // Call your API endpoint to mark topic as read
      const response = await fetchWithToken(
        "https://oneserve.in/user/mark-topic-read",
        {
          method: "POST",
          body: JSON.stringify({ topicId }),
        },
      );

      if (response.success) {
        // Update local state
        setReadStatusMap((prev) => ({
          ...prev,
          [topicId]: true,
        }));

        // Refresh data
        await fetchRoadmapData();
      }
    } catch (err) {
      console.error("Error marking topic as read:", err);
    }
  };

  const handleCardToggle = (index) => {
    setExpandedIndex(expandedIndex === index ? -1 : index);
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: index * 200,
        animated: true,
      });
    }, 100);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRoadmapData();
  };

  // Calculate statistics
  const totalTopics = roadmapData.reduce(
    (acc, section) => acc + section.topics.length,
    0,
  );
  const totalSubtopics = roadmapData.reduce(
    (acc, section) =>
      acc +
      section.topics.reduce(
        (topicAcc, topic) => topicAcc + topic.totalSubtopics,
        0,
      ),
    0,
  );
  const completedTopics = roadmapData.reduce(
    (acc, section) =>
      acc + section.topics.filter((topic) => topic.isRead).length,
    0,
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4FC3F7" />
        <Text style={styles.loadingText}>Loading Roadmap...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRoadmapData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.headerGradient, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={["#0F172A", "#1E293B", "#0F172A"]}
          style={styles.headerGradientInner}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.heading}>Core CS Journey</Text>
              <Text style={styles.subHeading}>
                Track your learning progress
              </Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>Overall Progress</Text>
              <Text style={styles.progressPercent}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
            <View style={styles.progressBarLarge}>
              <View
                style={[
                  styles.progressFillLarge,
                  { width: `${progress * 100}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {completedTopics}/{totalTopics}
              </Text>
              <Text style={styles.statLabel}>Topics Done</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{roadmapData.length}</Text>
              <Text style={styles.statLabel}>Domains</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{totalSubtopics}</Text>
              <Text style={styles.statLabel}>Subtopics</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4FC3F7"]}
            tintColor="#4FC3F7"
          />
        }
      >
        <View style={styles.roadmapContainer}>
          {roadmapData.map((section, index) => (
            <React.Fragment key={index}>
              <View style={styles.sectionMarker}>
                <View style={styles.markerLine} />
                <View
                  style={[
                    styles.markerDot,
                    index <= expandedIndex && styles.markerDotActive,
                  ]}
                >
                  <Text style={styles.markerText}>{index + 1}</Text>
                </View>
                <View style={styles.markerLine} />
              </View>
              <TopicCard
                section={section}
                index={index}
                isExpanded={expandedIndex === index}
                onToggle={() => handleCardToggle(index)}
                topicReadStatus={readStatusMap}
                onMarkAsRead={markTopicAsRead}
              />
            </React.Fragment>
          ))}
        </View>
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#CBD5E0",
    fontSize: 16,
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#F44336",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: "#4FC3F7",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  headerGradient: {
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: "hidden",
  },
  headerGradientInner: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  heading: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: -0.5,
  },
  subHeading: {
    fontSize: 16,
    color: "#94A3B8",
    marginTop: 4,
  },
  progressContainer: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  progressText: {
    fontSize: 14,
    color: "#CBD5E0",
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4FC3F7",
  },
  progressBarLarge: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFillLarge: {
    height: "100%",
    backgroundColor: "#4FC3F7",
    borderRadius: 3,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#64B5F6",
  },
  statLabel: {
    fontSize: 12,
    color: "#CBD5E0",
    marginTop: 4,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  roadmapContainer: {
    padding: 20,
  },
  sectionMarker: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  markerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(100, 181, 246, 0.2)",
  },
  markerDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 15,
    borderWidth: 2,
    borderColor: "transparent",
  },
  markerDotActive: {
    backgroundColor: "#1E293B",
    borderColor: "#4FC3F7",
  },
  markerText: {
    color: "#CBD5E0",
    fontSize: 12,
    fontWeight: "600",
  },
  cardWrapper: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 28,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  titleContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(100, 181, 246, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "rgba(100, 181, 246, 0.2)",
    position: "relative",
  },
  iconContainerCompleted: {
    backgroundColor: "rgba(129, 199, 132, 0.1)",
    borderColor: "rgba(129, 199, 132, 0.3)",
  },
  completedBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#81C784",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#1E293B",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: -0.3,
    flex: 1,
  },
  sectionProgress: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4FC3F7",
    marginLeft: 10,
  },
  topicCount: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  expandableContent: {
    overflow: "hidden",
    marginTop: 20,
  },
  contentInner: {
    paddingTop: 0,
  },
  sectionProgressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4FC3F7",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
  },
  topicsScroll: {
    marginBottom: 20,
  },
  topicChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  topicChipActive: {
    backgroundColor: "rgba(79, 195, 247, 0.15)",
    borderColor: "#4FC3F7",
  },
  topicChipRead: {
    backgroundColor: "rgba(129, 199, 132, 0.1)",
    borderColor: "rgba(129, 199, 132, 0.3)",
  },
  topicNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  topicNumber: {
    fontSize: 10,
    color: "#94A3B8",
    marginRight: 8,
  },
  topicNumberRead: {
    color: "#81C784",
  },
  topicCheckmark: {
    marginRight: 6,
  },
  topicText: {
    color: "#E2E8F0",
    fontSize: 14,
    fontWeight: "500",
  },
  topicTextActive: {
    color: "#4FC3F7",
    fontWeight: "600",
  },
  topicTextRead: {
    color: "#81C784",
  },
  subtopicsContainer: {
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    marginTop: 10,
  },
  subtopicsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  subtopicTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  subtopicIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(129, 199, 132, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(129, 199, 132, 0.2)",
  },
  subtopicIconCompleted: {
    backgroundColor: "rgba(129, 199, 132, 0.2)",
    borderColor: "rgba(129, 199, 132, 0.4)",
  },
  subtopicsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
  },
  subtopicProgress: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  readBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(129, 199, 132, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(129, 199, 132, 0.3)",
  },
  readText: {
    color: "#81C784",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  markAsReadButton: {
    backgroundColor: "rgba(79, 195, 247, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(79, 195, 247, 0.3)",
  },
  markAsReadText: {
    color: "#4FC3F7",
    fontSize: 12,
    fontWeight: "600",
  },
  subtopicsGrid: {
    marginBottom: 20,
  },
  subtopicChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  subtopicLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#4FC3F7",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxCompleted: {
    borderColor: "#81C784",
    backgroundColor: "rgba(129, 199, 132, 0.1)",
  },
  subtopicText: {
    flex: 1,
    color: "#E2E8F0",
    fontSize: 14,
  },
  subtopicTextCompleted: {
    color: "#81C784",
    textDecorationLine: "line-through",
  },
  playButton: {
    padding: 4,
  },
  bottomSpacing: {
    height: 0,
  },
});
