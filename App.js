import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Context
import { AuthProvider } from './src/context/AuthContext';

// Services
import NotificationService from './src/services/notificationService';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';
import ReportsScreen from './src/screens/client/ReportsScreen';
import ApprovalsScreen from './src/screens/client/ApprovalsScreen';
import PortfolioAnalyticsScreen from './src/screens/client/PortfolioAnalyticsScreen';

// Investor Screens
import InvestorDashboard from './src/screens/investor/InvestorDashboard';
import CreateProjectInvestorScreen from './src/screens/investor/CreateProjectInvestorScreen';
import ManageProjectInvestorsScreen from './src/screens/investor/ManageProjectInvestorsScreen';
import ProjectApprovalDetailScreen from './src/screens/investor/ProjectApprovalDetailScreen';
import ProjectDetailScreen from './src/screens/investor/ProjectDetailScreen';

// Expense Tracking Screens
import DailyExpensesScreen from './src/screens/expenses/DailyExpensesScreen';
import ExpenseAnalyticsScreen from './src/screens/expenses/ExpenseAnalyticsScreen';

// Shared Screens
import ProfileScreen from './src/screens/shared/ProfileScreen';
import SettingsScreen from './src/screens/shared/SettingsScreen';
import NotificationScreen from './src/screens/shared/NotificationScreen';
import { setCurrentUserId as setGlobalUser } from './src/data/mockData';

const Stack = createNativeStackNavigator();

// Storage key for onboarding status
const ONBOARDING_KEY_PREFIX = 'splitflow_onboarded_';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(true); // Default to true to prevent flash
  const [currentUserId, setCurrentUserId] = useState('USR001');
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false);

  // Initialize notifications on app start
  useEffect(() => {
    const initNotifications = async () => {
      await NotificationService.initialize();

      // Set up notification listeners
      NotificationService.setupListeners(
        // Called when notification is received while app is in foreground
        (notification) => {
          console.log('Notification received in foreground:', notification.request.content.title);
        },
        // Called when user taps on a notification
        (response) => {
          const data = response.notification.request.content.data;
          console.log('User tapped notification:', data);
          // Handle navigation based on notification type here
        }
      );
    };

    initNotifications();

    // Cleanup on unmount
    return () => {
      NotificationService.removeListeners();
    };
  }, []);

  // Check onboarding status for user
  const checkOnboardingStatus = async (userId) => {
    try {
      const key = `${ONBOARDING_KEY_PREFIX}${userId}`;
      const hasCompletedOnboarding = await AsyncStorage.getItem(key);
      return hasCompletedOnboarding === 'true';
    } catch (error) {
      console.log('Error checking onboarding status:', error);
      return true; // Default to completed on error
    }
  };

  // Save onboarding completion
  const saveOnboardingComplete = async (userId) => {
    try {
      const key = `${ONBOARDING_KEY_PREFIX}${userId}`;
      await AsyncStorage.setItem(key, 'true');
    } catch (error) {
      console.log('Error saving onboarding status:', error);
    }
  };

  const handleLogin = async (userId = 'USR001') => {
    setGlobalUser(userId); // Update global mock data state
    setCurrentUserId(userId);
    setIsCheckingOnboarding(true);

    // Check if user has already completed onboarding
    const alreadyOnboarded = await checkOnboardingStatus(userId);
    setHasOnboarded(alreadyOnboarded);
    setIsCheckingOnboarding(false);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setHasOnboarded(true); // Reset to true to prevent flash on next login
  };

  const handleOnboardingComplete = async () => {
    await saveOnboardingComplete(currentUserId);
    setHasOnboarded(true);
  };

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            {!isLoggedIn ? (
              <>
                <Stack.Screen name="Login">
                  {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
                </Stack.Screen>
                <Stack.Screen name="SignUp">
                  {(props) => <SignUpScreen {...props} onLogin={handleLogin} />}
                </Stack.Screen>
              </>
            ) : !hasOnboarded ? (
              <Stack.Screen name="Onboarding">
                {(props) => <OnboardingScreen {...props} onComplete={handleOnboardingComplete} />}
              </Stack.Screen>
            ) : (
              <>
                <Stack.Screen name="InvestorDashboard">
                  {(props) => <InvestorDashboard {...props} onLogout={handleLogout} />}
                </Stack.Screen>
                <Stack.Screen
                  name="Reports"
                  component={ReportsScreen}
                  options={{ animation: 'slide_from_bottom' }}
                />
                <Stack.Screen
                  name="Approvals"
                  component={ApprovalsScreen}
                  options={{ animation: 'slide_from_bottom' }}
                />
                <Stack.Screen
                  name="PortfolioAnalytics"
                  component={PortfolioAnalyticsScreen}
                  options={{ animation: 'slide_from_bottom' }}
                />
                <Stack.Screen
                  name="CreateProjectInvestor"
                  component={CreateProjectInvestorScreen}
                  options={{ animation: 'slide_from_bottom' }}
                />
                <Stack.Screen
                  name="ManageProjectInvestors"
                  component={ManageProjectInvestorsScreen}
                  options={{ animation: 'slide_from_bottom' }}
                />
                <Stack.Screen
                  name="ProjectDetail"
                  component={ProjectDetailScreen}
                  options={{ animation: 'slide_from_bottom' }}
                />
                <Stack.Screen
                  name="ProjectApprovalDetail"
                  component={ProjectApprovalDetailScreen}
                  options={{ animation: 'slide_from_bottom' }}
                />
                <Stack.Screen name="Profile">
                  {(props) => <ProfileScreen {...props} onLogout={handleLogout} />}
                </Stack.Screen>
                <Stack.Screen
                  name="Notifications"
                  component={NotificationScreen}
                  options={{ animation: 'slide_from_right' }}
                />
                <Stack.Screen
                  name="Settings"
                  component={SettingsScreen}
                  options={{ animation: 'slide_from_bottom' }}
                />
                <Stack.Screen
                  name="DailyExpenses"
                  component={DailyExpensesScreen}
                  options={{ animation: 'slide_from_bottom' }}
                />
                <Stack.Screen
                  name="ExpenseAnalytics"
                  component={ExpenseAnalyticsScreen}
                  options={{ animation: 'slide_from_right' }}
                />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProvider >
  );
}
