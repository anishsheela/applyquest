import React, { useState } from 'react';
import { NetworkContact, JobApplication } from '../../types';
import NetworkContactCard from './NetworkContactCard';
import AddNetworkContactForm from './AddNetworkContactForm';
import { Plus, Search, Users } from 'lucide-react';

interface NetworkListProps {
  contacts: NetworkContact[];
  applications?: JobApplication[];
  onAddContact: (contact: Omit<NetworkContact, 'id' | 'userId' | 'createdAt'>) => void;
  onEditContact: (contactId: string, contact: Omit<NetworkContact, 'id' | 'userId' | 'createdAt'>) => void;
  onDeleteContact: (contactId: string) => void;
}

const NetworkList: React.FC<NetworkListProps> = ({
  contacts,
  applications = [],
  onAddContact,
  onEditContact,
  onDeleteContact
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<NetworkContact | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.relationship?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (contact: NetworkContact) => {
    setEditingContact(contact);
    setIsFormOpen(true);
  };

  const handleDelete = (contactId: string) => {
    if (window.confirm('Are you sure you want to delete this network contact?')) {
      onDeleteContact(contactId);
    }
  };

  const handleSave = (contactData: Omit<NetworkContact, 'id' | 'userId' | 'createdAt'>) => {
    if (editingContact) {
      onEditContact(editingContact.id, contactData);
      setEditingContact(undefined);
    } else {
      onAddContact(contactData);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingContact(undefined);
  };

  const getStats = () => {
    const totalContacts = contacts.length;
    const strongConnections = contacts.filter(c => c.connectionStrength >= 4).length;
    const recentContacts = contacts.filter(c => {
      if (!c.lastContactDate) return false;
      const lastContact = new Date(c.lastContactDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastContact >= thirtyDaysAgo;
    }).length;

    return { totalContacts, strongConnections, recentContacts };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-6 h-6 text-green-500" />
              Network Contacts
            </h2>
            <p className="text-gray-600 mt-1">Manage your professional network</p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Contact
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalContacts}</div>
            <div className="text-sm text-blue-800">Total Contacts</div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{stats.strongConnections}</div>
            <div className="text-sm text-green-800">Strong Connections (4-5⭐)</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.recentContacts}</div>
            <div className="text-sm text-purple-800">Contacted in Last 30 Days</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts by name, company, email, or relationship..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Contacts Grid */}
      {filteredContacts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-md">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {contacts.length === 0 ? 'No network contacts yet' : 'No contacts match your search'}
          </h3>
          <p className="text-gray-500 mb-6">
            {contacts.length === 0
              ? 'Start building your professional network by adding contacts who can help with your job search.'
              : 'Try adjusting your search terms.'
            }
          </p>
          {contacts.length === 0 && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Your First Contact
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map(contact => (
            <NetworkContactCard
              key={contact.id}
              contact={contact}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      <AddNetworkContactForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSave}
        contact={editingContact}
        applications={applications}
      />
    </div>
  );
};

export default NetworkList;