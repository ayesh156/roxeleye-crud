import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardBody,
    Button,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Spinner,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Avatar,
    Select,
    SelectItem,
    Input,
    Pagination,
    Tooltip,
    RadioGroup,
    Radio,
} from '@heroui/react';
import {
    UsersIcon,
    ShieldCheckIcon,
    UserIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    PencilSquareIcon,
    UserGroupIcon,
    EnvelopeIcon,
    CalendarDaysIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const ROLES = [
    { 
        key: 'USER', 
        label: 'User', 
        description: 'Standard user with basic permissions',
        color: 'primary',
        icon: UserIcon 
    },
    { 
        key: 'ADMIN', 
        label: 'Administrator', 
        description: 'Full access to manage users and system settings',
        color: 'warning',
        icon: ShieldCheckIcon 
    },
];

export default function ManageUsersPage() {
    const navigate = useNavigate();
    const { user: currentUser, isAdmin } = useAuth();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Role change modal state
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedUser, setSelectedUser] = useState(null);
    const [pendingRole, setPendingRole] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (!isAdmin()) {
            navigate('/');
            return;
        }
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await authService.getAllUsers();
            setUsers(data);
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesSearch = 
                u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = roleFilter === 'all' || u.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [users, searchQuery, roleFilter]);

    const paginatedUsers = useMemo(() => {
        const startIdx = (currentPage - 1) * itemsPerPage;
        return filteredUsers.slice(startIdx, startIdx + itemsPerPage);
    }, [filteredUsers, currentPage]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const stats = useMemo(() => ({
        total: users.length,
        admins: users.filter(u => u.role === 'ADMIN').length,
        regularUsers: users.filter(u => u.role === 'USER').length,
    }), [users]);

    const openRoleModal = useCallback((targetUser) => {
        if (targetUser.id === currentUser?.id) {
            toast.warning("You cannot modify your own role");
            return;
        }
        setSelectedUser(targetUser);
        setPendingRole(targetUser.role);
        onOpen();
    }, [currentUser?.id, onOpen]);

    const handleRoleUpdate = async () => {
        if (!selectedUser || !pendingRole) return;
        
        if (pendingRole === selectedUser.role) {
            toast.info('No changes to save');
            onClose();
            return;
        }

        try {
            setIsUpdating(true);
            await authService.updateUserRole(selectedUser.id, pendingRole);
            
            setUsers(prev => 
                prev.map(u => u.id === selectedUser.id 
                    ? { ...u, role: pendingRole } 
                    : u
                )
            );
            
            const roleLabel = ROLES.find(r => r.key === pendingRole)?.label || pendingRole;
            toast.success(`${selectedUser.name}'s role updated to ${roleLabel}`);
            onClose();
        } catch (err) {
            const message = err.message || 'Failed to update role';
            toast.error(message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleModalClose = () => {
        if (isUpdating) return;
        setSelectedUser(null);
        setPendingRole('');
        onClose();
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleConfig = (role) => {
        return ROLES.find(r => r.key === role) || ROLES[0];
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center animate-pulse">
                        <UserGroupIcon className="w-8 h-8 text-white" />
                    </div>
                    <Spinner size="lg" color="secondary" />
                    <p className="text-purple-200 font-medium">Loading users...</p>
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
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <Button
                            variant="flat"
                            className="bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20"
                            startContent={<ArrowLeftIcon className="w-4 h-4" />}
                            onPress={() => navigate('/')}
                        >
                            Back to Dashboard
                        </Button>
                        <Tooltip content="Refresh user list">
                            <Button
                                variant="flat"
                                isIconOnly
                                className="bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20"
                                onPress={fetchUsers}
                            >
                                <ArrowPathIcon className="w-5 h-5" />
                            </Button>
                        </Tooltip>
                    </div>

                    {/* Page Title */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-400/30 mb-4">
                            <ShieldCheckIcon className="w-4 h-4 text-amber-300" />
                            <span className="text-amber-200 text-sm font-medium">Role Management</span>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-3">Manage User Roles</h1>
                        <p className="text-purple-200/80 text-lg max-w-xl mx-auto">
                            Assign and modify user permissions to control access levels across your application.
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
                            <CardBody className="p-4 flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600">
                                    <UsersIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                                    <p className="text-purple-200/70 text-sm">Total Users</p>
                                </div>
                            </CardBody>
                        </Card>
                        <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
                            <CardBody className="p-4 flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
                                    <ShieldCheckIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stats.admins}</p>
                                    <p className="text-purple-200/70 text-sm">Administrators</p>
                                </div>
                            </CardBody>
                        </Card>
                        <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
                            <CardBody className="p-4 flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500">
                                    <UserIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stats.regularUsers}</p>
                                    <p className="text-purple-200/70 text-sm">Regular Users</p>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 px-6 pb-12">
                <div className="max-w-6xl mx-auto">
                    <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                        <CardBody className="p-0">
                            {/* Toolbar */}
                            <div className="p-5 border-b border-white/10">
                                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                    <Input
                                        placeholder="Search by name or email..."
                                        value={searchQuery}
                                        onValueChange={(val) => {
                                            setSearchQuery(val);
                                            setCurrentPage(1);
                                        }}
                                        startContent={<MagnifyingGlassIcon className="w-5 h-5 text-purple-300" />}
                                        classNames={{
                                            base: "max-w-sm",
                                            input: "text-white placeholder:text-purple-300/50",
                                            inputWrapper: "bg-white/5 border border-white/20 hover:bg-white/10 group-data-[focus=true]:bg-white/10"
                                        }}
                                    />
                                    <div className="flex items-center gap-3">
                                        <Select
                                            placeholder="Filter by role"
                                            selectedKeys={[roleFilter]}
                                            onSelectionChange={(keys) => {
                                                setRoleFilter(Array.from(keys)[0]);
                                                setCurrentPage(1);
                                            }}
                                            className="w-40"
                                            size="sm"
                                            classNames={{
                                                trigger: "bg-white/5 border border-white/20 data-[hover=true]:bg-white/10",
                                                value: "text-white",
                                            }}
                                            aria-label="Filter by role"
                                        >
                                            <SelectItem key="all">All Roles</SelectItem>
                                            <SelectItem key="ADMIN">Admin</SelectItem>
                                            <SelectItem key="USER">User</SelectItem>
                                        </Select>
                                        <Chip variant="flat" className="bg-purple-500/20 text-purple-200">
                                            {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
                                        </Chip>
                                    </div>
                                </div>
                            </div>

                            {/* Users Table */}
                            <Table
                                aria-label="Users role management table"
                                removeWrapper
                                classNames={{
                                    th: "bg-white/5 text-purple-200 font-semibold border-b border-white/10",
                                    td: "py-4 border-b border-white/5",
                                    tr: "hover:bg-white/5 transition-colors"
                                }}
                            >
                                <TableHeader>
                                    <TableColumn>USER</TableColumn>
                                    <TableColumn>EMAIL</TableColumn>
                                    <TableColumn>CURRENT ROLE</TableColumn>
                                    <TableColumn>STATUS</TableColumn>
                                    <TableColumn>JOINED</TableColumn>
                                    <TableColumn align="center">ACTION</TableColumn>
                                </TableHeader>
                                <TableBody emptyContent={
                                    <div className="py-12 text-center">
                                        <UsersIcon className="w-12 h-12 mx-auto text-purple-400/50 mb-3" />
                                        <p className="text-purple-200/70">No users found</p>
                                    </div>
                                }>
                                    {paginatedUsers.map(targetUser => {
                                        const roleConfig = getRoleConfig(targetUser.role);
                                        const RoleIcon = roleConfig.icon;
                                        const isCurrentUser = targetUser.id === currentUser?.id;
                                        
                                        return (
                                            <TableRow key={targetUser.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar
                                                            src={targetUser.avatar ? `http://localhost:3000/${targetUser.avatar}` : undefined}
                                                            name={getInitials(targetUser.name)}
                                                            className={`${
                                                                targetUser.role === 'ADMIN'
                                                                    ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                                                                    : 'bg-gradient-to-br from-blue-400 to-cyan-500'
                                                            } text-white font-semibold`}
                                                            size="sm"
                                                        />
                                                        <div>
                                                            <p className="text-white font-medium flex items-center gap-2">
                                                                {targetUser.name}
                                                                {isCurrentUser && (
                                                                    <Chip 
                                                                        size="sm" 
                                                                        variant="flat" 
                                                                        className="bg-purple-500/30 text-purple-200"
                                                                    >
                                                                        You
                                                                    </Chip>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-purple-200/80">
                                                        <EnvelopeIcon className="w-4 h-4" />
                                                        <span className="truncate max-w-[200px]">{targetUser.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        variant="flat"
                                                        size="sm"
                                                        startContent={<RoleIcon className="w-3.5 h-3.5" />}
                                                        className={
                                                            targetUser.role === 'ADMIN'
                                                                ? 'bg-amber-500/20 text-amber-300'
                                                                : 'bg-blue-500/20 text-blue-300'
                                                        }
                                                    >
                                                        {roleConfig.label}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        variant="flat"
                                                        size="sm"
                                                        startContent={
                                                            targetUser.isActive 
                                                                ? <CheckCircleIcon className="w-3.5 h-3.5" />
                                                                : <XCircleIcon className="w-3.5 h-3.5" />
                                                        }
                                                        className={
                                                            targetUser.isActive
                                                                ? 'bg-green-500/20 text-green-300'
                                                                : 'bg-red-500/20 text-red-300'
                                                        }
                                                    >
                                                        {targetUser.isActive ? 'Active' : 'Inactive'}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-purple-200/70 text-sm">
                                                        <CalendarDaysIcon className="w-4 h-4" />
                                                        {formatDate(targetUser.createdAt)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-center">
                                                        {isCurrentUser ? (
                                                            <Tooltip content="Cannot modify your own role">
                                                                <Chip 
                                                                    size="sm" 
                                                                    variant="flat" 
                                                                    className="bg-white/10 text-purple-300"
                                                                >
                                                                    N/A
                                                                </Chip>
                                                            </Tooltip>
                                                        ) : (
                                                            <Tooltip content="Change role">
                                                                <Button
                                                                    size="sm"
                                                                    variant="flat"
                                                                    className="bg-purple-500/20 text-purple-200 hover:bg-purple-500/30"
                                                                    startContent={<PencilSquareIcon className="w-4 h-4" />}
                                                                    onPress={() => openRoleModal(targetUser)}
                                                                >
                                                                    Change Role
                                                                </Button>
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center p-5 border-t border-white/10">
                                    <Pagination
                                        total={totalPages}
                                        page={currentPage}
                                        onChange={setCurrentPage}
                                        showControls
                                        classNames={{
                                            wrapper: "gap-2",
                                            item: "bg-white/5 text-purple-200 border border-white/20 hover:bg-white/10",
                                            cursor: "bg-gradient-to-br from-purple-500 to-indigo-600 border-0 text-white font-semibold",
                                        }}
                                    />
                                </div>
                            )}
                        </CardBody>
                    </Card>

                    {/* Info Card */}
                    <Card className="mt-6 bg-white/10 backdrop-blur-xl border border-white/20">
                        <CardBody className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-blue-500/20">
                                    <InformationCircleIcon className="w-6 h-6 text-blue-300" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Role Permissions</h3>
                                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-amber-300">
                                                <ShieldCheckIcon className="w-4 h-4" />
                                                <span className="font-medium">Administrator</span>
                                            </div>
                                            <ul className="text-purple-200/70 space-y-1 ml-6">
                                                <li>• Full system access</li>
                                                <li>• Manage all users and roles</li>
                                                <li>• Create, edit, and delete any item</li>
                                            </ul>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-blue-300">
                                                <UserIcon className="w-4 h-4" />
                                                <span className="font-medium">User</span>
                                            </div>
                                            <ul className="text-purple-200/70 space-y-1 ml-6">
                                                <li>• View all items</li>
                                                <li>• Create new items</li>
                                                <li>• Limited editing permissions</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </main>

            {/* Role Change Modal */}
            <Modal 
                isOpen={isOpen} 
                onClose={handleModalClose}
                size="lg"
                classNames={{
                    base: "bg-slate-900 border border-white/20",
                    header: "border-b border-white/10",
                    footer: "border-t border-white/10",
                }}
            >
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-500/20">
                                    <PencilSquareIcon className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <span className="text-white">Change User Role</span>
                                    <p className="text-sm text-purple-200/70 font-normal">
                                        {selectedUser?.name}
                                    </p>
                                </div>
                            </ModalHeader>
                            <ModalBody className="py-6">
                                {/* Warning Banner */}
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-6">
                                    <ExclamationTriangleIcon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="text-amber-300 font-medium mb-1">Important</p>
                                        <p className="text-amber-200/80">
                                            Changing a user's role will immediately affect their permissions and access levels.
                                        </p>
                                    </div>
                                </div>

                                {/* Current Role Display */}
                                <div className="mb-6">
                                    <p className="text-sm text-purple-200/70 mb-2">Current Role</p>
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                                        <Avatar
                                            src={selectedUser?.avatar ? `http://localhost:3000/${selectedUser.avatar}` : undefined}
                                            name={selectedUser ? getInitials(selectedUser.name) : ''}
                                            className={`${
                                                selectedUser?.role === 'ADMIN'
                                                    ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                                                    : 'bg-gradient-to-br from-blue-400 to-cyan-500'
                                            } text-white font-semibold`}
                                            size="sm"
                                        />
                                        <div className="flex-1">
                                            <p className="text-white font-medium">{selectedUser?.email}</p>
                                            <p className="text-sm text-purple-200/70">
                                                {getRoleConfig(selectedUser?.role).label}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Role Selection */}
                                <div>
                                    <p className="text-sm text-purple-200/70 mb-3">Select New Role</p>
                                    <RadioGroup
                                        value={pendingRole}
                                        onValueChange={setPendingRole}
                                        classNames={{
                                            wrapper: "gap-3"
                                        }}
                                    >
                                        {ROLES.map(role => {
                                            const RoleIcon = role.icon;
                                            const isSelected = pendingRole === role.key;
                                            const isCurrent = selectedUser?.role === role.key;
                                            
                                            return (
                                                <div
                                                    key={role.key}
                                                    className={`
                                                        relative flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all
                                                        ${isSelected 
                                                            ? 'bg-purple-500/20 border-purple-400/50' 
                                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                        }
                                                    `}
                                                    onClick={() => setPendingRole(role.key)}
                                                >
                                                    <Radio 
                                                        value={role.key}
                                                        classNames={{
                                                            wrapper: "group-data-[selected=true]:border-purple-500",
                                                            control: "group-data-[selected=true]:bg-purple-500"
                                                        }}
                                                    />
                                                    <div className={`
                                                        p-2 rounded-lg
                                                        ${role.key === 'ADMIN' 
                                                            ? 'bg-amber-500/20' 
                                                            : 'bg-blue-500/20'
                                                        }
                                                    `}>
                                                        <RoleIcon className={`w-5 h-5 ${
                                                            role.key === 'ADMIN' 
                                                                ? 'text-amber-400' 
                                                                : 'text-blue-400'
                                                        }`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-white font-medium">{role.label}</p>
                                                            {isCurrent && (
                                                                <Chip 
                                                                    size="sm" 
                                                                    variant="flat"
                                                                    className="bg-green-500/20 text-green-300"
                                                                >
                                                                    Current
                                                                </Chip>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-purple-200/70 mt-1">
                                                            {role.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </RadioGroup>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button 
                                    variant="flat" 
                                    onPress={handleModalClose}
                                    className="bg-white/10 text-white"
                                    isDisabled={isUpdating}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={handleRoleUpdate}
                                    isLoading={isUpdating}
                                    isDisabled={pendingRole === selectedUser?.role}
                                    className="bg-gradient-to-r from-purple-500 to-indigo-600"
                                    startContent={!isUpdating && <CheckCircleIcon className="w-4 h-4" />}
                                >
                                    {isUpdating ? 'Updating...' : 'Confirm Change'}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
