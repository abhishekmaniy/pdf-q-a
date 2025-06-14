import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getAuth } from '@clerk/express'
import { Request, Response } from 'express'
import formidable from 'formidable'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../utils/db'
import { create } from 'domain'

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY!,
    secretAccessKey: process.env.CLOUDFLARE_SCERET_KEY!
  }
})

const BUCKET_NAME = 'pdfqanda'

const uploadController = async (req: Request, res: Response) => {
  const form = formidable({ multiples: false })
  const { userId } = getAuth(req)

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err)
      res.status(500).json({ error: 'Error parsing file upload' })
      return
    }

    const uploadedFile = files.file
    if (!uploadedFile) {
      res.status(400).json({ error: 'No file uploaded' })
      return
    }

    const file = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile
    if (!file.filepath || !file.originalFilename) {
      res.status(400).json({ error: 'Invalid file upload' })
      return
    }

    const fileStream = fs.createReadStream(file.filepath)
    const key = `pdfs/${uuidv4()}-${file.originalFilename}`

    try {
      await R2.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          Body: fileStream,
          ContentType: 'application/pdf'
        })
      )

      const fileUrl = `https://${process.env.ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET_NAME}/${key}`

      const pdf = await db.pdf.create({
        data: {
          url: fileUrl,
          user: { connect: { id: userId } },
          size: file.size,
          name: file.originalFilename,
          chat: {
            create: {}
          }
        },
        include: {
          chat: true // If you want to fetch the created chat with the PDF
        }
      })

      res.status(200).json(pdf)
      return
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Upload to R2 failed' })
      return
    }
  })
}

const deletePdf = async (req: Request, res: Response) => {
  const { id } = req.params

  const pdf = await db.pdf.delete({
    where: {
      id
    }
  })

  res.status(200).json(pdf)
  return
}

export { deletePdf, uploadController }
