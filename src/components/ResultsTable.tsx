'use client';

import { ReputationCheck } from '@/types';
import { CheckCircle, XCircle, AlertTriangle, Download } from 'lucide-react';

interface ResultsTableProps {
  results: ReputationCheck[];
  onExport: () => void;
}

export default function ResultsTable({ results, onExport }: ResultsTableProps) {
  if (results.length === 0) return null;

  const getRiskBadge = (risk: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
      unknown: 'bg-gray-100 text-gray-800',
    };
    return colors[risk as keyof typeof colors] || colors.unknown;
  };

  const getAttestationBadge = (level?: string) => {
    if (!level) return null;
    const colors = {
      A: 'bg-green-100 text-green-800',
      B: 'bg-yellow-100 text-yellow-800',
      C: 'bg-orange-100 text-orange-800',
      unknown: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[level as keyof typeof colors] || colors.unknown}`}>
        Level {level}
      </span>
    );
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Results ({results.length})</h2>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Health
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valid
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Carrier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Risk Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Spam/Scam
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                STIR/SHAKEN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Flagged By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CNAM
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((result, index) => (
              <tr key={index} className={result.reputation.riskLevel === 'high' ? 'bg-red-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {result.phoneNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {result.healthScore ? (
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${
                        result.healthScore.grade === 'A' ? 'bg-green-100 text-green-800' :
                        result.healthScore.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                        result.healthScore.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                        result.healthScore.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.healthScore.grade}
                      </span>
                      <span className="text-xs text-gray-500">
                        {result.healthScore.score}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {result.isValid ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {result.carrier || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskBadge(result.reputation.riskLevel)}`}>
                    {result.reputation.riskLevel}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {result.reputation.spamLikely || result.reputation.scamLikely ? (
                    <div className="flex gap-1">
                      {result.reputation.spamLikely && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Spam</span>
                      )}
                      {result.reputation.scamLikely && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Scam</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">Clean</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getAttestationBadge(result.reputation.attestationLevel)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {result.reputation.flaggedByCarriers.length > 0 
                    ? result.reputation.flaggedByCarriers.join(', ')
                    : '-'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {result.cnam?.registered === null ? (
                    <span className="text-gray-400 italic">N/A via IPQS</span>
                  ) : result.cnam?.registered ? (
                    <span className="text-green-600">{result.cnam.displayName || 'Registered'}</span>
                  ) : (
                    <span className="text-gray-400">Not registered</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}