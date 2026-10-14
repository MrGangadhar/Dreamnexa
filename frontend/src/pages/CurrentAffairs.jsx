import React, { useState, useEffect } from 'react';
import { 
  FiBookOpen, FiSearch, FiZap, FiCalendar, FiTag, FiChevronRight, 
  FiAward, FiTrendingUp, FiLayers, FiCheckCircle, FiShare2, FiBookmark, FiX, FiAlertCircle, FiRefreshCw, FiGlobe
} from 'react-icons/fi';
import { fetchCurrentAffairs } from '../api/currentAffairsApi';
import { FALLBACK_CURRENT_AFFAIRS } from '../data/currentAffairsData';
import '../styles/currentAffairs.css';
import { useSEO } from '../hooks/useSEO';

const CATEGORIES = [
  { id: 'All', label: 'All Topics', icon: FiLayers },
  { id: 'General Knowledge', label: 'General Knowledge (GK)', icon: FiGlobe },
  { id: 'Politics', label: 'Politics & Governance', icon: FiTrendingUp },
  { id: 'Social Science', label: 'Social & Society', icon: FiZap },
  { id: 'Economy', label: 'Economy & Finance', icon: FiTrendingUp },
  { id: 'Science & Tech', label: 'Science & Technology', icon: FiZap },
  { id: 'Student Corner', label: 'Student Special & Higher Ed', icon: FiAward },
  { id: 'International', label: 'World Affairs', icon: FiBookOpen }
];

const EXAM_TAGS = ['General Knowledge (GK)', 'UPSC', 'SSC', 'Banking', 'Railway', 'State PSC', 'School & College', 'Daily Awareness'];

