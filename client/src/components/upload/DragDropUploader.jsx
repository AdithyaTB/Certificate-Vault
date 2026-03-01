import { useState, useCallback } from 'react';
import { UploadCloud, X, File, FileText, Image as ImageIcon } from 'lucide-react';

const DragDropUploader = ({ file, setFile }) => {
    const [isDragActive, setIsDragActive] = useState(false);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragActive(true);
        } else if (e.type === 'dragleave') {
            setIsDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            validateAndSetFile(droppedFile);
        }
    }, [setFile]);

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (newFile) => {
        const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(newFile.type)) {
            alert('Only JPG, PNG and PDF files are allowed');
            return;
        }
        if (newFile.size > 10 * 1024 * 1024) { // 10MB
            alert('File size must be less than 10MB');
            return;
        }
        setFile(newFile);
    };

    const removeFile = (e) => {
        e.preventDefault();
        setFile(null);
    };

    return (
        <div className="w-full">
            {!file ? (
                <div
                    className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all cursor-pointer bg-card/50
            ${isDragActive ? 'border-text bg-black/5 dark:bg-white/5' : 'border-border hover:bg-black/5 dark:hover:bg-white/5 hover:border-secondary'}
          `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload').click()}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="p-4 bg-bg rounded-full shadow-sm mb-4">
                            <UploadCloud className="w-8 h-8 text-secondary" />
                        </div>
                        <p className="mb-2 text-sm text-secondary">
                            <span className="font-semibold text-text">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-secondary/80">PDF, JPG or PNG (MAX. 10MB)</p>
                    </div>
                    <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleChange}
                    />
                </div>
            ) : (
                <div className="relative flex items-center p-4 border border-border rounded-xl bg-card">
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-bg rounded-lg">
                        {file.type.includes('pdf') ? (
                            <FileText className="w-6 h-6 text-red-500" />
                        ) : file.type.includes('image') ? (
                            <ImageIcon className="w-6 h-6 text-blue-500" />
                        ) : (
                            <File className="w-6 h-6 text-secondary" />
                        )}
                    </div>
                    <div className="ml-4 flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-text truncate">{file.name}</p>
                        <p className="text-xs text-secondary mt-1">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                    </div>
                    <button
                        onClick={removeFile}
                        className="ml-4 p-2 text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                        type="button"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default DragDropUploader;
