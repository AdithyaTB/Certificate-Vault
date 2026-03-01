import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(
    (
        {
            children,
            variant = 'primary',
            size = 'md',
            isLoading = false,
            disabled,
            className = '',
            ...props
        },
        ref
    ) => {
        const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-text';

        const variants = {
            primary: 'bg-text text-bg hover:opacity-90',
            outline: 'border border-border text-text hover:bg-black/5 dark:hover:bg-white/5',
            ghost: 'text-text hover:bg-black/5 dark:hover:bg-white/5',
            danger: 'bg-red-500 text-white hover:bg-red-600',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-base',
            lg: 'px-6 py-3 text-lg',
        };

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    } ${className}`}
                {...props}
            >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
