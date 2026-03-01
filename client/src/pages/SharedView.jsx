import { useParams, Link } from 'react-router-dom';
import { useGetPublicCertificateQuery } from '../app/apiSlice';
import Loader from '../components/ui/Loader';
import { FileText, FileBadge, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const SharedView = () => {
    const { token } = useParams();
    const { data: certificate, isLoading, isError, error } = useGetPublicCertificateQuery(token);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-bg text-text">
                <Loader size="lg" />
            </div>
        );
    }

    if (isError || !certificate) {
        return (
            <div className="min-h-screen bg-bg text-text flex flex-col items-center justify-center p-4">
                <div className="glass-card p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h1 className="text-xl font-bold mb-2">Link Expired or Invalid</h1>
                    <p className="text-secondary mb-6">
                        {error?.data?.message || "This shared certificate link is no longer valid or doesn't exist."}
                    </p>
                    <Link to="/" className="text-text hover:underline font-medium">
                        Return to Homepage
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg text-text py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 md:p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center space-x-2 text-secondary mb-2">
                                <FileBadge className="w-5 h-5" />
                                <span className="font-medium text-sm tracking-widest uppercase">Verified Certificate</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-text">{certificate.title}</h1>
                        </div>

                        <a
                            href={certificate.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-4 py-2 bg-text text-bg rounded-lg font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download Original
                        </a>
                    </div>

                    <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                        {/* Visual Preview */}
                        <div className="w-full md:w-2/3 bg-black/5 dark:bg-white/5 rounded-xl border border-border flex items-center justify-center min-h-[400px] overflow-hidden">
                            {certificate.fileType.includes('pdf') ? (
                                <iframe
                                    src={certificate.fileUrl}
                                    width="100%"
                                    height="600px"
                                    title={certificate.title}
                                    className="border-0"
                                />
                            ) : (
                                <img
                                    src={certificate.fileUrl}
                                    alt={certificate.title}
                                    className="w-full h-auto object-contain max-h-[600px]"
                                />
                            )}
                        </div>

                        {/* Metadata Sidebar */}
                        <div className="w-full md:w-1/3 space-y-6">
                            <div>
                                <h3 className="text-sm font-medium text-secondary mb-1">Uploaded On</h3>
                                <p className="text-text">{new Date(certificate.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</p>
                            </div>

                            {certificate.category && (
                                <div>
                                    <h3 className="text-sm font-medium text-secondary mb-2">Category</h3>
                                    <span
                                        className="inline-block px-3 py-1 rounded-full text-sm font-medium"
                                        style={{
                                            backgroundColor: `${certificate.category.color}20`,
                                            color: certificate.category.color,
                                            border: `1px solid ${certificate.category.color}40`
                                        }}
                                    >
                                        {certificate.category.name}
                                    </span>
                                </div>
                            )}

                            {certificate.tags && certificate.tags.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-secondary mb-2">Related Skills & Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {certificate.tags.map((tag, i) => (
                                            <span key={i} className="text-xs px-2 py-1 bg-border text-text rounded">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 border-t border-border text-center text-sm text-secondary flex items-center justify-center space-x-2">
                        <span>Powered securely by</span>
                        <Link to="/" className="font-bold flex items-center text-text hover:opacity-80 transition-opacity">
                            CertVault<span className="text-gray-400">.</span>
                        </Link>
                    </div>

                </motion.div>
            </div>
        </div>
    );
};

export default SharedView;
