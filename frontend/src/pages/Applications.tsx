import React, { useState } from 'react';
import { JobApplication, ApplicationStatus } from '../types';
import { mockApplications } from '../utils/mockData';
import KanbanBoard from '../components/kanban/KanbanBoard';
import ApplicationsTable from '../components/applications/ApplicationsTable';
import AddApplicationForm from '../components/forms/AddApplicationForm';
import { Grid, List, Plus, BarChart3 } from 'lucide-react';

type ViewMode = 'kanban' | 'table';

const Applications: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>(mockApplications);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | undefined>();

  const handleAddApplication = (formData: any) => {
    const newApplication: JobApplication = {
      id: Date.now().toString(),
      userId: '1', // Mock user ID
      companyName: formData.companyName,
      positionTitle: formData.positionTitle,
      location: formData.location,
      jobUrl: formData.jobUrl,
      salaryRange: formData.salaryRange,
      techStack: formData.techStack,
      status: 'Applied',
      visaSponsorship: formData.visaSponsorship,
      germanRequirement: formData.germanRequirement as any,
      relocationSupport: formData.relocationSupport,
      jobBoardSource: formData.jobBoardSource,
      priorityStars: formData.priorityStars,
      notes: formData.notes,
      appliedDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setApplications(prev => [...prev, newApplication]);

    alert(`Application added successfully! 🎉\n\n${formData.companyName} - ${formData.positionTitle}\nYou earned +2 points!`);
  };

  const handleEditApplication = (application: JobApplication) => {
    setEditingApplication(application);
    setShowAddForm(true);
  };

  const handleUpdateApplication = (formData: any) => {
    if (editingApplication) {
      const updatedApplication: JobApplication = {
        ...editingApplication,
        companyName: formData.companyName,
        positionTitle: formData.positionTitle,
        location: formData.location,
        jobUrl: formData.jobUrl,
        salaryRange: formData.salaryRange,
        techStack: formData.techStack,
        visaSponsorship: formData.visaSponsorship,
        germanRequirement: formData.germanRequirement as any,
        relocationSupport: formData.relocationSupport,
        jobBoardSource: formData.jobBoardSource,
        priorityStars: formData.priorityStars,
        notes: formData.notes,
        updatedAt: new Date().toISOString()
      };

      setApplications(prev =>
        prev.map(app =>
          app.id === editingApplication.id ? updatedApplication : app
        )
      );

      alert(`Application updated successfully! ✓\n\n${formData.companyName} - ${formData.positionTitle}`);
    }
  };

  const handleDeleteApplication = (applicationId: string) => {
    setApplications(prev => prev.filter(app => app.id !== applicationId));
    alert('Application deleted successfully.');
  };

  const handleStatusUpdate = (applicationId: string, newStatus: ApplicationStatus) => {
    setApplications(prev =>
      prev.map(app =>
        app.id === applicationId
          ? { ...app, status: newStatus, updatedAt: new Date().toISOString() }
          : app
      )
    );
  };

  const handleFormSubmit = (formData: any) => {
    if (editingApplication) {
      handleUpdateApplication(formData);
    } else {
      handleAddApplication(formData);
    }
    setShowAddForm(false);
    setEditingApplication(undefined);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingApplication(undefined);
  };

  // Get stats for the header
  const stats = {
    total: applications.length,
    applied: applications.filter(app => app.status === 'Applied').length,
    interviews: applications.filter(app =>
      ['Phone Screen', 'Technical Round 1', 'Technical Round 2', 'Final Round'].includes(app.status)
    ).length,
    offers: applications.filter(app => app.status === 'Offer').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Job Applications</h1>
            <p className="text-gray-600">Track and manage your job search applications</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Application
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-blue-800">Total Applications</div>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">{stats.applied}</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{stats.applied}</div>
                <div className="text-sm text-purple-800">Applied</div>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">{stats.interviews}</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{stats.interviews}</div>
                <div className="text-sm text-yellow-800">Interviews</div>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">{stats.offers}</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.offers}</div>
                <div className="text-sm text-green-800">Offers</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white rounded-xl p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid className="w-4 h-4" />
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
              Table View
            </button>
          </div>
          <div className="text-sm text-gray-600">
            {viewMode === 'kanban' ? 'Visual board view' : 'Detailed list view'}
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          applications={applications}
          onStatusUpdate={handleStatusUpdate}
          onEdit={handleEditApplication}
          onDelete={handleDeleteApplication}
        />
      ) : (
        <ApplicationsTable
          applications={applications}
          onEdit={handleEditApplication}
          onDelete={handleDeleteApplication}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <AddApplicationForm
          onSubmit={handleFormSubmit}
          onClose={handleCloseForm}
          initialData={editingApplication ? {
            companyName: editingApplication.companyName,
            positionTitle: editingApplication.positionTitle,
            location: editingApplication.location,
            jobUrl: editingApplication.jobUrl,
            salaryRange: editingApplication.salaryRange,
            techStack: editingApplication.techStack,
            visaSponsorship: editingApplication.visaSponsorship,
            germanRequirement: editingApplication.germanRequirement,
            relocationSupport: editingApplication.relocationSupport,
            jobBoardSource: editingApplication.jobBoardSource,
            priorityStars: editingApplication.priorityStars,
            notes: editingApplication.notes
          } : undefined}
        />
      )}
    </div>
  );
};

export default Applications;