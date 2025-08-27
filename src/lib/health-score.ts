import { ReputationCheck } from '@/types';

// Carrier quality scores (out of 20)
const CARRIER_SCORES: Record<string, number> = {
  'verizon': 20,
  'at&t': 20,
  'att': 20,
  'level 3': 18,
  'centurylink': 18,
  'inteliquent': 17,
  'bandwidth': 15,
  'bandwidth.com': 15,
  'sinch': 14,
  'peerless': 12,
  'neutral tandem': 12,
  'twilio': 8,
  'voip.ms': 5,
  'default': 10,
};

export function calculateHealthScore(data: ReputationCheck): ReputationCheck {
  const factors = {
    carrierQuality: 0,
    attestation: 0,
    spamRisk: 0,
    dialActivity: 0,  // Kept for structure but not used in calculation
    age: 0,
  };
  
  const recommendations: string[] = [];
  
  // 1. Carrier Quality Score (25 points max - increased)
  const carrierLower = (data.carrier || '').toLowerCase();
  let carrierScore = CARRIER_SCORES.default;
  
  for (const [carrier, score] of Object.entries(CARRIER_SCORES)) {
    if (carrierLower.includes(carrier)) {
      carrierScore = score;
      break;
    }
  }
  // Scale up to 25 points
  factors.carrierQuality = Math.round((carrierScore / 20) * 25);
  
  // 2. Attestation Level Score (35 points max - increased)
  const attestationScores = { 'A': 35, 'B': 20, 'C': 10, 'unknown': 0 };
  factors.attestation = attestationScores[data.reputation.attestationLevel || 'unknown'];
  
  if (factors.attestation < 20) {
    recommendations.push('Request A-level attestation from your provider');
  }
  
  // 3. Spam Risk Score (40 points max - increased)
  let spamRiskScore = 40;
  
  if (data.reputation.spamLikely) spamRiskScore -= 15;
  if (data.reputation.scamLikely) spamRiskScore -= 15;
  if (data.reputation.flaggedByCarriers.length > 0) {
    spamRiskScore -= (5 * data.reputation.flaggedByCarriers.length);
  }
  if (data.reputation.riskLevel === 'high') spamRiskScore -= 10;
  else if (data.reputation.riskLevel === 'medium') spamRiskScore -= 5;
  
  // Use spam score from API if available
  if (data.reputation.spamScore !== undefined) {
    const apiSpamPenalty = Math.floor((data.reputation.spamScore / 100) * 15);
    spamRiskScore -= apiSpamPenalty;
  }
  
  factors.spamRisk = Math.max(0, spamRiskScore);
  
  if (factors.spamRisk < 20) {
    recommendations.push('Number has spam indicators - consider replacement');
  }
  
  // 4. Dial Activity Score (removed from calculation)
  factors.dialActivity = 0; // Not calculated anymore
  
  // 5. Age Score (removed from calculation)
  factors.age = 0; // Not calculated anymore
  
  // Calculate total score
  const totalScore = Object.values(factors).reduce((sum, val) => sum + val, 0);
  
  // Determine grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (totalScore >= 90) grade = 'A';
  else if (totalScore >= 75) grade = 'B';
  else if (totalScore >= 60) grade = 'C';
  else if (totalScore >= 45) grade = 'D';
  else grade = 'F';
  
  // Add grade-based recommendations
  if (grade === 'A') {
    recommendations.unshift('Excellent health - maintain current practices');
  } else if (grade === 'F') {
    recommendations.unshift('CRITICAL: Consider immediate replacement');
  } else if (grade === 'D') {
    recommendations.unshift('Poor health - needs urgent attention');
  }
  
  // Add disconnected/reassigned warnings
  if (data.disconnected) {
    factors.spamRisk = 0;
    recommendations.unshift('NUMBER DISCONNECTED - Remove immediately');
  }
  if (data.reassigned) {
    factors.spamRisk = Math.max(0, factors.spamRisk - 10);
    recommendations.unshift('Number may be reassigned - verify ownership');
  }
  
  return {
    ...data,
    healthScore: {
      score: totalScore,
      grade,
      factors,
      recommendations: [...new Set(recommendations)], // Remove duplicates
    },
  };
}

// Simulate dial metrics (in production, this would come from your call system)
export function simulateDialMetrics() {
  const totalDials = Math.floor(Math.random() * 5000) + 100;
  const daysActive = Math.floor(Math.random() * 180) + 1;
  const dailyAverage = Math.floor(totalDials / daysActive);
  const daysSinceLastDial = Math.floor(Math.random() * 60);
  
  const lastDialDate = new Date();
  lastDialDate.setDate(lastDialDate.getDate() - daysSinceLastDial);
  
  return {
    totalDials,
    dailyAverage,
    lastDialDate: lastDialDate.toISOString(),
    daysSinceLastDial,
  };
}