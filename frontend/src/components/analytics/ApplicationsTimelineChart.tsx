import React from 'react';
import { BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TimelineData {
  date: string;
  applications: number;
  responded: number;
}

interface ApplicationsTimelineChartProps {
  timelineData: TimelineData[];
}

const ApplicationsTimelineChart: React.FC<ApplicationsTimelineChartProps> = ({ timelineData }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full p-3">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Applications Over Time</h2>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="applications"
              stackId="1"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="responded"
              stackId="2"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.8}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-600">Applications</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-600">Responses</span>
        </div>
      </div>
    </div>
  );
};

export default ApplicationsTimelineChart;