import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, Smartphone, FolderSync, Search, BarChart3, Cloud, Share2, Layers } from 'lucide-react';
import Button from '../components/ui/Button';

const LandingPage = () => {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    return (
        <div className="min-h-screen bg-bg text-text selection:bg-text selection:text-bg">
            {/* 🧭 1. Navigation */}
            <nav className="fixed w-full z-50 top-0 border-b border-border bg-bg/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-text text-bg rounded flex items-center justify-center font-bold">
                            C
                        </div>
                        <span className="text-xl font-bold tracking-tight">CertVault<span className="text-secondary">.</span></span>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/login" className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium hover:text-secondary transition-colors">
                            Log In
                        </Link>
                        <Link to="/register">
                            <Button size="sm">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* 🧭 1. HERO SECTION */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
                <motion.div {...fadeIn} className="max-w-4xl mx-auto space-y-8">

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight tight-leading">
                        Organize, Secure, and Access All Your Certificates in <span className="underline decoration-4 underline-offset-8 decoration-border">One Vault.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-secondary max-w-2xl mx-auto leading-relaxed">
                        Store, categorize, preview, and download all your certificates with a premium modern dashboard — built for students, developers, and professionals.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link to="/register">
                            <Button size="lg" className="w-full sm:w-auto text-lg px-8">
                                Get Started <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8">
                                Live Demo
                            </Button>
                        </Link>
                    </div>

                    <div className="pt-12 flex flex-wrap justify-center gap-4 sm:gap-8 text-sm font-medium text-secondary">
                        <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Secure Cloud Storage</div>
                        <div className="flex items-center gap-2"><Layers className="w-4 h-4" /> AI Smart Tagging</div>
                        <div className="flex items-center gap-2"><Zap className="w-4 h-4" /> Lightning Fast Search</div>
                        <div className="flex items-center gap-2"><Smartphone className="w-4 h-4" /> Fully Responsive</div>
                    </div>
                </motion.div>
            </section>

            {/* 💡 2. PROBLEM → SOLUTION SECTION */}
            <section className="py-20 bg-text text-bg px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="space-y-4">
                        <h2 className="text-3xl font-bold text-gray-400">The Problem</h2>
                        <p className="text-xl md:text-2xl font-medium leading-relaxed max-w-3xl mx-auto">
                            "Certificates are scattered across emails, drives, and folders. Finding them during interviews or submissions is stressful and time-consuming."
                        </p>
                    </motion.div>

                    <div className="w-px h-16 bg-gray-600 mx-auto" />

                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="space-y-4">
                        <h2 className="text-3xl font-bold">The Solution</h2>
                        <p className="text-xl md:text-2xl font-medium leading-relaxed max-w-3xl mx-auto">
                            CertVault centralizes all certificates into one intelligent dashboard with smart search, categories, and instant previews.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* 🌟 3. CORE FEATURES SECTION */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need. Nothing you don't.</h2>
                    <p className="text-secondary text-lg">Powerful features wrapped in a beautifully simple interface.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { icon: FolderSync, title: "Smart Certificate Manager", desc: "Upload, rename, categorize, and tag certificates easily in one unified view." },
                        { icon: Search, title: "Instant Search & Filters", desc: "Find any certificate in milliseconds using custom tags & category filters." },
                        { icon: BarChart3, title: "Analytics Dashboard", desc: "Track total certificates, categories, and monitor your cloud storage usage." },
                        { icon: Cloud, title: "Secure Cloud Storage", desc: "Safe, encrypted file storage ensuring protected private access at all times." },
                        { icon: Share2, title: "Public Share Links", desc: "Generate secure, expiring shareable links for certificates to prove your credentials." },
                        { icon: ShieldCheck, title: "Role-Based Access", desc: "Granular control with JWT authentication and protected administrative routes." }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-6 md:p-8 rounded-2xl border border-border bg-card hover:border-text transition-colors group"
                        >
                            <div className="w-12 h-12 bg-bg border border-border rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <feature.icon className="w-6 h-6 text-text" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-secondary leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 🧠 5. HOW IT WORKS */}
            <section className="py-24 bg-card border-y border-border px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
                        <p className="text-secondary text-lg">Three simple steps to credential mastery.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-border z-0" />
                        {[
                            { step: "1", title: "Upload Certificates", desc: "Drag & drop PDFs or images into your secure personal vault." },
                            { step: "2", title: "Organize Smartly", desc: "Add categories, smart tags, and details instantly." },
                            { step: "3", title: "Access Anytime", desc: "Preview, download, or share certificates securely from any device." }
                        ].map((item, i) => (
                            <div key={i} className="relative z-10 flex flex-col items-center text-center space-y-4">
                                <div className="w-24 h-24 bg-bg border-4 border-card rounded-full flex items-center justify-center text-3xl font-black shadow-sm">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold">{item.title}</h3>
                                <p className="text-secondary max-w-xs">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 🏢 7. USE CASES SECTION */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <h2 className="text-3xl md:text-5xl font-bold leading-tight">Built for everyone who learns.</h2>
                        <div className="space-y-6">
                            <div className="p-6 border border-border rounded-xl bg-card">
                                <h3 className="text-lg font-bold mb-2">🎓 Students</h3>
                                <p className="text-secondary">Keep track of internships, hackathons, and extracurricular course certificates in one clean portfolio.</p>
                            </div>
                            <div className="p-6 border border-border rounded-xl bg-card">
                                <h3 className="text-lg font-bold mb-2">👨‍💻 Developers</h3>
                                <p className="text-secondary">Organize coding bootcamp diplomas, AWS/Azure certifications, and technical credentials.</p>
                            </div>
                            <div className="p-6 border border-border rounded-xl bg-card">
                                <h3 className="text-lg font-bold mb-2">🧑‍💼 Professionals</h3>
                                <p className="text-secondary">Maintain verified credentials, HR compliances, and continuing education credits for career growth.</p>
                            </div>
                        </div>
                    </div>

                    {/* 4. PREMIUM UI SHOWCASE - Abstract Mockup */}
                    <div className="relative h-[600px] w-full rounded-2xl bg-gradient-to-tr from-card to-bg border border-border overflow-hidden shadow-2xl">
                        <div className="absolute top-8 left-8 right-8 bottom-0 bg-text rounded-t-xl overflow-hidden shadow-2xl transform transition-transform hover:-translate-y-2">
                            <div className="h-6 bg-black/10 flex items-center px-4 gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="h-8 w-1/3 bg-bg/10 rounded" />
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="h-24 bg-bg/10 rounded-lg" />
                                    <div className="h-24 bg-bg/10 rounded-lg" />
                                    <div className="h-24 bg-bg/10 rounded-lg" />
                                </div>
                                <div className="h-48 bg-bg/10 rounded-lg" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 🚀 CTA FOOTER */}
            <section className="py-24 bg-text text-bg text-center px-4">
                <div className="max-w-3xl mx-auto space-y-8">
                    <h2 className="text-4xl md:text-5xl font-bold">Ready to secure your credentials?</h2>
                    <p className="text-xl text-gray-400">Join thousands of professionals organizing their certificates with CertVault.</p>
                    <Link to="/register" className="inline-block pt-4">
                        <button className="bg-bg text-text text-lg font-bold px-8 py-4 rounded-xl hover:scale-105 transition-transform">
                            Start Managing Certificates
                        </button>
                    </Link>
                </div>
            </section>

            <footer className="py-8 text-center text-sm text-secondary border-t border-border">
                <p>© {new Date().getFullYear()} CertVault. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
