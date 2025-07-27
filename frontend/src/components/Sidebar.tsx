import { useAppStore } from '@/store/store'
import { SignInButton, useAuth, UserButton } from '@clerk/clerk-react'
import { Calendar, FileText, Trash2 } from 'lucide-react'

interface SidebarProps {
  activeDocumentId: string | null
  onDocumentSelect: (id: string) => void
  onDocumentDelete: (documentId: string) => void
  onUploadClick: () => void
}

export function Sidebar ({
  activeDocumentId,
  onDocumentSelect,
  onDocumentDelete,
  onUploadClick
}: SidebarProps) {
  const { isSignedIn } = useAuth()

  const {user} = useAppStore()
  const pdfs = user?.pdfs

  console.log(user , pdfs )

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  const formatDate = (date: string | Date) => {
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(d)
  }

  return (
    <div className='flex flex-col h-full bg-white border-r'>
      {/* Upload Button */}
      <div className='p-4 border-b'>
        {isSignedIn ? (
          <button
            onClick={onUploadClick}
            className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition'
          >
            <div className='flex items-center justify-center space-x-2'>
              <FileText className='w-5 h-5' />
              <span>Upload PDF</span>
            </div>
          </button>
        ) : (
          <SignInButton forceRedirectUrl={'/'} />
        )}
      </div>

      {/* PDF List */}
      <div className='flex-1 overflow-y-auto px-4 py-3'>
        {pdfs?.length === 0 ? (
          <div className='text-center py-12 text-gray-400'>
            <FileText className='w-12 h-12 mx-auto mb-4' />
            <p className='text-sm'>No documents yet</p>
            <p className='text-xs text-gray-400'>Upload a PDF to get started</p>
          </div>
        ) : (
          <div className='space-y-3'>
            <h3 className='text-xs uppercase tracking-wide text-gray-500 mb-2'>
              Your Documents
            </h3>
            {pdfs?.map(pdf => (
              <div
                key={pdf.id}
                onClick={() => onDocumentSelect(pdf.id)}
                className={`group relative border rounded-lg p-3 cursor-pointer transition ${
                  activeDocumentId === pdf.id
                    ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className='flex items-start space-x-2'>
                  <div className='flex-shrink-0 w-10 h-12 bg-gray-100 rounded flex items-center justify-center'>
                    <FileText className='w-5 h-5 text-gray-400' />
                  </div>
                  <div className='flex-1'>
                    <h4 className='text-sm font-medium text-gray-900 truncate'>
                      {pdf.name}
                    </h4>
                    <div className='flex items-center text-xs text-gray-500 space-x-2 mt-1'>
                      <span>{formatFileSize(pdf.size)}</span>
                      <span className='flex items-center space-x-1'>
                        <Calendar className='w-3 h-3' />
                        <span>{formatDate(pdf.createdAt)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delete button (appears on hover) */}
                <button
                  onClick={e => {
                    e.stopPropagation()
                    onDocumentDelete(pdf.id)
                  }}
                  className='absolute top-2 right-2 p-1 rounded text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-100 transition'
                >
                  <Trash2 className='w-4 h-4' />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auth Button */}
      <div className='p-4 border-t'>
        {isSignedIn ? <UserButton /> : <SignInButton forceRedirectUrl={'/'} />}
      </div>
    </div>
  )
}
