import React, { useState } from 'react';
import { Users, Edit3, UserPlus, Camera } from 'lucide-react';
import { useTeam } from '../../context/TeamContext';
import ProfileModal from './ProfileModal';
import AddMemberModal from './AddMemberModal';

const TeamProfile: React.FC = () => {
  const { team, currentUser } = useTeam();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  if (!team || !currentUser) return null;

  return (
    <div className="space-y-6">
      {/* Current User Profile Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="text-center">
          <ProfileAvatar member={currentUser} />
          <h2 className="text-xl font-bold text-gray-900 mt-4">{currentUser.name}</h2>
          <p className="text-emerald-600 font-semibold">{currentUser.role}</p>
        </div>
        
        <button
          onClick={() => setShowProfileModal(true)}
          className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Edit3 className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      {/* Team Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-emerald-600" />
            <h3 className="text-xl font-bold text-gray-900">Team Members</h3>
          </div>
          {currentUser.isOwner && (
            <button
              onClick={() => setShowAddMember(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add Member
            </button>
          )}
        </div>

        <div className="space-y-4">
          {team.members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>

      {/* Modals */}
      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}
      {showAddMember && (
        <AddMemberModal onClose={() => setShowAddMember(false)} />
      )}
    </div>
  );
};

// Component pieces...
const ProfileAvatar = ({ member }) => {
  const { uploadAvatar } = useTeam();
  
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      await uploadAvatar(file, member.id);
    }
  };

  return (
    <div className="relative group">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center shadow-md border border-emerald-200/50 overflow-hidden group-hover:scale-105 transition-all duration-300">
        {member.avatar ? (
          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl font-bold text-emerald-700">
            {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </span>
        )}
      </div>
      <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
        <Camera className="w-6 h-6 text-white" />
      </div>
    </div>
  );
};

const MemberCard = ({ member }) => (
  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-emerald-200 transition-colors">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center overflow-hidden">
        {member.avatar ? (
          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-lg font-bold text-emerald-700">
            {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </span>
        )}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900">{member.name}</h4>
        <p className="text-emerald-600 text-sm font-medium">{member.role}</p>
        <p className="text-gray-500 text-sm">{member.email}</p>
      </div>
    </div>
    {member.isOwner && (
      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs font-semibold">
        Owner
      </span>
    )}
  </div>
);

export default TeamProfile;
