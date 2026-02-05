import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
    Keyboard,
    Dimensions,
    Modal
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../components/Theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AddExpenseScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [notes, setNotes] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showRecentSpendings, setShowRecentSpendings] = useState(false);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const scrollViewRef = useRef(null);
    const notesInputRef = useRef(null);

    // Listen for keyboard show/hide
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    // Function to scroll to input
    const scrollToInput = (yOffset) => {
        setTimeout(() => {
            scrollViewRef.current?.scrollTo({
                y: yOffset,
                animated: true,
            });
        }, 100);
    };

    // Mock recent spendings data
    const recentSpendings = [
        { id: 1, title: 'Grocery Shopping', amount: '₹2,500', status: 'approved', group: 'Home', date: 'Today', description: 'Weekly groceries from BigBasket including vegetables, fruits, milk, bread and other essentials' },
        { id: 2, title: 'Restaurant Bill', amount: '₹1,200', status: 'approved', group: 'Friends', date: 'Yesterday', description: 'Dinner at Italian restaurant with college friends' },
        { id: 3, title: 'Movie Tickets', amount: '₹800', status: 'pending', group: 'Partner', date: 'Oct 24', description: 'Movie tickets for weekend show at PVR' },
        { id: 4, title: 'Electricity Bill', amount: '₹3,200', status: 'approved', group: 'Home', date: 'Oct 23', description: 'Monthly electricity bill payment for October' },
        { id: 5, title: 'Uber Ride', amount: '₹450', status: 'approved', group: 'Office', date: 'Oct 22', description: 'Office commute - home to work' },
        { id: 6, title: 'Coffee Meeting', amount: '₹350', status: 'pending', group: 'Office', date: 'Oct 21', description: 'Client meeting at Starbucks' },
    ];

    // Filter by approved and search query
    const filteredSpendings = recentSpendings.filter(s => {
        const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.description.toLowerCase().includes(searchQuery.toLowerCase());
        const isApproved = s.status === 'approved';
        return matchesSearch && isApproved;
    });

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior="padding"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 80}
            >
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Add Expense</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <View style={styles.searchInputWrapper}>
                            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search approved spendings..."
                                placeholderTextColor={theme.colors.textTertiary}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                onFocus={() => setShowRecentSpendings(true)}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={18} color={theme.colors.textTertiary} />
                                </TouchableOpacity>
                            )}
                        </View>
                        <TouchableOpacity
                            style={styles.filterBtn}
                            onPress={() => setShowRecentSpendings(!showRecentSpendings)}
                        >
                            <MaterialCommunityIcons name="filter-variant" size={20} color={theme.colors.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* Recent Spendings List (Filtered) */}
                    {showRecentSpendings && (
                        <View style={styles.recentSpendingsContainer}>
                            <View style={styles.recentSpendingsHeader}>
                                <View style={styles.recentSpendingsTitle}>
                                    <View style={styles.approvedBadge}>
                                        <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
                                        <Text style={styles.approvedBadgeText}>Approved Spendings</Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => setShowRecentSpendings(false)}>
                                    <Ionicons name="chevron-up" size={20} color={theme.colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            {filteredSpendings.length > 0 ? (
                                filteredSpendings.map((spending) => (
                                    <TouchableOpacity key={spending.id} style={styles.spendingItem}>
                                        <View style={styles.spendingIcon}>
                                            <MaterialCommunityIcons name="receipt-text" size={20} color={theme.colors.primary} />
                                        </View>
                                        <View style={styles.spendingContent}>
                                            <Text style={styles.spendingTitle}>{spending.title}</Text>
                                            <Text style={styles.spendingDescription} numberOfLines={0}>
                                                {spending.description}
                                            </Text>
                                            <View style={styles.spendingMeta}>
                                                <Text style={styles.spendingGroup}>{spending.group}</Text>
                                                <Text style={styles.spendingDate}>{spending.date}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.spendingRight}>
                                            <Text style={styles.spendingAmount}>{spending.amount}</Text>
                                            <View style={styles.statusBadge}>
                                                <Ionicons name="checkmark" size={10} color={theme.colors.success} />
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <View style={styles.noResults}>
                                    <Ionicons name="search-outline" size={40} color={theme.colors.textTertiary} />
                                    <Text style={styles.noResultsText}>No approved spendings found</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Amount Input */}
                    <View style={styles.amountContainer}>
                        <Text style={styles.currencySymbol}>₹</Text>
                        <TextInput
                            style={styles.amountInput}
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0"
                            placeholderTextColor={theme.colors.textSecondary}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Description */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.descriptionInput}
                            placeholder="What's this for?"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={description}
                            onChangeText={setDescription}
                            onFocus={() => {
                                scrollToInput(200);
                            }}
                        />
                    </View>

                    {/* Notes Input - Opens in Modal */}
                    <TouchableOpacity
                        style={styles.inputContainer}
                        onPress={() => setShowNotesModal(true)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.inputLabel}>Notes (optional)</Text>
                        <View style={styles.notesPreview}>
                            <Text style={[styles.notesPreviewText, !notes && styles.notesPlaceholder]}>
                                {notes || 'Add any additional notes...'}
                            </Text>
                            <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
                        </View>
                    </TouchableOpacity>

                    {/* Extra space for keyboard */}
                    {keyboardHeight > 0 && (
                        <View style={{ height: keyboardHeight + 50 }} />
                    )}

                    {/* Split With */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Split with</Text>
                        <View style={styles.chipContainer}>
                            {['Roommates', 'Trip to Goa', 'Partner', 'Office'].map((chip) => (
                                <TouchableOpacity
                                    key={chip}
                                    style={[styles.chip, chip === 'Roommates' && styles.chipActive]}
                                >
                                    <Text style={[styles.chipText, chip === 'Roommates' && styles.chipTextActive]}>{chip}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>

                {/* Save Button - Fixed at bottom */}
                <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 20) }]}>
                    <TouchableOpacity
                        style={styles.saveBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="checkmark" size={24} color="white" />
                        <Text style={styles.saveBtnText}>Save Expense</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* Notes Modal - Pops up from top */}
            <Modal
                visible={showNotesModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowNotesModal(false)}
            >
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={() => setShowNotesModal(false)}
                    />

                    <SafeAreaView style={styles.modalContainerTop} edges={['top']}>
                        <View style={styles.modalCard}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Add Notes</Text>
                                <TouchableOpacity onPress={() => setShowNotesModal(false)} style={styles.closeButton}>
                                    <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                style={styles.modalScrollView}
                                contentContainerStyle={styles.modalScrollContent}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                            >
                                <TextInput
                                    ref={notesInputRef}
                                    style={styles.modalNotesInput}
                                    placeholder="Type your notes here..."
                                    placeholderTextColor={theme.colors.textTertiary}
                                    value={notes}
                                    onChangeText={setNotes}
                                    multiline
                                    textAlignVertical="top"
                                    autoFocus
                                />
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                <TouchableOpacity
                                    style={styles.doneModalButton}
                                    onPress={() => setShowNotesModal(false)}
                                >
                                    <Text style={styles.doneModalButtonText}>Done</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </SafeAreaView>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

AddExpenseScreen.propTypes = {
    navigation: PropTypes.shape({
        goBack: PropTypes.func,
    }),
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: Platform.OS === 'android' ? 24 : 0,
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: theme.spacing.l,
        paddingBottom: 250, // Extra padding for keyboard visibility
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.l,
    },
    closeBtn: {
        padding: theme.spacing.s,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    // Search
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.l,
        gap: theme.spacing.s,
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.spacing.m,
        paddingVertical: 10,
        borderRadius: theme.borderRadius.l,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: theme.spacing.s,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.textPrimary,
    },
    filterBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    // Recent Spendings
    recentSpendingsContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.m,
        marginBottom: theme.spacing.l,
        ...theme.shadows.soft,
    },
    recentSpendingsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    recentSpendingsTitle: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    approvedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    approvedBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.success,
    },
    spendingItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    spendingIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.m,
        marginTop: 2,
    },
    spendingContent: {
        flex: 1,
        paddingRight: theme.spacing.s,
    },
    spendingTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 2,
    },
    spendingDescription: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginBottom: 4,
        lineHeight: 18,
        flexWrap: 'wrap',
    },
    spendingMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    spendingGroup: {
        fontSize: 11,
        color: theme.colors.primary,
        fontWeight: '500',
    },
    spendingDate: {
        fontSize: 11,
        color: theme.colors.textTertiary,
    },
    spendingRight: {
        alignItems: 'flex-end',
    },
    spendingAmount: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    statusBadge: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    noResults: {
        alignItems: 'center',
        padding: theme.spacing.xl,
    },
    noResultsText: {
        marginTop: theme.spacing.m,
        fontSize: 14,
        color: theme.colors.textTertiary,
    },
    // Amount
    amountContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    currencySymbol: {
        fontSize: 32,
        fontWeight: '700',
        color: theme.colors.textSecondary,
        marginRight: 8,
    },
    amountInput: {
        fontSize: 56,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        minWidth: 60,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: theme.spacing.l,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.s,
    },
    descriptionInput: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.l,
        borderRadius: theme.borderRadius.l,
        fontSize: 18,
        color: theme.colors.textPrimary,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    notesInput: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
        fontSize: 14,
        color: theme.colors.textPrimary,
        borderWidth: 1,
        borderColor: theme.colors.border,
        minHeight: 100,
    },
    notesInputFocused: {
        borderColor: theme.colors.primary,
        borderWidth: 2,
    },
    section: {
        marginBottom: theme.spacing.xl,
    },
    sectionLabel: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.m,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.s,
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: theme.borderRadius.full,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
    },
    chipActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    chipText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    chipTextActive: {
        color: 'white',
    },
    notesPreview: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
        borderWidth: 1,
        borderColor: theme.colors.border,
        minHeight: 80,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    notesPreviewText: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.textPrimary,
        lineHeight: 20,
    },
    notesPlaceholder: {
        color: theme.colors.textTertiary,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    modalBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainerTop: {
        width: '100%',
        maxHeight: '80%',
        marginTop: 20,
    },
    modalCard: {
        backgroundColor: theme.colors.background,
        marginHorizontal: 16,
        borderRadius: 20,
        maxHeight: SCREEN_HEIGHT * 0.7,
        ...theme.shadows.strong,
        elevation: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.l,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: theme.colors.surface,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        flex: 1,
    },
    closeButton: {
        padding: 4,
        marginLeft: 12,
    },
    modalScrollView: {
        maxHeight: 400,
    },
    modalScrollContent: {
        padding: theme.spacing.l,
    },
    modalNotesInput: {
        fontSize: 16,
        color: theme.colors.textPrimary,
        lineHeight: 24,
        minHeight: 200,
        textAlignVertical: 'top',
    },
    modalFooter: {
        padding: theme.spacing.l,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    doneModalButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    doneModalButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        padding: theme.spacing.l,
        paddingBottom: Platform.OS === 'ios' ? theme.spacing.l : theme.spacing.m,
        backgroundColor: theme.colors.background,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    saveBtn: {
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.l,
        borderRadius: theme.borderRadius.xl,
        gap: theme.spacing.s,
        ...theme.shadows.glow,
    },
    saveBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
});
