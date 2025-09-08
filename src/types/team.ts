export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  isOwner: boolean;
  createdAt: string;
  lastActive?: string;
}

export interface Team {
  id: number;
  name: string;
  plan: 'Basic' | 'Premium' | 'Enterprise';
  status: 'Active' | 'Inactive' | 'Suspended';
  members: TeamMember[];
  createdAt: string;
  ownerId: number;
}

export type UserRole = 
  | 'Owner' 
  | 'Farm Manager' 
  | 'Field Worker' 
  | 'Accountant' 
  | 'Viewer';

export interface TeamContextType {
  team: Team | null;
  currentUser: TeamMember | null;
  updateTeam: (updates: Partial<Team>) => void;
  addMember: (member: Omit<TeamMember, 'id' | 'createdAt'>) => void;
  updateMember: (id: number, updates: Partial<TeamMember>) => void;
  removeMember: (id: number) => void;
  uploadAvatar: (file: File, memberId?: number) => Promise<string>;
}
