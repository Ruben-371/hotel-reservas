import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hotelAPI, bookingAPI, userAPI } from '../services/api';

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('hotels');
  const [hotels, setHotels] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:'', description:'', stars:5, price_per_night:1000, rooms_available:10, city:'', address:'', services:'', images:'' });

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    loadAll();
  }, [user]);

  const loadAll = async () => {
    setLoading(true);
    try { const r = await hotelAPI.list({ limit: 100 }); setHotels(r.data || []); } catch(e) { setHotels([]); }
    try { const r = await userAPI.getAll(); setUsers(r.data || []); } catch(e) { setUsers([]); }
    try { const r = await bookingAPI.getAll(); setBookings(r.data || []); } catch(e) { setBookings([]); }
    setLoading(false);
  };

  const resetForm = () => setForm({ name:'', description:'', stars:5, price_per_night:1000, rooms_available:10, city:'', address:'', services:'', images:'' });

  const handleEdit = (h) => {
    setEditing(h);
    setForm({ name:h.name, description:h.description, stars:h.stars, price_per_night:h.price_per_night, rooms_available:h.rooms_available, city:h.location?.city||'', address:h.location?.address||'', services:(h.services||[]).join(', '), images:h.images?.[0]||'' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { name:form.name, description:form.description, stars:parseInt(form.stars), price_per_night:parseFloat(form.price_per_night), rooms_available:parseInt(form.rooms_available), location:{city:form.city, country:'Mexico', address:form.address}, services:form.services.split(',').map(s=>s.trim()).filter(Boolean), images:form.images?[form.images]:[], rating:editing?.rating||0, reviews_count:editing?.reviews_count||0 };
    try {
      if (editing) { await hotelAPI.update(editing.id, data); }
      else { await hotelAPI.create(data); }
      setShowForm(false); setEditing(null); resetForm();
      const r = await hotelAPI.list({ limit: 100 }); setHotels(r.data || []);
    } catch(e) { alert('Error al guardar hotel'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este hotel?')) return;
    try { await hotelAPI.delete(id); setHotels(h => h.filter(x => x.id !== id)); }
    catch(e) { alert('Error al eliminar'); }
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}><div className="spinner"></div></div>;

  const inp = { background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'10px 14px', color:'#fff', fontSize:14, width:'100%' };
  const tabBtn = (t, label) => (
    <button onClick={() => setTab(t)} style={{ padding:'8px 20px', borderRadius:10, border:'none', cursor:'pointer', fontSize:14, fontWeight:600, background:tab===t?'#f59e0b':'#1a1a1a', color:tab===t?'#000':'#ccc', transition:'all 0.2s' }}>{label}</button>
  );

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', padding:'40px 24px', color:'#fff' }}>
      <h1 style={{ fontSize:26, fontWeight:900, marginBottom:4, letterSpacing:-0.5 }}>🛠 Panel de Administrador</h1>
      <p style={{ color:'#666', marginBottom:36 }}>Bienvenido, {user?.full_name}</p>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:36 }}>
        {[['🏨','Hoteles',hotels.length,'#f59e0b'],['👥','Usuarios',users.length,'#10b981'],['📋','Reservas',bookings.length,'#60a5fa']].map(([icon,label,val,color])=>(
          <div key={label} style={{ background:'#111', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:22, textAlign:'center' }}>
            <div style={{ fontSize:32 }}>{icon}</div>
            <div style={{ fontSize:30, fontWeight:800, color }}>{val}</div>
            <div style={{ color:'#666', fontSize:13 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:28 }}>
        {tabBtn('hotels','🏨 Hoteles')}
        {tabBtn('users','👥 Usuarios')}
        {tabBtn('bookings','📋 Reservas')}
      </div>

      {/* HOTELS */}
      {tab==='hotels' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <h2 style={{ fontSize:18, fontWeight:700 }}>Hoteles ({hotels.length})</h2>
            <button onClick={()=>{ resetForm(); setEditing(null); setShowForm(true); }} style={{ background:'#f59e0b', color:'#000', border:'none', padding:'8px 18px', borderRadius:10, fontWeight:700, cursor:'pointer' }}>+ Nuevo hotel</button>
          </div>

          {showForm && (
            <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, padding:26, marginBottom:24 }}>
              <h3 style={{ marginBottom:20, fontWeight:700 }}>{editing?'Editar hotel':'Nuevo hotel'}</h3>
              <form onSubmit={handleSubmit}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  {[['Nombre','name','text',true],['Ciudad','city','text',true],['Dirección','address','text',false],['Precio/noche (MXN)','price_per_night','number',true],['Cuartos disponibles','rooms_available','number',false]].map(([lbl,key,type,req])=>(
                    <div key={key}>
                      <label style={{ display:'block', color:'#aaa', fontSize:13, marginBottom:6 }}>{lbl}</label>
                      <input type={type} required={req} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} style={inp} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display:'block', color:'#aaa', fontSize:13, marginBottom:6 }}>Estrellas</label>
                    <select value={form.stars} onChange={e=>setForm({...form,stars:e.target.value})} style={inp}>
                      {[1,2,3,4,5].map(n=><option key={n} value={n}>{n} ★</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginTop:14 }}>
                  <label style={{ display:'block', color:'#aaa', fontSize:13, marginBottom:6 }}>Descripción</label>
                  <input required value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={inp} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginTop:14 }}>
                  <div>
                    <label style={{ display:'block', color:'#aaa', fontSize:13, marginBottom:6 }}>Servicios (separados por coma)</label>
                    <input placeholder="WiFi, Alberca, Spa..." value={form.services} onChange={e=>setForm({...form,services:e.target.value})} style={inp} />
                  </div>
                  <div>
                    <label style={{ display:'block', color:'#aaa', fontSize:13, marginBottom:6 }}>URL de imagen</label>
                    <input placeholder="https://..." value={form.images} onChange={e=>setForm({...form,images:e.target.value})} style={inp} />
                  </div>
                </div>
                <div style={{ display:'flex', gap:12, marginTop:20 }}>
                  <button type="submit" style={{ background:'#f59e0b', color:'#000', border:'none', padding:'10px 22px', borderRadius:10, fontWeight:700, cursor:'pointer' }}>{editing?'Guardar cambios':'Crear hotel'}</button>
                  <button type="button" onClick={()=>{ setShowForm(false); setEditing(null); }} style={{ background:'transparent', border:'1px solid #333', color:'#ccc', padding:'10px 22px', borderRadius:10, cursor:'pointer' }}>Cancelar</button>
                </div>
              </form>
            </div>
          )}

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {hotels.map(h=>(
              <div key={h.id} style={{ background:'#111', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:16, display:'flex', alignItems:'center', gap:16 }}>
                <img src={h.images?.[0]||'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'} alt={h.name} onError={e=>e.target.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'} style={{ width:80, height:60, objectFit:'cover', borderRadius:10 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, marginBottom:4 }}>{h.name}</div>
                  <div style={{ color:'#888', fontSize:13 }}>📍 {h.location?.city} · {'★'.repeat(h.stars)} · ${h.price_per_night?.toLocaleString()}/noche · {h.rooms_available} cuartos</div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={()=>handleEdit(h)} style={{ background:'#1a1a1a', border:'1px solid #333', color:'#ccc', padding:'7px 14px', borderRadius:8, cursor:'pointer', fontSize:13 }}>✏️ Editar</button>
                  <button onClick={()=>handleDelete(h.id)} style={{ background:'#1a1a1a', border:'1px solid #ef4444', color:'#ef4444', padding:'7px 14px', borderRadius:8, cursor:'pointer', fontSize:13 }}>🗑 Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USERS */}
      {tab==='users' && (
        <div>
          <h2 style={{ fontSize:18, fontWeight:700, marginBottom:20 }}>Usuarios ({users.length})</h2>
          {users.length===0 ? <p style={{ color:'#666' }}>No hay usuarios registrados</p> : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {users.map(u=>(
                <div key={u.id} style={{ background:'#111', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontWeight:600, marginBottom:4 }}>{u.full_name}</div>
                    <div style={{ color:'#888', fontSize:13 }}>{u.email}{u.phone ? ` · ${u.phone}` : ''}</div>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <span style={{ background:u.role==='admin'?'rgba(245,158,11,0.15)':'rgba(96,165,250,0.15)', color:u.role==='admin'?'#f59e0b':'#60a5fa', padding:'3px 12px', borderRadius:20, fontSize:12, fontWeight:600 }}>{u.role}</span>
                    <span style={{ background:u.is_active?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.15)', color:u.is_active?'#10b981':'#ef4444', padding:'3px 12px', borderRadius:20, fontSize:12 }}>{u.is_active?'Activo':'Inactivo'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BOOKINGS */}
      {tab==='bookings' && (
        <div>
          <h2 style={{ fontSize:18, fontWeight:700, marginBottom:20 }}>Todas las reservas ({bookings.length})</h2>
          {bookings.length===0 ? <p style={{ color:'#666' }}>No hay reservas aún</p> : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {bookings.map(b=>(
                <div key={b.id} style={{ background:'#111', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontWeight:600, marginBottom:4 }}>{b.hotel_name}</div>
                    <div style={{ color:'#888', fontSize:13 }}>👤 Usuario #{b.user_id} · 📅 {b.check_in} → {b.check_out} · 👥 {b.guests} huéspedes</div>
                    <div style={{ color:'#555', fontSize:12, marginTop:4 }}>Reserva #{b.id} · {b.created_at ? new Date(b.created_at).toLocaleDateString('es-MX') : ''}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:18, fontWeight:700, color:'#f59e0b' }}>${b.total_price?.toLocaleString()}</div>
                    <span style={{ fontSize:12, padding:'3px 10px', borderRadius:20, background:b.status==='confirmed'?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.15)', color:b.status==='confirmed'?'#10b981':'#ef4444' }}>{b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
