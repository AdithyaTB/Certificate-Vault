import { motion } from 'framer-motion';
import { ExternalLink, Edit2, Trash2, FileText, Building2, Calendar, Award } from 'lucide-react';
import { useDeleteCertificateMutation } from '../../app/apiSlice';
import Button from '../ui/Button';

const CertificateCard = ({ certificate, onEdit, onShare }) => {
    const [deleteCertificate, { isLoading: isDeleting }] = useDeleteCertificateMutation();

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this certificate?')) {
            try {
                await deleteCertificate(certificate._id).unwrap();
            } catch (err) {
                console.error('Failed to delete', err);
                alert('Failed to delete certificate');
            }
        }
    };

    const handleViewCertificate = () => {
        // Prefer the official credential URL, fall back to the raw document
        const target = certificate.credentialUrl || certificate.fileUrl;
        window.open(target, '_blank');
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -4 }}
            className="glass-card flex flex-col overflow-hidden group border hover:border-text transition-colors"
        >
            {/* Thumbnail Area */}
            <div
                className="relative h-48 bg-black/5 dark:bg-white/5 border-b border-border flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={handleViewCertificate}
            >
                {certificate.fileType?.includes('pdf') ? (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-900">
                        <div className="flex flex-col items-center opacity-70">
                            <FileText className="w-16 h-16 text-red-500 mb-2" />
                            <span className="text-xs font-semibold tracking-widest text-secondary uppercase">PDF Document</span>
                        </div>
                    </div>
                ) : (
                    <img
                        src={certificate.fileUrl}
                        alt={certificate.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                )}

                {/* Hover overlay actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleViewCertificate(); }}
                        className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform shadow-lg"
                        title={certificate.credentialUrl ? 'View Credential' : 'View Document'}
                    >
                        <ExternalLink className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4">
                    <h3 className="font-bold text-lg text-text leading-tight mb-2 line-clamp-2" title={certificate.title}>
                        {certificate.title}
                    </h3>

                    {certificate.issuer && (
                        <div className="flex items-center text-sm text-secondary font-medium mb-1">
                            <Building2 className="w-4 h-4 mr-2 opacity-70" />
                            <span className="truncate">{certificate.issuer}</span>
                        </div>
                    )}

                    {certificate.issueDate && (
                        <div className="flex items-center text-xs text-secondary mb-1">
                            <Calendar className="w-3.5 h-3.5 mr-2 opacity-70" />
                            <span>
                                Issued {new Date(certificate.issueDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                {certificate.expiryDate && ` - Expires ${new Date(certificate.expiryDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}`}
                            </span>
                        </div>
                    )}

                    {certificate.credentialId && (
                        <div className="flex items-center text-xs text-secondary mt-1 overflow-hidden">
                            <Award className="w-3.5 h-3.5 mr-2 opacity-70 flex-shrink-0" />
                            <span className="truncate">ID: <span className="font-mono text-[10px] bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded">{certificate.credentialId}</span></span>
                        </div>
                    )}
                </div>

                {/* Taxonomy Row */}
                <div className="flex flex-wrap items-center gap-2 mb-3 mt-auto pt-2">
                    {certificate.folder && (
                        <span className="px-2 py-0.5 text-[10px] bg-bg border border-border rounded-full whitespace-nowrap hidden sm:inline-block">
                            📁 {certificate.folder.name}
                        </span>
                    )}

                    {certificate.category && (
                        <span
                            className="px-2 py-0.5 text-[10px] rounded-full whitespace-nowrap font-medium"
                            style={{
                                backgroundColor: `${certificate.category.color}20`,
                                color: certificate.category.color,
                                border: `1px solid ${certificate.category.color}40`
                            }}
                        >
                            {certificate.category.name}
                        </span>
                    )}
                </div>

                {/* Skills/Tags */}
                {(certificate.skills?.length > 0 || certificate.tags?.length > 0) && (
                    <div className="flex flex-wrap gap-1 mb-4">
                        {certificate.skills?.slice(0, 2).map((skill, i) => (
                            <span key={`skill-${i}`} className="text-[10px] px-1.5 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded font-medium">
                                {skill}
                            </span>
                        ))}
                        {certificate.tags?.slice(0, 2).map((tag, i) => (
                            <span key={`tag-${i}`} className="text-[10px] px-1.5 py-0.5 bg-border text-secondary rounded">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(certificate)}
                        className="text-text bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-3 py-1.5 rounded-md"
                    >
                        <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                        Edit
                    </Button>
                    <div className="flex gap-2">
                        {certificate.credentialUrl && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(certificate.credentialUrl, '_blank')}
                                className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 px-2 py-1.5 rounded-md"
                                title="Verify Credential"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDelete}
                            isLoading={isDeleting}
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10 px-2 py-1.5 rounded-md"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CertificateCard;
