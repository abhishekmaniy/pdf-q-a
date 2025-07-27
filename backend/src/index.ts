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

console.log("reach here 1 ")

app.use(clerkMiddleware())

console.log("reach here 2 ")

// --- Upload PDF Route ---
app.use('/upload', uploadRouter)

console.log("reach 3")

// --- User Creation Route ---
app.use('/user', userRouter)

console.log("reach 4")


app.use('/chat', chatRouter)

console.log("reach 5")

// --- Root route ---
app.get('/', (_req: Request, res: Response) => {
  res.send('Hello From Server')
})

console.log("reach 6")

// --- Start Server ---
app.listen(3000, () => {
  console.log('Server is Running on PORT 3000')
})
