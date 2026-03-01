import { forwardRef } from 'react';

const Input = forwardRef(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-text mb-1.5">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`
            w-full px-4 py-2 text-text bg-transparent border rounded-lg 
            focus:outline-none focus:ring-1 transition-colors
            ${error
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : 'border-border focus:border-text focus:ring-text'
                        }
            ${className}
          `}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
