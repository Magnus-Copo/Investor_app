import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    StatusBar,
    Dimensions,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../components/Theme';
import { userAccounts } from '../data/mockData';
import { validateLoginForm } from '../utils/validationUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * LoginScreen with Authentication
 */
export default function LoginScreen({ navigation, onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [errors, setErrors] = useState({});

    const handleLogin = () => {
        // Validate form
        const validation = validateLoginForm({ email, password });

        if (!validation.isValid) {
            setErrors(validation.errors);
            const firstError = Object.values(validation.errors)[0];
            Alert.alert('Validation Error', firstError);
            return;
        }

        setErrors({});
        setIsLoading(true);

        // Simulate API delay
        setTimeout(() => {
            // Check against stored accounts
            // STRICT Check against stored accounts (Email/Username + Password)
            const account = Object.values(userAccounts).find(a =>
                (a.email.toLowerCase() === email.toLowerCase() || a.email === email) && a.password === password
            );

            if (account) {
                // For demo purposes, we accept any password if user exists in mock data
                // In production, obviously use correct auth!
                setIsLoading(false);
                onLogin?.(account.id);
            } else {
                setIsLoading(false);
                Alert.alert('Login Failed', 'Invalid email or password', [{ text: 'OK' }]);
            }
        }, 1200);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Logo & Branding */}
                    <View style={styles.header}>
                        <View style={styles.logoBox}>
                            <LinearGradient colors={['#5B5CFF', '#7C3AED']} style={styles.logoGradient}>
                                <MaterialCommunityIcons name="chart-donut" size={36} color="white" />
                            </LinearGradient>
                        </View>
                        <Text style={styles.appName}>SplitFlow</Text>
                        <Text style={styles.tagline}>Project expenses, simplified</Text>
                    </View>

                    {/* Login Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Sign In</Text>
                        <Text style={styles.cardSubtitle}>Welcome back to your projects</Text>

                        {/* Email Field */}
                        <View style={[styles.inputContainer, emailFocused && styles.inputFocused]}>
                            <MaterialCommunityIcons
                                name="email-outline"
                                size={22}
                                color={emailFocused ? theme.colors.primary : theme.colors.textTertiary}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Email address"
                                placeholderTextColor={theme.colors.textTertiary}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                textContentType="username"
                                autoComplete="email"
                                onFocus={() => setEmailFocused(true)}
                                onBlur={() => setEmailFocused(false)}
                            />
                        </View>

                        {/* Password Field */}
                        <View style={[styles.inputContainer, passwordFocused && styles.inputFocused]}>
                            <MaterialCommunityIcons
                                name="lock-outline"
                                size={22}
                                color={passwordFocused ? theme.colors.primary : theme.colors.textTertiary}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor={theme.colors.textTertiary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                textContentType="password"
                                autoComplete="password"
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <MaterialCommunityIcons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={22}
                                    color={theme.colors.textTertiary}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Sign In Button */}
                        <TouchableOpacity
                            style={styles.signInButton}
                            onPress={handleLogin}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            <LinearGradient colors={['#5B5CFF', '#3D3EDB']} style={styles.signInGradient}>
                                {isLoading ? (
                                    <Text style={styles.signInText}>Signing in...</Text>
                                ) : (
                                    <>
                                        <Text style={styles.signInText}>Sign In</Text>
                                        <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Footer / Sign Up Link */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                            <Text style={styles.footerLink}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Trust Indicators */}
                    <View style={styles.trustRow}>
                        <View style={styles.trustItem}>
                            <MaterialCommunityIcons name="shield-check-outline" size={20} color={theme.colors.success} />
                            <Text style={styles.trustText}>Secure</Text>
                        </View>
                        <View style={styles.trustDivider} />
                        <View style={styles.trustItem}>
                            <MaterialCommunityIcons name="lock-outline" size={20} color={theme.colors.primary} />
                            <Text style={styles.trustText}>Encrypted</Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

LoginScreen.propTypes = {
    navigation: PropTypes.object,
    onLogin: PropTypes.func,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    keyboardView: {
        flex: 1,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        paddingHorizontal: 24,
        paddingVertical: 24,
    },
    // Header
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoBox: {
        marginBottom: 16,
    },
    logoGradient: {
        width: 80,
        height: 80,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.card,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        letterSpacing: -0.5,
    },
    tagline: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        marginTop: 8,
    },
    // Card
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        padding: 24,
        ...theme.shadows.card,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        textAlign: 'center',
    },
    cardSubtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 24,
    },
    // Inputs
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceAlt,
        borderRadius: 14,
        paddingHorizontal: 16,
        height: 56,
        marginBottom: 16,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
    },
    inputFocused: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.surface,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.textPrimary,
        marginLeft: 12,
    },
    // Sign In Button
    signInButton: {
        borderRadius: 14,
        overflow: 'hidden',
        marginTop: 8,
        ...theme.shadows.soft,
    },
    signInGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    signInText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
    },
    // Footer
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        gap: 6,
    },
    footerText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
    },
    footerLink: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '700',
    },
    // Trust Row
    trustRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    trustItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    trustText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    trustDivider: {
        width: 1,
        height: 16,
        backgroundColor: theme.colors.border,
        marginHorizontal: 16,
    },
});
