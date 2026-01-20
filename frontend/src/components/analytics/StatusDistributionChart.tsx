import React from 'react';
import { PieChart as PieChartIcon } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ApplicationStatus } from '../../types';

interface StatusData {
  name: string;
  value: number;
  percentage: number;
  [key: string]: any;
}

interface StatusDistributionChartProps {
  statusData: StatusData[];
}

const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({ statusData }) => {
  // Colors for status chart
  const statusColors: Record<ApplicationStatus, string> = {
    'Applied': '#3B82F6',
    'Replied': '#8B5CF6',
    'Phone Screen': '#F59E0B',
    'Technical Round 1': '#F97316',
    'Technical Round 2': '#EF4444',
    'Final Round': '#8B5CF6',
    'Offer': '#10B981',
    'Rejected': '#EF4444',
    'Ghosted': '#6B7280'
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full p-3">
          <PieChartIcon className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Application Status Distribution</h2>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={statusColors[entry.name as ApplicationStatus] || '#6B7280'} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number | undefined, name: string | undefined) => [
                `${value || 0} applications (${statusData.find(d => d.name === name)?.percentage || 0}%)`,
                name || ''
              ]}
            />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {statusData.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: statusColors[item.name as ApplicationStatus] }}
            ></div>
            <span className="text-gray-600">{item.name}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusDistributionChart;