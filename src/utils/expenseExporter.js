/**
 * Expense Export Utility
 * 
 * Provides functionality to export expenses to various formats:
 * - CSV (Excel compatible)
 * - PDF-style HTML (printable)
 * - JSON (data backup)
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

/**
 * Generate CSV content from expenses (includes combined personal + project data)
 * @param {Array} expenses - Array of expense objects
 * @param {Object} options - Export options
 * @returns {string} CSV formatted string
 */
export const generateCSV = (expenses, options = {}) => {
    const { includeHeader = true, dateRange = '' } = options;

    // Check if we have project expenses
    const hasProjectData = expenses.some(exp => exp.source === 'project');

    // CSV Headers - Extended for project data (using INR instead of ₹ for compatibility)
    const headers = hasProjectData ? [
        'Date',
        'Time',
        'Source',
        'Project Name',
        'Category',
        'Description',
        'Paid To (Person)',
        'Paid To (Place)',
        'Material Type',
        'Amount (INR)',
        'Created At'
    ] : [
        'Date',
        'Time',
        'Category',
        'Description',
        'Amount (INR)',
        'Created At'
    ];

    // Helper function to sanitize CSV cell values
    const sanitizeCell = (value) => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    // Build CSV rows
    const rows = expenses.map(exp => {
        if (hasProjectData) {
            return [
                sanitizeCell(exp.date),
                sanitizeCell(exp.time),
                sanitizeCell(capitalizeFirst(exp.source || 'personal')),
                sanitizeCell(exp.projectName || '-'),
                sanitizeCell(capitalizeFirst(exp.category || 'other')),
                sanitizeCell(exp.note || ''),
                sanitizeCell(exp.paidTo?.person || '-'),
                sanitizeCell(exp.paidTo?.place || '-'),
                sanitizeCell(exp.materialType || '-'),
                exp.amount || 0,
                exp.createdAt ? new Date(exp.createdAt).toLocaleString('en-IN') : ''
            ].join(',');
        } else {
            return [
                sanitizeCell(exp.date),
                sanitizeCell(exp.time),
                sanitizeCell(capitalizeFirst(exp.category || 'other')),
                sanitizeCell(exp.note || ''),
                exp.amount || 0,
                exp.createdAt ? new Date(exp.createdAt).toLocaleString('en-IN') : ''
            ].join(',');
        }
    });

    // Calculate totals
    const totalAmount = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const personalTotal = expenses.filter(e => e.source !== 'project').reduce((sum, e) => sum + (e.amount || 0), 0);
    const projectTotal = expenses.filter(e => e.source === 'project').reduce((sum, e) => sum + (e.amount || 0), 0);

    // Combine all parts
    let csv = '';

    if (dateRange) {
        csv += `Expense Report - ${dateRange}\n`;
        csv += `Generated on: ${new Date().toLocaleString('en-IN')}\n`;
        if (hasProjectData) {
            csv += `Personal Expenses: INR ${personalTotal.toLocaleString('en-IN')}\n`;
            csv += `Project Expenses: INR ${projectTotal.toLocaleString('en-IN')}\n`;
        }
        csv += '\n';
    }

    if (includeHeader) {
        csv += headers.join(',') + '\n';
    }

    csv += rows.join('\n');

    // Summary rows
    if (hasProjectData) {
        csv += `\n\nSummary`;
        csv += `\nPersonal Expenses Total,,,,,,,,${personalTotal},`;
        csv += `\nProject Expenses Total,,,,,,,,${projectTotal},`;
        csv += `\nGrand Total,,,,,,,,${totalAmount},`;
    } else {
        csv += `\n\nTotal,,,"Total Expenses",${totalAmount},`;
    }

    return csv;
};

/**
 * Generate HTML content for PDF-style export (includes combined personal + project data)
 * @param {Array} expenses - Array of expense objects
 * @param {Object} options - Export options
 * @returns {string} HTML formatted string
 */
