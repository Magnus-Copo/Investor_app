import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions,
    Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../components/Theme';
import { recentUpdates, announcements, getRelativeTime } from '../../data/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NotificationItem = ({ item, index, animation }) => {
    const translateY = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [50, 0],
    });

    const opacity = animation;

    // Determine icon and color based on type/priority
    let iconName = 'bell-outline';
    let iconColor = theme.colors.primary;
    let iconBg = '#F3F4F6';

    if (item.type === 'update') {
        iconName = 'update';
        iconColor = '#6366F1'; // Business Blue
        iconBg = '#E0E7FF';
    } else if (item.priority === 'high') {
        iconName = 'alert-circle';
        iconColor = '#EF4444'; // Red
        iconBg = '#FEE2E2';
    } else if (item.priority === 'medium') {
        iconName = 'information';
        iconColor = '#F59E0B'; // Amber
        iconBg = '#FEF3C7';
    } else {
        iconName = 'bullhorn';
        iconColor = '#10B981'; // Green
        iconBg = '#D1FAE5';
    }

    return (
        <Animated.View
            style={[
                styles.itemContainer,
                {
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
        >
            <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
                <MaterialCommunityIcons name={iconName} size={24} color={iconColor} />
            </View>
            <View style={styles.textContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.title} numberOfLines={1}>
                        {item.title || item.project}
                    </Text>
                    <Text style={styles.time}>{getRelativeTime(item.timestamp || item.createdAt)}</Text>
                </View>
                <Text style={styles.description} numberOfLines={2}>
                    {item.content || item.description || `Update for ${item.project}`}
                </Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
        </Animated.View>
    );
};

export default function NotificationScreen({ navigation }) {
    // Merge updates and announcements for a fuller list
    const [notifications, setNotifications] = useState([]);
    // Animation values array
    const animatedValues = useRef([]).current;

    useEffect(() => {
        // Prepare data: Mix recent updates and announcements
        const formattedUpdates = recentUpdates.map(u => ({ ...u, type: 'update' }));
        const allNotifs = [...formattedUpdates, ...announcements].sort((a, b) => {
            const dateA = new Date(a.timestamp || a.createdAt);
            const dateB = new Date(b.timestamp || b.createdAt);
            return dateB - dateA;
        });

        // Initialize animations for each item
        allNotifs.forEach((_, index) => {
            animatedValues[index] = new Animated.Value(0);
        });

        setNotifications(allNotifs);

        // Staggered animation effect
        const animations = allNotifs.map((_, index) => {
            return Animated.timing(animatedValues[index], {
                toValue: 1,
                duration: 400,
                delay: index * 100, // Stagger by 100ms
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            });
        });

        Animated.stagger(50, animations).start();
    }, []);

    const handleClearAll = () => {
        // Animation to clear
        // IN REAL APP: Call API to mark all as read/delete
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity onPress={handleClearAll} style={styles.markReadButton}>
                    <Text style={styles.markReadText}>Mark all read</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {notifications.length > 0 ? (
                    notifications.map((item, index) => (
                        <NotificationItem
                            key={item.id || index}
                            item={item}
                            index={index}
                            animation={animatedValues[index]}
                        />
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="bell-sleep-outline" size={64} color={theme.colors.textTertiary} />
                        <Text style={styles.emptyTitle}>No Notifications</Text>
                        <Text style={styles.emptySubtitle}>You're all caught up!</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        ...theme.shadows.soft,
        zIndex: 10,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.textPrimary,
    },
    markReadButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    markReadText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },

    // Notification Item Styles
    itemContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: 'center',
        ...theme.shadows.card, // Nice subtle shadow
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
        marginRight: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        flex: 1,
        marginRight: 8,
    },
    time: {
        fontSize: 12,
        color: theme.colors.textTertiary,
    },
    description: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        lineHeight: 20,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.primary,
        marginLeft: 8,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        opacity: 0.7,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: theme.colors.textTertiary,
        marginTop: 4,
    },
});
