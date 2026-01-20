import React, { useState } from 'react';
import { NetworkContact, JobApplication } from '../types';
import { mockContacts, mockApplications } from '../utils/mockData';
import NetworkList from '../components/network/NetworkList';

const Network: React.FC = () => {
  const [contacts, setContacts] = useState<NetworkContact[]>(mockContacts);
  const [applications] = useState<JobApplication[]>(mockApplications);

  const handleAddContact = (contactData: Omit<NetworkContact, 'id' | 'userId'>) => {
    const newContact: NetworkContact = {
      ...contactData,
      id: Date.now().toString(),
      userId: '1', // Mock user ID
    };

    setContacts(prev => [...prev, newContact]);

    // Show success message
    alert(`Contact added successfully! 🎉\n\n${contactData.name} has been added to your network.\nYou earned +5 points!`);
  };

  const handleEditContact = (contactId: string, contactData: Omit<NetworkContact, 'id' | 'userId'>) => {
    setContacts(prev =>
      prev.map(contact =>
        contact.id === contactId
          ? { ...contact, ...contactData }
          : contact
      )
    );

    alert(`Contact updated successfully! ✓\n\n${contactData.name}'s information has been updated.`);
  };

  const handleDeleteContact = (contactId: string) => {
    setContacts(prev => prev.filter(contact => contact.id !== contactId));
    alert('Contact deleted successfully.');
  };

  return (
    <NetworkList
      contacts={contacts}
      applications={applications}
      onAddContact={handleAddContact}
      onEditContact={handleEditContact}
      onDeleteContact={handleDeleteContact}
    />
  );
};

export default Network;