import React from 'react';
import { Trophy, Star, TrendingUp, Award, Zap } from 'lucide-react';

interface ExperienceLevelsProps {
    currentPoints: number;
}

const ExperienceLevels: React.FC<ExperienceLevelsProps> = ({ currentPoints }) => {
    // Mock levels data - this could come from backend config ideally
    const levels = [
        { level: 1, name: 'Novice Seeker', minPoints: 0, description: 'Just starting the journey' },
        { level: 2, name: 'Active Applicant', minPoints: 100, description: 'Sending applications regularly' },
        { level: 3, name: 'Job Hunter', minPoints: 300, description: 'Serious about finding a role' },
        { level: 4, name: 'Networking Pro', minPoints: 600, description: 'Building valuable connections' },
        { level: 5, name: 'Interview Master', minPoints: 1000, description: 'Getting callbacks and interviews' },
        { level: 6, name: 'Offer Magnet', minPoints: 1500, description: 'Closing deals and getting offers' },
    ];

    // Calculate current level based on points
    const currentLevelIndex = levels.findIndex((lvl, idx) => {
        const nextLvl = levels[idx + 1];
        return currentPoints >= lvl.minPoints && (!nextLvl || currentPoints < nextLvl.minPoints);
    });

    const currentLevel = levels[currentLevelIndex !== -1 ? currentLevelIndex : 0];
    const nextLevel = levels[currentLevelIndex + 1];

    const pointsForCurrentLevel = currentLevel.minPoints;
    const pointsForNextLevel = nextLevel ? nextLevel.minPoints : currentPoints * 1.5; // fallback
    const pointsInLevel = currentPoints - pointsForCurrentLevel;
    const pointsNeeded = pointsForNextLevel - pointsForCurrentLevel;
    const progressPercent = Math.min((pointsInLevel / pointsNeeded) * 100, 100);

    return (
        <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-3">
                    <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Experience Levels</h2>
                    <p className="text-sm text-gray-500">Track your career journey progress</p>
                </div>
            </div>

            <div className="mb-8 text-center p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-blue-100">
                <div className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-md mb-4">
                    <Trophy className="w-10 h-10 text-yellow-500" />
                </div>
                <h3 className="text-2xl font-bold text-indigo-900 mb-1">{currentLevel.name}</h3>
                <p className="text-indigo-600 font-medium mb-4">Level {currentLevel.level}</p>

                <div className="relative pt-1 max-w-md mx-auto">
                    <div className="flex mb-2 items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                                Current
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-indigo-600">
                                {Math.round(progressPercent)}%
                            </span>
                        </div>
                    </div>
                    <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-indigo-200">
                        <div style={{ width: `${progressPercent}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-500 ease-out"></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 font-medium">
                        <span>{currentPoints} pts</span>
                        <span>{nextLevel ? `${nextLevel.minPoints} pts (Next Level)` : 'Max Level'}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-gray-400" />
                    Level Milestones
                </h4>
                <div className="relative border-l-2 border-gray-200 ml-3 pl-6 space-y-6 pb-2">
                    {levels.map((lvl) => {
                        const isUnlocked = currentPoints >= lvl.minPoints;
                        const isCurrent = lvl.level === currentLevel.level;

                        return (
                            <div key={lvl.level} className="relative">
                                <span className={`absolute -left-[31px] flex items-center justify-center w-8 h-8 rounded-full ring-4 ring-white ${isUnlocked ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                                    }`}>
                                    {isUnlocked ? <Star className="w-4 h-4 fill-current" /> : <span className="text-xs font-bold">{lvl.level}</span>}
                                </span>

                                <div className={`p-3 rounded-lg border ${isCurrent
                                        ? 'bg-green-50 border-green-200 shadow-sm'
                                        : isUnlocked
                                            ? 'bg-gray-50 border-gray-100'
                                            : 'bg-transparent border-transparent opacity-60'
                                    }`}>
                                    <h5 className={`font-bold ${isCurrent ? 'text-green-800' : 'text-gray-800'}`}>
                                        {lvl.name}
                                    </h5>
                                    <p className="text-sm text-gray-600">{lvl.description}</p>
                                    <div className="mt-1 text-xs font-medium text-gray-400">
                                        Unlocks at {lvl.minPoints} pts
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ExperienceLevels;
