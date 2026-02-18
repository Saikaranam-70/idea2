import { Ionicons } from "@expo/vector-icons";
import { router, Tabs } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: true,
            tabBarActiveTintColor: "#F97316", // orange
            tabBarInactiveTintColor: "#94A3B8", // gray
            tabBarStyle: styles.tabBar,
            tabBarLabelStyle: styles.label,
          }}
        >
          {/* Home */}
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home-outline" size={size} color={color} />
              ),
            }}
          />

          {/* Learn */}
          <Tabs.Screen
            name="learn"
            options={{
              title: "Roadmap",
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name="git-network-outline"
                  size={size}
                  color={color}
                />
              ),
            }}
          />

          {/* Center Play Button */}
          <Tabs.Screen
            name="play"
            options={{
              title: "",
              tabBarButton: () => (
                <View style={styles.centerWrapper}>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => router.push("/play")}
                    activeOpacity={0.9}
                  >
                    <Ionicons name="play" size={28} color="#fff" />
                  </TouchableOpacity>
                </View>
              ),
            }}
          />

          {/* Community */}
          <Tabs.Screen
            name="jobs"
            options={{
              title: "Jobs",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="briefcase-outline" size={size} color={color} />
              ),
            }}
          />

          {/* Profile */}
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person-outline" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
  },
  tabBar: {
    height: 72,
    paddingBottom: 10,
    paddingTop: 10,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    position: "absolute",
    backgroundColor: "#fff",
    elevation: 10,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
  },
  centerWrapper: {
    top: -25,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#0F172A", // dark circle
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});

// import { Tabs } from 'expo-router';
// import React from 'react';
//
// import { HapticTab } from '@/components/haptic-tab';
// import { IconSymbol } from '@/components/ui/icon-symbol';
// import { Colors } from '@/constants/theme';
// import { useColorScheme } from '@/hooks/use-color-scheme';
//
// export default function TabLayout() {
//   const colorScheme = useColorScheme();
//
//   return (
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
//         headerShown: false,
//         tabBarButton: HapticTab,
//       }}>
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: 'Home',
//           tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
//         }}
//       />
//       <Tabs.Screen
//         name="explore"
//         options={{
//           title: 'Explore',
//           tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
//         }}
//       />
//     </Tabs>
//   );
// }
