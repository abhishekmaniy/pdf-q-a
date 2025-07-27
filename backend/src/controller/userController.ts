import { Request, Response } from 'express'
import { db } from '../utils/db'

const createUser = async (req: Request, res: Response) => {
  const { id, name, email } = req.body

  if (!id || !name || !email) {
    res.status(400).json({ error: 'id, name, and email are required' })
    return
  }

  const existingUser = await db.user.findFirst({
    where: { id },
    include: {
      pdfs: {
        include: {
          chat: {
            include: {
              messages: true
            }
          }
        }
      }
    }
  })

  if (existingUser) {
    res.status(200).json({ user: existingUser })
    return
  }

  const user = await db.user.create({
    data: { id, name, email },
    include: {
      pdfs: {
        include: {
          chat: {
            include: {
              messages: true
            }
          }
        }
      }
    }
  })

  res.status(201).json({ user })

  res.status(201).json({ user })
  return
}

const getUser = async (req: Request, res: Response) => {
  console.log('reach here')
  const { id } = req.params

  try {
    const user = await db.user.findUnique({
      where: { id },
      include: {
        pdfs: {
          include: {
            chat: {
              include: {
                messages: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    console.log(user)

    res.json({ user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export { createUser, getUser }
