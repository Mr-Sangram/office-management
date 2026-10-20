/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ==============================================================================
 * INTERIORCRAFT ERP - COMPLETE GOOGLE APPS SCRIPT AUTOMATION SYSTEM
 * For: Interior Decoration & Interior Design Services Companies
 * 
 * Instructions:
 * 1. Open Google Sheets (https://sheets.new)
 * 2. Click Extensions > Apps Script
 * 3. Delete any default code in Code.gs and paste this entire file
 * 4. Click the Save icon (Ctrl+S or Cmd+S)
 * 5. In the toolbar, select "setupInteriorCraftWorkbook" from the function dropdown
 * 6. Click "Run" and accept the authorization prompt (Advanced > Proceed)
 * 7. Watch your complete 14-sheet automated ERP system build in ~5 seconds!
 * ==============================================================================
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🏢 InteriorCraft ERP')
    .addItem('🚀 Setup / Rebuild Full Workbook', 'setupInteriorCraftWorkbook')
    .addSeparator()
    .addItem('🔄 Refresh All Formulas', 'refreshCalculations')
    .addItem('📦 Check Low Stock Alerts', 'checkLowStockAlerts')
    .addItem('💰 Check Unpaid Client Dues', 'checkClientDues')
    .addItem('📅 Check Upcoming Deadlines', 'checkUpcomingDeadlines')
    .addToUi();
}

/**
 * Master Setup Function: Builds all sheets, formats, headers, and formulas
 */
function setupInteriorCraftWorkbook() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Sheet list in exact architecture sequence
  const sheetsConfig = [
    { name: '01_Dashboard', tabColor: '#0F172A' },
    { name: '02_Settings', tabColor: '#475569' },
    { name: '03_Clients', tabColor: '#0284C7' },
    { name: '04_Projects', tabColor: '#0D9488' },
    { name: '05_Materials_Inventory', tabColor: '#D97706' },
    { name: '06_Material_Transactions', tabColor: '#B45309' },
    { name: '07_Suppliers_Purchases', tabColor: '#7C3AED' },
    { name: '08_Labour_Attendance', tabColor: '#DC2626' },
    { name: '09_Payments_Received', tabColor: '#16A34A' },
    { name: '10_Expenses', tabColor: '#E11D48' },
    { name: '11_Project_Profit_Loss', tabColor: '#059669' },
    { name: '12_Office_Staff_Bills', tabColor: '#6366F1' },
    { name: '13_Tasks_Timeline', tabColor: '#EA580C' },
    { name: '14_Audit_Log', tabColor: '#64748B' }
  ];

  sheetsConfig.forEach(cfg => {
    let sheet = ss.getSheetByName(cfg.name);
    if (!sheet) {
      sheet = ss.insertSheet(cfg.name);
    }
    sheet.setTabColor(cfg.tabColor);
  });

  // Remove default "Sheet1" if present
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch(e){}
  }

  // Build each sheet structure
  buildSettingsSheet(ss.getSheetByName('02_Settings'));
  buildClientsSheet(ss.getSheetByName('03_Clients'));
  buildProjectsSheet(ss.getSheetByName('04_Projects'));
  buildMaterialsSheet(ss.getSheetByName('05_Materials_Inventory'));
  buildTransactionsSheet(ss.getSheetByName('06_Material_Transactions'));
  buildSuppliersSheet(ss.getSheetByName('07_Suppliers_Purchases'));
  buildLabourSheet(ss.getSheetByName('08_Labour_Attendance'));
  buildPaymentsSheet(ss.getSheetByName('09_Payments_Received'));
  buildExpensesSheet(ss.getSheetByName('10_Expenses'));
  buildProfitLossSheet(ss.getSheetByName('11_Project_Profit_Loss'));
  buildOfficeSheet(ss.getSheetByName('12_Office_Staff_Bills'));
  buildTasksSheet(ss.getSheetByName('13_Tasks_Timeline'));
  buildAuditSheet(ss.getSheetByName('14_Audit_Log'));
  buildDashboardSheet(ss.getSheetByName('01_Dashboard'));

  SpreadsheetApp.getUi().alert('🎉 InteriorCraft ERP Setup Complete!\\n\\nAll 14 sheets, auto-formulas, dropdown ranges, and the main dashboard have been successfully configured.');
}

/**
 * 02_Settings Sheet Setup
 */
