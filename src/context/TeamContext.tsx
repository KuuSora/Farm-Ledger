import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Team, TeamMember, TeamContextType } from '../types/team';

const TeamContext = createContext<TeamContextType | undefined>(undefined);

// Mock initial data - replace with API calls
const mockTeam: Team = {
  id: 1,
  name: "Green Valley Farm",
  plan: "Premium",
  status: "Active",
  ownerId: 1,
  createdAt: "2024-01-01",
  members: [
    {
      id: 1,
      name: "John Farmer",
      email: "john@greenvalley.com",
      role: "Owner",
      avatar: null,
      isOwner: true,
      createdAt: "2024-01-01"
    }
  ]
};

export const TeamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [team, setTeam] = useState<Team>(mockTeam);
  const [currentUser] = useState<TeamMember>(mockTeam.members[0]);

  const updateTeam = (updates: Partial<Team>) => {
    setTeam(prev => ({ ...prev, ...updates }));
  };

  const addMember = (newMember: Omit<TeamMember, 'id' | 'createdAt'>) => {
    const id = Math.max(...team.members.map(m => m.id)) + 1;
    const member: TeamMember = {
      ...newMember,
      id,
      createdAt: new Date().toISOString()
    };
    
    setTeam(prev => ({
      ...prev,
      members: [...prev.members, member]
    }));
  };

  const updateMember = (id: number, updates: Partial<TeamMember>) => {
    setTeam(prev => ({
      ...prev,
      members: prev.members.map(member => 
        member.id === id ? { ...member, ...updates } : member
      )
    }));
  };

  const removeMember = (id: number) => {
    setTeam(prev => ({
      ...prev,
      members: prev.members.filter(member => member.id !== id)
    }));
  };

  const uploadAvatar = async (file: File, memberId?: number): Promise<string> => {
    // Simulate upload - replace with actual upload logic
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        
        if (memberId) {
          updateMember(memberId, { avatar: imageUrl });
        } else {
          updateMember(currentUser.id, { avatar: imageUrl });
        }
        
        resolve(imageUrl);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <TeamContext.Provider value={{
      team,
      currentUser,
      updateTeam,
      addMember,
      updateMember,
      removeMember,
      uploadAvatar
    }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};
