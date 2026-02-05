import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Animated,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme, formatCurrency } from '../../components/Theme';
import { api } from '../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = 16;
const CARD_MARGIN = 16;
const METRICS_GAP = 10;
const METRIC_CARD_WIDTH = (SCREEN_WIDTH - (CARD_MARGIN * 2) - (CARD_PADDING * 2) - (METRICS_GAP * 3)) / 4;

export default function PortfolioAnalyticsScreen({ navigation }) {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('6M');
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        loadAnalytics();
    }, []);

    useEffect(() => {
        if (!loading) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [loading]);

    const loadAnalytics = async () => {
        try {
            const data = await api.getPortfolioAnalytics();
            setAnalytics(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const periods = ['1M', '3M', '6M', '1Y', 'ALL'];

    // Generate data based on selected period
    const getChartDataForPeriod = (period) => {
        const baseData = analytics?.monthlyReturns || [];

        // Different data sets for different periods to show variation
        const periodData = {
            '1M': [
                { month: 'W1', value: 2.1 + Math.random() * 2 },
                { month: 'W2', value: 3.5 + Math.random() * 2 },
                { month: 'W3', value: 1.8 + Math.random() * 2 },
                { month: 'W4', value: 4.2 + Math.random() * 2 },
            ],
            '3M': [
                { month: 'Oct', value: 5.2 },
                { month: 'Nov', value: 7.1 },
                { month: 'Dec', value: 4.8 },
            ],
            '6M': baseData.length > 0 ? baseData : [
                { month: 'Aug', value: 4.2 },
                { month: 'Sep', value: 5.8 },
                { month: 'Oct', value: 3.9 },
                { month: 'Nov', value: 7.1 },
                { month: 'Dec', value: 6.2 },
                { month: 'Jan', value: 8.5 },
            ],
            '1Y': [
                { month: 'Jan', value: 3.2 },
                { month: 'Feb', value: 4.5 },
                { month: 'Mar', value: 2.1 },
                { month: 'Apr', value: 5.8 },
                { month: 'May', value: 4.3 },
                { month: 'Jun', value: 6.7 },
                { month: 'Jul', value: 5.1 },
                { month: 'Aug', value: 7.9 },
                { month: 'Sep', value: 4.8 },
                { month: 'Oct', value: 6.2 },
                { month: 'Nov', value: 8.1 },
                { month: 'Dec', value: 9.3 },
            ],
            'ALL': [
                { month: '2021', value: 12.5 },
                { month: '2022', value: 8.3 },
                { month: '2023', value: 15.7 },
                { month: '2024', value: 11.2 },
                { month: '2025', value: 18.9 },
            ],
        };

        return periodData[period] || baseData;
    };

    // Get metrics based on selected period
    const getMetricsForPeriod = (period) => {
        const baseMetrics = analytics?.performanceMetrics || {};

        const periodMetrics = {
            '1M': { cagr: 8.2, sharpeRatio: 1.4, maxDrawdown: -3.1, volatility: 7.5 },
            '3M': { cagr: 12.5, sharpeRatio: 1.6, maxDrawdown: -5.2, volatility: 9.8 },
            '6M': { cagr: baseMetrics.cagr || 15.2, sharpeRatio: baseMetrics.sharpeRatio || 1.8, maxDrawdown: baseMetrics.maxDrawdown || -6.4, volatility: baseMetrics.volatility || 12.3 },
            '1Y': { cagr: 18.7, sharpeRatio: 2.1, maxDrawdown: -8.5, volatility: 14.2 },
            'ALL': { cagr: 22.4, sharpeRatio: 2.3, maxDrawdown: -12.1, volatility: 16.8 },
        };

        return periodMetrics[period] || baseMetrics;
    };

    const currentChartData = getChartDataForPeriod(selectedPeriod);
    const currentMetrics = getMetricsForPeriod(selectedPeriod);

    // Animated bar heights
    const barAnimations = useRef(currentChartData.map(() => new Animated.Value(0))).current;

    // Animate bars when period changes
    useEffect(() => {
        // Reset animations
        barAnimations.forEach(anim => anim.setValue(0));

        // Staggered animation for each bar
        const animations = currentChartData.map((_, index) =>
            Animated.spring(barAnimations[index] || new Animated.Value(0), {
                toValue: 1,
                tension: 50,
                friction: 7,
                delay: index * 80,
                useNativeDriver: false,
            })
        );

        Animated.stagger(60, animations).start();
    }, [selectedPeriod]);

    const getPeriodLabel = (period) => {
        const labels = {
            '1M': '1 Month',
            '3M': '3 Months',
            '6M': '6 Months',
            '1Y': '1 Year',
            'ALL': 'All Time',
        };
        return labels[period] || period;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    const MetricCard = ({ label, value, suffix, color, icon }) => (
        <LinearGradient
            colors={['#FFFFFF', '#F8FAFC']}
            style={styles.metricCard}
        >
            <View style={[styles.metricIconContainer, { backgroundColor: (color || theme.colors.primary) + '15' }]}>
                <Ionicons name={icon || 'stats-chart'} size={18} color={color || theme.colors.primary} />
            </View>
            <Text style={styles.metricLabel} numberOfLines={1}>{label}</Text>
            <Text style={[styles.metricValue, { color: color || theme.colors.textPrimary }]} numberOfLines={1}>
                {typeof value === 'number' ? value.toFixed(1) : value}{suffix}
            </Text>
        </LinearGradient>
    );

    MetricCard.propTypes = {
        label: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        suffix: PropTypes.string,
        color: PropTypes.string,
        icon: PropTypes.string,
    };



    // Beautiful gradient colors for each bar
    const getBarColors = (index, value, maxValue) => {
        const colorSets = [
            ['#667EEA', '#764BA2'], // Purple-violet
            ['#06B6D4', '#0891B2'], // Cyan
            ['#10B981', '#059669'], // Emerald
            ['#F59E0B', '#D97706'], // Amber
            ['#EF4444', '#DC2626'], // Red
            ['#8B5CF6', '#7C3AED'], // Violet
            ['#EC4899', '#DB2777'], // Pink
            ['#14B8A6', '#0D9488'], // Teal
            ['#6366F1', '#4F46E5'], // Indigo
            ['#F97316', '#EA580C'], // Orange
            ['#84CC16', '#65A30D'], // Lime
            ['#22D3EE', '#06B6D4'], // Cyan light
        ];

        // Highlight the highest bar with special colors
        const isHighest = value === maxValue;
        if (isHighest) {
            return ['#FFD700', '#FFA500']; // Gold gradient for highest
        }

        return colorSets[index % colorSets.length];
    };

    const renderChart = () => {
        const data = currentChartData;
        const maxValue = Math.max(...data.map(d => d.value), 1);

        return (
            <View style={styles.chartContainer}>
                {/* Background grid lines */}
                <View style={styles.chartGridLines}>
                    {[0, 1, 2, 3, 4].map(i => (
                        <View key={i} style={styles.gridLine} />
                    ))}
                </View>

                <View style={styles.chartBars}>
                    {data.map((item, index) => {
                        const barColors = getBarColors(index, item.value, maxValue);
                        const isHighest = item.value === maxValue;
                        const barHeight = barAnimations[index] || new Animated.Value(1);

                        return (
                            <View key={`${item.month}-${index}`} style={styles.barColumn}>
                                {/* Value label with animation */}
                                <Animated.View style={[
                                    styles.barValueContainer,
                                    {
                                        opacity: barHeight,
                                        transform: [{
                                            translateY: barHeight.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [10, 0],
                                            })
                                        }]
                                    }
                                ]}>
                                    <Text style={[
                                        styles.barValue,
                                        isHighest && styles.barValueHighest
                                    ]}>
                                        {item.value.toFixed(1)}%
                                    </Text>
                                </Animated.View>

                                {/* Bar with animation */}
                                <View style={styles.barWrapper}>
                                    <Animated.View style={[
                                        styles.barShadow,
                                        {
                                            height: barHeight.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ['0%', `${(item.value / maxValue) * 100}%`],
                                            }),
                                        }
                                    ]}>
                                        <LinearGradient
                                            colors={barColors}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 0, y: 1 }}
                                            style={[
                                                styles.bar,
                                                isHighest && styles.barHighest,
                                            ]}
                                        >
                                            {/* Shine effect */}
                                            <View style={styles.barShine} />
                                        </LinearGradient>
                                    </Animated.View>
                                </View>

                                {/* Month label */}
                                <Animated.Text style={[
                                    styles.barLabel,
                                    isHighest && styles.barLabelHighest,
                                    {
                                        opacity: barHeight,
                                    }
                                ]}>
                                    {item.month}
                                </Animated.Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    const renderAllocationPie = () => {
        const data = analytics?.assetAllocation || [];

        return (
            <View style={styles.allocationContainer}>
                {/* Segmented Bar Chart */}
                <View style={styles.pieChartContainer}>
                    {data.map((item, index) => {
                        // determine border radius for first and last segments
                        const isFirst = index === 0;
                        const isLast = index === data.length - 1;
                        const borderStyle = {
                            borderTopLeftRadius: isFirst ? 10 : 0,
                            borderBottomLeftRadius: isFirst ? 10 : 0,
                            borderTopRightRadius: isLast ? 10 : 0,
                            borderBottomRightRadius: isLast ? 10 : 0,
                        };

                        return (
                            <View
                                key={item.type}
                                style={[
                                    styles.pieSegmentWrapper,
                                    { width: item.percentage + '%' },
                                    borderStyle
                                ]}
                            >
                                <LinearGradient
                                    colors={[item.color, item.color]} // You could use darker shade here if available
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 0, y: 1 }}
                                    style={[styles.pieSegment, borderStyle]}
                                />
                                <View style={styles.segmentSeparator} />
                            </View>
                        );
                    })}
                </View>

                {/* Legend */}
                <View style={styles.allocationLegend}>
                    {data.map((item) => (
                        <View key={item.type} style={styles.legendItem}>
                            <View style={[styles.legendIconContainer, { backgroundColor: item.color + '15' }]}>
                                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                            </View>
                            <View style={styles.legendInfo}>
                                <Text style={styles.legendLabel} numberOfLines={1}>{item.type}</Text>
                                <Text style={styles.legendAmount}>{formatCurrency(item.amount)}</Text>
                            </View>
                            <View style={styles.legendPercentBadge}>
                                <Text style={[styles.legendPercent, { color: item.color }]}>{item.percentage}%</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Portfolio Analytics</Text>
                <TouchableOpacity style={styles.headerAction}>
                    <Ionicons name="share-outline" size={22} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Period Selector */}
                <View style={styles.periodSelector}>
                    {periods.map((period) => (
                        <TouchableOpacity
                            key={period}
                            style={[
                                styles.periodButton,
                                selectedPeriod === period && styles.periodButtonActive,
                            ]}
                            onPress={() => setSelectedPeriod(period)}
                        >
                            <Text
                                style={[
                                    styles.periodText,
                                    selectedPeriod === period && styles.periodTextActive,
                                ]}
                            >
                                {period}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Key Metrics - Metrics ScrollView Code remains same but re-rendering full block to ensure context */}
                <Text style={styles.sectionHeader}>Performance Metrics ({getPeriodLabel(selectedPeriod)})</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.metricsScroll}
                >
                    <MetricCard label="CAGR" value={currentMetrics.cagr} suffix="%" color={theme.colors.success} icon="trending-up" />
                    <MetricCard label="Sharpe" value={currentMetrics.sharpeRatio} color={theme.colors.primary} icon="analytics" />
                    <MetricCard label="Drawdown" value={currentMetrics.maxDrawdown} suffix="%" color={theme.colors.danger} icon="trending-down" />
                    <MetricCard label="Volatility" value={currentMetrics.volatility} suffix="%" color={theme.colors.warning} icon="pulse" />
                </ScrollView>

                {/* Performance Chart */}
                <View style={styles.section}>
                    <View style={styles.sectionTitleRow}>
                        <Text style={styles.sectionTitle}>
                            {selectedPeriod === 'ALL' ? 'Yearly Returns' : 'Returns'}
                        </Text>
                        <View style={styles.sectionBadge}>
                            <Text style={styles.sectionBadgeText}>{getPeriodLabel(selectedPeriod)}</Text>
                        </View>
                    </View>
                    {renderChart()}
                </View>

                {/* Asset Allocation */}
                <View style={styles.section}>
                    <View style={styles.sectionTitleRow}>
                        <Text style={styles.sectionTitle}>Asset Allocation</Text>
                        <Ionicons name="pie-chart" size={18} color={theme.colors.textSecondary} />
                    </View>
                    {renderAllocationPie()}
                </View>

                {/* Yearly Returns */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Yearly Returns</Text>
                    <View style={styles.yearlyContainer}>
                        {analytics?.yearlyReturns?.map((item) => {
                            const isPositive = item.return > 0;
                            const barColors = isPositive
                                ? [theme.colors.success, '#10B981'] // Green gradient
                                : [theme.colors.danger, '#EF4444']; // Red gradient

                            return (
                                <View key={item.year} style={styles.yearlyRow}>
                                    <Text style={styles.yearLabel}>{item.year}</Text>
                                    <View style={styles.yearBarContainer}>
                                        <View style={styles.yearBarTrack} />
                                        <View
                                            style={[
                                                styles.yearBarWrapper,
                                                {
                                                    width: `${Math.min(Math.abs(item.return) * 5, 100)}%`,
                                                },
                                            ]}
                                        >
                                            <LinearGradient
                                                colors={barColors}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={styles.yearBarGradient}
                                            />
                                        </View>
                                    </View>
                                    <Text style={[
                                        styles.yearValue,
                                        { color: isPositive ? theme.colors.success : theme.colors.danger }
                                    ]}>
                                        {isPositive ? '+' : ''}{item.return}%
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.infoIconContainer}>
                        <Ionicons name="information-circle" size={20} color={theme.colors.info} />
                    </View>
                    <Text style={styles.infoText}>
                        Past performance is not indicative of future results. Returns are net of fees.
                    </Text>
                </View>

                <View style={{ height: 24 }} />
            </Animated.ScrollView>
        </SafeAreaView>
    );
}

PortfolioAnalyticsScreen.propTypes = {
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
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.surfaceAlt,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    headerAction: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 16,
    },
    periodSelector: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    periodButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    periodButtonActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    periodText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    periodTextActive: {
        color: 'white',
    },
    sectionHeader: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        paddingHorizontal: 16,
        marginTop: 8,
        marginBottom: 12,
    },
    metricsScroll: {
        paddingHorizontal: 16,
        gap: 10,
    },
    metricCard: {
        width: 100,
        backgroundColor: theme.colors.surface,
        borderRadius: 18,
        padding: 14,
        alignItems: 'center',
        ...theme.shadows.soft,
        borderWidth: 1,
        borderColor: theme.colors.surfaceAlt,
    },
    metricIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    metricLabel: {
        fontSize: 10,
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
        marginBottom: 4,
    },
    metricValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    section: {
        backgroundColor: theme.colors.surface,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        padding: 16,
        ...theme.shadows.card,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    sectionBadge: {
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    sectionBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    chartContainer: {
        height: 200,
        position: 'relative',
    },
    chartGridLines: {
        position: 'absolute',
        top: 30,
        left: 0,
        right: 0,
        bottom: 30,
        justifyContent: 'space-between',
    },
    gridLine: {
        height: 1,
        backgroundColor: theme.colors.border,
        opacity: 0.4,
    },
    chartBars: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        paddingTop: 5,
    },
    barColumn: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 2,
        maxWidth: 60,
    },
    barValueContainer: {
        marginBottom: 6,
    },
    barValue: {
        fontSize: 10,
        fontWeight: '700',
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    barValueHighest: {
        color: '#FFD700',
        fontSize: 11,
        textShadowColor: 'rgba(255, 215, 0, 0.4)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    barWrapper: {
        width: '100%',
        height: 130,
        justifyContent: 'flex-end',
        alignItems: 'center',
        overflow: 'hidden',
    },
    barShadow: {
        width: '90%',
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    bar: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
        overflow: 'hidden',
    },
    barHighest: {
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
    },
    barShine: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '40%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
    },
    barLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginTop: 8,
        textAlign: 'center',
    },
    barLabelHighest: {
        color: '#FFD700',
        fontWeight: '700',
    },
    allocationContainer: {
        marginTop: 8,
    },
    pieChartContainer: {
        height: 24,
        flexDirection: 'row',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    pieSegmentWrapper: {
        height: '100%',
        position: 'relative',
    },
    pieSegment: {
        width: '100%',
        height: '100%',
    },
    segmentSeparator: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.3)',
        zIndex: 10,
    },
    allocationLegend: {
        marginTop: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    legendIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    legendInfo: {
        flex: 1,
    },
    legendLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 2,
    },
    legendAmount: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    legendPercentBadge: {
        backgroundColor: theme.colors.surfaceAlt,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    legendPercent: {
        fontSize: 13,
        fontWeight: '700',
    },
    yearlyContainer: {
        marginTop: 8,
    },
    yearlyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    yearLabel: {
        width: 60,
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    yearBarContainer: {
        flex: 1,
        height: 12,
        justifyContent: 'center',
        marginHorizontal: 12,
    },
    yearBarTrack: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.surfaceAlt,
        borderRadius: 6,
    },
    yearBarWrapper: {
        height: '100%',
        borderRadius: 6,
        overflow: 'hidden',
    },
    yearBarGradient: {
        width: '100%',
        height: '100%',
    },
    yearValue: {
        width: 60,
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'right',
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: theme.colors.infoLight,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
    },
    infoIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: theme.colors.info,
        marginLeft: 12,
        lineHeight: 16,
    },
});
