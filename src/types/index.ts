export interface PhoneNumber {
  number: string;
  formattedNumber?: string;
  countryCode?: string;
  nationalNumber?: string;
}

export interface ReputationCheck {
  phoneNumber: string;
  timestamp: Date;
  isValid: boolean;
  carrier?: string;
  lineType?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  reputation: {
    spamScore?: number;
    spamLikely: boolean;
    scamLikely: boolean;
    riskLevel: 'low' | 'medium' | 'high' | 'unknown';
    flaggedByCarriers: string[];
    attestationLevel?: 'A' | 'B' | 'C' | 'unknown';
  };
  cnam?: {
    registered: boolean | null;
    displayName?: string;
  };
  disconnected?: boolean;
  reassigned?: boolean;
  dialMetrics?: {
    totalDials?: number;
    dailyAverage?: number;
    lastDialDate?: string;
    daysSinceLastDial?: number;
  };
  healthScore?: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    factors: {
      carrierQuality: number;
      attestation: number;
      spamRisk: number;
      dialActivity: number;
      age: number;
    };
    recommendations: string[];
  };
  errors?: string[];
}

export interface BulkUploadResult {
  totalNumbers: number;
  processed: number;
  failed: number;
  results: ReputationCheck[];
}