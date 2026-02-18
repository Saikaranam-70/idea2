// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useRouter } from "expo-router";
// import React, { useRef, useState } from "react";
// import {
//     Alert,
//     Image,
//     KeyboardAvoidingView,
//     Platform,
//     SafeAreaView,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     View,
// } from "react-native";

// const BASE_URL = "https://m6sqbdzm-5000.inc1.devtunnels.ms/user";

// export default function LoginScreen() {
//   const router = useRouter();

//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState(["", "", "", ""]);
//   const [otpSent, setOtpSent] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const otpRefs = useRef<Array<TextInput | null>>([]);

//   /* ---------------- SEND OTP ---------------- */
//   const sendOTP = async () => {
//     if (!email.includes("@")) {
//       Alert.alert("Invalid Email");
//       return;
//     }

//     try {
//       setLoading(true);

//       const res = await fetch(`${BASE_URL}/send-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);

//       setOtpSent(true);
//       setOtp(["", "", "", ""]);
//       setTimeout(() => otpRefs.current[0]?.focus(), 300);
//     } catch (err: any) {
//       Alert.alert("Error", err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ---------------- VERIFY OTP ---------------- */
//   const verifyOTP = async (otpArray = otp) => {
//     const enteredOtp = otpArray.join("");
//     if (enteredOtp.length !== 4) return;

//     try {
//       setLoading(true);

//       const res = await fetch(`${BASE_URL}/verify-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, otp: enteredOtp }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);

//       await AsyncStorage.setItem("token", data.token);
//       await AsyncStorage.setItem("user", JSON.stringify(data.user));

//       if (!data.isProfileComplete) {
//         router.replace("/complete-profile");
//       } else {
//         router.replace("/(tabs)");
//       }
//     } catch (err: any) {
//       Alert.alert("Error", err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ---------------- OTP INPUT HANDLER ---------------- */
//   const handleOtpChange = (value: string, index: number) => {
//     if (!/^\d?$/.test(value)) return;

//     const updatedOtp = [...otp];
//     updatedOtp[index] = value;
//     setOtp(updatedOtp);

//     if (value && index < 3) {
//       otpRefs.current[index + 1]?.focus();
//     }

//     // AUTO SUBMIT ON LAST DIGIT
//     if (value && index === 3) {
//       verifyOTP(updatedOtp);
//     }
//   };

//   /* ---------------- SKIP LOGIN ---------------- */
//   const skipLogin = async () => {
//     await AsyncStorage.setItem("guest", "true");
//     router.replace("/(tabs)");
//   };

//   return (
//     <SafeAreaView style={styles.safe}>
//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
//       >
//         <ScrollView
//           contentContainerStyle={{ flexGrow: 1 }}
//           keyboardShouldPersistTaps="handled"
//         >
//           <Image
//             source={require("../assets/images/logo.webp")}
//             style={styles.headerImage}
//           />

//           <View style={styles.card}>
//             <Text style={styles.title}>SpeakPrep</Text>
//             <Text style={styles.subtitle}>
//               Continue your preparation journey
//             </Text>

//             {/* EMAIL */}
//             <Text style={styles.label}>Email Address</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="example@email.com"
//               keyboardType="email-address"
//               autoCapitalize="none"
//               value={email}
//               onChangeText={setEmail}
//             />

//             {!otpSent && (
//               <TouchableOpacity
//                 style={styles.button}
//                 onPress={sendOTP}
//                 disabled={loading}
//               >
//                 <Text style={styles.buttonText}>
//                   {loading ? "Sending OTP..." : "Send OTP"}
//                 </Text>
//               </TouchableOpacity>
//             )}

//             {/* OTP INPUT */}
//             {otpSent && (
//               <>
//                 <Text style={styles.label}>Enter OTP</Text>

//                 <View style={styles.otpContainer}>
//                   {otp.map((digit, index) => (
//                     <TextInput
//                       key={index}
//                       ref={(ref) => (otpRefs.current[index] = ref)}
//                       style={styles.otpBox}
//                       keyboardType="number-pad"
//                       maxLength={1}
//                       value={digit}
//                       autoFocus={index === 0}
//                       onChangeText={(val) => handleOtpChange(val, index)}
//                     />
//                   ))}
//                 </View>

//                 {/* VERIFY BUTTON */}
//                 <TouchableOpacity
//                   style={styles.button}
//                   onPress={() => verifyOTP()}
//                   disabled={loading || otp.join("").length !== 4}
//                 >
//                   <Text style={styles.buttonText}>
//                     {loading ? "Verifying..." : "Verify OTP"}
//                   </Text>
//                 </TouchableOpacity>
//               </>
//             )}

