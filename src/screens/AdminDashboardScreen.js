import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    StatusBar,
    Modal,
    TextInput,
    Alert
} from 'react-native';
import { theme } from '../components/Theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function AdminDashboardScreen({ navigation, onLogout }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [email, setEmail] = useState('');

    const Projects = [
        { id: 1, name: 'Tech Park Phase 1', members: 12, budget: '₹12.5Cr' },
        { id: 2, name: 'Green Valley Villa', members: 8, budget: '₹4.2Cr' },
        { id: 3, name: 'City Center Mall', members: 24, budget: '₹45Cr' },
    ];

    const handleAddUser = () => {
        if (!email) {
            Alert.alert('Error', 'Please enter an email address');
            return;
        }
        // Mock API call
        Alert.alert('Success', `Invitation sent to ${email} for ${selectedProject?.name}`);
        setEmail('');
        setModalVisible(false);
    };

    const openAddUserModal = (project) => {
        setSelectedProject(project);
        setModalVisible(true);
    };

    const Approvals = [
        { id: 1, title: 'Large Transfer', user: 'John Doe', amount: '₹50,000', time: '2m' },
        { id: 2, title: 'Group Settlement', user: 'Sarah Smith', amount: '₹12,500', time: '15m' },
        { id: 3, title: 'New User Bonus', user: 'Mike Ross', amount: '₹500', time: '1h' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header with Dark bg for Admin feeling */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerLabel}>Admin Portal</Text>
                    <Text style={styles.headerTitle}>Overview</Text>
                </View>
                <TouchableOpacity style={styles.notifBtn} onPress={onLogout}>
                    <Ionicons name="log-out-outline" size={20} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* KPI Grid */}
                <View style={styles.kpiGrid}>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiLabel}>Total Volume</Text>
                        <Text style={styles.kpiValue}>₹45.2L</Text>
                        <View style={styles.trendContainer}>
                            <Ionicons name="trending-up" size={12} color={theme.colors.success} />
                            <Text style={styles.trendValue}>+12%</Text>
                        </View>
                    </View>

                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiLabel}>Active Users</Text>
                        <Text style={styles.kpiValue}>1,240</Text>
                        <View style={styles.trendContainer}>
                            <Ionicons name="trending-up" size={12} color={theme.colors.success} />
                            <Text style={styles.trendValue}>+5%</Text>
                        </View>
                    </View>

                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiLabel}>Pending</Text>
                        <Text style={styles.kpiValue}>24</Text>
                        <View style={styles.trendContainer}>
                            <Ionicons name="alert-circle" size={12} color={theme.colors.accent} />
                            <Text style={[styles.trendValue, { color: theme.colors.accent }]}>Action</Text>
                        </View>
                    </View>
                </View>

                {/* Active Projects */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Active Projects</Text>
                    <TouchableOpacity onPress={() => Alert.alert("Coming Soon", "Add new project feature is under development")}>
                        <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectScroll}>
                    {Projects.map((project) => (
                        <TouchableOpacity
                            key={project.id}
                            style={styles.projectCard}
                            onPress={() => openAddUserModal(project)}
                        >
                            <LinearGradient
                                colors={['rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.05)']}
                                style={styles.projectGradient}
                            >
                                <View style={styles.projectHeader}>
                                    <View style={styles.projectIcon}>
                                        <Ionicons name="business" size={20} color={theme.colors.primary} />
                                    </View>
                                    <View style={styles.memberBadge}>
                                        <Ionicons name="people" size={12} color={theme.colors.textSecondary} />
                                        <Text style={styles.memberCount}>{project.members}</Text>
                                    </View>
                                </View>
                                <Text style={styles.projectName} numberOfLines={2}>{project.name}</Text>
                                <Text style={styles.projectBudget}>{project.budget}</Text>
                                <View style={styles.addMemberBtn}>
                                    <Text style={styles.addMemberText}>+ Add Member</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Add User Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                        <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                                <View style={styles.modalContent}>
                                    <View style={styles.modalHeader}>
                                        <Text style={styles.modalTitle}>Add Member</Text>
                                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                                            <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.modalSubtitle}>
                                        Invite a new user to <Text style={{ color: theme.colors.primary }}>{selectedProject?.name}</Text>
                                    </Text>

                                    <View style={styles.inputContainer}>
                                        <Text style={styles.inputLabel}>Email Address</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="user@example.com"
                                            placeholderTextColor="rgba(255,255,255,0.3)"
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>

                                    <TouchableOpacity style={styles.sendInviteBtn} onPress={handleAddUser}>
                                        <LinearGradient
                                            colors={[theme.colors.primary, '#8B5CF6']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.sendInviteGradient}
                                        >
                                            <Text style={styles.sendInviteText}>Send Invitation</Text>
                                            <Ionicons name="paper-plane" size={16} color="white" />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Pending Approvals</Text>
                    <TouchableOpacity onPress={() => Alert.alert("Coming Soon", "All approvals view is under development")}>
                        <Text style={styles.seeAll}>View All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.listContainer}>
                    {Approvals.map((item) => (
                        <View key={item.id} style={styles.approvalItem}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
                            </View>
                            <View style={styles.itemContent}>
                                <Text style={styles.itemTitle}>{item.title}</Text>
                                <Text style={styles.itemSubtitle}>Req by: {item.user} • {item.amount}</Text>
                            </View>
                            <View style={styles.actions}>
                                <TouchableOpacity
                                    style={[styles.actionBtn, styles.rejectBtn]}
                                    onPress={() => Alert.alert(
                                        "Reject Request",
                                        `Are you sure you want to reject "${item.title}" (${item.amount})?`,
                                        [
                                            { text: "Cancel", style: "cancel" },
                                            { text: "Reject", style: "destructive", onPress: () => Alert.alert("Rejected", `Request "${item.title}" has been rejected.`) }
                                        ]
                                    )}
                                >
                                    <Ionicons name="close" size={18} color={theme.colors.danger} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionBtn, styles.approveBtn]}
                                    onPress={() => Alert.alert(
                                        "Approve Request",
                                        `Are you sure you want to approve "${item.title}" (${item.amount})?`,
                                        [
                                            { text: "Cancel", style: "cancel" },
                                            { text: "Approve", onPress: () => Alert.alert("Approved", `Request "${item.title}" has been approved.`) }
                                        ]
                                    )}
                                >
                                    <Ionicons name="checkmark" size={18} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>

                {/* System Health */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>System Health</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.row}>
                        <View style={styles.healthItem}>
                            <Ionicons name="people" size={20} color={theme.colors.primary} />
                            <Text style={styles.healthLabel}>User Growth</Text>
                        </View>
                        <Text style={styles.healthStatus}>Healthy</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <View style={styles.healthItem}>
                            <Ionicons name="server" size={20} color={theme.colors.accent} />
                            <Text style={styles.healthLabel}>Server Load</Text>
                        </View>
                        <Text style={styles.healthStatusNeutral}>24%</Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        backgroundColor: theme.colors.textPrimary,
        paddingHorizontal: theme.spacing.l,
        paddingTop: theme.spacing.xxl,
        paddingBottom: theme.spacing.xl,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: theme.borderRadius.xl,
        borderBottomRightRadius: theme.borderRadius.xl,
    },
    headerLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    headerTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: '700',
    },
    notifBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.danger,
        borderWidth: 1,
        borderColor: theme.colors.textPrimary,
    },
    scrollContent: {
        padding: theme.spacing.l,
    },
    kpiGrid: {
        flexDirection: 'row',
        gap: theme.spacing.s,
        marginBottom: theme.spacing.xl,
        marginTop: -theme.spacing.l, // Pull up over header
    },
    kpiCard: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        ...theme.shadows.card,
    },
    kpiLabel: {
        fontSize: 10,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    kpiValue: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    trendValue: {
        fontSize: 10,
        color: theme.colors.success,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
        marginTop: theme.spacing.m,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    seeAll: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '500',
    },
    listContainer: {
        gap: theme.spacing.m,
    },
    approvalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
        ...theme.shadows.soft,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.m,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    itemSubtitle: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    actions: {
        flexDirection: 'row',
        gap: theme.spacing.s,
    },
    actionBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rejectBtn: {
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    approveBtn: {
        backgroundColor: theme.colors.primary,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.l,
        ...theme.shadows.soft,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    healthItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.s,
    },
    healthLabel: {
        fontSize: 14,
        color: theme.colors.textPrimary,
        fontWeight: '500',
    },
    healthStatus: {
        fontSize: 14,
        color: theme.colors.success,
        fontWeight: '600',
    },
    healthStatusNeutral: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: theme.spacing.m,
    },
    // Project Styles
    projectScroll: {
        marginBottom: theme.spacing.l,
    },
    projectCard: {
        width: 160,
        height: 180,
        marginRight: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
        overflow: 'hidden',
        backgroundColor: theme.colors.surface,
        ...theme.shadows.card,
    },
    projectGradient: {
        flex: 1,
        padding: theme.spacing.m,
        justifyContent: 'space-between',
    },
    projectHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    projectIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    memberBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 8,
    },
    memberCount: {
        fontSize: 10,
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    projectName: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginTop: 8,
    },
    projectBudget: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginBottom: 8,
    },
    addMemberBtn: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingTop: 8,
        alignItems: 'center',
    },
    addMemberText: {
        fontSize: 12,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#1E2330', // Custom dark surface
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        ...theme.shadows.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.textPrimary,
    },
    modalSubtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 24,
    },
    inputContainer: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginBottom: 8,
        marginLeft: 4,
        fontWeight: '600',
    },
    input: {
        backgroundColor: theme.colors.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        color: theme.colors.textPrimary,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
    },
    sendInviteBtn: {
        borderRadius: 16,
        overflow: 'hidden',
        ...theme.shadows.card,
    },
    sendInviteGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    sendInviteText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
