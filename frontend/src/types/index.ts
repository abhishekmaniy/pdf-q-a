export interface PDFDocument {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  content: string;
  thumbnail?: string;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  documentId?: string;
}

export interface Conversation {
  id: string;
  documentId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadProgress {
  id: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}