//             {/* SKIP */}
//             <TouchableOpacity onPress={skipLogin}>
//               <Text style={styles.skip}>Skip for now</Text>
//             </TouchableOpacity>

//             <Text style={styles.footer}>
//               By continuing, you agree to our{" "}
//               <Text style={styles.link}>Terms</Text> &{" "}
//               <Text style={styles.link}>Privacy Policy</Text>.
//             </Text>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// /* ---------------- STYLES ---------------- */

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: "#FFF9ED" },
//   headerImage: { width: "100%", height: 360 },
//   card: {
//     backgroundColor: "#FFFDF6",
//     borderTopLeftRadius: 28,
//     borderTopRightRadius: 28,
//     padding: 24,
//     marginTop: -40,
//   },
//   title: { fontSize: 26, fontWeight: "700", textAlign: "center" },
//   subtitle: {
//     fontSize: 14,
//     color: "#666",
//     textAlign: "center",
//     marginBottom: 22,
//   },
//   label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
//   input: {
//     height: 52,
//     borderWidth: 1,
//     borderColor: "#E5DDAF",
//     borderRadius: 14,
//     paddingHorizontal: 14,
//     marginBottom: 18,
//   },
//   otpContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 18,
//   },
//   otpBox: {
//     width: 52,
//     height: 52,
//     borderWidth: 1,
//     borderColor: "#E5DDAF",
//     borderRadius: 12,
//     textAlign: "center",
//     fontSize: 18,
//   },
//   button: {
//     backgroundColor: "#F2C200",
//     paddingVertical: 16,
//     borderRadius: 16,
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   buttonText: { fontSize: 16, fontWeight: "700" },
//   skip: {
//     textAlign: "center",
//     color: "#C9A600",
//     marginVertical: 10,
//     fontWeight: "600",
//   },
//   footer: {
//     fontSize: 12,
//     color: "#777",
//     textAlign: "center",
//   },
//   link: { fontWeight: "600" },
// });

import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
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

