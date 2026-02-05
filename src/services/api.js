/**
 * API Service Layer
 * 
 * This file provides a clean interface for data fetching.
 * Currently uses mock data, but can be easily replaced with actual API calls.
 * 
 * Usage:
 *   import { api } from '../services/api';
 *   const portfolio = await api.getPortfolio();
 */

import {
    currentUser,
    portfolioSummary,
    investments,
    recentUpdates,
    adminKPIs,
    projects,
    pendingApprovals,
    simulateApiDelay,
    userSettings,
    portfolioAnalytics,
    announcements,
    projectTypes,
    riskLevels,
    investors,
} from '../data/mockData';

// Toggle this to simulate network delays
const SIMULATE_DELAY = false;
const DELAY_MS = 500;

const maybeDelay = async () => {
    if (SIMULATE_DELAY) {
        await simulateApiDelay(DELAY_MS);
    }
};

export const api = {
    // ============================================
    // AUTH
    // ============================================
    login: async (email, password, role) => {
        await maybeDelay();
        return {
            success: true,
            user: { ...currentUser, role },
            token: 'mock-jwt-token',
        };
    },

    logout: async () => {
        await maybeDelay();
        return { success: true };
    },

    // ============================================
    // PROFILE APIs
    // ============================================
    getProfile: async () => {
        await maybeDelay();
        // Return the actual logged-in user from mockData store
        const { getCurrentUser } = require('../data/mockData');
        return getCurrentUser();
    },

    updateProfile: async (profileData) => {
        await maybeDelay();
        // Mock update - actual API will persist changes
        Object.assign(currentUser, profileData);
        return { success: true, user: currentUser };
    },

    changePassword: async (currentPassword, newPassword) => {
        await maybeDelay();
        // Mock password change
        if (currentPassword === 'password123') {
            return { success: true, message: 'Password updated successfully' };
        }
        return { success: false, message: 'Current password is incorrect' };
    },

    // ============================================
    // SETTINGS APIs
    // ============================================
    getSettings: async () => {
        await maybeDelay();
        return userSettings;
    },

    updateSettings: async (settingsData) => {
        await maybeDelay();
        Object.assign(userSettings, settingsData);
        return { success: true, settings: userSettings };
    },

    updateNotificationPreferences: async (preferences) => {
        await maybeDelay();
        Object.assign(userSettings.notifications, preferences);
        return { success: true };
    },

    // ============================================
    // CLIENT/INVESTOR APIs
    // ============================================
    getPortfolio: async () => {
        await maybeDelay();
        return portfolioSummary;
    },

    getInvestments: async () => {
        await maybeDelay();
        return investments;
    },

    getInvestmentById: async (id) => {
        await maybeDelay();
        return investments.find(inv => inv.id === id) || null;
    },

    getUpdates: async () => {
        await maybeDelay();
        return recentUpdates;
    },

    markUpdateAsRead: async (updateId) => {
        await maybeDelay();
        const update = recentUpdates.find(u => u.id === updateId);
        if (update) update.read = true;
        return { success: true };
    },

    // ============================================
    // PORTFOLIO ANALYTICS APIs
    // ============================================
    getPortfolioAnalytics: async () => {
        await maybeDelay();
        return portfolioAnalytics;
    },

    getMonthlyReturns: async () => {
        await maybeDelay();
        return portfolioAnalytics.monthlyReturns;
    },

    getAssetAllocation: async () => {
        await maybeDelay();
        return portfolioAnalytics.assetAllocation;
    },

    getPerformanceMetrics: async () => {
        await maybeDelay();
        return portfolioAnalytics.performanceMetrics;
    },

    // ============================================
    // ADMIN APIs
    // ============================================
    getAdminKPIs: async () => {
        await maybeDelay();
        return adminKPIs;
    },

    getProjects: async () => {
        await maybeDelay();
        return projects;
    },

    getProjectById: async (id) => {
        await maybeDelay();
        return projects.find(prj => prj.id === id) || null;
    },

    getPendingApprovals: async () => {
        await maybeDelay();
        return pendingApprovals;
    },

    approveRequest: async (approvalId) => {
        await maybeDelay();
        const approval = pendingApprovals.find(a => a.id === approvalId);
        if (approval) approval.status = 'approved';
        return { success: true };
    },

    rejectRequest: async (approvalId, reason) => {
        await maybeDelay();
        const approval = pendingApprovals.find(a => a.id === approvalId);
        if (approval) {
            approval.status = 'rejected';
            approval.rejectionReason = reason;
        }
        return { success: true };
    },

    // ============================================
    // PROJECT MANAGEMENT APIs
    // ============================================
    getProjectTypes: async () => {
        await maybeDelay();
        return projectTypes;
    },

    getRiskLevels: async () => {
        await maybeDelay();
        return riskLevels;
    },

    createProject: async (projectData) => {
        await maybeDelay();
        const newProject = {
            id: `PRJ${Date.now()}`,
            ...projectData,
            status: 'pending',
            investorCount: 0,
            raised: 0,
            progress: 0,
            createdAt: new Date().toISOString(),
        };
        projects.push(newProject);
        return { success: true, project: newProject };
    },

    updateProject: async (projectId, projectData) => {
        await maybeDelay();
        const project = projects.find(p => p.id === projectId);
        if (project) {
            Object.assign(project, projectData);
            return { success: true, project };
        }
        return { success: false, message: 'Project not found' };
    },

    // ============================================
    // INVESTOR MANAGEMENT APIs
    // ============================================
    getInvestors: async () => {
        await maybeDelay();
        return investors;
    },

    getInvestorById: async (id) => {
        await maybeDelay();
        return investors.find(inv => inv.id === id) || null;
    },

    addInvestor: async (investorData) => {
        await maybeDelay();
        const newInvestor = {
            id: `USR${Date.now()}`,
            ...investorData,
            totalInvested: 0,
            activeProjects: 0,
            joinedAt: new Date().toISOString().split('T')[0],
            status: 'pending',
            kycVerified: false,
        };
        investors.push(newInvestor);
        return { success: true, investor: newInvestor };
    },

    updateInvestor: async (investorId, investorData) => {
        await maybeDelay();
        const investor = investors.find(i => i.id === investorId);
        if (investor) {
            Object.assign(investor, investorData);
            return { success: true, investor };
        }
        return { success: false, message: 'Investor not found' };
    },

    // ============================================
    // ANNOUNCEMENTS APIs
    // ============================================
    getAnnouncements: async () => {
        await maybeDelay();
        return announcements;
    },

    getAnnouncementById: async (id) => {
        await maybeDelay();
        return announcements.find(a => a.id === id) || null;
    },

    createAnnouncement: async (announcementData) => {
        await maybeDelay();
        const newAnnouncement = {
            id: `ANN${Date.now()}`,
            ...announcementData,
            createdAt: new Date().toISOString(),
            createdBy: 'Admin',
            read: false,
        };
        announcements.unshift(newAnnouncement);
        return { success: true, announcement: newAnnouncement };
    },

    markAnnouncementAsRead: async (id) => {
        await maybeDelay();
        const announcement = announcements.find(a => a.id === id);
        if (announcement) announcement.read = true;
        return { success: true };
    },

    deleteAnnouncement: async (id) => {
        await maybeDelay();
        const index = announcements.findIndex(a => a.id === id);
        if (index > -1) {
            announcements.splice(index, 1);
            return { success: true };
        }
        return { success: false, message: 'Announcement not found' };
    },
};

export default api;

