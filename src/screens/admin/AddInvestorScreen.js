import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../components/Theme';
import { api } from '../../services/api';
import { validateEmail, validateName } from '../../utils/validationUtils';

export default function AddInvestorScreen({ navigation }) {
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        panCard: '',
        aadhar: '',
        address: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        initialInvestment: '',
        nomineeDetails: '',
    });

    const [errors, setErrors] = useState({});

    // PAN Card format: AAAAA9999A (5 letters, 4 digits, 1 letter)
    const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    // Aadhar format: 12 digits (can have spaces)
    const AADHAR_REGEX = /^[0-9]{12}$/;

    // IFSC Code format: First 4 chars are bank code (letters), 5th is 0, last 6 are branch code
    const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

    // Phone: 10 digits for Indian numbers
    const PHONE_REGEX = /^[6-9][0-9]{9}$/;

    const validateForm = () => {
        const newErrors = {};

        // Name validation using utility
        const nameValidation = validateName(formData.name);
        if (!nameValidation.isValid) {
            newErrors.name = nameValidation.message;
        }

        // Email validation using utility
        const emailValidation = validateEmail(formData.email);
        if (!emailValidation.isValid) {
            newErrors.email = emailValidation.message;
        }

        // Phone number validation
        const cleanPhone = formData.phone.replace(/[\s\-+]/g, '');
        const phoneDigits = cleanPhone.replace(/^91/, ''); // Remove country code if present

        if (!phoneDigits) {
            newErrors.phone = 'Phone number is required';
        } else if (!PHONE_REGEX.test(phoneDigits)) {
            if (phoneDigits.length !== 10) {
                newErrors.phone = 'Phone number must be 10 digits';
            } else if (!/^[6-9]/.test(phoneDigits)) {
                newErrors.phone = 'Indian phone numbers must start with 6, 7, 8, or 9';
            } else {
                newErrors.phone = 'Invalid phone number format';
            }
        }

        // PAN Card validation
        const cleanPan = formData.panCard.trim().toUpperCase();
        if (!cleanPan) {
            newErrors.panCard = 'PAN Card number is required';
        } else if (!PAN_REGEX.test(cleanPan)) {
            newErrors.panCard = 'Invalid PAN format (e.g., ABCDE1234F)';
        }

        // Aadhar validation (optional but if provided must be valid)
        if (formData.aadhar.trim()) {
            const cleanAadhar = formData.aadhar.replace(/\s/g, '');
            if (!AADHAR_REGEX.test(cleanAadhar)) {
                newErrors.aadhar = 'Aadhar must be 12 digits';
            }
        }

        // IFSC Code validation (optional but if provided must be valid)
        if (formData.ifscCode.trim()) {
            const cleanIfsc = formData.ifscCode.trim().toUpperCase();
            if (!IFSC_REGEX.test(cleanIfsc)) {
                newErrors.ifscCode = 'Invalid IFSC format (e.g., SBIN0001234)';
            }
        }

        // Account number validation (optional but if provided must be valid)
        if (formData.accountNumber.trim()) {
            const cleanAccount = formData.accountNumber.replace(/\s/g, '');
            if (!/^[0-9]{9,18}$/.test(cleanAccount)) {
                newErrors.accountNumber = 'Account number must be 9-18 digits';
            }
        }

        // Initial investment validation (optional but if provided must be valid)
        if (formData.initialInvestment.trim()) {
            const amount = parseInt(formData.initialInvestment.replace(/,/g, ''), 10);
            if (isNaN(amount) || amount < 0) {
                newErrors.initialInvestment = 'Please enter a valid amount';
            } else if (amount > 0 && amount < 1000) {
                newErrors.initialInvestment = 'Minimum investment is ₹1,000';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            Alert.alert('Validation Error', 'Please fix the errors before submitting');
            return;
        }

        try {
            setSubmitting(true);
            const result = await api.addInvestor({
                ...formData,
                initialInvestment: parseInt(formData.initialInvestment, 10) || 0,
            });

            if (result.success) {
                Alert.alert(
                    'Success',
                    'Investor added successfully! They will receive an invitation email.',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to add investor');
        } finally {
            setSubmitting(false);
        }
    };

    const InputField = ({ label, value, onChangeText, placeholder, keyboardType, error, required, secureTextEntry }) => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
                {label} {required && <Text style={styles.required}>*</Text>}
            </Text>
            <TextInput
                style={[styles.input, error && styles.inputError]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.textTertiary}
                keyboardType={keyboardType || 'default'}
                secureTextEntry={secureTextEntry}
                autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );

    InputField.propTypes = {
        label: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
        onChangeText: PropTypes.func.isRequired,
        placeholder: PropTypes.string,
        keyboardType: PropTypes.string,
        error: PropTypes.string,
        required: PropTypes.bool,
        secureTextEntry: PropTypes.bool,
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Investor</Text>
                <View style={{ width: 32 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                    {/* Personal Info */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="person-outline" size={20} color={theme.colors.primary} />
                            <Text style={styles.sectionTitle}>Personal Information</Text>
                        </View>

                        <InputField
                            label="Full Name"
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholder="Enter full name"
                            error={errors.name}
                            required
                        />

                        <InputField
                            label="Email Address"
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            placeholder="investor@email.com"
                            keyboardType="email-address"
                            error={errors.email}
                            required
                        />

                        <InputField
                            label="Phone Number"
                            value={formData.phone}
                            onChangeText={(text) => setFormData({ ...formData, phone: text })}
                            placeholder="+91 98765 43210"
                            keyboardType="phone-pad"
                            error={errors.phone}
                            required
                        />

                        <InputField
                            label="Address"
                            value={formData.address}
                            onChangeText={(text) => setFormData({ ...formData, address: text })}
                            placeholder="Enter full address"
                        />
                    </View>

                    {/* KYC Details */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="card-outline" size={20} color={theme.colors.primary} />
                            <Text style={styles.sectionTitle}>KYC Details</Text>
                        </View>

                        <InputField
                            label="PAN Card Number"
                            value={formData.panCard}
                            onChangeText={(text) => setFormData({ ...formData, panCard: text.toUpperCase() })}
                            placeholder="ABCDE1234F"
                            error={errors.panCard}
                            required
                        />

                        <InputField
                            label="Aadhar Number"
                            value={formData.aadhar}
                            onChangeText={(text) => setFormData({ ...formData, aadhar: text })}
                            placeholder="1234 5678 9012"
                            keyboardType="numeric"
                            error={errors.aadhar}
                        />

                        <View style={styles.infoBox}>
                            <Ionicons name="shield-checkmark" size={18} color={theme.colors.success} />
                            <Text style={styles.infoBoxText}>
                                KYC verification will be completed within 24-48 hours after document submission.
                            </Text>
                        </View>
                    </View>

                    {/* Bank Details */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="wallet-outline" size={20} color={theme.colors.primary} />
                            <Text style={styles.sectionTitle}>Bank Details</Text>
                        </View>

                        <InputField
                            label="Bank Name"
                            value={formData.bankName}
                            onChangeText={(text) => setFormData({ ...formData, bankName: text })}
                            placeholder="Enter bank name"
                        />

                        <InputField
                            label="Account Number"
                            value={formData.accountNumber}
                            onChangeText={(text) => setFormData({ ...formData, accountNumber: text })}
                            placeholder="Enter account number"
                            keyboardType="numeric"
                            error={errors.accountNumber}
                        />

                        <InputField
                            label="IFSC Code"
                            value={formData.ifscCode}
                            onChangeText={(text) => setFormData({ ...formData, ifscCode: text.toUpperCase() })}
                            placeholder="SBIN0001234"
                            error={errors.ifscCode}
                        />
                    </View>

                    {/* Investment Details */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="trending-up-outline" size={20} color={theme.colors.primary} />
                            <Text style={styles.sectionTitle}>Investment Details</Text>
                        </View>

                        <InputField
                            label="Initial Investment Amount (INR)"
                            value={formData.initialInvestment}
                            onChangeText={(text) => setFormData({ ...formData, initialInvestment: text })}
                            placeholder="e.g., 500000"
                            keyboardType="numeric"
                            error={errors.initialInvestment}
                        />

                        <InputField
                            label="Nominee Details"
                            value={formData.nomineeDetails}
                            onChangeText={(text) => setFormData({ ...formData, nomineeDetails: text })}
                            placeholder="Nominee name and relationship"
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        <LinearGradient
                            colors={[theme.colors.primary, theme.colors.primaryDark]}
                            style={styles.submitGradient}
                        >
                            {submitting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Ionicons name="person-add" size={20} color="white" />
                                    <Text style={styles.submitText}>Add Investor</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

AddInvestorScreen.propTypes = {
    navigation: PropTypes.shape({
        goBack: PropTypes.func.isRequired,
    }).isRequired,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    content: {
        flex: 1,
    },
    section: {
        backgroundColor: theme.colors.surface,
        marginTop: 16,
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginLeft: 10,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.textSecondary,
        marginBottom: 8,
    },
    required: {
        color: theme.colors.danger,
    },
    input: {
        backgroundColor: theme.colors.surfaceAlt,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: theme.colors.textPrimary,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    inputError: {
        borderColor: theme.colors.danger,
    },
    errorText: {
        fontSize: 12,
        color: theme.colors.danger,
        marginTop: 6,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: theme.colors.successLight,
        padding: 12,
        borderRadius: 10,
        alignItems: 'flex-start',
    },
    infoBoxText: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.success,
        marginLeft: 10,
        lineHeight: 18,
    },
    submitButton: {
        marginHorizontal: 16,
        marginTop: 24,
        borderRadius: 12,
        overflow: 'hidden',
    },
    submitGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    submitText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
});
