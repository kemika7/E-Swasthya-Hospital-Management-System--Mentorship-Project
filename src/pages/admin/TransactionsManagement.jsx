import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { FiFilter, FiCheck, FiX, FiDollarSign } from 'react-icons/fi';

const TransactionsManagement = () => {
  const { transactions, updateTransaction, kpis } = useAdmin();
  const [filterDate, setFilterDate] = useState('');

  const filteredTransactions = filterDate 
    ? transactions.filter(t => t.date === filterDate)
    : transactions;

  const handleStatusChange = (id, newStatus) => {
    updateTransaction(id, { status: newStatus });
  };

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'completed': return '#22c55e';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <div className="layout-main">
      <div className="page-header">
        <div>
          <h2 className="page-title">Transactions Overview</h2>
          <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Manage financial records and view revenue.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 0 }}>
             <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '0.5rem', borderRadius: '50%' }}>
               <FiDollarSign size={20} color="#22c55e" />
             </div>
             <div>
               <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Revenue</div>
               <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>${kpis.totalRevenue}</div>
             </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', padding: '0.5rem 1rem', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
          <FiFilter size={16} color="var(--text-secondary)" />
          <input 
            type="date" 
            value={filterDate} 
            onChange={(e) => setFilterDate(e.target.value)}
            style={{ border: 'none', outline: 'none', color: 'var(--text)' }}
          />
          {filterDate && (
             <button onClick={() => setFilterDate('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}>
               <FiX size={16} />
             </button>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>ID</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Patient</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Date</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Method</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Amount</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>#{t.id}</td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{t.patient}</td>
                <td style={{ padding: '1rem' }}>{t.date}</td>
                <td style={{ padding: '1rem' }}>{t.method}</td>
                <td style={{ padding: '1rem', fontWeight: 600 }}>${t.amount}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    color: getStatusColor(t.status), 
                    fontWeight: 500,
                    backgroundColor: `${getStatusColor(t.status)}15`,
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.85rem'
                  }}>
                    {t.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    {t.status === 'Pending' && (
                      <>
                        <button 
                          className="btn btn-outline" 
                          title="Mark Completed"
                          style={{ color: '#22c55e', borderColor: '#22c55e', padding: '0.4rem' }} 
                          onClick={() => handleStatusChange(t.id, 'Completed')}
                        >
                          <FiCheck size={14} />
                        </button>
                        <button 
                          className="btn btn-outline" 
                          title="Mark Failed"
                          style={{ color: '#ef4444', borderColor: '#ef4444', padding: '0.4rem' }} 
                          onClick={() => handleStatusChange(t.id, 'Failed')}
                        >
                          <FiX size={14} />
                        </button>
                      </>
                    )}
                    {t.status !== 'Pending' && <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>No actions</span>}
                  </div>
                </td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsManagement;