export default function LoginScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState("login"); // "login" or "signup"

  const otpRefs = useRef<Array<TextInput | null>>([]);

  React.useEffect(() => {
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
    ]).start();
  }, []);

  /* ---------------- SEND OTP ---------------- */
  const sendOTP = async () => {
    if (!email.includes("@") || !email.includes(".")) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      console.log(data);

      setOtpSent(true);
      setOtp(["", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 300);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- VERIFY OTP ---------------- */
  const verifyOTP = async (otpArray = otp) => {
    const enteredOtp = otpArray.join("");
    if (enteredOtp.length !== 4) {
      Alert.alert("Invalid OTP", "Please enter 4-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: enteredOtp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      // Success animation
      Animated.spring(slideAnim, {
        toValue: -100,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        if (!data.isProfileComplete) {
          router.replace("/complete-profile");
        } else {
          router.replace("/(tabs)");
        }
      }, 300);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Invalid OTP");
      // Shake animation on error
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- OTP INPUT HANDLER ---------------- */
  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < 3) {
      otpRefs.current[index + 1]?.focus();
    } else if (!value && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }

    // AUTO SUBMIT ON LAST DIGIT
    if (value && index === 3) {
      verifyOTP(updatedOtp);
    }
  };

  /* ---------------- SKIP LOGIN ---------------- */
  const skipLogin = async () => {
    await AsyncStorage.setItem("guest", "true");
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Background Gradient */}
          <LinearGradient
            colors={["#8B5CF6", "#7C3AED", "#6D28D9"]}
            style={styles.background}
          />

          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Ionicons name="mic" size={40} color="#8B5CF6" />
              </View>
              <Text style={styles.appName}>SpeakPrep</Text>
            </View>
            <Text style={styles.tagline}>Master Your Speaking Skills</Text>
          </Animated.View>

          {/* Login Card */}
          <Animated.View
            style={[
              styles.card,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Mode Selector */}
            <View style={styles.modeSelector}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  mode === "login" && styles.modeButtonActive,
                ]}
                onPress={() => setMode("login")}
              >
                <Text
                  style={[
                    styles.modeText,
                    mode === "login" && styles.modeTextActive,
                  ]}
                >
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  mode === "signup" && styles.modeButtonActive,
                ]}
                onPress={() => setMode("signup")}
              >
                <Text
                  style={[
                    styles.modeText,
                    mode === "signup" && styles.modeTextActive,
                  ]}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Welcome Text */}
            <Text style={styles.welcomeText}>
              {mode === "login" ? "Welcome Back!" : "Join SpeakPrep Today!"}
            </Text>
            <Text style={styles.instructionText}>
              {mode === "login"
                ? "Enter your email to continue learning"
                : "Start your speaking journey with us"}
            </Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Feather name="mail" size={20} color="#8B5CF6" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!otpSent}
              />
            </View>

            {/* OTP Input Section */}
            {otpSent && (
              <Animated.View
                style={[
                  styles.otpSection,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: fadeAnim }],
                  },
                ]}
              >
                <Text style={styles.otpTitle}>Enter verification code</Text>
                <Text style={styles.otpSubtitle}>
                  We sent a 4-digit code to {email}
                </Text>

                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <View key={index} style={styles.otpBoxWrapper}>
                      <TextInput
                        ref={(ref) => (otpRefs.current[index] = ref)}
                        style={[styles.otpBox, digit && styles.otpBoxFilled]}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={digit}
                        autoFocus={index === 0}
                        onChangeText={(val) => handleOtpChange(val, index)}
                        selectionColor="#8B5CF6"
                      />
                      {index < 3 && <View style={styles.otpSeparator} />}
                    </View>
                  ))}
                </View>

                {/* Resend OTP */}
                <TouchableOpacity style={styles.resendContainer}>
                  <Text style={styles.resendText}>Didn't receive code? </Text>
                  <Text style={styles.resendLink}>Resend</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {!otpSent ? (
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={sendOTP}
                  disabled={loading || !email}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#8B5CF6", "#7C3AED"]}
                    style={styles.buttonGradient}
                  >
                    {loading ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator color="#fff" size="small" />
                        <Text style={styles.buttonText}>Sending OTP...</Text>
                      </View>
                    ) : (
                      <>
                        <Ionicons name="send" size={20} color="#fff" />
                        <Text style={styles.buttonText}>Send OTP</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.button,
                    (loading || otp.join("").length !== 4) &&
                      styles.buttonDisabled,
                  ]}
                  onPress={() => verifyOTP()}
                  disabled={loading || otp.join("").length !== 4}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#10B981", "#059669"]}
                    style={styles.buttonGradient}
                  >
                    {loading ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator color="#fff" size="small" />
                        <Text style={styles.buttonText}>Verifying...</Text>
                      </View>
                    ) : (
                      <>
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#fff"
                        />
                        <Text style={styles.buttonText}>Verify OTP</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {/* Skip Button */}
              {/* <TouchableOpacity
                style={styles.skipButton}
                onPress={skipLogin}
                activeOpacity={0.7}
              >
                <Text style={styles.skipText}>
                  <Ionicons name="arrow-forward" size={16} color="#6B7280" />
                  {"  "}Continue as Guest
                </Text>
              </TouchableOpacity> */}
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login */}
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Image
                  source={{
                    uri: "https://cdn-icons-png.flaticon.com/512/300/300221.png",
                  }}
                  style={styles.socialIcon}
                />
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-apple" size={24} color="#000" />
                <Text style={styles.socialText}>Apple</Text>
              </TouchableOpacity> */}
            </View>

            {/* Footer Terms */}
            <Text style={styles.footer}>
              By continuing, you agree to our{" "}
              <Text
                // onPress={() => router.navigate("/terms")}
                style={styles.link}
              >
                Terms
              </Text>{" "}
              and{" "}
              <Text
                // onPress={() => router.navigate("/privacy-policy")}
                style={styles.link}
              >
                Privacy Policy
              </Text>
            </Text>
          </Animated.View>

          {/* Bottom Decoration */}
          {/*<View style={styles.bottomDecoration}>
            <View style={styles.wave} />
          </View>*/}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
    left: 0,
    right: 0,
    top: 0,
    height: "40%",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 30,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 28,
    padding: 24,
    marginTop: 20,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 15,
  },
  modeSelector: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modeButtonActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  modeTextActive: {
    color: "#8B5CF6",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    marginBottom: 20,
    overflow: "hidden",
  },
  inputIcon: {
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
  otpSection: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  otpTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  otpSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  otpBoxWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  otpBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    backgroundColor: "#fff",
  },
  otpBoxFilled: {
    borderColor: "#8B5CF6",
    backgroundColor: "#F5F3FF",
  },
  otpSeparator: {
    width: 10,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  resendText: {
    fontSize: 14,
    color: "#6B7280",
  },
  resendLink: {
    fontSize: 14,
    color: "#8B5CF6",
    fontWeight: "600",
  },
  buttonContainer: {
    marginBottom: 24,
  },
  button: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  skipText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  socialIcon: {
    width: 20,
    height: 20,
  },
  socialText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  footer: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
  },
  link: {
    color: "#8B5CF6",
    fontWeight: "600",
  },
  bottomDecoration: {
    height: 10,
    width: "100%",
    overflow: "hidden",
    marginTop: -20,
  },
  wave: {
    height: 60,
    backgroundColor: "#8B5CF6",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
});
