'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Login page for password protection.
 * Matches the app's dark theme design.
 */
export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success - redirect to main app
        router.push('/');
        router.refresh();
      } else {
        // Show error message
        setError(data.error || 'Fel lösenord');
      }
    } catch (err) {
      setError('Något gick fel. Försök igen.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header with app branding */}
        <div className="login-header">
          <span className="login-icon">🔐</span>
          <h1 className="login-title">Expert Team Workspace</h1>
          <p className="login-subtitle">Ange lösenord för att fortsätta</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="password" className="input-label">
              Lösenord
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ange lösenord..."
              className="login-input"
              autoFocus
              disabled={isLoading}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="login-button"
            disabled={isLoading || !password}
          >
            {isLoading ? 'Loggar in...' : 'Logga in'}
          </button>
        </form>
      </div>

      {/* Inline styles matching the app's dark theme */}
      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #1a1a2e;
          padding: 20px;
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          background-color: #16213e;
          border: 1px solid #2d2d44;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-icon {
          font-size: 48px;
          display: block;
          margin-bottom: 16px;
        }

        .login-title {
          font-size: 20px;
          font-weight: 700;
          color: #e4e4e7;
          margin: 0 0 8px 0;
          letter-spacing: -0.02em;
        }

        .login-subtitle {
          font-size: 14px;
          color: #71717a;
          margin: 0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-label {
          font-size: 14px;
          font-weight: 500;
          color: #a1a1aa;
        }

        .login-input {
          width: 100%;
          padding: 14px 16px;
          background-color: #0f0f23;
          border: 1px solid #2d2d44;
          border-radius: 10px;
          color: #e4e4e7;
          font-size: 16px;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .login-input:focus {
          border-color: #3d3d5c;
        }

        .login-input::placeholder {
          color: #71717a;
        }

        .login-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          padding: 12px 16px;
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #ef4444;
          font-size: 14px;
          text-align: center;
        }

        .login-button {
          width: 100%;
          padding: 14px;
          background-color: #3b82f6;
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .login-button:hover:not(:disabled) {
          background-color: #2563eb;
        }

        .login-button:disabled {
          background-color: #2d2d44;
          color: #71717a;
          cursor: not-allowed;
        }

        /* Mobile responsiveness */
        @media (max-width: 480px) {
          .login-card {
            padding: 24px;
          }

          .login-icon {
            font-size: 40px;
          }

          .login-title {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
}
