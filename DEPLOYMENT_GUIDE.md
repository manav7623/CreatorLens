# 🚀 CreatorLens Full Deployment Guide (Non-Docker)

This guide covers direct, native Node.js deployment for the **Backend** (Node.js + Socket.io + MySQL) and **Frontend** (Next.js) without using Docker.

---

## 📋 Architecture & Prerequisites

- **Backend**: Native Node.js (v18+), Express, Socket.IO, Sequelize ORM
- **Database**: Cloud MySQL (Aiven Cloud, Railway, AWS RDS, PlanetScale)
- **Frontend**: Next.js 14, Tailwind CSS

---

## 🛠️ Step 1: Deploy the Backend (Native Node.js)

We recommend **Render.com** (Free/Starter Web Service) or **Railway.app** for the backend because they natively run Node.js with full support for WebSocket / Socket.IO connections.

---

### Option A: Render.com (Recommended - 100% Native Node)

1. **Sign Up / Log In**: Go to [render.com](https://render.com) and log in with your GitHub account.
2. **Create Web Service**:
   - Click **New +** -> **Web Service**.
   - Connect your GitHub repository: `CreatorLens`.
3. **Configure the Service**:
   - **Name**: `creatorlens-backend`
   - **Region**: Choose closest to your users (e.g., Singapore, Frankfurt, Oregon)
   - **Root Directory**: `backend`
   - **Environment / Runtime**: `Node` (Native)
   - **Build Command**: `npm install --production`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free or Starter
4. **Configure Environment Variables**:
   In the **Environment** tab, click **Add Environment Variable** and enter:
   | Key | Example Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Production environment |
   | `PORT` | `5000` | Port number |
   | `DB_HOST` | `mysql-321498b7-creatorlens03.h.aivencloud.com` | Aiven MySQL Host |
   | `DB_PORT` | `13144` | Aiven MySQL Port |
   | `DB_USER` | `avnadmin` | MySQL Username |
   | `DB_PASS` | `your_aiven_database_password` | MySQL Password |
   | `DB_NAME` | `defaultdb` | MySQL Database Name |
   | `DB_SSL` | `true` | Required for Aiven SSL |
   | `JWT_SECRET` | `your_super_secret_jwt_key_here` | Secret for auth tokens |
   | `CLIENT_URL` | `http://localhost:3000,https://your-frontend.vercel.app` | Allowed CORS URLs |
   | `RAPIDAPI_KEY` | `your_rapidapi_key` | Social data integration |
   | `RAZORPAY_KEY_ID` | `rzp_test_xxxx` | Razorpay Key ID |
   | `RAZORPAY_KEY_SECRET` | `your_razorpay_secret` | Razorpay Secret Key |
   | `EMAIL_USER` | `your_email@gmail.com` | Gmail SMTP sender |
   | `EMAIL_PASS` | `your_gmail_app_password` | Gmail App Password |
   | `EMAIL_FROM` | `your_email@gmail.com` | From Email Address |
5. **Health Check Path**: Under *Advanced*, set **Health Check Path** to `/health`.
6. Click **Create Web Service**.
7. Once deployed, Render will provide your public URL:
   `https://creatorlens-backend.onrender.com`

---

### Option B: Railway.app (Native Node)

1. Go to [railway.app](https://railway.app) and create a project.
2. Select **Deploy from GitHub repo** -> `CreatorLens`.
3. In service settings:
   - Set **Root Directory**: `/backend`
   - Build & Start commands are automatically detected via `package.json` (`npm start`).
4. In the **Variables** tab, add all environment variables listed above.
5. In **Networking**, click **Generate Domain** to get your live backend URL.

---

### Option C: Linux VPS / Ubuntu Server (PM2 + Nginx)

If deploying to your own Ubuntu VPS or AWS EC2 instance:

1. **Install Node.js & PM2**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs nginx
   sudo npm install -g pm2
   ```

2. **Clone & Setup Project**:
   ```bash
   git clone https://github.com/your-username/CreatorLens.git
   cd CreatorLens/backend
   npm install --production
   ```

3. **Configure Environment File**:
   ```bash
   cp .env.example .env
   nano .env # Fill in your DB credentials and secrets
   ```

4. **Start Application with PM2**:
   ```bash
   pm2 start server.js --name "creatorlens-backend"
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx Reverse Proxy** (`/etc/nginx/sites-available/creatorlens`):
   ```nginx
   server {
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://127.0.0.1:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   Enable SSL with Certbot: `sudo certbot --nginx -d api.yourdomain.com`

---

## 🌐 Step 2: Deploy the Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) and click **Add New...** -> **Project**.
2. Import the `CreatorLens` repository.
3. Configure Project Settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
4. Add **Environment Variables**:
   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://creatorlens-backend.onrender.com/api` |
   | `NEXT_PUBLIC_SOCKET_URL`| `https://creatorlens-backend.onrender.com` |
   *(Use your actual backend URL from Step 1)*
5. Click **Deploy**.

---

## 🔄 Step 3: Link CORS

Once the frontend deployment completes and you have your Vercel URL (e.g. `https://creatorlens.vercel.app`):
1. Go to your backend environment variables (on Render or Railway).
2. Update `CLIENT_URL`:
   ```env
   CLIENT_URL=http://localhost:3000,https://creatorlens.vercel.app
   ```
3. Restart or redeploy the backend service.

---

## 🧪 Testing the Deployment

1. **Backend Health Check**:
   Open in browser: `https://your-backend-url/health`
   Should return: `{"status":"ok","uptime":...}`

2. **Frontend UI**:
   Open your Vercel domain, register or log in, test campaigns, Socket.IO messaging, and creator analytics.