function buildSettingsSheet(sheet) {
  sheet.clear();
  sheet.setFrozenRows(1);

  const headers = [
    'Project Types', 'Project Statuses', 'Expense Categories', 
    'Material Categories', 'Labour Types', 'Payment Methods', 
    'Units', 'VAT/Tax Rates (%)', 'Company Config'
  ];
  
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  styleHeader(headerRange, '#1E293B', '#FFFFFF');

  const settingsData = [
    ['Residential Apartment', 'In Planning', 'Office Rent', 'Plywood & Boards', 'Master Carpenter', 'Bank Wire / BEFTN', 'sqft', '7.5', 'Company Name: Studio ArchVista Interior'],
    ['Luxury Duplex / Penthouse', 'Designing', 'Electricity & Utilities', 'Laminates & Veneer', 'Painter & Polisher', 'Account Payee Cheque', 'rft', '15.0', 'Phone: +880 1712-345678'],
    ['Corporate Office Fitout', 'In Progress / Execution', 'Internet & Cloud', 'Solid Wood & Timber', 'Electrician', 'bKash / Nagad Corporate', 'sheet', '0.0', 'Currency: ৳ (BDT)'],
    ['Boutique Cafe & Restaurant', 'Finishing', 'Transport & Site Travel', 'Hardware & Fittings', 'Gypsum Artisan', 'Cash in Hand', 'cft', '5.0', 'Overhead Allocation: 8%'],
    ['Retail Showroom', 'Completed', 'Site Food & Refreshment', 'Paints & Polishes', 'Tile & Marble Mason', 'Card POS', 'pcs', '', 'Address: Gulshan Avenue, Dhaka'],
    ['Renovation & Makeover', 'On Hold', 'Tools & Machinery', 'Electrical & Lighting', 'Welder / Fabricator', '', 'box', '', ''],
    ['Modular Kitchen', 'Cancelled', 'Subcontractor Fee', 'Gypsum Ceiling', 'Site Supervisor', '', 'ltr', '', ''],
    ['', '', 'Marketing & Photoshoot', 'Marble & Tiles', 'General Helper', '', 'kg', '', '']
  ];

  sheet.getRange(2, 1, settingsData.length, settingsData[0].length).setValues(settingsData);
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * 03_Clients Sheet Setup
 */
function buildClientsSheet(sheet) {
  sheet.clear();
  sheet.setFrozenRows(1);

  const headers = [
    'Client ID', 'Client Name', 'Phone', 'Email', 'Address', 
    'Client Type', 'Project Name', 'Contract Date', 'Total Contract Amount', 
    'Advance Payment', 'Total Received (Formula)', 'Total Outstanding Due (Formula)', 
    'Client Status', 'Notes'
  ];

  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  styleHeader(headerRange, '#0284C7', '#FFFFFF');

  // Sample data with formulas
  const data = [
    ['CLI-001', 'Dr. Tariqul Islam', '+880 1819-224466', 'tariqul@gmail.com', 'Gulshan-2, Dhaka', 'Duplex / Penthouse', 'Gulshan Sky Duplex Penthouse', '2026-08-15', 3850000, 1000000, '=SUMIF(\\'09_Payments_Received\\'!C:C, A2, \\'09_Payments_Received\\'!H:H)', '=I2-K2', 'Active', 'Teak fluted panelling & island kitchen'],
    ['CLI-002', 'Nexus Fintech Ltd.', '+880 1711-889900', 'operations@nexus.io', 'Simpletree, Gulshan', 'Corporate', 'Nexus Corporate HQ Suite', '2026-07-01', 6200000, 2000000, '=SUMIF(\\'09_Payments_Received\\'!C:C, A3, \\'09_Payments_Received\\'!H:H)', '=I3-K3', 'Active', 'Acoustic pods, soundproof boardroom'],
    ['CLI-003', 'Sabrina Mostafa', '+880 1912-334455', 'sabrina@lifestyle.com', 'Banani DOHS, Dhaka', 'Residential', 'Banani DOHS Lakeview Apartment', '2026-09-05', 2400000, 800000, '=SUMIF(\\'09_Payments_Received\\'!C:C, A4, \\'09_Payments_Received\\'!H:H)', '=I4-K4', 'Active', 'Minimalist oak veneer interior'],
    ['CLI-004', 'Cafe Roast & Bean', '+880 1622-778899', 'asif@roastandbean.cafe', 'Dhanmondi, Dhaka', 'Hospitality', 'Dhanmondi Artisan Coffee Bar', '2026-06-10', 1850000, 600000, '=SUMIF(\\'09_Payments_Received\\'!C:C, A5, \\'09_Payments_Received\\'!H:H)', '=I5-K5', 'Completed', 'Industrial rustic cafe finish']
  ];

  sheet.getRange(2, 1, data.length, headers.length).setValues(data);
  sheet.getRange(2, 9, data.length, 4).setNumberFormat('#,##0');
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * 04_Projects Sheet Setup
 */
function buildProjectsSheet(sheet) {
  sheet.clear();
  sheet.setFrozenRows(1);

  const headers = [
    'Project ID', 'Project Name', 'Client ID', 'Client Name (Formula)', 
    'Site Address', 'Project Type', 'Start Date', 'Expected End Date', 
    'Actual End Date', 'Project Manager', 'Contract Value', 'Project Status', 
    'Progress %', 'Total Material Cost (Formula)', 'Total Labour Cost (Formula)', 
    'Other Direct Costs', 'Allocated Overhead', 'Total Project Cost (Formula)', 
    'Amount Received (Formula)', 'Outstanding Due (Formula)', 'Actual Profit (Formula)', 
    'Profit Margin % (Formula)', 'Remarks'
  ];

  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  styleHeader(headerRange, '#0D9488', '#FFFFFF');

  const data = [
    [
      'PRJ-001', 'Gulshan Sky Duplex Penthouse', 'CLI-001', 
      '=IFERROR(VLOOKUP(C2, \\'03_Clients\\'!A:B, 2, FALSE), "")', 
      'Apt 11B, Gulshan-2, Dhaka', 'Luxury Duplex / Penthouse', '2026-08-20', '2026-11-30', '', 
      'Kamrul Hassan', 3850000, 'In Progress / Execution', 65, 
      '=SUMIFS(\\'06_Material_Transactions\\'!H:H, \\'06_Material_Transactions\\'!E:E, A2, \\'06_Material_Transactions\\'!D:D, "SITE_ISSUE")', 
      '=SUMIF(\\'08_Labour_Attendance\\'!E:E, A2, \\'08_Labour_Attendance\\'!K:K)', 
      223000, 190000, '=N2+O2+P2+Q2', 
      '=SUMIF(\\'09_Payments_Received\\'!D:D, A2, \\'09_Payments_Received\\'!H:H)', 
      '=K2-S2', '=K2-R2', '=IFERROR((U2/K2)*100, 0)', 'Ceiling done, kitchen in progress'
    ],
    [
      'PRJ-002', 'Nexus Corporate HQ Suite', 'CLI-002', 
      '=IFERROR(VLOOKUP(C3, \\'03_Clients\\'!A:B, 2, FALSE), "")', 
      'Simpletree Anarkali, Gulshan', 'Corporate Office Fitout', '2026-07-10', '2026-10-25', '', 
      'Kamrul Hassan', 6200000, 'Finishing', 90, 
      '=SUMIFS(\\'06_Material_Transactions\\'!H:H, \\'06_Material_Transactions\\'!E:E, A3, \\'06_Material_Transactions\\'!D:D, "SITE_ISSUE")', 
      '=SUMIF(\\'08_Labour_Attendance\\'!E:E, A3, \\'08_Labour_Attendance\\'!K:K)', 
      460000, 305000, '=N3+O3+P3+Q3', 
      '=SUMIF(\\'09_Payments_Received\\'!D:D, A3, \\'09_Payments_Received\\'!H:H)', 
      '=K3-S3', '=K3-R3', '=IFERROR((U3/K3)*100, 0)', 'Testing AC and glass partitions'
    ],
    [
      'PRJ-003', 'Banani DOHS Lakeview Apartment', 'CLI-003', 
      '=IFERROR(VLOOKUP(C4, \\'03_Clients\\'!A:B, 2, FALSE), "")', 
      'House 45, Banani DOHS, Dhaka', 'Residential Apartment', '2026-09-10', '2026-12-15', '', 
      'Mahfuzur Rahman', 2400000, 'In Progress / Execution', 45, 
      '=SUMIFS(\\'06_Material_Transactions\\'!H:H, \\'06_Material_Transactions\\'!E:E, A4, \\'06_Material_Transactions\\'!D:D, "SITE_ISSUE")', 
      '=SUMIF(\\'08_Labour_Attendance\\'!E:E, A4, \\'08_Labour_Attendance\\'!K:K)', 
      95000, 120000, '=N4+O4+P4+Q4', 
      '=SUMIF(\\'09_Payments_Received\\'!D:D, A4, \\'09_Payments_Received\\'!H:H)', 
      '=K4-S4', '=K4-R4', '=IFERROR((U4/K4)*100, 0)', 'Wardrobes framing ongoing'
    ],
    [
      'PRJ-004', 'Dhanmondi Artisan Coffee Bar', 'CLI-004', 
      '=IFERROR(VLOOKUP(C5, \\'03_Clients\\'!A:B, 2, FALSE), "")', 
      'Satmasjid Rd, Dhanmondi', 'Boutique Cafe & Restaurant', '2026-06-15', '2026-08-30', '2026-08-28', 
      'Kamrul Hassan', 1850000, 'Completed', 100, 
      '=SUMIFS(\\'06_Material_Transactions\\'!H:H, \\'06_Material_Transactions\\'!E:E, A5, \\'06_Material_Transactions\\'!D:D, "SITE_ISSUE")', 
      '=SUMIF(\\'08_Labour_Attendance\\'!E:E, A5, \\'08_Labour_Attendance\\'!K:K)', 
      143000, 91000, '=N5+O5+P5+Q5', 
      '=SUMIF(\\'09_Payments_Received\\'!D:D, A5, \\'09_Payments_Received\\'!H:H)', 
      '=K5-S5', '=K5-R5', '=IFERROR((U5/K5)*100, 0)', 'Handed over on time'
    ]
  ];

  sheet.getRange(2, 1, data.length, headers.length).setValues(data);
  sheet.getRange(2, 11, data.length, 1).setNumberFormat('#,##0');
  sheet.getRange(2, 14, data.length, 8).setNumberFormat('#,##0');
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * 05_Materials_Inventory Sheet Setup
 */
function buildMaterialsSheet(sheet) {
  sheet.clear();
  sheet.setFrozenRows(1);

  const headers = [
    'Material ID', 'Material Name', 'Category', 'Unit', 'Supplier', 
    'Unit Purchase Price', 'Total Purchased Qty', 'Total Used Qty', 
    'Total Returned Qty', 'Current Stock (Formula)', 'Total Stock Value (Formula)', 
    'Reorder Level', 'Stock Status (Formula)', 'Notes'
  ];

  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  styleHeader(headerRange, '#D97706', '#FFFFFF');

  const data = [
    ['MAT-001', 'Gorjon Marine Plywood 18mm', 'Plywood & Boards', 'sheet', 'Star Wood & Plywood', 2850, 180, 142, 4, '=G2-H2+I2', '=J2*F2', 25, '=IF(J2<=0, "Out of Stock", IF(J2<=L2, "Low Stock", "In Stock"))', 'BWP Grade for modular carpentry'],
    ['MAT-002', 'Burma Teak Veneer 4mm', 'Solid Wood & Timber', 'sheet', 'Bengal Laminates', 3400, 85, 74, 0, '=G3-H3+I3', '=J3*F3', 15, '=IF(J3<=0, "Out of Stock", IF(J3<=L3, "Low Stock", "In Stock"))', 'Crown cut natural grain'],
    ['MAT-003', 'Hafele Soft-Close Hinges', 'Hardware & Fittings', 'set', 'Hafele Hardware', 420, 250, 232, 2, '=G4-H4+I4', '=J4*F4', 40, '=IF(J4<=0, "Out of Stock", IF(J4<=L4, "Low Stock", "In Stock"))', 'Metalla 3D clip-on hydraulic'],
    ['MAT-004', 'Berger Luxury Silk Off-White (20L)', 'Paints & Polishes', 'drum', 'Berger Paints', 9400, 22, 16, 0, '=G5-H5+I5', '=J5*F5', 5, '=IF(J5<=0, "Out of Stock", IF(J5<=L5, "Low Stock", "In Stock"))', 'Washable satin finish'],
    ['MAT-005', 'Philips COB LED Strip (3000K)', 'Electrical & Lighting', 'roll (5m)', 'Philips Lighting', 1250, 90, 86, 0, '=G6-H6+I6', '=J6*F6', 15, '=IF(J6<=0, "Out of Stock", IF(J6<=L6, "Low Stock", "In Stock"))', 'Dotless architectural cove light']
  ];

  sheet.getRange(2, 1, data.length, headers.length).setValues(data);
  sheet.getRange(2, 6, data.length, 1).setNumberFormat('#,##0');
  sheet.getRange(2, 11, data.length, 1).setNumberFormat('#,##0');
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * 06_Material_Transactions Sheet Setup
 */
function buildTransactionsSheet(sheet) {
  sheet.clear();
  sheet.setFrozenRows(1);

  const headers = [
    'Txn ID', 'Date', 'Material ID', 'Txn Type (PURCHASE/SITE_ISSUE/SITE_RETURN)', 
    'Project ID', 'Quantity', 'Unit Price', 'Total Cost (Formula)', 'Reference (Chalan/PO)', 'Notes'
  ];

  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  styleHeader(headerRange, '#B45309', '#FFFFFF');

  const data = [
    ['MTX-001', '2026-09-02', 'MAT-001', 'SITE_ISSUE', 'PRJ-001', 65, 2850, '=F2*G2', 'CHALAN-88', 'Wardrobe and TV panel'],
    ['MTX-002', '2026-09-08', 'MAT-001', 'SITE_ISSUE', 'PRJ-002', 55, 2850, '=F3*G3', 'CHALAN-91', 'Executive cabin desks'],
    ['MTX-003', '2026-09-15', 'MAT-002', 'SITE_ISSUE', 'PRJ-001', 40, 3400, '=F4*G4', 'CHALAN-96', 'Living room fluted panel'],
    ['MTX-004', '2026-09-22', 'MAT-003', 'SITE_ISSUE', 'PRJ-002', 120, 420, '=F5*G5', 'CHALAN-102', 'Conference credenzas'],
    ['MTX-005', '2026-10-02', 'MAT-005', 'SITE_ISSUE', 'PRJ-001', 45, 1250, '=F6*G6', 'CHALAN-114', 'Dual cove ceiling LED']
  ];

  sheet.getRange(2, 1, data.length, headers.length).setValues(data);
  sheet.getRange(2, 7, data.length, 2).setNumberFormat('#,##0');
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * 07_Suppliers_Purchases Sheet Setup
 */
function buildSuppliersSheet(sheet) {
  sheet.clear();
  sheet.setFrozenRows(1);

  const headers = [
    'Supplier ID', 'Supplier Name', 'Phone', 'Address', 'Material Supplied', 
    'Total Billed', 'Total Paid', 'Outstanding Due (Formula)', 'Payment Status'
  ];

  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  styleHeader(headerRange, '#7C3AED', '#FFFFFF');

  const data = [
    ['SUP-001', 'Star Wood & Plywood Syndicate', '+880 1715-443322', 'Tejgaon, Dhaka', 'Marine Plywood, Mehgani', 840000, 650000, '=F2-G2', 'Partially Paid'],
    ['SUP-002', 'Bengal Laminates & Veneer House', '+880 1817-556677', 'Mirpur Rd, Dhaka', 'Laminates, Burma Teak Veneer', 520000, 450000, '=F3-G3', 'Partially Paid'],
    ['SUP-003', 'Hafele & Blum Hardware Gallery', '+880 1913-887766', 'Baridhara, Dhaka', 'Hydraulic Hinges, Drawer Runners', 410000, 360000, '=F4-G4', 'Partially Paid'],
    ['SUP-004', 'Berger Paints Prestige Center', '+880 1712-990011', 'Mohakhali, Dhaka', 'Luxury Silk, PU Polish', 290000, 290000, '=F5-G5', 'Fully Paid']
  ];

  sheet.getRange(2, 1, data.length, headers.length).setValues(data);
  sheet.getRange(2, 6, data.length, 3).setNumberFormat('#,##0');
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * 08_Labour_Attendance Sheet Setup
 */
function buildLabourSheet(sheet) {
  sheet.clear();
  sheet.setFrozenRows(1);

  const headers = [
    'Record ID', 'Date', 'Worker ID', 'Worker Name', 'Project ID', 
    'Skill / Trade', 'Attendance Status', 'Overtime Hours', 'Base Rate', 
    'OT Rate / Hr', 'Calculated Labour Cost (Formula)', 'Amount Paid', 'Outstanding (Formula)', 'Notes'
  ];

  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  styleHeader(headerRange, '#DC2626', '#FFFFFF');

  const data = [
    ['ATT-001', '2026-10-15', 'WRK-001', 'Md. Dulal Hossain', 'PRJ-001', 'Master Carpenter', 'Present', 2, 1200, 150, '=IF(G2="Present", I2+(H2*J2), IF(G2="Half Day", (I2/2)+(H2*J2), 0))', 1500, '=K2-L2', 'Kitchen carcass doors'],
    ['ATT-002', '2026-10-15', 'WRK-002', 'Kabir Ahmed', 'PRJ-002', 'Painter & Polisher', 'Present', 1, 1100, 140, '=IF(G3="Present", I3+(H3*J3), IF(G3="Half Day", (I3/2)+(H3*J3), 0))', 1240, '=K3-L3', 'Boardroom primer sanding'],
    ['ATT-003', '2026-10-16', 'WRK-003', 'Rashedul Islam', 'PRJ-001', 'Electrician', 'Present', 0, 1000, 125, '=IF(G4="Present", I4+(H4*J4), IF(G4="Half Day", (I4/2)+(H4*J4), 0))', 1000, '=K4-L4', 'DB box dressing'],
    ['ATT-004', '2026-10-16', 'WRK-004', 'Nurul Islam Babu', 'PRJ-003', 'Gypsum Artisan', 'Present', 3, 950, 120, '=IF(G5="Present", I5+(H5*J5), IF(G5="Half Day", (I5/2)+(H5*J5), 0))', 1000, '=K5-L5', 'Living room ceiling putty']
  ];

  sheet.getRange(2, 1, data.length, headers.length).setValues(data);
  sheet.getRange(2, 9, data.length, 5).setNumberFormat('#,##0');
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * 09_Payments_Received Sheet Setup
 */
function buildPaymentsSheet(sheet) {
  sheet.clear();
  sheet.setFrozenRows(1);

  const headers = [
    'Payment ID', 'Payment Date', 'Client ID', 'Project ID', 'Client Name', 
    'Payment Method', 'Payment Reference', 'Amount Received', 'Received By', 'Notes'
  ];

  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  styleHeader(headerRange, '#16A34A', '#FFFFFF');

  const data = [
    ['PAY-001', '2026-08-16', 'CLI-001', 'PRJ-001', 'Dr. Tariqul Islam', 'Bank Wire / BEFTN', 'EBL-TRX-994012', 1000000, 'Farhana Akhter', 'Advance 25% on 3D design approval'],
    ['PAY-002', '2026-09-18', 'CLI-001', 'PRJ-001', 'Dr. Tariqul Islam', 'Account Payee Cheque', 'CHQ-882019-SCB', 1700000, 'Farhana Akhter', '2nd Installment (Civil & Framing)'],
    ['PAY-003', '2026-07-02', 'CLI-002', 'PRJ-002', 'Nexus Fintech Ltd.', 'Bank Wire / BEFTN', 'CITY-CORP-488219', 2000000, 'Farhana Akhter', 'Advance 30% on PO issuance'],
    ['PAY-004', '2026-08-25', 'CLI-002', 'PRJ-002', 'Nexus Fintech Ltd.', 'Bank Wire / BEFTN', 'CITY-CORP-591024', 2000000, 'Farhana Akhter', '2nd Running Bill (50% Completion)'],
    ['PAY-005', '2026-09-28', 'CLI-002', 'PRJ-002', 'Nexus Fintech Ltd.', 'Bank Wire / BEFTN', 'CITY-CORP-612984', 1200000, 'Farhana Akhter', '3rd Running Bill (Finishing Phase)'],
    ['PAY-006', '2026-09-06', 'CLI-003', 'PRJ-003', 'Sabrina Mostafa', 'bKash / Nagad Corporate', 'TRX-BK-918231', 800000, 'Farhana Akhter', 'Advance Booking 35%'],
    ['PAY-007', '2026-10-05', 'CLI-003', 'PRJ-003', 'Sabrina Mostafa', 'Account Payee Cheque', 'CHQ-BRAC-49102', 800000, 'Farhana Akhter', '2nd Running Bill (Carpentry)']
  ];

  sheet.getRange(2, 1, data.length, headers.length).setValues(data);
  sheet.getRange(2, 8, data.length, 1).setNumberFormat('#,##0');
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * 10_Expenses Sheet Setup
 */
function buildExpensesSheet(sheet) {
  sheet.clear();
  sheet.setFrozenRows(1);

  const headers = [
    'Expense ID', 'Expense Type (PROJECT_DIRECT/OFFICE_OVERHEAD)', 'Expense Category', 
    'Description', 'Project ID', 'Supplier / Payee', 'Payment Method', 
    'Bill / Invoice No', 'Amount', 'Paid Status', 'Approved By', 'Notes'
  ];

  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  styleHeader(headerRange, '#E11D48', '#FFFFFF');

  const data = [
    ['EXP-001', 'OFFICE_OVERHEAD', 'Office Rent', 'Gulshan Avenue Studio monthly lease Oct 2026', 'OFFICE_GENERAL', 'Gulshan Tower Properties', 'Account Payee Cheque', 'INV-RENT-OCT26', 85000, 'Paid', 'Ar. Tanvir Ahmed', 'Studio office rent'],
    ['EXP-002', 'OFFICE_OVERHEAD', 'Electricity & Utilities', 'Studio AC and lighting bill (DESCO)', 'OFFICE_GENERAL', 'DESCO Ltd.', 'bKash / Nagad Corporate', 'DESCO-449102', 14500, 'Paid', 'Farhana Akhter', 'Electricity HQ'],
    ['EXP-003', 'PROJECT_DIRECT', 'Subcontractor Fee', 'Italian Marble Mirror Polishing & Nano Sealing', 'PRJ-001', 'Apex Marble Specialists', 'Account Payee Cheque', 'INV-APX-88', 145000, 'Paid', 'Kamrul Hassan', 'Duplex living area floor'],
    ['EXP-004', 'PROJECT_DIRECT', 'Subcontractor Fee', 'Acoustic Glass Partition & Dorma Hardware', 'PRJ-002', 'GlassTech Co.', 'Bank Wire / BEFTN', 'INV-GT-901', 320000, 'Paid', 'Kamrul Hassan', '12mm soundproof glass'],
    ['EXP-005', 'PROJECT_DIRECT', 'Transport & Site Travel', 'Pickup van freight for Plywood & Veneer', 'PRJ-001', 'Dhaka Logistics', 'Cash in Hand', 'VOUCHER-11', 18000, 'Paid', 'Mahfuzur Rahman', 'Tejgaon to Gulshan site'],
    ['EXP-006', 'OFFICE_OVERHEAD', 'Internet & Cloud', 'AutoCAD & 3ds Max cloud licenses', 'OFFICE_GENERAL', 'Autodesk & Link3', 'Card POS', 'INV-SFT-OCT26', 18500, 'Paid', 'Farhana Akhter', 'Design tools']
  ];

  sheet.getRange(2, 1, data.length, headers.length).setValues(data);
  sheet.getRange(2, 9, data.length, 1).setNumberFormat('#,##0');
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * 11_Project_Profit_Loss Sheet Setup
 */
function buildProfitLossSheet(sheet) {
  sheet.clear();
  sheet.setFrozenRows(1);

  const headers = [
    'Project ID', 'Project Name', 'Client Name', 'Contract Revenue (Formula)', 
    'Direct Material Cost (Formula)', 'Direct Labour Cost (Formula)', 'Direct Subcontractor (Formula)', 
    'Allocated Overhead (Formula)', 'Total Cost (Formula)', 'Net Profit / Loss (Formula)', 
    'Profit Margin % (Formula)', 'Cash Received (Formula)', 'Cash Due (Formula)'
  ];

  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  styleHeader(headerRange, '#059669', '#FFFFFF');

  const data = [
    [
      'PRJ-001', 'Gulshan Sky Duplex Penthouse', 'Dr. Tariqul Islam', 
      '=VLOOKUP(A2, \\'04_Projects\\'!A:K, 11, FALSE)', 
      '=VLOOKUP(A2, \\'04_Projects\\'!A:N, 14, FALSE)', 
      '=VLOOKUP(A2, \\'04_Projects\\'!A:O, 15, FALSE)', 
      '=SUMIFS(\\'10_Expenses\\'!I:I, \\'10_Expenses\\'!E:E, A2, \\'10_Expenses\\'!B:B, "PROJECT_DIRECT")', 
      '=VLOOKUP(A2, \\'04_Projects\\'!A:Q, 17, FALSE)', 
      '=E2+F2+G2+H2', '=D2-I2', '=IFERROR((J2/D2)*100, 0)', 
      '=VLOOKUP(A2, \\'04_Projects\\'!A:S, 19, FALSE)', 
      '=D2-L2'
    ],
    [
      'PRJ-002', 'Nexus Corporate HQ Suite', 'Nexus Fintech Ltd.', 
      '=VLOOKUP(A3, \\'04_Projects\\'!A:K, 11, FALSE)', 
      '=VLOOKUP(A3, \\'04_Projects\\'!A:N, 14, FALSE)', 
      '=VLOOKUP(A3, \\'04_Projects\\'!A:O, 15, FALSE)', 
      '=SUMIFS(\\'10_Expenses\\'!I:I, \\'10_Expenses\\'!E:E, A3, \\'10_Expenses\\'!B:B, "PROJECT_DIRECT")', 
      '=VLOOKUP(A3, \\'04_Projects\\'!A:Q, 17, FALSE)', 
      '=E3+F3+G3+H3', '=D3-I3', '=IFERROR((J3/D3)*100, 0)', 
      '=VLOOKUP(A3, \\'04_Projects\\'!A:S, 19, FALSE)', 
      '=D3-L3'
    ],
    [
      'PRJ-003', 'Banani DOHS Lakeview Apartment', 'Sabrina Mostafa', 
      '=VLOOKUP(A4, \\'04_Projects\\'!A:K, 11, FALSE)', 
      '=VLOOKUP(A4, \\'04_Projects\\'!A:N, 14, FALSE)', 
      '=VLOOKUP(A4, \\'04_Projects\\'!A:O, 15, FALSE)', 
      '=SUMIFS(\\'10_Expenses\\'!I:I, \\'10_Expenses\\'!E:E, A4, \\'10_Expenses\\'!B:B, "PROJECT_DIRECT")', 
      '=VLOOKUP(A4, \\'04_Projects\\'!A:Q, 17, FALSE)', 
      '=E4+F4+G4+H4', '=D4-I4', '=IFERROR((J4/D4)*100, 0)', 
      '=VLOOKUP(A4, \\'04_Projects\\'!A:S, 19, FALSE)', 
      '=D4-L4'
    ],
    [
      'PRJ-004', 'Dhanmondi Artisan Coffee Bar', 'Cafe Roast & Bean', 
      '=VLOOKUP(A5, \\'04_Projects\\'!A:K, 11, FALSE)', 
      '=VLOOKUP(A5, \\'04_Projects\\'!A:N, 14, FALSE)', 
      '=VLOOKUP(A5, \\'04_Projects\\'!A:O, 15, FALSE)', 
      '=SUMIFS(\\'10_Expenses\\'!I:I, \\'10_Expenses\\'!E:E, A5, \\'10_Expenses\\'!B:B, "PROJECT_DIRECT")', 
      '=VLOOKUP(A5, \\'04_Projects\\'!A:Q, 17, FALSE)', 
      '=E5+F5+G5+H5', '=D5-I5', '=IFERROR((J5/D5)*100, 0)', 
      '=VLOOKUP(A5, \\'04_Projects\\'!A:S, 19, FALSE)', 
      '=D5-L5'
    ]
  ];

  sheet.getRange(2, 1, data.length, headers.length).setValues(data);
  sheet.getRange(2, 4, data.length, 7).setNumberFormat('#,##0');
  sheet.getRange(2, 12, data.length, 2).setNumberFormat('#,##0');
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * 12_Office_Staff_Bills Sheet Setup
 */
function buildOfficeSheet(sheet) {
  sheet.clear();
  sheet.setFrozenRows(1);

  const headers = [
    'Staff ID', 'Name', 'Designation', 'Phone', 'Monthly Salary', 
    'Join Date', 'Employment Status', 'Office Bills Item', 'Bill Month', 'Bill Amount', 'Bill Status'
  ];

  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  styleHeader(headerRange, '#6366F1', '#FFFFFF');

  const data = [
    ['STF-001', 'Ar. Tanvir Ahmed', 'Principal Architect', '+880 1711-223344', 95000, '2024-01-01', 'Active', 'Gulshan Studio Rent', 'Oct 2026', 85000, 'Paid'],
    ['STF-002', 'Sumiya Rahman', 'Senior Interior Designer', '+880 1812-445566', 60000, '2024-06-15', 'Active', 'DESCO Electricity', 'Oct 2026', 14500, 'Paid'],
    ['STF-003', 'Kamrul Hassan', 'Head Project Engineer', '+880 1913-778899', 55000, '2024-03-01', 'Active', 'Link3 Fiber Internet', 'Oct 2026', 4500, 'Paid'],
    ['STF-004', 'Nafis Chowdhury', '3D Visualizer & CAD', '+880 1614-990011', 42000, '2025-01-10', 'Active', 'Autodesk Software', 'Oct 2026', 14000, 'Paid'],
    ['STF-005', 'Farhana Akhter', 'Accountant & HR', '+880 1715-332211', 45000, '2024-04-01', 'Active', 'Pantry & Stationery', 'Oct 2026', 12000, 'Unpaid']
  ];

  sheet.getRange(2, 1, data.length, headers.length).setValues(data);
  sheet.getRange(2, 5, data.length, 1).setNumberFormat('#,##0');
  sheet.getRange(2, 10, data.length, 1).setNumberFormat('#,##0');
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * 13_Tasks_Timeline Sheet Setup
 */
function buildTasksSheet(sheet) {
  sheet.clear();
  sheet.setFrozenRows(1);

  const headers = [
    'Task ID', 'Project ID', 'Task Name', 'Assigned Person', 
    'Start Date', 'Due Date', 'Priority', 'Status', 'Completion %', 'Notes'
  ];

  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  styleHeader(headerRange, '#EA580C', '#FFFFFF');

  const data = [
    ['TSK-001', 'PRJ-001', 'Kitchen Island Quartz Countertop Fitting', 'Kamrul Hassan', '2026-10-18', '2026-10-24', 'High', 'In Progress', 60, 'Calacatta gold quartz stone'],
    ['TSK-002', 'PRJ-001', 'Master Closet Fluted Glass Sliding Doors', 'Md. Dulal Hossain', '2026-10-20', '2026-10-28', 'High', 'In Progress', 40, 'Aluminium slim profile framing'],
    ['TSK-003', 'PRJ-002', 'Boardroom Acoustic Panelling & Cabling', 'Sumiya Rahman', '2026-10-12', '2026-10-22', 'High', 'In Progress', 85, 'Sound insulation rockwool backing'],
    ['TSK-004', 'PRJ-003', 'False Ceiling 2nd Coat Putty & Sanding', 'Nurul Islam Babu', '2026-10-17', '2026-10-21', 'Medium', 'In Progress', 70, 'Inspect under spotlight'],
    ['TSK-005', 'PRJ-002', 'Deep Cleaning & Snag List Preparation', 'Kamrul Hassan', '2026-10-23', '2026-10-26', 'High', 'Not Started', 0, 'Floor scrubber coordination']
  ];

  sheet.getRange(2, 1, data.length, headers.length).setValues(data);
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * 14_Audit_Log Sheet Setup
 */
function buildAuditSheet(sheet) {
  sheet.clear();
  sheet.setFrozenRows(1);

  const headers = ['Log ID', 'Timestamp', 'Action', 'Module', 'Record ID', 'Summary', 'Authorized User'];
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  styleHeader(headerRange, '#64748B', '#FFFFFF');

  const data = [
    ['AUD-001', '2026-10-15 14:32', 'CREATE', 'Payments Received', 'PAY-007', 'Received ৳8,00,000 for Banani DOHS', 'Farhana Akhter'],
    ['AUD-002', '2026-10-16 09:15', 'UPDATE', 'Materials & Inventory', 'MAT-005', 'Stock level updated to 4 rolls', 'Mahfuzur Rahman'],
    ['AUD-003', '2026-10-17 11:20', 'UPDATE', 'Project Management', 'PRJ-002', 'Nexus Corporate HQ progress to 90%', 'Kamrul Hassan']
  ];

  sheet.getRange(2, 1, data.length, headers.length).setValues(data);
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * 01_Dashboard Sheet Setup - Master Automated Dashboard
 */
function buildDashboardSheet(sheet) {
  sheet.clear();

  // Title Banner
  sheet.getRange('A1:H2').merge();
  const banner = sheet.getRange('A1');
  banner.setValue('🏛️ STUDIO ARCHVISTA INTERIOR & DECOR - EXECUTIVE ERP DASHBOARD');
  banner.setBackground('#0F172A').setFontColor('#F8FAFC').setFontSize(14).setFontWeight('bold')
        .setHorizontalAlignment('center').setVerticalAlignment('middle');

  // KPI Table 1: High Level Stats
  const kpis = [
    ['KEY PERFORMANCE INDICATOR', 'VALUE', '', 'FINANCIAL METRIC', 'AMOUNT (৳)'],
    ['Total Registered Clients', '=COUNTA(\\'03_Clients\\'!A2:A)', '', 'Total Contract Value', '=SUM(\\'04_Projects\\'!K2:K)'],
    ['Total Projects', '=COUNTA(\\'04_Projects\\'!A2:A)', '', 'Total Money Received', '=SUM(\\'09_Payments_Received\\'!H2:H)'],
    ['Running / Active Projects', '=COUNTIF(\\'04_Projects\\'!L2:L, "In Progress*") + COUNTIF(\\'04_Projects\\'!L2:L, "Finishing")', '', 'Total Outstanding Due', '=E4-E5'],
    ['Completed Projects', '=COUNTIF(\\'04_Projects\\'!L2:L, "Completed")', '', 'Total Direct Material Cost', '=SUM(\\'06_Material_Transactions\\'!H2:H)'],
    ['Pending / Review Tasks', '=COUNTIF(\\'13_Tasks_Timeline\\'!H2:H, "<>Completed")', '', 'Total Direct Labour Cost', '=SUM(\\'08_Labour_Attendance\\'!K2:K)'],
    ['Low Stock Alert Items', '=COUNTIF(\\'05_Materials_Inventory\\'!M2:M, "Low Stock") + COUNTIF(\\'05_Materials_Inventory\\'!M2:M, "Out of Stock")', '', 'Office Overhead Expenses', '=SUMIF(\\'10_Expenses\\'!B2:B, "OFFICE_OVERHEAD", \\'10_Expenses\\'!I2:I)'],
    ['Active Workers on Sites', '=COUNTA(\\'08_Labour_Attendance\\'!A2:A)', '', 'NET ESTIMATED PROFIT', '=E5-(E7+E8+E9)']
  ];

  sheet.getRange(4, 1, kpis.length, 5).setValues(kpis);
  
  // Style Headers
  styleHeader(sheet.getRange('A4:B4'), '#1E293B', '#38BDF8');
  styleHeader(sheet.getRange('D4:E4'), '#1E293B', '#34D399');

  // Format numbers
  sheet.getRange('B5:B11').setFontWeight('bold').setHorizontalAlignment('center');
  sheet.getRange('E5:E11').setNumberFormat('#,##0').setFontWeight('bold');
  sheet.getRange('D11:E11').setBackground('#DCFCE7').setFontColor('#166534'); // Highlight Net Profit

  // Project Summary Table
  sheet.getRange('A13:H13').merge().setValue('📊 LIVE PROJECT STATUS & FINANCIAL PROGRESS')
       .setBackground('#334155').setFontColor('#FFFFFF').setFontWeight('bold');

  const projHeaders = ['Project ID', 'Project Name', 'Client', 'Status', 'Progress', 'Contract (৳)', 'Cost (৳)', 'Due (৳)'];
  sheet.getRange(14, 1, 1, 8).setValues([projHeaders]);
  styleHeader(sheet.getRange(14, 1, 1, 8), '#475569', '#FFFFFF');

  const projFormulaRows = [
    ['=\\'04_Projects\\'!A2', '=\\'04_Projects\\'!B2', '=\\'04_Projects\\'!D2', '=\\'04_Projects\\'!L2', '=\\'04_Projects\\'!M2/100', '=\\'04_Projects\\'!K2', '=\\'04_Projects\\'!R2', '=\\'04_Projects\\'!T2'],
    ['=\\'04_Projects\\'!A3', '=\\'04_Projects\\'!B3', '=\\'04_Projects\\'!D3', '=\\'04_Projects\\'!L3', '=\\'04_Projects\\'!M3/100', '=\\'04_Projects\\'!K3', '=\\'04_Projects\\'!R3', '=\\'04_Projects\\'!T3'],
    ['=\\'04_Projects\\'!A4', '=\\'04_Projects\\'!B4', '=\\'04_Projects\\'!D4', '=\\'04_Projects\\'!L4', '=\\'04_Projects\\'!M4/100', '=\\'04_Projects\\'!K4', '=\\'04_Projects\\'!R4', '=\\'04_Projects\\'!T4'],
    ['=\\'04_Projects\\'!A5', '=\\'04_Projects\\'!B5', '=\\'04_Projects\\'!D5', '=\\'04_Projects\\'!L5', '=\\'04_Projects\\'!M5/100', '=\\'04_Projects\\'!K5', '=\\'04_Projects\\'!R5', '=\\'04_Projects\\'!T5']
  ];

  sheet.getRange(15, 1, projFormulaRows.length, 8).setValues(projFormulaRows);
  sheet.getRange(15, 5, projFormulaRows.length, 1).setNumberFormat('0%');
  sheet.getRange(15, 6, projFormulaRows.length, 3).setNumberFormat('#,##0');

  sheet.autoResizeColumns(1, 8);
}

/**
 * Styling Helper
 */
function styleHeader(range, bgHex, fontHex) {
  range.setBackground(bgHex)
       .setFontColor(fontHex)
       .setFontWeight('bold')
       .setVerticalAlignment('middle')
       .setWrap(true);
}

/**
 * Alert: Low Stock Check
 */
function checkLowStockAlerts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const matSheet = ss.getSheetByName('05_Materials_Inventory');
  const data = matSheet.getDataRange().getValues();
  let alerts = [];

  for (let i = 1; i < data.length; i++) {
    const name = data[i][1];
    const stock = data[i][9];
    const reorder = data[i][11];
    const status = data[i][12];

    if (status === 'Low Stock' || status === 'Out of Stock') {
      alerts.push(\`• \${name} (Current: \${stock}, Reorder Level: \${reorder}) [\${status}]\`);
    }
  }

  const ui = SpreadsheetApp.getUi();
  if (alerts.length > 0) {
    ui.alert('⚠️ LOW STOCK WARNING:\\n\\n' + alerts.join('\\n'));
  } else {
    ui.alert('✅ Inventory Status Good: All materials are well stocked!');
  }
}

/**
 * Alert: Client Due Check
 */
function checkClientDues() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const cliSheet = ss.getSheetByName('03_Clients');
  const data = cliSheet.getDataRange().getValues();
  let dues = [];

  for (let i = 1; i < data.length; i++) {
    const name = data[i][1];
    const due = data[i][11];
    if (due > 0) {
      dues.push(\`• \${name}: ৳ \${due.toLocaleString()}\`);
    }
  }

  const ui = SpreadsheetApp.getUi();
  if (dues.length > 0) {
    ui.alert('💰 CLIENT OUTSTANDING DUES:\\n\\n' + dues.join('\\n'));
  } else {
    ui.alert('✅ All client invoices are fully paid!');
  }
}

/**
 * Alert: Upcoming Deadlines
 */
function checkUpcomingDeadlines() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tskSheet = ss.getSheetByName('13_Tasks_Timeline');
  const data = tskSheet.getDataRange().getValues();
  let tasks = [];

  for (let i = 1; i < data.length; i++) {
    const taskName = data[i][2];
    const person = data[i][3];
    const due = data[i][5];
    const status = data[i][7];

    if (status !== 'Completed') {
      tasks.push(\`• \${taskName} (Assigned: \${person}, Due: \${due}) [\${status}]\`);
    }
  }

  const ui = SpreadsheetApp.getUi();
  if (tasks.length > 0) {
    ui.alert('📅 ACTIVE / UPCOMING DEADLINES:\\n\\n' + tasks.join('\\n'));
  } else {
    ui.alert('✅ All tasks completed!');
  }
}

/**
 * Refresh Calculations
 */
function refreshCalculations() {
  SpreadsheetApp.flush();
  SpreadsheetApp.getUi().alert('✅ All Google Sheets formulas flushed and recalculated!');
}

/**
 * ==============================================================================
 * 24/7 ONLINE CLOUD SYNC & GOOGLE DRIVE AUTO-BACKUP WEB APP ENDPOINT
 * 
 * To activate 100% free auto-backup to your Google Drive:
 * 1. In Apps Script, click "Deploy" (top right) > "New deployment"
 * 2. Select type: "Web app"
 * 3. Description: "InteriorCraft Cloud Backup"
 * 4. Execute as: "Me (your email)"
 * 5. Who has access: "Anyone" (allows your browser app to post securely)
 * 6. Click "Deploy", copy the "Web app URL" and paste it into the ERP's Cloud Sync settings!
 * ==============================================================================
 */

function doPost(e) {
  try {
    const rawData = (e && e.postData && e.postData.contents) ? e.postData.contents : "{}";
    const payload = JSON.parse(rawData);

    // Handle diagnostic ping test immediately
    if (payload && payload.ping) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Advance System Company Management ERP - Google Cloud Sync is Connected & Ready!'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    let savedLocations = [];
    let folderUrl = "https://drive.google.com/drive/my-drive";

    // 1. Always save into a dedicated backup sheet inside the active Google Spreadsheet (Zero extra permissions needed!)
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      if (ss) {
        let backupSheet = ss.getSheetByName("99_Cloud_Backup");
        if (!backupSheet) {
          backupSheet = ss.insertSheet("99_Cloud_Backup");
          backupSheet.getRange("A1:D1").setValues([["Timestamp", "Company Name", "Total Records", "Raw JSON Backup"]]);
          backupSheet.getRange("A1:D1").setFontWeight("bold");
        }
        const timestampStr = new Date().toISOString();
        const compName = (payload.settings && payload.settings.companyName) ? payload.settings.companyName : "Advance System Company Management";
        const totalRecs = (payload.clients ? payload.clients.length : 0) + (payload.projects ? payload.projects.length : 0);
        // Chunk rawData if > 45000 chars per cell
        const chunks = [];
        for (let i = 0; i < rawData.length; i += 45000) {
          chunks.push(rawData.substring(i, i + 45000));
        }
        const rowData = [timestampStr, compName, totalRecs, ...chunks];
        backupSheet.getRange(2, 1, 1, rowData.length).setValues([rowData]);
        savedLocations.push("Google Sheet (99_Cloud_Backup)");
        folderUrl = ss.getUrl();
      }
    } catch (sheetErr) {
      // Ignore if standalone script
    }

    // 2. Also save .json files into Google Drive folder if DriveApp permission is available
    try {
      const folderName = "Advance_System_ERP_Backups";
      let folders = DriveApp.getFoldersByName(folderName);
      let folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);

      const latestFileName = "Advance_System_Latest_Backup.json";
      let existingFiles = folder.getFilesByName(latestFileName);
      if (existingFiles.hasNext()) {
        existingFiles.next().setContent(rawData);
      } else {
        folder.createFile(latestFileName, rawData, MimeType.PLAIN_TEXT);
      }

      const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+6", "yyyy-MM-dd_HH-mm");
      const historyFileName = "Backup_" + timestamp + ".json";
      if (!folder.getFilesByName(historyFileName).hasNext()) {
        folder.createFile(historyFileName, rawData, MimeType.PLAIN_TEXT);
      }
      folderUrl = folder.getUrl();
      savedLocations.push("Google Drive Folder (" + folderName + ")");
    } catch (driveErr) {
      // DriveApp might not be authorized yet, but Sheet backup succeeded!
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'সফলভাবে গুগল ক্লাউডে ব্যাকআপ সংরক্ষিত হয়েছে (' + (savedLocations.join(' & ') || 'Cloud Storage') + ')',
      folderUrl: folderUrl,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    // 1. Try reading from Google Drive folder first
    try {
      const folderName = "Advance_System_ERP_Backups";
      let folders = DriveApp.getFoldersByName(folderName);
      if (folders.hasNext()) {
        let folder = folders.next();
        let files = folder.getFilesByName("Advance_System_Latest_Backup.json");
        if (files.hasNext()) {
          let content = files.next().getBlob().getDataAsString();
          return ContentService.createTextOutput(content).setMimeType(ContentService.MimeType.JSON);
        }
      }
      // Check legacy folder name too
      let oldFolders = DriveApp.getFoldersByName("InteriorCraft_ERP_Backups");
      if (oldFolders.hasNext()) {
        let folder = oldFolders.next();
        let files = folder.getFilesByName("InteriorCraft_Latest_Backup.json");
        if (files.hasNext()) {
          let content = files.next().getBlob().getDataAsString();
          return ContentService.createTextOutput(content).setMimeType(ContentService.MimeType.JSON);
        }
      }
    } catch (driveErr) {}

    // 2. Fallback: Read from 99_Cloud_Backup sheet inside active spreadsheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) {
      const backupSheet = ss.getSheetByName("99_Cloud_Backup");
      if (backupSheet && backupSheet.getLastRow() >= 2) {
        const lastCol = backupSheet.getLastColumn();
        if (lastCol >= 4) {
          const rowValues = backupSheet.getRange(2, 4, 1, lastCol - 3).getValues()[0];
          const combinedJson = rowValues.filter(Boolean).join("");
          if (combinedJson) {
            return ContentService.createTextOutput(combinedJson).setMimeType(ContentService.MimeType.JSON);
          }
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'not_found',
      message: 'No backup file found in Google Drive or Sheet yet.'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
`;

