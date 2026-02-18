import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, Text, useColorScheme, View } from "react-native";

export default function SplashScreen() {
  const theme = useColorScheme();
  const router = useRouter();
  const isDark = theme === "dark";

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(tabs)");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0E0E0E" : "#F9FAFB" },
      ]}
    >
      {/* Logo */}
      <Image
        source={require("../assets/images/logo.webp")}
        style={styles.image}
      />

      {/* App Name */}
      <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#0B1B34" }]}>
        SpeakPrep
      </Text>

      {/* Tagline */}
      <Text
        style={[styles.subtitle, { color: isDark ? "#B5B5B5" : "#4B5563" }]}
      >
        Learn concepts.
      </Text>
      <Text
        style={[styles.subtitle, { color: isDark ? "#B5B5B5" : "#4B5563" }]}
      >
        Speak with confidence.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  image: {
    width: 160,
    height: 160,
    borderRadius: 80,
    marginBottom: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
});
