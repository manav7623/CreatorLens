# 🌟 CreatorLens - AI-Powered Brand & Creator Collaboration Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.0.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap)](https://getbootstrap.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=for-the-badge&logo=mysql)](https://www.mysql.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-ORM-52B0E7?style=for-the-badge&logo=sequelize)](https://sequelize.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-010101?style=for-the-badge&logo=socket.io)](https://socket.io/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Escrow_Payments-0C2340?style=for-the-badge&logo=razorpay)](https://razorpay.com/)

**CreatorLens** is an end-to-end marketplace connecting verified digital creators and global brands with AI-driven talent analytics, secure milestone escrow payments, automated content submission reviews, and low-latency real-time chat communication.

---

## 🚀 Key Features

### 🎨 For Creators
- **AI-Powered Profile Scoring**: Real-time evaluation of engagement rates, follower authenticity (fake follower detection), content consistency, and audience demographics.
- **Campaign Discovery & Pitching**: Browse active brand campaigns filtered by niche, platform, and minimum budget. Submit tailored proposals with proposed deliverables and timelines.
- **Direct & Deal Messaging**: Real-time Socket.IO chat with brands, support for media proof uploads (images, videos, documents).
- **Deliverable Submissions**: Submit published URLs, draft videos, or image assets directly for brand review.
- **Earnings & Escrow Tracking**: Transparent visibility into held, released, and pending milestone payouts.

### 🏢 For Brands
- **Campaign Lifecycle Management**: Launch campaigns with customizable budgets, platform targets, requirements, and deadline dates.
- **Talent Discovery Engine**: Search and filter thousands of creators across niches with live AI authenticity scores, social media metrics, and rate cards.
- **Direct Outreach & Negotiation**: Message creators directly before or after applying to collaborate on custom deals.
- **Content Review System**: Review, approve, or request revisions on submitted drafts and live campaign deliverables.
- **Milestone Escrow Payments**: Secure transactions via Razorpay with automated holding and fund release upon satisfactory completion.

### 🛡️ For Platform Admins
- **Ecosystem Oversight**: Global metrics on total revenue, platform commissions, active campaigns, and collaboration statistics.
- **User Verification & Moderation**: Verify creator badges, manage bans, monitor suspicious activities.
- **Financial Audit Logs**: Full transaction logs across held, completed, and refunded payouts.

---

## 📁 Repository Architecture

```
CreatorLens/
├── backend/                  ← Node.js + Express.js API Server
│   ├── config/               ← Database connection & SSL configuration (MySQL / Sequelize)
│   ├── middleware/           ← JWT Authentication & Role-based Guards (Admin / Brand / Creator)
│   ├── models/               ← Relational Schemas (User, Campaign, Application, Message, Payment, ContentSubmission)
│   ├── routes/               ← Express REST Endpoints
│   │   ├── admin.js          ← Admin analytics & user moderation
│   │   ├── analytics.js      ← Creator/Brand performance metrics
│   │   ├── applications.js   ← Campaign proposal submissions & status updates
│   │   ├── auth.js           ← Register, login, forgot/reset password with OTP
│   │   ├── campaigns.js      ← Campaign CRUD & discovery
│   │   ├── content.js        ← Deliverable submissions & review workflows
│   │   ├── instagram.js      ← Instagram API analytics scraper
│   │   ├── messages.js       ← Direct & Application real-time chat
│   │   ├── payments.js       ← Razorpay escrow orders, verification & releases
│   │   └── users.js          ← Creator directory & AI profile analyzer
│   ├── utils/                ← AI scoring logic, email dispatcher & SQL compatibility layer
│   ├── server.js             ← Express app & Socket.IO server setup
│   └── seed.js               ← Demo seeding script with realistic data
│
├── frontend/                 ← Next.js 14 App Router + Tailwind CSS + Redux Toolkit
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/        ← Admin dashboard (users, campaigns, payments)
│   │   │   ├── auth/         ← Sign-in, sign-up, password recovery with 6-digit OTP
│   │   │   ├── campaigns/    ← Browse campaigns, create campaign, manage proposals
│   │   │   ├── creators/     ← Discover creators with AI scores & filters
│   │   │   ├── dashboard/    ← User dashboard, earnings, profile & content reviews
│   │   │   ├── messages/     ← Real-time chat with direct outreach & file attachments
│   │   │   └── layout.js     ← Root application layout with Redux & theme providers
│   │   ├── components/       ← Reusable UI components (Sidebar, Modals, Cards)
│   │   ├── lib/              ← Axios API client with token interceptors
│   │   └── store/            ← Redux Toolkit auth slice & global state
│   └── public/               ← Static assets and icons
│
└── server.js                 ← Unified root server entrypoint
```

---

## ⚡ Quick Start Guide (Local Setup)

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **MySQL Database** (Local MySQL 8.0 or Cloud MySQL like Aiven / PlanetScale / Railway)
- **Git**

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/manav7623/CreatorLens.git
cd CreatorLens
```

---

### Step 2: Backend Configuration & Startup

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   npm install
   ```

