import React from 'react';
import { User } from '../../types';
import { User as UserIcon, Mail, GraduationCap, Languages, Briefcase, Save, X, Award, MapPin, Globe, Calendar, Star, Trophy } from 'lucide-react';

interface UserProfileProps {
    user: User;
    isEditing: boolean;
    editForm: Partial<User>;
    onSave: (e: React.FormEvent) => void;
    onCancel: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
    user,
    isEditing,
    editForm,
    onSave,
    onCancel,
    onChange
}) => {
    const germanLevels = ['None', 'Basic', 'Fluent', 'B1', 'B2', 'C1'];

    return (
        <div className="bg-white rounded-xl p-6 shadow-md h-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full p-3">
                    <UserIcon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Profile Information</h2>
            </div>

            {isEditing ? (
                <form onSubmit={onSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={editForm.name || ''}
                            onChange={onChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={editForm.email || ''}
                            onChange={onChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Education
                        </label>
                        <input
                            type="text"
                            name="currentEducation"
                            value={editForm.currentEducation || ''}
                            onChange={onChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            German Language Level
                        </label>
                        <select
                            name="germanLevel"
                            value={editForm.germanLevel || ''}
                            onChange={onChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select Level</option>
                            {germanLevels.map(level => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Role
                        </label>
                        <input
                            type="text"
                            name="currentRole"
                            value={editForm.currentRole || ''}
                            onChange={onChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex-1 justify-center"
                        >
                            <Save className="w-4 h-4" />
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex-1 justify-center"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <UserIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Full Name</p>
                                <p className="font-medium text-gray-800 text-lg">{user.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <Mail className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                                <p className="font-medium text-gray-800">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <GraduationCap className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Education</p>
                                <p className="font-medium text-gray-800">{user.currentEducation || 'Not specified'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <Languages className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">German Level</p>
                                <p className="font-medium text-gray-800">{user.germanLevel || 'Not specified'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                            <div className="bg-purple-100 p-2 rounded-lg">
                                <Briefcase className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Current Role</p>
                                <p className="font-medium text-gray-800">{user.currentRole || 'Looking for work'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
