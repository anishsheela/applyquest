import React from 'react';
import {
  Briefcase,
  TrendingUp,
  Users,
  Target,
  Award,
  Clock
} from 'lucide-react';

interface MetricsData {
  total: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
  rejected: number;
  ghosted: number;
}

interface KeyMetricsCardsProps {
  metrics: MetricsData;
}

const KeyMetricsCards: React.FC<KeyMetricsCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <div className="bg-white rounded-xl p-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 rounded-full p-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{metrics.total}</div>
            <div className="text-xs text-blue-800">Total Applications</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 rounded-full p-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{metrics.responseRate}%</div>
            <div className="text-xs text-green-800">Response Rate</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-100 rounded-full p-2">
            <Users className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">{metrics.interviewRate}%</div>
            <div className="text-xs text-yellow-800">Interview Rate</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 rounded-full p-2">
            <Award className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{metrics.offerRate}%</div>
            <div className="text-xs text-purple-800">Offer Rate</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 rounded-full p-2">
            <Target className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{metrics.rejected}</div>
            <div className="text-xs text-red-800">Rejected</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 rounded-full p-2">
            <Clock className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">{metrics.ghosted}</div>
            <div className="text-xs text-gray-800">Ghosted</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyMetricsCards;