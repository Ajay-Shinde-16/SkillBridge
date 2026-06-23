import React, { useState, useEffect, useRef } from 'react'
import { getMessageThread, sendMessage } from '../services/api'
import { useAuth } from '../context/AuthContext'

// Simple polling-based chat thread, scoped to one application.
// Embed this inside an application detail view for both the seeker and the employer side.
export default function MessageThread({ applicationId }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)
  const pollRef = useRef(null)

  const load = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const { data } = await getMessageThread(applicationId)
      setMessages(Array.isArray(data) ? data : [])
    } catch (e) {
      if (!silent) setError(typeof e.response?.data === 'string' ? e.response.data : 'Failed to load messages.')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    load()
    pollRef.current = setInterval(() => load(true), 10000) // poll every 10s for new messages
    return () => clearInterval(pollRef.current)
  }, [applicationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true); setError('')
    try {
      await sendMessage(applicationId, text.trim())
      setText('')
      await load(true)
    } catch (e) {
      setError(typeof e.response?.data === 'string' ? e.response.data : 'Failed to send message.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body p-3">
        <h6 className="fw-bold mb-3"><i className="bi bi-chat-dots-fill me-2" style={{color:'#0A66C2'}}></i>Messages</h6>

        <div style={{maxHeight:280, overflowY:'auto', marginBottom:12}}>
          {loading ? (
            <div className="text-center py-3"><div className="spinner-border spinner-border-sm" style={{color:'#0A66C2'}}></div></div>
          ) : messages.length === 0 ? (
            <p className="text-muted small text-center py-3 mb-0">No messages yet. Say hello 👋</p>
          ) : (
            messages.map(m => {
              const isMine = m.senderId === user?.id
              return (
                <div key={m.id} className={`d-flex mb-2 ${isMine ? 'justify-content-end' : 'justify-content-start'}`}>
                  <div style={{
                    maxWidth:'75%', padding:'8px 12px', borderRadius:14,
                    background: isMine ? '#0A66C2' : '#EEF3F8',
                    color: isMine ? '#fff' : '#222',
                    fontSize:'0.85rem'
                  }}>
                    {!isMine && <div className="fw-semibold small mb-1" style={{opacity:0.7}}>{m.senderName}</div>}
                    <div style={{whiteSpace:'pre-wrap'}}>{m.content}</div>
                    <div className="text-end" style={{fontSize:'0.65rem', opacity:0.6, marginTop:2}}>
                      {m.createdAt ? new Date(m.createdAt).toLocaleString('en-US',{hour:'2-digit',minute:'2-digit',month:'short',day:'numeric'}) : ''}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef}></div>
        </div>

        {error && <div className="alert alert-danger small py-2 mb-2">{error}</div>}

        <form onSubmit={handleSend} className="d-flex gap-2">
          <input
            className="form-control rounded-pill"
            placeholder="Type a message..."
            value={text}
            onChange={e => setText(e.target.value)}
            maxLength={2000}
            disabled={sending}
          />
          <button type="submit" className="btn rounded-circle flex-shrink-0"
            style={{width:42, height:42, background:'#0A66C2', color:'#fff', border:'none'}}
            disabled={sending || !text.trim()}>
            {sending ? <span className="spinner-border spinner-border-sm" style={{width:14,height:14}}></span> : <i className="bi bi-send-fill"></i>}
          </button>
        </form>
      </div>
    </div>
  )
}