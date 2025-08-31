
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFarm } from '../context/FarmContext';
import { BellIcon } from './icons';
import { Notification } from '../types';

function timeSince(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return "just now";
}

const NotificationCenter: React.FC = () => {
    const { notifications, markNotificationAsRead, markAllNotificationsAsSeen, markAllAsRead, setViewState } = useFarm();
    const [isOpen, setIsOpen] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    const unseenCount = useMemo(() => notifications.filter(n => !n.seen).length, [notifications]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBellClick = () => {
        setIsOpen(prev => !prev);
        if (!isOpen) {
            markAllNotificationsAsSeen();
        }
    };
    
    const handleNotificationClick = (notification: Notification) => {
        markNotificationAsRead(notification.id);
        if (notification.link) {
            setViewState({ view: 'equipment', payload: { detailedEquipmentId: notification.link } });
        }
        setIsOpen(false);
    }
    
    return (
        <div className="relative" ref={notificationRef}>
            <button onClick={handleBellClick} className="relative p-2 rounded-full hover:bg-gray-200/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                <BellIcon className="w-6 h-6 text-text-secondary" />
                {unseenCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border z-50">
                    <div className="p-4 flex justify-between items-center border-b">
                        <h3 className="font-bold text-text-primary">Notifications</h3>
                        <button onClick={() => { markAllAsRead(); }} className="text-sm text-primary hover:underline">Mark all as read</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <div key={n.id} onClick={() => handleNotificationClick(n)} className="p-4 flex items-start gap-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0">
                                    {!n.read && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>}
                                    <div className={`flex-grow ${n.read ? 'pl-[14px]' : ''}`}>
                                        <p className="text-sm text-text-primary">{n.message}</p>
                                        <p className="text-xs text-text-secondary mt-1">{timeSince(new Date(n.timestamp))}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="p-8 text-center text-text-secondary">No new notifications.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="p-4 no-print flex justify-between items-center border-b border-gray-200/80 bg-card">
      <h1 className="text-3xl font-bold text-text-primary">{title}</h1>
      <NotificationCenter />
    </header>
  );
};

export default Header;