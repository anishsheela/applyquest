import React from 'react';
import { Briefcase } from 'lucide-react';

interface CompanyData {
  company: string;
  applications: number;
  offers: number;
  successRate: number;
}

interface TopCompaniesAnalysisProps {
  companyData: CompanyData[];
}

const TopCompaniesAnalysis: React.FC<TopCompaniesAnalysisProps> = ({ companyData }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-full p-3">
          <Briefcase className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Industry Analysis</h2>
      </div>

      <div className="space-y-3">
        {companyData.map((industry, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-purple-600">
                {index + 1}
              </div>
              <div>
                <div className="font-medium text-gray-800">{industry.company}</div>
                <div className="text-sm text-gray-500">{industry.applications} applications</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-green-600">{industry.successRate}% response rate</div>
              <div className="text-sm text-gray-500">{industry.offers} offers</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-600">
          Industries ranked by application volume and response rates
        </p>
      </div>
    </div>
  );
};

export default TopCompaniesAnalysis;