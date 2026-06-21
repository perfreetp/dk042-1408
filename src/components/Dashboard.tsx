import { useMemo, useState } from 'react'
import { Driver, DriverPerformance, DriverRiskProfile, Fleet, Route } from '../types'
import { ANOMALY_LABELS } from '../data/mockData'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts'

interface DashboardProps {
  weekLabel: string
  weekStart: string
  weekEnd: string
  drivers: Driver[]
  allDrivers: Driver[]
  fleets: Fleet[]
  routes: Route[]
  performanceData: Record<string, DriverPerformance>
  selectedFleetId: string | null
  selectedRouteId: string | null
  onSelectDriver: (id: string) => void
  onClearFleet: () => void
  onClearRoute: () => void
  onOpenInterview: (driverId: string) => void
  riskProfiles?: DriverRiskProfile[]
}

function getRateClass(rate: number) {
  if (rate >= 93) return 'good'
  if (rate >= 85) return 'warn'
  return 'bad'
}

function Dashboard({
  weekLabel,
  drivers,
  allDrivers,
  fleets,
  routes,
  performanceData,
  selectedFleetId,
  selectedRouteId,
  onSelectDriver,
  onClearFleet,
  onClearRoute,
  onOpenInterview,
  riskProfiles = []
}: DashboardProps) {
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table')

  const aggregateStats = useMemo(() => {
    const list = drivers.length > 0 ? drivers : allDrivers
    const perfs = list.map(d => performanceData[d.id]).filter(Boolean)
    if (perfs.length === 0) {
      return {
        avgOnTime: 0,
        totalDeviations: 0,
        totalSudden: 0,
        totalGpsBlank: 0,
        totalAnomalies: 0,
        driverCount: 0
      }
    }
    return {
      avgOnTime: Math.round(perfs.reduce((s, p) => s + p.onTimeRate, 0) / perfs.length),
      totalDeviations: perfs.reduce((s, p) => s + p.deviationCount, 0),
      totalSudden: perfs.reduce((s, p) => s + p.suddenBrakeCount + p.suddenTurnCount, 0),
      totalGpsBlank: perfs.reduce((s, p) => s + p.gpsBlankMinutes, 0),
      totalAnomalies: perfs.reduce((s, p) => s + p.anomalies.length, 0),
      driverCount: perfs.length
    }
  }, [drivers, allDrivers, performanceData])

  const trendData = useMemo(() => {
    const list = drivers.length > 0 ? drivers : allDrivers
    const perfs = list.map(d => performanceData[d.id]).filter(Boolean)
    if (perfs.length === 0) return []

    const dateMap: Record<string, { onTime: number[]; anomalies: number[] }> = {}
    perfs.forEach(p => {
      p.dailyStats.forEach(d => {
        if (!dateMap[d.date]) dateMap[d.date] = { onTime: [], anomalies: [] }
        dateMap[d.date].onTime.push(d.onTimeRate)
        dateMap[d.date].anomalies.push(d.anomalyCount)
      })
    })

    return Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => {
        const d = new Date(date)
        const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        return {
          date: labels[(d.getDay() + 6) % 7],
          onTime: Math.round(v.onTime.reduce((a, b) => a + b, 0) / v.onTime.length),
          anomalies: v.anomalies.reduce((a, b) => a + b, 0)
        }
      })
  }, [drivers, allDrivers, performanceData])

  const anomalyTypeStats = useMemo(() => {
    const list = drivers.length > 0 ? drivers : allDrivers
    const perfs = list.map(d => performanceData[d.id]).filter(Boolean)
    const typeMap: Record<string, number> = {}
    perfs.forEach(p => {
      p.anomalies.forEach(a => {
        typeMap[a.type] = (typeMap[a.type] || 0) + 1
      })
    })
    return Object.entries(typeMap)
      .map(([type, count]) => ({
        type: ANOMALY_LABELS[type as keyof typeof ANOMALY_LABELS] || type,
        count
      }))
      .sort((a, b) => b.count - a.count)
  }, [drivers, allDrivers, performanceData])

  const headerTitle = useMemo(() => {
    if (selectedRouteId) {
      const r = routes.find((x: Route) => x.id === selectedRouteId)
      return r?.name || '线路复盘'
    }
    if (selectedFleetId) {
      const f = fleets.find((x: Fleet) => x.id === selectedFleetId)
      return f?.name || '车队复盘'
    }
    return '全车队运营复盘'
  }, [selectedFleetId, selectedRouteId, fleets, routes])

  const headerSubtitle = useMemo(() => {
    const parts = [`本周 ${weekLabel}`]
    if (aggregateStats.driverCount > 0) {
      parts.push(`${aggregateStats.driverCount} 名驾驶员`, `${aggregateStats.totalAnomalies} 起异常`)
    }
    return parts.join(' · ')
  }, [weekLabel, aggregateStats])

  return (
    <div>
      <div className="content-header">
        <div>
          <div className="content-title">{headerTitle}</div>
          <div className="content-subtitle">{headerSubtitle}</div>
          {(selectedFleetId || selectedRouteId) && (
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              {selectedFleetId && (
                <button className="filter-chip active" onClick={onClearFleet}>
                  ✕ 清除车队筛选
                </button>
              )}
              {selectedRouteId && (
                <button className="filter-chip active" onClick={onClearRoute}>
                  ✕ 清除线路筛选
                </button>
              )}
            </div>
          )}
        </div>
        <div className="content-actions">
          <button className="btn btn-outline" onClick={() => window.print()}>
            📄 导出复盘报告
          </button>
        </div>
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">平均准点率</span>
            <div className="stat-icon blue">⏱️</div>
          </div>
          <div className="stat-value">
            {aggregateStats.avgOnTime}<span className="unit">%</span>
          </div>
          <div className={`stat-change ${aggregateStats.avgOnTime >= 90 ? 'up' : 'down'}`}>
            {aggregateStats.avgOnTime >= 90 ? '↑' : '↓'} 较上周 {aggregateStats.avgOnTime >= 90 ? '提升' : '下降'} 2.3%
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">线路偏离次数</span>
            <div className="stat-icon purple">🗺️</div>
          </div>
          <div className="stat-value">
            {aggregateStats.totalDeviations}<span className="unit">次</span>
          </div>
          <div className="stat-change down">
            ↑ 较上周增加 3 次
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">急停/急转弯</span>
            <div className="stat-icon orange">⚠️</div>
          </div>
          <div className="stat-value">
            {aggregateStats.totalSudden}<span className="unit">次</span>
          </div>
          <div className="stat-change down">
            ↑ 较上周增加 5 次
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">GPS 空白累计</span>
            <div className="stat-icon red">📡</div>
          </div>
          <div className="stat-value">
            {aggregateStats.totalGpsBlank}<span className="unit">分钟</span>
          </div>
          <div className={`stat-change ${aggregateStats.totalGpsBlank < 120 ? 'up' : 'down'}`}>
            {aggregateStats.totalGpsBlank < 120 ? '↓' : '↑'} {aggregateStats.totalGpsBlank < 120 ? '正常范围' : '需关注'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="section">
          <div className="section-header">
            <div className="section-title">本周运营趋势</div>
            <div className="section-tabs">
              <button
                className={`section-tab ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                司机排行
              </button>
              <button
                className={`section-tab ${viewMode === 'chart' ? 'active' : ''}`}
                onClick={() => setViewMode('chart')}
              >
                趋势图表
              </button>
            </div>
          </div>

          {viewMode === 'chart' ? (
            <div style={{ padding: '20px 10px' }}>
              <div className="chart-container" style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis yAxisId="left" stroke="#64748b" fontSize={12} domain={[60, 100]} />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: 8,
                        color: '#f8fafc'
                      }}
                    />
                    <Legend wrapperStyle={{ color: '#94a3b8' }} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="onTime"
                      name="准点率(%)"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ fill: '#10b981', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="anomalies"
                      name="异常数"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={{ fill: '#f59e0b', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <table className="drivers-table">
              <thead>
                <tr>
                  <th>驾驶员</th>
                  <th>所属线路</th>
                  <th>准点率</th>
                  <th>偏离次数</th>
                  <th>急停/转弯</th>
                  <th>GPS空白</th>
                  <th>异常总数</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map(driver => {
                  const perf = performanceData[driver.id]
                  const route = routes.find((r: Route) => r.id === driver.routeId)
                  if (!perf) return null
                  return (
                    <tr key={driver.id} onClick={() => onSelectDriver(driver.id)}>
                      <td>
                        <div className="driver-cell">
                          <div className="driver-avatar-sm">
                            {driver.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{driver.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{driver.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{route?.name.split('·')[1]?.trim() || route?.name}</td>
                      <td>
                        <div className="rate-bar">
                          <div className="rate-bar-track">
                            <div
                              className={`rate-bar-fill ${getRateClass(perf.onTimeRate)}`}
                              style={{ width: `${perf.onTimeRate}%` }}
                            />
                          </div>
                          <div className={`rate-value ${getRateClass(perf.onTimeRate)}`}>
                            {perf.onTimeRate}%
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${perf.deviationCount >= 5 ? 'badge-red' : perf.deviationCount >= 3 ? 'badge-yellow' : 'badge-green'}`}>
                          {perf.deviationCount} 次
                        </span>
                      </td>
                      <td style={{ color: perf.suddenBrakeCount + perf.suddenTurnCount >= 8 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                        {perf.suddenBrakeCount + perf.suddenTurnCount} 次
                      </td>
                      <td style={{ color: perf.gpsBlankMinutes >= 20 ? 'var(--warning)' : 'var(--text-secondary)' }}>
                        {perf.gpsBlankMinutes} 分
                      </td>
                      <td>
                        <span className={`badge ${perf.anomalies.length >= 10 ? 'badge-red' : perf.anomalies.length >= 6 ? 'badge-yellow' : 'badge-blue'}`}>
                          {perf.anomalies.length} 起
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '5px 12px', fontSize: 12 }}
                          onClick={e => { e.stopPropagation(); onOpenInterview(driver.id) }}
                        >
                          📝 面谈
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="section">
          <div className="section-header">
            <div className="section-title">异常类型分布</div>
          </div>
          <div style={{ padding: 16 }}>
            <div className="chart-container" style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={anomalyTypeStats} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={11} />
                  <YAxis type="category" dataKey="type" stroke="#64748b" fontSize={11} width={70} />
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: 8,
                      color: '#f8fafc'
                    }}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                  />
                  <Bar dataKey="count" name="次数" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="divider" />

            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>需重点关注司机（风险分层）</span>
              {riskProfiles.length > 0 && (
                <div style={{ display: 'flex', gap: 6, fontSize: 11 }}>
                  <span className="badge badge-red" style={{ opacity: 0.85 }}>
                    {riskProfiles.filter(r => r.riskLevel === 'critical' || r.riskLevel === 'high').length} 高风险
                  </span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(riskProfiles.length > 0
                ? riskProfiles.filter(r => r.riskLevel === 'critical' || r.riskLevel === 'high').slice(0, 4)
                : []
              ).map(profile => {
                  const driver = allDrivers.find(d => d.id === profile.driverId)
                  if (!driver) return null
                  const perf = performanceData[driver.id]
                  const riskColor = profile.riskLevel === 'critical' ? 'var(--danger)' : '#f59e0b'
                  return (
                    <div
                      key={driver.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: 10,
                        background: 'var(--bg-secondary)',
                        borderRadius: 8,
                        cursor: 'pointer',
                        border: `1px solid ${riskColor}33`,
                        transition: 'all 0.15s',
                        boxShadow: `0 0 0 1px ${riskColor}11 inset`
                      }}
                      onClick={() => onSelectDriver(driver.id)}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = riskColor)}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = `${riskColor}33`)}
                    >
                      <div className="driver-avatar-sm" style={{
                        background: `linear-gradient(135deg, ${riskColor}, var(--purple))`
                      }}>
                        {driver.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {driver.name}
                          <span className="badge" style={{
                            fontSize: 10,
                            padding: '1px 6px',
                            background: profile.riskLevel === 'critical' ? 'var(--danger)' : '#f59e0b',
                            color: 'white'
                          }}>
                            {profile.riskLevel === 'critical' ? '极高' : '高风险'}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          {profile.routeName.split('·')[0]} · 风险分 {profile.riskScore}
                        </div>
                        {profile.riskFactors.length > 0 && (
                          <div style={{ fontSize: 10, color: riskColor, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {profile.riskFactors.slice(0, 2).join(' · ')}
                          </div>
                        )}
                      </div>
                      <span className="badge badge-red" style={{ fontSize: 11 }}>
                        {perf?.anomalies.length || 0} 起
                      </span>
                    </div>
                  )
                })}
              {riskProfiles.filter(r => r.riskLevel === 'critical' || r.riskLevel === 'high').length === 0 && (
                drivers
                  .map(d => ({ driver: d, perf: performanceData[d.id] }))
                  .filter(x => x.perf)
                  .sort((a, b) => (b.perf!.anomalies.length) - (a.perf!.anomalies.length))
                  .slice(0, 4)
                  .map(({ driver, perf }) => {
                    const route = defaultRoutes.find(r => r.id === driver.routeId)
                    return (
                      <div
                        key={driver.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: 10,
                          background: 'var(--bg-secondary)',
                          borderRadius: 8,
                          cursor: 'pointer',
                          border: '1px solid var(--border)',
                          transition: 'all 0.15s'
                        }}
                        onClick={() => onSelectDriver(driver.id)}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-light)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                      >
                        <div className="driver-avatar-sm" style={{
                          background: 'linear-gradient(135deg, var(--accent), var(--purple))'
                        }}>
                          {driver.name.charAt(0)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{driver.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            {route?.name.split('·')[0]}
                          </div>
                        </div>
                        <span className="badge badge-red" style={{ fontSize: 11 }}>
                          {perf!.anomalies.length} 起
                        </span>
                      </div>
                    )
                  })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
