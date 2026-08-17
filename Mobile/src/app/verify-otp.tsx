import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

export default function VerifyOTPScreen() {
  const { authUser, setAuthUser, logout } = useAuth();
  const router = useRouter();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const email = authUser?.user?.email || '';

  // Countdown timer for Resend OTP
  useEffect(() => {
    let interval: any = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setErrorMsg('Please enter a 6-digit verification code');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await axios.post('/api/user/verify-otp', {
        email,
        otp,
      });

      if (response.data && response.data.user) {
        // Update context & storage
        const updatedAuth = { ...authUser!, user: response.data.user };
        await setAuthUser(updatedAuth);
        router.replace('/');
      }
    } catch (error: any) {
      if (error.response) {
        setErrorMsg(error.response.data.error || 'Verification failed');
      } else {
        setErrorMsg('Network error. Check your server.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await axios.post('/api/user/resend-otp', { email });
      setSuccessMsg('Verification code resent successfully!');
      setTimer(60);
      setCanResend(false);
    } catch (error: any) {
      if (error.response) {
        setErrorMsg(error.response.data.error || 'Failed to resend code');
      } else {
        setErrorMsg('Network error. Check your server.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          
          {/* Background decorative glows */}
          <View style={styles.topGlow} pointerEvents="none" />
          <View style={styles.bottomGlow} pointerEvents="none" />

          {/* Logo / Header Area */}
          <View style={styles.headerArea}>
            <View style={styles.logoWrapper}>
              <Ionicons name="shield-checkmark" size={32} color="#60A5FA" />
            </View>
            <Text style={styles.brandTitle}>Verify Email</Text>
            <Text style={styles.brandSubtitle}>We sent a 6-digit verification code to</Text>
            <Text style={styles.emailText}>{email}</Text>
          </View>

          {/* Form Area */}
          <View style={styles.formCard}>
            {errorMsg ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {successMsg ? (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={styles.successText}>{successMsg}</Text>
              </View>
            ) : null}

            {/* OTP Code Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ENTER 6-DIGIT CODE</Text>
              <TextInput
                placeholder="000000"
                placeholderTextColor="rgba(75, 85, 99, 0.4)"
                style={styles.otpInput}
                value={otp}
                onChangeText={(txt) => {
                  const cleaned = txt.replace(/\D/g, '').slice(0, 6);
                  setOtp(cleaned);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleVerify}
              disabled={loading || otp.length !== 6}
              activeOpacity={0.8}
              style={[styles.submitBtn, (loading || otp.length !== 6) && styles.btnDisabled]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>Verify Code</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Resend & Log out footer actions */}
          <View style={styles.footer}>
            {canResend ? (
              <TouchableOpacity onPress={handleResend} disabled={loading}>
                <Text style={styles.resendLink}>Resend verification code</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.resendTimer}>
                Resend code in <Text style={styles.timerText}>{timer}s</Text>
              </Text>
            )}

            <TouchableOpacity onPress={handleBackToLogin} style={styles.backBtn}>
              <Text style={styles.backBtnText}>Back to Login / Change Account</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  topGlow: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    opacity: 0.8,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    opacity: 0.8,
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoWrapper: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#161B26',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#60A5FA',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  emailText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F3F4F6',
    textAlign: 'center',
    marginTop: 6,
  },
  formCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.7)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#161B26',
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  successText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },
  otpInput: {
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#161B26',
    borderRadius: 16,
    color: '#F3F4F6',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 12,
    height: 58,
    paddingLeft: 12, // Offset letterSpacing on iOS centering
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    gap: 16,
  },
  resendLink: {
    color: '#60A5FA',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  resendTimer: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  timerText: {
    fontWeight: '700',
    color: '#F3F4F6',
  },
  backBtn: {
    paddingVertical: 4,
  },
  backBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
