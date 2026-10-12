import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiCreditCard, FiClock, FiAward, FiCheckCircle } from 'react-icons/fi';
import {
  useWalletSummary,
  usePointsHistory,
  usePrizeHistory,
  useWithdrawHistory,
  useWithdrawMutation,
  useRedeemCouponMutation,
  usePayoutDetails,
  useUpdatePayoutDetailsMutation,
} from '../hooks/useWallet';
import '../styles/wallet.css';

const MIN_WITHDRAWAL = 300;

export default function Wallet() {
  const { data: summary, isLoading: isSummaryLoading } = useWalletSummary();
  const { data: payoutDetails, isLoading: isPayoutLoading } = usePayoutDetails();

  const [activeTab, setActiveTab] = useState('points');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('UPI');

  const withdrawMutation = useWithdrawMutation();
  const redeemMutation = useRedeemCouponMutation();
  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    if (payoutDetails?.preferred_method) {
      setWithdrawMethod(payoutDetails.preferred_method);
    }
  }, [payoutDetails]);

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

    // Ensure payout details are filled for the selected method
    if (withdrawMethod === 'UPI' && !payoutDetails?.upi_id) {
      toast.error('Please save your UPI ID in the Payment Details section before withdrawing.');
      return;
    }
    if (withdrawMethod === 'Bank' && !payoutDetails?.account_number) {
      toast.error('Please save your Bank Account details in the Payment Details section before withdrawing.');
      return;
    }

    withdrawMutation.mutate(
      { amount, method: withdrawMethod },
      {
        onSuccess: () => {
          toast.success('Withdrawal requested successfully! Admin will process your payout.');
          setWithdrawAmount('');
        },
        onError: (err) => {
          toast.error(err.response?.data?.error || 'Failed to request withdrawal');
        },
      }
    );
  };

  const handleRedeemCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) { toast.error('Enter a coupon code.'); return; }
    redeemMutation.mutate(couponCode.trim(), {
      onSuccess: (data) => {
        toast.success(data.message || 'Coupon redeemed!');
        setCouponCode('');
      },
      onError: (err) => {
        toast.error(err.response?.data?.error || 'Failed to redeem coupon.');
      },
    });
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
    <div className="wallet-page" style={{ paddingTop:'var(--nav-height)', minHeight:'100vh' }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="wallet-hero">
        <div className="container" style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
            <div style={{ width:38, height:38, borderRadius:12, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <FiCreditCard size={18} color="#fff" />
            </div>
            <h1 style={{ color:'#fff', fontSize:20, fontWeight:800, margin:0 }}>My Wallet</h1>
          </div>
        </div>
      </div>

      <div className="container wallet-cards-row">
        {/* Summary Grid pulled up over hero */}
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
            <span className="summary-card-title">Prize Balance</span>
            <span className="summary-card-value">₹{(summary?.availablePrize || 0).toFixed(2)}</span>
          </div>
          <div className="summary-card">
            <span className="summary-card-title">Lifetime Earned</span>
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

      {/* Redeem Coupon */}
      <div className="info-card" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.08) 100%)', borderColor: 'rgba(139,92,246,0.25)' }}>
        <h3 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>🎫 Redeem Coupon</h3>
        <form onSubmit={handleRedeemCoupon} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Enter coupon code (e.g. WELCOME100)"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            style={{ flex: 1, minWidth: 200, letterSpacing: '0.05em', fontWeight: 600, textTransform: 'uppercase' }}
          />
          <button
            type="submit"
            className="withdraw-btn"
            disabled={redeemMutation.isPending || !couponCode.trim()}
            style={{ whiteSpace: 'nowrap', background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)' }}
          >
            {redeemMutation.isPending ? 'Redeeming…' : '🎁 Redeem'}
          </button>
        </form>
      </div>

      {/* Payment Details Section */}
      <PaymentDetailsSection payoutDetails={payoutDetails} isLoadingDetails={isPayoutLoading} />

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
  </div>
);
}

