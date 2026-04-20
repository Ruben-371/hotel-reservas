import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS = { pending: ['Pendiente','#f59e0b'], confirmed: ['Confirmada','#10b981'], cancelled: ['Cancelada','#ef4444'], completed: ['Completada','#60a5fa'] };

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    bookingAPI.getMyBookings().then(r => setBookings(r.data)).catch(() => setBookings([])).finally(() => setLoading(false));
  }, []);

  const cancel = async (id) => {
    if (!window.confirm('¿Cancelar esta reserva?')) return;
    try { await bookingAPI.cancel(id); setBookings(b => b.map(x => x.id === id ? { ...x, status: 'cancelled' } : x)); }
    catch (e) { alert('Error al cancelar'); }
  };

  const nights = (ci, co) => Math.max(0, Math.floor((new Date(co) - new Date(ci)) / 86400000));

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner"></div></div>;

  return (
    <div className="container section">
      <div style={{ marginBottom: 36 }}>
        <h1 className="section-title">Mis reservas</h1>
        <p className="section-subtitle">Hola, {user?.full_name} — {bookings.length} reserva{bookings.length !== 1 ? 's' : ''}</p>
      </div>

      {bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏨</div>
          <h3 style={{ fontSize: 20, marginBottom: 8, color: '#ccc' }}>No tienes reservas aún</h3>
          <p style={{ color: '#666', marginBottom: 28 }}>Explora nuestros hoteles y haz tu primera reserva</p>
          <button onClick={() => navigate('/hoteles')} className="btn btn-primary">Ver hoteles</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {bookings.map(b => {
            const [label, color] = STATUS[b.status] || ['Desconocido', '#888'];
            return (
              <div key={b.id} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: 0 }}>
                  <div style={{ height: 140 }}>
                    <img src={b.hotel_image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'} alt={b.hotel_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'} />
                  </div>
                  <div style={{ padding: '18px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700 }}>{b.hotel_name}</h3>
                      <span style={{ background: color + '22', color, padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 20, color: '#888', fontSize: 13 }}>
                      <span>📅 Check-in: <strong style={{ color: '#ccc' }}>{b.check_in}</strong></span>
                      <span>📅 Check-out: <strong style={{ color: '#ccc' }}>{b.check_out}</strong></span>
                      <span>🌙 {nights(b.check_in, b.check_out)} noches</span>
                      <span>👥 {b.guests} huésped{b.guests !== 1 ? 'es' : ''}</span>
                    </div>
                    {b.special_requests && <p style={{ fontSize: 12, color: '#555', marginTop: 8 }}>💬 {b.special_requests}</p>}
                    <p style={{ fontSize: 12, color: '#444', marginTop: 8 }}>Reserva #{b.id} · {b.created_at ? new Date(b.created_at).toLocaleDateString('es-MX') : ''}</p>
                  </div>
                  <div style={{ padding: '18px 22px', textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, minWidth: 160 }}>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b' }}>${b.total_price?.toLocaleString()}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>MXN total</div>
                    </div>
                    {(b.status === 'pending' || b.status === 'confirmed') && (
                      <button onClick={() => cancel(b.id)} className="btn btn-danger btn-sm" style={{ justifyContent: 'center' }}>Cancelar</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
