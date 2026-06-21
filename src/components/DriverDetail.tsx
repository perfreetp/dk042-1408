import { useState, useEffect, useRef, useMemo } from 'react'
import { Driver, DriverPerformance, Route, Anomaly, AnomalyType } from '../types'
import { ANOMALY_LABELS, ANOMALY_COLORS, SEVERITY_LABELS } from '../data/mockData'

interface DriverDetailProps {
  driver: Driver
  performance: DriverPerformance
  route: Route
  onBack: () => void
  onOpenInterview: () => void
}

const ANOMALY_ICONS: Record<AnomalyType, string> = {
  early_arrival: '⏰',
  late_arrival: '⏱️',
  route_deviation: '🗺️',
  sudden_brake: '🛑',
  sudden_turn: '↩️',
  gps_blank: '📡',
  overspeed: '⚡'
}

function DriverDetail({ driver, performance, route, onBack, onOpenInterview }: DriverDetailProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [playSpeed, setPlaySpeed] = useState(1)
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0)
  const [activeAnomalyId, setActiveAnomalyId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<AnomalyType | 'all'>('all')
  const [selectedTrainingIds, setSelectedTrainingIds] = useState<Set<string>>(new Set())
  const playIntervalRef = useRef<number | null>(null)

  const tracePoints = performance.trace

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = window.setInterval(() => {
        setCurrentTimeIndex(prev => {
          if (prev >= tracePoints.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 800 / playSpeed)
    } else if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current)
      playIntervalRef.current = null
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current)
    }
  }, [isPlaying, playSpeed, tracePoints.length])

  const currentPoint = tracePoints[currentTimeIndex]
  const progressPercent = ((currentTimeIndex + 1) / tracePoints.length) * 100

  const pathD = useMemo(() => {
    if (route.path.length === 0) return ''
    return route.path.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  }, [route.path])

  const tracedPathD = useMemo(() => {
    if (!currentPoint) return ''
    const pts = tracePoints.slice(0, currentTimeIndex + 1)
    if (pts.length === 0) return ''
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.position.x} ${p.position.y}`).join(' ')
  }, [tracePoints, currentTimeIndex, currentPoint])

  const filteredAnomalies = useMemo(() => {
    if (activeFilter === 'all') return performance.anomalies
    return performance.anomalies.filter(a => a.type === activeFilter)
  }, [performance.anomalies, activeFilter])

  const anomalyTypeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: performance.anomalies.length }
    performance.anomalies.forEach(a => {
      counts[a.type] = (counts[a.type] || 0) + 1
    })
    return counts
  }, [performance.anomalies])

  const handleAnomalyClick = (anomaly: Anomaly) => {
    setActiveAnomalyId(anomaly.id)
    const nearestIdx = tracePoints.findIndex(p => {
      const dx = p.position.x - anomaly.position.x
      const dy = p.position.y - anomaly.position.y
      return Math.sqrt(dx * dx + dy * dy) < 80
    })
    if (nearestIdx >= 0) {
      setCurrentTimeIndex(nearestIdx)
      setIsPlaying(false)
    }
  }

  const toggleTrainingSelect = (anomalyId: string) => {
    setSelectedTrainingIds(prev => {
      const next = new Set(prev)
      if (next.has(anomalyId)) next.delete(anomalyId)
      else next.add(anomalyId)
      return next
    })
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    const idx = Math.floor(pct * (tracePoints.length - 1))
    setCurrentTimeIndex(Math.max(0, Math.min(tracePoints.length - 1, idx)))
  }

  return (
    <div className="detail-page">
      <div className="detail-header">
        <div className="detail-header-left">
          <button className="back-btn" onClick={onBack}>
            ← 返回列表
          </button>
          <div className="driver-profile">
            <div className="driver-avatar-lg">{driver.name.charAt(0)}</div>
            <div className="driver-profile-info">
              <h2>{driver.name}</h2>
              <p>
                工号 {driver.employeeId} · {route.name} · 入职 {driver.hireDate}
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-secondary"
            onClick={() => {
              const severe = performance.anomalies.filter(a => a.severity === 'high')
              setSelectedTrainingIds(new Set(severe.map(a => a.id)))
            }}
          >
            ☑ 选中高危项
          </button>
          <button
            className="btn btn-primary"
            onClick={onOpenInterview}
            disabled={selectedTrainingIds.size === 0}
            style={selectedTrainingIds.size === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            📝 生成面谈记录 {selectedTrainingIds.size > 0 && `(${selectedTrainingIds.size})`}
          </button>
        </div>
      </div>

      <div className="detail-body">
        <div className="trace-panel">
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 20 }}>
            <div className="summary-item" style={{ flex: 1, padding: 0, border: 'none', background: 'transparent' }}>
              <div className="summary-label">本周准点率</div>
              <div className="summary-value">
                {performance.onTimeRate}<span className="sub">%</span>
              </div>
            </div>
            <div className="summary-item" style={{ flex: 1, padding: 0, border: 'none', background: 'transparent' }}>
              <div className="summary-label">异常事件</div>
              <div className="summary-value">
                {performance.anomalies.length}<span className="sub">起</span>
              </div>
            </div>
            <div className="summary-item" style={{ flex: 1, padding: 0, border: 'none', background: 'transparent' }}>
              <div className="summary-label">急停/急转弯</div>
              <div className="summary-value">
                {performance.suddenBrakeCount + performance.suddenTurnCount}<span className="sub">次</span>
              </div>
            </div>
            <div className="summary-item" style={{ flex: 1, padding: 0, border: 'none', background: 'transparent' }}>
              <div className="summary-label">GPS空白</div>
              <div className="summary-value">
                {performance.gpsBlankMinutes}<span className="sub">分钟</span>
              </div>
            </div>
          </div>

          <div className="trace-map-wrap">
            <svg className="trace-svg" viewBox="0 0 840 600" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="tracedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <path
                d={pathD}
                stroke="url(#routeGradient)"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="2 8"
              />

              <path
                d={tracedPathD}
                stroke="url(#tracedGradient)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {route.stops.map((stop, idx) => (
                <g key={stop.id} className="stop-marker">
                  <circle
                    cx={stop.position.x}
                    cy={stop.position.y}
                    r="12"
                    fill="#0f172a"
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                  <text
                    x={stop.position.x}
                    y={stop.position.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#3b82f6"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {idx + 1}
                  </text>
                  <rect
                    x={stop.position.x - 60}
                    y={stop.position.y - 38}
                    width="120"
                    height="22"
                    rx="4"
                    fill="#1e293b"
                    stroke="#334155"
                  />
                  <text
                    x={stop.position.x}
                    y={stop.position.y - 23}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="10"
                  >
                    {stop.scheduledTime} · {stop.name.replace('站', '')}
                  </text>
                </g>
              ))}

              {performance.anomalies.map(a => (
                <g
                  key={a.id}
                  className="map-marker"
                  onClick={() => handleAnomalyClick(a)}
                  style={{ filter: activeAnomalyId === a.id ? 'url(#glow)' : undefined }}
                >
                  <circle
                    cx={a.position.x}
                    cy={a.position.y}
                    r={activeAnomalyId === a.id ? 14 : 10}
                    fill={ANOMALY_COLORS[a.type]}
                    stroke="#fff"
                    strokeWidth={activeAnomalyId === a.id ? 3 : 2}
                    opacity={activeFilter === 'all' || activeFilter === a.type ? 1 : 0.2}
                  />
                  <text
                    x={a.position.x}
                    y={a.position.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={activeAnomalyId === a.id ? 12 : 9}
                  >
                    {ANOMALY_ICONS[a.type]}
                  </text>
                </g>
              ))}

              {currentPoint && (
                <g className="bus-marker">
                  <circle
                    cx={currentPoint.position.x}
                    cy={currentPoint.position.y}
                    r="16"
                    fill="#3b82f6"
                    stroke="#fff"
                    strokeWidth="3"
                    opacity="0.3"
                  />
                  <circle
                    cx={currentPoint.position.x}
                    cy={currentPoint.position.y}
                    r="10"
                    fill="#3b82f6"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <text
                    x={currentPoint.position.x}
                    y={currentPoint.position.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="11"
                  >
                    🚌
                  </text>
                  <rect
                    x={currentPoint.position.x + 18}
                    y={currentPoint.position.y - 28}
                    width="80"
                    height="24"
                    rx="4"
                    fill="#1e293b"
                    stroke="#3b82f6"
                  />
                  <text x={currentPoint.position.x + 26} y={currentPoint.position.y - 13} fill="#f8fafc" fontSize="11" fontWeight="500">
                    {currentPoint.time}
                  </text>
                  <text x={currentPoint.position.x + 26} y={currentPoint.position.y - 2} fill="#94a3b8" fontSize="10">
                    {currentPoint.speed.toFixed(0)} km/h
                  </text>
                </g>
              )}
            </svg>
          </div>

          <div className="trace-controls">
            <button
              className="play-btn"
              onClick={() => {
                if (currentTimeIndex >= tracePoints.length - 1) setCurrentTimeIndex(0)
                setIsPlaying(!isPlaying)
              }}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            <div className="progress-container">
              <div className="progress-track" onClick={handleProgressClick}>
                <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                <div className="progress-markers">
                  {performance.anomalies.map(a => {
                    const nearestIdx = tracePoints.findIndex(p => {
                      const dx = p.position.x - a.position.x
                      const dy = p.position.y - a.position.y
                      return Math.sqrt(dx * dx + dy * dy) < 80
                    })
                    if (nearestIdx < 0) return null
                    const left = ((nearestIdx + 1) / tracePoints.length) * 100
                    return (
                      <div
                        key={a.id}
                        className="progress-marker"
                        style={{
                          left: `${left}%`,
                          background: ANOMALY_COLORS[a.type],
                          height: activeAnomalyId === a.id ? 18 : 14,
                          top: activeAnomalyId === a.id ? -6 : -4
                        }}
                      />
                    )
                  })}
                </div>
              </div>
              <div className="progress-labels">
                <span>{tracePoints[0]?.time || '--:--'}</span>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                  {currentPoint?.time || '--:--'}
                </span>
                <span>{tracePoints[tracePoints.length - 1]?.time || '--:--'}</span>
              </div>
            </div>

            <div className="speed-control">
              <label>倍速</label>
              <select
                value={playSpeed}
                onChange={e => setPlaySpeed(Number(e.target.value))}
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={4}>4x</option>
              </select>
            </div>
          </div>
        </div>

        <div className="anomaly-panel">
          <div className="anomaly-header">
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>异常事件清单</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                共 {performance.anomalies.length} 起，已选 {selectedTrainingIds.size} 起需培训
              </div>
            </div>
          </div>

          <div className="anomaly-filter">
            <button
              className={`filter-chip ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              全部 {anomalyTypeCounts.all}
            </button>
            {Object.entries(ANOMALY_LABELS).map(([type, label]) => {
              const t = type as AnomalyType
              if (!anomalyTypeCounts[t]) return null
              return (
                <button
                  key={type}
                  className={`filter-chip ${activeFilter === type ? 'active' : ''}`}
                  onClick={() => setActiveFilter(t)}
                  style={activeFilter === type ? { borderColor: ANOMALY_COLORS[t], color: ANOMALY_COLORS[t], background: `${ANOMALY_COLORS[t]}20` } : {}}
                >
                  {ANOMALY_ICONS[t]} {label} {anomalyTypeCounts[t]}
                </button>
              )
            })}
          </div>

          <div className="anomaly-list">
            {filteredAnomalies.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">✅</div>
                <div className="empty-state-text">该类型暂无异常记录</div>
              </div>
            ) : (
              filteredAnomalies.map(anomaly => (
                <div
                  key={anomaly.id}
                  className={`anomaly-item ${activeAnomalyId === anomaly.id ? 'active' : ''}`}
                  onClick={() => handleAnomalyClick(anomaly)}
                >
                  <div className="anomaly-item-header">
                    <div className="anomaly-type">
                      <div
                        className="anomaly-type-icon"
                        style={{ background: `${ANOMALY_COLORS[anomaly.type]}25`, color: ANOMALY_COLORS[anomaly.type] }}
                      >
                        {ANOMALY_ICONS[anomaly.type]}
                      </div>
                      <div>
                        <div className="anomaly-type-name" style={{ color: ANOMALY_COLORS[anomaly.type] }}>
                          {ANOMALY_LABELS[anomaly.type]}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          {anomaly.locationName}
                          <span style={{ margin: '0 6px' }}>·</span>
                          <span className={`badge ${anomaly.severity === 'high' ? 'badge-red' : anomaly.severity === 'medium' ? 'badge-yellow' : 'badge-gray'}`} style={{ padding: '1px 6px', fontSize: 10 }}>
                            {SEVERITY_LABELS[anomaly.severity]}风险
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`anomaly-checkbox ${selectedTrainingIds.has(anomaly.id) ? 'checked' : ''}`}
                      onClick={e => { e.stopPropagation(); toggleTrainingSelect(anomaly.id) }}
                    >
                      {selectedTrainingIds.has(anomaly.id) && '✓'}
                    </div>
                  </div>

                  <div className="anomaly-time">
                    📅 {anomaly.date.replace(/-/g, '/')} · 🕐 {anomaly.time}
                  </div>

                  <div className="anomaly-desc">{anomaly.description}</div>

                  {anomaly.details && activeAnomalyId === anomaly.id && (
                    <div className="anomaly-details">
                      {Object.entries(anomaly.details).map(([k, v]) => (
                        <div key={k} className="detail-item">
                          <div className="detail-label">
                            {k === 'scheduledTime' ? '计划到站' :
                             k === 'actualTime' ? '实际到站' :
                             k === 'waitTimeDiff' ? '候车时间差' :
                             k === 'studentCount' ? '涉及学生数' :
                             k === 'deviationDistance' ? '偏离距离' :
                             k === 'duration' ? '持续时间' :
                             k === 'deceleration' ? '减速度' :
                             k === 'speedBefore' ? '刹车前速度' :
                             k === 'speedAfter' ? '刹车后速度' :
                             k === 'lateralAcceleration' ? '横向加速度' :
                             k === 'speed' ? '当前速度' :
                             k === 'blankDuration' ? '空白时长' :
                             k === 'segment' ? '涉及路段' : k}
                          </div>
                          <div className="detail-value">{String(v)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DriverDetail
