import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Shield, Palette, FolderOpen, BarChart2, Bell, Globe,
    Camera, Check, AlertCircle, Eye, EyeOff, Sun, Moon, Monitor,
    Linkedin, Github, Twitter, Link
} from 'lucide-react';
import { useGetMeQuery, useUpdateProfileMutation, useChangePasswordMutation } from '../app/apiSlice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

// ── Reusable Components ───────────────────────────────────────────────────────
const SectionCard = ({ title, description, children }) => (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="border-b border-border/50 pb-4">
            <h3 className="font-bold text-text text-base">{title}</h3>
            {description && <p className="text-sm text-secondary mt-0.5">{description}</p>}
        </div>
        <div className="space-y-4">{children}</div>
    </div>
);

const Toggle = ({ checked, onChange, label, description }) => (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border/40 last:border-0">
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text">{label}</p>
            {description && <p className="text-xs text-secondary mt-0.5 leading-relaxed">{description}</p>}
        </div>
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 mt-0.5 ${checked ? 'bg-text' : 'bg-border'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-bg transition-transform shadow ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);



// ── Tab Definitions ───────────────────────────────────────────────────────────
const TABS = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'security', icon: Shield, label: 'Security' },
    { id: 'appearance', icon: Palette, label: 'Appearance' },
    { id: 'certificates', icon: FolderOpen, label: 'Cert Prefs' },
    { id: 'analytics', icon: BarChart2, label: 'Analytics' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'privacy', icon: Globe, label: 'Privacy' },
];

