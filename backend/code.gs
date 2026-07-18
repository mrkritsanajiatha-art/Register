/**
 * Education Training Platform - Backend Google Apps Script
 * Deploy this script as a Web App (Execute as: Me, Who has access: Anyone)
 * 
 * Required Google Sheets:
 * - Applicants
 * - Courses
 * - Settings
 * - Logs
 */

const SHEET_ID = '1-XYEutKiYRt2vYCpOo2tO5FndlBj71D47vddwmfE2RE'; 
const FOLDER_ID = '1esEYAZtAVV7UfPcOouAVOG0tee9eZ8Cl';

function doGet(e) {
  const path = e.parameter.path;
  
  if (path === 'application') {
    return handleGetApplication(e.parameter.email);
  } else if (path === 'courses') {
    return handleGetCourses();
  } else if (path === 'settings') {
    return handleGetSettings();
  }
  
  return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Invalid path'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch(err) {
    return response({status: 'error', message: 'Invalid JSON payload'}, 400);
  }
  
  const path = body.path;
  
  if (path === 'register') {
    return handleRegister(body.data);
  } else if (path === 'uploadSlip') {
    return handleUploadSlip(body.data);
  } else if (path === 'approve') {
    return handleApprove(body.data);
  } else if (path === 'reject') {
    return handleReject(body.data);
  } else if (path === 'applicants') { // For Admin Dashboard
    return handleGetApplicants();
  }
  
  return response({status: 'error', message: 'Invalid path'}, 400);
}

// Helpers
function response(data, code=200) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(sheetName) {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(sheetName);
}

function generateId() {
  return 'APP-' + new Date().getTime();
}

function logAction(action, adminUser) {
  const sheet = getSheet('Logs');
  sheet.appendRow([generateId(), action, new Date(), adminUser || 'System']);
}

// Handlers
function handleRegister(data) {
  const sheet = getSheet('Applicants');
  const id = generateId();
  const date = new Date();
  
  // Data array must match columns in Google Sheets
  // [id, registerDate, firstName, lastName, email, phone, province, organization, position, package, courses, paymentStatus, slipUrl, adminRemark]
  const rowData = [
    id,
    date,
    data.firstName,
    data.lastName,
    data.email,
    data.phone,
    data.province,
    data.organization,
    data.position,
    data.package,
    data.courses.join(','),
    'Pending Payment',
    '',
    ''
  ];
  
  sheet.appendRow(rowData);
  logAction(`Registered: ${data.email}`);
  
  return response({status: 'success', id: id, message: 'Registration successful'});
}

function handleUploadSlip(data) {
  // data = { email: '', base64: '...', mimeType: 'image/jpeg', filename: 'slip.jpg' }
  const folder = DriveApp.getFolderById(FOLDER_ID);
  
  // Decode base64
  let blob = Utilities.newBlob(Utilities.base64Decode(data.base64.split(',')[1]), data.mimeType, data.filename);
  let file = folder.createFile(blob);
  let fileUrl = file.getUrl();
  
  // Update Sheet
  const sheet = getSheet('Applicants');
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  let found = false;
  for (let i = 1; i < values.length; i++) {
    if (values[i][4] === data.email) { // Index 4 is email
      sheet.getRange(i + 1, 12).setValue('Pending Review'); // paymentStatus
      sheet.getRange(i + 1, 13).setValue(fileUrl); // slipUrl
      found = true;
      break;
    }
  }
  
  if (found) {
    logAction(`Uploaded Slip: ${data.email}`);
    return response({status: 'success', url: fileUrl});
  } else {
    return response({status: 'error', message: 'Email not found'});
  }
}

function handleGetApplication(email) {
  const sheet = getSheet('Applicants');
  const values = sheet.getDataRange().getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][4] === email) {
      return response({
        status: 'success',
        data: {
          id: values[i][0],
          name: `${values[i][2]} ${values[i][3]}`,
          paymentStatus: values[i][11],
          courses: values[i][10]
        }
      });
    }
  }
  return response({status: 'error', message: 'Not found'});
}

function handleGetApplicants() {
  const sheet = getSheet('Applicants');
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const applicants = [];
  
  for (let i = 1; i < values.length; i++) {
    let obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[i][j];
    }
    applicants.push(obj);
  }
  return response({status: 'success', data: applicants});
}

function handleApprove(data) {
  // data = { email: '', adminUser: '' }
  return updateStatus(data.email, 'Approved', data.adminUser);
}

function handleReject(data) {
  // data = { email: '', adminUser: '' }
  return updateStatus(data.email, 'Rejected', data.adminUser);
}

function updateStatus(email, newStatus, adminUser) {
  const sheet = getSheet('Applicants');
  const values = sheet.getDataRange().getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][4] === email) {
      sheet.getRange(i + 1, 12).setValue(newStatus);
      logAction(`${newStatus}: ${email}`, adminUser);
      return response({status: 'success', message: `Status updated to ${newStatus}`});
    }
  }
  return response({status: 'error', message: 'Email not found'});
}

// Enable CORS for web apps
function doOptions(e) {
  return response({status: 'success'});
}
