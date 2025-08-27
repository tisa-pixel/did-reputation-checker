'use client';

import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { Upload, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onNumbersExtracted: (numbers: string[]) => void;
}

export default function FileUpload({ onNumbersExtracted }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
      } else {
        toast.error('Please upload a CSV file');
      }
    }
  };

  const processFile = useCallback(() => {
    if (!file) return;

    setIsProcessing(true);
    
    Papa.parse(file, {
      complete: (results) => {
        const numbers: string[] = [];
        
        results.data.forEach((row: any) => {
          if (Array.isArray(row)) {
            row.forEach(cell => {
              const cleaned = String(cell).trim();
              if (cleaned && /\d{10,}/.test(cleaned.replace(/\D/g, ''))) {
                numbers.push(cleaned);
              }
            });
          } else if (typeof row === 'object') {
            Object.values(row).forEach(cell => {
              const cleaned = String(cell).trim();
              if (cleaned && /\d{10,}/.test(cleaned.replace(/\D/g, ''))) {
                numbers.push(cleaned);
              }
            });
          }
        });

        if (numbers.length > 0) {
          onNumbersExtracted(numbers);
          toast.success(`Found ${numbers.length} phone numbers`);
        } else {
          toast.error('No valid phone numbers found in CSV');
        }
        
        setIsProcessing(false);
      },
      error: (error) => {
        toast.error('Error parsing CSV: ' + error.message);
        setIsProcessing(false);
      }
    });
  }, [file, onNumbersExtracted]);

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="w-full">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        {!file ? (
          <label className="flex flex-col items-center justify-center cursor-pointer">
            <Upload className="h-12 w-12 text-gray-400 mb-3" />
            <span className="text-sm font-medium text-gray-700">
              Click to upload CSV file
            </span>
            <span className="text-xs text-gray-500 mt-1">
              CSV files with phone numbers
            </span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-10 w-10 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-700">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={processFile}
                disabled={isProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Process'}
              </button>
              <button
                onClick={removeFile}
                className="p-2 text-red-500 hover:bg-red-50 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}