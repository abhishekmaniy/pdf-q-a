# 📄 AI-Powered PDF Chat App

An AI-enhanced web app to upload, manage, and chat with your PDFs. Built with Clerk authentication, Zustand for state management, PostgreSQL with Prisma ORM, and an Express backend.

---

## 🚀 Features

- 🔐 **Clerk Authentication** (OAuth + email)
- 📤 **Upload PDFs** and view details like size & upload date
- 🗂️ **Manage your PDF library**
- 💬 **AI Chat** (chat with your PDF contents)
- ❌ **Delete PDFs** with instant feedback via toast notifications
- 🧠 **Persistent user data** (PDFs and chat history)

---

## 🛠️ Tech Stack

| Frontend     | Backend      | Database     | Auth     |
|--------------|--------------|--------------|----------|
| React + Vite | Express.js   | PostgreSQL   | Clerk    |
| Zustand      | Prisma ORM   |              | JWT (custom fallback) |
| TailwindCSS  | REST APIs    |              |          |

---

## 🧑‍💻 Local Development

### 1. Clone the repo

```bash
git clone https://github.com/abhishekmaniy/pdf-q-a.git
cd pdf-ai-chat

### 2. Install dependencies

# Frontend
cd client
npm install

# Backend
cd ../server
npm install

### 3. Environment Variables
# Backend
GEMINI_API_KEY=
DATABASE_URL=
CLOUDFLARE_ACCESS_KEY=
CLOUDFLARE_SCERET_KEY=
ACCOUNT_ID=
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
# Frotnend 
VITE_CLERK_PUBLISHABLE_KEY=
VITE_BACKEND_URL=

### 4. Run the app
# Terminal 1 - Backend
cd server
npx prisma generate
npx prisma migrate dev --name init
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev


🔍 Project Structure

├── client
│   ├── components/
│   ├── pages/
│   ├── store/        # Zustand store
│   ├── utils/
│   └── main.tsx
├── server
│   ├── controllers/
│   ├── db/
│   ├── routes/
│   ├── utils/
│   └── index.ts

📦 Deployment
Frontend: Deploy on Vercel

Backend: Deploy on Render

Database: PostgreSQL via Neon


📬 Contact
For suggestions, bugs, or feature requests, feel free to open an issue or contact me at abhishekmaniyar502@gmail.com.