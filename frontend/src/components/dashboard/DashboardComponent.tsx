import React, { useState } from 'react';
import { Flame, Target, TrendingUp, Briefcase, Users, CheckCircle, Mail, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddApplicationForm from '../forms/AddApplicationForm';

const ApplyQuestDashboard = () => {
  // Mock user data - will come from backend later
  const [userData, setUserData] = useState({
    name: "User",
    points: 247,
    level: 2,
    levelName: "Active Applicant",
    currentStreak: 7,
    longestStreak: 12,
    pointsToNextLevel: 53, // 300 - 247
    nextLevelPoints: 300
  });

  const [dailyGoals, setDailyGoals] = useState([
    { id: 1, type: "Apply to jobs", target: 5, current: 3, icon: Briefcase },
    { id: 2, type: "Follow up on applications", target: 3, current: 1, icon: Mail },
    { id: 3, type: "Add networking contacts", target: 2, current: 2, icon: Users }
  ]);

  const [quickStats, setQuickStats] = useState({
    totalApplications: 45,
    responseRate: 28,
    interviewRate: 15,
    activeApplications: 12
  });

  const motivationalMessages = [
    "Every application is a step closer to your dream job! 🚀",
    "Your persistence will pay off. Keep going! 💪",
    "You're building momentum. Stay consistent! ⭐",
    "Great progress today! Tomorrow will be even better! 🌟",
    "The right opportunity is out there waiting for you! 🎯"
  ];

  const [motivationalMessage] = useState(
    motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]
  );

  const getLevelProgress = () => {
    const currentLevelBase = 100; // Level 1 ends at 100
    const pointsInCurrentLevel = userData.points - currentLevelBase;
    const pointsNeededForLevel = userData.nextLevelPoints - currentLevelBase;
    return (pointsInCurrentLevel / pointsNeededForLevel) * 100;
  };

  const completeGoal = (goalId: number) => {
    setDailyGoals(dailyGoals.map(goal =>
      goal.id === goalId && goal.current < goal.target
        ? { ...goal, current: goal.current + 1 }
        : goal
    ));
  };

  const navigate = useNavigate();

  return (
    <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">ApplyQuest</h1>
          <p className="text-gray-600">Welcome back, {userData.name}! Let's make progress today. 🎯</p>
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
                <p className="text-gray-600 text-sm">Level {userData.level}</p>
                <h3 className="text-2xl font-bold text-blue-600">{userData.levelName}</h3>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{userData.points} points</span>
                <span className="text-gray-600">{userData.nextLevelPoints} points</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getLevelProgress()}%` }}
                ></div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{userData.pointsToNextLevel} points to Level 3</p>
          </div>

          {/* Streak */}
          <div className="bg-white rounded-xl p-6 shadow-md border-2 border-orange-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm">Current Streak</p>
                <h3 className="text-4xl font-bold text-orange-500">{userData.currentStreak}</h3>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <Flame className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-8 rounded-full ${
                    i < userData.currentStreak ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                ></div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-3">Best: {userData.longestStreak} days 🏆</p>
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
                      {!isComplete && (
                        <button
                          onClick={() => completeGoal(goal.id)}
                          className="bg-purple-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-600 transition-colors"
                        >
                          +1
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isComplete ? 'bg-green-500' : 'bg-purple-500'
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
          <AddApplicationForm />

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