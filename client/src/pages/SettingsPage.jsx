import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardBody,
    Button,
    Input,
    Avatar,
    Chip,
    Spinner,
    Divider,
    Tabs,
    Tab,
    Image,
} from '@heroui/react';
import {
    ArrowLeftIcon,
    UserCircleIcon,
    KeyIcon,
    ShieldCheckIcon,
    UserIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    EyeSlashIcon,
    EnvelopeIcon,
    CalendarDaysIcon,
    Cog6ToothIcon,
    SparklesIcon,
    PhotoIcon,
    XMarkIcon,
    CameraIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export default function SettingsPage() {
    const navigate = useNavigate();
    const { user, syncUser } = useAuth();

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [selectedTab, setSelectedTab] = useState('profile');

    // Profile form state
    const [name, setName] = useState('');
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    // Avatar upload state
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const avatarInputRef = useRef(null);

    // Password form state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    useEffect(() => {
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await authService.getProfile();
            setProfile(data);
            setName(data.name || '');
        } catch (err) {
            toast.error('Failed to load profile');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        
        if (!name.trim()) {
            toast.error('Name is required');
            return;
        }

        if (name.trim() === profile?.name) {
            toast.info('No changes to save');
            return;
        }

        try {
            setIsUpdatingProfile(true);
            const updatedUser = await authService.updateProfile({ name: name.trim() });
            setProfile(updatedUser);
            syncUser(); // Sync the updated user to context
            toast.success('Profile updated successfully');
        } catch (err) {
            toast.error(err.message || 'Failed to update profile');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();

        if (!currentPassword) {
            toast.error('Current password is required');
            return;
        }

        if (!newPassword) {
            toast.error('New password is required');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (currentPassword === newPassword) {
            toast.error('New password must be different from current password');
            return;
        }

        try {
            setIsUpdatingPassword(true);
            await authService.updateProfile({ 
                currentPassword, 
                newPassword 
            });
            
            // Clear password fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            
            toast.success('Password updated successfully');
        } catch (err) {
            toast.error(err.message || 'Failed to update password');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
                return;
            }
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File too large. Maximum size is 5MB.');
                return;
            }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) {
            toast.error('Please select an image first');
            return;
        }

        try {
            setIsUploadingAvatar(true);
            const updatedUser = await authService.uploadAvatar(avatarFile);
            setProfile(updatedUser);
            syncUser();
            setAvatarFile(null);
            setAvatarPreview(null);
            if (avatarInputRef.current) {
                avatarInputRef.current.value = '';
            }
            toast.success('Avatar updated successfully');
        } catch (err) {
            toast.error(err.message || 'Failed to upload avatar');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleAvatarRemove = async () => {
        try {
            setIsUploadingAvatar(true);
            const updatedUser = await authService.deleteAvatar();
            setProfile(updatedUser);
            syncUser();
            setAvatarFile(null);
            setAvatarPreview(null);
            if (avatarInputRef.current) {
                avatarInputRef.current.value = '';
            }
            toast.success('Avatar removed successfully');
        } catch (err) {
            toast.error(err.message || 'Failed to remove avatar');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const cancelAvatarSelection = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
        if (avatarInputRef.current) {
            avatarInputRef.current.value = '';
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center animate-pulse">
                        <Cog6ToothIcon className="w-8 h-8 text-white" />
                    </div>
                    <Spinner size="lg" color="secondary" />
                    <p className="text-purple-200 font-medium">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Background decorations */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="relative z-10 px-6 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <Button
                            variant="flat"
                            className="bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20"
                            startContent={<ArrowLeftIcon className="w-4 h-4" />}
                            onPress={() => navigate('/')}
                        >
                            Back to Home
                        </Button>
                    </div>

                    {/* Page Title */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-400/30 mb-4">
                            <SparklesIcon className="w-4 h-4 text-purple-300" />
                            <span className="text-purple-200 text-sm font-medium">Account</span>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-3">Settings</h1>
                        <p className="text-purple-200/80 text-lg max-w-xl mx-auto">
                            Manage your account settings and preferences
                        </p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 px-6 pb-12">
                <div className="max-w-4xl mx-auto">
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Profile Card */}
                        <Card className="lg:col-span-1 bg-white/10 backdrop-blur-xl border border-white/20">
                            <CardBody className="p-6 flex flex-col items-center">
                                <div className="relative mb-6">
                                    {profile?.avatar || avatarPreview ? (
                                        <>
                                            <Avatar
                                                src={avatarPreview || authService.getAvatarUrl(profile?.avatar)}
                                                className="w-32 h-32 text-3xl font-bold ring-4 ring-purple-500/30"
                                                isBordered
                                                color={profile?.role === 'ADMIN' ? 'warning' : 'primary'}
                                            />
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                radius="full"
                                                className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg min-w-10 w-10 h-10 z-10"
                                                onPress={() => avatarInputRef.current?.click()}
                                                isDisabled={isUploadingAvatar}
                                            >
                                                <CameraIcon className="w-5 h-5" />
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Avatar
                                                name={getInitials(profile?.name)}
                                                className={`w-32 h-32 text-3xl font-bold ring-4 ring-purple-500/30 ${
                                                    profile?.role === 'ADMIN'
                                                        ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                                                        : 'bg-gradient-to-br from-blue-400 to-cyan-500'
                                                } text-white`}
                                            />
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                radius="full"
                                                className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg min-w-10 w-10 h-10 z-10"
                                                onPress={() => avatarInputRef.current?.click()}
                                                isDisabled={isUploadingAvatar}
                                            >
                                                <CameraIcon className="w-5 h-5" />
                                            </Button>
                                        </>
                                    )}
                                    <input
                                        ref={avatarInputRef}
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </div>

                                {avatarPreview && (
                                    <div className="flex gap-2 justify-center mb-4">
                                        <Button
                                            size="sm"
                                            color="primary"
                                            onPress={handleAvatarUpload}
                                            isLoading={isUploadingAvatar}
                                            className="bg-gradient-to-r from-purple-500 to-indigo-600"
                                        >
                                            Upload
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            onPress={cancelAvatarSelection}
                                            isDisabled={isUploadingAvatar}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                )}

                                {!avatarPreview && profile?.avatar && (
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        color="danger"
                                        onPress={handleAvatarRemove}
                                        isLoading={isUploadingAvatar}
                                        className="mb-4"
                                        startContent={!isUploadingAvatar && <XMarkIcon className="w-4 h-4" />}
                                    >
                                        Remove Avatar
                                    </Button>
                                )}

                                <h2 className="text-xl font-bold text-white mb-1 text-center">{profile?.name}</h2>
                                <p className="text-purple-200/70 text-sm mb-4 text-center">{profile?.email}</p>
                                
                                <Chip
                                    variant="flat"
                                    startContent={
                                        profile?.role === 'ADMIN' 
                                            ? <ShieldCheckIcon className="w-3.5 h-3.5" />
                                            : <UserIcon className="w-3.5 h-3.5" />
                                    }
                                    className={
                                        profile?.role === 'ADMIN'
                                            ? 'bg-amber-500/20 text-amber-300'
                                            : 'bg-blue-500/20 text-blue-300'
                                    }
                                >
                                    {profile?.role === 'ADMIN' ? 'Administrator' : 'User'}
                                </Chip>

                                <Divider className="my-5 bg-white/10" />

                                <div className="space-y-3 text-left">
                                    <div className="flex items-center gap-3 text-purple-200/70">
                                        <EnvelopeIcon className="w-4 h-4" />
                                        <span className="text-sm truncate">{profile?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-purple-200/70">
                                        <CalendarDaysIcon className="w-4 h-4" />
                                        <span className="text-sm">Joined {formatDate(profile?.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircleIcon className="w-4 h-4 text-green-400" />
                                        <span className="text-sm text-green-300">Account Active</span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Settings Panel */}
                        <Card className="lg:col-span-2 bg-white/10 backdrop-blur-xl border border-white/20">
                            <CardBody className="p-0">
                                <Tabs 
                                    selectedKey={selectedTab}
                                    onSelectionChange={setSelectedTab}
                                    variant="underlined"
                                    classNames={{
                                        tabList: "gap-6 w-full px-6 pt-4 border-b border-white/10",
                                        cursor: "bg-purple-500",
                                        tab: "text-purple-200/70 data-[selected=true]:text-white",
                                        tabContent: "group-data-[selected=true]:text-white"
                                    }}
                                >
                                    <Tab 
                                        key="profile" 
                                        title={
                                            <div className="flex items-center gap-2">
                                                <UserCircleIcon className="w-4 h-4 text-white" />
                                                <span className='text-white'>Profile</span>
                                            </div>
                                        }
                                    >
                                        <div className="p-6">
                                            <div className="mb-8">
                                                <h3 className="text-xl font-bold text-white mb-2">Profile Information</h3>
                                                <p className="text-white/60 text-sm">
                                                    Update your account profile information
                                                </p>
                                            </div>

                                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                                <div className="space-y-2">
                                                    <Input
                                                        label="Email"
                                                        labelPlacement="outside"
                                                        value={profile?.email || ''}
                                                        isReadOnly
                                                        isDisabled
                                                        startContent={<EnvelopeIcon className="w-4 h-4 text-white/50" />}
                                                        classNames={{
                                                            label: "!text-white font-semibold text-sm mb-2",
                                                            input: "text-white/60 bg-transparent",
                                                            inputWrapper: "bg-white/5 border border-white/20 h-12 data-[hover=true]:bg-white/5",
                                                            description: "text-white/50 text-xs mt-2"
                                                        }}
                                                        description="Email cannot be changed"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Input
                                                        label="Full Name"
                                                        labelPlacement="outside"
                                                        placeholder="Enter your full name"
                                                        value={name}
                                                        onValueChange={setName}
                                                        startContent={<UserIcon className="w-4 h-4 text-white/70" />}
                                                        classNames={{
                                                            label: "!text-white font-semibold text-sm mb-2",
                                                            input: "text-white placeholder:text-white/35 bg-transparent",
                                                            inputWrapper: "bg-white/5 border border-white/30 hover:border-white/50 group-data-[focus=true]:bg-white/8 group-data-[focus=true]:border-purple-400 h-12 data-[hover=true]:bg-white/8"
                                                        }}
                                                    />
                                                </div>

                                                <div className="flex justify-end pt-4">
                                                    <Button
                                                        type="submit"
                                                        isLoading={isUpdatingProfile}
                                                        isDisabled={!name.trim() || name.trim() === profile?.name}
                                                        className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold px-6 shadow-lg hover:shadow-xl transition-shadow"
                                                        startContent={!isUpdatingProfile && <CheckCircleIcon className="w-4 h-4" />}
                                                    >
                                                        {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>
                                    </Tab>

                                    <Tab 
                                        key="security" 
                                        title={
                                            <div className="flex items-center gap-2">
                                                <KeyIcon className="w-4 h-4 text-white" />
                                                <span className='text-white'>Security</span>
                                            </div>
                                        }
                                    >
                                        <div className="p-6">
                                            <div className="mb-8">
                                                <h3 className="text-xl font-bold text-white mb-2">Change Password</h3>
                                                <p className="text-white/60 text-sm">
                                                    Update your password to keep your account secure
                                                </p>
                                            </div>

                                            {/* Security Warning */}
                                            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-8">
                                                <ExclamationTriangleIcon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                                <div className="text-sm">
                                                    <p className="text-amber-300 font-semibold mb-1">Security Reminder</p>
                                                    <p className="text-amber-200/80">
                                                        Choose a strong password that you don't use elsewhere. 
                                                        We recommend using a mix of letters, numbers, and symbols.
                                                    </p>
                                                </div>
                                            </div>

                                            <form onSubmit={handlePasswordUpdate} className="space-y-6">
                                                <div className="space-y-3">
                                                    <Input
                                                        label="Current Password"
                                                        labelPlacement="outside"
                                                        placeholder="Enter your current password"
                                                        type={showCurrentPassword ? 'text' : 'password'}
                                                        value={currentPassword}
                                                        onValueChange={setCurrentPassword}
                                                        startContent={<KeyIcon className="w-4 h-4 text-white/70" />}
                                                        endContent={
                                                            <button 
                                                                type="button"
                                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                                className="text-white/60 hover:text-white transition-colors"
                                                            >
                                                                {showCurrentPassword 
                                                                    ? <EyeSlashIcon className="w-4 h-4" />
                                                                    : <EyeIcon className="w-4 h-4" />
                                                                }
                                                            </button>
                                                        }
                                                        classNames={{
                                                            label: "!text-white font-semibold text-sm mb-2",
                                                            input: "text-white placeholder:text-white/35 bg-transparent",
                                                            inputWrapper: "bg-white/5 border border-white/30 hover:border-white/50 group-data-[focus=true]:bg-white/8 group-data-[focus=true]:border-purple-400 h-12 data-[hover=true]:bg-white/8"
                                                        }}
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    <Input
                                                        label="New Password"
                                                        labelPlacement="outside"
                                                        placeholder="Enter your new password"
                                                        type={showNewPassword ? 'text' : 'password'}
                                                        value={newPassword}
                                                        onValueChange={setNewPassword}
                                                        startContent={<KeyIcon className="w-4 h-4 text-white/70" />}
                                                        endContent={
                                                            <button 
                                                                type="button"
                                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                                className="text-white/60 hover:text-white transition-colors"
                                                            >
                                                                {showNewPassword 
                                                                    ? <EyeSlashIcon className="w-4 h-4" />
                                                                    : <EyeIcon className="w-4 h-4" />
                                                                }
                                                            </button>
                                                        }
                                                        classNames={{
                                                            label: "!text-white font-semibold text-sm mb-2",
                                                            input: "text-white placeholder:text-white/35 bg-transparent",
                                                            inputWrapper: "bg-white/5 border border-white/30 hover:border-white/50 group-data-[focus=true]:bg-white/8 group-data-[focus=true]:border-purple-400 h-12 data-[hover=true]:bg-white/8",
                                                            description: "text-white/50 text-xs mt-2"
                                                        }}
                                                        description="Minimum 6 characters"
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    <Input
                                                        label="Confirm New Password"
                                                        labelPlacement="outside"
                                                        placeholder="Confirm your new password"
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        value={confirmPassword}
                                                        onValueChange={setConfirmPassword}
                                                        startContent={<KeyIcon className="w-4 h-4 text-white/70" />}
                                                        endContent={
                                                            <button 
                                                                type="button"
                                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                className="text-white/60 hover:text-white transition-colors"
                                                            >
                                                                {showConfirmPassword 
                                                                    ? <EyeSlashIcon className="w-4 h-4" />
                                                                    : <EyeIcon className="w-4 h-4" />
                                                                }
                                                            </button>
                                                        }
                                                        classNames={{
                                                            label: "!text-white font-semibold text-sm mb-2",
                                                            input: "text-white placeholder:text-white/35 bg-transparent",
                                                            inputWrapper: "bg-white/5 border border-white/30 hover:border-white/50 group-data-[focus=true]:bg-white/8 group-data-[focus=true]:border-purple-400 h-12 data-[hover=true]:bg-white/8 data-[invalid=true]:border-red-500 data-[invalid=true]:bg-white/5",
                                                            errorMessage: "text-red-400 text-xs mt-1"
                                                        }}
                                                        isInvalid={confirmPassword && newPassword !== confirmPassword}
                                                        errorMessage={confirmPassword && newPassword !== confirmPassword ? "Passwords don't match" : ''}
                                                    />
                                                </div>

                                                <div className="flex justify-end pt-4">
                                                    <Button
                                                        type="submit"
                                                        isLoading={isUpdatingPassword}
                                                        isDisabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                                                        className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold px-6 shadow-lg hover:shadow-xl transition-shadow"
                                                        startContent={!isUpdatingPassword && <KeyIcon className="w-4 h-4" />}
                                                    >
                                                        {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>
                                    </Tab>
                                </Tabs>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Account Info Card */}
                    <Card className="mt-6 bg-white/10 backdrop-blur-xl border border-white/20">
                        <CardBody className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-blue-500/20">
                                    <ShieldCheckIcon className="w-6 h-6 text-blue-300" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white mb-2">Account Security</h3>
                                    <p className="text-purple-200/70 text-sm mb-4">
                                        Your account is protected. Here are some tips to keep it secure:
                                    </p>
                                    <ul className="grid md:grid-cols-2 gap-3 text-sm">
                                        <li className="flex items-center gap-2 text-purple-200/80">
                                            <CheckCircleIcon className="w-4 h-4 text-green-400" />
                                            Use a strong, unique password
                                        </li>
                                        <li className="flex items-center gap-2 text-purple-200/80">
                                            <CheckCircleIcon className="w-4 h-4 text-green-400" />
                                            Never share your credentials
                                        </li>
                                        <li className="flex items-center gap-2 text-purple-200/80">
                                            <CheckCircleIcon className="w-4 h-4 text-green-400" />
                                            Log out from shared devices
                                        </li>
                                        <li className="flex items-center gap-2 text-purple-200/80">
                                            <CheckCircleIcon className="w-4 h-4 text-green-400" />
                                            Update your password regularly
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </main>
        </div>
    );
}
