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

const TermsOfServiceScreen = () => {
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

        <Text style={styles.headerTitle}>Terms of Service</Text>
        <Text style={styles.headerSub}>Please read carefully</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <PolicySection
          title="1. Acceptance of Terms"
          text="By using this app, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the app."
        />

        <PolicySection
          title="2. Use of the App"
          text="You agree to use the app only for lawful purposes. You must not misuse, copy, or attempt to disrupt the app’s functionality."
        />

        <PolicySection
          title="3. User Accounts"
          text="You are responsible for maintaining the confidentiality of your account information. Any activity under your account is your responsibility."
        />

        <PolicySection
          title="4. Content Usage"
          text="All content in the app, including text, images, and materials, is owned by us or licensed to us. You may not reproduce or distribute content without permission."
        />

        <PolicySection
          title="5. Ads & Third-Party Services"
          text="This app may display ads through Google AdMob and use third-party services. These services may collect data as per their own policies."
        />

        <PolicySection
          title="6. Limitation of Liability"
          text="We are not responsible for any damages resulting from the use or inability to use the app. The app is provided 'as is' without warranties."
        />

        <PolicySection
          title="7. Termination"
          text="We reserve the right to suspend or terminate access to the app at any time without notice if users violate these terms."
        />

        <PolicySection
          title="8. Changes to Terms"
          text="We may update these Terms of Service from time to time. Continued use of the app means you accept the updated terms."
        />

        <PolicySection
          title="9. Governing Law"
          text="These terms are governed by the laws of your country. Any disputes will be handled in accordance with applicable laws."
        />

        <PolicySection
          title="10. Contact Us"
          text="If you have any questions about these Terms, contact us at: support@speakprep.com"
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

export default TermsOfServiceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },

  header: {
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#4a00e0",
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
    color: "#e0e7ff",
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
    color: "#4a00e0",
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
