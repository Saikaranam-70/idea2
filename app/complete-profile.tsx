// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useRouter } from "expo-router";
// import React, { useEffect, useRef, useState } from "react";
// import {
//     ActivityIndicator,
//     Alert,
//     SafeAreaView,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     View,
// } from "react-native";
//
// const BASE_URL = "https://m6sqbdzm-5000.inc1.devtunnels.ms/user";
// const USERNAME_REGEX = /^[a-z0-9_]+$/;
//
// export default function CompleteProfile() {
//   const router = useRouter();
//
//   const [name, setName] = useState("");
//   const [username, setUsername] = useState("");
//
//   const [checking, setChecking] = useState(false);
//   const [available, setAvailable] = useState<boolean | null>(null);
//   const [valid, setValid] = useState(false);
//   const [suggestions, setSuggestions] = useState<string[]>([]);
//   const [submitting, setSubmitting] = useState(false);
//
//   const debounceRef = useRef<any>(null);
//
//   /* ---------------- USERNAME VALIDATION ---------------- */
//   useEffect(() => {
//     if (
//       username.length >= 3 &&
//       username.length <= 20 &&
//       USERNAME_REGEX.test(username)
//     ) {
//       setValid(true);
//     } else {
//       setValid(false);
//       setAvailable(null);
//     }
//   }, [username]);
//
//   /* ---------------- USERNAME CHECK (DEBOUNCED) ---------------- */
//   useEffect(() => {
//     if (!valid) return;
//
//     if (debounceRef.current) clearTimeout(debounceRef.current);
//
//     debounceRef.current = setTimeout(async () => {
//       try {
//         setChecking(true);
//         setSuggestions([]);
//
//         const res = await fetch(
//           `${BASE_URL}/check-username?username=${username}`,
//         );
//         const data = await res.json();
//
//         setAvailable(data.available);
//
//         if (!data.available) {
//           generateSuggestions(username);
//         }
//       } catch {
//         setAvailable(null);
//       } finally {
//         setChecking(false);
//       }
//     }, 600);
//
//     return () => clearTimeout(debounceRef.current);
//   }, [username, valid]);
//
//   /* ---------------- USERNAME SUGGESTIONS ---------------- */
//   const generateSuggestions = (base: string) => {
//     const random = Math.floor(Math.random() * 1000);
//     setSuggestions([`${base}_${random}`, `${base}${random}`, `${base}_gita`]);
//   };
//
//   /* ---------------- SUBMIT PROFILE ---------------- */
//   const submitProfile = async () => {
//     if (!name || !valid || !available) {
//       Alert.alert("Fix errors before continuing");
//       return;
//     }
//
//     try {
//       setSubmitting(true);
//
//       const token = await AsyncStorage.getItem("token");
//       console.log(token)
//
//       const res = await fetch(`${BASE_URL}/complete-profile`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ name, username }),
//       });
//
// //       const data = await res.json();
// //       await AsyncStorage.removeItem("user");
// //       await AsyncStorage.setItem("user", JSON.stringify(data.user));
// //       console.log(data);
// //       if (!res.ok) throw new Error(data.message);
// //
// //         router.replace("/(tabs)");
//
// const data = await res.json();
//
// if (!res.ok) {
//   throw new Error(data.message || "Something went wrong");
// }
//
// if (!data.user) {
//   throw new Error("User data missing from server");
// }
//
// await AsyncStorage.setItem("user", JSON.stringify(data.user));
// router.replace("/(tabs)");
//
//
//     } catch (err: any) {
//       Alert.alert("Error", err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };
//
//   return (
//     <SafeAreaView style={styles.safe}>
//       <View style={styles.card}>
//         <Text style={styles.title}>Complete Profile</Text>
//         <Text style={styles.subtitle}>
//           Choose a unique username to continue
//         </Text>
//
//         {/* NAME */}
//         <Text style={styles.label}>Full Name</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Your full name"
//           value={name}
//           onChangeText={setName}
//         />
//
//         {/* USERNAME */}
//         <Text style={styles.label}>Username</Text>
//         <View style={styles.usernameBox}>
//           <TextInput
//             style={styles.usernameInput}
//             placeholder="username"
//             autoCapitalize="none"
//             value={username}
//             onChangeText={(text) =>
//               setUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, ""))
//             }
//           />
//
//           {checking && <ActivityIndicator size="small" />}
//           {!checking && available && <Text style={styles.ok}>✓</Text>}
//           {!checking && available === false && (
//             <Text style={styles.bad}>✕</Text>
//           )}
//         </View>
//
//         {/* RULES */}
//         <View style={styles.rules}>
//           <Rule ok={username.length >= 3}>3–20 characters</Rule>
//           <Rule ok={USERNAME_REGEX.test(username)}>
//             Only lowercase letters, numbers, _
//           </Rule>
//         </View>
//
//         {/* SUGGESTIONS */}
//         {available === false && suggestions.length > 0 && (
//           <View style={styles.suggestions}>
//             <Text style={styles.suggestTitle}>Suggestions</Text>
//             {suggestions.map((s) => (
//               <TouchableOpacity key={s} onPress={() => setUsername(s)}>
//                 <Text style={styles.suggestItem}>{s}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         )}
//
//         {/* SUBMIT */}
//         <TouchableOpacity
//           style={[
//             styles.button,
//             (!available || submitting) && { opacity: 0.6 },
//           ]}
//           onPress={submitProfile}
//           disabled={!available || submitting}
//         >
//           <Text style={styles.buttonText}>
//             {submitting ? "Saving..." : "Continue →"}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }
//
// /* ---------------- RULE COMPONENT ---------------- */
// const Rule = ({ ok, children }: any) => (
//   <Text style={{ color: ok ? "green" : "#999", fontSize: 12 }}>
//     • {children}
//   </Text>
// );
//
// /* ---------------- STYLES ---------------- */
//
// const styles = StyleSheet.create({
//   safe: {
//     flex: 1,
//     backgroundColor: "#FFF9ED",
//     justifyContent: "center",
//   },
//   card: {
//     backgroundColor: "#FFFDF6",
//     margin: 20,
//     borderRadius: 24,
//     padding: 24,
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: "700",
//     marginBottom: 6,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: "#666",
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: "600",
//     marginBottom: 6,
//   },
//   input: {
//     height: 52,
//     borderWidth: 1,
//     borderColor: "#E5DDAF",
//     borderRadius: 14,
//     paddingHorizontal: 14,
//     marginBottom: 16,
//   },
//   usernameBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#E5DDAF",
//     borderRadius: 14,
//     paddingHorizontal: 14,
//     height: 52,
//   },
//   usernameInput: {
//     flex: 1,
//   },
//   ok: {
//     color: "green",
//     fontSize: 18,
//   },
//   bad: {
//     color: "red",
//     fontSize: 18,
//   },
//   rules: {
//     marginTop: 8,
//     marginBottom: 12,
//   },
//   suggestions: {
//     marginBottom: 12,
//   },
//   suggestTitle: {
//     fontWeight: "600",
//     marginBottom: 6,
//   },
//   suggestItem: {
//     color: "#C9A600",
//     marginBottom: 4,
//   },
//   button: {
//     backgroundColor: "#F2C200",
//     paddingVertical: 16,
//     borderRadius: 16,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   buttonText: {
//     fontSize: 16,
//     fontWeight: "700",
//   },
// });

