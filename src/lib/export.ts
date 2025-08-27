import { ReputationCheck } from '@/types';

export function exportToCSV(results: ReputationCheck[]): void {
  const headers = [
    'Phone Number',
    'Health Grade',
    'Health Score',
    'Valid',
    'Carrier',
    'Line Type',
    'City',
    'State',
    'Country',
    'Risk Level',
    'Spam Score',
    'Spam Likely',
    'Scam Likely',
    'STIR/SHAKEN Level',
    'Flagged By Carriers',
    'CNAM Registered',
    'CNAM Display Name',
    'Disconnected',
    'Reassigned',
    'Recommendations',
    'Checked At'
  ];

  const rows = results.map(result => [
    result.phoneNumber,
    result.healthScore?.grade || '',
    result.healthScore?.score || '',
    result.isValid ? 'Yes' : 'No',
    result.carrier || '',
    result.lineType || '',
    result.location?.city || '',
    result.location?.state || '',
    result.location?.country || '',
    result.reputation.riskLevel,
    result.reputation.spamScore?.toFixed(2) || '',
    result.reputation.spamLikely ? 'Yes' : 'No',
    result.reputation.scamLikely ? 'Yes' : 'No',
    result.reputation.attestationLevel || '',
    result.reputation.flaggedByCarriers.join('; ') || '',
    result.cnam?.registered === null ? 'N/A' : result.cnam?.registered ? 'Yes' : 'No',
    result.cnam?.displayName || '',
    result.disconnected ? 'Yes' : 'No',
    result.reassigned ? 'Yes' : 'No',
    result.healthScore?.recommendations?.join('; ') || '',
    new Date(result.timestamp).toISOString()
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `phone-reputation-${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}