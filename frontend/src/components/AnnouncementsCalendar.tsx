import React, { useState, useEffect } from 'react';
import { AnnouncementResponse, CompanyEventResponse } from '../types';
import { translations } from '../utils/i18n';

interface Props { tenantId: string; actorEmail: string; lang: 'id' | 'en'; theme: 'light' | 'dark'; }

const API = 'http://localhost:8020/api/v1/notifications';
const PRIORITY_COLOR: Record<string, string> = { INFO: '#3b82f6', WARNING: '#f59e0b', URGENT: '#ef4444' };
const EVENT_COLOR: Record<string, string> = { HOLIDAY: '#ef4444', MEETING: '#3b82f6', TRAINING: '#10b981', GATHERING: '#8b5cf6', OTHER: '#6b7280' };

export function AnnouncementsCalendar({ tenantId, actorEmail, lang }: Props) {
  const t = translations[lang];
  const isHR = /hrd|admin|owner|manager/.test(actorEmail);
  const hdrs = () => ({ 'X-Tenant-ID': tenantId, 'X-User-Email': actorEmail, Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

  const [tab, setTab] = useState<'announcements' | 'calendar'>('announcements');
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [events, setEvents] = useState<CompanyEventResponse[]>([]);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Announcement form
  const [showAForm, setShowAForm] = useState(false);
  const [aTitle, setATitle] = useState('');
  const [aContent, setAContent] = useState('');
  const [aPriority, setAPriority] = useState('INFO');
  const [aAudience, setAAudience] = useState('ALL');

  // Event form
  const [showEForm, setShowEForm] = useState(false);
  const [eTitle, setETitle] = useState('');
  const [eDesc, setEDesc] = useState('');
  const [eDate, setEDate] = useState('');
  const [eEndDate, setEEndDate] = useState('');
  const [eType, setEType] = useState('OTHER');
  const [eLoc, setELoc] = useState('');

  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => { fetchAnnouncements(); fetchEvents(); }, [tenantId]);

  async function fetchAnnouncements() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/announcements?status=PUBLISHED&size=50`, { headers: hdrs() });
      const d = await r.json();
      if (d.success) setAnnouncements((d.data?.content ?? d.data) || []);
    } catch { /* silent */ } finally { setLoading(false); }
  }

  async function fetchEvents() {
    try {
      const r = await fetch(`${API}/events?size=100`, { headers: hdrs() });
      const d = await r.json();
      if (d.success) setEvents((d.data?.content ?? d.data) || []);
    } catch { /* silent */ }
  }

  async function postAnnouncement(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const r = await fetch(`${API}/announcements`, { method: 'POST', headers: hdrs(), body: JSON.stringify({ title: aTitle, content: aContent, priority: aPriority, targetAudience: aAudience }) });
      const d = await r.json();
      if (d.success) { setSuccess(lang === 'id' ? 'Pengumuman berhasil diterbitkan!' : 'Announcement published!'); setShowAForm(false); setATitle(''); setAContent(''); fetchAnnouncements(); }
      else setError(d.message);
    } catch { setError('Connection error'); } finally { setLoading(false); }
  }

  async function postEvent(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const r = await fetch(`${API}/events`, { method: 'POST', headers: hdrs(), body: JSON.stringify({ title: eTitle, description: eDesc, eventDate: eDate, endDate: eEndDate || null, eventType: eType, location: eLoc }) });
      const d = await r.json();
      if (d.success) { setSuccess(lang === 'id' ? 'Agenda berhasil ditambahkan!' : 'Event added!'); setShowEForm(false); setETitle(''); setEDesc(''); setEDate(''); setEEndDate(''); setELoc(''); fetchEvents(); }
      else setError(d.message);
    } catch { setError('Connection error'); } finally { setLoading(false); }
  }

  async function archiveAnnouncement(id: number) {
    await fetch(`${API}/announcements/${id}/archive`, { method: 'PUT', headers: hdrs() });
    fetchAnnouncements();
  }

  async function deleteEvent(id: number) {
    await fetch(`${API}/events/${id}`, { method: 'DELETE', headers: hdrs() });
    fetchEvents();
  }

  // Calendar helpers
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDay   = new Date(calendarYear, calendarMonth, 1).getDay();
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthNamesFull = lang === 'id'
    ? ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
    : ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function eventsOnDay(day: number) {
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return events.filter(ev => ev.eventDate <= dateStr && (ev.endDate ? ev.endDate >= dateStr : ev.eventDate === dateStr));
  }

  const panel: React.CSSProperties = { background:'rgba(30,30,40,0.4)', borderRadius:16, border:'1px solid rgba(255,255,255,0.06)', padding:20 };
  const btn = (active=false, accent='var(--primary-color)'): React.CSSProperties => ({ padding:'8px 16px', borderRadius:8, border:'none', background: active ? accent : 'rgba(255,255,255,0.05)', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600, transition:'all .2s' });
  const input: React.CSSProperties = { width:'100%', padding:'10px 12px', borderRadius:8, background:'rgba(0,0,0,0.2)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontFamily:'inherit' };

  return (
    <div style={{ animation:'fadeIn .3s ease' }}>
      {/* Banner */}
      <div style={{ ...panel, marginBottom:24, background:'linear-gradient(135deg,rgba(139,92,246,.08),rgba(59,130,246,.05))' }}>
        <h2 style={{ fontSize:22, fontWeight:700, color:'var(--text-bright)', marginBottom:8, display:'flex', alignItems:'center', gap:10 }}>
          📢 {t.announcements}
        </h2>
        <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6, maxWidth:800 }}>{t.announcementsDesc}</p>
      </div>

      {/* Tab Bar */}
      <div style={{ display:'flex', gap:12, borderBottom:'1px solid rgba(255,255,255,0.08)', paddingBottom:12, marginBottom:20 }}>
        {(['announcements','calendar'] as const).map(k => (
          <button key={k} onClick={() => setTab(k)} style={btn(tab===k)}>
            {k === 'announcements' ? `📢 ${lang==='id'?'Pengumuman':'Announcements'}` : `📅 ${t.companyCalendar}`}
          </button>
        ))}
      </div>

      {/* Alerts */}
      {success && <div style={{ padding:'12px 16px', borderRadius:8, background:'rgba(16,185,129,.1)', border:'1px solid rgba(16,185,129,.2)', color:'#10b981', marginBottom:16, fontSize:13, display:'flex', justifyContent:'space-between' }}><span>✅ {success}</span><button onClick={()=>setSuccess('')} style={{ background:'none',border:'none',color:'#10b981',cursor:'pointer' }}>×</button></div>}
      {error   && <div style={{ padding:'12px 16px', borderRadius:8, background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.2)', color:'#ef4444', marginBottom:16, fontSize:13, display:'flex', justifyContent:'space-between' }}><span>❌ {error}</span><button onClick={()=>setError('')} style={{ background:'none',border:'none',color:'#ef4444',cursor:'pointer' }}>×</button></div>}

      {/* ── ANNOUNCEMENTS TAB ── */}
      {tab === 'announcements' && (
        <div>
          {isHR && (
            <button onClick={() => setShowAForm(!showAForm)} style={{ ...btn(), marginBottom:20, background:'var(--primary-color)' }}>
              ➕ {t.newAnnouncement}
            </button>
          )}

          {showAForm && (
            <form onSubmit={postAnnouncement} style={{ ...panel, maxWidth:600, marginBottom:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,.06)', paddingBottom:12, marginBottom:20 }}>
                <h3 style={{ fontSize:15, fontWeight:700, color:'#fff' }}>📢 {t.newAnnouncement}</h3>
                <button type="button" onClick={()=>setShowAForm(false)} style={{ background:'none',border:'none',color:'#fff',fontSize:20,cursor:'pointer' }}>×</button>
              </div>

              <label style={{ display:'block', fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>{t.announcementTitle} *</label>
              <input style={{ ...input, marginBottom:14 }} value={aTitle} onChange={e=>setATitle(e.target.value)} placeholder={lang==='id'?'Contoh: Libur Nasional Idul Fitri 2026':'E.g. Q3 All-Hands Meeting Schedule'} required />

              <label style={{ display:'block', fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>{t.announcementContent} *</label>
              <textarea style={{ ...input, marginBottom:14 }} rows={5} value={aContent} onChange={e=>setAContent(e.target.value)} placeholder={lang==='id'?'Tuliskan isi pengumuman secara lengkap...':'Write the full announcement body here...'} required />

              <div style={{ display:'flex', gap:16, marginBottom:20 }}>
                <div style={{ flex:1 }}>
                  <label style={{ display:'block', fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>{t.announcementPriority}</label>
                  <select style={input} value={aPriority} onChange={e=>setAPriority(e.target.value)}>
                    <option value="INFO">ℹ️ INFO</option>
                    <option value="WARNING">⚠️ WARNING</option>
                    <option value="URGENT">🚨 URGENT</option>
                  </select>
                </div>
                <div style={{ flex:1 }}>
                  <label style={{ display:'block', fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>{t.targetAudience}</label>
                  <select style={input} value={aAudience} onChange={e=>setAAudience(e.target.value)}>
                    <option value="ALL">{lang==='id'?'Semua Karyawan':'All Employees'}</option>
                    <option value="HR_ONLY">{lang==='id'?'Tim HR Saja':'HR Team Only'}</option>
                    <option value="MANAGER_ONLY">{lang==='id'?'Manajer Saja':'Managers Only'}</option>
                  </select>
                </div>
              </div>

              <button type="submit" style={{ width:'100%', padding:12, borderRadius:8, border:'none', background:'var(--primary-color)', color:'#fff', fontWeight:600, cursor:'pointer' }}>
                {loading ? '⏳ ...' : `🚀 ${lang==='id'?'Terbitkan':'Publish'}`}
              </button>
            </form>
          )}

          {/* Announcement Cards */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {announcements.length === 0 ? (
              <div style={{ ...panel, textAlign:'center', padding:40, color:'var(--text-muted)' }}>
                {lang==='id'?'Belum ada pengumuman aktif.':'No active announcements.'}
              </div>
            ) : announcements.map(a => (
              <div key={a.id} style={{ ...panel, borderLeft:`4px solid ${PRIORITY_COLOR[a.priority] ?? '#3b82f6'}`, cursor:'pointer', transition:'transform .15s' }}
                onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                      <span style={{ padding:'3px 8px', borderRadius:12, fontSize:10, fontWeight:700, background:`${PRIORITY_COLOR[a.priority]}25`, color:PRIORITY_COLOR[a.priority] }}>{a.priority}</span>
                      <span style={{ fontSize:10, color:'var(--text-muted)' }}>{new Date(a.createdAt).toLocaleDateString(lang==='id'?'id-ID':'en-US', { day:'numeric', month:'long', year:'numeric' })}</span>
                      {a.targetAudience !== 'ALL' && <span style={{ padding:'2px 6px', borderRadius:10, fontSize:10, background:'rgba(255,255,255,.06)', color:'var(--text-muted)' }}>{a.targetAudience}</span>}
                    </div>
                    <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-bright)', marginBottom:4 }}>{a.title}</h3>
                    <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6, display: expandedId === a.id ? 'block' : '-webkit-box', WebkitLineClamp: expandedId === a.id ? undefined : 2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{a.content}</p>
                  </div>
                  {isHR && (
                    <button onClick={e => { e.stopPropagation(); archiveAnnouncement(a.id); }}
                      style={{ padding:'6px 10px', borderRadius:6, border:'1px solid rgba(255,255,255,.1)', background:'none', color:'var(--text-muted)', fontSize:11, cursor:'pointer', flexShrink:0 }}>
                      🗄️ {lang==='id'?'Arsip':'Archive'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CALENDAR TAB ── */}
      {tab === 'calendar' && (
        <div>
          {isHR && (
            <button onClick={() => setShowEForm(!showEForm)} style={{ ...btn(), marginBottom:20, background:'var(--primary-color)' }}>
              ➕ {t.newEvent}
            </button>
          )}

          {showEForm && (
            <form onSubmit={postEvent} style={{ ...panel, maxWidth:600, marginBottom:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,.06)', paddingBottom:12, marginBottom:20 }}>
                <h3 style={{ fontSize:15, fontWeight:700, color:'#fff' }}>📅 {t.newEvent}</h3>
                <button type="button" onClick={()=>setShowEForm(false)} style={{ background:'none',border:'none',color:'#fff',fontSize:20,cursor:'pointer' }}>×</button>
              </div>

              <label style={{ display:'block', fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>{t.eventTitle} *</label>
              <input style={{ ...input, marginBottom:14 }} value={eTitle} onChange={e=>setETitle(e.target.value)} required />

              <label style={{ display:'block', fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>{lang==='id'?'Deskripsi':'Description'}</label>
              <textarea style={{ ...input, marginBottom:14 }} rows={3} value={eDesc} onChange={e=>setEDesc(e.target.value)} />

              <div style={{ display:'flex', gap:16, marginBottom:14 }}>
                <div style={{ flex:1 }}>
                  <label style={{ display:'block', fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>{t.eventDate} *</label>
                  <input type="date" style={input} value={eDate} onChange={e=>setEDate(e.target.value)} required />
                </div>
                <div style={{ flex:1 }}>
                  <label style={{ display:'block', fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>{t.eventEndDate}</label>
                  <input type="date" style={input} value={eEndDate} onChange={e=>setEEndDate(e.target.value)} />
                </div>
              </div>

              <div style={{ display:'flex', gap:16, marginBottom:20 }}>
                <div style={{ flex:1 }}>
                  <label style={{ display:'block', fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>{t.eventType}</label>
                  <select style={input} value={eType} onChange={e=>setEType(e.target.value)}>
                    <option value="HOLIDAY">{lang==='id'?'Hari Libur':'Holiday'}</option>
                    <option value="MEETING">{lang==='id'?'Rapat':'Meeting'}</option>
                    <option value="TRAINING">{lang==='id'?'Pelatihan':'Training'}</option>
                    <option value="GATHERING">{lang==='id'?'Gathering':'Gathering'}</option>
                    <option value="OTHER">{lang==='id'?'Lainnya':'Other'}</option>
                  </select>
                </div>
                <div style={{ flex:1 }}>
                  <label style={{ display:'block', fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>{t.eventLocation}</label>
                  <input style={input} value={eLoc} onChange={e=>setELoc(e.target.value)} />
                </div>
              </div>

              <button type="submit" style={{ width:'100%', padding:12, borderRadius:8, border:'none', background:'var(--primary-color)', color:'#fff', fontWeight:600, cursor:'pointer' }}>
                {loading ? '⏳ ...' : `💾 ${lang==='id'?'Simpan Agenda':'Save Event'}`}
              </button>
            </form>
          )}

          {/* Calendar Grid */}
          <div style={{ ...panel, marginBottom:20 }}>
            {/* Month Navigator */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <button onClick={() => { const d = new Date(calendarYear, calendarMonth - 1); setCalendarYear(d.getFullYear()); setCalendarMonth(d.getMonth()); }} style={{ ...btn(), padding:'6px 12px' }}>‹</button>
              <h3 style={{ fontSize:18, fontWeight:700, color:'var(--text-bright)' }}>{monthNamesFull[calendarMonth]} {calendarYear}</h3>
              <button onClick={() => { const d = new Date(calendarYear, calendarMonth + 1); setCalendarYear(d.getFullYear()); setCalendarMonth(d.getMonth()); }} style={{ ...btn(), padding:'6px 12px' }}>›</button>
            </div>

            {/* Day Headers */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:4, marginBottom:8 }}>
              {(lang==='id' ? ['Min','Sen','Sel','Rab','Kam','Jum','Sab'] : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']).map(d => (
                <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:700, color:'var(--text-muted)', padding:'4px 0' }}>{d}</div>
              ))}
            </div>

            {/* Calendar Days */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:4 }}>
              {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const dayEvents = eventsOnDay(day);
                const today = new Date();
                const isToday = today.getFullYear() === calendarYear && today.getMonth() === calendarMonth && today.getDate() === day;
                return (
                  <div key={day} style={{ minHeight:64, padding:'6px 8px', borderRadius:8, background: isToday ? 'rgba(139,92,246,.15)' : 'rgba(255,255,255,.02)', border:`1px solid ${isToday ? 'rgba(139,92,246,.4)' : 'rgba(255,255,255,.05)'}`, position:'relative' }}>
                    <span style={{ fontSize:12, fontWeight: isToday ? 700 : 400, color: isToday ? '#8b5cf6' : 'var(--text-bright)' }}>{day}</span>
                    <div style={{ marginTop:4, display:'flex', flexDirection:'column', gap:2 }}>
                      {dayEvents.slice(0,2).map(ev => (
                        <span key={ev.id} style={{ fontSize:9, padding:'1px 4px', borderRadius:4, background:`${EVENT_COLOR[ev.eventType] ?? '#6b7280'}30`, color: EVENT_COLOR[ev.eventType] ?? '#6b7280', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {ev.title}
                        </span>
                      ))}
                      {dayEvents.length > 2 && <span style={{ fontSize:9, color:'var(--text-muted)' }}>+{dayEvents.length - 2}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Events List */}
          <div style={{ ...panel }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:'var(--text-bright)', marginBottom:16 }}>
              📋 {lang==='id'?'Daftar Semua Kegiatan':'All Scheduled Events'}
            </h3>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {events.length === 0 ? (
                <p style={{ color:'var(--text-muted)', fontSize:13, textAlign:'center', padding:24 }}>{lang==='id'?'Belum ada agenda.':'No events scheduled.'}</p>
              ) : events.map(ev => (
                <div key={ev.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', borderRadius:10, background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.05)' }}>
                  <div style={{ width:42, height:42, borderRadius:10, background:`${EVENT_COLOR[ev.eventType] ?? '#6b7280'}20`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:18 }}>{ev.eventType==='HOLIDAY'?'🏖️':ev.eventType==='MEETING'?'🤝':ev.eventType==='TRAINING'?'📚':ev.eventType==='GATHERING'?'🎉':'📌'}</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:700, color:'var(--text-bright)', marginBottom:2, fontSize:14 }}>{ev.title}</p>
                    <p style={{ color:'var(--text-muted)', fontSize:12 }}>
                      {new Date(ev.eventDate).toLocaleDateString(lang==='id'?'id-ID':'en-US', { day:'numeric', month:'short', year:'numeric' })}
                      {ev.endDate && ev.endDate !== ev.eventDate && ` — ${new Date(ev.endDate).toLocaleDateString(lang==='id'?'id-ID':'en-US', { day:'numeric', month:'short', year:'numeric' })}`}
                      {ev.location && ` · 📍 ${ev.location}`}
                    </p>
                  </div>
                  <span style={{ padding:'3px 8px', borderRadius:12, fontSize:10, fontWeight:700, background:`${EVENT_COLOR[ev.eventType] ?? '#6b7280'}25`, color: EVENT_COLOR[ev.eventType] ?? '#6b7280' }}>{ev.eventType}</span>
                  {isHR && <button onClick={() => deleteEvent(ev.id)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:16 }}>🗑️</button>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
