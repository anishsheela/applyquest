import React, { useState } from 'react';
import { User, JobApplication, NetworkContact } from '../types';
import { mockUser, mockApplications, mockContacts } from '../utils/mockData';
import {
  User as UserIcon,
  Mail,
  GraduationCap,
  Languages,
  Briefcase,
  Trophy,
  Flame,
  Calendar,
  Download,
  Settings,
  Edit2,
  Save,
  X,
  Award,
  TrendingUp
} from 'lucide-react';

const Profile: React.FC = () => {
  const [user, setUser] = useState<User>(mockUser);
  const [applications] = useState<JobApplication[]>(mockApplications);
  const [contacts] = useState<NetworkContact[]>(mockContacts);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    email: user.email,
    currentEducation: user.currentEducation,
    germanLevel: user.germanLevel,
    currentRole: user.currentRole
  });

  const germanLevels = ['None', 'Basic', 'Fluent'];

  const handleEditSave = () => {
    setUser(prev => ({
      ...prev,
      ...editForm
    }));
    setIsEditing(false);
    alert('Profile updated successfully! ✓');
  };

  const handleEditCancel = () => {
    setEditForm({
      name: user.name,
      email: user.email,
      currentEducation: user.currentEducation,
      germanLevel: user.germanLevel,
      currentRole: user.currentRole
    });
    setIsEditing(false);
  };

  const handleExportData = () => {
    const exportData = {
      user,
      applications,
      contacts,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `applyquest-data-${user.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    alert('Data exported successfully! 📁');
  };

  const getLevelProgress = () => {
    const currentLevelMinPoints = (user.level - 1) * 200; // Assuming 200 points per level
    const nextLevelMinPoints = user.level * 200;
    const progress = ((user.points - currentLevelMinPoints) / (nextLevelMinPoints - currentLevelMinPoints)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const getNextLevelPoints = () => {
    return user.level * 200;
  };

  const stats = {
    totalApplications: applications.length,
    activeApplications: applications.filter(app =>
      !['Rejected', 'Ghosted'].includes(app.status)
    ).length,
    offersReceived: applications.filter(app => app.status === 'Offer').length,
    responseRate: applications.length > 0
      ? Math.round((applications.filter(app => app.status !== 'Applied').length / applications.length) * 100)
      : 0,
    totalContacts: contacts.length,
    strongConnections: contacts.filter(contact => contact.connectionStrength >= 4).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Profile Settings</h1>
            <p className="text-gray-600">Manage your profile, view statistics, and export your data</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full p-3">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Profile Information</h2>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Education
                    </label>
                    <input
                      type="text"
                      value={editForm.currentEducation}
                      onChange={(e) => setEditForm(prev => ({ ...prev, currentEducation: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      German Language Level
                    </label>
                    <select
                      value={editForm.germanLevel}
                      onChange={(e) => setEditForm(prev => ({ ...prev, germanLevel: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {germanLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Role
                  </label>
                  <input
                    type="text"
                    value={editForm.currentRole}
                    onChange={(e) => setEditForm(prev => ({ ...prev, currentRole: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleEditSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleEditCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <UserIcon className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium text-gray-800">{user.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-800">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Education</p>
                      <p className="font-medium text-gray-800">{user.currentEducation}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Languages className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">German Level</p>
                      <p className="font-medium text-gray-800">{user.germanLevel}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Briefcase className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Current Role</p>
                    <p className="font-medium text-gray-800">{user.currentRole}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Job Search Statistics */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full p-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Job Search Statistics</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.totalApplications}</div>
                <div className="text-sm text-blue-800">Total Applications</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">{stats.activeApplications}</div>
                <div className="text-sm text-purple-800">Active Applications</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-600">{stats.offersReceived}</div>
                <div className="text-sm text-yellow-800">Offers Received</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{stats.responseRate}%</div>
                <div className="text-sm text-green-800">Response Rate</div>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-indigo-600">{stats.totalContacts}</div>
                <div className="text-sm text-indigo-800">Network Contacts</div>
              </div>
              <div className="bg-pink-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-pink-600">{stats.strongConnections}</div>
                <div className="text-sm text-pink-800">Strong Connections</div>
              </div>
            </div>
          </div>
        </div>

        {/* Gamification & Actions */}
        <div className="space-y-6">
          {/* Gamification Stats */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-3">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Gamification</h2>
            </div>

            <div className="space-y-4">
              {/* Level & Points */}
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-1">Level {user.level}</div>
                <div className="text-lg text-gray-600 mb-2">{user.levelName}</div>
                <div className="text-2xl font-bold text-blue-600">{user.points} pts</div>
                <div className="text-sm text-gray-500 mb-3">
                  {getNextLevelPoints() - user.points} points to next level
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getLevelProgress()}%` }}
                  ></div>
                </div>
              </div>

              {/* Streaks */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="text-2xl font-bold text-orange-600">{user.currentStreak}</span>
                  </div>
                  <div className="text-sm text-gray-600">Current Streak</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-purple-500" />
                    <span className="text-2xl font-bold text-purple-600">{user.longestStreak}</span>
                  </div>
                  <div className="text-sm text-gray-600">Best Streak</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-full p-3">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Actions</h2>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleExportData}
                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Download className="w-5 h-5" />
                Export All Data
                <span className="ml-auto text-sm bg-blue-400 px-2 py-1 rounded">JSON</span>
              </button>

              <div className="pt-3 border-t">
                <p className="text-xs text-gray-500 mb-2">Export includes:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Your profile information</li>
                  <li>• All job applications</li>
                  <li>• Network contacts</li>
                  <li>• Gamification statistics</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full p-3">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Account</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Member since:</span>
                <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account ID:</span>
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{user.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;