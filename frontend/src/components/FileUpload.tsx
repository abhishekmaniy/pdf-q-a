import React, { useCallback, useState } from 'react'
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  AlertTriangle
} from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'
import { useAppStore } from '@/store/store'
import { UploadProgress } from '../types'
import type { Pdf } from '../types'
import toast from 'react-hot-toast'

interface FileUploadProps {
  onClose: () => void
  handleDocumentSelect: (id: string) => void
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

export function FileUpload ({ onClose, handleDocumentSelect }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const { getToken } = useAuth()
  const { addPdf } = useAppStore()

  const uploadToR2 = async (file: File) => {
    const localId = file.name + '-' + Date.now()
    setUploadProgress(prev => [
      ...prev,
      { id: localId, progress: 0, status: 'uploading' }
    ])

    try {
      const token = await getToken()
      const formData = new FormData()
      formData.append('file', file)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${BACKEND_URL}/upload`)

      xhr.setRequestHeader('Authorization', `Bearer ${token}`)

      xhr.upload.onprogress = event => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          const progress = percentComplete >= 100 ? 99 : percentComplete
          setUploadProgress(prev =>
            prev.map(item =>
              item.id === localId ? { ...item, progress } : item
            )
          )
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data: Pdf = JSON.parse(xhr.responseText)

          // Show 100% only after backend confirms success
          setUploadProgress(prev =>
            prev.map(item =>
              item.id === localId
                ? { ...item, progress: 100, status: 'completed' }
                : item
            )
          )

          addPdf(data) // ✅ Add PDF to Zustand (user.pdfs)
          handleDocumentSelect(data.id)

          toast.success('File uploaded successfully!')
          setTimeout(onClose, 1000)
        } else {
          setUploadProgress(prev =>
            prev.map(item =>
              item.id === localId
                ? { ...item, status: 'error', error: 'Upload failed' }
                : item
            )
          )
          toast.error(`Upload failed. Status: ${xhr.status}`)
        }
      }

      xhr.onerror = () => {
        setUploadProgress(prev =>
          prev.map(item =>
            item.id === localId
              ? { ...item, status: 'error', error: 'Upload failed' }
              : item
          )
        )
        toast.error('Network error during upload.')
      }
      xhr.send(formData)
    } catch (err) {
      console.error(err)
      setUploadProgress(prev =>
        prev.map(item =>
          item.id === localId
            ? { ...item, status: 'error', error: 'Upload failed' }
            : item
        )
      )
      setError('Upload failed. Please try again.')
      toast.error('Upload failed. Please try again.')
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setError(null)

    const files = Array.from(e.dataTransfer.files)
    const pdfFiles = files.filter(file => file.type === 'application/pdf')

    if (pdfFiles.length === 0) {
      setError('Only PDF files are allowed.')
      return
    }

    pdfFiles.forEach(uploadToR2)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null)
      const files = Array.from(e.target.files || [])
      const pdfFiles = files.filter(file => file.type === 'application/pdf')

      if (pdfFiles.length === 0) {
        setError('Only PDF files are allowed.')
        return
      }

      pdfFiles.forEach(uploadToR2)
      e.target.value = ''
    },
    []
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }, [])

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-xl shadow-2xl max-w-md w-full'>
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <h2 className='text-xl font-semibold text-gray-900'>Upload PDF</h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200'
          >
            <X className='w-5 h-5 text-gray-500' />
          </button>
        </div>

        <div className='p-6'>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload
              className={`w-12 h-12 mx-auto mb-4 ${
                dragActive ? 'text-blue-500' : 'text-gray-400'
              }`}
            />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Drop your PDF here
            </h3>
            <p className='text-gray-500 mb-4'>Or click to browse your files</p>
            <input
              type='file'
              accept='.pdf,application/pdf'
              multiple
              onChange={handleFileInput}
              className='hidden'
              id='file-upload'
            />
            <label
              htmlFor='file-upload'
              className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors duration-200'
            >
              <FileText className='w-4 h-4 mr-2' />
              Choose Files
            </label>
          </div>

          {error && (
            <div className='flex items-center text-red-600 text-sm mt-4'>
              <AlertTriangle className='w-4 h-4 mr-2' />
              {error}
            </div>
          )}

          {uploadProgress.length > 0 && (
            <div className='mt-6 space-y-3'>
              <h4 className='text-sm font-medium text-gray-700'>
                Upload Progress
              </h4>
              {uploadProgress.map(progress => (
                <div key={progress.id} className='bg-gray-50 rounded-lg p-3'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-gray-700 truncate'>
                      {progress.id.split('-')[0]}
                    </span>
                    <div className='flex items-center'>
                      {progress.status === 'completed' && (
                        <CheckCircle className='w-4 h-4 text-green-500' />
                      )}
                      {progress.status === 'error' && (
                        <AlertCircle className='w-4 h-4 text-red-500' />
                      )}
                      {progress.status === 'uploading' && (
                        <span className='text-xs text-gray-500'>
                          {Math.round(progress.progress)}%
                        </span>
                      )}
                    </div>
                  </div>
                  {progress.status === 'uploading' && (
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                        style={{ width: `${progress.progress || 0}%` }}
                      />
                    </div>
                  )}
                  {progress.error && (
                    <p className='text-xs text-red-500 mt-1'>
                      {progress.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
