import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../ui/ThemeToggle';
import { useGetMeQuery } from '../../app/apiSlice';

const Navbar = ({ setSidebarOpen }) => {
    const { data: user } = useGetMeQuery();

    const avatarSrc = user?.avatar
        ? user.avatar
        : `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user?.name || 'user')}`;

    return (
        <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border h-16 w-full">
            <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">

                {/* Left Side: Mobile Menu */}
                <div className="flex items-center flex-1">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="md:hidden p-2 text-secondary hover:text-text focus:outline-none"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>

                {/* Right Side: Theme & Profile */}
                <div className="flex items-center space-x-3">
                    <ThemeToggle />

                    {/* Avatar → links to Settings */}
                    <Link
                        to="/settings"
                        className="flex items-center gap-2 group focus:outline-none"
                        title={user?.name || 'Profile'}
                    >
                        {/* Name (hidden on small screens) */}
                        {user?.name && (
                            <span className="hidden sm:block text-sm font-medium text-secondary group-hover:text-text transition-colors truncate max-w-[120px]">
                                {user.name}
                            </span>
                        )}

                        {/* Avatar ring */}
                        <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-border group-hover:border-text transition-colors flex-shrink-0">
                            <img
                                className="h-full w-full object-cover"
                                src={avatarSrc}
                                alt={user?.name || 'Profile'}
                            />
                        </div>
                    </Link>
                </div>

            </div>
        </header>
    );
};

export default Navbar;

