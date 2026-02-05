import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme, formatCurrency } from '../../components/Theme';
import { api } from '../../services/api';

export default function ProfileScreen({ navigation, onLogout }) {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editedProfile, setEditedProfile] = useState({});

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await api.getProfile(); // This now returns global currentUser
            setProfile(data);
            setEditedProfile(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await api.updateProfile(editedProfile);
            setProfile(editedProfile);
            setIsEditing(false);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                        if (onLogout) onLogout();
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                    <Ionicons
                        name={isEditing ? "close" : "create-outline"}
                        size={24}
                        color={theme.colors.primary}
                    />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Avatar Section */}
                    <LinearGradient
                        colors={[theme.colors.primary, theme.colors.primaryDark]}
                        style={styles.avatarSection}
                    >
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>{getInitials(profile?.name)}</Text>
                        </View>
                        <Text style={styles.userName}>{profile?.name}</Text>
                        <Text style={styles.userEmail}>{profile?.email}</Text>
                    </LinearGradient>

                    {/* Profile Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            {isEditing ? (
                                <TextInput
                                    style={styles.input}
                                    value={editedProfile.name}
                                    onChangeText={(text) => setEditedProfile({ ...editedProfile, name: text })}
                                />
                            ) : (
                                <Text style={styles.inputValue}>{profile?.name}</Text>
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email</Text>
                            {isEditing ? (
                                <TextInput
                                    style={styles.input}
                                    value={editedProfile.email}
                                    onChangeText={(text) => setEditedProfile({ ...editedProfile, email: text })}
                                    keyboardType="email-address"
                                />
                            ) : (
                                <Text style={styles.inputValue}>{profile?.email}</Text>
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Phone</Text>
                            {isEditing ? (
                                <TextInput
                                    style={styles.input}
                                    value={editedProfile.phone}
                                    onChangeText={(text) => setEditedProfile({ ...editedProfile, phone: text })}
                                    keyboardType="phone-pad"
                                />
                            ) : (
                                <Text style={styles.inputValue}>{profile?.phone || 'Not provided'}</Text>
                            )}
                        </View>
                    </View>

                    {/* Account Stats */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Account Statistics</Text>
                        <View style={styles.statsGrid}>
                            <LinearGradient
                                colors={['#FFFFFF', '#F8FAFC']}
                                style={styles.statCard}
                            >
                                <View style={[styles.statIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                                    <Ionicons name="briefcase" size={20} color={theme.colors.primary} />
                                </View>
                                <Text style={styles.statValue}>2</Text>
                                <Text style={styles.statLabel}>Active Investments</Text>
                            </LinearGradient>
                            <LinearGradient
                                colors={['#FFFFFF', '#F8FAFC']}
                                style={styles.statCard}
                            >
                                <View style={[styles.statIconContainer, { backgroundColor: theme.colors.success + '15' }]}>
                                    <Ionicons name="trending-up" size={20} color={theme.colors.success} />
                                </View>
                                <Text style={styles.statValue}>+15%</Text>
                                <Text style={styles.statLabel}>Total Returns</Text>
                            </LinearGradient>
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Account</Text>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => navigation.navigate('Settings')}
                        >
                            <Ionicons name="settings-outline" size={22} color={theme.colors.textSecondary} />
                            <Text style={styles.menuText}>Settings</Text>
                            <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => Alert.alert('Coming Soon', 'Password change will be available soon')}
                        >
                            <Ionicons name="key-outline" size={22} color={theme.colors.textSecondary} />
                            <Text style={styles.menuText}>Change Password</Text>
                            <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.menuItem, styles.logoutItem]}
                            onPress={handleLogout}
                        >
                            <Ionicons name="log-out-outline" size={22} color={theme.colors.danger} />
                            <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
                            <Ionicons name="chevron-forward" size={20} color={theme.colors.danger} />
                        </TouchableOpacity>
                    </View>

                    {/* Save Button */}
                    {isEditing && (
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <LinearGradient
                                colors={[theme.colors.primary, theme.colors.primaryDark]}
                                style={styles.saveGradient}
                            >
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

ProfileScreen.propTypes = {
    navigation: PropTypes.shape({
        goBack: PropTypes.func.isRequired,
        navigate: PropTypes.func.isRequired,
    }).isRequired,
    onLogout: PropTypes.func,
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
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: '700',
        color: 'white',
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: 'white',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    section: {
        backgroundColor: theme.colors.surface,
        marginTop: 16,
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputValue: {
        fontSize: 16,
        color: theme.colors.textPrimary,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    input: {
        fontSize: 16,
        color: theme.colors.textPrimary,
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.primary,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        minWidth: 0,
        ...theme.shadows.soft,
        borderWidth: 1,
        borderColor: theme.colors.surfaceAlt,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginTop: 6,
    },
    statLabel: {
        fontSize: 11,
        color: theme.colors.textSecondary,
        marginTop: 2,
        textAlign: 'center',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.textPrimary,
        marginLeft: 12,
    },
    logoutItem: {
        borderBottomWidth: 0,
    },
    logoutText: {
        color: theme.colors.danger,
    },
    saveButton: {
        marginHorizontal: 16,
        marginTop: 24,
        borderRadius: 12,
        overflow: 'hidden',
    },
    saveGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
});
