import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hotelAPI, bookingAPI, paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function HotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('detail');
  const [booking, setBooking] = useState({ check_in: '', check_out: '', guests: 1, special_requests: '' });
  const [createdBooking, setCreatedBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    hotelAPI.get(id)
      .then(r => { setHotel(r.data); setLoading(false); })
      .catch(() => { setLoading(false); navigate('/hoteles'); });
  }, [id, navigate]);

  const calcNights = () => {
    if (!booking.check_in || !booking.check_out) return 0;
    return Math.max(0, Math.floor((new Date(booking.check_out) - new Date(booking.check_in)) / 86400000));
  };

  const total = () => (hotel?.price_per_night || 0) * calcNights();

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setError(''); setProcessing(true);
    try {
      const res = await bookingAPI.create({
        hotel_id: hotel.id, hotel_name: hotel.name,
        hotel_image: hotel.images?.[0] || '',
        check_in: booking.check_in, check_out: booking.check_out,
        guests: Number(booking.guests), total_price: total(),
        special_requests: booking.special_requests || null
      });
      setCreatedBooking(res.data);
      setStep('payment');
    } catch (e) { setError(e.response?.data?.detail || 'Error al crear reserva'); }
    finally { setProcessing(false); }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError(''); setProcessing(true);
    try {
      await paymentAPI.process({ booking_id: createdBooking.id, amount: total(), method: paymentMethod });
      setStep('success');
    } catch (e) { setError(e.response?.data?.detail || 'Error al procesar pago'); }
    finally { setProcessing(false); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><div className="spinner"></div></div>;
  if (!hotel) return null;

  if (step === 'success') return (
    <div style={{ textAlign: 'center', padding: '100px 24px' }}>
      <div style={{ fontSize: 80, marginBottom: 24 }}>🎉</div>
      <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 12 }}>¡Reserva confirmada!</h2>
      <p style={{ color: '#888', marginBottom: 32, fontSize: 16 }}>Tu reserva en <strong style={{ color: '#fff' }}>{hotel.name}</strong> fue confirmada exitosamente.</p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <button onClick={() => navigate('/mis-reservas')} className="btn btn-primary">Ver mis reservas</button>
        <button onClick={() => navigate('/hoteles')} className="btn btn-outline">Explorar más hoteles</button>
      </div>
    </div>
  );

  if (step === 'payment') return (
    <div style={{ maxWidth: 500, margin: '60px auto', padding: '0 24px' }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>💳 Pago de reserva</h2>
      <p style={{ color: '#888', marginBottom: 28 }}>{hotel.name} — {calcNights()} noche{calcNights() !== 1 ? 's' : ''}</p>
      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18 }}>
          <span>Total a pagar</span>
          <span style={{ color: '#f59e0b' }}>${total().toLocaleString()} MXN</span>
        </div>
      </div>
      <form onSubmit={handlePayment}>
        <div className="form-group">
          <label>Método de pago</label>
          <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
            <option value="card">💳 Tarjeta de crédito/débito</option>
            <option value="transfer">🏦 Transferencia bancaria</option>
            <option value="cash">💵 Efectivo</option>
          </select>
        </div>
        {paymentMethod === 'card' && (
          <div style={{ background: '#1a1a1a', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <p style={{ color: '#f59e0b', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>💡 Pago simulado — no se cobra nada real</p>
            <p style={{ color: '#666', fontSize: 12 }}>Tarjeta: 4242 4242 4242 4242 | Exp: 12/28 | CVV: 123</p>
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}
        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15 }} disabled={processing}>
          {processing ? '⏳ Procesando...' : `✓ Confirmar pago $${total().toLocaleString()} MXN`}
        </button>
        <button type="button" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }} onClick={() => setStep('detail')}>← Cancelar</button>
      </form>
    </div>
  );

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      {/* Hero image */}
      <div style={{ borderRadius: 20, overflow: 'hidden', height: 420, marginBottom: 36, position: 'relative' }}>
        <img src={hotel.images?.[0]} alt={hotel.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200'} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', bottom: 28, left: 28 }}>
          <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: -1, marginBottom: 8 }}>{hotel.name}</h1>
          <p style={{ color: '#ccc', fontSize: 15 }}>📍 {hotel.location?.city}, {hotel.location?.country} · {hotel.location?.address}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 36 }}>
        {/* Info */}
        <div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
            <span className="badge badge-yellow">{'★'.repeat(hotel.stars)} {hotel.stars} Estrellas</span>
            <span className="badge badge-green">⭐ {hotel.rating} ({hotel.reviews_count} reseñas)</span>
            <span className="badge badge-blue">🛏 {hotel.rooms_available} cuartos disponibles</span>
          </div>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 12 }}>Descripción</h2>
          <p style={{ color: '#999', lineHeight: 1.8, fontSize: 15, marginBottom: 32 }}>{hotel.description}</p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 16 }}>Servicios incluidos</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 10 }}>
            {(hotel.services || []).map(s => (
              <div key={s} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ccc', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#f59e0b' }}>✓</span> {s}
              </div>
            ))}
          </div>
        </div>

        {/* Booking card */}
        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 26, height: 'fit-content', position: 'sticky', top: 80 }}>
          <div style={{ marginBottom: 22 }}>
            <span style={{ fontSize: 34, fontWeight: 900, color: '#f59e0b' }}>${(hotel.price_per_night||0).toLocaleString()}</span>
            <span style={{ color: '#666', fontSize: 13 }}> / noche</span>
          </div>
          <form onSubmit={handleBooking}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Check-in</label>
                <input type="date" required min={new Date().toISOString().split('T')[0]} value={booking.check_in} onChange={e => setBooking({ ...booking, check_in: e.target.value })} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Check-out</label>
                <input type="date" required min={booking.check_in || new Date().toISOString().split('T')[0]} value={booking.check_out} onChange={e => setBooking({ ...booking, check_out: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Huéspedes</label>
              <select value={booking.guests} onChange={e => setBooking({ ...booking, guests: e.target.value })}>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} huésped{n>1?'es':''}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Peticiones especiales</label>
              <input placeholder="Cama king, piso alto..." value={booking.special_requests} onChange={e => setBooking({ ...booking, special_requests: e.target.value })} />
            </div>
            {calcNights() > 0 && (
              <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 14, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: 13, marginBottom: 8 }}>
                  <span>${(hotel.price_per_night||0).toLocaleString()} × {calcNights()} noches</span>
                  <span>${total().toLocaleString()}</span>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>Total</span><span style={{ color: '#f59e0b' }}>${total().toLocaleString()} MXN</span>
                </div>
              </div>
            )}
            {error && <div className="alert alert-error">{error}</div>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px 0' }} disabled={processing}>
              {processing ? 'Procesando...' : user ? 'Reservar ahora' : 'Inicia sesión para reservar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
