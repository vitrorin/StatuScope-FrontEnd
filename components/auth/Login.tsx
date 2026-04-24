import React, { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import {
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
import { CheckboxField } from '@/components/inputs/CheckboxField';
import { RoleSegmentedControl } from '@/components/inputs/RoleSegmentedControl';

const BRAND_BLUE = '#0003B8';
const PANEL_TEXT = '#0F172A';
const MUTED_TEXT = '#64748B';
const FIELD_BORDER = '#E2E8F0';
const SURFACE_TINT = '#F1F5F9';

const radarStats = [
  {
    title: 'ST. JUDE MEDICAL',
    value: '98.2%',
    iconBackground: '#34D399',
    iconColor: BRAND_BLUE,
    icon: 'hospital-box-outline' as const,
    position: { top: '20%', left: '50%', marginTop: -10, marginLeft: -40 },
  },
  {
    title: 'PATIENT FLOW',
    value: '+12.4%',
    iconBackground: '#93C5FD',
    iconColor: BRAND_BLUE,
    icon: 'trending-up' as const,
    position: { top: '50%', left: '50%', marginTop: 98, marginLeft: -170 },
  },
  {
    title: 'RESOURCE ALLOC.',
    value: 'OPTIMAL',
    iconBackground: '#FFFFFF',
    iconColor: BRAND_BLUE,
    icon: 'clipboard-pulse-outline' as const,
    position: { top: '50%', left: '50%', marginTop: 42, marginLeft: 16 },
  },
];

export function Login() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [role, setRole] = useState('doctor');
  const [rememberMe, setRememberMe] = useState(false);

  const isCompact = width < 980;
  const shellWidth = useMemo(() => {
    if (width >= 1440) return 1260;
    if (width >= 1180) return width - 80;
    if (width >= 980) return width - 48;
    return Math.max(width - 32, 320);
  }, [width]);

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[
            styles.shell,
            {
              width: shellWidth,
              flexDirection: isCompact ? 'column' : 'row',
            },
          ]}
        >
          <View style={[styles.formPanel, isCompact && styles.formPanelCompact]}>
            <View>
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
                <Text style={styles.title}>Welcome Again!</Text>
                <Text style={styles.subtitle}>
                  Please enter your credentials to access the system
                </Text>
              </View>

              <RoleSegmentedControl
                options={[
                  { label: 'Doctor', value: 'doctor' },
                  { label: 'Administrator', value: 'administrator' },
                ]}
                value={role}
                onChange={setRole}
                style={styles.segmentedWrapper}
                label="Login as"
                labelStyle={styles.fieldLabel}
                containerStyle={styles.segmentedContainer}
                segmentStyle={styles.segmentedItem}
                activeSegmentStyle={styles.segmentedItemActive}
                textStyle={styles.segmentedText}
                activeTextStyle={styles.segmentedTextActive}
                fullWidth
              />

              <View style={styles.formFields}>
                <InputField
                  label="Email:"
                  placeholder="name@hospital.com"
                  type="email"
                  labelStyle={styles.fieldLabel}
                  placeholderTextColor="#6B7280"
                  inputContainerStyle={styles.loginInput}
                  inputStyle={styles.loginInputText}
                  leftIcon={<Feather name="mail" size={16} color="#94A3B8" />}
                />

                <InputField
                  label="Password"
                  placeholder="********"
                  type="password"
                  labelStyle={styles.fieldLabel}
                  placeholderTextColor="#6B7280"
                  inputContainerStyle={styles.loginInput}
                  inputStyle={styles.loginInputText}
                  leftIcon={<Feather name="lock" size={16} color="#94A3B8" />}
                  labelAccessory={<Text style={styles.forgotPassword}>Forgot my password?</Text>}
                />

                <CheckboxField
                  label="Remember me on this device"
                  checked={rememberMe}
                  onChange={setRememberMe}
                  style={styles.checkboxField}
                  checkboxStyle={styles.checkbox}
                  labelStyle={styles.checkboxLabel}
                />

                <Button
                  label="Login to the system"
                  variant="primary"
                  size="lg"
                  style={styles.loginButton}
                  labelStyle={styles.loginButtonLabel}
                  trailingIcon={<Feather name="arrow-right" size={16} color="#FFFFFF" />}
                  onPress={() => router.push(`/dashboard/${role}`)}
                />
              </View>
            </View>

            <View style={styles.footer}>
              <View style={styles.footerDivider} />
              <View style={styles.footerRow}>
                <Feather name="shield" size={14} color={BRAND_BLUE} />
                <Text style={styles.footerText}>
                  Secure Healthcare Platform - HIPAA Compliant
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.visualPanel, isCompact && styles.visualPanelCompact]}>
            <View style={styles.backgroundHalo} />
            <View style={styles.radarLargeRing} />
            <View style={styles.radarMidRing} />
            <View style={styles.radarInnerRing} />
            {/* Radar sweep/cone intentionally omitted for now. Add it back here later. */}

            {radarStats.map((stat) => (
              <View key={stat.title} style={[styles.statCard, stat.position]}>
                <View style={[styles.statIconWrap, { backgroundColor: stat.iconBackground }]}>
                  <MaterialCommunityIcons
                    name={stat.icon}
                    size={12}
                    color={stat.iconColor}
                  />
                </View>
                <View>
                  <Text style={styles.statLabel}>{stat.title}</Text>
                  <Text style={styles.statValue}>{stat.value}</Text>
                </View>
              </View>
            ))}

            <View style={styles.radarCoreWrap}>
              <View style={styles.radarCoreOuter} />
              <View style={styles.radarCore}>
                <MaterialCommunityIcons name="radar" size={30} color={BRAND_BLUE} />
              </View>
            </View>

            <View style={styles.visualCopy}>
              <Text style={styles.visualTitle}>Real-time medical diagnostics</Text>
              <Text style={styles.visualSubtitle}>
                We support healthcare professionals with predictive analytics and accurate
                patient tracking across all departments.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    paddingVertical: 24,
  },
  shell: {
    maxWidth: 1260,
    minHeight: 760,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 12,
  },
  formPanel: {
    flex: 1.03,
    minHeight: 760,
    paddingHorizontal: 66,
    paddingVertical: 56,
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  formPanelCompact: {
    minHeight: undefined,
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
    marginTop: 72,
    gap: 8,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: PANEL_TEXT,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: MUTED_TEXT,
  },
  segmentedWrapper: {
    marginTop: 40,
    width: '100%',
  },
  fieldLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#334155',
    textTransform: 'none',
    letterSpacing: 0,
    marginBottom: 0,
  },
  segmentedContainer: {
    marginTop: 12,
    height: 50,
    borderRadius: 8,
    padding: 4,
    backgroundColor: SURFACE_TINT,
    gap: 0,
    width: '100%',
  },
  segmentedItem: {
    borderRadius: 8,
    minWidth: 0,
    paddingVertical: 13,
    paddingHorizontal: 32,
  },
  segmentedItemActive: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentedText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: MUTED_TEXT,
    textAlign: 'center',
  },
  segmentedTextActive: {
    color: BRAND_BLUE,
  },
  formFields: {
    marginTop: 24,
  },
  loginInput: {
    height: 48,
    borderRadius: 8,
    borderColor: FIELD_BORDER,
    paddingHorizontal: 14,
  },
  loginInputText: {
    fontSize: 16,
    color: '#0F172A',
  },
  forgotPassword: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: BRAND_BLUE,
  },
  checkboxField: {
    marginTop: 6,
    marginBottom: 0,
  },
  checkbox: {
    width: 16,
    height: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  checkboxLabel: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
  loginButton: {
    marginTop: 24,
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
  loginButtonLabel: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
  },
  footer: {
    paddingTop: 38,
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 24,
  },
  footerText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#94A3B8',
  },
  visualPanel: {
    flex: 1.08,
    minHeight: 760,
    paddingHorizontal: 56,
    paddingVertical: 54,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BRAND_BLUE,
    overflow: 'hidden',
    position: 'relative',
  },
  visualPanelCompact: {
    minHeight: 520,
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
  backgroundHalo: {
    position: 'absolute',
    width: 820,
    height: 820,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  radarLargeRing: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -286,
    marginTop: -286,
    width: 572,
    height: 572,
    borderRadius: 286,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  radarMidRing: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -210,
    marginTop: -210,
    width: 420,
    height: 420,
    borderRadius: 210,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  radarInnerRing: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -134,
    marginTop: -134,
    width: 268,
    height: 268,
    borderRadius: 134,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  statCard: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.60)',
  },
  statValue: {
    fontSize: 18,
    lineHeight: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  radarCoreWrap: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -68,
    marginTop: -68,
    alignItems: 'center',
    justifyContent: 'center',
    width: 136,
    height: 136,
  },
  radarCoreOuter: {
    position: 'absolute',
    width: 136,
    height: 136,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.30)',
  },
  radarCore: {
    width: 112,
    height: 112,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 8,
  },
  visualCopy: {
    position: 'absolute',
    bottom: 84,
    left: 56,
    right: 56,
    alignItems: 'center',
  },
  visualTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  visualSubtitle: {
    maxWidth: 441,
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.60)',
    textAlign: 'center',
  },
});

export default Login;
