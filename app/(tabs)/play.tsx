// // screens/TopicScreen.tsx
// import React, { useEffect, useState } from "react";
// import {
//     ActivityIndicator,
//     Alert,
//     SafeAreaView,
//     ScrollView,
//     StatusBar,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View,
//     Image,
//     Dimensions,
//     Modal,
//     TouchableWithoutFeedback,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useLocalSearchParams, useRouter } from "expo-router";
//
// const API_BASE_URL = "https://m6sqbdzm-5000.inc1.devtunnels.ms";
// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
//
// interface TopicData {
//   _id: string;
//   title?: string;
//   category?: string;
//   descriptions?: Array<{
//     heading?: string;
//     content?: string;
//     images?: string[];
//   }>;
//   difficulty?: string;
//   order?: number | null;
// }
//
// interface ZoomedImage {
//   uri: string;
//   index: number;
//   sectionIndex: number;
// }
//
// const TopicScreen = () => {
//   const router = useRouter();
//   const params = useLocalSearchParams();
//
//   // Get topicId from params if provided, otherwise use hardcoded ID
//   const topicId = params.id as string || "6975023145db1b690b3edd20";
//
//   const [topics, setTopics] = useState<TopicData[]>([]);
//   const [currentIndex, setCurrentIndex] = useState<number>(0);
//   const [topic, setTopic] = useState<TopicData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [markingAsRead, setMarkingAsRead] = useState(false);
//   const [isRead, setIsRead] = useState(false);
//   const [checkingStatus, setCheckingStatus] = useState(true);
//   const [imageLoading, setImageLoading] = useState<{[key: string]: boolean}>({});
//   const [preloadedImages, setPreloadedImages] = useState<{[key: string]: boolean}>({});
//   const [zoomedImage, setZoomedImage] = useState<ZoomedImage | null>(null);
//   const [imageModalVisible, setImageModalVisible] = useState(false);
//
//   useEffect(() => {
//     fetchAllTopics();
//   }, []);
//
//   useEffect(() => {
//     if (topics.length > 0 && topicId) {
//       // Find the index of the current topic by ID
//       const index = topics.findIndex(t => t._id === topicId);
//       if (index !== -1) {
//         setCurrentIndex(index);
//         setTopic(topics[index]);
//         checkTopicStatus(topics[index]._id);
//         // Preload images for current topic
//         preloadTopicImages(topics[index]);
//       }
//     }
//   }, [topics, topicId]);
//
//   const fetchAllTopics = async () => {
//     try {
//       setLoading(true);
//       const token = await AsyncStorage.getItem("token");
//
//       const response = await fetch(`${API_BASE_URL}/user/topics-order`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//
//       const result = await response.json();
//
//       if (result.success && result.data && Array.isArray(result.data)) {
//         // Sort topics by order (if available), otherwise maintain server order
//         const sortedTopics = [...result.data].sort((a, b) => {
//           if (a.order !== null && b.order !== null) {
//             return (a.order || 0) - (b.order || 0);
//           }
//           return 0;
//         });
//
//         setTopics(sortedTopics);
//
//         // If we have a topicId, find and set it
//         if (topicId && sortedTopics.length > 0) {
//           const initialTopic = sortedTopics.find(t => t._id === topicId) || sortedTopics[0];
//           const initialIndex = sortedTopics.findIndex(t => t._id === initialTopic._id);
//           setTopic(initialTopic);
//           setCurrentIndex(initialIndex);
//           checkTopicStatus(initialTopic._id);
//           // Preload images for initial topic
//           preloadTopicImages(initialTopic);
//         }
//       } else {
//         Alert.alert("Error", "Failed to load topics");
//       }
//     } catch (error) {
//       console.error("Error fetching topics:", error);
//       Alert.alert("Error", "Failed to load topics");
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   const preloadTopicImages = (topicData: TopicData) => {
//     if (!topicData.descriptions) return;
//
//     const allImageUrls: string[] = [];
//
//     topicData.descriptions.forEach(section => {
//       if (section.images && section.images.length > 0) {
//         allImageUrls.push(...section.images);
//       }
//     });
//
//     // Preload all images
//     allImageUrls.forEach(imageUrl => {
//       if (!preloadedImages[imageUrl]) {
//         Image.prefetch(imageUrl)
//           .then(() => {
//             setPreloadedImages(prev => ({ ...prev, [imageUrl]: true }));
//           })
//           .catch(() => {
//             console.log(`Failed to preload image: ${imageUrl}`);
//           });
//       }
//     });
//   };
//
//   const checkTopicStatus = async (topicIdToCheck: string) => {
//     try {
//       setCheckingStatus(true);
//       const token = await AsyncStorage.getItem("token");
//
//       const response = await fetch(`${API_BASE_URL}/user/topic-read-status`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//
//       const result = await response.json();
//
//       if (result && result[topicIdToCheck]) {
//         setIsRead(true);
//       } else {
//         setIsRead(false);
//       }
//     } catch (error) {
//       console.error("Error checking topic status:", error);
//       setIsRead(false);
//     } finally {
//       setCheckingStatus(false);
//     }
//   };
//
//   const handleMarkAsRead = async () => {
//     try {
//       if (!topic) return;
//
//       setMarkingAsRead(true);
//       const token = await AsyncStorage.getItem("token");
//
//       const response = await fetch(`${API_BASE_URL}/user/mark-as-read`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           topicId: topic._id,
//           subject: topic?.category,
//           topicTitle: topic?.title,
//           order: topic?.order,
//         }),
//       });
//
//       const result = await response.json();
//
//       if (result?.success) {
//         setIsRead(true);
//       } else {
//         Alert.alert("Error", "Failed to mark as read");
//       }
//     } catch (error) {
//       console.error("Error marking as read:", error);
//       Alert.alert("Error", "Something went wrong");
//     } finally {
//       setMarkingAsRead(false);
//     }
//   };
//
//   const handleGoToMCQs = () => {
//     if (topic) {
//       router.push(`/mcqs/${topic._id}`);
//     }
//   };
//
//   const navigateToTopic = (index: number) => {
//     if (index >= 0 && index < topics.length) {
//       setCurrentIndex(index);
//       const newTopic = topics[index];
//       setTopic(newTopic);
//       checkTopicStatus(newTopic._id);
//       // Preload images for new topic
//       preloadTopicImages(newTopic);
//
//       // Update the URL parameter without navigating away
//       router.setParams({ id: newTopic._id });
//     }
//   };
//
//   const goToNextTopic = () => {
//     if (currentIndex < topics.length - 1) {
//       navigateToTopic(currentIndex + 1);
//     }
//   };
//
//   const goToPreviousTopic = () => {
//     if (currentIndex > 0) {
//       navigateToTopic(currentIndex - 1);
//     }
//   };
//
//   const handleImageLoadStart = (imageUrl: string) => {
//     setImageLoading(prev => ({ ...prev, [imageUrl]: true }));
//   };
//
//   const handleImageLoadEnd = (imageUrl: string) => {
//     setImageLoading(prev => ({ ...prev, [imageUrl]: false }));
//   };
//
//   const openImageZoom = (imageUrl: string, sectionIndex: number, imageIndex: number) => {
//     setZoomedImage({
//       uri: imageUrl,
//       index: imageIndex,
//       sectionIndex: sectionIndex
//     });
//     setImageModalVisible(true);
//   };
//
//   const closeImageZoom = () => {
//     setImageModalVisible(false);
//     setTimeout(() => setZoomedImage(null), 300); // Delay clearing for smooth transition
//   };
//
//   // Function to render text with bold formatting
//   const renderFormattedText = (text: string) => {
//     if (!text) return null;
//
//     const parts = [];
//     let lastIndex = 0;
//     let match;
//
//     // Regular expression to find **bold** text
//     const boldRegex = /\*\*(.*?)\*\*/g;
//
//     while ((match = boldRegex.exec(text)) !== null) {
//       // Add text before the bold section
//       if (match.index > lastIndex) {
//         parts.push(
//           <Text key={lastIndex} style={styles.plainText}>
//             {text.substring(lastIndex, match.index)}
//           </Text>
//         );
//       }
//
//       // Add bold text
//       parts.push(
//         <Text key={match.index} style={styles.boldText}>
//           {match[1]}
//         </Text>
//       );
//
//       lastIndex = match.index + match[0].length;
//     }
//
//     // Add remaining text
//     if (lastIndex < text.length) {
//       parts.push(
//         <Text key={lastIndex} style={styles.plainText}>
//           {text.substring(lastIndex)}
//         </Text>
//       );
//     }
//
//     return parts;
//   };
//
//   // Function to render bullet points with formatted text
//   const renderBulletPoint = (line: string) => {
//     const text = line.substring(1).trim();
//     return (
//       <View style={styles.listItem}>
//         <Icon
//           name="circle-small"
//           size={24}
//           color="#7C3AED"
//           style={styles.bullet}
//         />
//         <Text style={styles.listText}>
//           {renderFormattedText(text)}
//         </Text>
//       </View>
//     );
//   };
//
//   // Function to render regular paragraph with formatted text
//   const renderParagraph = (line: string) => {
//     return (
//       <Text style={styles.paragraph}>
//         {renderFormattedText(line)}
//       </Text>
//     );
//   };
//
//   const getDifficultyColor = (difficulty?: string) => {
//     switch (difficulty) {
//       case "easy":
//         return "#10B981";
//       case "medium":
//         return "#F59E0B";
//       case "hard":
//         return "#EF4444";
//       default:
//         return "#6B7280";
//     }
//   };
//
//   const getDifficultyIcon = (difficulty?: string) => {
//     switch (difficulty) {
//       case "easy":
//         return "trending-up";
//       case "medium":
//         return "trending-flat";
//       case "hard":
//         return "trending-down";
//       default:
//         return "help-circle";
//     }
//   };
//
//   const formatDifficulty = (difficulty?: string) => {
//     if (!difficulty) return "Unknown";
//     return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
//   };
//
//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color="#7C3AED" />
//       </View>
//     );
//   }
//
//   if (!topic || topics.length === 0) {
//     return (
//       <View style={styles.centered}>
//         <Icon name="alert-circle" size={60} color="#9CA3AF" />
//         <Text style={styles.errorText}>No topics found</Text>
//         <TouchableOpacity style={styles.retryButton} onPress={fetchAllTopics}>
//           <Text style={styles.retryButtonText}>Retry</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }
//
//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
//
//       <LinearGradient
//         colors={["#7C3AED", "#8B5CF6"]}
//         style={styles.headerGradient}
//       >
//         <View style={styles.header}>
//           {/* Left arrow for previous topic */}
//           <TouchableOpacity
//             style={styles.navButton}
//             onPress={goToPreviousTopic}
//             disabled={currentIndex === 0}
//           >
//             <Icon
//               name="chevron-left"
//               size={32}
//               color={currentIndex === 0 ? "rgba(255,255,255,0.5)" : "#FFFFFF"}
//             />
//           </TouchableOpacity>
//
//           <View style={styles.headerContent}>
//             <View style={styles.topicCounter}>
//               <Text style={styles.topicCounterText}>
//                 {currentIndex + 1} / {topics.length}
//               </Text>
//             </View>
//
//             <Text style={styles.categoryBadge}>
//               {topic.category ?? "GENERAL"}
//             </Text>
//
//             <Text style={styles.title} numberOfLines={2}>
//               {topic.title ?? "Untitled Topic"}
//             </Text>
//
//             <View style={styles.difficultyContainer}>
//               <Icon
//                 name={getDifficultyIcon(topic.difficulty)}
//                 size={16}
//                 color={getDifficultyColor(topic.difficulty)}
//               />
//               <Text
//                 style={[
//                   styles.difficultyText,
//                   { color: getDifficultyColor(topic.difficulty) },
//                 ]}
//               >
//                 {formatDifficulty(topic.difficulty)}
//               </Text>
//             </View>
//           </View>
//
//           {/* Right arrow for next topic */}
//           <TouchableOpacity
//             style={styles.navButton}
//             onPress={goToNextTopic}
//             disabled={currentIndex === topics.length - 1}
//           >
//             <Icon
//               name="chevron-right"
//               size={32}
//               color={currentIndex === topics.length - 1 ? "rgba(255,255,255,0.5)" : "#FFFFFF"}
//             />
//           </TouchableOpacity>
//         </View>
//       </LinearGradient>
//
//       <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
//         <View style={styles.content}>
//           {(topic.descriptions ?? []).map((section, sectionIndex) => (
//             <View key={sectionIndex} style={styles.section}>
//               <View style={styles.sectionHeader}>
//                 <View style={styles.sectionNumber}>
//                   <Text style={styles.sectionNumberText}>{sectionIndex + 1}</Text>
//                 </View>
//                 <Text style={styles.sectionHeading}>
//                   {section.heading ?? "Section"}
//                 </Text>
//               </View>
//
//               <View style={styles.sectionContent}>
//                 {/* Content text with bullet points and formatted text */}
//                 {(section.content ?? "")
//                   .split("\n")
//                   .filter(Boolean)
//                   .map((line, lineIndex) => (
//                     <React.Fragment key={lineIndex}>
//                       {line.startsWith("*") ? renderBulletPoint(line) : renderParagraph(line)}
//                     </React.Fragment>
//                   ))}
//
//                 {/* Images for this section */}
//                 {section.images && section.images.length > 0 && (
//                   <View style={styles.imagesContainer}>
//                     {section.images.map((imageUrl, imgIndex) => (
//                       <TouchableOpacity
//                         key={imgIndex}
//                         style={styles.imageWrapper}
//                         onPress={() => openImageZoom(imageUrl, sectionIndex, imgIndex)}
//                         activeOpacity={0.7}
//                       >
//                         {!preloadedImages[imageUrl] && imageLoading[imageUrl] && (
//                           <View style={styles.imageLoadingContainer}>
//                             <ActivityIndicator size="small" color="#7C3AED" />
//                           </View>
//                         )}
//                         <Image
//                           source={{ uri: imageUrl }}
//                           style={styles.image}
//                           resizeMode="contain"
//                           onLoadStart={() => handleImageLoadStart(imageUrl)}
//                           onLoadEnd={() => handleImageLoadEnd(imageUrl)}
//                           onError={() => handleImageLoadEnd(imageUrl)}
//                         />
//                         {/* Zoom indicator */}
//                         <View style={styles.zoomIndicator}>
//                           <Icon name="magnify-plus-outline" size={20} color="rgba(255,255,255,0.8)" />
//                         </View>
//                       </TouchableOpacity>
//                     ))}
//                   </View>
//                 )}
//               </View>
//             </View>
//           ))}
//         </View>
//       </ScrollView>
//
//       {/* Image Zoom Modal */}
//       <Modal
//         visible={imageModalVisible}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={closeImageZoom}
//       >
//         <TouchableWithoutFeedback onPress={closeImageZoom}>
//           <View style={styles.modalOverlay}>
//             <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
//               <View style={styles.zoomedImageContainer}>
//                 {zoomedImage && (
//                   <>
//                     <TouchableOpacity
//                       style={styles.closeButton}
//                       onPress={closeImageZoom}
//                       hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
//                     >
//                       <Icon name="close" size={28} color="#FFFFFF" />
//                     </TouchableOpacity>
//
//                     <Image
//                       source={{ uri: zoomedImage.uri }}
//                       style={styles.zoomedImage}
//                       resizeMode="contain"
//                     />
//
//                     <View style={styles.imageInfo}>
//                       <Text style={styles.imageInfoText}>
//                         Image {zoomedImage.index + 1}
//                       </Text>
//                     </View>
//                   </>
//                 )}
//               </View>
//             </TouchableWithoutFeedback>
//           </View>
//         </TouchableWithoutFeedback>
//       </Modal>
//
//       <View style={styles.footer}>
//         <LinearGradient
//           colors={["rgba(255,255,255,0)", "#FFFFFF"]}
//           style={styles.footerGradient}
//         >
//           {checkingStatus ? (
//             <View style={styles.statusCheckingButton}>
//               <ActivityIndicator size="small" color="#7C3AED" />
//               <Text style={styles.statusCheckingText}>Checking status...</Text>
//             </View>
//           ) : isRead ? (
//             <TouchableOpacity
//               style={styles.completedButton}
//               onPress={handleGoToMCQs}
//             >
//               <Icon name="arrow-right-circle" size={24} color="#FFFFFF" />
//               <Text style={styles.completedButtonText}>Completed - Go To MCQs</Text>
//             </TouchableOpacity>
//           ) : (
//             <TouchableOpacity
//               style={styles.markAsReadButton}
//               onPress={handleMarkAsRead}
//               disabled={markingAsRead}
//             >
//               {markingAsRead ? (
//                 <ActivityIndicator color="#FFFFFF" />
//               ) : (
//                 <>
//                   <Icon name="bookmark-check" size={24} color="#FFFFFF" />
//                   <Text style={styles.markAsReadText}>Mark as Read</Text>
//                 </>
//               )}
//             </TouchableOpacity>
//           )}
//
//           {/* Topic Navigation Dots */}
//           {topics.length > 1 && (
//             <View style={styles.dotsContainer}>
//               {topics.map((_, index) => (
//                 <TouchableOpacity
//                   key={index}
//                   onPress={() => navigateToTopic(index)}
//                 >
//                   <View
//                     style={[
//                       styles.dot,
//                       index === currentIndex ? styles.activeDot : styles.inactiveDot
//                     ]}
//                   />
//                 </TouchableOpacity>
//               ))}
//             </View>
//           )}
//         </LinearGradient>
//       </View>
//     </SafeAreaView>
//   );
// };
//
// export default TopicScreen;
//
// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//   },
//   centered: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#FFFFFF",
//   },
//   errorText: {
//     fontSize: 18,
//     color: "#9CA3AF",
//     marginTop: 16,
//   },
//   retryButton: {
//     marginTop: 20,
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     backgroundColor: "#7C3AED",
//     borderRadius: 12,
//   },
//   retryButtonText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   headerGradient: {
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//     elevation: 8,
//     shadowColor: "#7C3AED",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 12,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingTop: 16,
//     paddingBottom: 20,
//   },
//   navButton: {
//     width: 44,
//     height: 44,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   headerContent: {
//     flex: 1,
//     alignItems: "center",
//   },
//   topicCounter: {
//     marginBottom: 8,
//   },
//   topicCounterText: {
//     color: "rgba(255, 255, 255, 0.8)",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   categoryBadge: {
//     backgroundColor: "rgba(255, 255, 255, 0.2)",
//     color: "#FFFFFF",
//     fontSize: 12,
//     fontWeight: "600",
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 12,
//     alignSelf: "center",
//     marginBottom: 8,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#FFFFFF",
//     marginBottom: 8,
//     textAlign: "center",
//   },
//   difficultyContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   difficultyText: {
//     fontSize: 14,
//     fontWeight: "600",
//     marginLeft: 4,
//   },
//   container: {
//     flex: 1,
//   },
//   content: {
//     padding: 20,
//   },
//   section: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: "#F3F4F6",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   sectionNumber: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: "#F5F3FF",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },
//   sectionNumberText: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#7C3AED",
//   },
//   sectionHeading: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#1F2937",
//     flex: 1,
//   },
//   sectionContent: {
//     marginLeft: 44,
//   },
//   listItem: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     marginBottom: 12,
//   },
//   bullet: {
//     marginTop: 2,
//     marginRight: 8,
//   },
//   plainText: {
//     fontSize: 15,
//     color: "#4B5563",
//     lineHeight: 22,
//   },
//   boldText: {
//     fontSize: 15,
//     color: "#7C3AED",
//     fontWeight: "700",
//     lineHeight: 22,
//   },
//   listText: {
//     flex: 1,
//     lineHeight: 22,
//   },
//   paragraph: {
//     fontSize: 15,
//     color: "#4B5563",
//     lineHeight: 22,
//     marginBottom: 12,
//   },
//   imagesContainer: {
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   imageWrapper: {
//     marginBottom: 16,
//     borderRadius: 12,
//     overflow: 'hidden',
//     backgroundColor: '#F9FAFB',
//     borderWidth: 1,
//     borderColor: '#F3F4F6',
//     minHeight: 200, // Reserve space for image
//     position: 'relative',
//   },
//   image: {
//     width: '100%',
//     height: 200,
//     backgroundColor: '#F9FAFB',
//   },
//   imageLoadingContainer: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F9FAFB',
//     zIndex: 1,
//   },
//   zoomIndicator: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     borderRadius: 20,
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.9)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   zoomedImageContainer: {
//     width: SCREEN_WIDTH * 0.95,
//     height: SCREEN_HEIGHT * 0.85,
//     backgroundColor: 'rgba(0, 0, 0, 0.8)',
//     borderRadius: 12,
//     overflow: 'hidden',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   zoomedImage: {
//     width: '100%',
//     height: '100%',
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     zIndex: 10,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     borderRadius: 20,
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   imageInfo: {
//     position: 'absolute',
//     bottom: 20,
//     left: 0,
//     right: 0,
//     alignItems: 'center',
//   },
//   imageInfoText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 8,
//   },
//   footer: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//   },
//   footerGradient: {
//     paddingHorizontal: 20,
//     paddingTop: 20,
//     paddingBottom: 34,
//     borderTopWidth: 1,
//     borderTopColor: "#F3F4F6",
//   },
//   statusCheckingButton: {
//     backgroundColor: "#F3F4F6",
//     borderRadius: 16,
//     paddingVertical: 18,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   statusCheckingText: {
//     color: "#6B7280",
//     fontSize: 16,
//     fontWeight: "600",
//     marginLeft: 12,
//   },
//   markAsReadButton: {
//     backgroundColor: "#7C3AED",
//     borderRadius: 16,
//     paddingVertical: 18,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#7C3AED",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 12,
//     elevation: 8,
//     marginBottom: 16,
//   },
//   markAsReadText: {
//     color: "#FFFFFF",
//     fontSize: 18,
//     fontWeight: "700",
//     marginLeft: 12,
//   },
//   completedButton: {
//     backgroundColor: "#10B981",
//     borderRadius: 16,
//     paddingVertical: 18,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#10B981",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 12,
//     elevation: 8,
//     marginBottom: 16,
//   },
//   completedButtonText: {
//     color: "#FFFFFF",
//     fontSize: 18,
//     fontWeight: "700",
//     marginLeft: 12,
//   },
//   dotsContainer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 8,
//   },
//   dot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     marginHorizontal: 4,
//   },
//   activeDot: {
//     backgroundColor: "#7C3AED",
//     width: 12,
//   },
//   inactiveDot: {
//     backgroundColor: "#D1D5DB",
//   },
// });

// screens/TopicScreen.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const API_BASE_URL = "https://oneserve.in";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

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

interface ZoomedImage {
  uri: string;
  index: number;
  sectionIndex: number;
}

const TopicScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Get topicId from params if provided, otherwise use hardcoded ID
  const topicId = (params.id as string) || "6975023145db1b690b3edd20";

  const [topics, setTopics] = useState<TopicData[]>([]);
  const [initialProgressLoading, setInitialProgressLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [topic, setTopic] = useState<TopicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [preloadedImages, setPreloadedImages] = useState<{
    [key: string]: boolean;
  }>({});
  const [zoomedImage, setZoomedImage] = useState<ZoomedImage | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [readStatusMap, setReadStatusMap] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    fetchAllTopics();
  }, []);

  useEffect(() => {
    if (topics.length > 0 && topicId) {
      // Find the index of the current topic by ID
      const index = topics.findIndex((t) => t._id === topicId);
      if (index !== -1) {
        setCurrentIndex(index);
        setTopic(topics[index]);
        // Don't preload images yet, wait for status check
        // preloadTopicImages(topics[index]);
      }
    }
  }, [topics, topicId]);

  const fetchAllTopics = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/user/topics-order`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success && result.data && Array.isArray(result.data)) {
        // // Sort topics by order (if available), otherwise maintain server order
        // const sortedTopics = [...result.data].sort((a, b) => {
        //   if (a.order !== null && b.order !== null) {
        //     return (a.order || 0) - (b.order || 0);
        //   }
        //   return 0;
        // });

        const sortedTopics = result.data;

        setTopics(sortedTopics);

        // If we have topics, check status for all of them
        if (sortedTopics.length > 0) {
          checkAllTopicsStatus(sortedTopics);
        }
      } else {
        Alert.alert("Error", "Failed to load topics");
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
      Alert.alert("Error", "Failed to load topics");
    } finally {
      setLoading(false);
    }
  };

  const checkAllTopicsStatus = async (topicsList: TopicData[]) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/user/topic-read-status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result) {
        setReadStatusMap(result);

        // Find the first unread topic
        let firstUnreadIndex = 0;
        for (let i = 0; i < topicsList.length; i++) {
          const topicId = topicsList[i]._id;
          if (!result[topicId]) {
            firstUnreadIndex = i;
            break;
          }
        }

        // Set initial topic based on URL parameter or first unread
        let initialTopic: TopicData;
        let initialIndex: number;

        if (topicId && topicsList.length > 0) {
          const paramTopic = topicsList.find((t) => t._id === topicId);
          if (paramTopic) {
            initialTopic = paramTopic;
            initialIndex = topicsList.findIndex(
              (t) => t._id === paramTopic._id,
            );

            // If the topic from params is already read, check if we should skip to next unread
            if (result[paramTopic._id]) {
              const nextUnreadIndex = findNextUnreadTopic(
                initialIndex,
                result,
                topicsList,
              );
              if (nextUnreadIndex !== -1 && nextUnreadIndex !== initialIndex) {
                initialTopic = topicsList[nextUnreadIndex];
                initialIndex = nextUnreadIndex;
              }
            }
          } else {
            initialTopic = topicsList[firstUnreadIndex];
            initialIndex = firstUnreadIndex;
          }
        } else {
          initialTopic = topicsList[firstUnreadIndex];
          initialIndex = firstUnreadIndex;
        }

        setTopic(initialTopic);
        setCurrentIndex(initialIndex);
        setIsRead(!!result[initialTopic._id]);
        preloadTopicImages(initialTopic);
        await updateCurrentProgress(initialTopic, initialIndex);
        setInitialProgressLoading(false);

        // Update URL parameter if different from initial
        if (initialTopic._id !== topicId) {
          router.setParams({ id: initialTopic._id });
        }
      }
    } catch (error) {
      console.error("Error checking topics status:", error);
      // Fallback to first topic
      if (topicsList.length > 0) {
        setTopic(topicsList[0]);
        setCurrentIndex(0);
        setIsRead(false);
        preloadTopicImages(topicsList[0]);
        await updateCurrentProgress(fallbackTopic, 0);
        setInitialProgressLoading(false);
      }
    } finally {
      setCheckingStatus(false);
    }
  };

  const checkTopicStatus = async (topicIdToCheck: string) => {
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

      if (result) {
        setReadStatusMap(result);

        if (result[topicIdToCheck]) {
          setIsRead(true);

          // If topic is read, check if there's a next unread topic
          const currentTopicIndex = topics.findIndex(
            (t) => t._id === topicIdToCheck,
          );

          if (currentTopicIndex !== -1) {
            // Find the next unread topic
            const nextUnreadIndex = findNextUnreadTopic(
              currentTopicIndex,
              result,
              topics,
            );

            if (
              nextUnreadIndex !== -1 &&
              nextUnreadIndex !== currentTopicIndex
            ) {
              // Navigate to the next unread topic after a short delay
              setTimeout(() => {
                navigateToTopic(nextUnreadIndex);
              }, 800); // Slightly longer delay to show completion status
            }
          }
        } else {
          setIsRead(false);
        }
      }
    } catch (error) {
      console.error("Error checking topic status:", error);
      setIsRead(false);
    } finally {
      setCheckingStatus(false);
    }
  };

  const findNextUnreadTopic = (
    currentIndex: number,
    readStatus: { [key: string]: boolean },
    topicsList: TopicData[],
  ): number => {
    // Start from the next topic and find the first unread one
    for (let i = currentIndex + 1; i < topicsList.length; i++) {
      const topicId = topicsList[i]._id;
      if (!readStatus[topicId]) {
        return i; // Found unread topic
      }
    }

    // If all remaining topics are read, check previous topics
    for (let i = currentIndex - 1; i >= 0; i--) {
      const topicId = topicsList[i]._id;
      if (!readStatus[topicId]) {
        return i; // Found unread topic before current
      }
    }

    // If all topics are read, return the last one
    return topicsList.length - 1;
  };

  const preloadTopicImages = (topicData: TopicData) => {
    if (!topicData.descriptions) return;

    const allImageUrls: string[] = [];

    topicData.descriptions.forEach((section) => {
      if (section.images && section.images.length > 0) {
        allImageUrls.push(...section.images);
      }
    });

    // Preload all images
    allImageUrls.forEach((imageUrl) => {
      if (!preloadedImages[imageUrl]) {
        Image.prefetch(imageUrl)
          .then(() => {
            setPreloadedImages((prev) => ({ ...prev, [imageUrl]: true }));
          })
          .catch(() => {
            console.log(`Failed to preload image: ${imageUrl}`);
          });
      }
    });
  };

  const handleMarkAsRead = async () => {
    try {
      if (!topic) return;

      setMarkingAsRead(true);
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/user/mark-as-read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topicId: topic._id,
          subject: topic?.category,
          topicTitle: topic?.title,
          order: topic?.order,
        }),
      });

      const result = await response.json();

      if (result?.success) {
        setIsRead(true);
        // Update local read status
        setReadStatusMap((prev) => ({ ...prev, [topic._id]: true }));

        updateCurrentProgress(topic, currentIndex);

        // Find and navigate to next unread topic after a delay
        setTimeout(() => {
          const nextUnreadIndex = findNextUnreadTopic(
            currentIndex,
            { ...readStatusMap, [topic._id]: true },
            topics,
          );
          if (nextUnreadIndex !== -1 && nextUnreadIndex !== currentIndex) {
            navigateToTopic(nextUnreadIndex);
          }
        }, 1500); // Delay to show success state
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
    if (topic) {
      router.push(`/mcqs/${topic._id}`);
    }
  };

  const updateCurrentProgress = async (topicData: TopicData, index: number) => {
    try {
      await AsyncStorage.setItem(
        "current_learning_progress",
        JSON.stringify({
          subject: topicData.category,
          topicId: topicData._id,
          topicTitle: topicData.title,
          topicIndex: index,
          updatedAt: Date.now(),
        }),
      );
    } catch (err) {
      console.error("AsyncStorage update failed", err);
    }
  };

  //   const navigateToTopic = (index: number) => {
  //     if (index >= 0 && index < topics.length) {
  //       setCurrentIndex(index);
  //       const newTopic = topics[index];
  //       setTopic(newTopic);
  //       setIsRead(!!readStatusMap[newTopic._id]);
  //       // Preload images for new topic
  //       preloadTopicImages(newTopic);
  //
  //       // Update the URL parameter without navigating away
  //       router.setParams({ id: newTopic._id });
  //     }
  //   };

  const navigateToTopic = (index: number) => {
    if (index >= 0 && index < topics.length) {
      const newTopic = topics[index];

      setCurrentIndex(index);
      setTopic(newTopic);
      setIsRead(!!readStatusMap[newTopic._id]);
      preloadTopicImages(newTopic);

      // 🔥 STEP 3 — STORE CURRENT SUBJECT + TOPIC
      updateCurrentProgress(newTopic, index);

      router.setParams({ id: newTopic._id });
    }
  };

  const goToNextTopic = () => {
    if (currentIndex < topics.length - 1) {
      navigateToTopic(currentIndex + 1);
    }
  };

  const goToPreviousTopic = () => {
    if (currentIndex > 0) {
      navigateToTopic(currentIndex - 1);
    }
  };

  const handleImageLoadStart = (imageUrl: string) => {
    setImageLoading((prev) => ({ ...prev, [imageUrl]: true }));
  };

  const handleImageLoadEnd = (imageUrl: string) => {
    setImageLoading((prev) => ({ ...prev, [imageUrl]: false }));
  };

  const openImageZoom = (
    imageUrl: string,
    sectionIndex: number,
    imageIndex: number,
  ) => {
    setZoomedImage({
      uri: imageUrl,
      index: imageIndex,
      sectionIndex: sectionIndex,
    });
    setImageModalVisible(true);
  };

  const closeImageZoom = () => {
    setImageModalVisible(false);
    setTimeout(() => setZoomedImage(null), 300); // Delay clearing for smooth transition
  };

  // Function to render text with bold formatting
  const renderFormattedText = (text: string) => {
    if (!text) return null;

    const parts = [];
    let lastIndex = 0;
    let match;

    // Regular expression to find **bold** text
    const boldRegex = /\*\*(.*?)\*\*/g;

    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the bold section
      if (match.index > lastIndex) {
        parts.push(
          <Text key={lastIndex} style={styles.plainText}>
            {text.substring(lastIndex, match.index)}
          </Text>,
        );
      }

      // Add bold text
      parts.push(
        <Text key={match.index} style={styles.boldText}>
          {match[1]}
        </Text>,
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <Text key={lastIndex} style={styles.plainText}>
          {text.substring(lastIndex)}
        </Text>,
      );
    }

    return parts;
  };

  // Function to render sub-bullet points with formatted text
  const renderSubBulletPoint = (line: string, level = 1) => {
    const text = line.substring(2).trim();
    return (
      <View style={[styles.listItem, { marginLeft: level * 20 }]}>
        <Icon
          name="circle-small"
          size={24}
          color="#7C3AED"
          style={styles.bullet}
        />
        <Text style={styles.listText}>{renderFormattedText(text)}</Text>
      </View>
    );
  };

  // Function to detect and render different types of content
  const renderContentLine = (line: string) => {
    line = line.trim();

    // Check for different patterns
    if (line.startsWith("--- ")) {
      // Section heading like "--- 1-Level Architecture"
      return (
        <View style={styles.subSectionContainer}>
          <Text style={styles.subSectionTitle}>{line.substring(4)}</Text>
          <View style={styles.subSectionDivider} />
        </View>
      );
    } else if (line.startsWith("  * ")) {
      // Sub-bullet point (indented with spaces)
      return renderSubBulletPoint(line, 1);
    } else if (line.startsWith("* ")) {
      // Regular bullet point
      const text = line.substring(2).trim();
      return (
        <View style={styles.listItem}>
          <Icon
            name="circle-small"
            size={24}
            color="#7C3AED"
            style={styles.bullet}
          />
          <Text style={styles.listText}>{renderFormattedText(text)}</Text>
        </View>
      );
    } else if (line.startsWith("   see that ")) {
      // Special note or comment
      return (
        <View style={styles.noteContainer}>
          <Icon name="information" size={16} color="#6B7280" />
          <Text style={styles.noteText}>{line.substring(12)}</Text>
        </View>
      );
    } else if (line.includes(":") && line.length < 50) {
      // Likely a key-value pair or definition
      const [key, ...valueParts] = line.split(":");
      const value = valueParts.join(":").trim();
      return (
        <View style={styles.definitionItem}>
          <Text style={styles.definitionKey}>{key}:</Text>
          <Text style={styles.definitionValue}>
            {renderFormattedText(value)}
          </Text>
        </View>
      );
    } else {
      // Regular paragraph
      return <Text style={styles.paragraph}>{renderFormattedText(line)}</Text>;
    }
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

  // Check if all topics are completed
  const allTopicsCompleted =
    topics.length > 0 && topics.every((topic) => readStatusMap[topic._id]);

  if (loading || initialProgressLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={{ marginTop: 12, color: "#6B7280" }}>
          Preparing your learning progress...
        </Text>
      </View>
    );
  }

  if (!topic || topics.length === 0) {
    return (
      <View style={styles.centered}>
        <Icon name="alert-circle" size={60} color="#9CA3AF" />
        <Text style={styles.errorText}>No topics found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchAllTopics}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
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
          {/* Left arrow for previous topic */}
          <TouchableOpacity
            style={styles.navButton}
            onPress={goToPreviousTopic}
            disabled={currentIndex === 0}
          >
            <Icon
              name="chevron-left"
              size={32}
              color={currentIndex === 0 ? "rgba(255,255,255,0.5)" : "#FFFFFF"}
            />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.topicCounter}>
              <Text style={styles.topicCounterText}>
                {currentIndex + 1} / {topics.length}
                {isRead && " ✓"}
              </Text>
            </View>

            <Text style={styles.categoryBadge}>
              {topic.category ?? "GENERAL"}
            </Text>

            <Text style={styles.title} numberOfLines={2}>
              {topic.title ?? "Untitled Topic"}
            </Text>

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

          {/* Right arrow for next topic */}
          <TouchableOpacity
            style={styles.navButton}
            onPress={goToNextTopic}
            disabled={currentIndex === topics.length - 1}
          >
            <Icon
              name="chevron-right"
              size={32}
              color={
                currentIndex === topics.length - 1
                  ? "rgba(255,255,255,0.5)"
                  : "#FFFFFF"
              }
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.content}>
          {(topic.descriptions ?? []).map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumber}>
                  <Text style={styles.sectionNumberText}>
                    {sectionIndex + 1}
                  </Text>
                </View>
                <Text style={styles.sectionHeading}>
                  {section.heading ?? "Section"}
                </Text>
              </View>

              <View style={styles.sectionContent}>
                {/* Content text with various formatting options */}
                {(section.content ?? "")
                  .split("\n")
                  .filter((line) => line.trim().length > 0)
                  .map((line, lineIndex) => (
                    <React.Fragment key={lineIndex}>
                      {renderContentLine(line)}
                    </React.Fragment>
                  ))}

                {/* Images for this section */}
                {section.images && section.images.length > 0 && (
                  <View style={styles.imagesContainer}>
                    {section.images.map((imageUrl, imgIndex) => (
                      <TouchableOpacity
                        key={imgIndex}
                        style={styles.imageWrapper}
                        onPress={() =>
                          openImageZoom(imageUrl, sectionIndex, imgIndex)
                        }
                        activeOpacity={0.7}
                      >
                        {!preloadedImages[imageUrl] &&
                          imageLoading[imageUrl] && (
                            <View style={styles.imageLoadingContainer}>
                              <ActivityIndicator size="small" color="#7C3AED" />
                            </View>
                          )}
                        <Image
                          source={{ uri: imageUrl }}
                          style={styles.image}
                          resizeMode="contain"
                          onLoadStart={() => handleImageLoadStart(imageUrl)}
                          onLoadEnd={() => handleImageLoadEnd(imageUrl)}
                          onError={() => handleImageLoadEnd(imageUrl)}
                        />
                        {/* Zoom indicator */}
                        <View style={styles.zoomIndicator}>
                          <Icon
                            name="magnify-plus-outline"
                            size={20}
                            color="rgba(255,255,255,0.8)"
                          />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Image Zoom Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageZoom}
      >
        <TouchableWithoutFeedback onPress={closeImageZoom}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.zoomedImageContainer}>
                {zoomedImage && (
                  <>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={closeImageZoom}
                      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    >
                      <Icon name="close" size={28} color="#FFFFFF" />
                    </TouchableOpacity>

                    <Image
                      source={{ uri: zoomedImage.uri }}
                      style={styles.zoomedImage}
                      resizeMode="contain"
                    />

                    <View style={styles.imageInfo}>
                      <Text style={styles.imageInfoText}>
                        Image {zoomedImage.index + 1}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <View style={styles.footer}>
        <LinearGradient
          colors={["rgba(255,255,255,0)", "#FFFFFF"]}
          style={styles.footerGradient}
        >
          {allTopicsCompleted ? (
            <View style={styles.allCompletedContainer}>
              <Icon name="trophy" size={24} color="#10B981" />
              <Text style={styles.allCompletedText}>
                All Topics Completed! 🎉
              </Text>
            </View>
          ) : checkingStatus ? (
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

          {/* Topic Navigation Dots */}
          {topics.length > 1 && (
            <View style={styles.dotsContainer}>
              {topics.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => navigateToTopic(index)}
                >
                  <View
                    style={[
                      styles.dot,
                      index === currentIndex
                        ? styles.activeDot
                        : styles.inactiveDot,
                      readStatusMap[topics[index]._id] && styles.readDot,
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>
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
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#7C3AED",
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  topicCounter: {
    marginBottom: 8,
  },
  topicCounterText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontWeight: "600",
  },
  categoryBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  difficultyContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
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
  // New styles for different content types
  subSectionContainer: {
    marginTop: 20,
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },
  subSectionDivider: {
    height: 2,
    backgroundColor: "#E5E7EB",
    width: "100%",
    marginBottom: 12,
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
  plainText: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
  },
  boldText: {
    fontSize: 15,
    color: "#7C3AED",
    fontWeight: "700",
    lineHeight: 22,
  },
  listText: {
    flex: 1,
    lineHeight: 22,
  },
  paragraph: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
    marginBottom: 12,
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#6B7280",
  },
  noteText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
    fontStyle: "italic",
    flex: 1,
  },
  definitionItem: {
    flexDirection: "row",
    marginBottom: 8,
    paddingLeft: 8,
  },
  definitionKey: {
    fontSize: 15,
    color: "#7C3AED",
    fontWeight: "600",
    width: "30%",
  },
  definitionValue: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
    flex: 1,
  },
  imagesContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  imageWrapper: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    minHeight: 200, // Reserve space for image
    position: "relative",
  },
  image: {
    width: "100%",
    height: 200,
    backgroundColor: "#F9FAFB",
  },
  imageLoadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    zIndex: 1,
  },
  zoomIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  zoomedImageContainer: {
    width: SCREEN_WIDTH * 0.95,
    height: SCREEN_HEIGHT * 0.85,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  zoomedImage: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  imageInfo: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  imageInfoText: {
    color: "#FFFFFF",
    fontSize: 14,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
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
  allCompletedContainer: {
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    marginBottom: 16,
  },
  allCompletedText: {
    color: "#10B981",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 12,
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
    marginBottom: 16,
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
    marginBottom: 16,
  },
  completedButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 12,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#7C3AED",
    width: 12,
    height: 12,
  },
  inactiveDot: {
    backgroundColor: "#D1D5DB",
  },
  readDot: {
    backgroundColor: "#10B981",
  },
});
