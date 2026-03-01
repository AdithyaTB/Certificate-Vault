import { useState, useMemo } from 'react';
import { useGetFoldersQuery, useCreateFolderMutation, useDeleteFolderMutation } from '../../app/apiSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, FolderOpen, FolderPlus, Trash2, LayoutGrid, AlertCircle, Plus, ChevronRight, X } from 'lucide-react';

/** Recursively render a sub-tree of folders */
const FolderNode = ({ folder, allFolders, depth, selectedFolderId, onSelectFolder, onDelete, onAddSubFolder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const children = useMemo(
        () => allFolders.filter(f => (f.parent?._id || f.parent) === folder._id),
        [allFolders, folder._id]
    );
    const isSelected = selectedFolderId === folder._id;
    const hasChildren = children.length > 0;

    return (
        <div>
            <div className={`group flex items-center w-full rounded-lg ${isSelected ? 'bg-black/10 dark:bg-white/10' : ''}`}>
                {/* Expand toggle */}
                <button
                    type="button"
                    onClick={() => setIsOpen(o => !o)}
                    className={`p-1.5 flex-shrink-0 transition-colors ${hasChildren ? 'text-secondary hover:text-text' : 'text-transparent pointer-events-none'}`}
                    style={{ marginLeft: `${depth * 12}px` }}
                >
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </button>

                {/* Folder select button */}
                <button
                    onClick={() => onSelectFolder(folder._id)}
                    className={`flex-1 flex items-center gap-2 py-2 pr-2 text-sm transition-colors text-left truncate ${isSelected ? 'font-medium text-text' : 'text-secondary hover:text-text'
                        }`}
                >
                    {isOpen || isSelected
                        ? <FolderOpen className="w-4 h-4 flex-shrink-0 opacity-80" />
                        : <Folder className="w-4 h-4 flex-shrink-0 opacity-70" />
                    }
                    <span className="truncate">{folder.name}</span>
                    {hasChildren && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-black/10 dark:bg-white/10 rounded-full ml-auto flex-shrink-0">
                            {children.length}
                        </span>
                    )}
                </button>

                {/* Action buttons */}
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pr-1">
                    <button
                        type="button"
                        onClick={() => onAddSubFolder(folder._id)}
                        className="p-1.5 text-secondary hover:text-text hover:bg-black/5 dark:hover:bg-white/5 rounded"
                        title="Add sub-folder"
                    >
                        <FolderPlus className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => onDelete(e, folder._id)}
                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded"
                        title="Delete folder"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Children */}
            <AnimatePresence>
                {isOpen && hasChildren && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        {children.map(child => (
                            <FolderNode
                                key={child._id}
                                folder={child}
                                allFolders={allFolders}
                                depth={depth + 1}
                                selectedFolderId={selectedFolderId}
                                onSelectFolder={onSelectFolder}
                                onDelete={onDelete}
                                onAddSubFolder={onAddSubFolder}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FolderSidebar = ({ selectedFolderId, onSelectFolder }) => {
    const { data: folders, isLoading, error } = useGetFoldersQuery();
    const [createFolder, { isLoading: isCreating }] = useCreateFolderMutation();
    const [deleteFolder] = useDeleteFolderMutation();

    // New folder creation state
    const [addingParentId, setAddingParentId] = useState(undefined); // undefined = closed, null = top-level, string = sub-folder
    const [newFolderName, setNewFolderName] = useState('');

    const topLevelFolders = useMemo(
        () => (folders || []).filter(f => !f.parent),
        [folders]
    );

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;
        try {
            await createFolder({ name: newFolderName.trim(), parent: addingParentId || null }).unwrap();
            setNewFolderName('');
            setAddingParentId(undefined);
        } catch (err) {
            console.error('Failed to create folder:', err);
        }
    };

    const handleDeleteFolder = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Delete this folder? Certificates inside will be moved to root.')) {
            try {
                await deleteFolder(id).unwrap();
                if (selectedFolderId === id) onSelectFolder(null);
            } catch (err) {
                console.error('Failed to delete folder:', err);
            }
        }
    };

    const handleAddSubFolder = (parentId) => {
        setAddingParentId(parentId);
        setNewFolderName('');
    };

    const parentName = addingParentId
        ? folders?.find(f => f._id === addingParentId)?.name
        : null;

    return (
        <div className="w-full md:w-60 flex-shrink-0 flex flex-col gap-2">
            <h2 className="text-xs font-bold tracking-widest text-secondary uppercase px-2 mb-1">Vault Folders</h2>

            {/* All Certificates */}
            <button
                onClick={() => onSelectFolder(null)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${selectedFolderId === null
                        ? 'bg-text text-bg font-medium'
                        : 'text-text hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
            >
                <LayoutGrid className="w-4 h-4 opacity-70 flex-shrink-0" />
                All Certificates
            </button>

            {/* Folder Tree */}
            <div className="flex flex-col">
                {isLoading ? (
                    <div className="p-3 text-center text-secondary text-sm animate-pulse">Loading…</div>
                ) : error ? (
                    <div className="p-3 text-red-500 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Error loading folders
                    </div>
                ) : topLevelFolders.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-secondary">No folders yet. Create one!</p>
                ) : (
                    topLevelFolders.map(folder => (
                        <FolderNode
                            key={folder._id}
                            folder={folder}
                            allFolders={folders || []}
                            depth={0}
                            selectedFolderId={selectedFolderId}
                            onSelectFolder={onSelectFolder}
                            onDelete={handleDeleteFolder}
                            onAddSubFolder={handleAddSubFolder}
                        />
                    ))
                )}
            </div>

            {/* New Folder Input Panel */}
            <div className="mt-1 px-1">
                {addingParentId === undefined ? (
                    <button
                        onClick={() => { setAddingParentId(null); setNewFolderName(''); }}
                        className="flex items-center gap-2 text-sm text-secondary hover:text-text transition-colors w-full p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                    >
                        <FolderPlus className="w-4 h-4" />
                        <span>New Folder</span>
                    </button>
                ) : (
                    <form onSubmit={handleCreateFolder} className="space-y-2 p-3 bg-black/5 dark:bg-white/5 border border-border rounded-lg">
                        <p className="text-[10px] font-semibold text-secondary uppercase tracking-wider">
                            {parentName ? `Sub-folder of "${parentName}"` : 'New Top-Level Folder'}
                        </p>
                        <input
                            type="text"
                            placeholder="Folder name…"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            className="w-full bg-bg border border-border rounded px-3 py-1.5 text-sm text-text focus:outline-none focus:border-text transition-colors"
                            autoFocus
                            disabled={isCreating}
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setAddingParentId(undefined)}
                                className="p-1.5 text-secondary hover:text-text rounded"
                                disabled={isCreating}
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="submit"
                                className="bg-text text-bg text-xs font-medium px-3 py-1 rounded flex items-center gap-1 hover:opacity-90 disabled:opacity-50"
                                disabled={isCreating || !newFolderName.trim()}
                            >
                                <Plus className="w-3 h-3" />
                                {isCreating ? 'Creating…' : 'Create'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default FolderSidebar;