export default function CurrentAffairs() {
  useSEO({
    title: 'Current Affairs & GK Today 2026 — UPSC, SSC, Banking | DreamNexa',
    description: 'Daily current affairs and general knowledge updates for competitive exam preparation. Covers UPSC, SSC, Banking, Railways, and State PSC. Key points, facts, and analysis.',
    canonical: 'https://dreamnexa.in/current-affairs',
  });
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedExamTag, setSelectedExamTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ca_bookmarks') || '[]');
    } catch {
      return [];
    }
  });

  const getFilteredFallback = () => {
    return FALLBACK_CURRENT_AFFAIRS.filter((item) => {
      if (selectedCategory && selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (selectedExamTag && (!item.exam_tags || !item.exam_tags.includes(selectedExamTag))) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const inTitle = (item.title || '').toLowerCase().includes(q);
        const inSummary = (item.summary || '').toLowerCase().includes(q);
        if (!inTitle && !inSummary) return false;
      }
      return true;
    });
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCurrentAffairs({
        category: selectedCategory,
        exam_tag: selectedExamTag,
        search: searchQuery
      });
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setArticles(res.data);
      } else {
        const fallback = getFilteredFallback();
        setArticles(fallback);
      }
    } catch (err) {
      console.warn('Current affairs API load fallback:', err);
      const fallback = getFilteredFallback();
      setArticles(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedCategory, selectedExamTag, searchQuery]);

  const toggleBookmark = (id, e) => {
    e?.stopPropagation();
    let updated;
    if (bookmarkedIds.includes(id)) {
      updated = bookmarkedIds.filter(b => b !== id);
    } else {
      updated = [...bookmarkedIds, id];
    }
    setBookmarkedIds(updated);
    localStorage.setItem('ca_bookmarks', JSON.stringify(updated));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="ca-container">
      {/* Header Banner */}
      <header className="ca-header">
        <div className="ca-badge-banner">
          <FiGlobe size={14} />
          <span>General Knowledge & Real-time Daily Updates</span>
        </div>
        <h1 className="ca-title">
          Current Affairs & General Knowledge (GK)
        </h1>
        <p className="ca-subtitle">
          Simplified key-point bullet updates on Politics, Social Science, Economy, Science & Tech, and Daily GK — for students, competitive exams, and general knowledge enthusiasts.
        </p>
      </header>

      {/* Control Panel */}
      <div className="ca-filter-panel">
        <div className="ca-filter-top">
          {/* Search Box */}
          <div className="ca-search-box">
            <FiSearch className="ca-search-icon" size={16} />
            <input
              type="text"
              placeholder="Search GK topics, news, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ca-search-input"
            />
          </div>

          {/* Exam & GK Tag Buttons */}
          <div className="ca-exam-tags">
            <span className="ca-exam-label">
              <FiGlobe size={14} /> Knowledge Tag:
            </span>
            <button
              onClick={() => setSelectedExamTag('')}
              className={`ca-exam-btn ${selectedExamTag === '' ? 'active' : ''}`}
            >
              All Topics
            </button>
            {EXAM_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedExamTag(selectedExamTag === tag ? '' : tag)}
                className={`ca-exam-btn ${selectedExamTag === tag ? 'active' : ''}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="ca-categories-bar">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`ca-cat-btn ${isSelected ? 'active' : ''}`}
              >
                <Icon size={15} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)' }}>
          <FiRefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: 12 }}>Loading current affairs & GK articles...</p>
        </div>
      ) : error ? (
        <div style={{ background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 12, padding: 24, textAlign: 'center', color: '#c53030' }}>
          <FiAlertCircle size={28} />
          <h3 style={{ margin: '8px 0 4px 0' }}>Unable to load Current Affairs & GK</h3>
          <p style={{ fontSize: 14 }}>{error}</p>
          <button onClick={loadData} style={{ marginTop: 12, padding: '8px 16px', background: '#c53030', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            Try Again
          </button>
        </div>
      ) : articles.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
          <FiBookOpen size={36} />
          <h3 style={{ margin: '12px 0 4px 0', color: 'var(--text-primary)' }}>No articles found</h3>
          <p style={{ fontSize: 14 }}>No current affairs or GK items match your filter or search criteria.</p>
        </div>
      ) : (
        <div className="ca-grid">
          {articles.map((item) => {
            const isBookmarked = bookmarkedIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => setActiveArticle(item)}
                className="ca-card"
              >
                <div className="ca-card-body">
                  <div className="ca-card-meta">
                    <span className="ca-category-badge">
                      {item.category || 'General Knowledge'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="ca-date-badge">
                        <FiCalendar size={12} />
                        {formatDate(item.published_date)}
                      </span>
                      <button
                        onClick={(e) => toggleBookmark(item.id, e)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: isBookmarked ? '#7c3aed' : 'var(--text-muted)' }}
                      >
                        <FiBookmark size={15} />
                      </button>
                    </div>
                  </div>

                  <h3 className="ca-card-title">
                    {item.title}
                  </h3>

                  <p className="ca-card-summary">
                    {item.summary}
                  </p>

                  {item.exam_tags && item.exam_tags.length > 0 && (
                    <div className="ca-exam-tags-list">
                      {item.exam_tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="ca-exam-chip">
                          💡 {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {item.key_points && item.key_points.length > 0 && (
                  <div className="ca-key-points-box">
                    <div className="ca-key-points-title">
                      <FiCheckCircle size={12} /> Key GK Points & Facts
                    </div>
                    <ul className="ca-bullet-list">
                      {item.key_points.slice(0, 2).map((point, pIdx) => (
                        <li key={pIdx} className="ca-bullet-item">
                          <span className="ca-bullet-dot">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="ca-card-footer">
                  <span>Read Full Facts & Analysis</span>
                  <FiChevronRight size={16} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal View */}
      {activeArticle && (
        <div className="ca-modal-overlay" onClick={() => setActiveArticle(null)}>
          <div className="ca-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="ca-modal-close" onClick={() => setActiveArticle(null)}>
              <FiX size={18} />
            </button>

            <div className="ca-modal-header">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span className="ca-category-badge">{activeArticle.category}</span>
                <span className="ca-date-badge"><FiCalendar size={12} /> Published {formatDate(activeArticle.published_date)}</span>
              </div>
              <h2 className="ca-modal-title">{activeArticle.title}</h2>
            </div>

            {activeArticle.key_points && activeArticle.key_points.length > 0 && (
              <div className="ca-modal-key-points">
                <div className="ca-modal-key-title">
                  <FiCheckCircle size={15} /> Key GK Points & Quick Facts
                </div>
                {activeArticle.key_points.map((pt, idx) => (
                  <div key={idx} className="ca-modal-key-item">
                    <span className="ca-modal-num">{idx + 1}</span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            )}

            {activeArticle.content && (
              <div className="ca-modal-body">
                <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px 0' }}>Detailed Overview</h4>
                <p>{activeArticle.content}</p>
              </div>
            )}

            {activeArticle.why_it_matters && (
              <div className="ca-modal-matters">
                <div className="ca-modal-matters-title">
                  <FiAward size={15} /> General Knowledge & Learning Significance
                </div>
                <div className="ca-modal-matters-text">
                  {activeArticle.why_it_matters}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              {activeArticle.source_url ? (
                <a href={activeArticle.source_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#7c3aed', textDecoration: 'none', fontWeight: 600 }}>
                  Official Reference Link ↗
                </a>
              ) : <div />}
              <button 
                onClick={() => setActiveArticle(null)}
                style={{ padding: '8px 20px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
