export interface User {
  user(user: any): unknown
  id: string
  name: string
  email: string
  pdfs: Pdf[]
}

export interface Pdf {
  id: string
  url: string
  name: string
  size: number
  createdAt: Date
  userId: string
  user?: User
  chat?: Chat 
}

export interface Chat {
  id: string
  createdAt: Date
  pdfId: string
  pdf?: Pdf 
  messages: Message[]
}

export interface Message {
  id: string
  chatId: string
  content: string
  createdAt: Date
  owner: 'AI' | 'USER'
  chat?: Chat 
}

export interface UploadProgress {
  id: string
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: string
}
