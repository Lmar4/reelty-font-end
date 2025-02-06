import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProfileDropdown from './ProfileDropdown';
import { useAuth } from '@/hooks/useAuth';

interface DashboardHeaderProps {
  isScrolled: boolean;
}

export default function DashboardHeader({ isScrolled }: DashboardHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user } = useAuth();

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the click from bubbling to the document
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-200 bg-white ${
      isScrolled ? 'bg-white/80 backdrop-blur-md border-b' : ''
    }`}>
      <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center">
          <Image
            src="/images/logo.svg"
            alt="Reelty Logo"
            width={90}
            height={24}
            className="flex-shrink-0 md:w-[100px] md:h-[27px]"
          />
        </Link>

        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="px-4 py-1.5 rounded-lg text-[15px] font-semibold text-[#1c1c1c] hover:bg-[#f7f7f7] transition-colors"
          >
            Dashboard
          </Link>

          <div className="relative">
            <button 
              onClick={handleProfileClick}
              className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-[#4B5F41] text-white"
            >
              {user?.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName || 'Profile'}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}</span>
              )}
            </button>
            <ProfileDropdown 
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
            />
          </div>
        </div>
      </div>
    </header>
  );
} 
