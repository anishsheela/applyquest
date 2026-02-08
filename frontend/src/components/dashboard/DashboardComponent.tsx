import React, { useMemo } from 'react';
import { Flame, Target, TrendingUp, Briefcase, Users, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const motivationalMessages = [
  "Every application is a step closer to your dream job! 🚀",
  "Your persistence will pay off. Keep going! 💪",
  "You're building momentum. Stay consistent! ⭐",
  "Great progress today! Tomorrow will be even better! 🌟",
  "The right opportunity is out there waiting for you! 🎯"
];

const ApplyQuestDashboard: React.FC = () => {
  const { user, applications, contacts, loading } = useAppContext();
  const navigate = useNavigate();

  // Calculate Daily Goals Progress based on real data
  const goalsProgress = useMemo(() => {
    if (!applications || !contacts) return { applied: 0, contacts: 0 };

    const today = new Date().toISOString().split('T')[0];

    // Count applications created today
    const appliedToday = applications.filter(app => {
      const appDate = new Date(app.createdAt).toISOString().split('T')[0];
      return appDate === today;
    }).length;

    // Count contacts added today
    const contactsToday = contacts.filter(contact => {
      const contactDate = (contact as any).created_at || (contact as any).createdAt;
      if (!contactDate) return false;
      return new Date(contactDate).toISOString().split('T')[0] === today;
    }).length;

    return { applied: appliedToday, contacts: contactsToday };
  }, [applications, contacts]);

  // Define Goals with real progress
  const dailyGoals = [
    { id: 1, type: "Apply to jobs", target: 3, current: goalsProgress.applied, icon: Briefcase },
    { id: 2, type: "Add networking contacts", target: 2, current: goalsProgress.contacts, icon: Users },
    { id: 3, type: "Total Applications", target: Math.max(10, applications.length + 1), current: applications.length, icon: Target }
  ];

  // Calculate Quick Stats
  const quickStats = useMemo(() => {
    const total = applications.length;
    if (total === 0) return { totalApplications: 0, responseRate: 0, interviewRate: 0, activeApplications: 0 };

    const responded = applications.filter(app => !['Applied', 'Ghosted'].includes(app.status)).length;
    const interviewed = applications.filter(app =>
      ['Phone Screen', 'Technical Round 1', 'Technical Round 2', 'Final Round'].includes(app.status)
    ).length;
    const active = applications.filter(app =>
      !['Rejected', 'Ghosted', 'Offer'].includes(app.status)
    ).length;

    return {
      totalApplications: total,
      responseRate: Math.round((responded / total) * 100),
      interviewRate: Math.round((interviewed / total) * 100),
      activeApplications: active
    };
  }, [applications]);

  const motivationalMessage = useMemo(() =>
    motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]
    , []);

  if (loading || !user) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
  }

  // Level Calculations
  const levels = [0, 100, 300, 600, 1000, 1500];
  const nextLevelIndex = levels.findIndex(lz => lz > user.points);
  const nextLevelPoints = nextLevelIndex !== -1 ? levels[nextLevelIndex] : user.points * 1.5;
  const currentLevelBase = nextLevelIndex !== -1 && nextLevelIndex > 0 ? levels[nextLevelIndex - 1] : 0;

  const getLevelProgress = () => {
    const pointsInCurrentLevel = user.points - currentLevelBase;
    const pointsNeededForLevel = nextLevelPoints - currentLevelBase;
    return Math.min(Math.max((pointsInCurrentLevel / pointsNeededForLevel) * 100, 0), 100);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">ApplyQuest</h1>
        <p className="text-gray-600">Welcome back, {user.name}! Let's make progress today. 🎯</p>
      </div>

      {/* Motivational Message */}
      <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl p-6 mb-6 shadow-lg">
        <p className="text-white text-xl font-medium text-center">{motivationalMessage}</p>
      </div>

      {/* Gamification Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Level & Points */}
        <div className="bg-white rounded-xl p-6 shadow-md border-2 border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm">Level {user.level}</p>
              <h3 className="text-2xl font-bold text-blue-600">{user.levelName || 'Novice'}</h3>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{user.points} points</span>
              <span className="text-gray-600">{nextLevelPoints} points</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${getLevelProgress()}%` }}
              ></div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">{nextLevelPoints - user.points} points to next level</p>
        </div>

        {/* Streak */}
        <div className="bg-white rounded-xl p-6 shadow-md border-2 border-orange-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm">Current Streak</p>
              <h3 className="text-4xl font-bold text-orange-500">{user.currentStreak}</h3>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-8 rounded-full ${i < Math.min(user.currentStreak, 7) ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
              ></div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3">Best: {user.longestStreak} days 🏆</p>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl p-6 shadow-md border-2 border-green-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm">Total Applications</p>
              <h3 className="text-4xl font-bold text-green-600">{quickStats.totalApplications}</h3>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Briefcase className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Response Rate</span>
              <span className="font-semibold text-green-600">{quickStats.responseRate}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Interview Rate</span>
              <span className="font-semibold text-green-600">{quickStats.interviewRate}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Active</span>
              <span className="font-semibold text-green-600">{quickStats.activeApplications}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Goals */}
      <div className="bg-white rounded-xl p-6 shadow-md mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-800">Today's Goals</h2>
        </div>
        <div className="space-y-4">
          {dailyGoals.map((goal) => {
            const GoalIcon = goal.icon;
            const progress = (goal.current / goal.target) * 100;
            const isComplete = goal.current >= goal.target;

            return (
              <div key={goal.id} className="border-2 border-gray-100 rounded-lg p-4 hover:border-purple-200 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${isComplete ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {isComplete ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <GoalIcon className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <span className="font-medium text-gray-800">{goal.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {goal.current}/{goal.target}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-purple-500'
                      }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/applications')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-left"
        >
          <Briefcase className="w-8 h-8 mb-2" />
          <h3 className="text-xl font-bold mb-1">Add Application</h3>
          <p className="text-blue-100 text-sm">Track a new job application</p>
        </button>

        <button
          onClick={() => navigate('/applications')}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          <Target className="w-8 h-8 mb-2" />
          <h3 className="text-xl font-bold mb-1">View Board</h3>
          <p className="text-purple-100 text-sm">Kanban view of applications</p>
        </button>

        <button
          onClick={() => navigate('/network')}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          <Users className="w-8 h-8 mb-2" />
          <h3 className="text-xl font-bold mb-1">Network</h3>
          <p className="text-green-100 text-sm">Manage your contacts</p>
        </button>
      </div>
    </div>
  );
};

export default ApplyQuestDashboard;