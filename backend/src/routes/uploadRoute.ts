import express from 'express'
import { deletePdf, uploadController } from '../controller/uploadController'

const router = express.Router()

router.post('/', uploadController)
router.delete("/:id" , deletePdf)

export default router