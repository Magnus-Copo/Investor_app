import React, { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ROLES, hasPermission, getAllPermissions, isProjectAdmin } from '../utils/permissions';
import { getCurrentUser } from '../data/mockData';

// Create the Auth Context
const AuthContext = createContext(null);

// Storage keys
const STORAGE_KEYS = {
    HAS_LOGGED_IN_BEFORE: 'splitflow_has_logged_in_before',
    SHOW_INFO_MODAL: 'splitflow_show_info_modal',
};

/**
 * AuthProvider - Centralized authentication and RBAC state management
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isOnboarded, setIsOnboarded] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

    /**
     * Check if user has logged in before
     */
    const checkFirstTimeUser = useCallback(async () => {
        try {
            const hasLoggedInBefore = await AsyncStorage.getItem(STORAGE_KEYS.HAS_LOGGED_IN_BEFORE);
            return hasLoggedInBefore !== 'true';
        } catch {
            return true; // Assume first time if error
        }
    }, []);

    /**
     * Mark user as having logged in
     */
    const markAsLoggedIn = useCallback(async () => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.HAS_LOGGED_IN_BEFORE, 'true');
        } catch (error) {
            console.log('Error saving login state:', error);
        }
    }, []);

    /**
     * Dismiss the info modal and save state
     */
    const dismissInfoModal = useCallback(async () => {
        setShowInfoModal(false);
        setIsFirstTimeUser(false);
        await markAsLoggedIn();
    }, [markAsLoggedIn]);

    /**
     * Login user and set role
     */
    const login = useCallback(async (userId = 'USR001') => {
        // Check if this is first time user
        const isFirstTime = await checkFirstTimeUser();
        setIsFirstTimeUser(isFirstTime);
        
        // Just fetch the user from mock data based on ID
        const loggedInUser = {
            ...getCurrentUser(), // Gets the user set by setCurrentUserId in mockData
            role: ROLES.INVESTOR,
            permissions: getAllPermissions(ROLES.INVESTOR),
            isFirstTimeUser: isFirstTime,
        };
        setUser(loggedInUser);
        setIsAuthenticated(true);
        
        // Show info modal only for first time users
        if (isFirstTime) {
            setShowInfoModal(true);
        }
        
        return { success: true, user: loggedInUser };
    }, [checkFirstTimeUser]);

    /**
     * Logout user
     */
    const logout = useCallback(() => {
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    /**
     * Check if current user has a specific permission
     */
    const checkPermission = useCallback((permission) => {
        if (!user) return false;
        return hasPermission(user.role, permission);
    }, [user]);

    /**
     * Check if user is admin of a specific project
     */
    const checkProjectAdmin = useCallback((project) => {
        if (!user) return false;
        return isProjectAdmin(user.id, project);
    }, [user]);

    /**
     * Get user's effective role for a project
     * (Could be elevated to PROJECT_ADMIN if they created the project)
     */
    const getProjectRole = useCallback((project) => {
        if (!user) return ROLES.GUEST;
        if (isProjectAdmin(user.id, project)) return ROLES.PROJECT_ADMIN;
        return user.role;
    }, [user]);

    /**
     * Mark onboarding as complete
     */
    const completeOnboarding = useCallback(() => {
        setIsOnboarded(true);
        // In production, persist this to storage/API
    }, []);

    const value = {
        // State
        user,
        isAuthenticated,
        isOnboarded,
        showInfoModal,
        isFirstTimeUser,

        // Actions
        login,
        logout,
        completeOnboarding,
        dismissInfoModal,

        // RBAC helpers
        checkPermission,
        checkProjectAdmin,
        getProjectRole,
        hasPermission: (permission) => checkPermission(permission),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

/**
 * useAuth hook - Access auth context from any component
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

/**
 * ProtectedComponent - Wrapper that checks permissions before rendering
 */
export function ProtectedComponent({ permission, fallback = null, children }) {
    const { checkPermission } = useAuth();

    if (!checkPermission(permission)) {
        return fallback;
    }

    return children;
}

ProtectedComponent.propTypes = {
    permission: PropTypes.string.isRequired,
    fallback: PropTypes.node,
    children: PropTypes.node.isRequired,
};

export default AuthContext;
