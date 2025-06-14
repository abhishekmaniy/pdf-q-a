import { User, Pdf, Chat, Message } from '@/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  user: User | null
  pdfs: Pdf[]
  activePdfId: string | null
  chats: Record<string, Chat | null>

  setUser: (user: User | null) => void

  setPdfs: (pdfs: Pdf[]) => void
  addPdf: (pdf: Pdf) => void
  removePdf: (id: string) => void
  setActivePdf: (id: string | null) => void

  setChat: (pdfId: string, chat: Chat) => void
  addMessageToChat: (pdfId: string, message: Message) => void

  getMessagesForChat: (pdfId: string) => Message[]
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      pdfs: [],
      activePdfId: null,
      chats: {},

      setUser: user => set({ user }),

      setPdfs: pdfs => set({ pdfs }),
      addPdf: pdf => set(state => ({ pdfs: [pdf, ...state.pdfs] })),
      removePdf: id =>
        set(state => {
          const { [id]: removedChat, ...remainingChats } = state.chats
          return {
            pdfs: state.pdfs.filter(pdf => pdf.id !== id),
            activePdfId: state.activePdfId === id ? null : state.activePdfId,
            chats: remainingChats
          }
        }),
      setActivePdf: id => set({ activePdfId: id }),

      setChat: (pdfId, chat) =>
        set(state => ({
          chats: {
            ...state.chats,
            [pdfId]: chat
          }
        })),

      addMessageToChat: (pdfId, message) =>
        set(state => {
          const chat = state.chats[pdfId]
          if (!chat) return state
          return {
            chats: {
              ...state.chats,
              [pdfId]: {
                ...chat,
                messages: [...chat.messages, message]
              }
            }
          }
        }),

      // ✅ Retrieve messages for a given pdfId
      getMessagesForChat: (pdfId: string) => {
        const chat = get().chats[pdfId]
        return chat?.messages || []
      }
    }),
    { name: 'app-storage' }
  )
)
