import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCategoriesQuery, useGetFoldersQuery, useUploadCertificateMutation, useCreateFolderMutation } from '../app/apiSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderPlus, ChevronRight, X, Check } from 'lucide-react';
import DragDropUploader from '../components/upload/DragDropUploader';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import TagInput from '../components/ui/TagInput';

/**
 * Builds a hierarchical tree from a flat folder array.
 * Returns a flat list of {folder, depth, label} for rendering in <select>.
 */
function buildFolderTree(folders, parentId = null, depth = 0) {
    return folders
        .filter(f => (f.parent?._id || f.parent || null) === parentId)
        .flatMap(f => [
            { folder: f, depth },
            ...buildFolderTree(folders, f._id, depth + 1)
        ]);
}

const Upload = () => {
    // Media & Core
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [issuer, setIssuer] = useState('');

    // Dates & Links
    const [issueDate, setIssueDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [credentialId, setCredentialId] = useState('');
    const [credentialUrl, setCredentialUrl] = useState('');

    // Taxonomy
    const [category, setCategory] = useState('');
    const [folder, setFolder] = useState('');
    const [skills, setSkills] = useState([]);
    const [tags, setTags] = useState([]);
    const [description, setDescription] = useState('');

    // Inline folder creation
    const [showFolderCreate, setShowFolderCreate] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderParent, setNewFolderParent] = useState('');

    const { data: categories } = useGetCategoriesQuery();
    const { data: folders } = useGetFoldersQuery();
    const [uploadCertificate, { isLoading }] = useUploadCertificateMutation();
    const [createFolder, { isLoading: isCreatingFolder }] = useCreateFolderMutation();
    const navigate = useNavigate();

    // Build the hierarchical selection list
    const folderTree = useMemo(() => buildFolderTree(folders || [], null), [folders]);

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        try {
            const result = await createFolder({
                name: newFolderName.trim(),
                parent: newFolderParent || null,
            }).unwrap();
            // Auto-select the newly created folder
            setFolder(result._id);
            setNewFolderName('');
            setNewFolderParent('');
            setShowFolderCreate(false);
        } catch (err) {
            alert(err?.data?.message || 'Failed to create folder');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !title || !issuer) return;

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', title);
            formData.append('issuer', issuer);

            if (issueDate) formData.append('issueDate', issueDate);
            if (expiryDate) formData.append('expiryDate', expiryDate);
            if (credentialId) formData.append('credentialId', credentialId);
            if (credentialUrl) formData.append('credentialUrl', credentialUrl);
            if (description) formData.append('description', description);

            if (category) formData.append('category', category);
            if (folder) formData.append('folder', folder);
            if (skills.length > 0) formData.append('skills', skills.join(','));
            if (tags.length > 0) formData.append('tags', tags.join(','));

            await uploadCertificate(formData).unwrap();
            navigate('/certificates');
        } catch (err) {
            console.error('Failed to upload', err);
            alert(err?.data?.message || 'Failed to upload certificate');
        }
    };

    const handleReset = () => {
        setFile(null); setTitle(''); setIssuer(''); setIssueDate(''); setExpiryDate('');
        setCredentialId(''); setCredentialUrl(''); setCategory(''); setFolder('');
        setSkills([]); setTags([]); setDescription('');
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto"
        >
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Upload Credential</h1>
                <p className="text-secondary mt-1">Add a professional certificate to your vault.</p>
            </div>

            <div className="glass-card p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* File Upload Section */}
                    <div>
                        <label className="block text-sm font-bold tracking-wide text-text mb-3">1. Credential Document *</label>
                        <DragDropUploader file={file} setFile={setFile} />
                    </div>

                    <div className="border-t border-border pt-8 space-y-6">
                        <h3 className="text-sm font-bold tracking-wide text-text uppercase">2. Core Details</h3>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Input
                                label="Certificate Title *"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. AWS Certified Solutions Architect"
                                required
                            />
                            <Input
                                label="Issuing Organization *"
                                value={issuer}
                                onChange={(e) => setIssuer(e.target.value)}
                                placeholder="e.g. Amazon Web Services"
                                required
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Input type="date" label="Issue Date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
                            <Input type="date" label="Expiration Date (Optional)" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Input label="Credential ID" value={credentialId} onChange={(e) => setCredentialId(e.target.value)} placeholder="e.g. ABC123XYZ" />
                            <Input type="url" label="Credential URL" value={credentialUrl} onChange={(e) => setCredentialUrl(e.target.value)} placeholder="https://verify.org/..." />
                        </div>
                    </div>

                    <div className="border-t border-border pt-8 space-y-6">
                        <h3 className="text-sm font-bold tracking-wide text-text uppercase">3. Organization & Skills</h3>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* ── FOLDER SELECTOR ── */}
                            <div>
                                <label className="block text-sm font-medium text-text mb-1.5">Vault Folder</label>
                                <select
                                    value={folder}
                                    onChange={(e) => setFolder(e.target.value)}
                                    className="w-full px-4 py-2 text-text bg-transparent border border-border rounded-lg focus:outline-none focus:ring-1 focus:border-text focus:ring-text transition-colors"
                                >
                                    <option value="" className="bg-bg text-text">📂 Root (Unsorted)</option>
                                    {folderTree.map(({ folder: f, depth }) => (
                                        <option key={f._id} value={f._id} className="bg-bg text-text">
                                            {'\u00A0\u00A0'.repeat(depth * 2)}{depth > 0 ? '└ ' : ''}{f.name}
                                        </option>
                                    ))}
                                </select>

                                {/* Inline Create Folder Toggle */}
                                <button
                                    type="button"
                                    onClick={() => setShowFolderCreate(!showFolderCreate)}
                                    className="mt-2 flex items-center text-xs text-secondary hover:text-text transition-colors gap-1.5"
                                >
                                    <FolderPlus className="w-3.5 h-3.5" />
                                    {showFolderCreate ? 'Cancel' : '+ Create New Folder'}
                                </button>

                                {/* Inline Folder Create Panel */}
                                <AnimatePresence>
                                    {showFolderCreate && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-3 p-3 border border-border rounded-lg bg-black/5 dark:bg-white/5 space-y-3 overflow-hidden"
                                        >
                                            <p className="text-xs font-semibold text-secondary uppercase tracking-wider">New Folder</p>
                                            <input
                                                type="text"
                                                value={newFolderName}
                                                onChange={(e) => setNewFolderName(e.target.value)}
                                                placeholder="Folder name…"
                                                className="w-full px-3 py-1.5 text-sm border border-border rounded-md bg-transparent text-text focus:outline-none focus:border-text"
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateFolder())}
                                            />
                                            <div>
                                                <label className="block text-xs text-secondary mb-1">Parent folder (optional)</label>
                                                <select
                                                    value={newFolderParent}
                                                    onChange={(e) => setNewFolderParent(e.target.value)}
                                                    className="w-full px-3 py-1.5 text-sm border border-border rounded-md bg-bg text-text focus:outline-none"
                                                >
                                                    <option value="">None (Top Level)</option>
                                                    {folderTree.map(({ folder: f, depth }) => (
                                                        <option key={f._id} value={f._id} className="bg-bg text-text">
                                                            {'\u00A0\u00A0'.repeat(depth * 2)}{depth > 0 ? '└ ' : ''}{f.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowFolderCreate(false)}
                                                    className="p-1.5 rounded text-secondary hover:text-text"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleCreateFolder}
                                                    disabled={!newFolderName.trim() || isCreatingFolder}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-text text-bg rounded-md hover:opacity-90 disabled:opacity-40 transition-all"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                    {isCreatingFolder ? 'Creating…' : 'Create'}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* ── CATEGORY ── */}
                            <div>
                                <label className="block text-sm font-medium text-text mb-1.5">Category (Color Tag)</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-2 text-text bg-transparent border border-border rounded-lg focus:outline-none focus:ring-1 focus:border-text focus:ring-text transition-colors"
                                >
                                    <option value="" className="bg-bg text-text">No Category</option>
                                    {categories?.map((c) => (
                                        <option key={c._id} value={c._id} className="bg-bg text-text">{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-text mb-1.5">Skills Acquired</label>
                                <TagInput tags={skills} setTags={setSkills} placeholder="e.g. React, Node.js…" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text mb-1.5">Search Tags</label>
                                <TagInput tags={tags} setTags={setTags} placeholder="e.g. 2024, Bootcamp…" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text mb-1.5">Description / Notes</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add any personal notes about this certification…"
                                className="w-full px-4 py-2 border border-border rounded-lg bg-transparent text-text focus:outline-none focus:border-text transition-colors h-24 resize-none"
                            />
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={handleReset} disabled={isLoading}>
                            Reset Form
                        </Button>
                        <Button type="submit" isLoading={isLoading} disabled={!file || !title || !issuer}>
                            Upload to Vault
                        </Button>
                    </div>

                </form>
            </div>
        </motion.div>
    );
};

export default Upload;
