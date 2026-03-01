import { useState, useEffect, useMemo } from 'react';
import { useUpdateCertificateMutation, useGetCategoriesQuery, useGetFoldersQuery } from '../../app/apiSlice';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import TagInput from '../ui/TagInput';


function buildFolderTree(folders, parentId = null, depth = 0) {
    return folders
        .filter(f => (f.parent?._id || f.parent || null) === parentId)
        .flatMap(f => [
            { folder: f, depth },
            ...buildFolderTree(folders, f._id, depth + 1)
        ]);
}

const EditCertificateModal = ({ isOpen, onClose, certificate }) => {
    // Core
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

    const { data: categories } = useGetCategoriesQuery();
    const { data: folders } = useGetFoldersQuery();
    const [updateCertificate, { isLoading }] = useUpdateCertificateMutation();
    const folderTree = useMemo(() => buildFolderTree(folders || [], null), [folders]);

    useEffect(() => {
        if (certificate) {
            setTitle(certificate.title || '');
            setIssuer(certificate.issuer || '');

            // Format dates for input[type="date"]
            const formatDate = (dateStr) => {
                if (!dateStr) return '';
                const d = new Date(dateStr);
                return isNaN(d) ? '' : d.toISOString().split('T')[0];
            };

            setIssueDate(formatDate(certificate.issueDate));
            setExpiryDate(formatDate(certificate.expiryDate));
            setCredentialId(certificate.credentialId || '');
            setCredentialUrl(certificate.credentialUrl || '');
            setDescription(certificate.description || '');

            setCategory(certificate.category?._id || certificate.category || '');
            setFolder(certificate.folder?._id || certificate.folder || '');

            setSkills(certificate.skills || []);
            setTags(certificate.tags || []);
        }
    }, [certificate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !issuer) return;

        try {
            await updateCertificate({
                id: certificate._id,
                title,
                issuer,
                issueDate: issueDate || null,
                expiryDate: expiryDate || null,
                credentialId,
                credentialUrl,
                description,
                category: category || null,
                folder: folder || null,
                skills,
                tags
            }).unwrap();
            onClose();
        } catch (err) {
            console.error('Failed to update', err);
            alert('Failed to update certificate details');
        }
    };

    if (!certificate) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Credential Details">
            {/* Using a max-h view to prevent massive modals */}
            <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1 scrollbar-thin">

                <div className="space-y-4">
                    <h4 className="text-xs font-bold tracking-wider text-secondary uppercase border-b border-border pb-2">Core Details</h4>
                    <Input
                        label="Certificate Title *"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <Input
                        label="Issuing Organization *"
                        value={issuer}
                        onChange={(e) => setIssuer(e.target.value)}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="date"
                            label="Issue Date"
                            value={issueDate}
                            onChange={(e) => setIssueDate(e.target.value)}
                        />
                        <Input
                            type="date"
                            label="Expiry Date"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold tracking-wider text-secondary uppercase border-b border-border pb-2">Verification</h4>
                    <Input
                        label="Credential ID"
                        value={credentialId}
                        onChange={(e) => setCredentialId(e.target.value)}
                    />
                    <Input
                        type="url"
                        label="Credential URL"
                        value={credentialUrl}
                        onChange={(e) => setCredentialUrl(e.target.value)}
                    />
                </div>

                <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold tracking-wider text-secondary uppercase border-b border-border pb-2">Organization</h4>

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
                                    {`\u00A0\u00A0`.repeat(depth * 2)}{depth > 0 ? '└ ' : ''}{f.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text mb-1.5">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2 text-text bg-transparent border border-border rounded-lg focus:outline-none focus:ring-1 focus:border-text focus:ring-text transition-colors"
                        >
                            <option value="" className="bg-bg text-text">None</option>
                            {categories?.map((c) => (
                                <option key={c._id} value={c._id} className="bg-bg text-text">
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text mb-1.5">Skills Acquired</label>
                        <TagInput tags={skills} setTags={setSkills} placeholder="Add skills..." />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text mb-1.5">Search Tags</label>
                        <TagInput tags={tags} setTags={setTags} placeholder="Add tags..." />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text mb-1.5">Description Notes</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-lg bg-transparent text-text focus:outline-none focus:border-text transition-colors h-20 resize-none text-sm"
                        />
                    </div>
                </div>

                <div className="pt-6 pb-2 flex justify-end gap-3 sticky bottom-0 bg-bg border-t border-border mt-6">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading} disabled={!title || !issuer}>
                        Save Details
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditCertificateModal;
