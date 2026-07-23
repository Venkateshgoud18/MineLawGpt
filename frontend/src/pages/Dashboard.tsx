import { useState } from 'react';
import DocumentUploader from '../components/DocumentUploader';
import ChatInterface from '../components/ChatInterface';

export default function Dashboard() {
  const [stats, setStats] = useState({ pages: 0, chunks: 0, docs: 0 });

  const handleUploadSuccess = (_filename: string, pages: number, chunks: number) => {
    setStats(prev => ({
      pages: prev.pages + pages,
      chunks: prev.chunks + chunks,
      docs: prev.docs + 1,
    }));
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <DocumentUploader onUploadSuccess={handleUploadSuccess} />

        {stats.docs > 0 && (
          <div className="glass-panel stats-panel animate-fade-in" style={{ marginTop: '24px', padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-secondary)' }}>Index Statistics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats.docs}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Documents</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats.pages}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pages</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats.chunks}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Embeddings</div>
              </div>
            </div>
          </div>
        )}
      </aside>

      <main className="main-content">
        <ChatInterface />
      </main>
    </div>
  );
}
