import { useState, useMemo } from 'react'
import { DriverRiskProfile, RiskLevel, Driver, Fleet, Route } from '../types'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

interface RiskDashboardProps {
  profiles: DriverRiskProfile[]
  drivers: Driver[]
  fleets: Fleet[]
  routes: Route[]
  weekStart: string
  onSelectDriver: (id: string) => void
}

const RISK_COLORS: Record<RiskLevel, string> = {
  critical: '#dc2626',
  high: '#f59e0b',
  medium: '#eab308',
  low: '#10b981'
}

const RISK_LABELS: Record<RiskLevel, string> = {
  critical: '极高风险',
  high: '高风险',
  medium: '中风险',
  low: '低风险'
}

function formatWeekLabel(ws: string) {
  const d = new Date(ws)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default function RiskDashboard({
  profiles,
  fleets,
  weekStart,
  onSelectDriver
}: RiskDashboardProps) {
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'all'>('all')
  const [filterFleet, setFilterFleet] = useState<string>('all')
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)

  const filteredProfiles = useMemo(() => {
    let list = profiles
    if (filterRisk !== 'all') {
      list = list.filter(p => p.riskLevel === filterRisk)
    }
    if (filterFleet !== 'all') {
      list = list.filter(p => p.fleetId === filterFleet)
    }
    return list
  }, [profiles, filterRisk, filterFleet])

  const stats = useMemo(() => ({
    total: profiles.length,
    critical: profiles.filter(p => p.riskLevel === 'critical').length,
    high: profiles.filter(p => p.riskLevel === 'high').length,
    medium: profiles.filter(p => p.riskLevel === 'medium').length,
    low: profiles.filter(p => p.riskLevel === 'low').length,
  }), [profiles])

  const selectedProfile = selectedProfileId
    ? profiles.find(p => p.driverId === selectedProfileId)
    : null

  return (
    <div style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>⚠️ 司机风险分层视图</h2>
        <div style={{ marginTop: 4, fontSize: 13, color: 'var(--text-muted)' }}>
          基于近 5 周数据分析 · 当前分析周次 {formatWeekLabel(weekStart)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: '司机总数', value: stats.total, color: 'var(--text-primary)', bg: 'var(--bg-secondary)' },
          { label: '极高风险', value: stats.critical, color: RISK_COLORS.critical, bg: `${RISK_COLORS.critical}15` },
          { label: '高风险', value: stats.high, color: RISK_COLORS.high, bg: `${RISK_COLORS.high}15` },
          { label: '中风险', value: stats.medium, color: RISK_COLORS.medium, bg: `${RISK_COLORS.medium}15` },
          { label: '低风险', value: stats.low, color: RISK_COLORS.low, bg: `${RISK_COLORS.low}15` }
        ].map(item => (
          <div
            key={item.label}
            style={{
              background: item.bg,
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: 16
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{item.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <select
          value={filterRisk}
          onChange={e => setFilterRisk(e.target.value as any)}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '8px 12px',
            color: 'var(--text-primary)',
            fontSize: 13
          }}
        >
          <option value="all">全部风险等级</option>
          <option value="critical">极高风险</option>
          <option value="high">高风险</option>
          <option value="medium">中风险</option>
          <option value="low">低风险</option>
        </select>
        <select
          value={filterFleet}
          onChange={e => setFilterFleet(e.target.value)}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '8px 12px',
            color: 'var(--text-primary)',
            fontSize: 13
          }}
        >
          <option value="all">全部车队</option>
          {fleets.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
        <div style={{ flex: 1 }} />
        <div style={{ alignSelf: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
          显示 {filteredProfiles.length} 名司机
        </div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, minHeight: 0 }}>
        <div className="card" style={{ overflow: 'auto' }}>
          <div className="section-header">
            <span>风险分层列表</span>
          </div>
          <div style={{ padding: '0 8px 8px' }}>
            {filteredProfiles.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                没有匹配的司机
              </div>
            ) : (
              <table className="drivers-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px 12px' }}>司机</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px' }}>风险等级</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px' }}>风险分</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px' }}>连续问题周</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px' }}>下次观察</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProfiles.map(p => {
                    const isSelected = selectedProfileId === p.driverId
                    return (
                      <tr
                        key={p.driverId}
                        onClick={() => setSelectedProfileId(p.driverId)}
                        style={{
                          cursor: 'pointer',
                          background: isSelected ? 'var(--accent)15' : undefined,
                          borderLeft: isSelected ? `3px solid ${RISK_COLORS[p.riskLevel]}` : undefined
                        }}
                      >
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="driver-avatar-sm" style={{
                              width: 28, height: 28, fontSize: 12,
                              background: `linear-gradient(135deg, ${RISK_COLORS[p.riskLevel]}, var(--purple))`
                            }}>
                              {p.driverName.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 500 }}>{p.driverName}</div>
                              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.fleetName.split('（')[0]}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span className="badge" style={{
                            background: `${RISK_COLORS[p.riskLevel]}22`,
                            color: RISK_COLORS[p.riskLevel],
                            fontSize: 11
                          }}>
                            {RISK_LABELS[p.riskLevel]}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 14, fontWeight: 600, color: RISK_COLORS[p.riskLevel] }}>
                          {p.riskScore}
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 12 }}>
                          {p.consecutiveWeeksWithIssues > 0
                            ? <span style={{ color: 'var(--danger)' }}>⚠️ {p.consecutiveWeeksWithIssues} 周</span>
                            : <span style={{ color: 'var(--text-muted)' }}>-</span>
                          }
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 12 }}>
                          {p.nextReviewDate || <span style={{ color: 'var(--text-muted)' }}>-</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card" style={{ overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div className="section-header">
            <span>风险详情分析</span>
          </div>
          <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
            {!selectedProfile ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                从左侧选择一名司机查看详细风险分析
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="driver-avatar-lg" style={{
                    width: 56, height: 56, fontSize: 22,
                    background: `linear-gradient(135deg, ${RISK_COLORS[selectedProfile.riskLevel]}, var(--purple))`
                  }}>
                    {selectedProfile.driverName.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {selectedProfile.driverName}
                      <span className="badge" style={{
                        background: `${RISK_COLORS[selectedProfile.riskLevel]}22`,
                        color: RISK_COLORS[selectedProfile.riskLevel]
                      }}>
                        {RISK_LABELS[selectedProfile.riskLevel]} · 风险分 {selectedProfile.riskScore}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                      {selectedProfile.routeName} · {selectedProfile.fleetName}
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '8px 16px', fontSize: 12 }}
                    onClick={() => onSelectDriver(selectedProfile.driverId)}
                  >
                    查看详情 →
                  </button>
                </div>

                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    📈 近 5 周趋势
                  </div>
                  <div style={{ height: 140, background: 'var(--bg-secondary)', borderRadius: 8, padding: 8 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedProfile.weeklyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis
                          dataKey="weekStart"
                          tickFormatter={formatWeekLabel}
                          tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                          axisLine={{ stroke: 'var(--border)' }}
                        />
                        <YAxis
                          yAxisId="left"
                          tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                          axisLine={{ stroke: 'var(--border)' }}
                          domain={[60, 100]}
                          label={{ value: '准点率', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: 'var(--text-muted)' } }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                          axisLine={{ stroke: 'var(--border)' }}
                          label={{ value: '异常数', angle: 90, position: 'insideRight', style: { fontSize: 10, fill: 'var(--text-muted)' } }}
                        />
                        <Tooltip
                          contentStyle={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 8,
                            fontSize: 11
                          }}
                          labelFormatter={formatWeekLabel}
                        />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="onTimeRate"
                          name="准点率(%)"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="anomalyCount"
                          name="异常次数"
                          stroke="#ef4444"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    ⚠️ 风险因素
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selectedProfile.riskFactors.length === 0 ? (
                      <span style={{ fontSize: 12, color: 'var(--success)' }}>暂无明显风险因素，保持良好表现</span>
                    ) : selectedProfile.riskFactors.map((factor, idx) => (
                      <span
                        key={idx}
                        className="badge badge-red"
                        style={{ fontSize: 11, padding: '4px 10px' }}
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    💡 建议跟进动作
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 12 }}>
                    <ol style={{ margin: 0, paddingLeft: 20 }}>
                      {selectedProfile.recommendedActions.map((action, idx) => (
                        <li key={idx} style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                          {action}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {(selectedProfile.lastInterviewDate || selectedProfile.nextReviewDate) && (
                  <div style={{
                    display: 'flex', gap: 16, padding: 12,
                    background: `${RISK_COLORS[selectedProfile.riskLevel]}11`,
                    borderRadius: 8,
                    border: `1px solid ${RISK_COLORS[selectedProfile.riskLevel]}33`
                  }}>
                    {selectedProfile.lastInterviewDate && (
                      <div style={{ fontSize: 12 }}>
                        <span style={{ color: 'var(--text-muted)' }}>上次面谈：</span>
                        <span style={{ fontWeight: 500 }}>{selectedProfile.lastInterviewDate}</span>
                      </div>
                    )}
                    {selectedProfile.nextReviewDate && (
                      <div style={{ fontSize: 12 }}>
                        <span style={{ color: 'var(--text-muted)' }}>下次观察日期：</span>
                        <span style={{ fontWeight: 600, color: RISK_COLORS[selectedProfile.riskLevel] }}>
                          {selectedProfile.nextReviewDate}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
