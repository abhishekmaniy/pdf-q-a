import { FileText, Send } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { useAppStore } from '@/store/store'

interface ChatInterfaceProps {
  activeDocumentId: string | null
  onSendMessage: (content: string) => void
  isTyping: boolean
}

export function ChatInterface ({
  activeDocumentId,
  onSendMessage,
  isTyping
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { user, getMessagesForPdf } = useAppStore()
  const pdfs = user?.pdfs
  const messages = getMessagesForPdf(activeDocumentId!)
  const activeDocument = pdfs?.find(pdf => pdf.id === activeDocumentId)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && activeDocumentId) {
      onSendMessage(inputValue.trim())
      setInputValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  if (!activeDocumentId || !activeDocument) {
    return (
      <div className='h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <FileText className='w-16 h-16 text-gray-300 mx-auto mb-4' />
          <h3 className='text-xl font-medium text-gray-900 mb-2'>
            Select a document to start chatting
          </h3>
          <p className='text-gray-500 max-w-md'>
            Choose a PDF from the sidebar or upload a new one to begin asking
            questions about your document.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='h-screen flex flex-col'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 px-4 py-3 flex items-center space-x-3'>
        <div className='w-10 h-10 bg-gray-100 rounded flex items-center justify-center'>
          <FileText className='w-5 h-5 text-gray-400' />
        </div>
        <div>
          <h2 className='text-base font-semibold text-gray-900'>
            {activeDocument.name}
          </h2>
          <p className='text-xs text-gray-500'>
            Ask me anything about this document
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50'>
        {messages.length === 0 ? (
          <div className='text-center py-12 text-gray-500'>
            <p className='text-sm'>
              Start the conversation about "{activeDocument.name}"
            </p>
          </div>
        ) : (
          <>
            {messages.map(message => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className='bg-white border-t border-gray-200 px-4 py-3'>
        <form onSubmit={handleSubmit} className='flex items-end space-x-2'>
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask a question about ${activeDocument.name}...`}
            className='flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none max-h-28'
            rows={1}
            style={{
              minHeight: '40px',
              height: Math.min(
                Math.max(40, inputValue.split('\n').length * 20),
                112
              )
            }}
          />
          <button
            type='submit'
            disabled={!inputValue.trim() || isTyping}
            className='p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50'
          >
            <Send className='w-5 h-5' />
          </button>
        </form>
      </div>
    </div>
  )
}
