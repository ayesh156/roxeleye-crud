import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardHeader,
    CardBody,
    Input,
    Textarea,
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
    Tooltip,
    Divider,
    Image,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Avatar,
} from '@heroui/react';
import {
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    CubeIcon,
    InboxIcon,
    ArchiveBoxIcon,
    PhotoIcon,
    XMarkIcon,
    ArrowRightStartOnRectangleIcon,
    UserCircleIcon,
    Cog6ToothIcon,
    UsersIcon,
    EyeIcon,
    UserIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { itemService } from '../services/itemService';
import { validateItem, validateField } from '../validations/itemValidation';

export default function ItemsPage() {
    const navigate = useNavigate();
    const { user, logout, isAdmin, isAuthenticated } = useAuth();
    
    // Permission checks
    const canCreate = isAuthenticated?.() ?? false;  // All authenticated users can create
    const canEdit = isAdmin?.() ?? false;            // Only Admin can edit
    const canDelete = isAdmin?.() ?? false;          // Only Admin can delete
    
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        quantity: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [touched, setTouched] = useState({});
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            setLoading(true);
            const data = await itemService.getAll();
            setItems(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', price: '', quantity: '' });
        setEditingItem(null);
        setFieldErrors({});
        setTouched({});
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Handle image selection
    const handleImageChange = (e) => {
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
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Remove selected image
    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Handle field change with validation
    const handleFieldChange = async (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Only validate if field has been touched
        if (touched[field]) {
            const error = await validateField(field, value);
            setFieldErrors(prev => ({ ...prev, [field]: error }));
        }
    };

    // Handle field blur for validation
    const handleFieldBlur = async (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const error = await validateField(field, formData[field]);
        setFieldErrors(prev => ({ ...prev, [field]: error }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields
        const { isValid, errors } = await validateItem(formData);
        
        if (!isValid) {
            setFieldErrors(errors);
            setTouched({ name: true, description: true, price: true, quantity: true });
            toast.error('Please fix the validation errors');
            return;
        }

        try {
            setSaving(true);
            const data = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price) || 0,
                quantity: parseInt(formData.quantity) || 0
            };

            if (editingItem) {
                await itemService.update(editingItem.id, data, imageFile);
                toast.success('Item updated successfully!');
            } else {
                await itemService.create(data, imageFile);
                toast.success('Item created successfully!');
            }

            resetForm();
            loadItems();
        } catch (error) {
            // Handle backend validation errors
            if (error.errors) {
                const backendErrors = {};
                error.errors.forEach(err => {
                    backendErrors[err.field] = err.message;
                });
                setFieldErrors(backendErrors);
            }
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description || '',
            price: item.price.toString(),
            quantity: item.quantity.toString()
        });
        setFieldErrors({});
        setTouched({});
        // Set existing image preview if available
        setImageFile(null);
        setImagePreview(item.image ? itemService.getImageUrl(item.image) : null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        onOpen();
    };

    const handleDeleteConfirm = async () => {
        if (deleting) return; // Prevent double-click
        
        try {
            setDeleting(true);
            await itemService.delete(deleteId);
            toast.success('Item deleted successfully!');

            if (editingItem?.id === deleteId) {
                resetForm();
            }

            loadItems();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setDeleting(false);
            onClose();
            setDeleteId(null);
        }
    };

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
            {/* Header */}
            <header className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500"></div>
                <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>
                
                {/* User Menu - Top Right */}
                <div className="absolute top-4 right-4 z-20">
                    <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                            <Button
                                variant="flat"
                                className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 min-w-0 px-2"
                            >
                                <Avatar
                                    src={user?.avatar ? `http://localhost:3000/${user.avatar}` : undefined}
                                    name={user?.name}
                                    size="sm"
                                    className="w-8 h-8"
                                    classNames={{
                                        base: "bg-gradient-to-br from-indigo-400 to-pink-400"
                                    }}
                                />
                                <span className="ml-2 hidden sm:inline">{user?.name}</span>
                                <Chip size="sm" variant="flat" className="ml-2 bg-white/20 text-white text-xs">
                                    {user?.role}
                                </Chip>
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="User menu">
                            <DropdownItem
                                key="profile"
                                startContent={<UserCircleIcon className="w-4 h-4" />}
                                description={user?.email}
                            >
                                My Profile
                            </DropdownItem>
                            {isAdmin() && (
                                <DropdownItem
                                    key="users"
                                    startContent={<UsersIcon className="w-4 h-4" />}
                                    onPress={() => navigate('/manage-users')}
                                >
                                    Manage Users
                                </DropdownItem>
                            )}
                            <DropdownItem
                                key="settings"
                                startContent={<Cog6ToothIcon className="w-4 h-4" />}
                                onPress={() => navigate('/settings')}
                            >
                                Settings
                            </DropdownItem>
                            <DropdownItem
                                key="logout"
                                color="danger"
                                startContent={<ArrowRightStartOnRectangleIcon className="w-4 h-4" />}
                                onClick={handleLogout}
                            >
                                Logout
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>

                <div className="relative z-10 py-12 px-4">
                    <div className="max-w-6xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm mb-6 shadow-xl">
                            <CubeIcon className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">
                            Roxeleye CRUD
                        </h1>
                        <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
                            A beautiful demonstration of Node.js, Express, Prisma & React with HeroUI
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
                            <Chip variant="flat" className="bg-white/20 text-white backdrop-blur-sm">Node.js</Chip>
                            <Chip variant="flat" className="bg-white/20 text-white backdrop-blur-sm">Express</Chip>
                            <Chip variant="flat" className="bg-white/20 text-white backdrop-blur-sm">Prisma</Chip>
                            <Chip variant="flat" className="bg-white/20 text-white backdrop-blur-sm">React</Chip>
                            <Chip variant="flat" className="bg-white/20 text-white backdrop-blur-sm">HeroUI</Chip>
                        </div>
                    </div>
                </div>
                {/* Wave decoration */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-[60px]">
                        <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f8fafc" />
                    </svg>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Section - Only shown for users who can create/edit */}
                    <div className="lg:col-span-1">
                        {(canCreate || editingItem) ? (
                        <Card className="shadow-xl">
                            <CardHeader className="flex flex-col items-start px-6 pt-6 pb-0">
                                <div className="flex items-center gap-3 w-full">
                                    <div className={`p-3 rounded-xl ${editingItem ? 'bg-amber-100' : 'bg-indigo-100'}`}>
                                        {editingItem ? (
                                            <PencilSquareIcon className="w-6 h-6 text-amber-600" />
                                        ) : (
                                            <PlusIcon className="w-6 h-6 text-indigo-600" />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">
                                            {editingItem ? 'Edit Item' : 'Add New Item'}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            {editingItem ? 'Update the item details below' : 'Fill in the details to create a new item'}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <Divider className="mt-4" />
                            <CardBody className="px-6 py-6">
                                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                    <Input
                                        type="text"
                                        label="Item Name"
                                        placeholder="Enter item name"
                                        labelPlacement="outside"
                                        variant="bordered"
                                        value={formData.name}
                                        onChange={(e) => handleFieldChange('name', e.target.value)}
                                        onBlur={() => handleFieldBlur('name')}
                                        isRequired
                                        isInvalid={touched.name && !!fieldErrors.name}
                                        errorMessage={touched.name && fieldErrors.name}
                                        classNames={{
                                            label: "text-gray-700 font-semibold mb-1",
                                            input: "text-gray-900",
                                            inputWrapper: `border-gray-300 hover:border-indigo-400 ${touched.name && fieldErrors.name ? 'border-red-500' : ''}`
                                        }}
                                    />

                                    <Textarea
                                        label="Description"
                                        placeholder="Enter item description"
                                        labelPlacement="outside"
                                        variant="bordered"
                                        value={formData.description}
                                        onChange={(e) => handleFieldChange('description', e.target.value)}
                                        onBlur={() => handleFieldBlur('description')}
                                        minRows={3}
                                        isInvalid={touched.description && !!fieldErrors.description}
                                        errorMessage={touched.description && fieldErrors.description}
                                        classNames={{
                                            label: "text-gray-700 font-semibold mb-1",
                                            input: "text-gray-900",
                                            inputWrapper: `border-gray-300 hover:border-indigo-400 ${touched.description && fieldErrors.description ? 'border-red-500' : ''}`
                                        }}
                                    />

                                    <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                                        <Input
                                            type="number"
                                            label="Price ($)"
                                            placeholder="0.00"
                                            labelPlacement="outside"
                                            variant="bordered"
                                            value={formData.price}
                                            onChange={(e) => handleFieldChange('price', e.target.value)}
                                            onBlur={() => handleFieldBlur('price')}
                                            min="0"
                                            step="0.01"
                                            isInvalid={touched.price && !!fieldErrors.price}
                                            errorMessage={touched.price && fieldErrors.price}
                                            startContent={
                                                <div className="pointer-events-none flex items-center">
                                                    <span className="text-gray-400 text-small">$</span>
                                                </div>
                                            }
                                            classNames={{
                                                label: "text-gray-700 font-semibold mb-1",
                                                input: "text-gray-900",
                                                inputWrapper: `border-gray-300 hover:border-indigo-400 ${touched.price && fieldErrors.price ? 'border-red-500' : ''}`
                                            }}
                                        />

                                        <Input
                                            type="number"
                                            label="Quantity"
                                            placeholder="0"
                                            labelPlacement="outside"
                                            variant="bordered"
                                            value={formData.quantity}
                                            onChange={(e) => handleFieldChange('quantity', e.target.value)}
                                            onBlur={() => handleFieldBlur('quantity')}
                                            min="0"
                                            isInvalid={touched.quantity && !!fieldErrors.quantity}
                                            errorMessage={touched.quantity && fieldErrors.quantity}
                                            classNames={{
                                                label: "text-gray-700 font-semibold mb-1",
                                                input: "text-gray-900",
                                                inputWrapper: `border-gray-300 hover:border-indigo-400 ${touched.quantity && fieldErrors.quantity ? 'border-red-500' : ''}`
                                            }}
                                        />
                                    </div>

                                    {/* Image Upload Section */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-gray-700 font-semibold text-sm">
                                            Item Image
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-indigo-400 transition-colors">
                                            {imagePreview ? (
                                                <div className="relative">
                                                    <Image
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="w-full h-40 object-cover rounded-lg"
                                                    />
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        color="danger"
                                                        variant="solid"
                                                        className="absolute top-2 right-2 min-w-6 w-6 h-6"
                                                        onPress={handleRemoveImage}
                                                    >
                                                        <XMarkIcon className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div
                                                    className="flex flex-col items-center justify-center py-6 cursor-pointer"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <PhotoIcon className="w-12 h-12 text-gray-400 mb-2" />
                                                    <p className="text-sm text-gray-500">
                                                        Click to upload image
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        JPEG, PNG, GIF, WebP (max 5MB)
                                                    </p>
                                                </div>
                                            )}
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            type="submit"
                                            color={editingItem ? "warning" : "primary"}
                                            className={`flex-1 font-semibold h-12 text-base ${editingItem
                                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                                    : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                                                } shadow-lg`}
                                            startContent={!saving && (editingItem ? <PencilSquareIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />)}
                                            isLoading={saving}
                                        >
                                            {editingItem ? 'Update Item' : 'Add Item'}
                                        </Button>

                                        {editingItem && (
                                            <Button
                                                type="button"
                                                variant="flat"
                                                onPress={resetForm}
                                                className="font-semibold h-12"
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            </CardBody>
                        </Card>
                        ) : (
                        /* View-only user info card */
                        <Card className="shadow-xl">
                            <CardBody className="p-8 text-center">
                                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6">
                                    <EyeIcon className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">View Only Mode</h3>
                                <p className="text-gray-500 mb-4">
                                    You have read-only access to this inventory. Contact an administrator if you need editing permissions.
                                </p>
                                <Chip color="secondary" variant="flat" className="mx-auto">
                                    <span className="flex items-center gap-1">
                                        <UserIcon className="w-3 h-3" />
                                        {user?.role || 'USER'}
                                    </span>
                                </Chip>
                            </CardBody>
                        </Card>
                        )}

                        {/* Stats Card */}
                        <Card className="mt-6 shadow-xl border-none bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                            <CardBody className="p-6">
                                <div className="flex items-center justify-between text-white">
                                    <div>
                                        <p className="text-indigo-100 text-sm font-medium">Total Items</p>
                                        <p className="text-5xl font-bold mt-1">{items.length}</p>
                                    </div>
                                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                        <ArchiveBoxIcon className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Table Section */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-xl">
                            <CardHeader className="flex flex-col items-start px-6 pt-6 pb-0">
                                <div className="flex items-center gap-3 w-full">
                                    <div className="p-3 rounded-xl bg-emerald-100">
                                        <ArchiveBoxIcon className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">Items List</h2>
                                        <p className="text-sm text-gray-500">Manage your inventory items</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <Divider className="mt-4" />
                            <CardBody className="px-6 py-6">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <Spinner size="lg" color="primary" />
                                        <p className="mt-4 text-gray-500">Loading items...</p>
                                    </div>
                                ) : items.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6">
                                            <InboxIcon className="w-12 h-12 text-gray-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No items yet</h3>
                                        <p className="text-gray-400 max-w-sm mx-auto">
                                            Create your first item using the form on the left to get started.
                                        </p>
                                    </div>
                                ) : (
                                    <Table aria-label="Items table" removeWrapper>
                                        <TableHeader>
                                            <TableColumn>IMAGE</TableColumn>
                                            <TableColumn>ID</TableColumn>
                                            <TableColumn>NAME</TableColumn>
                                            <TableColumn>DESCRIPTION</TableColumn>
                                            <TableColumn>PRICE</TableColumn>
                                            <TableColumn>QTY</TableColumn>
                                            <TableColumn>ACTIONS</TableColumn>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        {item.image ? (
                                                            <Image
                                                                src={itemService.getImageUrl(item.image)}
                                                                alt={item.name}
                                                                className="w-12 h-12 object-cover rounded-lg"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                                <PhotoIcon className="w-6 h-6 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip size="sm" variant="flat" className="bg-gray-100">
                                                            #{item.id}
                                                        </Chip>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <p className="font-semibold text-gray-800">{item.name}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-gray-600 max-w-xs truncate">
                                                            {item.description || '-'}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            variant="flat"
                                                            className="bg-emerald-50 text-emerald-700 font-semibold"
                                                        >
                                                            ${item.price.toFixed(2)}
                                                        </Chip>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            variant="flat"
                                                            className={`font-semibold ${
                                                                item.quantity > 10
                                                                    ? 'bg-emerald-50 text-emerald-700'
                                                                    : item.quantity > 0
                                                                    ? 'bg-amber-50 text-amber-700'
                                                                    : 'bg-red-50 text-red-700'
                                                            }`}
                                                        >
                                                            {item.quantity}
                                                        </Chip>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            {canEdit && (
                                                                <Tooltip content="Edit item" color="warning">
                                                                    <Button
                                                                        isIconOnly
                                                                        size="sm"
                                                                        variant="flat"
                                                                        color="warning"
                                                                        onPress={() => handleEdit(item)}
                                                                        className="min-w-8 w-8 h-8"
                                                                    >
                                                                        <PencilSquareIcon className="w-4 h-4" />
                                                                    </Button>
                                                                </Tooltip>
                                                            )}
                                                            {canDelete && (
                                                                <Tooltip content="Delete item" color="danger">
                                                                    <Button
                                                                        isIconOnly
                                                                        size="sm"
                                                                        variant="flat"
                                                                        color="danger"
                                                                        onPress={() => handleDeleteClick(item.id)}
                                                                        className="min-w-8 w-8 h-8"
                                                                    >
                                                                        <TrashIcon className="w-4 h-4" />
                                                                    </Button>
                                                                </Tooltip>
                                                            )}
                                                            {!canEdit && !canDelete && (
                                                                <span className="text-gray-400 text-sm">View only</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="sm">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-red-100">
                                        <TrashIcon className="w-5 h-5 text-red-600" />
                                    </div>
                                    <span>Delete Item</span>
                                </div>
                            </ModalHeader>
                            <ModalBody>
                                <p className="text-gray-600">
                                    Are you sure you want to delete this item? This action cannot be undone.
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="flat" onPress={onClose} isDisabled={deleting}>
                                    Cancel
                                </Button>
                                <Button
                                    color="danger"
                                    onPress={handleDeleteConfirm}
                                    startContent={!deleting && <TrashIcon className="w-4 h-4" />}
                                    isLoading={deleting}
                                    isDisabled={deleting}
                                >
                                    Delete
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
