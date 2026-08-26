# Md Sakhawat Hossain — Creative Graphic Designer
### Production Full-Stack Personal Portfolio, Creative Design Business Platform & Admin CMS

A high-performance, production-ready full-stack web application, client booking portal, and custom content management system (CMS) tailored specifically for **Md Sakhawat Hossain** (Creative Graphic Designer).

---

## 👨‍🎨 Designer Profile & Contact

- **Name**: Md Sakhawat Hossain
- **Professional Title**: Creative Graphic Designer
- **Phone / WhatsApp**: `01781955355`
- **Email**: [designersakhawat@gmail.com](mailto:designersakhawat@gmail.com)
- **Location**: Ishurdi, Pabna, Rajshahi, Bangladesh
- **Education**: Computer Engineering / Computer Science, Rajshahi Polytechnic Institute (2020, CGPA: 3.32)
- **Freelance & Agency Experience**: 3+ years
- **International Client Experience**: Yes (Bangladesh, Dubai UAE, United States)
- **Availability**: Immediate (Remote Worldwide)
- **LinkedIn**: [https://www.linkedin.com/in/designersakhawat/](https://www.linkedin.com/in/designersakhawat/)
- **Behance**: [https://www.behance.net/sakhawatdesigner](https://www.behance.net/sakhawatdesigner)
- **Website**: [https://designersakhawat.com/](https://designersakhawat.com/)

---

## 🎨 Positioning & Specializations

Specializing in marketing-driven visual communications:
1. **Logo & Branding**: Primary & secondary logo systems, master vector files, typography, and brand books.
2. **Ads Creative**: High-converting social media static & carousel creatives for Meta (Facebook/Instagram), TikTok, and Google Ads.
3. **UGC Video**: Dynamic short-form video editing (TikTok, Reels, Shorts) with hook pacing, animated subtitles, and sound design.
4. **Cover Branding**: Digital storefront banners, LinkedIn headers, YouTube channel art, and podcast branding.
5. **E-Commerce & Product Presentation**: Sales-driven product image framing, infographic spec callouts, and lifestyle compositions.

---

## 🌟 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Tailwind CSS, Framer Motion, React Router v6, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js, Express.js REST API, Helmet, CORS, Express-Rate-Limit, Multer |
| **Database & ORM** | MySQL (Production), SQLite (Local Fallback), Prisma ORM v6 |
| **Authentication** | JWT (JSON Web Tokens), Bcrypt Password Hashing, Role-Based Route Guards |
| **Media Management** | Dual-Engine: Cloudinary CDN + Hostinger Server-Side `/uploads` |
| **Email Delivery** | Nodemailer (SMTP) + Resend API (Notifications to `designersakhawat@gmail.com`) |
| **Deployment Target** | Hostinger Node.js Web App / VPS |

---

## 🚀 Key Features

### 1. Visitor Public Experience
- **Teal-Accented Modern Dark Aesthetics**: Tailwind design system featuring rich obsidian dark backgrounds, crisp typography (`Plus Jakarta Sans` & `Outfit`), and glowing teal badges.
- **4 Dedicated Dynamic Service Pages**:
  - `/services/logo-branding`
  - `/services/ads-creative`
  - `/services/ugc-video`
  - `/services/cover-branding`
- **3-Tier Pricing Packages**: Exactly 3 packages per service (Basic, Standard, Premium) with deliverables checklist, delivery days, revisions, and "Select Package" triggers.
- **Portfolio Showcase (`/portfolio`)**: Category filters (Logo & Branding, Ads Creative, E-commerce, Product Design, Social Media, UGC Video, Cover Branding, Thumbnail, Print Design, AI Video) with live search and quick view modal.
- **Dedicated Discovery Consultation Scheduler (`/book-a-meeting` & `/booking`)**: Date & time slot picker, double-booking prevention, and instant confirmation.
- **Project Inquiry & Contact Form (`/contact`)**: Form with budget selector, project type, and target deadline that records submissions in the database and immediately sends notification emails to `designersakhawat@gmail.com`.
- **About Sakhawat (`/about`)**: Verified career history (e-Learn IT Institute, Kenakata Shop, ORA Organic, Optiva Max, Advanced Digital Automotive), toolchain proficiencies (Photoshop, Illustrator, Premiere Pro, After Effects, Figma, Canva, CapCut, AI tools), and education at Rajshahi Polytechnic Institute.
- **Client Endorsements & Marquee**: Testimonials slider with star ratings and client logos marquee (e-Learn IT Institute, Advanced Digital Automotive, Optiva Max, ORA Organic, Kenakata Shop).

### 2. Administrator CMS Control Center (`/admin`)
- **Protected JWT Authentication**: Secure login at `/admin/login`, token expiration, and brute-force rate-limiting.
- **Dashboard Overview**: Real-time metrics counters (Projects, Inquiries, Pending Bookings, Services) and activity streams.
- **Project Case Studies Manager**: Full CRUD, cover image upload, multi-screenshot gallery, live links, and tags editor.
- **Services & Packages Manager**: Edit deliverables, features, and 3-tier pricing packages.
- **Contact Inquiries Inbox**: Filter by status (`UNREAD`, `READ`, `REPLIED`, `ARCHIVED`), internal notes, and direct mailto reply.
- **Meeting Bookings Scheduler**: Assign Google Meet / Zoom links and track appointment statuses.
- **Media Asset Library**: Drag-and-drop file upload, copy CDN/local URL, alt text updater, and deletion.
- **Global Site Settings**: Update hero headlines, contact details, social links, SEO tags, and admin password.

---

## 🛠️ Local Development Quick Start

### 1. Prerequisites
- Node.js `v18+` or `v20+` or `v22+`
- NPM `v9+`
- (Optional) MySQL Server. If MySQL is not running locally, the project automatically initializes a local zero-config SQLite database.

### 2. Clone and Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/sakhawat-portfolio.git
cd sakhawat-portfolio

# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install && cd ..
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Review the `.env` settings:
```env
PORT=5000
NODE_ENV=development
APP_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173

# MySQL Connection (e.g. for local or Hostinger)
DATABASE_URL="mysql://root:@127.0.0.1:3306/sakhawat_portfolio"

# JWT Secret
JWT_SECRET="sakhawat_super_secret_jwt_key_98374982374982374"

# Notifications
ADMIN_NOTIFICATION_EMAIL="designersakhawat@gmail.com"
```

### 4. Initialize Database & Seed Demo Data
```bash
npm run prisma:generate
node scripts/setup-db.js
```
*Default seeded Admin Credentials:*
- **Email**: `admin@sakhawat.design`
- **Password**: `admin123456`

### 5. Run the Application
Start both backend API and frontend Vite dev server concurrently:
```bash
npm run dev:all
```
- Public Website: `http://localhost:5173`
- Admin Dashboard: `http://localhost:5173/admin/login`
- REST API Server: `http://localhost:5000/api`

---

## 🌐 Hostinger Node.js Web App Deployment Guide

### Step 1: Create MySQL Database on Hostinger
1. In your Hostinger hPanel, navigate to **Databases** → **MySQL Databases**.
2. Create a new database (e.g., `u123456789_portfolio`) and a user with a strong password.

### Step 2: Configure Hostinger Node.js App
1. In hPanel, go to **Websites** → **Node.js**.
2. Set the following parameters:
   - **Node.js Version**: `18.x`, `20.x`, or `22.x`
   - **Application Root**: `/home/u123456789/domains/yourdomain.com/public_html`
   - **Application Startup File**: `server.js`
   - **Application Mode**: `Production`

### Step 3: Deploy Code & Build
1. Upload project files or connect via Git.
2. Build the frontend client bundle:
   ```bash
   cd client && npm install && npm run build && cd ..
   npm install --production
   ```
3. Set your production `.env` variables in Hostinger:
   ```env
   NODE_ENV=production
   PORT=5000
   DATABASE_URL="mysql://u123456789_admin:YourSecurePassword@127.0.0.1:3306/u123456789_portfolio"
   JWT_SECRET="generate_a_long_random_secret_string"
   ADMIN_NOTIFICATION_EMAIL="designersakhawat@gmail.com"
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="designersakhawat@gmail.com"
   SMTP_PASS="your_gmail_app_password"
   ```

### Step 4: Run Migrations and Seed on Hostinger
Run in the Hostinger SSH Terminal:
```bash
npx prisma db push
node prisma/seed.js
```

### Step 5: Start Application
Restart the Node.js application in hPanel. Your website and admin dashboard are now live!

---

## 🔒 Security Best Practices Implemented
- **Bcrypt Password Hashing**: Passwords stored as one-way salted hashes (10 rounds).
- **JWT Protection**: All admin mutation endpoints require verified Bearer token.
- **Express Rate Limiting**: Brute-force protection on `/api/auth/login`, `/api/inquiries`, and `/api/bookings`.
- **Helmet Headers**: Secure HTTP headers for production.
- **Error Sanitization**: Detailed database error stacks suppressed in production.
- **Environment Isolation**: No credentials hardcoded in frontend or version control.

---

## 👨‍🎨 Author
**Md Sakhawat Hossain**  
Creative Graphic Designer  
Phone: `01781955355`  
Email: [designersakhawat@gmail.com](mailto:designersakhawat@gmail.com)  
Location: Ishurdi, Pabna, Rajshahi, Bangladesh  
Portfolio: [https://designersakhawat.com/](https://designersakhawat.com/)
