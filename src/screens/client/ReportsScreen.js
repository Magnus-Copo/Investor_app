import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, formatCurrency } from '../../components/Theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import from centralized data
import { quarterlyReports, financialYears, formatDate } from '../../data/mockData';

export default function ReportsScreen({ navigation }) {
    const [selectedYear, setSelectedYear] = useState(financialYears[0].id);
    const [downloading, setDownloading] = useState(null);

    const filteredReports = quarterlyReports.filter(r =>
        r.year === financialYears.find(fy => fy.id === selectedYear)?.label
    );

    const handleDownload = async (report) => {
        setDownloading(report.id);

        // Simulate download
        await new Promise(resolve => setTimeout(resolve, 1500));

        setDownloading(null);
        Alert.alert(
            'Download Complete',
            `${report.quarter} ${report.year} report has been downloaded successfully.`,
            [{ text: 'View', onPress: () => { } }, { text: 'OK' }]
        );
    };

    const handleShareReport = (report) => {
        Alert.alert(
            'Share Report',
            'Share this report via:',
            [
                { text: 'Email', onPress: () => { } },
                { text: 'WhatsApp', onPress: () => { } },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Quarterly Reports</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Year Selector */}
            <View style={styles.yearSelector}>
                {financialYears.map(fy => (
                    <TouchableOpacity
                        key={fy.id}
                        style={[styles.yearBtn, selectedYear === fy.id && styles.yearBtnActive]}
                        onPress={() => setSelectedYear(fy.id)}
                    >
                        <Text style={[styles.yearBtnText, selectedYear === fy.id && styles.yearBtnTextActive]}>
                            {fy.label}
                        </Text>
                        {fy.current && (
                            <View style={styles.currentBadge}>
                                <Text style={styles.currentBadgeText}>Current</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Summary Card */}
                {filteredReports.length > 0 && (
                    <LinearGradient
                        colors={[theme.colors.primary, theme.colors.primaryDark]}
                        style={styles.summaryCard}
                    >
                        <View style={styles.summaryHeader}>
                            <Ionicons name="document-text" size={24} color="white" />
                            <Text style={styles.summaryTitle}>
                                {financialYears.find(fy => fy.id === selectedYear)?.label} Summary
                            </Text>
                        </View>
                        <View style={styles.summaryStats}>
                            <View style={styles.summaryStat}>
                                <Text style={styles.summaryStatValue}>{filteredReports.length}</Text>
                                <Text style={styles.summaryStatLabel}>Reports</Text>
                            </View>
                            <View style={styles.summaryDivider} />
                            <View style={styles.summaryStat}>
                                <Text style={styles.summaryStatValue}>
                                    {formatCurrency(filteredReports.reduce((sum, r) => sum + r.highlights.totalReturns, 0))}
                                </Text>
                                <Text style={styles.summaryStatLabel}>Total Returns</Text>
                            </View>
                        </View>
                    </LinearGradient>
                )}

                {/* Reports List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Available Reports</Text>

                    {filteredReports.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="document-outline" size={48} color={theme.colors.textTertiary} />
                            <Text style={styles.emptyStateText}>No reports for this period</Text>
                        </View>
                    ) : (
                        filteredReports.map((report) => (
                            <View key={report.id} style={styles.reportCard}>
                                <View style={styles.reportHeader}>
                                    <View style={styles.quarterBadge}>
                                        <Text style={styles.quarterText}>{report.quarter}</Text>
                                    </View>
                                    <View style={styles.reportInfo}>
                                        <Text style={styles.reportPeriod}>{report.period}</Text>
                                        <Text style={styles.reportDate}>Published {formatDate(report.publishedDate)}</Text>
                                    </View>
                                    <View style={styles.reportSize}>
                                        <Ionicons name="document" size={16} color={theme.colors.textSecondary} />
                                        <Text style={styles.reportSizeText}>{report.fileSize}</Text>
                                    </View>
                                </View>

                                {/* Report Highlights */}
                                <View style={styles.highlights}>
                                    <View style={styles.highlightItem}>
                                        <Ionicons name="trending-up" size={16} color={theme.colors.success} />
                                        <Text style={styles.highlightLabel}>Growth</Text>
                                        <Text style={[styles.highlightValue, { color: theme.colors.success }]}>
                                            +{report.highlights.portfolioGrowth}%
                                        </Text>
                                    </View>
                                    <View style={styles.highlightItem}>
                                        <Ionicons name="wallet" size={16} color={theme.colors.primary} />
                                        <Text style={styles.highlightLabel}>Returns</Text>
                                        <Text style={styles.highlightValue}>
                                            {formatCurrency(report.highlights.totalReturns)}
                                        </Text>
                                    </View>
                                    {report.highlights.dividendsReceived > 0 && (
                                        <View style={styles.highlightItem}>
                                            <Ionicons name="cash" size={16} color={theme.colors.warning} />
                                            <Text style={styles.highlightLabel}>Dividends</Text>
                                            <Text style={styles.highlightValue}>
                                                {formatCurrency(report.highlights.dividendsReceived)}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Investments Covered */}
                                <View style={styles.investmentsCovered}>
                                    <Text style={styles.investmentsCoveredLabel}>Investments covered:</Text>
                                    <Text style={styles.investmentsCoveredValue}>
                                        {report.investments.join(', ')}
                                    </Text>
                                </View>

                                {/* Actions */}
                                <View style={styles.reportActions}>
                                    <TouchableOpacity
                                        style={styles.shareBtn}
                                        onPress={() => handleShareReport(report)}
                                    >
                                        <Ionicons name="share-outline" size={18} color={theme.colors.primary} />
                                        <Text style={styles.shareBtnText}>Share</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.downloadBtn, downloading === report.id && styles.downloadBtnDisabled]}
                                        onPress={() => handleDownload(report)}
                                        disabled={downloading === report.id}
                                    >
                                        {downloading === report.id ? (
                                            <>
                                                <Ionicons name="hourglass" size={18} color="white" />
                                                <Text style={styles.downloadBtnText}>Downloading...</Text>
                                            </>
                                        ) : (
                                            <>
                                                <Ionicons name="download" size={18} color="white" />
                                                <Text style={styles.downloadBtnText}>Download PDF</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* Download All Option */}
                {filteredReports.length > 1 && (
                    <View style={styles.section}>
                        <TouchableOpacity style={styles.downloadAllBtn}>
                            <Ionicons name="cloud-download" size={24} color={theme.colors.primary} />
                            <View style={styles.downloadAllContent}>
                                <Text style={styles.downloadAllTitle}>Download All Reports</Text>
                                <Text style={styles.downloadAllSubtitle}>
                                    Get all {filteredReports.length} reports as a ZIP file
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
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
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.m,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.soft,
    },
    headerTitle: {
        ...theme.typography.h3,
        color: theme.colors.textPrimary,
    },
    yearSelector: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.l,
        marginBottom: theme.spacing.m,
    },
    yearBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.s,
        paddingHorizontal: theme.spacing.m,
        marginRight: theme.spacing.s,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    yearBtnActive: {
        backgroundColor: theme.colors.primaryLight,
        borderColor: theme.colors.primary,
    },
    yearBtnText: {
        ...theme.typography.smallMedium,
        color: theme.colors.textSecondary,
    },
    yearBtnTextActive: {
        color: theme.colors.primary,
    },
    currentBadge: {
        backgroundColor: theme.colors.success,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: theme.spacing.xs,
    },
    currentBadgeText: {
        ...theme.typography.caption,
        color: 'white',
        fontSize: 10,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: theme.spacing.xxl,
    },
    summaryCard: {
        marginHorizontal: theme.spacing.l,
        padding: theme.spacing.l,
        borderRadius: theme.borderRadius.xl,
        marginBottom: theme.spacing.l,
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    summaryTitle: {
        ...theme.typography.bodyMedium,
        color: 'white',
        marginLeft: theme.spacing.s,
    },
    summaryStats: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
    },
    summaryStat: {
        flex: 1,
        alignItems: 'center',
    },
    summaryDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    summaryStatValue: {
        ...theme.typography.h3,
        color: 'white',
    },
    summaryStatLabel: {
        ...theme.typography.caption,
        color: 'rgba(255,255,255,0.7)',
    },
    section: {
        paddingHorizontal: theme.spacing.l,
        marginBottom: theme.spacing.l,
    },
    sectionTitle: {
        ...theme.typography.h4,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.m,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xxl,
    },
    emptyStateText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.m,
    },
    reportCard: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
        marginBottom: theme.spacing.m,
        ...theme.shadows.card,
    },
    reportHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    quarterBadge: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: theme.colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.m,
    },
    quarterText: {
        ...theme.typography.h4,
        color: theme.colors.primary,
    },
    reportInfo: {
        flex: 1,
    },
    reportPeriod: {
        ...theme.typography.bodyMedium,
        color: theme.colors.textPrimary,
    },
    reportDate: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
    reportSize: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reportSizeText: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        marginLeft: 4,
    },
    highlights: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surfaceAlt,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
        marginBottom: theme.spacing.m,
    },
    highlightItem: {
        flex: 1,
        alignItems: 'center',
    },
    highlightLabel: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    highlightValue: {
        ...theme.typography.smallSemibold,
        color: theme.colors.textPrimary,
    },
    investmentsCovered: {
        marginBottom: theme.spacing.m,
        paddingTop: theme.spacing.m,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderLight,
    },
    investmentsCoveredLabel: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
    investmentsCoveredValue: {
        ...theme.typography.small,
        color: theme.colors.textPrimary,
        marginTop: 2,
    },
    reportActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    shareBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.s,
        paddingHorizontal: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginRight: theme.spacing.s,
    },
    shareBtnText: {
        ...theme.typography.smallMedium,
        color: theme.colors.primary,
        marginLeft: 4,
    },
    downloadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.s,
        paddingHorizontal: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        backgroundColor: theme.colors.primary,
    },
    downloadBtnDisabled: {
        opacity: 0.7,
    },
    downloadBtnText: {
        ...theme.typography.smallMedium,
        color: 'white',
        marginLeft: 4,
    },
    downloadAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
        ...theme.shadows.soft,
    },
    downloadAllContent: {
        flex: 1,
        marginLeft: theme.spacing.m,
    },
    downloadAllTitle: {
        ...theme.typography.bodyMedium,
        color: theme.colors.textPrimary,
    },
    downloadAllSubtitle: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
});
