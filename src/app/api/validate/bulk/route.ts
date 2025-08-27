import { NextRequest, NextResponse } from 'next/server';
import { ReputationCheck } from '@/types';

async function validateNumber(phoneNumber: string): Promise<ReputationCheck> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/validate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      }
    );

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error validating number:', phoneNumber, error);
  }

  return {
    phoneNumber,
    timestamp: new Date(),
    isValid: false,
    reputation: {
      spamLikely: false,
      scamLikely: false,
      riskLevel: 'unknown',
      flaggedByCarriers: [],
    },
    errors: ['Validation failed'],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumbers } = body;

    if (!phoneNumbers || !Array.isArray(phoneNumbers)) {
      return NextResponse.json(
        { error: 'Phone numbers array is required' },
        { status: 400 }
      );
    }

    const maxBatchSize = 100;
    const limitedNumbers = phoneNumbers.slice(0, maxBatchSize);

    const batchSize = 5;
    const results: ReputationCheck[] = [];
    
    for (let i = 0; i < limitedNumbers.length; i += batchSize) {
      const batch = limitedNumbers.slice(i, i + batchSize);
      const batchPromises = batch.map(number => validateNumber(number));
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      if (i + batchSize < limitedNumbers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Bulk validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}