import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Modal,
    Share,
    Dimensions
} from 'react-native';
import { theme } from '../components/Theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ProfileMenu from '../components/ProfileMenu';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ user, navigation, onLogout }) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
    const [showNewsModal, setShowNewsModal] = useState(false);
    const { showInfoModal, dismissInfoModal } = useAuth();

    const handleProfilePress = () => {
        setShowProfileMenu(true);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: 'Check out SplitFlow! The best app for managing investments and splitting expenses with friends. 🚀💰\n\nDownload now: https://splitflow.app',
                title: 'Share SplitFlow',
            });
        } catch (error) {
            console.log('Share error:', error);
        }
    };

    // Market prices data
    const marketPrices = [
        { name: 'Coconut', price: '₹28/kg', trend: '+5%', icon: 'tree', color: '#10B981', positive: true },
        { name: 'Rice', price: '₹45/kg', trend: '+2%', icon: 'grain', color: '#F59E0B', positive: true },
        { name: 'Tomato', price: '₹35/kg', trend: '-8%', icon: 'food-apple', color: '#EF4444', positive: false },
        { name: 'Wheat', price: '₹32/kg', trend: '+3%', icon: 'barley', color: '#8B5CF6', positive: true },
    ];

    // News items
    const newsItems = [
        { title: "Coconut prices surge in Karnataka markets", time: "2 hours ago", category: "Trending" },
        { title: "New MSP announced for Rabi crops", time: "5 hours ago", category: "Policy" },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity 
                        style={styles.hamburgerBtn} 
                        onPress={() => setShowHamburgerMenu(true)}
                    >
                        <Ionicons name="menu" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerLabel}>Welcome back,</Text>
                        <Text style={styles.headerName}>Lohith MS</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.profileBtn} onPress={handleProfilePress}>
                    <Text style={styles.profileInitials}>LM</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Enhanced Analytics Card */}
                <LinearGradient
                    colors={['#1e293b', '#0f172a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.balanceCard}
                >
                    <View style={styles.balanceHeader}>
                        <View>
                            <Text style={styles.balanceLabel}>Total Balance</Text>
                            <Text style={styles.balanceValue}>₹12,450</Text>
                        </View>
                        <View style={styles.trendBadge}>
                            <Ionicons name="trending-up" size={14} color={theme.colors.success} />
                            <Text style={styles.trendText}>+12.5%</Text>
                        </View>
                    </View>

                    {/* Mini Chart */}
                    <View style={styles.miniChart}>
                        {[35, 45, 30, 60, 45, 75, 55, 80, 65, 90, 70, 85].map((h, i) => (
                            <View 
                                key={i} 
                                style={[
                                    styles.chartBar, 
                                    { height: h * 0.6 },
                                    i === 11 && styles.chartBarActive
                                ]} 
                            />
                        ))}
                    </View>

                    <View style={styles.balanceRow}>
                        <View style={styles.balanceItem}>
                            <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                                <Ionicons name="arrow-down" size={12} color={theme.colors.success} />
                            </View>
                            <Text style={styles.balanceMetaLabel}>You are owed</Text>
                            <Text style={[styles.balanceMetaValue, { color: theme.colors.success }]}>₹14,500</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.balanceItem}>
                            <View style={[styles.iconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                                <Ionicons name="arrow-up" size={12} color={theme.colors.danger} />
                            </View>
                            <Text style={styles.balanceMetaLabel}>You owe</Text>
                            <Text style={[styles.balanceMetaValue, { color: theme.colors.danger }]}>₹2,050</Text>
                        </View>
                    </View>

                    {/* View Full Analytics Button */}
                    <TouchableOpacity style={styles.analyticsBtn}>
                        <Ionicons name="bar-chart" size={18} color={theme.colors.primary} />
                        <Text style={styles.analyticsBtnText}>View Full Analytics</Text>
                        <Ionicons name="chevron-forward" size={18} color={theme.colors.primary} />
                    </TouchableOpacity>
                </LinearGradient>

                {/* Market News Section */}
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                        <MaterialCommunityIcons name="leaf" size={20} color={theme.colors.secondary} />
                        <Text style={styles.sectionTitle}>Market News</Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowNewsModal(true)}>
                        <Text style={styles.seeAll}>View All</Text>
                    </TouchableOpacity>
                </View>

                {/* Market Prices Horizontal Scroll */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pricesScroll}>
                    {marketPrices.map((item, index) => (
                        <View key={index} style={[styles.priceCard, { borderColor: item.color + '40' }]}>
                            <View style={[styles.priceIcon, { backgroundColor: item.color + '20' }]}>
                                <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
                            </View>
                            <Text style={styles.priceName}>{item.name}</Text>
                            <View style={styles.priceRow}>
                                <Text style={styles.priceValue}>{item.price}</Text>
                                <Text style={[styles.priceTrend, { color: item.positive ? theme.colors.success : theme.colors.danger }]}>
                                    {item.trend}
                                </Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                {/* News Items */}
                <View style={styles.newsListContainer}>
                    {newsItems.map((news, index) => (
                        <TouchableOpacity key={index} style={styles.newsItem}>
                            <View style={styles.newsIcon}>
                                <MaterialCommunityIcons name="leaf" size={22} color={theme.colors.secondary} />
                            </View>
                            <View style={styles.newsContent}>
                                <Text style={styles.newsTitle}>{news.title}</Text>
                                <View style={styles.newsMeta}>
                                    <View style={styles.newsBadge}>
                                        <Text style={styles.newsBadgeText}>{news.category}</Text>
                                    </View>
                                    <Text style={styles.newsTime}>{news.time}</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Groups Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Groups</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.groupsScroll}>
                    {['Trip to Goa', 'Roommates', 'Office Lunch'].map((group, index) => (
                        <TouchableOpacity key={index} style={styles.groupCard}>
                            <View style={[styles.groupIcon, { backgroundColor: index === 0 ? '#FDE68A' : '#E0E7FF' }]} />
                            <Text style={styles.groupName}>{group}</Text>
                            <Text style={styles.groupMeta}>Settled up</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={[styles.groupCard, styles.addGroupCard]}>
                        <Ionicons name="add" size={24} color={theme.colors.textSecondary} />
                        <Text style={styles.groupMeta}>Create</Text>
                    </TouchableOpacity>
                </ScrollView>
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddExpense')}>
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>

            {/* Info Modal for First Time Users */}
            <InfoModal visible={showInfoModal} onClose={dismissInfoModal} />

            {/* Hamburger Menu */}
            <HamburgerMenu 
                visible={showHamburgerMenu} 
                onClose={() => setShowHamburgerMenu(false)} 
                onLogout={onLogout}
                navigation={navigation}
            />

            {/* News Modal */}
            <NewsModal visible={showNewsModal} onClose={() => setShowNewsModal(false)} />

            {/* Profile Menu Modal */}
            <ProfileMenu
                visible={showProfileMenu}
                onClose={() => setShowProfileMenu(false)}
                onProfile={() => {}}
                onSettings={() => {}}
                onLogout={onLogout}
                onShare={handleShare}
                userName="Lohith MS"
            />
        </View>
    );
}

// Info Modal Component
const InfoModal = ({ visible, onClose }) => (
    <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={styles.infoModalContent}>
                <LinearGradient
                    colors={['#6366F1', '#8B5CF6']}
                    style={styles.infoIconContainer}
                >
                    <MaterialCommunityIcons name="star-four-points" size={40} color="white" />
                </LinearGradient>
                <Text style={styles.infoTitle}>Welcome to SplitFlow! 🎉</Text>
                <Text style={styles.infoSubtitle}>Your smart investment & expense management companion</Text>
                
                <View style={styles.infoFeatures}>
                    {[
                        { icon: 'trending-up', title: 'Track Investments', desc: 'Monitor your portfolio in real-time' },
                        { icon: 'analytics-outline', title: 'Expense Analytics', desc: 'Get insights on your spending' },
                        { icon: 'leaf-outline', title: 'Market News', desc: 'Stay updated with agriculture prices' }
                    ].map((item, i) => (
                        <View key={i} style={styles.infoFeatureItem}>
                            <View style={styles.infoFeatureIcon}>
                                <Ionicons name={item.icon} size={20} color={theme.colors.primary} />
                            </View>
                            <View style={styles.infoFeatureText}>
                                <Text style={styles.infoFeatureTitle}>{item.title}</Text>
                                <Text style={styles.infoFeatureDesc}>{item.desc}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <TouchableOpacity style={styles.infoBtn} onPress={onClose}>
                    <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.infoBtnGradient}>
                        <Text style={styles.infoBtnText}>Get Started</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);

// Hamburger Menu Component
const HamburgerMenu = ({ visible, onClose, onLogout, navigation }) => {
    const menuItems = [
        { icon: 'home-outline', label: 'Home', color: '#6366F1' },
        { icon: 'bar-chart-outline', label: 'Analytics', color: '#14B8A6' },
        { icon: 'pie-chart-outline', label: 'Reports', color: '#F59E0B' },
        { icon: 'leaf-outline', label: 'Market News', color: '#10B981' },
        { icon: 'settings-outline', label: 'Settings', color: '#8B5CF6' },
        { icon: 'help-circle-outline', label: 'Help & Support', color: '#EC4899' },
        { icon: 'information-circle-outline', label: 'About', color: '#06B6D4' },
    ];

    return (
        <Modal visible={visible} transparent animationType="fade">
            <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={onClose}>
                <View style={styles.hamburgerContainer}>
                    {/* Header */}
                    <View style={styles.hamburgerHeader}>
                        <View style={styles.hamburgerLogoRow}>
                            <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.hamburgerLogo}>
                                <Ionicons name="layers" size={24} color="white" />
                            </LinearGradient>
                            <View>
                                <Text style={styles.hamburgerTitle}>SplitFlow</Text>
                                <Text style={styles.hamburgerVersion}>v2.0</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.hamburgerClose} onPress={onClose}>
                            <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* User Card */}
                    <LinearGradient 
                        colors={['rgba(99,102,241,0.15)', 'rgba(139,92,246,0.1)']} 
                        style={styles.userCard}
                    >
                        <View style={styles.userAvatar}>
                            <Text style={styles.userInitials}>LM</Text>
                        </View>
                        <View>
                            <Text style={styles.userName}>Lohith MS</Text>
                            <Text style={styles.userBadge}>Premium Member ✨</Text>
                        </View>
                    </LinearGradient>

                    {/* Menu Items */}
                    <ScrollView style={styles.hamburgerItems}>
                        {menuItems.map((item, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={[styles.hamburgerItem, index === 0 && styles.hamburgerItemActive]}
                                onPress={onClose}
                            >
                                <View style={[styles.hamburgerItemIcon, { backgroundColor: item.color + '20' }]}>
                                    <Ionicons name={item.icon} size={22} color={item.color} />
                                </View>
                                <Text style={styles.hamburgerItemLabel}>{item.label}</Text>
                                <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Logout */}
                    <TouchableOpacity style={styles.hamburgerLogout} onPress={() => { onClose(); onLogout(); }}>
                        <Ionicons name="log-out-outline" size={22} color={theme.colors.danger} />
                        <Text style={styles.hamburgerLogoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

// News Modal Component
const NewsModal = ({ visible, onClose }) => {
    const allNews = [
        { title: "Coconut prices surge 15% in Karnataka", desc: "Strong demand from oil mills drives prices higher.", category: "Coconut", trend: "+15%" },
        { title: "Rice exports hit record high", desc: "India becomes world's largest rice exporter.", category: "Rice", trend: "+8%" },
        { title: "Tomato prices stabilize after monsoon", desc: "Supply improves as harvest season begins.", category: "Vegetables", trend: "-12%" },
        { title: "New MSP for Rabi crops 2026", desc: "Government announces minimum support prices.", category: "Policy", trend: "New" },
        { title: "Organic farming subsidies doubled", desc: "State government increases support.", category: "Policy", trend: "New" },
        { title: "Copra prices reach 5-year high", desc: "Coconut oil demand boosts copra rates.", category: "Coconut", trend: "+22%" },
    ];

    const marketData = [
        { name: 'Coconut (Raw)', price: '₹28/kg', change: '+5.2%', positive: true },
        { name: 'Copra', price: '₹12,500/q', change: '+8.1%', positive: true },
        { name: 'Coconut Oil', price: '₹185/L', change: '+3.4%', positive: true },
        { name: 'Rice (Basmati)', price: '₹95/kg', change: '+1.2%', positive: true },
        { name: 'Wheat', price: '₹32/kg', change: '+2.8%', positive: true },
        { name: 'Tomato', price: '₹35/kg', change: '-8.0%', positive: false },
    ];

    return (
        <Modal visible={visible} animationType="slide">
            <View style={styles.newsModalContainer}>
                {/* Header */}
                <View style={styles.newsModalHeader}>
                    <View style={styles.newsModalTitleRow}>
                        <LinearGradient colors={['#10B981', '#14B8A6']} style={styles.newsModalIcon}>
                            <MaterialCommunityIcons name="leaf" size={24} color="white" />
                        </LinearGradient>
                        <View>
                            <Text style={styles.newsModalTitle}>Agriculture News</Text>
                            <Text style={styles.newsModalSubtitle}>Market prices & updates</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.newsModalClose} onPress={onClose}>
                        <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.newsModalScroll}>
                    {/* Live Prices */}
                    <View style={styles.livePricesSection}>
                        <View style={styles.livePricesHeader}>
                            <View style={styles.liveIndicator} />
                            <Text style={styles.livePricesTitle}>Live Market Prices</Text>
                        </View>
                        <View style={styles.pricesTable}>
                            {marketData.map((item, index) => (
                                <View key={index} style={styles.priceTableRow}>
                                    <Text style={styles.priceTableName}>{item.name}</Text>
                                    <Text style={styles.priceTableValue}>{item.price}</Text>
                                    <View style={[styles.priceTableChange, { backgroundColor: item.positive ? '#D1FAE5' : '#FEE2E2' }]}>
                                        <Text style={[styles.priceTableChangeText, { color: item.positive ? theme.colors.success : theme.colors.danger }]}>
                                            {item.change}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* News List */}
                    <Text style={styles.newsListTitle}>Latest News</Text>
                    {allNews.map((news, index) => (
                        <View key={index} style={styles.newsCard}>
                            <View style={styles.newsCardHeader}>
                                <View style={styles.newsCardBadge}>
                                    <Text style={styles.newsCardBadgeText}>{news.category}</Text>
                                </View>
                                <Text style={[
                                    styles.newsCardTrend,
                                    { color: news.trend.startsWith('+') ? theme.colors.success : news.trend.startsWith('-') ? theme.colors.danger : theme.colors.secondary }
                                ]}>
                                    {news.trend}
                                </Text>
                            </View>
                            <Text style={styles.newsCardTitle}>{news.title}</Text>
                            <Text style={styles.newsCardDesc}>{news.desc}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.l,
        paddingTop: theme.spacing.l,
        paddingBottom: theme.spacing.m,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    hamburgerBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.m,
        ...theme.shadows.soft,
    },
    headerLabel: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    headerName: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.textPrimary,
    },
    profileBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.soft,
    },
    profileInitials: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
    scrollContent: {
        paddingBottom: 80,
    },
    balanceCard: {
        margin: theme.spacing.l,
        padding: theme.spacing.l,
        borderRadius: theme.borderRadius.xl,
        marginTop: theme.spacing.s,
        ...theme.shadows.glow,
    },
    balanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.m,
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    trendText: {
        color: theme.colors.success,
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    balanceLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        marginBottom: 4,
    },
    balanceValue: {
        color: 'white',
        fontSize: 32,
        fontWeight: '700',
    },
    miniChart: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 60,
        marginBottom: theme.spacing.l,
        paddingHorizontal: 4,
    },
    chartBar: {
        width: (width - 80) / 14,
        backgroundColor: 'rgba(99, 102, 241, 0.4)',
        borderRadius: 4,
    },
    chartBarActive: {
        backgroundColor: theme.colors.secondary,
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.l,
    },
    balanceItem: {
        flex: 1,
    },
    iconCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    balanceMetaLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
    },
    balanceMetaValue: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 2,
    },
    divider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: theme.spacing.m,
    },
    analyticsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        gap: 8,
    },
    analyticsBtnText: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.l,
        marginBottom: theme.spacing.m,
        marginTop: theme.spacing.m,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    seeAll: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '500',
    },
    // Market Prices Scroll
    pricesScroll: {
        paddingLeft: theme.spacing.l,
        marginBottom: theme.spacing.l,
    },
    priceCard: {
        width: 110,
        padding: theme.spacing.m,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        marginRight: theme.spacing.m,
        borderWidth: 1,
        ...theme.shadows.soft,
    },
    priceIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.s,
    },
    priceName: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    priceValue: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.textSecondary,
    },
    priceTrend: {
        fontSize: 11,
        fontWeight: '600',
    },
    // News List
    newsListContainer: {
        paddingHorizontal: theme.spacing.l,
        gap: theme.spacing.m,
        marginBottom: theme.spacing.l,
    },
    newsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        ...theme.shadows.soft,
    },
    newsIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.m,
    },
    newsContent: {
        flex: 1,
    },
    newsTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    newsMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    newsBadge: {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    newsBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    newsTime: {
        fontSize: 11,
        color: theme.colors.textTertiary,
    },
    // Groups
    groupsScroll: {
        paddingLeft: theme.spacing.l,
        marginBottom: theme.spacing.xl,
    },
    groupCard: {
        width: 120,
        padding: theme.spacing.m,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        marginRight: theme.spacing.m,
        ...theme.shadows.card,
    },
    addGroupCard: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: 'transparent',
        shadowOpacity: 0,
    },
    groupIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        marginBottom: theme.spacing.s,
    },
    groupName: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    groupMeta: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.glow,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.l,
    },
    menuOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    // Info Modal
    infoModalContent: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.xl,
        width: '100%',
        maxWidth: 360,
        alignItems: 'center',
    },
    infoIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.l,
    },
    infoTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        textAlign: 'center',
        marginBottom: 8,
    },
    infoSubtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.spacing.l,
    },
    infoFeatures: {
        width: '100%',
        gap: theme.spacing.m,
        marginBottom: theme.spacing.l,
    },
    infoFeatureItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoFeatureIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.m,
    },
    infoFeatureText: {
        flex: 1,
    },
    infoFeatureTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    infoFeatureDesc: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    infoBtn: {
        width: '100%',
        borderRadius: theme.borderRadius.m,
        overflow: 'hidden',
    },
    infoBtnGradient: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    infoBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    // Hamburger Menu
    hamburgerContainer: {
        width: width * 0.8,
        height: '100%',
        backgroundColor: theme.colors.surface,
    },
    hamburgerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.l,
        paddingTop: 50,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    hamburgerLogoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
    },
    hamburgerLogo: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    hamburgerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.textPrimary,
    },
    hamburgerVersion: {
        fontSize: 12,
        color: theme.colors.textTertiary,
    },
    hamburgerClose: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: theme.spacing.l,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
        gap: theme.spacing.m,
    },
    userAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userInitials: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    userBadge: {
        fontSize: 12,
        color: theme.colors.secondary,
    },
    hamburgerItems: {
        flex: 1,
        paddingHorizontal: theme.spacing.m,
    },
    hamburgerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        marginBottom: 4,
    },
    hamburgerItemActive: {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
    },
    hamburgerItemIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.m,
    },
    hamburgerItemLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: theme.colors.textPrimary,
    },
    hamburgerLogout: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.l,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        gap: 8,
    },
    hamburgerLogoutText: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.danger,
    },
    // News Modal
    newsModalContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    newsModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.l,
        paddingTop: 50,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    newsModalTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
    },
    newsModalIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    newsModalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.textPrimary,
    },
    newsModalSubtitle: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    newsModalClose: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    newsModalScroll: {
        flex: 1,
        padding: theme.spacing.l,
    },
    livePricesSection: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.l,
        marginBottom: theme.spacing.l,
        ...theme.shadows.soft,
    },
    livePricesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: theme.spacing.m,
    },
    liveIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.success,
    },
    livePricesTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    pricesTable: {
        gap: theme.spacing.s,
    },
    priceTableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    priceTableName: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.textPrimary,
    },
    priceTableValue: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginRight: theme.spacing.m,
    },
    priceTableChange: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    priceTableChangeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    newsListTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.m,
    },
    newsCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.l,
        marginBottom: theme.spacing.m,
        ...theme.shadows.soft,
    },
    newsCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    newsCardBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    newsCardBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.secondary,
    },
    newsCardTrend: {
        fontSize: 13,
        fontWeight: '700',
    },
    newsCardTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    newsCardDesc: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        lineHeight: 20,
    },
});
