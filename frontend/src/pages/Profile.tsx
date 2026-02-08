import React, { useState } from 'react';
import { User } from '../types';
import { useAppContext } from '../context/AppContext';
import { userService } from '../services/api';
import UserProfile from '../components/profile/UserProfile';
import ExperienceLevels from '../components/gamification/ExperienceLevels';
import { Trophy, TrendingUp, Target, Award } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, setUser, applications, contacts, loading } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  const handleEditProfile = () => {
    if (user) {
      setEditForm({
        name: user.name,
        email: user.email,
        currentEducation: user.currentEducation,
        germanLevel: user.germanLevel,
        currentRole: user.currentRole
      });
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      try {
        const updatedUser = await userService.updateUser(editForm);
        setUser(updatedUser);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } catch (error) {
        console.error("Failed to update profile:", error);
        alert("Failed to update profile. Please try again.");
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
  }

  if (!user) {
    return <div className="p-8 text-center text-gray-500">User not found</div>;
  }

  // Calculate stats
  const currentStreak = user.currentStreak;
  const longestStreak = user.longestStreak;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your account and track your progress</p>
          </div>
          {!isEditing && (
            <button
              onClick={handleEditProfile}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Info */}
        <div className="lg:col-span-1 space-y-6">
          <UserProfile
            user={user}
            isEditing={isEditing}
            editForm={editForm}
            onSave={handleSaveProfile}
            onCancel={handleCancelEdit}
            onChange={handleChange}
          />

          {/* Gamification Stats */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Achievements
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Current Level</div>
                    <div className="text-sm text-gray-500">{user.levelName} (Lvl {user.level})</div>
                  </div>
                </div>
                <div className="font-bold text-yellow-600">{user.points} pts</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Current Streak</div>
                    <div className="text-sm text-gray-500">Keep it going!</div>
                  </div>
                </div>
                <div className="font-bold text-orange-600">{currentStreak} days</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Longest Streak</div>
                    <div className="text-sm text-gray-500">Personal Best</div>
                  </div>
                </div>
                <div className="font-bold text-purple-600">{longestStreak} days</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Experience & Details */}
        <div className="lg:col-span-2 space-y-6">
          <ExperienceLevels currentPoints={user.points} />

          {/* Stats Summary */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Application Stats</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800">{applications.length}</div>
                <div className="text-sm text-gray-500">Total Applications</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800">{contacts.length}</div>
                <div className="text-sm text-gray-500">Network Contacts</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800">{applications.filter(a => a.status === 'Offer').length}</div>
                <div className="text-sm text-gray-500">Offers Received</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800">{Math.round(applications.length > 0 ? (applications.filter(a => a.status !== 'Applied' && a.status !== 'Ghosted').length / applications.length) * 100 : 0)}%</div>
                <div className="text-sm text-gray-500">Response Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;