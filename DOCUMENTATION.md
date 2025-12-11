# Roxeleye CRUD - Project Documentation

A full-stack CRUD application built with **Node.js**, **Express**, **Prisma ORM**, and **React + HeroUI**. This document explains the project architecture, components, and how everything works together.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Backend Architecture](#backend-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Database Schema](#database-schema)
7. [Authentication & Authorization](#authentication--authorization)
8. [API Endpoints](#api-endpoints)
9. [File Upload System](#file-upload-system)
10. [Getting Started](#getting-started)
11. [Available Scripts](#available-scripts)

---

## Project Overview

Roxeleye CRUD is a monorepo application demonstrating:
- Full CRUD operations for inventory items
- User authentication with JWT tokens
- Role-based access control (Admin/User)
- Image upload with automatic compression to WebP
- Modern React UI with HeroUI components

---

## Technology Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **Prisma** | ORM for database operations |
| **MySQL** | Database |
| **JWT** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Multer** | File upload handling |
| **Sharp** | Image processing & compression |
| **express-validator** | Request validation |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI library |
| **Vite** | Build tool & dev server |
| **React Router DOM** | Client-side routing |
| **HeroUI** | Component library |
| **Tailwind CSS** | Styling |
| **Heroicons** | Icon library |
| **Framer Motion** | Animations |
| **Yup** | Form validation |
| **React Toastify** | Toast notifications |

---

## Project Structure

```
roxeleye-crud/
├── package.json              # Root package (monorepo scripts)
├── client/                   # React frontend
│   ├── src/
│   │   ├── context/          # React Context (AuthContext)
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service layers
│   │   ├── validations/      # Yup validation schemas
│   │   ├── App.jsx           # Main app with routing
│   │   └── main.jsx          # Entry point
│   └── package.json
├── server/                   # Express backend
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── migrations/       # Database migrations
│   ├── src/
│   │   ├── config/           # Database configuration
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Auth, validation, upload
│   │   ├── routes/           # API route definitions
│   │   └── utils/            # Logger utility
│   ├── uploads/              # Uploaded files storage
│   │   ├── avatars/          # User avatar images
│   │   └── items/            # Item images
│   └── package.json
└── README.md
```

---

## Backend Architecture

### Server Entry Point (`server/src/server.js`)

The Express server initializes:
- JSON body parsing middleware
- Static file serving for uploads
- API routes mounting
- Test endpoint for API status

### Controllers

#### Item Controller (`controllers/itemController.js`)
Handles CRUD operations for inventory items:

| Function | Description |
|----------|-------------|
| `getAllItems` | Retrieves all items, ordered by creation date |
| `getItemById` | Retrieves a single item by ID |
| `createItem` | Creates a new item with optional image |
| `updateItem` | Updates item details and/or image |
| `deleteItem` | Deletes item and associated image |
| `deleteItemImage` | Removes only the item's image |

#### Auth Controller (`controllers/authController.js`)
Handles user authentication and management:

| Function | Description |
|----------|-------------|
| `register` | Creates new user account |
| `login` | Authenticates user, returns JWT |
| `getProfile` | Returns current user's profile |
| `updateProfile` | Updates user profile details |
| `updateAvatar` | Uploads/updates user avatar |
| `deleteAvatar` | Removes user avatar |
| `getAllUsers` | Admin: Lists all users |
| `updateUserRole` | Admin: Changes user role |
| `toggleUserStatus` | Admin: Activates/deactivates user |
| `deleteUser` | Admin: Deletes a user |

### Middleware

#### Authentication (`middleware/auth.js`)
```javascript
// authenticate - Verifies JWT token from Authorization header
// authorize(...roles) - Restricts access to specific roles
// isAdmin - Shorthand for authorize('ADMIN')
// isAdminOrOwner - Allows admin OR the resource owner
```

#### Validation (`middleware/itemValidation.js`, `middleware/authValidation.js`)
Uses `express-validator` to validate request bodies and parameters.

#### File Upload (`middleware/upload.js`)
- Uses **Multer** for file upload handling
- Uses **Sharp** for image processing
- Converts all images to WebP format
- Compresses and resizes images:
  - Items: Max 800x800px, 80% quality
  - Avatars: 400x400px square crop

---

## Frontend Architecture

### Routing (`App.jsx`)

The app uses React Router with three route wrapper components:

```jsx
// PublicRoute - Redirects authenticated users to home
// ProtectedRoute - Requires authentication
// AdminRoute - Requires ADMIN role
```

**Routes:**
| Path | Component | Access |
|------|-----------|--------|
| `/login` | LoginPage | Public |
| `/register` | RegisterPage | Public |
| `/` | ItemsPage | Protected |
| `/settings` | SettingsPage | Protected |
| `/manage-users` | ManageUsersPage | Admin Only |
| `*` | NotFoundPage | Public |

### Authentication Context (`context/AuthContext.jsx`)

Provides authentication state and methods throughout the app:

```javascript
const { user, login, register, logout, isAuthenticated, isAdmin, permissions } = useAuth();
```

**Features:**
- Stores auth token in HTTP-only-like cookies
- Syncs user data between localStorage and cookies
- Detects storage tampering across browser tabs
- Provides role-based permission checks

**Permissions Object:**
```javascript
permissions = {
  canViewItems: isAuthenticated,
  canCreateItem: isAuthenticated,
  canEditItem: isAdmin,
  canDeleteItem: isAdmin,
  canViewUsers: isAdmin,
  canEditUserRole: isAdmin,
  canToggleUserStatus: isAdmin,
  canDeleteUser: isAdmin,
}
```

### Services

#### Auth Service (`services/authService.js`)
Handles all authentication-related API calls:
- Login/Register
- Profile management
- Avatar upload/delete
- User management (admin)

#### Item Service (`services/itemService.js`)
Handles all item-related API calls:
- CRUD operations
- Image upload
- Image URL generation

---

## Database Schema

### Prisma Schema (`prisma/schema.prisma`)

```prisma
model Item {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  price       Float    @default(0)
  quantity    Int      @default(0)
  image       String?  // Path to uploaded image
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String   // Hashed with bcrypt
  name      String
  role      Role     @default(USER)
  avatar    String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  ADMIN
  USER
}
```

---

## Authentication & Authorization

### JWT Token Flow

1. **Registration/Login**: User submits credentials
2. **Token Generation**: Server creates JWT with payload:
   ```javascript
   { userId, email, role }
   ```
3. **Token Storage**: Client stores token in cookie + user in localStorage
4. **Request Authentication**: Client sends `Authorization: Bearer <token>` header
5. **Token Verification**: Server middleware validates token on protected routes

### Password Security
- Passwords hashed with **bcryptjs** (12 salt rounds)
- Never stored or transmitted in plain text

### Role-Based Access Control

| Role | Items | Users |
|------|-------|-------|
| **USER** | View, Create | Own profile only |
| **ADMIN** | View, Create, Edit, Delete | Full management |

---

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Register new user |
| POST | `/login` | ❌ | Login user |
| GET | `/profile` | ✅ | Get current user profile |
| PATCH | `/profile` | ✅ | Update profile |
| POST | `/avatar` | ✅ | Upload avatar |
| DELETE | `/avatar` | ✅ | Remove avatar |
| GET | `/users` | 🔐 Admin | Get all users |
| PATCH | `/users/:id/role` | 🔐 Admin | Update user role |
| PATCH | `/users/:id/status` | 🔐 Admin | Toggle user active status |
| DELETE | `/users/:id` | 🔐 Admin | Delete user |

### Item Routes (`/api/items`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✅ | Get all items |
| GET | `/:id` | ✅ | Get single item |
| POST | `/` | ✅ | Create item |
| PUT | `/:id` | 🔐 Admin | Update item |
| DELETE | `/:id` | 🔐 Admin | Delete item |
| DELETE | `/:id/image` | 🔐 Admin | Delete item image |

### Response Format

All API responses follow this format:

```json
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": "Error message",
  "errors": [ ... ] // Optional validation errors
}
```

---

## File Upload System

### How It Works

1. **Client**: Sends file via `multipart/form-data`
2. **Multer**: Receives file into memory buffer
3. **Sharp**: Processes image:
   - Resizes to max dimensions
   - Converts to WebP format
   - Compresses with quality setting
4. **Save**: Writes processed image to disk
5. **Database**: Stores relative file path

### Image Specifications

| Type | Max Size | Dimensions | Quality |
|------|----------|------------|---------|
| Item Images | 10MB (pre-compression) | 800x800 (fit inside) | 80% WebP |
| Avatars | 10MB (pre-compression) | 400x400 (square crop) | 80% WebP |

### Allowed File Types
- JPEG/JPG
- PNG
- GIF
- WebP

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd roxeleye-crud
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure environment**
   
   Create `server/.env`:
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/roxeleye_crud"
   JWT_SECRET="your-super-secret-key-change-in-production"
   PORT=3000
   ```

4. **Setup database**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Status**: http://localhost:3000/api/test
- **Prisma Studio**: `npm run prisma:studio`

---

## Available Scripts

### Root Level

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both client and server in dev mode |
| `npm run start` | Start both in production mode |
| `npm run install:all` | Install dependencies for all packages |
| `npm run build` | Build client for production |
| `npm run setup` | Full initial setup |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio GUI |

### Server (`cd server`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with auto-reload |
| `npm start` | Start production server |

### Client (`cd client`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Environment Variables

### Server (`server/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | Required |
| `JWT_SECRET` | Secret for JWT signing | Fallback provided (change in production!) |
| `PORT` | Server port | 3000 |

---

## Security Considerations

1. **JWT Secret**: Always use a strong, unique secret in production
2. **Password Hashing**: Uses bcrypt with 12 rounds
3. **Input Validation**: All inputs validated with express-validator
4. **File Upload**: Type and size restrictions enforced
5. **CORS**: Configure appropriately for production
6. **Token Expiry**: JWTs expire after 7 days

---

## Logging

The server uses a custom logger (`utils/logger.js`) that:
- Logs to console with timestamps
- Writes to `logs/` directory
- Includes context for debugging (error stacks, user IDs, etc.)

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting: `npm run lint`
5. Submit a pull request

---

## License

ISC License

---

*Generated for Roxeleye CRUD v1.0.0*
