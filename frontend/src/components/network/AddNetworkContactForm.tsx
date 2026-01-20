import React, { useState, useEffect } from 'react';
import { X, User, Mail, Building, Users, Calendar, Star, Link2 } from 'lucide-react';
import { NetworkContact, JobApplication } from '../../types';

interface NetworkContactFormData {
  name: string;
  email: string;
  company: string;
  relationship: string;
  connectionStrength: number;
  lastContactDate: string;
  notes: string;
  applicationId: string;
}

interface AddNetworkContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Omit<NetworkContact, 'id' | 'userId' | 'createdAt'>) => void;
  contact?: NetworkContact;
  applications?: JobApplication[];
}

const AddNetworkContactForm: React.FC<AddNetworkContactFormProps> = ({
  isOpen,
  onClose,
  onSave,
  contact,
  applications = []
}) => {
  const [formData, setFormData] = useState<NetworkContactFormData>({
    name: '',
    email: '',
    company: '',
    relationship: '',
    connectionStrength: 3,
    lastContactDate: new Date().toISOString().split('T')[0],
    notes: '',
    applicationId: ''
  });

  const relationships = [
    'Former Colleague',
    'Current Colleague',
    'Mentor',
    'Mentee',
    'Friend',
    'Family',
    'Alumni',
    'Industry Contact',
    'Client',
    'Supplier',
    'Conference Contact',
    'LinkedIn Connection',
    'Referral Source',
    'Other'
  ];

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        email: contact.email || '',
        company: contact.company || '',
        relationship: contact.relationship || '',
        connectionStrength: contact.connectionStrength,
        lastContactDate: contact.lastContactDate || new Date().toISOString().split('T')[0],
        notes: contact.notes || '',
        applicationId: contact.applicationId || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        company: '',
        relationship: '',
        connectionStrength: 3,
        lastContactDate: new Date().toISOString().split('T')[0],
        notes: '',
        applicationId: ''
      });
    }
  }, [contact, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStarClick = (strength: number) => {
    setFormData(prev => ({ ...prev, connectionStrength: strength }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const contactData: Omit<NetworkContact, 'id' | 'userId' | 'createdAt'> = {
      name: formData.name,
      email: formData.email || undefined,
      company: formData.company || undefined,
      relationship: formData.relationship || undefined,
      connectionStrength: formData.connectionStrength,
      lastContactDate: formData.lastContactDate || undefined,
      notes: formData.notes || undefined,
      applicationId: formData.applicationId || undefined
    };

    onSave(contactData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6" />
            <h2 className="text-2xl font-bold">
              {contact ? 'Edit Network Contact' : 'Add Network Contact'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <User className="w-5 h-5 text-green-500" />
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., John Smith"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g., SAP, Siemens"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <select
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Select relationship...</option>
                    {relationships.map(rel => (
                      <option key={rel} value={rel}>{rel}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Star className="w-5 h-5 text-green-500" />
              Connection Strength
            </h3>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= formData.connectionStrength
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                ({formData.connectionStrength} {formData.connectionStrength === 1 ? 'star' : 'stars'})
              </span>
            </div>

            <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
              <strong>Rating Guide:</strong><br />
              1 star = Very Weak (just met, no real connection)<br />
              2 stars = Weak (basic acquaintance)<br />
              3 stars = Moderate (professional contact)<br />
              4 stars = Strong (good working relationship)<br />
              5 stars = Very Strong (close professional/personal relationship)
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-500" />
              Last Contact
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                When did you last contact this person?
              </label>
              <input
                type="date"
                name="lastContactDate"
                value={formData.lastContactDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {applications.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-green-500" />
                Link to Application (Optional)
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Connect this contact to a job application
                </label>
                <select
                  name="applicationId"
                  value={formData.applicationId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">No application linked</option>
                  {applications.map(app => (
                    <option key={app.id} value={app.id}>
                      {app.companyName} - {app.positionTitle}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Add any additional notes about this contact, shared interests, or conversation topics..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
            >
              {contact ? 'Update Contact' : 'Add Contact (+5 points)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNetworkContactForm;