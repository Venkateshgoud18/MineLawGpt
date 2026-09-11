import { useState, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, File, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './components.css'; // We will create this for component-specific styles

interface DocumentUploaderProps {
  onUploadSuccess: (filename: string, pages: number, chunks: number) => void;
}

export default function DocumentUploader({ onUploadSuccess }: DocumentUploaderProps) {
  const { token } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    if (file.type !== 'application/pdf' && file.type !== 'text/plain') {
      setUploadStatus('error');
      setErrorMessage('Only PDF and TXT files are supported.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setUploadStatus('success');
      onUploadSuccess(file.name, response.data.pages, response.data.chunks);
      
      // Reset after 3 seconds
      setTimeout(() => setUploadStatus('idle'), 3000);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadStatus('error');
      setErrorMessage(err.response?.data?.detail || 'Failed to upload document. Please ensure the backend is running.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-panel uploader-container animate-fade-in">
      <div className="uploader-header">
        <h2>Knowledge Base</h2>
        <p className="text-muted">Upload mining laws and regulations to improve AI responses.</p>
      </div>

      <div 
        className={`drop-zone ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileInput} 
          accept="application/pdf,text/plain" 
          style={{ display: 'none' }} 
        />
        
        {isUploading ? (
          <div className="upload-state">
            <Loader className="spin-icon" size={48} color="var(--accent-primary)" />
            <p>Processing Document...</p>
            <span className="text-muted text-sm">Extracting text and generating embeddings</span>
          </div>
        ) : uploadStatus === 'success' ? (
          <div className="upload-state success">
            <CheckCircle size={48} color="var(--success)" />
            <p>Upload Successful!</p>
          </div>
        ) : uploadStatus === 'error' ? (
          <div className="upload-state error">
            <AlertCircle size={48} color="var(--danger)" />
            <p>Upload Failed</p>
            <span className="error-text">{errorMessage}</span>
          </div>
        ) : (
          <div className="upload-state">
            <UploadCloud size={48} color="var(--text-secondary)" />
            <p><strong>Click to upload</strong> or drag and drop</p>
            <span className="text-muted text-sm">PDF or TXT documents (max 50MB)</span>
          </div>
        )}
      </div>
      
      <div className="features-list">
        <div className="feature-item">
          <File size={16} color="var(--accent-primary)"/>
          <span>Automatic chunking & indexing</span>
        </div>
        <div className="feature-item">
          <File size={16} color="var(--accent-primary)"/>
          <span>Vector embedding via OpenAI</span>
        </div>
      </div>
    </div>
  );
}
