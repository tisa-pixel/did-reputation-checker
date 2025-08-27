import { NextRequest, NextResponse } from 'next/server';
import { ReputationCheck } from '@/types';
import { calculateHealthScore } from '@/lib/health-score';

async function checkIPQualityScore(phoneNumber: string) {
  const apiKey = process.env.IPQUALITYSCORE_API_KEY;
  
  if (!apiKey || apiKey === 'your_ipqs_api_key_here') {
    return null;
  }

  try {
    const response = await fetch(
      `https://ipqualityscore.com/api/json/phone/${apiKey}/${encodeURIComponent(phoneNumber)}`,
      { cache: 'no-store' }
    );
    
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('IPQS API error:', error);
  }
  
  return null;
}

async function checkNumVerify(phoneNumber: string) {
  const apiKey = process.env.NUMVERIFY_API_KEY;
  
  if (!apiKey || apiKey === 'your_numverify_api_key_here') {
    return null;
  }

  try {
    const response = await fetch(
      `http://apilayer.net/api/validate?access_key=${apiKey}&number=${encodeURIComponent(phoneNumber)}`,
      { cache: 'no-store' }
    );
    
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('NumVerify API error:', error);
  }
  
  return null;
}

function simulateReputationCheck(phoneNumber: string): ReputationCheck {
  const random = Math.random();
  const isSpam = random < 0.15;
  const isScam = random < 0.05;
  const riskScore = Math.random();
  
  let riskLevel: 'low' | 'medium' | 'high' | 'unknown' = 'low';
  if (riskScore > 0.7) riskLevel = 'high';
  else if (riskScore > 0.4) riskLevel = 'medium';
  
  const carriers = ['AT&T', 'Verizon', 'T-Mobile', 'Sprint'];
  const flaggedCarriers = isSpam || isScam 
    ? carriers.filter(() => Math.random() < 0.3)
    : [];
  
  const attestationLevels: Array<'A' | 'B' | 'C' | 'unknown'> = ['A', 'B', 'C', 'unknown'];
  const attestation = attestationLevels[Math.floor(Math.random() * attestationLevels.length)];
  
  return {
    phoneNumber,
    timestamp: new Date(),
    isValid: true,
    carrier: carriers[Math.floor(Math.random() * carriers.length)],
    lineType: ['mobile', 'landline', 'voip'][Math.floor(Math.random() * 3)],
    location: {
      city: 'New York',
      state: 'NY',
      country: 'US'
    },
    reputation: {
      spamScore: riskScore * 100,
      spamLikely: isSpam,
      scamLikely: isScam,
      riskLevel,
      flaggedByCarriers: flaggedCarriers,
      attestationLevel: attestation,
    },
    cnam: {
      registered: Math.random() < 0.7,
      displayName: Math.random() < 0.5 ? 'Business Name' : undefined,
    },
    disconnected: Math.random() < 0.02,
    reassigned: Math.random() < 0.05,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    let result: ReputationCheck;

    const ipqsData = await checkIPQualityScore(phoneNumber);
    const numverifyData = await checkNumVerify(phoneNumber);

    if (ipqsData) {
      result = {
        phoneNumber,
        timestamp: new Date(),
        isValid: ipqsData.valid || false,
        carrier: ipqsData.carrier,
        lineType: ipqsData.line_type,
        location: {
          city: ipqsData.city,
          state: ipqsData.region,
          country: ipqsData.country,
        },
        reputation: {
          spamScore: ipqsData.fraud_score || 0,
          spamLikely: ipqsData.recent_abuse || false,
          scamLikely: ipqsData.fraud_score > 75,
          riskLevel: ipqsData.fraud_score > 75 ? 'high' : ipqsData.fraud_score > 50 ? 'medium' : 'low',
          flaggedByCarriers: [],
          attestationLevel: 'unknown',
        },
        cnam: {
          registered: null as any,
          displayName: 'CNAM check not available via IPQS',
        },
        disconnected: !ipqsData.active,
        reassigned: false,
      };
    } else if (numverifyData) {
      result = {
        phoneNumber,
        timestamp: new Date(),
        isValid: numverifyData.valid || false,
        carrier: numverifyData.carrier,
        lineType: numverifyData.line_type,
        location: {
          country: numverifyData.country_name,
        },
        reputation: {
          spamLikely: false,
          scamLikely: false,
          riskLevel: 'unknown',
          flaggedByCarriers: [],
        },
        cnam: {
          registered: null as any,
          displayName: 'CNAM check not available via IPQS',
        },
      };
    } else {
      result = simulateReputationCheck(phoneNumber);
    }

    // Calculate health score
    const resultWithScore = calculateHealthScore(result);
    
    return NextResponse.json(resultWithScore);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}