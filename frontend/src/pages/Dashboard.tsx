import { useState } from 'react';
import DocumentUploader from '../components/DocumentUploader';
import ChatInterface from '../components/ChatInterface';
import './Dashboard.css';

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
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <DocumentUploader onUploadSuccess={handleUploadSuccess} />

        {stats.docs > 0 && (
          <div className="glass-panel stats-panel animate-fade-in">
            <h3 className="stats-heading">Index Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{stats.docs}</div>
                <div className="stat-label">Documents</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.pages}</div>
                <div className="stat-label">Pages</div>
              </div>
              <div className="stat-item wide">
                <div className="stat-value">{stats.chunks}</div>
                <div className="stat-label">Embeddings Indexed</div>
              </div>
            </div>
          </div>
        )}
      </aside>

      <main className="dashboard-main">
        <ChatInterface />
      </main>
    </div>
  );
}
