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
    registered: boolean;
    displayName?: string;
  };
  disconnected?: boolean;
  reassigned?: boolean;
  errors?: string[];
}

export interface BulkUploadResult {
  totalNumbers: number;
  processed: number;
  failed: number;
  results: ReputationCheck[];
}