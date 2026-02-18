import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const categories = ["Bug", "Feature Request", "Suggestion", "Other"];

const FeedbackScreen = () => {
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!selectedCategory || !message) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    Alert.alert("Thank You!", "Your feedback has been submitted");
    setRating(0);
    setSelectedCategory("");
    setMessage("");
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

        <Text style={styles.headerTitle}>Feedback</Text>
        <Text style={styles.headerSub}>Help us improve</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Rating */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Rate Your Experience</Text>

          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={30}
                  color="#FFD700"
                  style={{ marginHorizontal: 5 }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Feedback Type</Text>

          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryBtn,
                  selectedCategory === cat && styles.selectedCategory,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat && styles.selectedCategoryText,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Message */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Your Feedback</Text>

          <TextInput
            placeholder="Write your feedback..."
            style={styles.input}
            multiline
            value={message}
            onChangeText={setMessage}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit Feedback</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Thank you for helping us improve!</Text>
      </ScrollView>
    </View>
  );
};

export default FeedbackScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7fb",
  },

  header: {
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#ff9966",
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
    color: "#ffe6d5",
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
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },

  ratingRow: {
    flexDirection: "row",
    justifyContent: "center",
  },

  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },

  categoryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 8,
    marginBottom: 8,
  },

  selectedCategory: {
    backgroundColor: "#ff9966",
    borderColor: "#ff9966",
  },

  categoryText: {
    fontSize: 13,
    color: "#555",
  },

  selectedCategoryText: {
    color: "#fff",
    fontWeight: "bold",
  },

  input: {
    height: 120,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    textAlignVertical: "top",
    backgroundColor: "#f9fafc",
  },

  button: {
    backgroundColor: "#ff9966",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    elevation: 4,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  footer: {
    textAlign: "center",
    marginTop: 15,
    color: "#777",
    fontSize: 12,
  },
});
