import React, { useState } from 'react';
import { Briefcase, MapPin, Star, Calendar, ExternalLink, Edit, Trash2, ChevronRight } from 'lucide-react';

interface Application {
  id: string;
  companyName: string;
  positionTitle: string;
  location: string;
  status: string;
  priorityStars: number;
  appliedDate: string;
  jobUrl?: string;
  salaryRange?: string;
  techStack?: string;
  visaSponsorship: boolean;
  germanRequirement: string;
}

const KanbanBoard: React.FC = () => {
  const stages = [
    { id: 'applied', name: 'Applied', color: 'bg-blue-500' },
    { id: 'replied', name: 'Replied', color: 'bg-purple-500' },
    { id: 'phone', name: 'Phone Screen', color: 'bg-yellow-500' },
    { id: 'tech1', name: 'Technical 1', color: 'bg-orange-500' },
    { id: 'tech2', name: 'Technical 2', color: 'bg-pink-500' },
    { id: 'final', name: 'Final Round', color: 'bg-indigo-500' },
    { id: 'offer', name: 'Offer', color: 'bg-green-500' },
    { id: 'rejected', name: 'Rejected', color: 'bg-red-500' },
    { id: 'ghosted', name: 'Ghosted', color: 'bg-gray-500' },
  ];

  const [applications, setApplications] = useState<Application[]>([
    {
      id: '1',
      companyName: 'SAP',
      positionTitle: 'Full Stack Developer',
      location: 'Berlin',
      status: 'phone',
      priorityStars: 5,
      appliedDate: '2025-01-15',
      jobUrl: 'https://linkedin.com/jobs/123',
      salaryRange: '60000-80000',
      techStack: 'React, Python, PostgreSQL',
      visaSponsorship: true,
      germanRequirement: 'Basic',
    },
    {
      id: '2',
      companyName: 'Siemens',
      positionTitle: 'Backend Engineer',
      location: 'Munich',
      status: 'applied',
      priorityStars: 4,
      appliedDate: '2025-01-18',
      salaryRange: '65000-85000',
      techStack: 'Python, Django, Docker',
      visaSponsorship: true,
      germanRequirement: 'None',
    },
    {
      id: '3',
      companyName: 'BMW',
      positionTitle: 'Software Developer',
      location: 'Munich',
      status: 'tech1',
      priorityStars: 5,
      appliedDate: '2025-01-10',
      salaryRange: '70000-90000',
      techStack: 'Java, Spring, Kubernetes',
      visaSponsorship: true,
      germanRequirement: 'Fluent',
    },
    {
      id: '4',
      companyName: 'Zalando',
      positionTitle: 'Frontend Developer',
      location: 'Berlin',
      status: 'replied',
      priorityStars: 3,
      appliedDate: '2025-01-12',
      salaryRange: '55000-75000',
      techStack: 'React, TypeScript, Next.js',
      visaSponsorship: false,
      germanRequirement: 'Basic',
    },
    {
      id: '5',
      companyName: 'Deutsche Bank',
      positionTitle: 'Data Engineer',
      location: 'Frankfurt',
      status: 'rejected',
      priorityStars: 4,
      appliedDate: '2025-01-08',
      salaryRange: '65000-85000',
      techStack: 'Python, Spark, Airflow',
      visaSponsorship: true,
      germanRequirement: 'None',
    },
  ]);

  const [draggedItem, setDraggedItem] = useState<Application | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const handleDragStart = (app: Application) => {
    setDraggedItem(app);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stageId: string) => {
    if (draggedItem) {
      setApplications(applications.map(app =>
        app.id === draggedItem.id
          ? { ...app, status: stageId }
          : app
      ));
      setDraggedItem(null);
    }
  };

  const getApplicationsByStage = (stageId: string) => {
    return applications.filter(app => app.status === stageId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      setApplications(applications.filter(app => app.id !== id));
    }
  };

  const handleQuickStatus = (id: string, newStatus: string) => {
    setApplications(applications.map(app =>
      app.id === id ? { ...app, status: newStatus } : app
    ));
  };

  return (
    <div>
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Application Board</h1>
          <p className="text-gray-600">Drag and drop applications to update their status</p>
          <div className="mt-4 flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-600">Early Stage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-gray-600">Interview Process</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600">Success</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span className="text-gray-600">No Response</span>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageApps = getApplicationsByStage(stage.id);

            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-80"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage.id)}
              >
                {/* Column Header */}
                <div className={`${stage.color} text-white rounded-lg p-4 mb-3 shadow-md`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">{stage.name}</h3>
                    <span className="bg-white bg-opacity-30 rounded-full px-3 py-1 text-sm font-semibold">
                      {stageApps.length}
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 min-h-[200px]">
                  {stageApps.length === 0 && (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                      <p className="text-gray-400 text-sm">Drop applications here</p>
                    </div>
                  )}

                  {stageApps.map((app) => (
                    <div
                      key={app.id}
                      draggable
                      onDragStart={() => handleDragStart(app)}
                      className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-all cursor-move border-2 border-transparent hover:border-blue-300"
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 mb-1">{app.companyName}</h4>
                          <p className="text-sm text-gray-600">{app.positionTitle}</p>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(app.priorityStars)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span>{app.location}</span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {app.visaSponsorship && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                            Visa
                          </span>
                        )}
                        {app.germanRequirement !== 'None' && (
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                            German: {app.germanRequirement}
                          </span>
                        )}
                        {app.salaryRange && (
                          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                            €{app.salaryRange}
                          </span>
                        )}
                      </div>

                      {/* Tech Stack */}
                      {app.techStack && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Tech Stack:</p>
                          <p className="text-xs text-gray-700 truncate">{app.techStack}</p>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(app.appliedDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {app.jobUrl && (
                            <button
                              onClick={() => window.open(app.jobUrl, '_blank')}
                              className="text-blue-500 hover:text-blue-700 p-1"
                              title="Open job posting"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="text-gray-500 hover:text-blue-700 p-1"
                            title="View details"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="text-gray-500 hover:text-red-700 p-1"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Quick Action Buttons */}
                      {app.status !== 'rejected' && app.status !== 'ghosted' && (
                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => handleQuickStatus(app.id, 'rejected')}
                            className="flex-1 bg-red-50 text-red-700 text-xs py-2 rounded-lg hover:bg-red-100 transition-colors font-medium"
                          >
                            Mark Rejected
                          </button>
                          <button
                            onClick={() => handleQuickStatus(app.id, 'ghosted')}
                            className="flex-1 bg-gray-50 text-gray-700 text-xs py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                          >
                            Mark Ghosted
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Modal */}
        {selectedApp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{selectedApp.companyName}</h2>
                    <p className="text-blue-100">{selectedApp.positionTitle}</p>
                  </div>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="font-medium text-gray-800">{selectedApp.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Applied Date</p>
                    <p className="font-medium text-gray-800">{formatDate(selectedApp.appliedDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Salary Range</p>
                    <p className="font-medium text-gray-800">€{selectedApp.salaryRange || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Priority</p>
                    <div className="flex gap-1">
                      {[...Array(selectedApp.priorityStars)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>

                {selectedApp.techStack && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tech Stack</p>
                    <p className="font-medium text-gray-800">{selectedApp.techStack}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Visa Sponsorship</p>
                    <p className="font-medium text-gray-800">{selectedApp.visaSponsorship ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">German Requirement</p>
                    <p className="font-medium text-gray-800">{selectedApp.germanRequirement}</p>
                  </div>
                </div>

                {selectedApp.jobUrl && (
                  <div>
                    <a
                      href={selectedApp.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Job Posting
                    </a>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;