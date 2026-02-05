import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    TextInput,
    Alert,
    ActivityIndicator,
    Modal,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../components/Theme';
import { api } from '../../services/api';
import { getRelativeTime } from '../../data/mockData';

export default function AnnouncementsScreen({ navigation }) {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        content: '',
        priority: 'medium',
        targetAudience: 'all',
    });

    useEffect(() => {
        loadAnnouncements();
    }, []);

    useEffect(() => {
        if (!loading) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();
        }
    }, [loading]);

    const loadAnnouncements = async () => {
        try {
            const data = await api.getAnnouncements();
            setAnnouncements(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load announcements');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
            Alert.alert('Validation Error', 'Please fill in all fields');
            return;
        }

        try {
            setSubmitting(true);
            const result = await api.createAnnouncement(newAnnouncement);

            if (result.success) {
                setAnnouncements([result.announcement, ...announcements]);
                setShowModal(false);
                setNewAnnouncement({
                    title: '',
                    content: '',
                    priority: 'medium',
                    targetAudience: 'all',
                });
                Alert.alert('Success', 'Announcement published successfully');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to create announcement');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert(
            'Delete Announcement',
            'Are you sure you want to delete this announcement?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await api.deleteAnnouncement(id);
                        setAnnouncements(announcements.filter(a => a.id !== id));
                    },
                },
            ]
        );
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return theme.colors.danger;
            case 'medium': return theme.colors.warning;
            case 'low': return theme.colors.success;
            default: return theme.colors.textSecondary;
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'high': return 'alert-circle';
            case 'medium': return 'information-circle';
            case 'low': return 'checkmark-circle';
            default: return 'ellipse';
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    const AnnouncementCard = ({ item }) => (
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
                    <Ionicons
                        name={getPriorityIcon(item.priority)}
                        size={14}
                        color={getPriorityColor(item.priority)}
                    />
                    <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                        {item.priority.toUpperCase()}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash-outline" size={20} color={theme.colors.textTertiary} />
                </TouchableOpacity>
            </View>

            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardContent}>{item.content}</Text>

            <View style={styles.cardFooter}>
                <View style={styles.audienceBadge}>
                    <Ionicons
                        name={item.targetAudience === 'all' ? 'people' : 'person'}
                        size={14}
                        color={theme.colors.textSecondary}
                    />
                    <Text style={styles.audienceText}>
                        {item.targetAudience === 'all' ? 'All Users' :
                            item.targetAudience === 'investors' ? 'Investors Only' : 'Admins Only'}
                    </Text>
                </View>
                <Text style={styles.timeText}>{getRelativeTime(item.createdAt)}</Text>
            </View>
        </Animated.View>
    );

    AnnouncementCard.propTypes = {
        item: PropTypes.shape({
            id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            content: PropTypes.string.isRequired,
            priority: PropTypes.string.isRequired,
            targetAudience: PropTypes.string.isRequired,
            createdAt: PropTypes.string.isRequired,
        }).isRequired,
    };

    const PriorityButton = ({ value, label }) => (
        <TouchableOpacity
            style={[
                styles.optionButton,
                newAnnouncement.priority === value && {
                    backgroundColor: getPriorityColor(value) + '20',
                    borderColor: getPriorityColor(value),
                },
            ]}
            onPress={() => setNewAnnouncement({ ...newAnnouncement, priority: value })}
        >
            <View style={[styles.optionDot, { backgroundColor: getPriorityColor(value) }]} />
            <Text style={[
                styles.optionText,
                newAnnouncement.priority === value && { color: getPriorityColor(value) },
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    PriorityButton.propTypes = {
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
    };

    const AudienceButton = ({ value, label, icon }) => (
        <TouchableOpacity
            style={[
                styles.optionButton,
                newAnnouncement.targetAudience === value && styles.optionButtonActive,
            ]}
            onPress={() => setNewAnnouncement({ ...newAnnouncement, targetAudience: value })}
        >
            <Ionicons
                name={icon}
                size={16}
                color={newAnnouncement.targetAudience === value ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text style={[
                styles.optionText,
                newAnnouncement.targetAudience === value && styles.optionTextActive,
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    AudienceButton.propTypes = {
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Announcements</Text>
                <TouchableOpacity onPress={() => setShowModal(true)}>
                    <Ionicons name="add-circle" size={28} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                {announcements.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="megaphone-outline" size={64} color={theme.colors.textTertiary} />
                        <Text style={styles.emptyTitle}>No Announcements</Text>
                        <Text style={styles.emptyText}>Create your first announcement to notify users.</Text>
                    </View>
                ) : (
                    announcements.map((item) => (
                        <AnnouncementCard key={item.id} item={item} />
                    ))
                )}
                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Create Modal */}
            <Modal
                visible={showModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowModal(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>New Announcement</Text>
                                    <TouchableOpacity onPress={() => setShowModal(false)}>
                                        <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Title</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={newAnnouncement.title}
                                            onChangeText={(text) => setNewAnnouncement({ ...newAnnouncement, title: text })}
                                            placeholder="Announcement title"
                                            placeholderTextColor={theme.colors.textTertiary}
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Content</Text>
                                        <TextInput
                                            style={[styles.input, styles.textArea]}
                                            value={newAnnouncement.content}
                                            onChangeText={(text) => setNewAnnouncement({ ...newAnnouncement, content: text })}
                                            placeholder="Write your announcement..."
                                            placeholderTextColor={theme.colors.textTertiary}
                                            multiline
                                            numberOfLines={4}
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Priority</Text>
                                        <View style={styles.optionsRow}>
                                            <PriorityButton value="low" label="Low" />
                                            <PriorityButton value="medium" label="Medium" />
                                            <PriorityButton value="high" label="High" />
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Target Audience</Text>
                                        <View style={styles.optionsRow}>
                                            <AudienceButton value="all" label="All" icon="people" />
                                            <AudienceButton value="investors" label="Investors" icon="person" />
                                            <AudienceButton value="admins" label="Admins" icon="shield" />
                                        </View>
                                    </View>
                                </ScrollView>

                                <TouchableOpacity
                                    style={styles.createButton}
                                    onPress={handleCreate}
                                    disabled={submitting}
                                >
                                    <LinearGradient
                                        colors={[theme.colors.primary, theme.colors.primaryDark]}
                                        style={styles.createGradient}
                                    >
                                        {submitting ? (
                                            <ActivityIndicator color="white" />
                                        ) : (
                                            <>
                                                <Ionicons name="megaphone" size={20} color="white" />
                                                <Text style={styles.createText}>Publish Announcement</Text>
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
}

AnnouncementsScreen.propTypes = {
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
    content: {
        flex: 1,
        padding: 16,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        ...theme.shadows.card,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    priorityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    priorityText: {
        fontSize: 11,
        fontWeight: '600',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 8,
    },
    cardContent: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        lineHeight: 20,
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderLight,
    },
    audienceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    audienceText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    timeText: {
        fontSize: 12,
        color: theme.colors.textTertiary,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginTop: 16,
    },
    emptyText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 8,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.textSecondary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: theme.colors.surfaceAlt,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: theme.colors.textPrimary,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    optionsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    optionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surfaceAlt,
        gap: 4,
        minWidth: 0,
    },
    optionButtonActive: {
        backgroundColor: theme.colors.primaryLight,
        borderColor: theme.colors.primary,
    },
    optionDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    optionText: {
        fontSize: 11,
        fontWeight: '500',
        color: theme.colors.textSecondary,
    },
    optionTextActive: {
        color: theme.colors.primary,
    },
    createButton: {
        marginTop: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },
    createGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    createText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
});
