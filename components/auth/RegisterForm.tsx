import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '@/components/foundation/Button';
import { InputField } from '@/components/inputs/InputField';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/lib/api';

const BRAND_BLUE = '#0003B8';
const PANEL_TEXT = '#0F172A';
const MUTED_TEXT = '#64748B';
const FIELD_BORDER = '#E2E8F0';

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const { width } = useWindowDimensions();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCompact = width < 720;

  const handleSubmit = async () => {
    if (submitting) return;
    if (!fullName.trim() || !email.trim() || !password || !inviteCode.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        inviteCode: inviteCode.trim(),
      });
      router.replace('/dashboard/doctor');
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 400 && e.code === 'INVALID_INVITE') {
          setError('That invite code is not valid.');
        } else if (e.status === 409) {
          setError('That email is already registered.');
        } else if (e.message) {
          setError(e.message);
        } else {
          setError('Registration failed. Please try again.');
        }
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.shell, isCompact && styles.shellCompact]}>
          <View style={styles.brandRow}>
            <View style={styles.brandBadge}>
              <MaterialCommunityIcons name="radar" size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.brandTitle}>StatuScope</Text>
              <Text style={styles.brandSubtitle}>THE MEDICAL RADAR</Text>
            </View>
          </View>

          <View style={styles.heroCopy}>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>
              Use the invite code your hospital provided to join StatuScope.
            </Text>
          </View>

          {error ? (
            <View style={styles.errorBanner}>
              <Feather name="alert-circle" size={14} color="#B91C1C" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.formFields}>
            <InputField
              label="Full name"
              placeholder="Dr. Sarah Chen"
              value={fullName}
              onChangeText={setFullName}
              labelStyle={styles.fieldLabel}
              placeholderTextColor="#6B7280"
              inputContainerStyle={styles.input}
              inputStyle={styles.inputText}
              leftIcon={<Feather name="user" size={16} color="#94A3B8" />}
            />

            <InputField
              label="Email"
              placeholder="name@hospital.com"
              type="email"
              value={email}
              onChangeText={setEmail}
              labelStyle={styles.fieldLabel}
              placeholderTextColor="#6B7280"
              inputContainerStyle={styles.input}
              inputStyle={styles.inputText}
              leftIcon={<Feather name="mail" size={16} color="#94A3B8" />}
            />

            <InputField
              label="Password"
              placeholder="At least 8 characters"
              type="password"
              value={password}
              onChangeText={setPassword}
              labelStyle={styles.fieldLabel}
              placeholderTextColor="#6B7280"
              inputContainerStyle={styles.input}
              inputStyle={styles.inputText}
              leftIcon={<Feather name="lock" size={16} color="#94A3B8" />}
            />

            <InputField
              label="Confirm password"
              placeholder="Repeat your password"
              type="password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              labelStyle={styles.fieldLabel}
              placeholderTextColor="#6B7280"
              inputContainerStyle={styles.input}
              inputStyle={styles.inputText}
              leftIcon={<Feather name="lock" size={16} color="#94A3B8" />}
            />

            <InputField
              label="Invite code"
              placeholder="INVITE-XXXXX"
              value={inviteCode}
              onChangeText={setInviteCode}
              labelStyle={styles.fieldLabel}
              placeholderTextColor="#6B7280"
              inputContainerStyle={styles.input}
              inputStyle={styles.inputText}
              leftIcon={<Feather name="key" size={16} color="#94A3B8" />}
              hint="Provided by your hospital administrator."
            />

            <Button
              label={submitting ? 'Creating account…' : 'Create account'}
              variant="primary"
              size="lg"
              disabled={submitting}
              style={styles.submitButton}
              labelStyle={styles.submitButtonLabel}
              trailingIcon={
                submitting ? null : <Feather name="arrow-right" size={16} color="#FFFFFF" />
              }
              onPress={handleSubmit}
            />

            <View style={styles.signInRow}>
              <Text style={styles.signInPrompt}>Already have an account?</Text>
              <Pressable onPress={() => router.push('/login')}>
                <Text style={styles.signInLink}>Sign in</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default RegisterForm;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F5F5F8',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  shell: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 56,
    paddingVertical: 48,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 12,
  },
  shellCompact: {
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandBadge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: BRAND_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 24,
    lineHeight: 24,
    fontWeight: '900',
    color: PANEL_TEXT,
  },
  brandSubtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: BRAND_BLUE,
  },
  heroCopy: {
    marginTop: 40,
    gap: 8,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: PANEL_TEXT,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: MUTED_TEXT,
  },
  errorBanner: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#B91C1C',
    fontWeight: '600',
  },
  formFields: {
    marginTop: 28,
  },
  fieldLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 0,
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderColor: FIELD_BORDER,
    paddingHorizontal: 14,
  },
  inputText: {
    fontSize: 16,
    color: '#0F172A',
  },
  submitButton: {
    marginTop: 12,
    minHeight: 48,
    borderWidth: 0,
    borderRadius: 8,
    backgroundColor: BRAND_BLUE,
    shadowColor: BRAND_BLUE,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 6,
  },
  submitButtonLabel: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
  },
  signInRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  signInPrompt: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
  signInLink: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: BRAND_BLUE,
  },
});
