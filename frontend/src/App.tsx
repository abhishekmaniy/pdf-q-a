import { useAuth, useUser } from '@clerk/clerk-react'
import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ChatInterface } from './components/ChatInterface'
import { FileUpload } from './components/FileUpload'
import { Layout } from './components/Layout'
import { Sidebar } from './components/Sidebar'
import { useAppStore } from './store/store'
import { Message, Pdf, User as AppUser } from './types'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

function App () {
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const { isSignedIn, getToken } = useAuth()
  const { user: clerkUser, isLoaded } = useUser()
  const {
    user,
    setUser,
    setPdfs,
    setChat,
    pdfs,
    chats,
    addMessageToChat,
  } = useAppStore()
  const [isTyping, setIsTyping] = useState(false)

  const initializeUserData = (fetchedUser: AppUser) => {
    setUser(fetchedUser)
    setPdfs(fetchedUser.pdfs)
    fetchedUser.pdfs.forEach(pdf => {
      if (pdf.chat) {
        setChat(pdf.id, pdf.chat)
      }
    })
  }

  // 👇 Fetch user from backend when signed in
  useEffect(() => {
    const fetchAndStoreUser = async () => {
      if (!isSignedIn || !isLoaded || !clerkUser) return

      try {
        const token = await getToken()
        const response = await axios.post<AppUser>(
          `${BACKEND_URL}/user`,
          {
            id: clerkUser.id,
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
            email: clerkUser.emailAddresses[0]?.emailAddress,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        initializeUserData(response.data)
      } catch (error) {
        console.error('Error fetching or creating user:', error)
      }
    }

    fetchAndStoreUser()
  }, [isSignedIn, isLoaded, clerkUser])

  const handleDocumentSelect = useCallback((id: string) => {
    setActiveDocumentId(id)
  }, [])

  const handleDocumentDelete = useCallback(
    async (documentId: string) => {
      try {
        await axios.delete(`${BACKEND_URL}/pdf/${documentId}`)
        useAppStore.getState().removePdf(documentId)
        if (activeDocumentId === documentId) {
          setActiveDocumentId(null)
        }
      } catch (error) {
        console.error('Failed to delete document:', error)
      }
    },
    [activeDocumentId]
  )

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!activeDocumentId) return

      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        owner: 'USER',
        createdAt: new Date(),
        chatId: activeDocumentId
      }

      addMessageToChat(activeDocumentId, userMessage)
      setIsTyping(true)

      try {
        const response = await axios.post(`${BACKEND_URL}/chat`, {
          userMessage,
          pdfId: activeDocumentId,
        })

        const aiResponse: Message = response.data
        addMessageToChat(activeDocumentId, aiResponse)
      } catch (error) {
        console.error('Error getting AI response:', error)
      } finally {
        setIsTyping(false)
      }
    },
    [activeDocumentId]
  )

  return (
    <Routes>
      <Route
        path='/'
        element={
          <Layout
            sidebar={
              <Sidebar
                activeDocumentId={activeDocumentId}
                onDocumentSelect={handleDocumentSelect}
                onDocumentDelete={handleDocumentDelete}
                onUploadClick={() => setShowUpload(true)}
              />
            }
          >
            <ChatInterface
              isTyping={isTyping}
              activeDocumentId={activeDocumentId}
              onSendMessage={handleSendMessage}
            />
            {showUpload && (
              <FileUpload
                handleDocumentSelect={handleDocumentSelect}
                onClose={() => setShowUpload(false)}
              />
            )}
          </Layout>
        }
      />
    </Routes>
  )
}

export default App
