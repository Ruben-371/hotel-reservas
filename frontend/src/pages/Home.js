import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hotelAPI } from '../services/api';

function HotelCard({ hotel, onClick }) {
  return (
    <div onClick={onClick} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}>
      <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
        <img src={hotel.images?.[0]} alt={hotel.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'} />
        <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.7)', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>
          {'★'.repeat(hotel.stars)} {hotel.stars} ★
        </div>
      </div>
      <div style={{ padding: '16px 18px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{hotel.name}</h3>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>📍 {hotel.location?.city}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#f59e0b' }}>${hotel.price_per_night?.toLocaleString()}<span style={{ fontSize: 12, color: '#666', fontWeight: 400 }}>/noche</span></span>
          <span style={{ fontSize: 12, color: '#10b981' }}>⭐ {hotel.rating}</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [hotels, setHotels] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    hotelAPI.seed().then(() => hotelAPI.list({ limit: 6 })).then(r => setHotels(r.data)).catch(() => hotelAPI.list({ limit: 6 }).then(r => setHotels(r.data)));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/hoteles${search ? `?city=${search}` : ''}`);
  };

  return (
    <div>
      {/* Hero */}
      <div className="hero">
        <h1>Encuentra tu<br /><span>hotel perfecto</span></h1>
        <p>Los mejores hoteles de México. Reserva fácil, rápido y seguro.</p>
        <form onSubmit={handleSearch} className="search-bar">
          <input placeholder="¿A dónde quieres ir? (Cancún, CDMX...)" value={search} onChange={e => setSearch(e.target.value)} />
          <button type="submit">🔍 Buscar</button>
        </form>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[['100+','Hoteles disponibles'],['50k+','Reservas realizadas'],['4.8★','Calificación promedio'],['24/7','Soporte disponible']].map(([n,l]) => (
          <div key={l} className="stat-item">
            <div className="stat-number">{n}</div>
            <div className="stat-label">{l}</div>
          </div>
        ))}
      </div>

      {/* Featured hotels */}
      <div className="container section">
        <h2 className="section-title">Hoteles destacados</h2>
        <p className="section-subtitle" style={{ marginBottom: 32 }}>Los mejores seleccionados para ti</p>
        <div className="hotels-grid">
          {hotels.map(h => <HotelCard key={h.id} hotel={h} onClick={() => navigate(`/hoteles/${h.id}`)} />)}
        </div>
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button onClick={() => navigate('/hoteles')} className="btn btn-outline" style={{ padding: '12px 32px' }}>Ver todos los hoteles →</button>
        </div>
      </div>

      {/* Features */}
      <div style={{ background: '#0d0d0d', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container section">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40 }}>
            {[['🔒','Pagos seguros','Tu información siempre protegida con encriptación de nivel bancario'],
              ['⚡','Confirmación instantánea','Recibe la confirmación de tu reserva en segundos'],
              ['🌟','Mejores precios','Garantizamos los mejores precios sin cargos ocultos']].map(([icon,title,desc]) => (
              <div key={title} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
                <p style={{ color: '#666', fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
