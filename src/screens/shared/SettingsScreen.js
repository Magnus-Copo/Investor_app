import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Switch,
    Alert,
    ActivityIndicator,
    Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../components/Theme';
import { api } from '../../services/api';
import { projects, getCurrentUser } from '../../data/mockData';

export default function SettingsScreen({ navigation }) {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const currentUser = getCurrentUser();

    // Calculate active projects count
    const myProjects = projects.filter(p =>
        p.createdBy === currentUser.id ||
        p.projectInvestors?.includes(currentUser.id)
    );
    const activeProjectsCount = myProjects.filter(p => p.status === 'active').length;

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await api.getSettings();
            setSettings(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const updateNotificationSetting = async (key, value) => {
        const newSettings = {
            ...settings,
            notifications: {
                ...settings.notifications,
                [key]: value,
            },
        };
        setSettings(newSettings);
        await api.updateNotificationPreferences({ [key]: value });
    };

    const updateSetting = async (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        await api.updateSettings({ [key]: value });
    };

    // NEW: Share App functionality
    const handleShareApp = async () => {
        try {
            const shareMessage = `🚀 Check out SplitFlow - The smart expense tracker for collaborative projects!

💰 Track project expenses together
📊 Get detailed analytics
✅ Multi-member approval system
📱 Beautiful, easy-to-use interface

Download now: https://splitflow.app/download`;

            const result = await Share.share({
                message: shareMessage,
                title: 'Share SplitFlow App',
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // Shared with activity type
                    console.log('Shared via:', result.activityType);
                } else {
                    // Shared successfully
                    console.log('App shared successfully');
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Could not share the app. Please try again.');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    const SettingRow = ({ icon, title, subtitle, value, onToggle, showArrow }) => (
        <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
                <Ionicons name={icon} size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            {onToggle !== undefined && (
                <Switch
                    value={value}
                    onValueChange={onToggle}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                    thumbColor={value ? theme.colors.primary : theme.colors.textTertiary}
                />
            )}
            {showArrow && (
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
            )}
        </View>
    );

    SettingRow.propTypes = {
        icon: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        subtitle: PropTypes.string,
        value: PropTypes.bool,
        onToggle: PropTypes.func,
        showArrow: PropTypes.bool,
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Account Statistics - Only Active Projects */}
                <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>Account Statistics</Text>
                    <View style={styles.statsCard}>
                        <LinearGradient
                            colors={['#6366F1', '#8B5CF6']}
                            style={styles.statsGradient}
                        >
                            <View style={styles.statsIconBox}>
                                <MaterialCommunityIcons name="briefcase-check" size={32} color="white" />
                            </View>
                            <View style={styles.statsContent}>
                                <Text style={styles.statsValue}>{activeProjectsCount}</Text>
                                <Text style={styles.statsLabel}>Active Projects</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255,255,255,0.6)" />
                        </LinearGradient>
                    </View>
                    <Text style={styles.statsNote}>
                        You are a member of {myProjects.length} project{myProjects.length !== 1 ? 's' : ''}
                    </Text>
                </View>

                {/* Appearance */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Appearance</Text>
                    <SettingRow
                        icon="moon-outline"
                        title="Dark Mode"
                        subtitle="Use dark theme"
                        value={settings?.theme === 'dark'}
                        onToggle={(val) => updateSetting('theme', val ? 'dark' : 'light')}
                    />
                    <SettingRow
                        icon="finger-print-outline"
                        title="Biometric Login"
                        subtitle="Use fingerprint or face ID"
                        value={settings?.biometricEnabled}
                        onToggle={(val) => updateSetting('biometricEnabled', val)}
                    />
                </View>

                {/* Notifications */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notifications</Text>
                    <SettingRow
                        icon="notifications-outline"
                        title="Push Notifications"
                        subtitle="Receive push notifications"
                        value={settings?.notifications?.pushEnabled}
                        onToggle={(val) => updateNotificationSetting('pushEnabled', val)}
                    />
                    <SettingRow
                        icon="mail-outline"
                        title="Email Notifications"
                        subtitle="Receive email updates"
                        value={settings?.notifications?.emailEnabled}
                        onToggle={(val) => updateNotificationSetting('emailEnabled', val)}
                    />
                    <SettingRow
                        icon="checkbox-outline"
                        title="Approval Reminders"
                        subtitle="Remind about pending approvals"
                        value={settings?.notifications?.approvalReminders}
                        onToggle={(val) => updateNotificationSetting('approvalReminders', val)}
                    />
                    <SettingRow
                        icon="cash-outline"
                        title="Spending Alerts"
                        subtitle="Get notified on new spendings"
                        value={settings?.notifications?.reportAlerts}
                        onToggle={(val) => updateNotificationSetting('reportAlerts', val)}
                    />
                </View>

                {/* General */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>General</Text>
                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => Alert.alert('Language', 'Language options: English')}
                    >
                        <View style={styles.settingIcon}>
                            <Ionicons name="language-outline" size={22} color={theme.colors.primary} />
                        </View>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>Language</Text>
                            <Text style={styles.settingSubtitle}>English</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => Alert.alert('Currency', 'Currency: INR (₹)')}
                    >
                        <View style={styles.settingIcon}>
                            <Ionicons name="cash-outline" size={22} color={theme.colors.primary} />
                        </View>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>Currency</Text>
                            <Text style={styles.settingSubtitle}>INR (₹)</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                    </TouchableOpacity>

                    {/* Share App Button */}
                    <TouchableOpacity
                        style={styles.shareAppButton}
                        onPress={handleShareApp}
                    >
                        <LinearGradient
                            colors={['#10B981', '#059669']}
                            style={styles.shareAppGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <View style={styles.shareAppContent}>
                                <Ionicons name="share-social" size={24} color="white" />
                                <View style={styles.shareAppTextContainer}>
                                    <Text style={styles.shareAppTitle}>Share App</Text>
                                    <Text style={styles.shareAppSubtitle}>Invite friends via WhatsApp, SMS...</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Support */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>
                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => Alert.alert('Help Center', 'Visit our support portal for assistance.')}
                    >
                        <View style={styles.settingIcon}>
                            <Ionicons name="help-circle-outline" size={22} color={theme.colors.primary} />
                        </View>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>Help Center</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => Alert.alert('Privacy Policy', 'View our privacy policy online.')}
                    >
                        <View style={styles.settingIcon}>
                            <Ionicons name="shield-outline" size={22} color={theme.colors.primary} />
                        </View>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>Privacy Policy</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => Alert.alert('Terms of Service', 'View our terms of service.')}
                    >
                        <View style={styles.settingIcon}>
                            <Ionicons name="document-outline" size={22} color={theme.colors.primary} />
                        </View>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>Terms of Service</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                    </TouchableOpacity>
                </View>

                {/* About */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <View style={styles.settingRow}>
                        <View style={styles.settingIcon}>
                            <Ionicons name="information-circle-outline" size={22} color={theme.colors.primary} />
                        </View>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>App Version</Text>
                            <Text style={styles.settingSubtitle}>2.0.0 - SplitFlow</Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

SettingsScreen.propTypes = {
    navigation: PropTypes.shape({
        goBack: PropTypes.func.isRequired,
    }).isRequired,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    // Stats Section
    statsSection: {
        padding: 16,
    },
    statsCard: {
        borderRadius: 20,
        overflow: 'hidden',
        marginTop: 12,
    },
    statsGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    statsIconBox: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    statsContent: {
        flex: 1,
    },
    statsValue: {
        fontSize: 32,
        fontWeight: '700',
        color: 'white',
    },
    statsLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    statsNote: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: 12,
    },
    section: {
        backgroundColor: theme.colors.surface,
        marginTop: 16,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        paddingTop: 16,
        paddingBottom: 8,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    settingIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: theme.colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingContent: {
        flex: 1,
        marginLeft: 12,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: theme.colors.textPrimary,
    },
    settingSubtitle: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    // NEW: Share App Button Styles
    shareAppButton: {
        marginTop: 12,
        marginBottom: 8,
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    shareAppGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    shareAppContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    shareAppTextContainer: {
        marginLeft: 14,
    },
    shareAppTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
    },
    shareAppSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.85)',
        marginTop: 2,
    },
});
