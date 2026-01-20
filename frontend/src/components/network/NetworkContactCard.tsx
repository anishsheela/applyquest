import React from 'react';
import { NetworkContact } from '../../types';
import { Mail, Building, User, Calendar, Star, Edit2, Trash2 } from 'lucide-react';

interface NetworkContactCardProps {
  contact: NetworkContact;
  onEdit: (contact: NetworkContact) => void;
  onDelete: (contactId: string) => void;
}

const NetworkContactCard: React.FC<NetworkContactCardProps> = ({ contact, onEdit, onDelete }) => {
  const getConnectionStrengthColor = (strength: number) => {
    if (strength >= 4) return 'text-green-500';
    if (strength >= 3) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConnectionStrengthLabel = (strength: number) => {
    if (strength >= 5) return 'Very Strong';
    if (strength >= 4) return 'Strong';
    if (strength >= 3) return 'Moderate';
    if (strength >= 2) return 'Weak';
    return 'Very Weak';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full p-3">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{contact.name}</h3>
              {contact.relationship && (
                <p className="text-sm text-gray-600">{contact.relationship}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(contact)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit contact"
            >
              <Edit2 className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => onDelete(contact.id)}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete contact"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{contact.email || 'No email'}</span>
          </div>

          {contact.company && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Building className="w-4 h-4" />
              <span>{contact.company}</span>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Last contact: {formatDate(contact.lastContactDate)}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= contact.connectionStrength
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className={`text-sm font-medium ${getConnectionStrengthColor(contact.connectionStrength)}`}>
              {getConnectionStrengthLabel(contact.connectionStrength)}
            </span>
          </div>

          {contact.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{contact.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkContactCard;