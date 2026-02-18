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

const PrivacyPolicyScreen = () => {
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

        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <Text style={styles.headerSub}>Your data is safe with us</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <PolicySection
          title="1. Information We Collect"
          text="We collect personal information such as your name, email address, and usage data to improve our services. We may also collect device information like device type, OS version, and app activity."
        />

        <PolicySection
          title="2. How We Use Your Information"
          text="Your information is used to provide and improve app features, personalize your experience, send notifications, and enhance performance."
        />

        <PolicySection
          title="3. AdMob & Advertising"
          text="We may use Google AdMob to display ads. AdMob may collect and use data such as device identifiers, cookies, and usage data to provide personalized and non-personalized ads."
        />

        <PolicySection
          title="4. Third-Party Services"
          text="We may use third-party services like Google Analytics and Firebase. These services may collect data according to their own privacy policies."
        />

        <PolicySection
          title="5. Data Security"
          text="We implement appropriate security measures to protect your personal data. However, no method of transmission over the internet is completely secure."
        />

        <PolicySection
          title="6. Children's Privacy"
          text="Our app is not intended for children under 13. We do not knowingly collect personal data from children."
        />

        <PolicySection
          title="7. Your Rights"
          text="You can request access, correction, or deletion of your personal data by contacting us."
        />

        <PolicySection
          title="8. Changes to This Policy"
          text="We may update this privacy policy from time to time. Any changes will be reflected on this page."
        />

        <PolicySection
          title="9. Contact Us"
          text="If you have any questions, contact us at: support@speakprep.com"
        />

        <Text style={styles.footer}>Last Updated: February 2026</Text>
      </ScrollView>
    </View>
  );
};

const PolicySection = ({ title, text }) => (
  <View style={styles.card}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.text}>{text}</Text>
  </View>
);

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },

  header: {
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#2a5298",
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
    color: "#dbeafe",
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
    color: "#2a5298",
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
