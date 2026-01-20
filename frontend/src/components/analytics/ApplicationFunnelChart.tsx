import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { JobApplication } from '../../types';

interface ApplicationFunnelChartProps {
  applications: JobApplication[];
}

const ApplicationFunnelChart: React.FC<ApplicationFunnelChartProps> = ({ applications }) => {
  const funnelData = useMemo(() => {
    const stages = [
      { name: 'Applied', status: 'Applied', color: '#3B82F6' },
      { name: 'Replied', statuses: ['Replied'], color: '#8B5CF6' },
      { name: 'Phone Screen', status: 'Phone Screen', color: '#F59E0B' },
      { name: 'Technical 1', status: 'Technical Round 1', color: '#F97316' },
      { name: 'Technical 2', status: 'Technical Round 2', color: '#EF4444' },
      { name: 'Final Round', status: 'Final Round', color: '#8B5CF6' },
      { name: 'Offer', status: 'Offer', color: '#10B981' }
    ];

    const stageCounts = stages.map((stage, index) => {
      let count = 0;
      if (stage.status) {
        count = applications.filter(app => app.status === stage.status).length;
      } else if (stage.statuses) {
        count = applications.filter(app => stage.statuses!.includes(app.status)).length;
      }

      const previousCount = index > 0 ? stages.slice(0, index).reduce((sum, s) => {
        if (s.status) return sum + applications.filter(app => app.status === s.status).length;
        if (s.statuses) return sum + applications.filter(app => s.statuses!.includes(app.status)).length;
        return sum;
      }, 0) : applications.length;

      const conversionRate = previousCount > 0 ? Math.round((count / previousCount) * 100) : 0;

      return {
        stage: stage.name,
        count,
        conversionRate,
        width: Math.max(20, (count / Math.max(...stages.map(s => {
          if (s.status) return applications.filter(app => app.status === s.status).length;
          if (s.statuses) return applications.filter(app => s.statuses!.includes(app.status)).length;
          return 0;
        }))) * 100),
        color: stage.color
      };
    });

    return stageCounts;
  }, [applications]);

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-3">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Application Funnel</h2>
      </div>

      <div className="h-80">
        <div className="h-full flex flex-col justify-center">
          <div className="space-y-2">
            {funnelData.map((item, index) => (
              <div key={item.stage} className="relative">
                {/* Funnel step */}
                <div className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-gray-600 text-right">
                    {item.stage}
                  </div>
                  <div className="flex-1 relative">
                    <div
                      className="h-8 rounded transition-all duration-300 flex items-center justify-center text-white font-bold text-sm shadow-md"
                      style={{
                        width: `${item.width}%`,
                        backgroundColor: item.color,
                        marginLeft: `${(100 - item.width) / 2}%`
                      }}
                    >
                      {item.count}
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-600 text-center">
                    {item.conversionRate}%
                  </div>
                </div>

                {/* Conversion arrow */}
                {index < funnelData.length - 1 && (
                  <div className="flex justify-center mt-1 mb-1">
                    <div className="text-xs text-gray-400">↓</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Shows conversion rates between each stage of your job application process
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationFunnelChart;