# Roxeleye CRUD

A demonstration project showcasing **Node.js**, **Express**, **Prisma**, and **React + HeroUI** for building a RESTful CRUD API with a modern UI.

## 🚀 Features

- **RESTful API** - Full CRUD operations for items
- **Prisma ORM** - Type-safe database access with MySQL
- **Express.js** - Fast, minimalist web framework
- **React + Vite** - Modern, fast frontend development
- **HeroUI** - Beautiful React component library
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful hand-crafted SVG icons
- **404 Page** - Styled not found page
- **Monorepo Structure** - Organized frontend and backend

## 📁 Project Structure

```
roxeleye-crud/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ItemsPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/
│   │   │   └── itemService.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express backend
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   └── itemController.js
│   │   ├── routes/
│   │   │   └── itemRoutes.js
│   │   └── server.js
│   ├── .env
│   └── package.json
├── package.json            # Root package with scripts
└── README.md
```

## 🛠️ Setup

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Configure database:**
   - Update `server/.env` with your MySQL connection string
   
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

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | Get all items |
| GET | `/api/items/:id` | Get single item |
| POST | `/api/items` | Create new item |
| PUT | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |

### Example Requests

**Create Item:**
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Item", "description": "A test item", "price": 29.99, "quantity": 10}'
```

**Get All Items:**
```bash
curl http://localhost:3000/api/items
```

**Update Item:**
```bash
curl -X PUT http://localhost:3000/api/items/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Item", "price": 39.99}'
```

**Delete Item:**
```bash
curl -X DELETE http://localhost:3000/api/items/1
```

## 🔧 Scripts

### Root Commands
- `npm run dev` - Start both frontend and backend simultaneously
- `npm run install:all` - Install all dependencies (root, server, client)
- `npm run build` - Build frontend for production
- `npm run setup` - Install all deps and generate Prisma client

### Server Commands
- `npm run dev:server` - Start backend only
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

### Client Commands
- `npm run dev:client` - Start frontend only

## 📝 Technologies Used

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Prisma** - Next-generation ORM
- **MySQL** - Relational database

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **HeroUI** - React component library
- **Tailwind CSS** - Utility-first CSS
- **Heroicons** - SVG icon library
- **React Router** - Client-side routing

## 📄 License

ISC
