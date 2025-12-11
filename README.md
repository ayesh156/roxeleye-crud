# Roxeleye CRUD

A full-stack demonstration project showcasing **Node.js**, **Express**, **Prisma**, and **React + HeroUI** for building a RESTful CRUD API with user authentication and a modern UI.

## 🚀 Features

- **RESTful API** - Full CRUD operations for items
- **User Authentication** - JWT-based login/register system
- **Role-Based Access Control** - Admin and User roles with permissions
- **User Management** - Admin panel to manage users
- **Image Upload** - Upload images with automatic WebP conversion & compression
- **Prisma ORM** - Type-safe database access with MySQL
- **Express.js** - Fast, minimalist web framework
- **React 19 + Vite** - Modern, fast frontend development
- **HeroUI** - Beautiful React component library
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful hand-crafted SVG icons
- **Form Validation** - Client & server-side validation
- **Toast Notifications** - User feedback with React Toastify
- **Protected Routes** - Route guards based on authentication & roles
- **404 Page** - Styled not found page
- **Monorepo Structure** - Organized frontend and backend

## 📁 Project Structure

```
roxeleye-crud/
├── client/                   # React frontend
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── ItemsPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ManageUsersPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   └── itemService.js
│   │   ├── validations/
│   │   │   └── itemValidation.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── server/                   # Express backend
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── itemController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── authValidation.js
│   │   │   ├── itemValidation.js
│   │   │   └── upload.js
│   │   ├── routes/
│   │   │   ├── auth.route.js
│   │   │   └── item.route.js
│   │   ├── utils/
│   │   │   └── logger.js
│   │   └── server.js
│   ├── uploads/
│   │   ├── avatars/
│   │   └── items/
│   ├── logs/
│   ├── .env
│   └── package.json
├── package.json              # Root package with scripts
├── DOCUMENTATION.md          # Detailed project documentation
└── README.md
```

## 🛠️ Setup

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Configure environment:**
   
   Create `server/.env` with:
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/roxeleye_crud"
   JWT_SECRET="your-super-secret-key-change-in-production"
   PORT=3000
   ```
   
3. **Generate Prisma client and run migrations:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Start both frontend and backend with a single command:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   - Frontend: http://localhost:5173
   - API: http://localhost:3000/api/items
   - API Status: http://localhost:3000/api/test

## 👥 User Roles & Permissions

| Permission | USER | ADMIN |
|------------|:----:|:-----:|
| View Items | ✅ | ✅ |
| Create Items | ✅ | ✅ |
| Edit Items | ❌ | ✅ |
| Delete Items | ❌ | ✅ |
| View Own Profile | ✅ | ✅ |
| Manage Users | ❌ | ✅ |

## 📡 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/register` | ❌ | Register new user |
| POST | `/login` | ❌ | Login user |
| GET | `/profile` | ✅ | Get current user profile |
| PATCH | `/profile` | ✅ | Update profile |
| POST | `/avatar` | ✅ | Upload avatar |
| DELETE | `/avatar` | ✅ | Remove avatar |
| GET | `/users` | 🔐 | Get all users (Admin) |
| PATCH | `/users/:id/role` | 🔐 | Update user role (Admin) |
| PATCH | `/users/:id/status` | 🔐 | Toggle user status (Admin) |
| DELETE | `/users/:id` | 🔐 | Delete user (Admin) |

### Items (`/api/items`)

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| GET | `/` | ✅ | Get all items |
| GET | `/:id` | ✅ | Get single item |
| POST | `/` | ✅ | Create new item |
| PUT | `/:id` | 🔐 | Update item (Admin) |
| DELETE | `/:id` | 🔐 | Delete item (Admin) |
| DELETE | `/:id/image` | 🔐 | Delete item image (Admin) |

> ✅ = Authenticated, 🔐 = Admin only, ❌ = Public

### Example Requests

**Register User:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "password123"}'
```

**Create Item (with auth token):**
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Authorization: Bearer <your-token>" \
  -F "name=Test Item" \
  -F "description=A test item" \
  -F "price=29.99" \
  -F "quantity=10" \
  -F "image=@/path/to/image.jpg"
```

**Get All Items:**
```bash
curl http://localhost:3000/api/items \
  -H "Authorization: Bearer <your-token>"
```

## 🔧 Scripts

### Root Commands
| Script | Description |
|--------|-------------|
| `npm run dev` | Start both frontend and backend simultaneously |
| `npm run install:all` | Install all dependencies (root, server, client) |
| `npm run build` | Build frontend for production |
| `npm run setup` | Install all deps and generate Prisma client |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio (database GUI) |

### Server Commands
| Script | Description |
|--------|-------------|
| `npm run dev:server` | Start backend only (with auto-reload) |
| `npm run start:server` | Start backend in production mode |

### Client Commands
| Script | Description |
|--------|-------------|
| `npm run dev:client` | Start frontend only |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |

## 🗄️ Database Schema

```prisma
model Item {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  price       Float    @default(0)
  quantity    Int      @default(0)
  image       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
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

## 📝 Technologies Used

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web application framework |
| **Prisma** | Next-generation ORM |
| **MySQL** | Relational database |
| **JWT** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Multer** | File upload handling |
| **Sharp** | Image processing & WebP conversion |
| **express-validator** | Request validation |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI library |
| **Vite** | Build tool and dev server |
| **HeroUI** | React component library |
| **Tailwind CSS** | Utility-first CSS |
| **Heroicons** | SVG icon library |
| **React Router** | Client-side routing |
| **Framer Motion** | Animations |
| **Yup** | Form validation |
| **React Toastify** | Toast notifications |

## 📚 Documentation

For detailed documentation about the project architecture, see [DOCUMENTATION.md](./DOCUMENTATION.md).

## 📄 License

ISC
