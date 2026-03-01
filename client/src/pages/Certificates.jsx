import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Grid, List, X, ChevronDown } from 'lucide-react';
import { useGetCertificatesQuery, useGetCategoriesQuery, useGetMeQuery } from '../app/apiSlice';
import CertificateCard from '../components/certificates/CertificateCard';
import EditCertificateModal from '../components/certificates/EditCertificateModal';
import FolderSidebar from '../components/layout/FolderSidebar';
import Loader from '../components/ui/Loader';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const Certificates = () => {
    const { data: user } = useGetMeQuery();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedFolderId, setSelectedFolderId] = useState(null);
    const [sortParam, setSortParam] = useState('-createdAt');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Extra filters
    const [issuer, setIssuer] = useState('');
    const [tag, setTag] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [fileType, setFileType] = useState('');

    // View mode: initialise from user settings, allow local override
    const savedViewMode = user?.settings?.previewMode || 'grid';
    const [viewMode, setViewMode] = useState(savedViewMode);

    // Keep view mode in sync when user data loads
    useEffect(() => {
        if (user?.settings?.previewMode) {
            setViewMode(user.settings.previewMode);
        }
    }, [user?.settings?.previewMode]);

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const queryParams = new URLSearchParams();
    if (debouncedSearch) queryParams.append('q', debouncedSearch);
    if (selectedCategory) queryParams.append('category', selectedCategory);
    if (selectedFolderId) queryParams.append('folder', selectedFolderId);
    if (sortParam) queryParams.append('sort', sortParam);
    if (issuer.trim()) queryParams.append('issuer', issuer.trim());
    if (tag.trim()) queryParams.append('tag', tag.trim());
    if (dateFrom) queryParams.append('dateFrom', dateFrom);
    if (dateTo) queryParams.append('dateTo', dateTo);
    if (fileType) queryParams.append('fileType', fileType);

    const { data, isLoading, isError } = useGetCertificatesQuery(queryParams.toString());
    const { data: categories } = useGetCategoriesQuery();

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedCertForEdit, setSelectedCertForEdit] = useState(null);

    const handleEdit = (cert) => {
        setSelectedCertForEdit(cert);
        setEditModalOpen(true);
    };

    // Active filters for the chips row
    const activeFilters = [
        selectedCategory && { key: 'category', label: `Category: ${categories?.find(c => c._id === selectedCategory)?.name || selectedCategory}`, clear: () => setSelectedCategory('') },
        issuer && { key: 'issuer', label: `Issuer: ${issuer}`, clear: () => setIssuer('') },
        tag && { key: 'tag', label: `Tag: ${tag}`, clear: () => setTag('') },
        dateFrom && { key: 'dateFrom', label: `From: ${dateFrom}`, clear: () => setDateFrom('') },
        dateTo && { key: 'dateTo', label: `To: ${dateTo}`, clear: () => setDateTo('') },
        fileType && { key: 'fileType', label: `Type: ${fileType.toUpperCase()}`, clear: () => setFileType('') },
    ].filter(Boolean);

    const clearAll = () => {
        setSelectedCategory(''); setIssuer(''); setTag('');
        setDateFrom(''); setDateTo(''); setFileType('');
        setDebouncedSearch(''); setSearchTerm('');
    };

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Left Sidebar - Folders */}
            <FolderSidebar selectedFolderId={selectedFolderId} onSelectFolder={setSelectedFolderId} />

            {/* Right Main Content */}
            <div className="flex-1 space-y-6 min-w-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">My Certificates</h1>
                        <p className="text-secondary mt-1">Manage, search, and organize all your documents.</p>
                    </div>
                </div>

                {/* ── Filter & Search Bar ─────────────────────────────────── */}
                <div className="glass-card p-4 space-y-4">
                    {/* Row 1: Search + sort + view toggles */}
                    <div className="flex flex-col md:flex-row gap-3 items-center">
                        {/* Search */}
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                            <input
                                type="text"
                                placeholder="Search by title or tags..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-transparent text-text focus:outline-none focus:border-text transition-colors text-sm"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-text">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Sort */}
                        <select
                            value={sortParam}
                            onChange={(e) => setSortParam(e.target.value)}
                            className="px-3 py-2 border border-border rounded-lg bg-bg text-sm focus:outline-none focus:border-text flex-shrink-0"
                        >
                            <option value="-createdAt">Newest First</option>
                            <option value="createdAt">Oldest First</option>
                            <option value="name_asc">Name (A–Z)</option>
                            <option value="name_desc">Name (Z–A)</option>
                            <option value="size_desc">Largest File</option>
                            <option value="size_asc">Smallest File</option>
                        </select>

                        {/* Filters toggle */}
                        <button
                            onClick={() => setShowFilters(v => !v)}
                            className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm transition-all flex-shrink-0 ${showFilters || activeFilters.length > 0
                                ? 'border-text bg-text text-bg font-semibold'
                                : 'border-border text-secondary hover:border-text hover:text-text'
                                }`}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>

                        {/* View Mode Toggle */}
                        <div className="flex items-center border border-border rounded-lg overflow-hidden flex-shrink-0">
                            <button onClick={() => setViewMode('grid')}
                                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-text text-bg' : 'text-secondary hover:text-text'}`} title="Grid view">
                                <Grid className="w-4 h-4" />
                            </button>
                            <button onClick={() => setViewMode('list')}
                                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-text text-bg' : 'text-secondary hover:text-text'}`} title="List view">
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Row 2: Expanded filter panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {/* Category */}
                                    <div>
                                        <label className="text-xs text-secondary font-medium block mb-1">Category</label>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-full px-3 py-2 border border-border rounded-lg bg-bg text-sm focus:outline-none focus:border-text"
                                        >
                                            <option value="">All Categories</option>
                                            {categories?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                    </div>

                                    {/* Issuer */}
                                    <div>
                                        <label className="text-xs text-secondary font-medium block mb-1">Issuer</label>
                                        <input
                                            value={issuer}
                                            onChange={e => setIssuer(e.target.value)}
                                            placeholder="e.g. Google, Coursera…"
                                            className="w-full px-3 py-2 border border-border rounded-lg bg-transparent text-sm focus:outline-none focus:border-text"
                                        />
                                    </div>

                                    {/* Tag */}
                                    <div>
                                        <label className="text-xs text-secondary font-medium block mb-1">Tag</label>
                                        <input
                                            value={tag}
                                            onChange={e => setTag(e.target.value)}
                                            placeholder="e.g. React, Python…"
                                            className="w-full px-3 py-2 border border-border rounded-lg bg-transparent text-sm focus:outline-none focus:border-text"
                                        />
                                    </div>

                                    {/* Date From */}
                                    <div>
                                        <label className="text-xs text-secondary font-medium block mb-1">Issue Date — From</label>
                                        <input
                                            type="date"
                                            value={dateFrom}
                                            onChange={e => setDateFrom(e.target.value)}
                                            className="w-full px-3 py-2 border border-border rounded-lg bg-transparent text-sm focus:outline-none focus:border-text"
                                        />
                                    </div>

                                    {/* Date To */}
                                    <div>
                                        <label className="text-xs text-secondary font-medium block mb-1">Issue Date — To</label>
                                        <input
                                            type="date"
                                            value={dateTo}
                                            onChange={e => setDateTo(e.target.value)}
                                            className="w-full px-3 py-2 border border-border rounded-lg bg-transparent text-sm focus:outline-none focus:border-text"
                                        />
                                    </div>

                                    {/* File Type pills */}
                                    <div>
                                        <label className="text-xs text-secondary font-medium block mb-1">File Type</label>
                                        <div className="flex gap-2">
                                            {[['', 'All'], ['pdf', 'PDF'], ['image', 'Image']].map(([val, lbl]) => (
                                                <button key={val} onClick={() => setFileType(val)}
                                                    className={`flex-1 py-2 rounded-lg border text-xs transition-all ${fileType === val
                                                        ? 'border-text bg-text text-bg font-semibold'
                                                        : 'border-border text-secondary hover:border-text/40'
                                                        }`}
                                                >{lbl}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Row 3: Active filter chips */}
                    {activeFilters.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
                            {activeFilters.map(f => (
                                <span key={f.key}
                                    className="flex items-center gap-1 text-xs px-2.5 py-1 bg-text/10 border border-text/20 rounded-full text-text">
                                    {f.label}
                                    <button onClick={f.clear} className="hover:text-red-400 ml-0.5">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            <button onClick={clearAll}
                                className="text-xs text-secondary hover:text-red-400 underline underline-offset-2 transition-colors ml-1">
                                Clear all
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Grid / List */}
                {isLoading ? (
                    <div className="py-20 flex justify-center"><Loader size="lg" /></div>
                ) : isError ? (
                    <div className="text-center text-red-500 py-10">Error loading certificates</div>
                ) : data?.data?.length === 0 ? (
                    <div className="text-center text-secondary py-20 glass-card">
                        No certificates found matching your criteria.
                    </div>
                ) : viewMode === 'grid' ? (
                    <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {data?.data.map((cert) => (
                                <CertificateCard key={cert._id} certificate={cert} onEdit={handleEdit} />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    // ── List View ──────────────────────────────────────────────
                    <motion.div layout className="flex flex-col gap-3">
                        <AnimatePresence>
                            {data?.data.map((cert) => (
                                <motion.div
                                    key={cert._id}
                                    layout
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    className="glass-card flex items-center gap-4 p-4 hover:border-text transition-colors group"
                                >
                                    {/* Thumbnail */}
                                    <div className="w-14 h-14 rounded-lg border border-border bg-black/5 dark:bg-white/5 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                        {cert.fileType?.includes('pdf') ? (
                                            <span className="text-xl">📄</span>
                                        ) : (
                                            <img src={cert.fileUrl} alt={cert.title} className="w-full h-full object-cover" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm truncate">{cert.title}</h4>
                                        <p className="text-xs text-secondary mt-0.5 truncate">
                                            {cert.issuer} {cert.issueDate && `• ${new Date(cert.issueDate).getFullYear()}`}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            {cert.folder && <span className="text-[10px] px-1.5 py-0.5 bg-border rounded-full">📁 {cert.folder.name}</span>}
                                            {cert.category && <span className="text-[10px] px-1.5 py-0.5 bg-border rounded-full">{cert.category.name}</span>}
                                            {cert.tags?.map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 bg-border/60 rounded-full">{t}</span>)}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {cert.credentialUrl && (
                                            <button onClick={() => window.open(cert.credentialUrl, '_blank')}
                                                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-secondary hover:text-text" title="Verify">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                            </button>
                                        )}
                                        <button onClick={() => handleEdit(cert)}
                                            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-secondary hover:text-text" title="Edit">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Edit Modal */}
                <EditCertificateModal
                    isOpen={editModalOpen}
                    onClose={() => { setEditModalOpen(false); setSelectedCertForEdit(null); }}
                    certificate={selectedCertForEdit}
                />
            </div>
        </div>
    );
};

export default Certificates;

