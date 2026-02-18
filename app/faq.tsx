import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const faqs = [
  {
    question: "What is Speak Prep?",
    answer:
      "Speak Prep is a learning app designed to improve your communication and speaking skills through structured topics and practice.",
  },
  {
    question: "Is the app free to use?",
    answer:
      "Yes, the app is free to use. Some features may include ads to support development.",
  },
  {
    question: "How do I get new topics?",
    answer:
      "New topics are added regularly, and you may receive notifications when new content is available.",
  },
  {
    question: "Do I need an account?",
    answer: "Yes, All features requires login for security",
  },
  {
    question: "How is my data used?",
    answer:
      "Your data is used to improve app functionality and personalize your experience. Please check our Privacy Policy for details.",
  },
  {
    question: "Can I delete my account?",
    answer:
      "Yes, you can request account deletion by contacting our support team.",
  },
  {
    question: "Why am I seeing ads?",
    answer:
      "Ads help us keep the app free. We use services like Google AdMob to display ads.",
  },
  {
    question: "How can I contact support?",
    answer:
      "You can contact us through the Contact Us page or email us at support@speakprep.com.",
  },
];

const FaqScreen = () => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(null);

  const toggle = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace("/(tabs)/profile")}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>FAQs</Text>
        <Text style={styles.headerSub}>Frequently Asked Questions</Text>
      </View>

      <ScrollView style={styles.content}>
        {faqs.map((item, index) => (
          <View key={index} style={styles.card}>
            {/* Question */}
            <TouchableOpacity
              style={styles.questionRow}
              onPress={() => toggle(index)}
            >
              <Text style={styles.question}>{item.question}</Text>
              <Ionicons
                name={activeIndex === index ? "chevron-up" : "chevron-down"}
                size={20}
                color="#555"
              />
            </TouchableOpacity>

            {/* Answer */}
            {activeIndex === index && (
              <Text style={styles.answer}>{item.answer}</Text>
            )}
          </View>
        ))}

        <Text style={styles.footer}>© 2026 Speak Prep</Text>
      </ScrollView>
    </View>
  );
};

export default FaqScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7fb",
  },

  header: {
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#6a11cb",
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
    color: "#e9d8fd",
    textAlign: "center",
    marginTop: 4,
  },

  content: {
    padding: 15,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 14,
    elevation: 3,
  },

  questionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  question: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 10,
  },

  answer: {
    marginTop: 10,
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },

  footer: {
    textAlign: "center",
    marginVertical: 20,
    color: "#999",
    fontSize: 12,
  },
});
