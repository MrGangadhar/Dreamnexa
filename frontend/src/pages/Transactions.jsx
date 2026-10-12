import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { FiRepeat, FiAlertCircle, FiArrowUpRight, FiArrowDownLeft, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const LIMIT = 10;

export default function Transactions() {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    const offset = (page - 1) * LIMIT;
    client.get('/users/me/points', { params: { limit: LIMIT + 1, offset } })
      .then(({ data }) => {
        if (data.length > LIMIT) {
          setHasMore(true);
          setTxs(data.slice(0, LIMIT));
        } else {
          setHasMore(false);
          setTxs(data);
        }
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load transaction history.');
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="page-content" style={{ background: 'var(--bg-primary)' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, fontSize: 28 }}>
            <FiRepeat color="var(--accent)" /> Transactions
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>View your complete points transaction history and ledger logs.</p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiAlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Transaction Table Card */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 50, marginBottom: 12, borderRadius: 8 }} />
              ))}
            </div>
          ) : txs.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>💸</div>
              <h3>No Transactions Found</h3>
              <p style={{ color: 'var(--text-muted)' }}>You haven't made any points transactions yet.</p>
            </div>
          ) : (
            <div>
              <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Description</th>
                      <th style={{ textAlign: 'right' }}>Points</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txs.map(tx => {
                      const isCredit = tx.amount > 0;
                      return (
                        <tr key={tx.id}>
                          <td>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              fontSize: 12,
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              padding: '4px 8px',
                              borderRadius: 6,
                              background: isCredit ? 'var(--accent-green-soft)' : 'var(--accent-red-soft)',
                              color: isCredit ? 'var(--accent-green)' : 'var(--accent-red)',
                            }}>
                              {isCredit ? <FiArrowDownLeft /> : <FiArrowUpRight />}
                              {tx.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                            {tx.description || 'Points transaction'}
                          </td>
                          <td style={{
                            textAlign: 'right',
                            fontWeight: 700,
                            color: isCredit ? 'var(--accent-green)' : 'var(--accent-red)',
                            fontSize: 15,
                          }}>
                            {isCredit ? `+${tx.amount}` : tx.amount}
                          </td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                            {new Date(tx.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 24px',
                borderTop: '1px solid var(--border)',
                background: 'var(--bg-raised)',
              }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <FiChevronLeft /> Previous
                </button>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Page {page}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={!hasMore}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  Next <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
