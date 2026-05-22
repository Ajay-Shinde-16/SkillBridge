import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNotifications, markAllRead, markNotifRead, clearNotifications, getUnreadCount } from '../services/api'

const typeIcon = { APPLICATION:'bi-send', SHORTLIST:'bi-star-fill', INTERVIEW:'bi-camera-video', OFFER:'bi-trophy-fill', SYSTEM:'bi-info-circle' }
const typeColor = { APPLICATION:'#0A66C2', SHORTLIST:'#0ea5e9', INTERVIEW:'#d97706', OFFER:'#057642', SYSTEM:'#6c757d' }

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropRef = useRef(null)
  const navigate = useNavigate()

  const fetchCount = () => {
    getUnreadCount().then(({ data }) => setUnread(data.count)).catch(() => {})
  }

  const fetchAll = () => {
    setLoading(true)
    getNotifications()
      .then(({ data }) => { setNotifications(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchCount()
    const t = setInterval(fetchCount, 30000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleOpen = () => {
    setOpen(!open)
    if (!open) fetchAll()
  }

  const handleMarkRead = async () => {
    await markAllRead()
    setUnread(0)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleClear = async () => {
    await clearNotifications()
    setNotifications([])
    setUnread(0)
  }

  const handleNotifClick = async (notif) => {
    if (!notif.read) {
      await markNotifRead(notif.id)
      setNotifications(prev => prev.map(n => n.id===notif.id ? {...n,read:true} : n))
      setUnread(prev => Math.max(0, prev-1))
    }
    setOpen(false)
    if (notif.link) navigate(notif.link)
  }

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff/60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins/60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs/24)}d ago`
  }

  return (
    <div ref={dropRef} style={{position:'relative'}}>
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className="btn btn-sm d-flex align-items-center justify-content-center position-relative"
        style={{
          width:36, height:36, borderRadius:'50%',
          background: open ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)',
          border:'1.5px solid rgba(255,255,255,0.4)',
          color:'#fff', transition:'all 0.15s'
        }}>
        <i className="bi bi-bell-fill" style={{fontSize:'0.95rem'}}></i>
        {unread > 0 && (
          <span style={{
            position:'absolute', top:-4, right:-4,
            background:'#dc3545', color:'#fff',
            borderRadius:'50%', width:18, height:18,
            fontSize:'0.65rem', fontWeight:700,
            display:'flex', alignItems:'center', justifyContent:'center',
            border:'1.5px solid #0A66C2'
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position:'absolute', right:0, top:'calc(100% + 8px)',
          width:340, maxHeight:480,
          background:'#fff', borderRadius:12,
          boxShadow:'0 8px 32px rgba(0,0,0,0.15)',
          border:'1px solid #e2e8f0',
          zIndex:9999, overflow:'hidden',
          display:'flex', flexDirection:'column'
        }}>
          {/* Header */}
          <div style={{
            padding:'12px 16px', borderBottom:'1px solid #e2e8f0',
            display:'flex', alignItems:'center', justifyContent:'space-between'
          }}>
            <span style={{fontWeight:600, fontSize:'0.95rem'}}>
              <i className="bi bi-bell-fill me-2" style={{color:'#0A66C2'}}></i>
              Notifications
              {unread > 0 && (
                <span className="badge rounded-pill ms-2"
                  style={{background:'#dc3545',color:'#fff',fontSize:'0.68rem'}}>
                  {unread} new
                </span>
              )}
            </span>
            <div className="d-flex gap-1">
              {unread > 0 && (
                <button onClick={handleMarkRead}
                  style={{border:'none',background:'none',color:'#0A66C2',fontSize:'0.72rem',cursor:'pointer',fontWeight:500}}>
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={handleClear}
                  style={{border:'none',background:'none',color:'#dc3545',fontSize:'0.72rem',cursor:'pointer',fontWeight:500,marginLeft:8}}>
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div style={{overflowY:'auto', flex:1}}>
            {loading ? (
              <div style={{padding:32,textAlign:'center'}}>
                <div className="spinner-border spinner-border-sm" style={{color:'#0A66C2'}}></div>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{padding:32,textAlign:'center',color:'#adb5bd'}}>
                <i className="bi bi-bell-slash d-block mb-2" style={{fontSize:28}}></i>
                <div style={{fontSize:'0.85rem'}}>No notifications yet</div>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id}
                  onClick={() => handleNotifClick(n)}
                  style={{
                    padding:'12px 16px',
                    borderBottom:'1px solid #f3f2ef',
                    cursor:'pointer',
                    background: n.read ? '#fff' : '#EEF3F8',
                    display:'flex', gap:12, alignItems:'flex-start',
                    transition:'background 0.1s'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = n.read ? '#f8f9fa' : '#e4ecf7'}
                  onMouseOut={e => e.currentTarget.style.background = n.read ? '#fff' : '#EEF3F8'}>
                  {/* Icon */}
                  <div style={{
                    width:36, height:36, borderRadius:'50%', flexShrink:0,
                    background: (typeColor[n.type]||'#0A66C2') + '18',
                    display:'flex', alignItems:'center', justifyContent:'center'
                  }}>
                    <i className={`bi ${typeIcon[n.type]||'bi-info-circle'}`}
                      style={{color: typeColor[n.type]||'#0A66C2', fontSize:'0.9rem'}}></i>
                  </div>
                  {/* Content */}
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontWeight: n.read?500:700, fontSize:'0.85rem', color:'#191919', marginBottom:2}}>
                      {n.title}
                    </div>
                    <div style={{fontSize:'0.78rem',color:'#666',lineHeight:1.4, marginBottom:4}}>
                      {n.message}
                    </div>
                    <div style={{fontSize:'0.7rem',color:'#aaa'}}>
                      {n.createdAt ? timeAgo(n.createdAt) : ''}
                    </div>
                  </div>
                  {/* Unread dot */}
                  {!n.read && (
                    <div style={{width:8,height:8,borderRadius:'50%',background:'#0A66C2',flexShrink:0,marginTop:4}}></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
