import express from 'express'
import { createMessage } from '../controller/chatController'

const router = express.Router()

router.post('/', createMessage)

export default router
