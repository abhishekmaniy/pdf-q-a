import { Bot, Clock, User } from 'lucide-react'
import { Message } from '../types'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble ({ message }: MessageBubbleProps) {
  const isUser = message.owner === 'USER'

  return (
    <div
      className={`flex items-start space-x-3 ${
        isUser ? 'flex-row-reverse space-x-reverse' : ''
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-600' : 'bg-gray-700'
        }`}
      >
        {isUser ? (
          <User className='w-4 h-4 text-white' />
        ) : (
          <Bot className='w-4 h-4 text-white' />
        )}
      </div>

      {/* Message Content */}
      <div className={`max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div
          className={`inline-block px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-blue-600 text-white rounded-tr-md'
              : 'bg-white border border-gray-200 text-gray-900 rounded-tl-md shadow-sm'
          }`}
        >
          <p className='text-sm leading-relaxed whitespace-pre-wrap'>
            {message.content}
          </p>
        </div>

        {/* Timestamp */}
        <div
          className={`flex items-center mt-1 text-xs text-gray-500 ${
            isUser ? 'justify-end' : 'justify-start'
          }`}
        >
          <Clock className='w-3 h-3 mr-1' />
          <span>
            {new Intl.DateTimeFormat('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }).format(new Date(message.createdAt))}
          </span>
        </div>
      </div>
    </div>
  )
}
