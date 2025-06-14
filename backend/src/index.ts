import cors from 'cors'
import 'dotenv/config'
import express, { Request, Response } from 'express'
import uploadRouter from './routes/uploadRoute'
import userRouter from './routes/userRoute'
import { clerkMiddleware } from '@clerk/express'
import chatRouter from './routes/chatRouter'

const app = express()
app.use(cors())
app.use(express.json())

app.use(clerkMiddleware())

// --- Upload PDF Route ---
app.use('/upload', uploadRouter)

// --- User Creation Route ---
app.use('/user', userRouter)

app.use('/chat', chatRouter)

// --- Root route ---
app.get('/', (_req: Request, res: Response) => {
  res.send('Hello From Server')
})

// --- Start Server ---
app.listen(3000, () => {
  console.log('Server is Running on PORT 3000')
})
