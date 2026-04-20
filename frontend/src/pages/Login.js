import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Credenciales incorrectas');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🏨</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>Bienvenido de vuelta</h1>
          <p style={{ color: '#666', marginTop: 8 }}>Inicia sesión en tu cuenta</p>
        </div>

        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 32 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Correo electrónico</label>
              <input type="email" placeholder="tu@correo.com" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px 0', fontSize: 15 }} disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 20, color: '#666', fontSize: 14 }}>
            ¿No tienes cuenta? <Link to="/registro" style={{ color: '#f59e0b', fontWeight: 600 }}>Regístrate gratis</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