function PaymentDetailsSection({ payoutDetails, isLoadingDetails }) {
  const updatePayout = useUpdatePayoutDetailsMutation();
  
  const [prefMethod, setPrefMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [accHolder, setAccHolder] = useState('');
  const [accNum, setAccNum] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (payoutDetails) {
      setPrefMethod(payoutDetails.preferred_method || 'UPI');
      setUpiId(payoutDetails.upi_id || '');
      setAccHolder(payoutDetails.account_holder || '');
      setAccNum(payoutDetails.account_number || '');
      setIfsc(payoutDetails.ifsc_code || '');
      setBankName(payoutDetails.bank_name || '');
    } else {
      setIsEditing(true);
    }
  }, [payoutDetails]);

  const handleSave = (e) => {
    e.preventDefault();
    if (prefMethod === 'UPI' && !upiId.trim()) {
      toast.error('Please enter a valid UPI ID (e.g. 9876543210@paytm)');
      return;
    }
    if (prefMethod === 'Bank' && (!accNum.trim() || !ifsc.trim())) {
      toast.error('Please enter Account Number and IFSC Code');
      return;
    }

    updatePayout.mutate(
      {
        preferred_method: prefMethod,
        upi_id: upiId,
        account_holder: accHolder,
        account_number: accNum,
        ifsc_code: ifsc,
        bank_name: bankName,
      },
      {
        onSuccess: (data) => {
          toast.success(data.message || 'Payment details saved!');
          setIsEditing(false);
        },
        onError: (err) => {
          toast.error(err.response?.data?.error || 'Failed to save payment details.');
        },
      }
    );
  };

  if (isLoadingDetails) return <div className="skeleton" style={{ height: '120px', marginBottom: 24 }}></div>;

  const hasSavedData = payoutDetails && (payoutDetails.upi_id || payoutDetails.account_number);

  return (
    <div className="info-card" style={{ marginBottom: 24, background: '#1e293b', borderColor: '#334155' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#f8fafc' }}>
          💳 Saved Payout Details (UPI / Bank Account)
        </h3>
        {hasSavedData && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#60a5fa', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
          >
            ✏️ Edit Details
          </button>
        )}
      </div>

      {!isEditing && hasSavedData ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, background: 'rgba(15, 23, 42, 0.6)', padding: 16, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <span style={{ fontSize: 12, color: '#94a3b8', display: 'block' }}>Payout Method</span>
            <strong style={{ color: '#38bdf8' }}>{payoutDetails.preferred_method === 'Bank' ? '🏦 Bank Transfer' : '📱 UPI'}</strong>
          </div>
          {payoutDetails.preferred_method === 'UPI' ? (
            <div>
              <span style={{ fontSize: 12, color: '#94a3b8', display: 'block' }}>UPI ID</span>
              <strong style={{ color: '#f1f5f9' }}>{payoutDetails.upi_id || 'Not set'}</strong>
            </div>
          ) : (
            <>
              <div>
                <span style={{ fontSize: 12, color: '#94a3b8', display: 'block' }}>Account Holder</span>
                <strong style={{ color: '#f1f5f9' }}>{payoutDetails.account_holder || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ fontSize: 12, color: '#94a3b8', display: 'block' }}>Account Number</span>
                <strong style={{ color: '#f1f5f9' }}>{payoutDetails.account_number}</strong>
              </div>
              <div>
                <span style={{ fontSize: 12, color: '#94a3b8', display: 'block' }}>IFSC Code</span>
                <strong style={{ color: '#f1f5f9' }}>{payoutDetails.ifsc_code}</strong>
              </div>
              <div>
                <span style={{ fontSize: 12, color: '#94a3b8', display: 'block' }}>Bank Name</span>
                <strong style={{ color: '#f1f5f9' }}>{payoutDetails.bank_name || 'N/A'}</strong>
              </div>
            </>
          )}
        </div>
      ) : (
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={() => setPrefMethod('UPI')}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid',
                borderColor: prefMethod === 'UPI' ? '#3b82f6' : '#475569',
                background: prefMethod === 'UPI' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                color: prefMethod === 'UPI' ? '#60a5fa' : '#94a3b8',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              📱 UPI ID
            </button>
            <button
              type="button"
              onClick={() => setPrefMethod('Bank')}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid',
                borderColor: prefMethod === 'Bank' ? '#3b82f6' : '#475569',
                background: prefMethod === 'Bank' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                color: prefMethod === 'Bank' ? '#60a5fa' : '#94a3b8',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🏦 Bank Transfer
            </button>
          </div>

          {prefMethod === 'UPI' ? (
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label style={{ color: '#cbd5e1' }}>UPI ID (e.g. 9876543210@paytm / name@upi)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter UPI ID"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                required
              />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
              <div className="form-group">
                <label style={{ color: '#cbd5e1' }}>Account Holder Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Full Name in Bank"
                  value={accHolder}
                  onChange={(e) => setAccHolder(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label style={{ color: '#cbd5e1' }}>Account Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Account Number"
                  value={accNum}
                  onChange={(e) => setAccNum(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label style={{ color: '#cbd5e1' }}>IFSC Code</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. SBIN0001234"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  required
                />
              </div>
              <div className="form-group">
                <label style={{ color: '#cbd5e1' }}>Bank Name (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. State Bank of India"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            {hasSavedData && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={{ background: 'transparent', border: '1px solid #475569', color: '#94a3b8', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="withdraw-btn"
              disabled={updatePayout.isPending}
              style={{ width: 'auto', padding: '8px 24px' }}
            >
              {updatePayout.isPending ? 'Saving...' : '💾 Save Payment Details'}
            </button>
          </div>
        </form>
      )}
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