2. Configure environment variables in `backend/.env`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASS=your_mysql_password
   DB_NAME=creatorlens
   DB_SSL=false
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   CLIENT_URL=http://localhost:3000

   # Optional Integrations
   RAPIDAPI_KEY=your_rapidapi_instagram_key
   RAZORPAY_KEY_ID=rzp_test_your_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   EMAIL_FROM=your_email@gmail.com
   ```

3. Seed the database with demo accounts and campaigns:
   ```bash
   node seed.js
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   > Backend will run at: `http://localhost:5000`

---

### Step 3: Frontend Configuration & Startup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   npm install
   ```

2. Configure environment variables in `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   ```

3. Start the Next.js frontend dev server:
   ```bash
   npm run dev
   ```
   > Web app will be accessible at: `http://localhost:3000`

---

## 👥 Demo Test Accounts

All pre-seeded demo accounts use the standard password: **`MD123456`**

| Role | Name | Email | Password | Key Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| 🛡️ **Admin** | Platform Admin | `admin@demo.com` | `MD123456` | Full platform management, payments oversight, user verification |
| 🏢 **Brand** | Puma India | `puma.india.brand@gmail.com` | `MD123456` | Post campaigns, review applications, chat & release escrow funds |
| 🏢 **Brand** | Samsung India | `samsung.creatorhub@gmail.com` | `MD123456` | Hire creators, inspect analytics, direct outreach |
| 🎨 **Creator** | Manav Patel | `dhameliyamanav@gmail.com` | `MD123456` | AI Score 92/100, submit deliverables, chat with brands |
| 🎨 **Creator** | MD Reviews | `md.creator.official@gmail.com` | `MD123456` | Tech niche, active deal proposals, real-time messaging |
| 🎨 **Creator** | Tamanna Sharma | `tamanna.fashion@gmail.com` | `MD123456` | Fashion & Lifestyle creator with 150K+ followers |

---

## 🌐 API Reference

### 🔐 Authentication & Accounts
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register creator or brand account |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token |
| `GET` | `/api/auth/me` | Fetch authenticated session profile |
| `POST` | `/api/auth/forgot-password`| Send 6-digit OTP email for password recovery |
| `POST` | `/api/auth/reset-password` | Reset password using valid OTP code |

### 📢 Campaigns & Applications
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/campaigns` | Discover campaigns with niche, budget & platform filters |
| `POST` | `/api/campaigns` | Create new campaign (Brand only) |
| `GET` | `/api/campaigns/my` | Get brand's active and completed campaigns |
| `POST` | `/api/applications` | Creator applies to active campaign with proposal |
| `GET` | `/api/applications/my` | Creator's submitted applications & deal status |
| `PUT` | `/api/applications/:id/status`| Accept, shortlist, reject, or complete deal |

### 💬 Real-Time Messaging & Direct Chat
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/messages/conversations` | List all active deal & direct chat channels |
| `GET` | `/api/messages/search/users` | Search creators or brands to initiate a new chat |
| `GET` | `/api/messages/:conversationId` | Retrieve full chat history & mark as read |
| `POST` | `/api/messages` | Send message or upload media attachment (images, videos, PDFs) |
| `DELETE`| `/api/messages/conversation/:id`| Clear chat history |

### 💳 Escrow Payments (Razorpay)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/payments/create-order` | Create Razorpay escrow order |
| `POST` | `/api/payments/verify` | Verify payment signature and hold funds |
| `POST` | `/api/payments/release/:id` | Release milestone funds to creator upon completion |
| `GET` | `/api/payments/my` | User payment transaction history |

### 📦 Content Deliverables & Reviews
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/content/submit` | Creator submits proof (draft video, post URL) |
| `GET` | `/api/content/my` | Creator's submitted deliverables |
| `PUT` | `/api/content/:id/review` | Brand approves or requests revision |

---

## ☁️ Deployment Guide

### Deploy Backend on [Render](https://render.com)
1. Link your GitHub repository.
2. Create a new **Web Service** with:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
3. Add environment variables: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_SSL=true`, `JWT_SECRET`, `CLIENT_URL`.

### Deploy Frontend on [Vercel](https://vercel.com)
1. Import repository on Vercel.
2. Set **Root Directory** to `frontend`.
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com/api`
   - `NEXT_PUBLIC_SOCKET_URL=https://your-backend-service.onrender.com`
4. Deploy!

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React 18, **Bootstrap 5.3 (PBL Guideline Compliant)**, Tailwind CSS, Redux Toolkit, Lucide Icons |
| **Backend API** | Node.js, Express.js, Socket.IO, Multer, Bcrypt, JWT |
| **Database** | MySQL 8.0, Sequelize ORM with Hybrid SQL Compatibility Layer |
| **Payment Gateway**| Razorpay Escrow API |
| **Mailing Service**| Nodemailer with SMTP |
| **Deployment** | Vercel (Frontend), Render / Railway (Backend), Aiven Cloud (MySQL) |

---

## 📄 License
This project is licensed under the MIT License.
