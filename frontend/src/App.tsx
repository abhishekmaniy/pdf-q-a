import { useAuth, useUser } from '@clerk/clerk-react'
import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ChatInterface } from './components/ChatInterface'
import { FileUpload } from './components/FileUpload'
import { Layout } from './components/Layout'
import { Sidebar } from './components/Sidebar'
import { useAppStore } from './store/store'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import { User as AppUser, Message } from './types'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

function App () {
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const { isSignedIn, getToken } = useAuth()
  const { user: clerkUser, isLoaded } = useUser()
  const { setUser, setPdfs, addMessageToChat, user, setChatForPdf } =
    useAppStore()
  const [isTyping, setIsTyping] = useState(false)

  console.log(user)

  const initializeUserData = (fetchedUser: AppUser) => {
    setUser({
      ...fetchedUser,
      pdfs: fetchedUser.pdfs || [] // fallback to empty array
    })

    // Prevent .forEach on undefined
    if (Array.isArray(fetchedUser.pdfs)) {
      setPdfs(fetchedUser.pdfs)

      fetchedUser.pdfs.forEach(pdf => {
        if (pdf.chat) {
          setChatForPdf(pdf.id, pdf.chat)
        }
      })
    } else {
      setPdfs([]) // fallback just in case
    }
  }

  // 👇 Fetch user from backend when signed in
  useEffect(() => {
    const fetchAndStoreUser = async () => {
      if (!isSignedIn || !isLoaded || !clerkUser) return

      try {
        const token = await getToken()
        const response = await axios.post(
          `${BACKEND_URL}/user`,
          {
            id: clerkUser.id,
            name: `${clerkUser.firstName || ''} ${
              clerkUser.lastName || ''
            }`.trim(),
            email: clerkUser.emailAddresses[0]?.emailAddress
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        console.log(response.data.user)
        initializeUserData(response.data.user)
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
        await axios.delete(`${BACKEND_URL}/upload/${documentId}`)
        useAppStore.getState().removePdf(documentId)
        if (activeDocumentId === documentId) {
          setActiveDocumentId(null)
        }
        toast.success('PDF deleted successfully')
      } catch (error) {
        console.error('Failed to delete document:', error)
        toast.error('Failed to delete PDF')
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
          pdfId: activeDocumentId
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
    <>
      <Toaster position='top-right' />

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
    </>
  )
}

export default App
