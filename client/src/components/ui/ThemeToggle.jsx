import { useTheme } from '../../hooks/useTheme';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle Theme"
        >
            {theme === 'light' ? (
                <motion.div
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <Moon className="w-5 h-5 text-text" />
                </motion.div>
            ) : (
                <motion.div
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <Sun className="w-5 h-5 text-text" />
                </motion.div>
            )}
        </button>
    );
};

export default ThemeToggle;
