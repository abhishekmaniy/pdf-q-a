import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Request, Response } from 'express'
import pdfParse from 'pdf-parse'
import { Readable } from 'stream'
import { db } from '../utils/db'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY!,
    secretAccessKey: process.env.CLOUDFLARE_SCERET_KEY!
  }
})

const BUCKET_NAME = 'pdfqanda'

function extractKeyFromUrl(url: string): string {
  const parts = url.split(`/${BUCKET_NAME}/`)
  if (parts.length !== 2) throw new Error('Invalid PDF URL structure')
  return parts[1] // This is the key (e.g., 'pdfs/6703fa5c-6d48-4a1d-83d7-7a4d0f8821e8-bitcoin.pdf')
}

async function getPdfBufferFromR2(bucketName: string, key: string): Promise<Buffer> {
  const command = new GetObjectCommand({ Bucket: bucketName, Key: key })
  const response = await R2.send(command)

  const stream = response.Body as Readable
  const chunks: Uint8Array[] = []
  for await (const chunk of stream) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

export const createMessage = async (req: Request, res: Response) => {
  try {
    const { pdfId, userMessage } = req.body

    if (!pdfId || !userMessage?.content || !userMessage?.owner) {
      res.status(400).json({ error: 'pdfId, content, and owner are required' })
      return
    }

    let chat = await db.chat.findFirst({ where: { pdfId } })
    if (!chat) {
      chat = await db.chat.create({ data: { pdf: { connect: { id: pdfId } } } })
    }

    const newMessage = await db.message.create({
      data: {
        content: userMessage.content,
        owner: userMessage.owner,
        chatId: chat.id
      }
    })

    const pdf = await db.pdf.findFirst({ where: { id: pdfId } })
    if (!pdf?.url) {
      res.status(404).json({ error: 'PDF not found' })
      return
    }

    // ✅ Extract key from the URL
    const pdfKey = extractKeyFromUrl(pdf.url)

    const pdfBuffer = await getPdfBufferFromR2(BUCKET_NAME, pdfKey)
    const pdfData = await pdfParse(pdfBuffer)
    const pdfText = pdfData.text.substring(0, 5000)

    const ai = new GoogleGenerativeAI(GEMINI_API_KEY!)
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
You are an AI assistant helping users understand PDF documents.
The following is the extracted content from the PDF:

"${pdfText}"

Now answer the user's question about this PDF:

"${userMessage.content}"
    `.trim()

    const result = await model.generateContent(prompt)
    const aiText = await result.response.text()

    const aiMessage = await db.message.create({
      data: {
        content: aiText,
        owner: 'AI',
        chatId: chat.id
      }
    })

    res.status(201).json(aiMessage)
    return
  } catch (error) {
    console.error('Error creating message:', error)
    res.status(500).json({ error: 'Internal server error' })
    return
  }
}
