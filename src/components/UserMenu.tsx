import React, { useState, useRef, useEffect } from 'react';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router-dom';

const UserMenu: React.FC = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const history = useHistory();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            // Redirect to login page after logout
            history.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleProfileClick = () => {
        setIsOpen(false);
        history.push('/profile');
    };

    // Get user initials for the profile emoji
    const getUserInitials = () => {
        if (!user?.name) return '👤';
        const names = user.name.split(' ');
        if (names.length >= 2) {
            return `${names[0]?.[0] || ''}${names[1]?.[0] || ''}`.toUpperCase() || '👤';
        }
        return user.name[0]?.toUpperCase() || '👤';
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <Dropdown isOpen={isOpen} onOpenChange={setIsOpen}>
                <DropdownTrigger>
                    <Button
                        isIconOnly
                        variant="light"
                        className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-bold text-lg rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
                        aria-label="User menu"
                    >
                        {getUserInitials()}
                    </Button>
                </DropdownTrigger>
                <DropdownMenu
                    aria-label="User actions"
                    className="w-48"
                    onAction={(key) => {
                        if (key === 'profile') {
                            handleProfileClick();
                        } else if (key === 'logout') {
                            handleLogout();
                        }
                    }}
                >
                    <DropdownItem key="profile" className="text-gray-700">
                        <div className="flex items-center space-x-3">
                            <Icon icon="lucide:user" className="w-4 h-4 text-gray-500" />
                            <span>Profile</span>
                        </div>
                    </DropdownItem>
                    <DropdownItem key="logout" className="text-red-600">
                        <div className="flex items-center space-x-3">
                            <Icon icon="lucide:log-out" className="w-4 h-4 text-red-500" />
                            <span>Logout</span>
                        </div>
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </div>
    );
};

export default UserMenu;
