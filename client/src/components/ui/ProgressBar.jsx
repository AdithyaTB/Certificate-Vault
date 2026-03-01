import { motion } from 'framer-motion';

const ProgressBar = ({ progress = 0, label, color = 'bg-text' }) => {
    // ensure progress is between 0 and 100
    const clampedProgress = Math.min(Math.max(progress, 0), 100);

    return (
        <div className="w-full">
            {label && (
                <div className="flex justify-between mb-1 text-sm font-medium text-text">
                    <span>{label}</span>
                    <span>{clampedProgress.toFixed(0)}%</span>
                </div>
            )}
            <div className="w-full bg-border rounded-full h-2.5 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${clampedProgress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-2.5 rounded-full ${color}`}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
