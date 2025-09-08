// src/services/teamService.ts
export const teamService = {
  async getTeam(): Promise<Team> {
    const response = await fetch('/api/team');
    return response.json();
  },

  async updateMember(id: number, updates: Partial<TeamMember>): Promise<TeamMember> {
    const response = await fetch(`/api/team/members/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  },

  async uploadAvatar(file: File, memberId: number): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('memberId', memberId.toString());

    const response = await fetch('/api/team/avatar', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    return data.avatarUrl;
  }
};
