
import React, { ReactNode } from 'react';

interface CardProps {
  title: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children, className = '', actions }) => {
  return (
    <div className={`bg-card rounded-xl shadow-lg p-6 flex flex-col ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-text-primary">{title}</h2>
        {actions && <div>{actions}</div>}
      </div>
      <div className="flex-grow">{children}</div>
    </div>
  );
};

export default Card;