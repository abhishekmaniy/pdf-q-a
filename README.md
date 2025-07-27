🧑‍💻 Local Development
1. Clone the repo
bash
Copy
Edit
git clone https://github.com/abhishekmaniy/pdf-q-a.git
cd pdf-ai-chat
2. Install dependencies
Frontend
bash
Copy
Edit
cd client
npm install
Backend
bash
Copy
Edit
cd ../server
npm install
3. Environment Variables
Create a .env file in the server/ and client/ directories and add the following:

Backend (server/.env)
makefile
Copy
Edit
GEMINI_API_KEY=
DATABASE_URL=
CLOUDFLARE_ACCESS_KEY=
CLOUDFLARE_SECRET_KEY=
ACCOUNT_ID=
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
Frontend (client/.env)
makefile
Copy
Edit
VITE_CLERK_PUBLISHABLE_KEY=
VITE_BACKEND_URL=
4. Run the app
Terminal 1 - Backend
bash
Copy
Edit
cd server
npx prisma generate
npx prisma migrate dev --name init
npm run dev
Terminal 2 - Frontend
bash
Copy
Edit
cd client
npm run dev
🔍 Project Structure
pgsql
Copy
Edit
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
Frontend: Vercel

Backend: Render

Database: PostgreSQL via Neon

📬 Contact
For suggestions, bugs, or feature requests, feel free to open an issue or contact me at:
📧 abhishekmaniyar502@gmail.com