import React, { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { JobApplication } from '../../types';

interface TechStackAnalysisProps {
  applications: JobApplication[];
}

const TechStackAnalysis: React.FC<TechStackAnalysisProps> = ({ applications }) => {
  const techData = useMemo(() => {
    const techMap = new Map<string, { count: number; offers: number }>();

    applications.forEach(app => {
      if (app.techStack) {
        // Split tech stack by common separators and clean up
        const techs = app.techStack.split(/[,/&+]+/).map(tech => tech.trim());

        techs.forEach(tech => {
          if (tech && tech.length > 1) { // Filter out empty/short strings
            const existing = techMap.get(tech) || { count: 0, offers: 0 };
            existing.count++;
            if (app.status === 'Offer') {
              existing.offers++;
            }
            techMap.set(tech, existing);
          }
        });
      }
    });

    return Array.from(techMap.entries())
      .map(([tech, data]) => ({
        tech,
        count: data.count,
        offers: data.offers,
        successRate: data.count > 0 ? Math.round((data.offers / data.count) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12); // Top 12 technologies
  }, [applications]);

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6366F1',
    '#14B8A6', '#F59E0B'
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full p-3">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Tech Stack Analysis</h2>
      </div>

      <div className="space-y-4">
        {techData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No tech stack data available</p>
          </div>
        ) : (
          <>
            {/* Top Tech Stack Chart */}
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={techData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="tech" type="category" width={80} fontSize={12} />
                  <Tooltip
                    formatter={(value: number | undefined, name: string | undefined) => [
                      name === 'count' ? `${value || 0} applications` : `${value || 0} offers`,
                      name === 'count' ? 'Applications' : 'Offers'
                    ]}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="offers" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tech Stack List */}
            <div className="grid grid-cols-2 gap-2">
              {techData.map((item, index) => (
                <div key={item.tech} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{item.tech}</div>
                    <div className="text-xs text-gray-500">{item.count} apps, {item.successRate}% success</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t text-center">
              <p className="text-xs text-gray-600">
                Technologies from your job applications ranked by frequency and success rates
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TechStackAnalysis;