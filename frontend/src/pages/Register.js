import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', role: 'client' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form);
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrarse');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🏨</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>Crear cuenta</h1>
          <p style={{ color: '#666', marginTop: 8 }}>Únete a HotelBook gratis</p>
        </div>

        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 32 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre completo</label>
              <input placeholder="Tu nombre" required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Correo electrónico</label>
              <input type="email" placeholder="tu@correo.com" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" placeholder="Mínimo 6 caracteres" required minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Teléfono (opcional)</label>
              <input placeholder="+52 555 123 4567" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Tipo de cuenta</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="client">Cliente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px 0', fontSize: 15 }} disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 20, color: '#666', fontSize: 14 }}>
            ¿Ya tienes cuenta? <Link to="/login" style={{ color: '#f59e0b', fontWeight: 600 }}>Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
