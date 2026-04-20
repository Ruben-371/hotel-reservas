import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">🏨 HotelBook</Link>
      <div className="navbar-links">
        <Link to="/hoteles">Hoteles</Link>
        {user && <Link to="/mis-reservas">Mis Reservas</Link>}
        {user?.role === 'admin' && (
          <Link to="/admin" style={{ color: '#f59e0b', fontWeight: 700 }}>⚙ Admin</Link>
        )}
        {user ? (
          <>
            <span style={{ color: '#888', fontSize: 13 }}>
              👤 {user.full_name?.split(' ')[0]}
              {user.role === 'admin' && (
                <span style={{ marginLeft: 6, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>ADMIN</span>
              )}
            </span>
            <button onClick={() => { logout(); navigate('/'); }} className="btn btn-outline btn-sm">Salir</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline btn-sm">Iniciar sesión</Link>
            <Link to="/registro" className="btn btn-primary btn-sm">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
}
