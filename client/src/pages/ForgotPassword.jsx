import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post('http://localhost:4000/api/users/reset-password', { email, newPassword, token: null });
    setMsg(res.data.message);
    if (res.data.success) {
      setTimeout(() => navigate('/'), 1500);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f6f6' }}>
      <div style={{ background: '#fff', padding: '2.5rem 2rem', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', maxWidth: 400, width: '100%' }}>
        <h2 style={{ textAlign: 'center', color: '#4f8cff', marginBottom: '1.5rem', fontWeight: 700 }}>Reset Your Password</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ fontWeight: 500, color: '#333', marginBottom: 4, display: 'block' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              style={{ width: '100%', padding: '0.7rem', borderRadius: 6, border: '1px solid #d1d5db', outline: 'none', fontSize: 16 }}
            />
          </div>
          <div>
            <label style={{ fontWeight: 500, color: '#333', marginBottom: 4, display: 'block' }}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              placeholder="Enter new password"
              style={{ width: '100%', padding: '0.7rem', borderRadius: 6, border: '1px solid #d1d5db', outline: 'none', fontSize: 16 }}
            />
          </div>
          <button
            type="submit"
            style={{ background: '#4f8cff', color: '#fff', padding: '0.8rem', borderRadius: 6, border: 'none', fontWeight: 600, fontSize: 16, cursor: 'pointer', marginTop: 8 }}
          >
            Reset Password
          </button>
        </form>
        {msg && <p style={{ marginTop: 18, textAlign: 'center', color: msg.includes('success') ? '#22c55e' : '#ef4444', fontWeight: 500 }}>{msg}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;