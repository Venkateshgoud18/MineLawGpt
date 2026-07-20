import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Tag, CheckCircle, Search } from 'lucide-react';
import { MINING_LAWS } from '../data/miningLawsData';
import './MiningLaws.css';

const BADGE_COLORS: Record<string, string> = {
  Central: 'badge-central',
  Regulatory: 'badge-regulatory',
  Procedural: 'badge-procedural',
  Specialized: 'badge-specialized',
};

const CATEGORY_COLORS: Record<string, string> = {
  'Labour & Safety': 'cat-labour',
  'Licensing & Regulation': 'cat-licensing',
  'Coal Mining': 'cat-coal',
  'Safety Standards': 'cat-safety',
  'Environment': 'cat-env',
  'Procedural': 'cat-proc',
};

export default function MiningLaws() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(MINING_LAWS.map(l => l.category)))];

  const filtered = MINING_LAWS.filter(law => {
    const matchesSearch =
      law.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      law.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      law.sections.some(s =>
        s.points.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    const matchesCategory = activeCategory === 'All' || law.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggle = (id: number) => setExpandedId(prev => (prev === id ? null : id));

  return (
    <div className="laws-page">
      {/* Page Header */}
      <div className="laws-header animate-fade-in">
        <div className="laws-header-icon">
          <BookOpen size={32} color="var(--accent-primary)" />
        </div>
        <div>
          <h1 className="gradient-text">Mining Laws & Regulations</h1>
          <p>A comprehensive reference to all major mining legislation applicable in India.</p>
        </div>
        <div className="laws-count-badge">{MINING_LAWS.length} Laws</div>
      </div>

      {/* Search & Filter Bar */}
      <div className="laws-controls glass-panel animate-fade-in">
        <div className="search-box">
          <Search size={16} color="var(--text-muted)" />
          <input
            className="search-input"
            placeholder="Search laws, provisions, keywords..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Laws List */}
      <div className="laws-list">
        {filtered.length === 0 && (
          <div className="no-results glass-panel">
            <p>No laws found matching your search.</p>
          </div>
        )}
        {filtered.map((law, idx) => (
          <div
            key={law.id}
            className="law-card glass-panel animate-fade-in"
            style={{ animationDelay: `${idx * 0.06}s` }}
          >
            <div className="law-card-header" onClick={() => toggle(law.id)}>
              <div className="law-card-meta">
                <div className="law-badges">
                  <span className={`badge ${BADGE_COLORS[law.badge] || ''}`}>{law.badge}</span>
                  <span className={`category-tag ${CATEGORY_COLORS[law.category] || ''}`}>
                    <Tag size={11} /> {law.category}
                  </span>
                </div>
                <h2 className="law-title">{law.title}</h2>
                <p className="law-summary">{law.summary}</p>
              </div>
              <button className="expand-btn glass-button">
                {expandedId === law.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>

            {expandedId === law.id && (
              <div className="law-card-body">
                {law.sections.map((section, sIdx) => (
                  <div key={sIdx} className="law-section">
                    <h3 className="section-heading">{section.heading}</h3>
                    <ul className="section-points">
                      {section.points.map((point, pIdx) => (
                        <li key={pIdx} className="section-point">
                          <CheckCircle size={14} color="var(--accent-primary)" className="point-icon" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
