import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

// Color theme per page - rings change color based on page
function getColors(pathname) {
  if (pathname === '/') return ['#123160','#7C3AED','#14B8A6','#06b6d4','#123160','#a855f7']
  if (pathname.includes('/career-room')) return ['#22c55e','#123160','#a855f7','#06b6d4','#f59e0b','#ec4899']
  if (pathname.includes('/jobs')) return ['#14B8A6','#123160','#06b6d4','#123160','#22c55e','#7C3AED']
  if (pathname.includes('/seeker')) return ['#22c55e','#123160','#14B8A6','#06b6d4','#a855f7','#123160']
  if (pathname.includes('/employer')) return ['#f59e0b','#123160','#7C3AED','#14B8A6','#ec4899','#06b6d4']
  if (pathname.includes('/admin')) return ['#8b5cf6','#123160','#14B8A6','#a855f7','#06b6d4','#22c55e']
  if (pathname.includes('/login') || pathname.includes('/register') || pathname.includes('password'))
    return ['#123160','#7C3AED','#06b6d4','#14B8A6','#a855f7','#123160']
  return ['#123160','#7C3AED','#14B8A6','#06b6d4','#123160','#a855f7']
}

// ── NEON RINGS CANVAS — on every page ──
function NeonRingsCanvas({ colors }) {
  const ref = useRef()
  const colorsRef = useRef(colors)
  useEffect(() => { colorsRef.current = colors }, [colors])

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    let raf
    const resize = () => {
      c.width = window.innerWidth
      c.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Create rings spread all over the screen
    const makeRing = (i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 2 + Math.random() * 12,
      maxR: 40 + Math.random() * 120,
      speed: 0.25 + Math.random() * 0.55,
      colorIdx: i % colorsRef.current.length,
      opacity: 1,
      lineWidth: 0.8 + Math.random() * 1.2,
    })

    const rings = Array.from({ length: 18 }, (_, i) => makeRing(i))

    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height)
      rings.forEach((rg, i) => {
        rg.r += rg.speed
        rg.opacity = 0.85 * (1 - rg.r / rg.maxR)

        if (rg.r > rg.maxR) {
          // reset ring at random position
          const fresh = makeRing(i)
          fresh.x = Math.random() * c.width
          fresh.y = Math.random() * c.height
          Object.assign(rg, fresh)
          return
        }

        const color = colorsRef.current[rg.colorIdx % colorsRef.current.length]
        const alpha = Math.max(0, rg.opacity)
        const hex = Math.round(alpha * 255).toString(16).padStart(2, '0')

        // Outer ring
        ctx.beginPath()
        ctx.arc(rg.x, rg.y, rg.r, 0, Math.PI * 2)
        ctx.strokeStyle = color + hex
        ctx.lineWidth = rg.lineWidth
        ctx.stroke()

        // Inner glow dot
        if (rg.r < 12) {
          ctx.beginPath()
          ctx.arc(rg.x, rg.y, 2.5, 0, Math.PI * 2)
          ctx.fillStyle = color + hex
          ctx.fill()
        }
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, []) // only mount once — colors update via ref

  return (
    <canvas
      ref={ref}
      style={{
        position: 'fixed', inset: 0,
        zIndex: 0, pointerEvents: 'none',
        opacity: 0.75,
      }}
    />
  )
}

export default function StandoutAnimations() {
  const { pathname } = useLocation()
  const colors = getColors(pathname)
  const [scrollPct, setScrollPct] = useState(0)
  const [showTop, setShowTop] = useState(false)
  const [mouse, setMouse] = useState({ x: -999, y: -999 })

  useEffect(() => {
    const onScroll = () => {
      const t = window.scrollY
      const h = document.documentElement.scrollHeight - window.innerHeight
      setScrollPct(h > 0 ? (t / h) * 100 : 0)
      setShowTop(t > 300)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onMove = e => setMouse({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const mainColor = colors[0]

  return (
    <>
      {/* Scroll progress bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, zIndex: 9999,
        width: `${scrollPct}%`, height: 3, pointerEvents: 'none',
        background: `linear-gradient(90deg, ${mainColor}, ${colors[2]})`,
        borderRadius: '0 3px 3px 0',
        transition: 'width 0.1s linear',
      }} />

      {/* Mouse glow */}
      <div style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 0,
        left: mouse.x, top: mouse.y,
        width: 320, height: 320,
        transform: 'translate(-50%,-50%)',
        background: `radial-gradient(circle, ${mainColor}15, transparent 65%)`,
        filter: 'blur(10px)',
        transition: 'left 0.06s linear, top 0.06s linear',
      }} />

      {/* NEON RINGS — on every single page */}
      <NeonRingsCanvas colors={colors} />

      {/* Back to top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Back to top"
          style={{
            position: 'fixed', bottom: 76, right: 18,
            width: 46, height: 46, borderRadius: '50%',
            background: `linear-gradient(135deg, ${mainColor}, ${colors[2]})`,
            color: '#fff', border: 'none', cursor: 'pointer',
            zIndex: 9997, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 22,
            boxShadow: `0 4px 20px ${mainColor}55`,
            animation: 'sbFadeInUp 0.3s ease',
            transition: 'transform 0.2s ease',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px) scale(1.12)'}
          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
        >
          <i className="bi bi-arrow-up-short"></i>
        </button>
      )}
    </>
  )
}