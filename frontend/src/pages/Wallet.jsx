import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiCreditCard, FiClock, FiAward, FiCheckCircle } from 'react-icons/fi';
import {
  useWalletSummary,
  usePointsHistory,
  usePrizeHistory,
  useWithdrawHistory,
  useWithdrawMutation,
} from '../hooks/useWallet';
import '../styles/wallet.css';

const MIN_WITHDRAWAL = 300;

export default function Wallet() {
  const { data: summary, isLoading: isSummaryLoading } = useWalletSummary();
  const [activeTab, setActiveTab] = useState('points');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('UPI');

  const withdrawMutation = useWithdrawMutation();

  const handleWithdraw = (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < MIN_WITHDRAWAL) {
      toast.error(`Minimum withdrawal amount is ₹${MIN_WITHDRAWAL}`);
      return;
    }
    if (amount > summary?.availablePrize) {
      toast.error('Insufficient available prize balance');
      return;
    }

    withdrawMutation.mutate(
      { amount, method: withdrawMethod },
      {
        onSuccess: () => {
          toast.success('Withdrawal requested successfully');
          setWithdrawAmount('');
        },
        onError: (err) => {
          toast.error(err.response?.data?.error || 'Failed to request withdrawal');
        },
      }
    );
  };

  if (isSummaryLoading) {
    return (
      <div className="container page-content wallet-page">
        <div className="skeleton" style={{ height: '40px', width: '200px', marginBottom: '24px' }}></div>
        <div className="wallet-summary-grid">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '12px' }}></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="container page-content wallet-page">
      <div className="wallet-header">
        <h1 className="wallet-title">
          <FiCreditCard /> My Wallet
        </h1>
      </div>

      {/* Summary Grid */}
      <div className="wallet-summary-grid">
        <div className="summary-card">
          <span className="summary-card-title">Total Points</span>
          <span className="summary-card-value">{(summary?.currentPoints || 0).toLocaleString()}</span>
        </div>
        <div className="summary-card">
          <span className="summary-card-title">Today's Points</span>
          <span className="summary-card-value">{(summary?.todayPoints || 0).toLocaleString()}</span>
        </div>
        <div className="summary-card prize-card">
          <span className="summary-card-title">Available Prize Balance</span>
          <span className="summary-card-value">₹{(summary?.availablePrize || 0).toFixed(2)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-card-title">Lifetime Prize Earned</span>
          <span className="summary-card-value">₹{(summary?.lifetimePrize || 0).toFixed(2)}</span>
        </div>
      </div>

      {/* Target Reward Progress */}
      <motion.div 
        className="wallet-progress-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="progress-header">
          <span className="progress-title">Target Reward</span>
          <span className="progress-stats">
            {((summary?.currentPoints || 0) - (summary?.claimedRewards || 0) * (summary?.targetPoints || 5000)).toLocaleString()} / {(summary?.targetPoints || 5000).toLocaleString()} Points
          </span>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${summary?.progress || 0}%` }}
          ></div>
        </div>
        <div className="progress-footer">
          <span>
            {(summary?.progress || 0)}% 
            <span style={{ marginLeft: '12px' }}>{(summary?.remainingPoints || 0).toLocaleString()} Points Remaining</span>
          </span>
          <span className="progress-reward">Reward: ₹{summary?.rewardAmount || 500} Prize</span>
        </div>
      </motion.div>

      {/* Info Section */}
      <div className="info-card">
        <h3>How Rewards Work</h3>
        <ul>
          <li>Every correct answer earns points.</li>
          <li>Points are updated instantly.</li>
          <li>Reach {(summary?.targetPoints || 5000).toLocaleString()} Points to unlock ₹{summary?.rewardAmount || 500} Prize Money.</li>
          <li>Prize money is transferred to your Prize Wallet automatically.</li>
          <li>Prize Wallet balance can be withdrawn once withdrawal conditions are met.</li>
          <li>Progress resets only after reward is successfully credited.</li>
        </ul>
      </div>

      {/* History Tabs */}
      <div className="wallet-tabs" role="tablist">
        <button 
          className={`wallet-tab ${activeTab === 'points' ? 'active' : ''}`}
          onClick={() => setActiveTab('points')}
          role="tab"
        >
          Points History
        </button>
        <button 
          className={`wallet-tab ${activeTab === 'prize' ? 'active' : ''}`}
          onClick={() => setActiveTab('prize')}
          role="tab"
        >
          Prize History
        </button>
        <button 
          className={`wallet-tab ${activeTab === 'withdraw' ? 'active' : ''}`}
          onClick={() => setActiveTab('withdraw')}
          role="tab"
        >
          Withdrawal History
        </button>
      </div>

      {/* History Content */}
      <div className="history-container">
        {activeTab === 'points' && <PointsHistoryTab />}
        {activeTab === 'prize' && <PrizeHistoryTab />}
        {activeTab === 'withdraw' && <WithdrawHistoryTab />}
      </div>

      {/* Withdraw Section */}
      <div className="withdraw-section">
        <h3 style={{ marginBottom: '16px' }}>Withdraw Prize Money</h3>
        <form className="withdraw-form" onSubmit={handleWithdraw}>
          <div className="form-group">
            <label>Amount (₹)</label>
            <input 
              type="number" 
              className="form-control" 
              value={withdrawAmount} 
              onChange={(e) => setWithdrawAmount(e.target.value)} 
              placeholder="e.g. 500"
              min={MIN_WITHDRAWAL}
              max={summary?.availablePrize || 0}
              required
            />
          </div>
          <div className="form-group">
            <label>Method</label>
            <select 
              className="form-control"
              value={withdrawMethod}
              onChange={(e) => setWithdrawMethod(e.target.value)}
            >
              <option value="UPI">UPI</option>
              <option value="Bank">Bank Transfer</option>
            </select>
          </div>
          <button 
            type="submit" 
            className="withdraw-btn"
            disabled={
              withdrawMutation.isPending || 
              (summary?.availablePrize || 0) < MIN_WITHDRAWAL ||
              parseFloat(withdrawAmount) < MIN_WITHDRAWAL ||
              parseFloat(withdrawAmount) > (summary?.availablePrize || 0)
            }
          >
            {withdrawMutation.isPending ? 'Processing...' : 'Withdraw Prize Money'}
          </button>
          {(summary?.availablePrize || 0) < MIN_WITHDRAWAL && (
            <div className="withdraw-msg">
              Minimum withdrawal amount (₹{MIN_WITHDRAWAL}) not reached.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// Sub-components for tabs
function PointsHistoryTab() {
  const { data, isLoading } = usePointsHistory();
  if (isLoading) return <div className="skeleton" style={{ height: '200px' }}></div>;
  if (!data?.length) return <EmptyState message="No points history yet." />;

  return (
    <div className="history-list">
      <div className="history-item history-header">
        <div>Date</div>
        <div>Description</div>
        <div>Points Earned</div>
        <div>Status</div>
      </div>
      {data.map((item, idx) => (
        <div key={idx} className="history-item">
          <div className="history-col date" data-label="Date">{new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          <div className="history-col" data-label="Quiz Name">{item.quizName}</div>
          <div className="history-col points" data-label="Points Earned">{item.points > 0 ? `+${item.points}` : item.points}</div>
          <div className="history-col" data-label="Status">
            <span className={`status-badge ${item.status.toLowerCase()}`}>{item.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PrizeHistoryTab() {
  const { data, isLoading } = usePrizeHistory();
  if (isLoading) return <div className="skeleton" style={{ height: '200px' }}></div>;
  if (!data?.length) return <EmptyState message="No prize history yet." />;

  return (
    <div className="history-list">
      <div className="history-item history-header">
        <div>Date</div>
        <div>Reward</div>
        <div>Points Used</div>
        <div>Status</div>
      </div>
      {data.map((item, idx) => (
        <div key={idx} className="history-item">
          <div className="history-col date" data-label="Date">{new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          <div className="history-col" data-label="Reward">{item.reward}</div>
          <div className="history-col" data-label="Points Used">{item.pointsUsed} Points</div>
          <div className="history-col" data-label="Status">
            <span className={`status-badge ${item.status.toLowerCase()}`}>{item.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function WithdrawHistoryTab() {
  const { data, isLoading } = useWithdrawHistory();
  if (isLoading) return <div className="skeleton" style={{ height: '200px' }}></div>;
  if (!data?.length) return <EmptyState message="No withdrawal history yet." />;

  return (
    <div className="history-list">
      <div className="history-item history-header">
        <div>Date</div>
        <div>Amount</div>
        <div>Method</div>
        <div>Status</div>
      </div>
      {data.map((item, idx) => (
        <div key={idx} className="history-item">
          <div className="history-col date" data-label="Date">{new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          <div className="history-col" data-label="Amount">₹{parseFloat(item.amount).toFixed(2)}</div>
          <div className="history-col" data-label="Method">{item.method}</div>
          <div className="history-col" data-label="Status">
            <span className={`status-badge ${item.status.toLowerCase()}`}>{item.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
      <p>{message}</p>
    </div>
  );
}
