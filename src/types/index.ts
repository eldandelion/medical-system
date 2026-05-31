export interface Referral {
  id: string;
  studentName: string;
  type: string;
  date: string;
  reason: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  status: 'Draft' | 'Closed' | 'Pending' | 'Approved' | 'AwaitingApproval';
  referredBy?: {
    name: string;
    avatar?: string;
  };
  extendedData?: {
    age: number;
    gender: string;
    studentId: string;
    school: string;
    grade: string;
    phone: string;
    triage: {
      isFirstVisit: boolean;
      isMedicated: boolean;
      priorTherapy: string;
      scidDiagnosis: string;
      fullDescription: string;
    };
    destination: {
      hospital: string;
      department: string;
      doctor: string;
      admin: string;
      transferDate: string;
    };
    risk: {
      ideation: boolean;
      attempt: boolean;
      selfHarm: boolean;
      notes: string;
    };
    scores: {
      name: string;
      value: number;
      max: number;
      level: string;
    }[];
    feedback: {
      summary: string;
      followUp: string;
      attachments: {
        name: string;
        size: string;
      }[];
    };
  };
}
