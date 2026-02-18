import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const AboutScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace("/(tabs)/profile")}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>About Us</Text>
        <Text style={styles.headerSub}>Know more about our app</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Section
          title="About Speak Prep"
          text="Speak Prep is designed to help users improve their communication and learning skills through structured topics, practice sessions, and smart notifications."
        />

        <Section
          title="Our Mission"
          text="Our mission is to make learning easy, accessible, and effective for everyone by providing high-quality content and a smooth user experience."
        />

        <Section
          title="Features"
          text="• Practice speaking topics\n• Get daily learning updates\n• Track your progress\n• Simple and user-friendly design\n• Continuous improvements"
        />

        <Section
          title="Why Choose Us"
          text="We focus on simplicity, performance, and real value for users. Our goal is to build a platform that truly helps users improve their skills."
        />

        <Section title="Contact" text="Email: support@speakprep.com" />

        <Section title="Version" text="App Version: 1.0.0" />

        <Text style={styles.footer}>
          © 2026 Speak Prep. All rights reserved.
        </Text>
      </ScrollView>
    </View>
  );
};

const Section = ({ title, text }) => (
  <View style={styles.card}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.text}>{text}</Text>
  </View>
);

export default AboutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },

  header: {
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#11998e",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 6,
  },

  backBtn: {
    position: "absolute",
    top: 50,
    left: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 6,
    borderRadius: 20,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },

  headerSub: {
    fontSize: 13,
    color: "#d1fae5",
    textAlign: "center",
    marginTop: 4,
  },

  content: {
    padding: 15,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#11998e",
    marginBottom: 6,
  },

  text: {
    fontSize: 13,
    color: "#444",
    lineHeight: 19,
  },

  footer: {
    textAlign: "center",
    marginVertical: 20,
    color: "#999",
    fontSize: 12,
  },
});
