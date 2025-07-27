import { User, Pdf, Chat, Message, UploadProgress } from '@/types'
import { create } from 'zustand'

interface AppState {
  user: User | null
  activePdfId: string | null
  uploadProgress: Record<string, UploadProgress>

  // Setters
  setUser: (user: User | null) => void

  setPdfs: (pdfs: Pdf[]) => void
  addPdf: (pdf: Pdf) => void
  removePdf: (pdfId: string) => void
  setActivePdf: (pdfId: string | null) => void

  setChatForPdf: (pdfId: string, chat: Chat) => void
  addMessageToChat: (pdfId: string, message: Message) => void
  getMessagesForPdf: (pdfId: string) => Message[]

  setUploadProgress: (progress: UploadProgress) => void
  removeUploadProgress: (id: string) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  activePdfId: null,
  uploadProgress: {},

  setUser: user => set({ user }),

  setPdfs: pdfs =>
    set(state => {
      if (!state.user) return state
      return {
        user: { ...state.user, pdfs }
      }
    }),

  addPdf: pdf =>
    set(state => {
      if (!state.user) return state
      return {
        user: {
          ...state.user,
          pdfs: [pdf, ...(state.user.pdfs || [])]
        }
      }
    }),

  removePdf: pdfId =>
    set(state => {
      if (!state.user) return state
      const updatedPdfs = state.user.pdfs.filter(pdf => pdf.id !== pdfId)
      return {
        activePdfId: state.activePdfId === pdfId ? null : state.activePdfId,
        user: {
          ...state.user,
          pdfs: updatedPdfs
        }
      }
    }),

  setActivePdf: pdfId => set({ activePdfId: pdfId }),

  setChatForPdf: (pdfId, chat) =>
    set(state => {
      if (!state.user) return state
      const updatedPdfs = state.user.pdfs.map(pdf =>
        pdf.id === pdfId ? { ...pdf, chat } : pdf
      )
      return {
        user: {
          ...state.user,
          pdfs: updatedPdfs
        }
      }
    }),

  addMessageToChat: (pdfId, message) =>
    set(state => {
      if (!state.user) return state

      const updatedPdfs = state.user.pdfs.map(pdf => {
        if (pdf.id !== pdfId) return pdf
        if (!pdf.chat) return pdf

        return {
          ...pdf,
          chat: {
            ...pdf.chat,
            messages: [...pdf.chat.messages, message]
          }
        }
      })

      return {
        user: {
          ...state.user,
          pdfs: updatedPdfs
        }
      }
    }),

  getMessagesForPdf: pdfId => {
    const user = get().user
    if (!user || !user.pdfs) return []
    const pdf = user.pdfs.find(p => p.id === pdfId)
    return pdf?.chat?.messages || []
  },

  setUploadProgress: progress =>
    set(state => ({
      uploadProgress: {
        ...state.uploadProgress,
        [progress.id]: progress
      }
    })),

  removeUploadProgress: id =>
    set(state => {
      const { [id]: _, ...rest } = state.uploadProgress
      return { uploadProgress: rest }
    })
}))
