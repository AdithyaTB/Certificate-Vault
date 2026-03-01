import { useState } from 'react';
import { X } from 'lucide-react';

const TagInput = ({ tags, setTags, placeholder = 'Add a tag...' }) => {
    const [input, setInput] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = input.trim();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setInput('');
        }
    };

    const removeTag = (indexToRemove) => {
        setTags(tags.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="w-full">
            <div className="flex flex-wrap items-center gap-2 p-2 border border-border rounded-lg bg-transparent focus-within:ring-1 focus-within:ring-text focus-within:border-text transition-all">
                {tags.map((tag, index) => (
                    <span
                        key={index}
                        className="flex items-center px-2 py-1 text-sm bg-black/5 dark:bg-white/10 rounded-md"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="ml-1.5 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 min-w-[120px] bg-transparent focus:outline-none text-sm text-text"
                    placeholder={tags.length === 0 ? placeholder : ''}
                />
            </div>
            <p className="mt-1 text-xs text-secondary">Press enter or comma to add tags</p>
        </div>
    );
};

export default TagInput;
