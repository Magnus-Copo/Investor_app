/**
 * Privacy Utilities - Interface Segregation for Investor Identity
 * 
 * Allows investors to hide their identity from co-investors while
 * remaining visible to project admins.
 */

/**
 * Check if an investor is anonymous in a specific project
 * @param {string} investorId - The investor's ID
 * @param {string} projectId - The project ID
 * @param {Object} privacySettings - The investor's privacy settings
 * @returns {boolean}
 */
export const isInvestorAnonymous = (investorId, projectId, privacySettings) => {
    if (!privacySettings || !privacySettings[projectId]) {
        return false;
    }
    return privacySettings[projectId].isAnonymous === true;
};

/**
 * Get visible investor data based on viewer permissions
 * Implements interface segregation principle:
 * - Admin sees everything with anonymous badge
 * - Co-investor sees masked data if investor is anonymous
 * - Self always sees own data
 * 
 * @param {Object} investor - Full investor object
 * @param {string} projectId - Current project context
 * @param {string} viewerId - ID of the person viewing
 * @param {boolean} isViewerAdmin - Whether viewer is project admin
 * @returns {Object} Filtered investor data
 */
export const getVisibleInvestorData = (investor, projectId, viewerId, isViewerAdmin) => {
    // Self always sees own full data
    if (investor.id === viewerId) {
        return {
            ...investor,
            isAnonymous: false,
            isSelf: true,
            visibilityLevel: 'full',
        };
    }

    const privacySettings = investor.privacySettings || {};
    const projectPrivacy = privacySettings[projectId] || {};
    const isAnonymous = projectPrivacy.isAnonymous === true;

    // Admin sees everything with anonymous indicator
    if (isViewerAdmin) {
        return {
            ...investor,
            isAnonymous,
            isSelf: false,
            visibilityLevel: 'admin', // Full access with badge indicator
        };
    }

    // Co-investor sees masked data if anonymous
    if (isAnonymous) {
        return {
            id: investor.id,
            name: projectPrivacy.displayName || 'Anonymous Investor',
            email: '••••••••@••••.com',
            avatar: null,
            totalInvested: projectPrivacy.showInvestmentAmount ? investor.totalInvested : null,
            isAnonymous: true,
            isSelf: false,
            visibilityLevel: 'anonymous',
        };
    }

    // Not anonymous - show full data
    return {
        ...investor,
        isAnonymous: false,
        isSelf: false,
        visibilityLevel: 'full',
    };
};

/**
 * Get all investors for a project with privacy filtering applied
 * @param {Array} investors - All investors in project
 * @param {string} projectId - Project ID
 * @param {string} viewerId - Viewer's user ID
 * @param {boolean} isViewerAdmin - Is viewer a project admin
 * @returns {Array} Filtered investor list
 */
export const getProjectInvestorsWithPrivacy = (investors, projectId, viewerId, isViewerAdmin) => {
    return investors.map(investor =>
        getVisibleInvestorData(investor, projectId, viewerId, isViewerAdmin)
    );
};

/**
 * Toggle anonymous mode for an investor in a project
 * @param {Object} currentSettings - Current privacy settings object
 * @param {string} projectId - Project to toggle
 * @param {boolean} isAnonymous - New anonymous state
 * @param {Object} options - Additional options
 * @returns {Object} Updated privacy settings
 */
export const updatePrivacySettings = (currentSettings, projectId, isAnonymous, options = {}) => {
    const existingProjectSettings = currentSettings?.[projectId] || {};

    return {
        ...currentSettings,
        [projectId]: {
            isAnonymous,
            displayName: options.displayName || existingProjectSettings.displayName || 'Anonymous Investor',
            showInvestmentAmount: options.showInvestmentAmount ?? existingProjectSettings.showInvestmentAmount ?? false,
        },
    };
};

/**
 * Get default privacy settings for a new project investment
 * @param {string} projectId - Project ID
 * @returns {Object} Default privacy settings
 */
export const getDefaultPrivacySettings = (projectId) => ({
    [projectId]: {
        isAnonymous: false,
        displayName: 'Anonymous Investor',
        showInvestmentAmount: false,
    },
});

/**
 * Privacy level descriptions for UI
 */
export const PRIVACY_LEVELS = {
    full: {
        label: 'Visible',
        description: 'Your name and details are visible to all project members',
        icon: 'eye-outline',
        color: '#10B981',
    },
    anonymous: {
        label: 'Anonymous',
        description: 'Only admins can see your identity, others see "Anonymous Investor"',
        icon: 'eye-off-outline',
        color: '#6366F1',
    },
};
