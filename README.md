# 🌟 VolunteerHub - Nền tảng Tình nguyện Việt Nam

> Nền tảng kết nối tình nguyện viên và tổ chức từ thiện tại Việt Nam với tính năng real-time và thông báo offline.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)]()

## 🌐 Demo

**🔗 Live Demo:** [https://youthvolunteer.vercel.app](https://youthvolunteer.vercel.app)

**📡 API Endpoint:** [https://volunteerhub-api-gst2.onrender.com](https://volunteerhub-api-gst2.onrender.com)

### Demo Accounts

**Quản trị viên:**
- Email: `admin@volunteerhub.vn`
- Password: `admin123456`

**Tổ chức:**
- Email: `org@example.com`
- Password: `Org@123456`

**Tình nguyện viên:**
- Email: `volunteer@example.com`
- Password: `Volunteer@123`

## 📋 Mục lục

- [Demo](#-demo)
- [Giới thiệu](#-giới-thiệu)
- [Tính năng chính](#-tính-năng-chính)
- [Tech Stack](#-tech-stack)
- [Cài đặt](#-cài-đặt)
- [Sử dụng](#-sử-dụng)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [API Overview](#-api-overview)


## 🎯 Giới thiệu

VolunteerHub là nền tảng quản lý hoạt động tình nguyện được thiết kế đặc biệt cho cộng đồng Việt Nam. Hệ thống hỗ trợ 3 vai trò người dùng (Tình nguyện viên, Tổ chức, Quản trị viên) với các tính năng:

- ✅ Quản lý sự kiện tình nguyện
- 💬 Giao tiếp real-time (chat)
- 🔔 Thông báo offline (Push Notifications)
- 📱 Progressive Web App (PWA)
- 🇻🇳 Hỗ trợ tiếng Việt hoàn chỉnh

## ✨ Tính năng chính

### Cho Tình nguyện viên
- 🔍 Tìm kiếm và đăng ký tham gia sự kiện
- 📊 Theo dõi lịch sử hoạt động
- 💬 Chat với người tổ chức và tình nguyện viên khác
- 🏆 Quản lý hồ sơ cá nhân

### Cho Tổ chức
- 📝 Tạo và quản lý sự kiện
- 👥 Quản lý danh sách tình nguyện viên
- ✅ Phê duyệt đơn đăng ký
- 📢 Gửi thông báo cho người tham gia

### Cho Quản trị viên
- 🛡️ Kiểm duyệt sự kiện
- 👤 Quản lý người dùng
- 📈 Thống kê hệ thống
- 🔐 Phân quyền truy cập

## 🛠 Tech Stack

### Frontend
- **React 18** - UI Library
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Zustand** - State Management
- **Axios** - HTTP Client
- **Socket.IO Client** - Real-time Communication

### Backend
- **Node.js + Express** - Server Framework
- **Prisma** - ORM
- **PostgreSQL** - Database
- **Redis** - Cache & Sessions
- **Socket.IO** - WebSocket Server
- **JWT** - Authentication
- **Cloudinary** - File Storage
- **Web Push** - Push Notifications

### DevOps & Deployment
- **Docker & Docker Compose** - Containerization
- **Vercel** - Frontend Hosting
- **Render** - Backend Hosting
- **Neon** - PostgreSQL Database
- **Upstash** - Redis Cloud

## 📦 Cài đặt

### Yêu cầu hệ thống

```bash
Node.js >= 18.0.0
npm >= 9.0.0
PostgreSQL >= 15.0
Redis >= 7.0
Docker (optional)
```

### Cài đặt local

1. **Clone repository**
```bash
git clone https://github.com/cuong912005/volunteer.git
cd apps
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Setup database với Docker**
```bash
docker-compose up -d
```


1. **Cấu hình environment variables**

Tạo file `.env` trong `apps/api`:
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/volunteerhub"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Redis
REDIS_URL="redis://localhost:6379"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# VAPID (Web Push)
VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
VAPID_SUBJECT="mailto:your-email@example.com"

# Server
PORT=3001
NODE_ENV="development"
CLIENT_URL="http://localhost:5173"
```

Generate VAPID keys:
```bash
npx web-push generate-vapid-keys
```

5. **Chạy database migrations**
```bash
npm run db:migrate
```

6. **Khởi động development server**
```bash
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:3001

## 🚀 Sử dụng

### Development

```bash
# Chạy cả frontend và backend
npm run dev

# Chỉ chạy frontend
npm run dev:web

# Chỉ chạy backend
npm run dev:api

# Build production
npm run build
```


## 📁 Cấu trúc dự án

```
volunteerhub/
├── apps/
│   ├── web/                 # React Frontend
│   │   ├── src/
│   │   │   ├── components/  # UI Components
│   │   │   ├── pages/       # Page Components
│   │   │   ├── stores/      # Zustand Stores
│   │   │   ├── services/    # API Services
│   │   │   ├── hooks/       # Custom Hooks
│   │   │   └── utils/       # Utilities
│   │   ├── public/
│   │   │   ├── sw.js        # Service Worker
│   │   │   └── manifest.json
│   │   └── package.json
│   │
│   └── api/                 # Express Backend
│       ├── src/
│       │   ├── routes/      # API Routes
│       │   ├── services/    # Business Logic
│       │   ├── repositories/# Data Access
│       │   ├── middleware/  # Express Middleware
│       │   ├── config/      # Configuration
│       │   └── utils/       # Utilities
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       └── package.json
│
├── packages/
│   └── shared/              # Shared Code
│       ├── constants/
│       ├── types/
│       └── utils/
│
│
├── docker-compose.yml
├── package.json
└── README.md
```

## 📚 API Overview 

**Base URL:**
- Production: `https://volunteerhub-api-gst2.onrender.com/api`
- Development: `http://localhost:3001/api`

**Authentication:**
```bash
POST   /api/auth/register           # Đăng ký tài khoản
POST   /api/auth/login              # Đăng nhập
POST   /api/auth/logout             # Đăng xuất
POST   /api/auth/refresh            # Refresh access token
GET    /api/auth/me                 # Lấy thông tin user hiện tại
POST   /api/auth/logout-all         # Đăng xuất khỏi tất cả thiết bị
```

**Events:**
```bash
GET    /api/events                  # Danh sách sự kiện (có filter, search, pagination)
GET    /api/events/:id              # Chi tiết sự kiện
POST   /api/events                  # Tạo sự kiện mới (Organizer)
PUT    /api/events/:id              # Cập nhật sự kiện
DELETE /api/events/:id              # Xóa sự kiện
POST   /api/events/:id/register     # Đăng ký tham gia sự kiện
GET    /api/events/:id/participants # Danh sách người tham gia
PUT    /api/events/:eventId/participants/:participantId  # Phê duyệt/từ chối người tham gia
```

**Users:**
```bash
GET    /api/users                   # Danh sách users (Admin only)
GET    /api/users/:id               # Thông tin user
PUT    /api/users/:id               # Cập nhật profile
PUT    /api/users/:id/status        # Khóa/mở khóa user (Admin only)
DELETE /api/users/:id               # Xóa user (Admin only)
```

**Channels (Chat):**
```bash
GET    /api/channels                # Danh sách channels của user
GET    /api/channels/:id/messages   # Lấy tin nhắn trong channel
POST   /api/channels/:id/messages   # Gửi tin nhắn
POST   /api/channels/:id/read       # Đánh dấu tin nhắn đã đọc
```

**Notifications:**
```bash
GET    /api/notifications/history   # Lịch sử thông báo
POST   /api/notifications/subscribe # Đăng ký push notifications
DELETE /api/notifications/unsubscribe # Hủy push notifications
PUT    /api/notifications/:id/read  # Đánh dấu thông báo đã đọc
PUT    /api/notifications/read-all  # Đánh dấu tất cả đã đọc
```

**Dashboard:**
```bash
GET    /api/dashboard/stats         # Thống kê tổng quan (Admin)
GET    /api/dashboard/user          # Dashboard của user (Volunteer/Organizer)
```

**Admin:**
```bash
GET    /api/admin/events/pending    # Danh sách sự kiện chờ duyệt
PUT    /api/admin/events/:id/review # Phê duyệt/từ chối sự kiện
```

**WebSocket Events (Socket.IO):**
- `join_channel` - Tham gia channel
- `leave_channel` - Rời channel
- `send_message` - Gửi tin nhắn
- `new_message` - Nhận tin nhắn mới
- `typing_start` / `typing_stop` - Typing indicator
- `notification` - Nhận thông báo realtime

---



