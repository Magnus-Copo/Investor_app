import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    TextInput,
    Switch,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme, formatCurrency } from '../../components/Theme';
import { projects, investors, getCurrentUser, pendingModifications } from '../../data/mockData';
import { getVisibleInvestorData, updatePrivacySettings, PRIVACY_LEVELS } from '../../utils/privacyUtils';

export default function ManageProjectInvestorsScreen({ navigation, route }) {
    const projectId = route?.params?.projectId || 'PRJ002';
    const project = projects.find(p => p.id === projectId);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showPrivacySettings, setShowPrivacySettings] = useState(false);

    // Dynamic current user
    const currentUser = getCurrentUser();

    // Current user's privacy state for this project (for demo, track locally)
    const currentUserInvestor = investors.find(i => i.id === currentUser.id);
    const currentPrivacy = currentUserInvestor?.privacySettings?.[projectId] || {};
    const [isAnonymous, setIsAnonymous] = useState(currentPrivacy.isAnonymous || false);

    if (!project) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Project not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const isAdmin = project.projectAdmins.includes(currentUser.id);
    const isUserInvestor = project.projectInvestors.includes(currentUser.id);

    // Get investors with privacy filtering applied
    const projectInvestors = investors
        .filter(i => project.projectInvestors.includes(i.id))
        .map(investor => getVisibleInvestorData(investor, projectId, currentUser.id, isAdmin));

    const availableInvestors = investors.filter(i => !project.projectInvestors.includes(i.id));
    const projectModifications = pendingModifications.filter(m => m.projectId === projectId);

    const handleAddInvestor = (investor) => {
        Alert.alert(
            'Add Investor',
            `Add ${investor.name} to ${project.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Add',
                    onPress: () => {
                        Alert.alert('Success', `${investor.name} has been added to the project.`);
                        setShowAddForm(false);
                    }
                }
            ]
        );
    };

    const handleToggleAnonymous = (value) => {
        setIsAnonymous(value);
        Alert.alert(
            value ? 'Privacy Enabled' : 'Privacy Disabled',
            value
                ? 'Other investors will now see you as "Anonymous Investor"'
                : 'Your identity is now visible to all project members',
            [{ text: 'OK' }]
        );
    };

    // Render investor card with privacy-aware display
    const renderInvestorCard = (investor, isCreator = false) => {
        const isAnonymousInvestor = investor.visibilityLevel === 'anonymous';
        const showFullAsAdmin = investor.visibilityLevel === 'admin' && investor.isAnonymous;
        const isSelf = investor.isSelf;

        return (
            <View key={investor.id} style={styles.investorCard}>
                {/* Avatar */}
                {isAnonymousInvestor ? (
                    <View style={[styles.investorAvatar, styles.anonymousAvatar]}>
                        <MaterialCommunityIcons name="incognito" size={22} color={theme.colors.textSecondary} />
                    </View>
                ) : (
                    <LinearGradient
                        colors={isCreator ? ['#F59E0B', '#D97706'] : isSelf ? ['#10B981', '#059669'] : theme.gradients.primary}
                        style={styles.investorAvatar}
                    >
                        <Text style={styles.investorInitials}>
                            {investor.name.split(' ').map(n => n[0]).join('')}
                        </Text>
                    </LinearGradient>
                )}

                {/* Info */}
                <View style={styles.investorInfo}>
                    <View style={styles.investorNameRow}>
                        <Text
                            style={[styles.investorName, isAnonymousInvestor && styles.anonymousText]}
                            numberOfLines={1}
                        >
                            {investor.name}
                        </Text>

                        {/* Badges */}
                        {isSelf && (
                            <View style={styles.selfBadge}>
                                <Text style={styles.selfBadgeText}>You</Text>
                            </View>
                        )}
                        {isCreator && (
                            <View style={styles.creatorBadge}>
                                <MaterialCommunityIcons name="shield-check" size={10} color={theme.colors.warning} />
                                <Text style={styles.creatorBadgeText}>Creator</Text>
                            </View>
                        )}
                        {showFullAsAdmin && (
                            <View style={styles.anonymousBadge}>
                                <MaterialCommunityIcons name="incognito" size={10} color={theme.colors.primary} />
                                <Text style={styles.anonymousBadgeText}>Anon</Text>
                            </View>
                        )}
                    </View>
                    <Text style={[styles.investorEmail, isAnonymousInvestor && styles.anonymousText]} numberOfLines={1}>
                        {investor.email}
                    </Text>
                </View>

                {/* Stats */}
                <View style={styles.investorStats}>
                    {investor.totalInvested !== null ? (
                        <>
                            <Text style={styles.investorAmount} numberOfLines={1}>
                                {formatCurrency(investor.totalInvested)}
                            </Text>
                            <Text style={styles.investorLabel}>Invested</Text>
                        </>
                    ) : (
                        <View style={styles.hiddenAmount}>
                            <MaterialCommunityIcons name="eye-off-outline" size={16} color={theme.colors.textTertiary} />
                            <Text style={styles.investorLabel}>Hidden</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    const renderApprovalStatus = (modification) => {
        const approvedCount = modification.votes.approved;
        const totalCount = modification.votes.total;
        const progressPercent = (approvedCount / totalCount) * 100;

        return (
            <View key={modification.id} style={styles.approvalCard}>
                <View style={styles.approvalHeader}>
                    <View style={styles.approvalTypeIcon}>
                        <MaterialCommunityIcons
                            name={modification.type === 'timeline' ? 'clock-outline' : 'cash'}
                            size={16}
                            color={theme.colors.warning}
                        />
                    </View>
                    <View style={styles.approvalInfo}>
                        <Text style={styles.approvalTitle} numberOfLines={1}>{modification.title}</Text>
                        <Text style={styles.approvalStatus}>
                            {approvedCount}/{totalCount} approved
                        </Text>
                    </View>
                </View>
                <View style={styles.approvalProgressBar}>
                    <View style={[styles.approvalProgressFill, { width: `${progressPercent}%` }]} />
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{project.name}</Text>
                    <Text style={styles.headerSubtitle}>Project Management</Text>
                </View>
                {isAdmin && (
                    <View style={styles.adminBadgeHeader}>
                        <MaterialCommunityIcons name="shield-check" size={16} color={theme.colors.warning} />
                    </View>
                )}
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                    {/* Project Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <MaterialCommunityIcons name="account-group-outline" size={24} color={theme.colors.primary} />
                            <Text style={styles.statValue}>{projectInvestors.length}</Text>
                            <Text style={styles.statLabel}>Investors</Text>
                        </View>
                        <View style={styles.statCard}>
                            <MaterialCommunityIcons name="cash-multiple" size={24} color={theme.colors.success} />
                            <Text style={styles.statValue}>{formatCurrency(project.raised)}</Text>
                            <Text style={styles.statLabel}>Raised</Text>
                        </View>
                        <View style={styles.statCard}>
                            <MaterialCommunityIcons name="clock-outline" size={24} color={theme.colors.warning} />
                            <Text style={styles.statValue}>{projectModifications.length}</Text>
                            <Text style={styles.statLabel}>Pending</Text>
                        </View>
                    </View>

                    {/* My Privacy Settings - Only for investors */}
                    {isUserInvestor && (
                        <TouchableOpacity
                            style={styles.privacyCard}
                            onPress={() => setShowPrivacySettings(!showPrivacySettings)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.privacyIcon}>
                                <MaterialCommunityIcons
                                    name={isAnonymous ? "eye-off-outline" : "eye-outline"}
                                    size={24}
                                    color={isAnonymous ? theme.colors.primary : theme.colors.success}
                                />
                            </View>
                            <View style={styles.privacyContent}>
                                <Text style={styles.privacyTitle}>My Privacy</Text>
                                <Text style={styles.privacyDescription}>
                                    {isAnonymous
                                        ? 'You appear as "Anonymous Investor" to others'
                                        : 'Your identity is visible to all members'}
                                </Text>
                            </View>
                            <Switch
                                value={isAnonymous}
                                onValueChange={handleToggleAnonymous}
                                trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                                thumbColor={isAnonymous ? theme.colors.primary : theme.colors.surface}
                            />
                        </TouchableOpacity>
                    )}

                    {/* Privacy Info Banner */}
                    {showPrivacySettings && (
                        <View style={styles.privacyInfoBanner}>
                            <MaterialCommunityIcons name="information-outline" size={18} color={theme.colors.textSecondary} />
                            <Text style={styles.privacyInfoText}>
                                When anonymous, only project admins can see your real identity.
                                Other investors see "Anonymous Investor".
                            </Text>
                        </View>
                    )}

                    {/* Privilege Chain Info */}
                    <View style={styles.privilegeCard}>
                        <View style={styles.privilegeIcon}>
                            <MaterialCommunityIcons name="source-branch" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={styles.privilegeContent}>
                            <Text style={styles.privilegeTitle}>Privilege Chain Active</Text>
                            <Text style={styles.privilegeDescription}>
                                All modifications require unanimous approval from all investors
                            </Text>
                        </View>
                    </View>

                    {/* Current Investors */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Project Investors</Text>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{projectInvestors.length}</Text>
                            </View>
                        </View>

                        {projectInvestors.map((investor) =>
                            renderInvestorCard(investor, investor.id === project.createdBy)
                        )}
                    </View>

                    {/* Add Investor Section - Only for Admins */}
                    {isAdmin && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Add Investors</Text>
                                <TouchableOpacity
                                    style={styles.toggleBtn}
                                    onPress={() => setShowAddForm(!showAddForm)}
                                >
                                    <MaterialCommunityIcons
                                        name={showAddForm ? 'chevron-up' : 'chevron-down'}
                                        size={20}
                                        color={theme.colors.primary}
                                    />
                                </TouchableOpacity>
                            </View>

                            {showAddForm && (
                                <>
                                    <View style={styles.searchContainer}>
                                        <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textTertiary} />
                                        <TextInput
                                            style={styles.searchInput}
                                            placeholder="Search investors..."
                                            placeholderTextColor={theme.colors.textTertiary}
                                            value={searchQuery}
                                            onChangeText={setSearchQuery}
                                        />
                                    </View>

                                    {availableInvestors.length > 0 ? (
                                        availableInvestors
                                            .filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                            .map((investor) => (
                                                <TouchableOpacity
                                                    key={investor.id}
                                                    style={styles.addInvestorCard}
                                                    onPress={() => handleAddInvestor(investor)}
                                                >
                                                    <View style={styles.addInvestorAvatar}>
                                                        <Text style={styles.addInvestorInitials}>
                                                            {investor.name.split(' ').map(n => n[0]).join('')}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.addInvestorInfo}>
                                                        <Text style={styles.addInvestorName} numberOfLines={1}>{investor.name}</Text>
                                                        <Text style={styles.addInvestorEmail} numberOfLines={1}>{investor.email}</Text>
                                                    </View>
                                                    <TouchableOpacity
                                                        style={styles.addBtn}
                                                        onPress={() => handleAddInvestor(investor)}
                                                    >
                                                        <MaterialCommunityIcons name="plus" size={20} color="white" />
                                                    </TouchableOpacity>
                                                </TouchableOpacity>
                                            ))
                                    ) : (
                                        <View style={styles.emptyState}>
                                            <Text style={styles.emptyText}>No available investors to add</Text>
                                        </View>
                                    )}
                                </>
                            )}

                            {!showAddForm && (
                                <TouchableOpacity
                                    style={styles.addNewBtn}
                                    onPress={() => setShowAddForm(true)}
                                >
                                    <LinearGradient
                                        colors={theme.gradients.primary}
                                        style={styles.addNewGradient}
                                    >
                                        <MaterialCommunityIcons name="account-plus" size={20} color="white" />
                                        <Text style={styles.addNewText}>Add New Investor</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* Pending Approvals */}
                    {projectModifications.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Approval Status</Text>
                                <View style={[styles.badge, { backgroundColor: theme.colors.warningLight }]}>
                                    <Text style={[styles.badgeText, { color: theme.colors.warning }]}>
                                        {projectModifications.length}
                                    </Text>
                                </View>
                            </View>

                            {projectModifications.map(renderApprovalStatus)}
                        </View>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

ManageProjectInvestorsScreen.propTypes = {
    navigation: PropTypes.shape({
        goBack: PropTypes.func.isRequired,
    }).isRequired,
    route: PropTypes.shape({
        params: PropTypes.shape({
            projectId: PropTypes.string,
        }),
    }),
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backButton: {
        padding: 4,
    },
    headerCenter: {
        flex: 1,
        marginLeft: 12,
    },
    headerTitle: {
        ...theme.typography.h4,
        color: theme.colors.textPrimary,
    },
    headerSubtitle: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
    adminBadgeHeader: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: theme.colors.warningLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        ...theme.shadows.soft,
    },
    statValue: {
        ...theme.typography.bodyMedium,
        color: theme.colors.textPrimary,
        marginTop: 8,
    },
    statLabel: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    // Privacy Card
    privacyCard: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        ...theme.shadows.soft,
    },
    privacyIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: theme.colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    privacyContent: {
        flex: 1,
    },
    privacyTitle: {
        ...theme.typography.bodyMedium,
        color: theme.colors.textPrimary,
        marginBottom: 2,
    },
    privacyDescription: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
    privacyInfoBanner: {
        flexDirection: 'row',
        backgroundColor: theme.colors.primaryLight,
        marginHorizontal: 16,
        marginTop: 8,
        padding: 12,
        borderRadius: 12,
        gap: 10,
    },
    privacyInfoText: {
        flex: 1,
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        lineHeight: 18,
    },
    privilegeCard: {
        flexDirection: 'row',
        backgroundColor: theme.colors.primaryLight,
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    privilegeIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    privilegeContent: {
        flex: 1,
    },
    privilegeTitle: {
        ...theme.typography.bodyMedium,
        color: theme.colors.primary,
        marginBottom: 4,
    },
    privilegeDescription: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        lineHeight: 18,
    },
    section: {
        backgroundColor: theme.colors.surface,
        marginTop: 16,
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionTitle: {
        ...theme.typography.h4,
        color: theme.colors.textPrimary,
    },
    badge: {
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    badgeText: {
        ...theme.typography.captionBold,
        color: theme.colors.primary,
    },
    toggleBtn: {
        padding: 4,
    },
    // Investor Card
    investorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceAlt,
        padding: 14,
        borderRadius: 14,
        marginBottom: 10,
    },
    investorAvatar: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    anonymousAvatar: {
        backgroundColor: theme.colors.border,
    },
    investorInitials: {
        color: 'white',
        fontWeight: '700',
        fontSize: 14,
    },
    investorInfo: {
        flex: 1,
    },
    investorNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
    },
    investorName: {
        ...theme.typography.bodyMedium,
        color: theme.colors.textPrimary,
    },
    anonymousText: {
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
    },
    selfBadge: {
        backgroundColor: theme.colors.successLight,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    selfBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: theme.colors.success,
    },
    creatorBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.warningLight,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        gap: 3,
    },
    creatorBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: theme.colors.warning,
    },
    anonymousBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        gap: 3,
    },
    anonymousBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    investorEmail: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    investorStats: {
        alignItems: 'flex-end',
    },
    investorAmount: {
        ...theme.typography.smallSemibold,
        color: theme.colors.success,
    },
    investorLabel: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
    hiddenAmount: {
        alignItems: 'center',
    },
    // Search & Add
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceAlt,
        borderRadius: 12,
        paddingHorizontal: 14,
        marginBottom: 14,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 10,
        ...theme.typography.body,
        color: theme.colors.textPrimary,
    },
    addInvestorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceAlt,
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
    },
    addInvestorAvatar: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    addInvestorInitials: {
        color: theme.colors.textSecondary,
        fontWeight: '600',
        fontSize: 13,
    },
    addInvestorInfo: {
        flex: 1,
    },
    addInvestorName: {
        ...theme.typography.smallMedium,
        color: theme.colors.textPrimary,
    },
    addInvestorEmail: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
    addBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyState: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        ...theme.typography.small,
        color: theme.colors.textSecondary,
    },
    addNewBtn: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    addNewGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 8,
    },
    addNewText: {
        ...theme.typography.cta,
        color: 'white',
    },
    // Approval Card
    approvalCard: {
        backgroundColor: theme.colors.surfaceAlt,
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
    },
    approvalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    approvalTypeIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: theme.colors.warningLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    approvalInfo: {
        flex: 1,
    },
    approvalTitle: {
        ...theme.typography.smallMedium,
        color: theme.colors.textPrimary,
    },
    approvalStatus: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
    approvalProgressBar: {
        height: 4,
        backgroundColor: theme.colors.border,
        borderRadius: 2,
        overflow: 'hidden',
    },
    approvalProgressFill: {
        height: '100%',
        backgroundColor: theme.colors.success,
        borderRadius: 2,
    },
});
