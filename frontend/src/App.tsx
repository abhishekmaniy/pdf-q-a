import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ChatInterface } from './components/ChatInterface'
import { FileUpload } from './components/FileUpload'
import { Layout } from './components/Layout'
import { Sidebar } from './components/Sidebar'
import SignIn from './components/SignIn'
import { useAppStore } from './store/store'
import { Message, Pdf, User } from './types'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

function App () {
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const { isSignedIn, userId } = useAuth()
  const {
    user,
    setUser,
    pdfs,
    setPdfs,
    chats,
    setChat,
    addMessageToChat,
    getMessagesForChat
  } = useAppStore()
  const [isTyping, setIsTyping] = useState(false)

  const initializeUserData = (user: User) => {
    setUser(user)
    setPdfs(user.pdfs)
    user.pdfs.forEach((pdf: Pdf) => {
      if (pdf.chat) {
        setChat(pdf.id, pdf.chat)
      }
    })
  }

  useEffect(() => {
    const getUser = async () => {
      if (!isSignedIn) return
      const response = await axios.get(`${BACKEND_URL}/user/${userId}`)
      initializeUserData(response.data)
    }
    getUser()
  }, [userId, isSignedIn])

  const handleDocumentSelect = useCallback(
    (id: string) => {
      setActiveDocumentId(id)
    },
    [chats]
  )

  const handleDocumentDelete = useCallback(
    async (documentId: string) => {
      try {
        await axios.delete(`${BACKEND_URL}/pdf/${documentId}`)
        setPdfs(pdfs.filter(pdf => pdf.id !== documentId))
        if (activeDocumentId === documentId) {
          setActiveDocumentId(null)
        }
      } catch (error) {
        console.error('Failed to delete document:', error)
      }
    },
    [pdfs, activeDocumentId]
  )

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!activeDocumentId) return

      console.log('Reach here 1')

      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        owner: 'USER',
        createdAt: new Date(),
        chatId: activeDocumentId
      }

      addMessageToChat(activeDocumentId, userMessage)

      setIsTyping(true)

      console.log('Reach here 2')

      try {
        const response = await axios.post(`${BACKEND_URL}/chat`, {
          userMessage,
          pdfId: activeDocumentId
        })

        const aiResponse: Message = response.data
        addMessageToChat(activeDocumentId, aiResponse)
        setIsTyping(false)
      } catch (error) {
        console.error('Error getting AI response:', error)
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
      <Route path='/sign-in' element={<SignIn />} />
    </Routes>
  )
}

export default App
