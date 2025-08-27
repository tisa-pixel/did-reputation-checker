'use client';

import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import SingleNumberForm from '@/components/SingleNumberForm';
import FileUpload from '@/components/FileUpload';
import ResultsTable from '@/components/ResultsTable';
import HealthSummary from '@/components/HealthSummary';
import { PhoneValidator } from '@/lib/phone-validator';
import { exportToCSV } from '@/lib/export';
import { ReputationCheck } from '@/types';
import { Phone, Upload, Shield, AlertCircle } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [results, setResults] = useState<ReputationCheck[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSingleCheck = async (phoneNumber: string) => {
    setIsLoading(true);
    try {
      const result = await PhoneValidator.validateSingle(phoneNumber);
      setResults([result]);
      
      if (result.reputation.riskLevel === 'high') {
        toast.error('⚠️ High risk number detected!');
      } else if (result.reputation.spamLikely || result.reputation.scamLikely) {
        toast('⚠️ This number has been flagged', {
          icon: '⚠️',
          style: {
            background: '#FEF3C7',
            color: '#92400E',
          },
        });
      } else {
        toast.success('Number checked successfully');
      }
    } catch (error) {
      toast.error('Failed to check phone number');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkCheck = async (phoneNumbers: string[]) => {
    setIsLoading(true);
    setResults([]);
    
    try {
      toast.loading(`Checking ${phoneNumbers.length} numbers...`, { id: 'bulk-check' });
      
      const batchSize = 10;
      const allResults: ReputationCheck[] = [];
      
      for (let i = 0; i < phoneNumbers.length; i += batchSize) {
        const batch = phoneNumbers.slice(i, i + batchSize);
        const batchResults = await PhoneValidator.validateBulk(batch);
        allResults.push(...batchResults);
        
        setResults([...allResults]);
        
        toast.loading(
          `Processed ${Math.min(i + batchSize, phoneNumbers.length)} of ${phoneNumbers.length} numbers...`,
          { id: 'bulk-check' }
        );
      }
      
      toast.success(`Successfully checked ${allResults.length} numbers`, { id: 'bulk-check' });
      
      const highRiskCount = allResults.filter(r => r.reputation.riskLevel === 'high').length;
      if (highRiskCount > 0) {
        toast.error(`Found ${highRiskCount} high-risk numbers!`);
      }
    } catch (error) {
      toast.error('Failed to check phone numbers', { id: 'bulk-check' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (results.length > 0) {
      exportToCSV(results);
      toast.success('Results exported to CSV');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    DID Reputation Checker
                  </h1>
                  <p className="text-sm text-gray-500">
                    Check phone numbers for spam, scam, and attestation ratings
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-1.5 rounded-md">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  {results.length > 0 ? `${results.length} checked` : 'Ready'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex space-x-1 mb-6">
              <button
                onClick={() => setActiveTab('single')}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'single'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Phone className="h-4 w-4 mr-2" />
                Single Number
              </button>
              <button
                onClick={() => setActiveTab('bulk')}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'bulk'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </button>
            </div>
            
            <div className="mb-8">
              {activeTab === 'single' ? (
                <SingleNumberForm 
                  onSubmit={handleSingleCheck}
                  isLoading={isLoading}
                />
              ) : (
                <FileUpload 
                  onNumbersExtracted={handleBulkCheck}
                />
              )}
            </div>
            
            {results.length === 1 && results[0] && (
              <HealthSummary result={results[0]} />
            )}
            
            {results.length > 0 && (
              <ResultsTable 
                results={results}
                onExport={handleExport}
              />
            )}
          </div>
        </div>
        
        <div className="mt-8 bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Understanding the Results
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-blue-800">
            <div>
              <strong>Risk Levels:</strong>
              <ul className="mt-1 space-y-1">
                <li>🟢 Low: Safe to use</li>
                <li>🟡 Medium: Monitor closely</li>
                <li>🔴 High: Consider replacing</li>
              </ul>
            </div>
            <div>
              <strong>STIR/SHAKEN:</strong>
              <ul className="mt-1 space-y-1">
                <li>A: Full attestation (best)</li>
                <li>B: Partial attestation</li>
                <li>C: Gateway attestation</li>
              </ul>
            </div>
            <div>
              <strong>Actions:</strong>
              <ul className="mt-1 space-y-1">
                <li>Register CNAM for all numbers</li>
                <li>Replace high-risk numbers</li>
                <li>Monitor flagged carriers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
