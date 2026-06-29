import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { DollarSign, Tag, Bell, ShoppingCart, Trash2 } from 'lucide-react';
import './Bills.css';

const Bills = () => {
  const { user } = useUser();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [taggedFriends, setTaggedFriends] = useState([]);
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('omnitool_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('omnitool_expenses', JSON.stringify(expenses));
  }, [expenses]);

  const handleTag = (friendId) => {
    if (taggedFriends.includes(friendId)) {
      setTaggedFriends(taggedFriends.filter(id => id !== friendId));
    } else {
      setTaggedFriends([...taggedFriends, friendId]);
    }
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!amount || !description) return;

    const newExpense = {
      id: Date.now(),
      amount: parseFloat(amount),
      description,
      tagged: taggedFriends,
      date: new Date().toLocaleDateString(),
      by: user.id
    };

    setExpenses([newExpense, ...expenses]);
    setAmount('');
    setDescription('');
    setTaggedFriends([]);
    
    if (taggedFriends.length > 0) {
      alert(`Notifications sent to ${taggedFriends.length} friend(s) about the bill split!`);
    }
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  return (
    <div className="bills-page animate-fade-in">
      <div className="bills-header">
        <div>
          <h1>Bill Splitting & Prices</h1>
          <p>Split bills and compare prices easily.</p>
        </div>
      </div>

      <div className="grid-layout">
        <div className="glass-panel add-expense-container">
          <h3><ShoppingCart size={20} style={{marginRight: '8px'}} /> Add Expense</h3>
          
          <form onSubmit={handleAddExpense} className="expense-form">
            <div className="form-group">
              <label>Amount ($)</label>
              <div className="input-with-icon">
                <DollarSign size={16} className="icon" />
                <input 
                  type="number" 
                  step="0.01"
                  className="input-field" 
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description (Item/Price comparison)</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Dinner at Joe's"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label><Tag size={16} /> Tag Friends to Split</label>
              <div className="tag-friends-list">
                {user.friends.length === 0 ? (
                  <p className="text-muted text-sm">Add friends first in the Friends tab to tag them.</p>
                ) : (
                  user.friends.map(id => (
                    <button 
                      key={id} 
                      type="button"
                      className={`friend-tag ${taggedFriends.includes(id) ? 'selected' : ''}`}
                      onClick={() => handleTag(id)}
                    >
                      User {id.substring(0,4)}
                    </button>
                  ))
                )}
              </div>
            </div>

            <button type="submit" className="btn btn-primary">Add & Split</button>
          </form>
        </div>

        <div className="glass-panel recent-expenses-container">
          <h3>Recent Activity</h3>
          <div className="expense-list">
            {expenses.length === 0 ? (
              <p className="empty-state">No expenses added yet.</p>
            ) : (
              expenses.map(exp => {
                const splitAmount = exp.tagged.length > 0 
                  ? (exp.amount / (exp.tagged.length + 1)).toFixed(2) 
                  : exp.amount.toFixed(2);
                  
                return (
                  <div key={exp.id} className="expense-item">
                    <div className="expense-info">
                      <span className="expense-desc">{exp.description}</span>
                      <span className="expense-date">{exp.date}</span>
                    </div>
                    <div className="expense-amounts">
                      <span className="total-amount">${exp.amount.toFixed(2)}</span>
                      {exp.tagged.length > 0 && (
                        <span className="split-amount text-muted">
                          <Bell size={12} /> Split: ${splitAmount}/person
                        </span>
                      )}
                    </div>
                    <button className="delete-btn expense-delete" onClick={() => deleteExpense(exp.id)} title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bills;
