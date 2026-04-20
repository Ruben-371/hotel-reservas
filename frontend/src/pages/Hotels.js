import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { hotelAPI } from '../services/api';

export default function Hotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: '', min_price: '', max_price: '', min_stars: '' });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const city = searchParams.get('city') || '';
    setFilters(f => ({ ...f, city }));
    load({ city });
  }, []);

  const load = (params = filters) => {
    setLoading(true);
    const q = {};
    if (params.city) q.city = params.city;
    if (params.min_price) q.min_price = params.min_price;
    if (params.max_price) q.max_price = params.max_price;
    if (params.min_stars) q.min_stars = params.min_stars;
    hotelAPI.list(q).then(r => setHotels(r.data)).catch(() => setHotels([])).finally(() => setLoading(false));
  };

  const handleFilter = (e) => { e.preventDefault(); load(); };
  const handleClear = () => { const f = { city: '', min_price: '', max_price: '', min_stars: '' }; setFilters(f); load(f); };

  return (
    <div className="container section">
      <div style={{ marginBottom: 32 }}>
        <h1 className="section-title">Todos los hoteles</h1>
        <p className="section-subtitle">{hotels.length} hoteles disponibles</p>
      </div>

      {/* Filters */}
      <form onSubmit={handleFilter} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, marginBottom: 36 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr) auto auto', gap: 12, alignItems: 'end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Ciudad</label>
            <input placeholder="Ej: Cancún" value={filters.city} onChange={e => setFilters({ ...filters, city: e.target.value })} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Precio mínimo</label>
            <input type="number" placeholder="$0" value={filters.min_price} onChange={e => setFilters({ ...filters, min_price: e.target.value })} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Precio máximo</label>
            <input type="number" placeholder="$9999" value={filters.max_price} onChange={e => setFilters({ ...filters, max_price: e.target.value })} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Estrellas mínimas</label>
            <select value={filters.min_stars} onChange={e => setFilters({ ...filters, min_stars: e.target.value })}>
              <option value="">Todas</option>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}★</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary">🔍 Filtrar</button>
          <button type="button" className="btn btn-outline" onClick={handleClear}>Limpiar</button>
        </div>
      </form>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner"></div></div>
      ) : hotels.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#666' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🏨</div>
          <h3>No se encontraron hoteles</h3>
          <p style={{ marginTop: 8 }}>Intenta con otros filtros</p>
        </div>
      ) : (
        <div className="hotels-grid">
          {hotels.map(hotel => (
            <div key={hotel.id} onClick={() => navigate(`/hoteles/${hotel.id}`)}
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}>
              <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                <img src={hotel.images?.[0]} alt={hotel.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'} />
                <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.75)', borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>{'★'.repeat(hotel.stars)} {hotel.stars}★</div>
                <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.75)', borderRadius: 8, padding: '3px 10px', fontSize: 12, color: '#10b981' }}>⭐ {hotel.rating}</div>
              </div>
              <div style={{ padding: '16px 18px' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{hotel.name}</h3>
                <p style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>📍 {hotel.location?.city}, {hotel.location?.country}</p>
                <p style={{ color: '#666', fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>{hotel.description?.substring(0, 80)}...</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#f59e0b' }}>${hotel.price_per_night?.toLocaleString()}<span style={{ fontSize: 11, color: '#666', fontWeight: 400 }}>/noche</span></span>
                  <span style={{ background: '#1a1a1a', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>Ver detalles</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