// ── Page ─────────────────────────────────────────────────────────────────────
const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const { data: user, isLoading } = useGetMeQuery();
    const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
    const [changePassword, { isLoading: isChangingPw }] = useChangePasswordMutation();
    const avatarInputRef = useRef(null);

    // ── Profile ──
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [website, setWebsite] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [github, setGithub] = useState('');
    const [twitter, setTwitter] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');

    // ── Security ──
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [showPw, setShowPw] = useState(false);

    // ── App Settings ──
    const [defaultVisibility, setDefaultVisibility] = useState('private');
    const [previewMode, setPreviewMode] = useState('grid');
    const [notif, setNotif] = useState({ emailOnUpload: true, emailOnShare: true, monthlyReport: false, weeklyEmailReport: false });
    const [privacy, setPrivacy] = useState({ publicProfile: false, privateCertificates: true, hideIssuerDetails: false, disableDownloads: false });
    const [analytics, setAnalytics] = useState({ showUploadTrend: true, showSkillsChart: true, showFolderChart: true });

    // ── Appearance ──
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    const [compactMode, setCompactMode] = useState(() => localStorage.getItem('compactMode') === 'true');
    const [fontSize, setFontSize] = useState(() => localStorage.getItem('fontSize') || 'medium');

    // Populate from user
    useEffect(() => {
        if (!user) return;
        setName(user.name || '');
        setBio(user.bio || '');
        setWebsite(user.website || '');
        setLinkedin(user.social?.linkedin || '');
        setGithub(user.social?.github || '');
        setTwitter(user.social?.twitter || '');
        setAvatarPreview(user.avatar || '');
        setDefaultVisibility(user.settings?.defaultVisibility || 'private');
        setPreviewMode(user.settings?.previewMode || 'grid');
        if (user.settings?.notifications) setNotif(prev => ({ ...prev, ...user.settings.notifications }));
        if (user.settings?.privacy) setPrivacy(prev => ({ ...prev, ...user.settings.privacy }));
        if (user.settings?.analytics) setAnalytics(prev => ({ ...prev, ...user.settings.analytics }));
    }, [user]);

    // ── Avatar preview on file select ──
    const handleAvatarChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setAvatarFile(f);
        setAvatarPreview(URL.createObjectURL(f));
    };

    // ── Profile save (FormData so avatar goes to Cloudinary) ──
    const handleSaveProfile = async () => {
        try {
            const fd = new FormData();
            fd.append('name', name);
            fd.append('bio', bio);
            fd.append('website', website);
            // Social must be JSON string for the controller to parse
            fd.append('social', JSON.stringify({ linkedin, github, twitter }));
            if (avatarFile) fd.append('avatar', avatarFile);

            await updateProfile(fd).unwrap();
            toast.success('Profile saved successfully!');
            setAvatarFile(null);
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to save profile');
        }
    };

    // ── Generic settings save ──
    const handleSaveSettings = async (patch) => {
        try {
            await updateProfile({ settings: patch }).unwrap();
            toast.success('Settings saved!');
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to save settings');
        }
    };

    // ── Password change ──
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPw !== confirmPw) { toast.error('Passwords do not match'); return; }
        if (newPw.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        try {
            await changePassword({ currentPassword: currentPw, newPassword: newPw }).unwrap();
            toast.success('Password updated successfully!');
            setCurrentPw(''); setNewPw(''); setConfirmPw('');
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to change password');
        }
    };

    const applyTheme = (val) => {
        setTheme(val);
        localStorage.setItem('theme', val);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const useDark = val === 'dark' || (val === 'auto' && prefersDark);
        document.documentElement.classList.toggle('dark', useDark);
    };

    const applyCompactMode = (val) => {
        setCompactMode(val);
        localStorage.setItem('compactMode', val);
        document.documentElement.classList.toggle('compact', val);
    };

    const applyFontSize = (val) => {
        setFontSize(val);
        localStorage.setItem('fontSize', val);
        // CSS uses: html[data-font-size="small"] { font-size: 14px; } etc.
        document.documentElement.setAttribute('data-font-size', val);
    };

    if (isLoading) return (
        <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-text border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const avatarSrc = avatarPreview || `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.name || 'user'}`;

    // ── Tab Pages ─────────────────────────────────────────────────────────────
    const TabProfile = (
        <div className="space-y-6">
            {/* ── Saved Profile Preview Card ─────────────────────────────────── */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                {/* Banner strip */}
                <div className="h-20 bg-gradient-to-r from-text/10 via-text/5 to-transparent relative" />

                <div className="px-6 pb-6 -mt-10">
                    {/* Avatar – pulled up above the banner */}
                    <div className="relative inline-block mb-3">
                        <img
                            src={user?.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.name || 'user'}`}
                            alt="avatar"
                            className="w-20 h-20 rounded-2xl object-cover border-4 border-card shadow-lg"
                        />
                        {/* online indicator */}
                        <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-card" />
                    </div>

                    {/* Name + badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-text">{user?.name || '—'}</h3>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize bg-text/10 text-text border border-border">
                            {user?.role || 'user'}
                        </span>
                    </div>

                    {/* Email */}
                    <p className="text-sm text-secondary mb-1">{user?.email}</p>

                    {/* Bio */}
                    {user?.bio ? (
                        <p className="text-sm text-text/80 leading-relaxed mb-3 max-w-lg">{user.bio}</p>
                    ) : (
                        <p className="text-sm text-secondary italic mb-3">No bio added yet.</p>
                    )}

                    {/* Website + social links row */}
                    <div className="flex flex-wrap gap-2">
                        {user?.website && (
                            <a href={user.website} target="_blank" rel="noreferrer"
                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-border rounded-lg text-secondary hover:text-text hover:border-text transition-colors">
                                <Link className="w-3.5 h-3.5" /> {user.website.replace(/https?:\/\//, '')}
                            </a>
                        )}
                        {user?.social?.linkedin && (
                            <a href={user.social.linkedin} target="_blank" rel="noreferrer"
                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-border rounded-lg text-secondary hover:text-blue-400 hover:border-blue-400/40 transition-colors">
                                <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                            </a>
                        )}
                        {user?.social?.github && (
                            <a href={user.social.github} target="_blank" rel="noreferrer"
                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-border rounded-lg text-secondary hover:text-text hover:border-text transition-colors">
                                <Github className="w-3.5 h-3.5" /> GitHub
                            </a>
                        )}
                        {user?.social?.twitter && (
                            <a href={user.social.twitter} target="_blank" rel="noreferrer"
                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-border rounded-lg text-secondary hover:text-sky-400 hover:border-sky-400/40 transition-colors">
                                <Twitter className="w-3.5 h-3.5" /> Twitter / X
                            </a>
                        )}
                        {!user?.website && !user?.social?.linkedin && !user?.social?.github && !user?.social?.twitter && (
                            <p className="text-xs text-secondary italic">No links added yet.</p>
                        )}
                    </div>

                    <p className="text-[11px] text-secondary/60 mt-3">
                        Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '—'}
                    </p>
                </div>
            </div>

            {/* ── Edit Form ───────────────────────────────────────────────────── */}
            {/* Avatar */}
            <SectionCard title="Profile Photo" description="Your avatar is displayed across the app.">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative group flex-shrink-0">
                        <img
                            src={avatarSrc}
                            alt="Avatar"
                            className="w-24 h-24 rounded-full object-cover border-2 border-border"
                        />
                        <button
                            type="button"
                            onClick={() => avatarInputRef.current?.click()}
                            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Camera className="w-6 h-6 text-white" />
                        </button>
                        <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </div>
                    <div className="text-center sm:text-left">
                        <p className="font-semibold text-text text-lg">{user?.name}</p>
                        <p className="text-sm text-secondary">{user?.email}</p>
                        <p className="text-xs text-secondary mt-1 capitalize bg-border inline-block px-2 py-0.5 rounded-full">{user?.role}</p>
                        <button
                            type="button"
                            onClick={() => avatarInputRef.current?.click()}
                            className="mt-3 block text-xs text-secondary hover:text-text underline-offset-2 hover:underline transition-colors"
                        >
                            Change photo
                        </button>
                    </div>
                </div>
            </SectionCard>

            {/* Personal Details */}
            <SectionCard title="Personal Details" description="Your public-facing identity.">
                <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" />
                    <Input label="Email Address" value={user?.email || ''} readOnly className="opacity-50 cursor-not-allowed" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text mb-1.5">
                        Bio / Tagline <span className="text-secondary font-normal text-xs">({bio.length}/200)</span>
                    </label>
                    <textarea
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        maxLength={200}
                        rows={3}
                        placeholder="Full Stack Developer | MERN | Open Source Contributor"
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-transparent text-text placeholder:text-secondary focus:outline-none focus:border-text transition-colors resize-none text-sm"
                    />
                </div>
                <div className="relative">
                    <Input label="Portfolio Website" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yoursite.com" type="url" />
                    <Link className="absolute right-3 top-9 w-4 h-4 text-secondary" />
                </div>
            </SectionCard>

            {/* Social Links */}
            <SectionCard title="Social Links" description="Connect your professional networks.">
                <div className="relative">
                    <Linkedin className="absolute left-3 top-9 w-4 h-4 text-secondary" />
                    <div className="pl-8">
                        <Input label="LinkedIn" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/handle" type="url" />
                    </div>
                </div>
                <div className="relative">
                    <Github className="absolute left-3 top-9 w-4 h-4 text-secondary" />
                    <div className="pl-8">
                        <Input label="GitHub" value={github} onChange={e => setGithub(e.target.value)} placeholder="https://github.com/handle" type="url" />
                    </div>
                </div>
                <div className="relative">
                    <Twitter className="absolute left-3 top-9 w-4 h-4 text-secondary" />
                    <div className="pl-8">
                        <Input label="Twitter / X" value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="https://twitter.com/handle" type="url" />
                    </div>
                </div>
            </SectionCard>

            <div className="flex justify-end pt-2">
                <Button onClick={handleSaveProfile} isLoading={isSaving} disabled={isSaving}>
                    Save Profile
                </Button>
            </div>
        </div>
    );


    const TabSecurity = (
        <div className="space-y-6">
            <SectionCard title="Change Password" description="Use a strong, unique password for your account.">
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="relative">
                        <Input
                            label="Current Password"
                            type={showPw ? 'text' : 'password'}
                            value={currentPw}
                            onChange={e => setCurrentPw(e.target.value)}
                            required
                        />
                        <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-9 text-secondary hover:text-text">
                            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    <Input label="New Password" type={showPw ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} required />
                    <div>
                        <Input label="Confirm New Password" type={showPw ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required />
                        {newPw && confirmPw && newPw !== confirmPw && (
                            <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                        )}
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button type="submit" isLoading={isChangingPw} disabled={!currentPw || !newPw || !confirmPw}>
                            Update Password
                        </Button>
                    </div>
                </form>
            </SectionCard>

            <SectionCard title="Advanced Security" description="Additional account protection features.">
                {[
                    { label: 'Two-Factor Authentication (2FA)', desc: 'Extra security via authenticator app or SMS' },
                    { label: 'Active Sessions', desc: 'View and revoke sessions from other devices' },
                    { label: 'Login Activity History', desc: 'Review a log of recent login events' },
                ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
                        <div>
                            <p className="text-sm font-medium text-text">{item.label}</p>
                            <p className="text-xs text-secondary mt-0.5">{item.desc}</p>
                        </div>
                        <span className="text-xs bg-border text-secondary px-2.5 py-1 rounded-full flex-shrink-0">Soon</span>
                    </div>
                ))}
            </SectionCard>
        </div>
    );

    const TabAppearance = (
        <div className="space-y-6">
            <SectionCard title="Color Theme" description="Pick how CertVault appears on your device.">
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { value: 'light', icon: Sun, label: 'Light', preview: 'bg-white border-gray-200' },
                        { value: 'dark', icon: Moon, label: 'Dark', preview: 'bg-zinc-900 border-zinc-700' },
                        { value: 'auto', icon: Monitor, label: 'System', preview: 'bg-gradient-to-br from-white to-zinc-900 border-zinc-400' },
                    ].map(({ value, icon: Icon, label, preview }) => (
                        <button
                            key={value}
                            onClick={() => applyTheme(value)}
                            className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === value ? 'border-text' : 'border-border hover:border-text/40'}`}
                        >
                            <div className={`w-14 h-9 rounded-lg border-2 ${preview}`} />
                            <div className="flex items-center gap-1.5">
                                <Icon className={`w-3.5 h-3.5 ${theme === value ? 'text-text' : 'text-secondary'}`} />
                                <span className={`text-sm font-medium ${theme === value ? 'text-text' : 'text-secondary'}`}>{label}</span>
                            </div>
                            {theme === value && <div className="w-1.5 h-1.5 rounded-full bg-text" />}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-secondary">Theme changes take effect immediately and persist across sessions.</p>
            </SectionCard>

            <SectionCard title="Layout Options" description="Display density and text size.">
                {/* Compact Mode */}
                <div className="flex items-start justify-between gap-4 py-3 border-b border-border/40">
                    <div>
                        <p className="text-sm font-medium text-text">Compact Mode</p>
                        <p className="text-xs text-secondary mt-0.5">Reduce padding and spacing for more content on screen</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => applyCompactMode(!compactMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 mt-0.5 ${compactMode ? 'bg-text' : 'bg-border'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-bg transition-transform shadow ${compactMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                {/* Font Size */}
                <div className="py-3">
                    <p className="text-sm font-medium text-text mb-3">Font Size</p>
                    <div className="flex gap-2">
                        {['small', 'medium', 'large'].map(size => (
                            <button
                                key={size}
                                onClick={() => applyFontSize(size)}
                                className={`flex-1 py-2 rounded-lg border-2 text-sm capitalize transition-all ${fontSize === size ? 'border-text bg-text/5 font-semibold text-text' : 'border-border text-secondary hover:border-text/40'
                                    }`}
                            >
                                <span className={size === 'small' ? 'text-xs' : size === 'large' ? 'text-base' : 'text-sm'}>
                                    {size === 'small' ? 'Aa' : size === 'medium' ? 'Aa' : 'Aa'}
                                </span>
                                <p className="text-xs mt-0.5">{size}</p>
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-secondary mt-2">Changes apply instantly across the app.</p>
                </div>
            </SectionCard>
        </div>
    );

    const TabCertPrefs = (
        <div className="space-y-6">
            <SectionCard title="Upload Defaults" description="Applied automatically when you upload new certificates.">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text mb-1.5">Default Visibility</label>
                        <select value={defaultVisibility} onChange={e => setDefaultVisibility(e.target.value)}
                            className="w-full px-4 py-2.5 text-text bg-card border border-border rounded-lg focus:outline-none focus:border-text text-sm">
                            <option value="private" className="bg-bg">🔒 Private (only me)</option>
                            <option value="public" className="bg-bg">🌐 Public (anyone with link)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text mb-1.5">Default View Mode</label>
                        <select value={previewMode} onChange={e => setPreviewMode(e.target.value)}
                            className="w-full px-4 py-2.5 text-text bg-card border border-border rounded-lg focus:outline-none focus:border-text text-sm">
                            <option value="grid" className="bg-bg">⊞ Grid View</option>
                            <option value="list" className="bg-bg">≡ List View</option>
                        </select>
                    </div>
                </div>
            </SectionCard>
            <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings({ defaultVisibility, previewMode })} isLoading={isSaving}>
                    Save Preferences
                </Button>
            </div>
        </div>
    );

    const TabAnalytics = (
        <div className="space-y-6">
            <SectionCard title="Dashboard Widgets" description="Choose which analytics charts appear on your dashboard.">
                <Toggle checked={analytics.showUploadTrend} onChange={v => setAnalytics(a => ({ ...a, showUploadTrend: v }))} label="Upload Activity Trend" description="Line chart showing certificates uploaded over time" />
                <Toggle checked={analytics.showSkillsChart} onChange={v => setAnalytics(a => ({ ...a, showSkillsChart: v }))} label="Top Skills Bar Chart" description="Skills most frequently earned across your certs" />
                <Toggle checked={analytics.showFolderChart} onChange={v => setAnalytics(a => ({ ...a, showFolderChart: v }))} label="Folder Distribution Pie" description="How your certificates are spread across folders" />
            </SectionCard>
            <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings({ analytics })} isLoading={isSaving}>
                    Save Analytics Settings
                </Button>
            </div>
        </div>
    );

    const TabNotifications = (
        <div className="space-y-6">
            <SectionCard title="Email Alerts" description="Control which events send you an email.">
                <Toggle checked={notif.emailOnUpload} onChange={v => setNotif(n => ({ ...n, emailOnUpload: v }))} label="Certificate Uploaded" description="Confirmation email after each successful upload" />
                <Toggle checked={notif.emailOnShare} onChange={v => setNotif(n => ({ ...n, emailOnShare: v }))} label="Certificate Viewed/Shared" description="Alert when someone opens your shared certificate" />
                <Toggle checked={notif.weeklyEmailReport} onChange={v => setNotif(n => ({ ...n, weeklyEmailReport: v }))} label="Weekly Digest" description="Short weekly summary of vault activity" />
                <Toggle checked={notif.monthlyReport} onChange={v => setNotif(n => ({ ...n, monthlyReport: v }))} label="Monthly Report" description="Detailed monthly analytics email" />
            </SectionCard>
            <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings({ notifications: notif })} isLoading={isSaving}>
                    Save Notifications
                </Button>
            </div>
        </div>
    );

    const TabPrivacy = (
        <div className="space-y-6">
            <SectionCard title="Profile & Visibility" description="Control who can see your content.">
                <Toggle checked={privacy.publicProfile} onChange={v => setPrivacy(p => ({ ...p, publicProfile: v }))} label="Public Profile" description="Allow others to view your CertVault public profile" />
                <Toggle checked={privacy.privateCertificates} onChange={v => setPrivacy(p => ({ ...p, privateCertificates: v }))} label="Private Certificates by Default" description="New certificates are hidden unless explicitly shared" />
                <Toggle checked={privacy.hideIssuerDetails} onChange={v => setPrivacy(p => ({ ...p, hideIssuerDetails: v }))} label="Hide Issuer Details" description="Organization names hidden on public shared views" />
                <Toggle checked={privacy.disableDownloads} onChange={v => setPrivacy(p => ({ ...p, disableDownloads: v }))} label="Disable Downloads for Viewers" description="Viewers cannot download your shared certificates" />
            </SectionCard>
            <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings({ privacy })} isLoading={isSaving}>
                    Save Privacy Settings
                </Button>
            </div>
        </div>
    );

    const tabContent = {
        profile: TabProfile, security: TabSecurity, appearance: TabAppearance,
        certificates: TabCertPrefs, analytics: TabAnalytics,
        notifications: TabNotifications, privacy: TabPrivacy,
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Page header */}
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-text tracking-tight">Account Settings</h1>
                <p className="text-secondary mt-2">Manage your profile, security, and application preferences.</p>
            </motion.div>

            {/* Tab navigation — horizontal scrollable pill row */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
                className="flex gap-1.5 overflow-x-auto pb-1 mb-6 scrollbar-thin justify-center flex-wrap">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${activeTab === tab.id
                            ? 'bg-text text-bg border-text shadow-sm'
                            : 'text-secondary border-border hover:border-text/40 hover:text-text'
                            }`}
                    >
                        <tab.icon className="w-3.5 h-3.5" />
                        {tab.label}
                    </button>
                ))}
            </motion.div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                >
                    {tabContent[activeTab]}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Settings;
