'use client';

import { ReputationCheck } from '@/types';
import { AlertTriangle, TrendingUp, Activity, Shield } from 'lucide-react';

interface HealthSummaryProps {
  result: ReputationCheck;
}

export default function HealthSummary({ result }: HealthSummaryProps) {
  if (!result.healthScore) return null;

  const { score, grade, factors, recommendations } = result.healthScore;

  const getGradeColor = (grade: string) => {
    switch(grade) {
      case 'A': return 'text-green-600 bg-green-50';
      case 'B': return 'text-blue-600 bg-blue-50';
      case 'C': return 'text-yellow-600 bg-yellow-50';
      case 'D': return 'text-orange-600 bg-orange-50';
      case 'F': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Health Analysis</h3>
        <div className={`px-4 py-2 rounded-lg font-bold text-2xl ${getGradeColor(grade)}`}>
          Grade: {grade}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{score}%</div>
          <div className="text-xs text-gray-500">Overall Score</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-700">
            {factors.carrierQuality}/20
          </div>
          <div className="text-xs text-gray-500">Carrier</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-700">
            {factors.attestation}/25
          </div>
          <div className="text-xs text-gray-500">Attestation</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-700">
            {factors.spamRisk}/30
          </div>
          <div className="text-xs text-gray-500">Spam Risk</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-700">
            {factors.dialActivity}/15
          </div>
          <div className="text-xs text-gray-500">Activity</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-gray-400" />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {result.reputation.attestationLevel || 'Unknown'}
            </div>
            <div className="text-xs text-gray-500">STIR/SHAKEN</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-gray-400" />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {result.carrier || 'Unknown'}
            </div>
            <div className="text-xs text-gray-500">Carrier</div>
          </div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Recommendations</h4>
          <ul className="space-y-2">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">•</span>
                <span className="text-sm text-gray-600">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}