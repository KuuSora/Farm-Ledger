
import React from 'react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="p-4 no-print">
      <h1 className="text-3xl font-bold text-text-primary">{title}</h1>
    </header>
  );
};

export default Header;