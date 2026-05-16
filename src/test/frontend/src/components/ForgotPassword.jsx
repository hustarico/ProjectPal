import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as authApi from '../api/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);
    if (!email) {
      setError('Email is required.');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      setSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">P</div>
          <span className="auth-logo-text">ProjectPal</span>
        </div>
        <h1>Forgot Password</h1>
        <p className="auth-subtitle">Enter your email to receive a reset token</p>
        {error && <div className="error-message">{error}<button className="message-dismiss" onClick={() => setError('')}>&times;</button></div>}
        {success && (
          <div className="success-message">
            <div>
              <p>{success.message}</p>
              {success.resetToken && (
                <p style={{ marginTop: 8, wordBreak: 'break-all' }}>
                  Token: <strong>{success.resetToken}</strong>
                </p>
              )}
            </div>
            <button className="message-dismiss" onClick={() => setSuccess(null)}>&times;</button>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Token'}
          </button>
        </form>
        <div className="auth-footer">
          <Link to="/login">Back to login</Link>
        </div>
        <div className="auth-footer">
          Have a token? <Link to="/reset-password">Reset password</Link>
        </div>
      </div>
    </div>
  );
}