export const generateHTML = (expenses, options = {}) => {
    const { title = 'Expense Report', dateRange = '', userName = 'User' } = options;

    // Check if we have project expenses
    const hasProjectData = expenses.some(exp => exp.source === 'project');

    // Calculate totals
    const totalAmount = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const personalTotal = expenses.filter(e => e.source !== 'project').reduce((sum, e) => sum + (e.amount || 0), 0);
    const projectTotal = expenses.filter(e => e.source === 'project').reduce((sum, e) => sum + (e.amount || 0), 0);

    // Category totals
    const categoryTotals = {};
    expenses.forEach(exp => {
        const cat = exp.category || 'other';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + (exp.amount || 0);
    });

    // Category colors for styling (extended for project categories)
    const categoryColors = {
        food: '#F59E0B',
        transport: '#3B82F6',
        shopping: '#EC4899',
        bills: '#EF4444',
        entertainment: '#8B5CF6',
        health: '#10B981',
        education: '#06B6D4',
        grocery: '#84CC16',
        other: '#6B7280',
        project_service: '#6366F1',
        project_product: '#10B981',
        Service: '#6366F1',
        Product: '#10B981',
    };

    // Category display names
    const categoryDisplayNames = {
        project_service: '📁 Project Service',
        project_product: '📦 Project Product',
        Service: '📁 Service (Project)',
        Product: '📦 Product (Project)',
    };

    // Build expense rows with project columns
    const expenseRows = expenses.map(exp => {
        const catColor = categoryColors[exp.category] || categoryColors.other;
        const isProject = exp.source === 'project';
        const sourceClass = isProject ? 'source-project' : 'source-personal';

        if (hasProjectData) {
            return `
                <tr class="${sourceClass}">
                    <td>${exp.date || ''}</td>
                    <td>${exp.time || ''}</td>
                    <td><span class="source-badge ${sourceClass}">${capitalizeFirst(exp.source || 'personal')}</span></td>
                    <td class="project-name">${exp.projectName || '-'}</td>
                    <td><span class="category-badge" style="background-color: ${catColor}20; color: ${catColor}; border: 1px solid ${catColor};">${capitalizeFirst(categoryDisplayNames[exp.category] || exp.category || 'other')}</span></td>
                    <td>${exp.note || ''}</td>
                    <td class="amount">₹${(exp.amount || 0).toLocaleString('en-IN')}</td>
                </tr>
            `;
        } else {
            return `
                <tr>
                    <td>${exp.date || ''}</td>
                    <td>${exp.time || ''}</td>
                    <td><span class="category-badge" style="background-color: ${catColor}20; color: ${catColor}; border: 1px solid ${catColor};">${capitalizeFirst(exp.category || 'other')}</span></td>
                    <td>${exp.note || ''}</td>
                    <td class="amount">₹${(exp.amount || 0).toLocaleString('en-IN')}</td>
                </tr>
            `;
        }
    }).join('');

    // Build category summary
    const categorySummary = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, amount]) => {
            const percentage = Math.round((amount / totalAmount) * 100);
            const catColor = categoryColors[cat] || categoryColors.other;
            const displayName = categoryDisplayNames[cat] || capitalizeFirst(cat);
            return `
                <div class="category-item">
                    <div class="category-bar-container">
                        <span class="category-name">${displayName}</span>
                        <div class="category-bar" style="width: ${percentage}%; background-color: ${catColor};"></div>
                    </div>
                    <span class="category-amount">₹${amount.toLocaleString('en-IN')} (${percentage}%)</span>
                </div>
            `;
        }).join('');

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8fafc;
            color: #0f172a;
            padding: 20px;
            line-height: 1.5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            padding: 30px;
        }
        .header h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .header .meta {
            font-size: 14px;
            opacity: 0.9;
        }
        .summary-section {
            display: flex;
            gap: 20px;
            padding: 20px 30px;
            background: #f1f5f9;
        }
        .summary-card {
            flex: 1;
            background: white;
            border-radius: 10px;
            padding: 16px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .summary-card .value {
            font-size: 28px;
            font-weight: 700;
            color: #6366f1;
        }
        .summary-card .label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 4px;
        }
        .category-section {
            padding: 20px 30px;
            border-bottom: 1px solid #e2e8f0;
        }
        .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #475569;
            margin-bottom: 16px;
        }
        .category-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }
        .category-bar-container {
            flex: 1;
            margin-right: 20px;
        }
        .category-name {
            font-size: 13px;
            color: #475569;
            display: block;
            margin-bottom: 4px;
        }
        .category-bar {
            height: 8px;
            border-radius: 4px;
            transition: width 0.3s ease;
        }
        .category-amount {
            font-size: 13px;
            font-weight: 600;
            color: #0f172a;
            white-space: nowrap;
        }
        .expenses-section {
            padding: 20px 30px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }
        th {
            background: #f8fafc;
            padding: 12px 10px;
            text-align: left;
            font-weight: 600;
            color: #64748b;
            border-bottom: 2px solid #e2e8f0;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
        }
        td {
            padding: 12px 10px;
            border-bottom: 1px solid #f1f5f9;
            color: #334155;
        }
        tr:hover {
            background-color: #f8fafc;
        }
        .amount {
            font-weight: 600;
            color: #0f172a;
            text-align: right;
        }
        .category-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
        }
        .source-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .source-badge.source-personal {
            background: #D1FAE5;
            color: #065F46;
        }
        .source-badge.source-project {
            background: #EEF2FF;
            color: #4338CA;
        }
        .project-name {
            font-weight: 500;
            color: #6366F1;
        }
        .summary-card.personal .value {
            color: #059669;
        }
        .summary-card.project .value {
            color: #6366F1;
        }
        .footer {
            padding: 20px 30px;
            background: #f8fafc;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
        }
        .total-row {
            background: #f0fdf4;
        }
        .total-row td {
            font-weight: 700;
            color: #166534;
            border-top: 2px solid #10b981;
        }
        @media print {
            body {
                padding: 0;
                background: white;
            }
            .container {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 ${title}</h1>
            <div class="meta">
                ${dateRange ? `Period: ${dateRange}<br>` : ''}
                Generated: ${new Date().toLocaleString('en-IN')}<br>
                User: ${userName}
            </div>
        </div>
        
        <div class="summary-section">
            <div class="summary-card">
                <div class="value">₹${totalAmount.toLocaleString('en-IN')}</div>
                <div class="label">Total Expenses</div>
            </div>
            ${hasProjectData ? `
            <div class="summary-card personal">
                <div class="value">₹${personalTotal.toLocaleString('en-IN')}</div>
                <div class="label">Personal</div>
            </div>
            <div class="summary-card project">
                <div class="value">₹${projectTotal.toLocaleString('en-IN')}</div>
                <div class="label">Project</div>
            </div>
            ` : `
            <div class="summary-card">
                <div class="value">${expenses.length}</div>
                <div class="label">Transactions</div>
            </div>
            <div class="summary-card">
                <div class="value">₹${Math.round(totalAmount / Math.max(expenses.length, 1)).toLocaleString('en-IN')}</div>
                <div class="label">Average</div>
            </div>
            `}
        </div>
        
        <div class="category-section">
            <h3 class="section-title">📈 Category Breakdown</h3>
            ${categorySummary}
        </div>
        
        <div class="expenses-section">
            <h3 class="section-title">📋 Transaction Details</h3>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Time</th>
                        ${hasProjectData ? '<th>Source</th><th>Project</th>' : ''}
                        <th>Category</th>
                        <th>Description</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${expenseRows}
                    <tr class="total-row">
                        <td colspan="${hasProjectData ? 6 : 4}"><strong>Grand Total</strong></td>
                        <td class="amount"><strong>₹${totalAmount.toLocaleString('en-IN')}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="footer">
            Generated by SplitFlow Expense Tracker • ${new Date().toLocaleDateString('en-IN')}
        </div>
    </div>
</body>
</html>
    `;

    return html;
};

/**
 * Generate JSON content for data backup
 * @param {Array} expenses - Array of expense objects
 * @param {Object} options - Export options
 * @returns {string} JSON formatted string
 */
export const generateJSON = (expenses, options = {}) => {
    const { userName = 'User', includeMetadata = true } = options;

    const exportData = {
        ...(includeMetadata && {
            metadata: {
                exportedAt: new Date().toISOString(),
                exportedBy: userName,
                totalRecords: expenses.length,
                totalAmount: expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0),
            }
        }),
        expenses: expenses.map(exp => ({
            id: exp.id,
            date: exp.date,
            time: exp.time,
            category: exp.category,
            note: exp.note,
            amount: exp.amount,
            createdAt: exp.createdAt,
        })),
    };

    return JSON.stringify(exportData, null, 2);
};

/**
 * Export expenses to file and share
 * @param {Array} expenses - Array of expense objects
 * @param {string} format - Export format: 'csv', 'html', 'json'
 * @param {Object} options - Export options
 * @returns {Promise<boolean>} Success status
 */
export const exportExpenses = async (expenses, format = 'csv', options = {}) => {
    try {
        if (!expenses || expenses.length === 0) {
            Alert.alert('No Data', 'There are no expenses to export.');
            return false;
        }

        // Check if sharing is available
        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
            Alert.alert('Sharing Not Available', 'Sharing is not available on this device.');
            return false;
        }

        let content = '';
        let fileName = '';
        let mimeType = '';

        const dateStr = new Date().toISOString().split('T')[0];

        // UTF-8 BOM for Excel compatibility
        const UTF8_BOM = '\uFEFF';

        switch (format.toLowerCase()) {
            case 'csv':
                // Add BOM for proper UTF-8 encoding in Excel
                content = UTF8_BOM + generateCSV(expenses, options);
                fileName = `expenses_${dateStr}.csv`;
                mimeType = 'text/csv;charset=utf-8';
                break;

            case 'html':
            case 'pdf':
                content = generateHTML(expenses, options);
                fileName = `expense_report_${dateStr}.html`;
                mimeType = 'text/html;charset=utf-8';
                break;

            case 'json':
                content = generateJSON(expenses, options);
                fileName = `expenses_backup_${dateStr}.json`;
                mimeType = 'application/json;charset=utf-8';
                break;

            default:
                Alert.alert('Unknown Format', `Export format "${format}" is not supported.`);
                return false;
        }

        // Write file to document directory
        const fileUri = FileSystem.documentDirectory + fileName;

        // Use 'utf8' string instead of FileSystem.EncodingType.UTF8 for compatibility
        await FileSystem.writeAsStringAsync(fileUri, content, {
            encoding: 'utf8',
        });

        // Share the file
        await Sharing.shareAsync(fileUri, {
            mimeType: mimeType.split(';')[0], // Use base mime type for sharing
            dialogTitle: `Share ${fileName}`,
            UTI: mimeType.includes('csv') ? 'public.comma-separated-values-text' : undefined,
        });

        return true;

    } catch (error) {
        console.error('Export error:', error);
        Alert.alert('Export Failed', `Could not export expenses: ${error.message}`);
        return false;
    }
};

/**
 * Helper: Capitalize first letter
 */
const capitalizeFirst = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Get export format options for UI
 */
export const getExportFormats = () => [
    {
        id: 'csv',
        label: 'Excel (CSV)',
        description: 'Compatible with Excel, Google Sheets',
        icon: 'microsoft-excel',
        color: '#10B981',
    },
    {
        id: 'html',
        label: 'Report (PDF-Ready)',
        description: 'Beautiful printable report',
        icon: 'file-document',
        color: '#6366F1',
    },
];

export default {
    exportExpenses,
    generateCSV,
    generateHTML,
    generateJSON,
    getExportFormats,
};