import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const BASE_URL = "https://oneserve.in/user";
const USERNAME_REGEX = /^[a-z0-9_]+$/;

export default function CompleteProfile() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [valid, setValid] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const debounceRef = useRef<any>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 100,
        duration: 1200,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  /* ---------------- USERNAME VALIDATION ---------------- */
  useEffect(() => {
    if (
      username.length >= 3 &&
      username.length <= 20 &&
      USERNAME_REGEX.test(username)
    ) {
      setValid(true);
    } else {
      setValid(false);
      setAvailable(null);
    }
  }, [username]);

  /* ---------------- USERNAME CHECK (DEBOUNCED) ---------------- */
  useEffect(() => {
    if (!valid) {
      setAvailable(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        setChecking(true);
        setSuggestions([]);

        const res = await fetch(
          `${BASE_URL}/check-username?username=${username}`,
        );
        const data = await res.json();

        setAvailable(data.available);

        if (!data.available) {
          generateSuggestions(username);
        }
      } catch {
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 600);

    return () => clearTimeout(debounceRef.current);
  }, [username, valid]);

  /* ---------------- USERNAME SUGGESTIONS ---------------- */
  const generateSuggestions = (base: string) => {
    const random = Math.floor(Math.random() * 1000);
    setSuggestions([
      `${base}_${random}`,
      `${base}${random}`,
      `${base}_speaker`,
      `${base}_learner`,
    ]);
  };

  /* ---------------- SUBMIT PROFILE ---------------- */
  const submitProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Name Required", "Please enter your full name");
      return;
    }

    if (!valid || !available) {
      Alert.alert("Invalid Username", "Please choose a valid username");
      return;
    }

    try {
      setSubmitting(true);

      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/complete-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, username }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      if (!data.user) {
        throw new Error("User data missing from server");
      }

      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      // Success animation
      Animated.spring(slideAnim, {
        toValue: -100,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        router.replace("/(tabs)");
      }, 300);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Background Gradient */}
          <LinearGradient
            colors={["#8B5CF6", "#7C3AED"]}
            style={styles.background}
          />

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[styles.progressFill, { width: progressAnim }]}
              />
            </View>
            <Text style={styles.progressText}>Step 2 of 2</Text>
          </View>

          <Animated.View
            style={[
              styles.container,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color="#8B5CF6" />
              </TouchableOpacity>

              <View style={styles.titleContainer}>
                <Text style={styles.title}>Complete Your Profile</Text>
                <Text style={styles.subtitle}>
                  Choose your name and username to get started
                </Text>
              </View>
            </View>

            {/* Form Card */}
            <View style={styles.card}>
              {/* Name Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputLabelContainer}>
                  <Feather
                    name="user"
                    size={18}
                    color="#8B5CF6"
                    style={styles.inputIcon}
                  />
                  <Text style={styles.label}>Full Name</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                  autoFocus
                />
                {name.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => setName("")}
                  >
                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Username Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputLabelContainer}>
                  <Feather
                    name="at-sign"
                    size={18}
                    color="#8B5CF6"
                    style={styles.inputIcon}
                  />
                  <Text style={styles.label}>Username</Text>
                </View>
                <View
                  style={[
                    styles.usernameInputWrapper,
                    isFocused && styles.usernameInputFocused,
                    available === true && styles.usernameInputAvailable,
                    available === false && styles.usernameInputUnavailable,
                  ]}
                >
                  <TextInput
                    style={styles.usernameInput}
                    placeholder="Choose a unique username"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                    value={username}
                    onChangeText={(text) =>
                      setUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                    }
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  />
                  <View style={styles.usernameStatus}>
                    {checking ? (
                      <ActivityIndicator size="small" color="#8B5CF6" />
                    ) : available === true ? (
                      <View style={styles.statusBadgeSuccess}>
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      </View>
                    ) : available === false ? (
                      <View style={styles.statusBadgeError}>
                        <Ionicons name="close" size={16} color="#fff" />
                      </View>
                    ) : null}
                  </View>
                </View>

                {/* Username Rules */}
                <View style={styles.rulesContainer}>
                  <Rule
                    ok={username.length >= 3 && username.length <= 20}
                    text="3-20 characters"
                  />
                  <Rule
                    ok={USERNAME_REGEX.test(username)}
                    text="Lowercase letters, numbers, and underscores only"
                  />
                  <Rule
                    ok={available === true}
                    text="Must be unique and available"
                  />
                </View>

                {/* Username Suggestions */}
                {available === false && suggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <Text style={styles.suggestionsTitle}>
                      Try these instead:
                    </Text>
                    <View style={styles.suggestionsGrid}>
                      {suggestions.map((suggestion, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.suggestionChip}
                          onPress={() => setUsername(suggestion)}
                        >
                          <Text style={styles.suggestionText}>
                            {suggestion}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Username Tips */}
                <View style={styles.tipsContainer}>
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color="#8B5CF6"
                  />
                  <Text style={styles.tipsText}>
                    This username will be visible to other learners and cannot
                    be changed later
                  </Text>
                </View>
              </View>

              {/* Next Button */}
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  (!name.trim() || !valid || !available || submitting) &&
                    styles.nextButtonDisabled,
                ]}
                onPress={submitProfile}
                disabled={!name.trim() || !valid || !available || submitting}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#8B5CF6", "#7C3AED"]}
                  style={styles.nextButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.nextButtonText}>Complete Setup</Text>
                      <Ionicons name="arrow-forward" size={22} color="#fff" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Skip for Now */}
              <TouchableOpacity
                style={styles.skipButton}
                onPress={() => router.replace("/(tabs)")}
              >
                <Text style={styles.skipText}>Skip for now</Text>
                <Ionicons name="arrow-forward" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Decorative Elements */}
          <View style={styles.decorationContainer}>
            <View style={styles.decorationCircle1} />
            <View style={styles.decorationCircle2} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------------- RULE COMPONENT ---------------- */
