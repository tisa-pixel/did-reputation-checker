import { PhoneNumber, ReputationCheck } from '@/types';

export class PhoneValidator {
  private static formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('1') && cleaned.length > 11) {
      return `+${cleaned}`;
    }
    
    return phone;
  }

  static async validateSingle(phoneNumber: string): Promise<ReputationCheck> {
    const formatted = this.formatPhoneNumber(phoneNumber);
    
    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: formatted }),
      });

      if (!response.ok) {
        throw new Error('Validation failed');
      }

      return await response.json();
    } catch (error) {
      return {
        phoneNumber: formatted,
        timestamp: new Date(),
        isValid: false,
        reputation: {
          spamLikely: false,
          scamLikely: false,
          riskLevel: 'unknown',
          flaggedByCarriers: [],
        },
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  static async validateBulk(phoneNumbers: string[]): Promise<ReputationCheck[]> {
    const formatted = phoneNumbers.map(phone => this.formatPhoneNumber(phone));
    
    try {
      const response = await fetch('/api/validate/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumbers: formatted }),
      });

      if (!response.ok) {
        throw new Error('Bulk validation failed');
      }

      return await response.json();
    } catch (error) {
      return formatted.map(phone => ({
        phoneNumber: phone,
        timestamp: new Date(),
        isValid: false,
        reputation: {
          spamLikely: false,
          scamLikely: false,
          riskLevel: 'unknown',
          flaggedByCarriers: [],
        },
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      }));
    }
  }
}