import React, { useState, useEffect } from 'react';
import { useFarm } from '../context/FarmContext';

// Icons
const GitHubIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

const LinkedInIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const ArrowRightIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const ChevronDownIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
);

const Home: React.FC = () => {
  const { setViewState, triggerUIInteraction } = useFarm();
  const [isVisible, setIsVisible] = useState({});

  // Team members data
  const teamMembers = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Agricultural Technology Lead",
      description: "10+ years in precision agriculture and IoT farming solutions. Expert in hydroponic systems and smart farm automation.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
      github: "https://github.com",
      linkedin: "https://linkedin.com",
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      role: "Full-Stack Developer",
      description: "Senior developer specializing in React, TypeScript, and modern web technologies. Passionate about creating intuitive user experiences.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
      github: "https://github.com",
      linkedin: "https://linkedin.com",
    },
    {
      id: 3,
      name: "Emma Thompson",
      role: "Data Science & AI Engineer",
      description: "PhD in Agricultural Data Science. Develops machine learning models for crop yield prediction and pest identification using computer vision.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
      github: "https://github.com",
      linkedin: "https://linkedin.com",
    },
  ];

  const handleGetStarted = () => {
    setViewState({ view: 'dashboard' });
  };

  const scrollToTeam = () => {
    const teamSection = document.getElementById('team-section');
    if (teamSection) {
      teamSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const clearHint = () => triggerUIInteraction(null);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    teamMembers.forEach(member => {
      const element = document.getElementById(`team-card-${member.id}`);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
        }}
      />
      
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0s', animationDuration: '4s' }} />
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '6s' }} />
        <div className="absolute top-1/2 left-3/4 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s', animationDuration: '5s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Logo/Title */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight">
                Farm's{' '}
                <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Ledger
                </span>
              </h1>
              <p className="text-xl sm:text-2xl lg:text-3xl text-gray-200 font-light">
                Smart Farming, Smart Future
              </p>
            </div>

            {/* Description */}
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Transform your agricultural operations with AI-powered insights, comprehensive crop management, 
              and intelligent financial tracking. The future of farming is here.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <button
                onClick={handleGetStarted}
                onMouseEnter={() => triggerUIInteraction('Start managing your farm with advanced AI-powered tools and insights.')}
                onMouseLeave={clearHint}
                className="group relative overflow-hidden bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-green-400/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-3">
                  Get Started
                  <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </button>
              
              <button
                onClick={scrollToTeam}
                onMouseEnter={() => triggerUIInteraction('Meet the team of experts behind Farm\'s Ledger.')}
                onMouseLeave={clearHint}
                className="group border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-semibold text-lg backdrop-blur-sm hover:bg-white/10 hover:border-white/50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/30"
              >
                Meet the Team
              </button>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDownIcon className="w-8 h-8 text-white/70" />
          </div>
        </div>

        {/* Team Section */}
        <section id="team-section" className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Meet Our{' '}
                <span className="bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                  Expert Team
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                A diverse group of agricultural technologists, developers, and data scientists 
                dedicated to revolutionizing modern farming practices.
              </p>
            </div>

            {/* Team Cards - Desktop Horizontal Scroll, Mobile Vertical Stack */}
            <div className="hidden lg:block">
              <div className="flex gap-8 overflow-x-auto scrollbar-hide pb-8" style={{ scrollSnapType: 'x mandatory' }}>
                {teamMembers.map((member, index) => (
                  <TeamCard 
                    key={member.id} 
                    member={member} 
                    index={index}
                    isVisible={isVisible[`team-card-${member.id}`]}
                    onMouseEnter={() => triggerUIInteraction(`Learn more about ${member.name}, our ${member.role}.`)}
                    onMouseLeave={clearHint}
                  />
                ))}
              </div>
            </div>

            {/* Mobile/Tablet Vertical Stack */}
            <div className="lg:hidden space-y-8">
              {teamMembers.map((member, index) => (
                <TeamCard 
                  key={member.id} 
                  member={member} 
                  index={index}
                  isVisible={isVisible[`team-card-${member.id}`]}
                  onMouseEnter={() => triggerUIInteraction(`Learn more about ${member.name}, our ${member.role}.`)}
                  onMouseLeave={clearHint}
                />
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

// Team Card Component
const TeamCard: React.FC<{
  member: any;
  index: number;
  isVisible?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}> = ({ member, index, isVisible, onMouseEnter, onMouseLeave }) => {
  return (
    <div
      id={`team-card-${member.id}`}
      className={`flex-none w-80 lg:w-96 transform transition-all duration-700 ${
        isVisible ? 'animate-slide-up opacity-100' : 'opacity-0 translate-y-12'
      }`}
      style={{ 
        animationDelay: `${index * 200}ms`,
        scrollSnapAlign: 'start'
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="group relative overflow-hidden rounded-3xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl hover:shadow-3xl transform transition-all duration-500 hover:scale-105 hover:-translate-y-2">
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Card Content */}
        <div className="relative p-8">
          {/* Avatar */}
          <div className="relative mx-auto w-32 h-32 mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-400 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
            <img
              src={member.avatar}
              alt={member.name}
              className="relative w-full h-full rounded-full object-cover ring-4 ring-white/30 group-hover:ring-white/50 transition-all duration-500"
            />
          </div>

          {/* Info */}
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-white group-hover:text-green-300 transition-colors duration-300">
              {member.name}
            </h3>
            <p className="text-green-400 font-semibold text-lg">
              {member.role}
            </p>
            <p className="text-gray-300 leading-relaxed">
              {member.description}
            </p>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-4 mt-8">
            <a
              href={member.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-green-400 transform transition-all duration-300 hover:scale-110 border border-white/20 hover:border-green-400/50"
            >
              <GitHubIcon className="w-6 h-6" />
            </a>
            <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-blue-400 transform transition-all duration-300 hover:scale-110 border border-white/20 hover:border-blue-400/50"
            >
              <LinkedInIcon className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
