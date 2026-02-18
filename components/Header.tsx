// // components/header/FloatingStreakHeader.tsx
// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
//
// const BASE_URL = "https://m6sqbdzm-5000.inc1.devtunnels.ms";
//
// export default function FloatingStreakHeader() {
//   const [userData, setUserData] = useState<any>(null);
//   const router = useRouter();
//
//   useEffect(() => {
//     loadUserData();
//   }, []);
//
//   const loadUserData = async () => {
//     try {
//         const token = await AsyncStorage.getItem("token")
//         const res = await fetch(`${BASE_URL}/user/streakandpoints`, {
//             method: "GET",
//             headers:{
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${token}`}});
//         const data = await res.json();
//         console.log(data)
//         setUserData(data)
//     } catch (error) {
//       console.error('Error loading user data:', error);
//     }
//   };
//
//   return (
//     <View style={styles.container}>
//       {/* Left: Streak */}
//       <View style={styles.statsContainer}>
//         <View style={styles.statItem}>
//           <View style={styles.iconContainer}>
//             <Text style={styles.fireIcon}>🔥</Text>
//           </View>
//           <View style={styles.statTextContainer}>
//             <Text style={styles.statLabel}>Streak</Text>
//             <Text style={styles.statValue}>{userData?.streak || 0}d</Text>
//           </View>
//         </View>
//
//         {/* Divider */}
//         <View style={styles.divider} />
//
//         {/* Right: Points */}
//         <View style={styles.statItem}>
//           <View style={styles.iconContainer}>
//             <Text style={styles.starIcon}>⭐</Text>
//           </View>
//           <View style={styles.statTextContainer}>
//             <Text style={styles.statLabel}>Points</Text>
//             <Text style={styles.statValue}>{userData?.points || 0}</Text>
//           </View>
//         </View>
//       </View>
//
//       {/* Profile Button */}
//       <TouchableOpacity
//         onPress={() => router.push('/profile')}
//         style={styles.profileButton}
//       >
//         <View style={styles.profileIcon}>
//           {userData?.name ? (
//             <Text style={styles.profileInitials}>
//               {userData.name.substring(0, 2).toUpperCase()}
//             </Text>
//           ) : (
//             <Ionicons name="person-outline" size={20} color="#fff" />
//           )}
//         </View>
//       </TouchableOpacity>
//     </View>
//   );
// }
//
// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: 'rgba(255, 255, 255, 0.95)',
//     borderBottomWidth: 1,
//     borderBottomColor: '#f1f5f9',
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f8fafc',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//   },
//   statItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   iconContainer: {
//     marginRight: 8,
//   },
//   fireIcon: {
//     fontSize: 20,
//   },
//   starIcon: {
//     fontSize: 20,
//     color: '#fbbf24',
//   },
//   statTextContainer: {
//     marginRight: 12,
//   },
//   statLabel: {
//     fontSize: 10,
//     color: '#64748b',
//     fontWeight: '500',
//   },
//   statValue: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#0f172a',
//   },
//   divider: {
//     width: 1,
//     height: 24,
//     backgroundColor: '#e2e8f0',
//     marginHorizontal: 8,
//   },
//   profileButton: {
//     padding: 4,
//   },
//   profileIcon: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: '#0f172a',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   profileInitials: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
// });

// components/header/FloatingStreakHeader.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const BASE_URL = "https://oneserve.in";

export default function FloatingStreakHeader() {
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/user/streakandpoints`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log(data);
      setUserData(data);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

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

  return (
    <View style={styles.container}>
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
  );
}

const styles = StyleSheet.create({
  container: {
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