const Rule = ({ ok, text }: { ok: boolean; text: string }) => (
  <View style={styles.ruleItem}>
    <Ionicons
      name={ok ? "checkmark-circle" : "close-circle"}
      size={16}
      color={ok ? "#10B981" : "#EF4444"}
    />
    <Text style={[styles.ruleText, { color: ok ? "#10B981" : "#6B7280" }]}>
      {text}
    </Text>
  </View>
);

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "25%",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#8B5CF6",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    textAlign: "right",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    height: 56,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  clearButton: {
    position: "absolute",
    right: 16,
    top: 38,
  },
  usernameInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  usernameInputFocused: {
    borderColor: "#8B5CF6",
    backgroundColor: "#F5F3FF",
  },
  usernameInputAvailable: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  usernameInputUnavailable: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  usernameInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
  usernameStatus: {
    paddingHorizontal: 16,
  },
  statusBadgeSuccess: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadgeError: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  rulesContainer: {
    marginTop: 12,
    gap: 8,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ruleText: {
    fontSize: 13,
    flex: 1,
  },
  suggestionsContainer: {
    marginTop: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  suggestionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#8B5CF6",
  },
  suggestionText: {
    fontSize: 13,
    color: "#8B5CF6",
    fontWeight: "500",
  },
  tipsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F3FF",
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  tipsText: {
    fontSize: 12,
    color: "#5B21B6",
    flex: 1,
    lineHeight: 16,
  },
  nextButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 16,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
  },
  skipText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  decorationContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: -1,
  },
  decorationCircle1: {
    position: "absolute",
    bottom: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
  },
  decorationCircle2: {
    position: "absolute",
    bottom: 30,
    left: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(139, 92, 246, 0.05)",
  },
});
