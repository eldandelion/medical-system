import fs from 'fs';
import path from 'path';

const SRC_DIR = '/Volumes/Files/Programming/medical-system/frontend/src';

const replacements = {
  // ClinicalStatusType
  "'FirstVisit'": "'FIRST_VISIT'",
  "\"FirstVisit\"": "\"FIRST_VISIT\"",
  "'Medicated'": "'MEDICATED'",
  "\"Medicated\"": "\"MEDICATED\"",
  "'PriorTherapy'": "'PRIOR_THERAPY'",
  "\"PriorTherapy\"": "\"PRIOR_THERAPY\"",
  
  // ReferralType
  "'初次转诊'": "'INITIAL'",
  "\"初次转诊\"": "\"INITIAL\"",
  "'复诊转诊'": "'FOLLOW_UP'",
  "\"复诊转诊\"": "\"FOLLOW_UP\"",
  "'紧急转诊'": "'EMERGENCY'",
  "\"紧急转诊\"": "\"EMERGENCY\"",

  // ReferralStatus
  "'Draft'": "'DRAFT'",
  "\"Draft\"": "\"DRAFT\"",
  "'Closed'": "'CLOSED'",
  "\"Closed\"": "\"CLOSED\"",
  "'AwaitingTriage'": "'AWAITING_TRIAGE'",
  "\"AwaitingTriage\"": "\"AWAITING_TRIAGE\"",
  "'AwaitingApproval'": "'AWAITING_APPROVAL'",
  "\"AwaitingApproval\"": "\"AWAITING_APPROVAL\"",
  "'Recalled'": "'RECALLED'",
  "\"Recalled\"": "\"RECALLED\"",
  "'AwaitingFeedbackApproval'": "'AWAITING_FEEDBACK_APPROVAL'",
  "\"AwaitingFeedbackApproval\"": "\"AWAITING_FEEDBACK_APPROVAL\"",
  "'Error'": "'ERROR'",
  "\"Error\"": "\"ERROR\"",
  "'Rejected'": "'REJECTED'",
  "\"Rejected\"": "\"REJECTED\"",
  "'WaitingForScheduling'": "'WAITING_FOR_SCHEDULING'",
  "\"WaitingForScheduling\"": "\"WAITING_FOR_SCHEDULING\"",
  "'WaitingForAppointment'": "'WAITING_FOR_APPOINTMENT'",
  "\"WaitingForAppointment\"": "\"WAITING_FOR_APPOINTMENT\"",
  "'NeedsReassignment'": "'NEEDS_REASSIGNMENT'",
  "\"NeedsReassignment\"": "\"NEEDS_REASSIGNMENT\"",
  
  // Also properties in constants like Draft: '草案' -> DRAFT: '草案'
  "Draft:": "DRAFT:",
  "Closed:": "CLOSED:",
  "AwaitingTriage:": "AWAITING_TRIAGE:",
  "AwaitingApproval:": "AWAITING_APPROVAL:",
  "Recalled:": "RECALLED:",
  "AwaitingFeedbackApproval:": "AWAITING_FEEDBACK_APPROVAL:",
  "Rejected:": "REJECTED:",
  "WaitingForScheduling:": "WAITING_FOR_SCHEDULING:",
  "WaitingForAppointment:": "WAITING_FOR_APPOINTMENT:",
  "High:": "HIGH:",
  "Medium:": "MEDIUM:",
  "Low:": "LOW:",

  // RiskStatus
  "'High'": "'HIGH'",
  "\"High\"": "\"HIGH\"",
  "'Medium'": "'MEDIUM'",
  "\"Medium\"": "\"MEDIUM\"",
  "'Low'": "'LOW'",
  "\"Low\"": "\"LOW\"",

  // ReferralStepType (case sensitive replacement)
  "'initiation'": "'INITIATION'",
  "'review'": "'REVIEW'",
  "'triage'": "'TRIAGE'",
  "'scheduling'": "'SCHEDULING'",
  "'evaluation'": "'EVALUATION'",
  "'feedback'": "'FEEDBACK'",

  // ReferralStepStatus
  "'completed'": "'COMPLETED'",
  "'issue'": "'ISSUE'",
  "'pending'": "'PENDING'",
  "'active'": "'ACTIVE'",
  "\"completed\"": "\"COMPLETED\"",
  "\"issue\"": "\"ISSUE\"",
  "\"pending\"": "\"PENDING\"",
  "\"active\"": "\"ACTIVE\""
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      for (const [oldVal, newVal] of Object.entries(replacements)) {
        if (content.includes(oldVal)) {
          // Use split and join to replace all occurrences (safer than global regex escaping)
          content = content.split(oldVal).join(newVal);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(SRC_DIR);
console.log('Done.');
