/**
 * Push Notification Service
 * 
 * This service handles all push notification functionality including:
 * - Permission requests
 * - Sending local notifications
 * - Scheduling notifications
 * - Handling notification responses
 * 
 * Usage:
 *   import NotificationService from '../services/notificationService';
 *   await NotificationService.initialize();
 *   await NotificationService.sendLocalNotification('Title', 'Body');
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

class NotificationService {
    static expoPushToken = null;
    static notificationListener = null;
    static responseListener = null;

    /**
     * Initialize the notification service
     * Call this when the app starts
     */
    static async initialize() {
        try {
            // Request permissions
            const hasPermission = await this.requestPermissions();
            if (!hasPermission) {
                console.log('Notification permissions not granted');
                return false;
            }

            // Get push token (for production with Expo push service)
            await this.registerForPushNotifications();

            // Set up Android notification channel
            if (Platform.OS === 'android') {
                await this.setupAndroidChannels();
            }

            console.log('Notification service initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize notifications:', error);
            return false;
        }
    }

    /**
     * Request notification permissions
     */
    static async requestPermissions() {
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error requesting notification permissions:', error);
            return false;
        }
    }

    /**
     * Register for push notifications and get Expo push token
     */
    static async registerForPushNotifications() {
        try {
            if (!Device.isDevice) {
                console.log('Push notifications require a physical device');
                return null;
            }

            const token = await Notifications.getExpoPushTokenAsync({
                projectId: 'your-project-id', // Replace with actual Expo project ID when deploying
            });

            this.expoPushToken = token.data;
            console.log('Expo Push Token:', this.expoPushToken);

            return this.expoPushToken;
        } catch (error) {
            console.log('Could not get push token (this is normal in development):', error.message);
            return null;
        }
    }

    /**
     * Set up Android notification channels
     */
    static async setupAndroidChannels() {
        // Default channel for general notifications
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#6366F1',
            sound: 'default',
        });

        // Channel for spending/transaction notifications
        await Notifications.setNotificationChannelAsync('transactions', {
            name: 'Transactions',
            description: 'Spending and transaction updates',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#10B981',
            sound: 'default',
        });

        // Channel for project updates
        await Notifications.setNotificationChannelAsync('projects', {
            name: 'Project Updates',
            description: 'Updates about your projects',
            importance: Notifications.AndroidImportance.DEFAULT,
            lightColor: '#F59E0B',
            sound: 'default',
        });

        // Channel for member updates
        await Notifications.setNotificationChannelAsync('members', {
            name: 'Member Updates',
            description: 'Member added/removed notifications',
            importance: Notifications.AndroidImportance.DEFAULT,
            lightColor: '#8B5CF6',
            sound: 'default',
        });
    }

    /**
     * Send an immediate local notification
     */
    static async sendLocalNotification(title, body, data = {}, channelId = 'default') {
        try {
            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data,
                    sound: 'default',
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: null, // null = immediate
            });

            console.log('Notification sent:', notificationId);
            return notificationId;
        } catch (error) {
            console.error('Failed to send notification:', error);
            return null;
        }
    }

    /**
     * Schedule a notification for later
     */
    static async scheduleNotification(title, body, triggerSeconds, data = {}) {
        try {
            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data,
                    sound: 'default',
                },
                trigger: {
                    seconds: triggerSeconds,
                },
            });

            console.log('Notification scheduled:', notificationId);
            return notificationId;
        } catch (error) {
            console.error('Failed to schedule notification:', error);
            return null;
        }
    }

    /**
     * Cancel a scheduled notification
     */
    static async cancelNotification(notificationId) {
        try {
            await Notifications.cancelScheduledNotificationAsync(notificationId);
            console.log('Notification cancelled:', notificationId);
        } catch (error) {
            console.error('Failed to cancel notification:', error);
        }
    }

    /**
     * Cancel all scheduled notifications
     */
    static async cancelAllNotifications() {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            console.log('All notifications cancelled');
        } catch (error) {
            console.error('Failed to cancel all notifications:', error);
        }
    }

    /**
     * Get all scheduled notifications
     */
    static async getScheduledNotifications() {
        try {
            return await Notifications.getAllScheduledNotificationsAsync();
        } catch (error) {
            console.error('Failed to get scheduled notifications:', error);
            return [];
        }
    }

    /**
     * Set up notification listeners
     * Call this in your root component (App.js)
     */
    static setupListeners(onNotificationReceived, onNotificationResponse) {
        // Listener for when a notification is received while app is foregrounded
        this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
            console.log('Notification received:', notification);
            if (onNotificationReceived) {
                onNotificationReceived(notification);
            }
        });

        // Listener for when user interacts with a notification
        this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification response:', response);
            if (onNotificationResponse) {
                onNotificationResponse(response);
            }
        });
    }

    /**
     * Remove notification listeners
     * Call this on cleanup
     */
    static removeListeners() {
        if (this.notificationListener && this.notificationListener.remove) {
            this.notificationListener.remove();
            this.notificationListener = null;
        }
        if (this.responseListener && this.responseListener.remove) {
            this.responseListener.remove();
            this.responseListener = null;
        }
    }

    /**
     * Set badge count (iOS only)
     */
    static async setBadgeCount(count) {
        try {
            await Notifications.setBadgeCountAsync(count);
        } catch (error) {
            console.error('Failed to set badge count:', error);
        }
    }

    // ============================================
    // App-Specific Notification Helpers
    // ============================================

    /**
     * Send spending notification
     */
    static async notifySpendingAdded(amount, category, projectName) {
        return this.sendLocalNotification(
            '💰 Spending Added',
            `₹${amount.toLocaleString()} spent on ${category} in ${projectName}`,
            { type: 'spending', category, amount },
            'transactions'
        );
    }

    /**
     * Send member added notification
     */
    static async notifyMemberAdded(memberName, projectName) {
        return this.sendLocalNotification(
            '👤 New Member',
            `${memberName} has been added to ${projectName}`,
            { type: 'member_added', memberName },
            'members'
        );
    }

    /**
     * Send member removed notification
     */
    static async notifyMemberRemoved(memberName, projectName) {
        return this.sendLocalNotification(
            '👤 Member Removed',
            `${memberName} has been removed from ${projectName}`,
            { type: 'member_removed', memberName },
            'members'
        );
    }

    /**
     * Send admin promoted notification
     */
    static async notifyAdminPromoted(memberName, projectName) {
        return this.sendLocalNotification(
            '🛡️ New Admin',
            `${memberName} is now an admin of ${projectName}`,
            { type: 'admin_promoted', memberName },
            'members'
        );
    }

    /**
     * Send project update notification
     */
    static async notifyProjectUpdate(projectName, updateType) {
        return this.sendLocalNotification(
            '📊 Project Update',
            `${projectName}: ${updateType}`,
            { type: 'project_update', projectName },
            'projects'
        );
    }

    /**
     * Send approval request notification
     */
    static async notifyApprovalRequest(requestType, projectName) {
        return this.sendLocalNotification(
            '⏳ Approval Required',
            `New ${requestType} request for ${projectName}`,
            { type: 'approval_request', requestType },
            'default'
        );
    }

    /**
     * Send daily reminder notification
     */
    static async scheduleDailyReminder(hour = 9, minute = 0) {
        try {
            // Cancel any existing daily reminder
            await this.cancelAllNotifications();

            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: '📈 Daily Check-In',
                    body: 'Don\'t forget to review your projects and update spendings!',
                    sound: 'default',
                },
                trigger: {
                    hour,
                    minute,
                    repeats: true,
                },
            });

            console.log('Daily reminder scheduled:', notificationId);
            return notificationId;
        } catch (error) {
            console.error('Failed to schedule daily reminder:', error);
            return null;
        }
    }
}

export default NotificationService;
