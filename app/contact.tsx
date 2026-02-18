import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const ContactScreen = () => {
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submitForm = () => {
    if (!name || !email || !message) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    Alert.alert("Success", "Message sent successfully!");
    setName("");
    setEmail("");
    setMessage("");
    setRating(0);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace("/(tabs)/profile")}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Contact Us</Text>
          <Text style={styles.headerSub}>We’d love to hear from you</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Contact Info */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Contact Information</Text>

            <Text style={styles.info}>📧 Email: support@speakprep.com</Text>
            <Text style={styles.info}>📞 Phone: +91 98765 43210</Text>
            <Text style={styles.info}>📍 Location: India</Text>
          </View>

          {/* Social Media */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Follow Us</Text>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.icon}>
                <FontAwesome name="instagram" size={22} color="#E1306C" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.icon}>
                <FontAwesome name="youtube" size={22} color="#FF0000" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.icon}>
                <FontAwesome name="twitter" size={22} color="#1DA1F2" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.icon}>
                <FontAwesome name="linkedin" size={22} color="#0077B5" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Rate Us</Text>

            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={28}
                    color="#FFD700"
                    style={{ marginHorizontal: 5 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Contact Form */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Send Message</Text>

            <TextInput
              placeholder="Your Name"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              placeholder="Your Email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              placeholder="Your Message"
              style={[styles.input, { height: 100 }]}
              multiline
              value={message}
              onChangeText={setMessage}
            />

            <TouchableOpacity style={styles.button} onPress={submitForm}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            © 2026 Speak Prep. All rights reserved.
          </Text>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ContactScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f6fb",
  },

  header: {
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#ff7e5f",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
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
    color: "#ffe0d6",
    textAlign: "center",
    marginTop: 4,
  },

  content: {
    padding: 15,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 4,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },

  info: {
    fontSize: 14,
    marginBottom: 6,
    color: "#555",
  },

  socialRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },

  icon: {
    backgroundColor: "#f1f3f6",
    padding: 12,
    borderRadius: 50,
    elevation: 3,
  },

  ratingRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },

  input: {
    backgroundColor: "#f9fafc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  button: {
    backgroundColor: "#ff7e5f",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  footer: {
    textAlign: "center",
    marginVertical: 20,
    color: "#999",
    fontSize: 12,
  },
});
