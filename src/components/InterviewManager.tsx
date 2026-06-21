import { useState, useMemo, useRef } from 'react'
import { StoredInterviewRecord, Driver, Fleet } from '../types'
import { ANOMALY_LABELS, ANOMALY_COLORS } from '../data/mockData'

interface InterviewManagerProps {
  interviews: StoredInterviewRecord[]
  drivers: Driver[]
  fleets: Fleet[]
  onClose: () => void
  onDelete: (id: string) => void
}

const ANOMALY_ICONS: Record<string, string> = {
  early_arrival: '⏰',
  late_arrival: '⏱️',
  route_deviation: '🗺️',
  sudden_brake: '🛑',
  sudden_turn: '↩️',
  gps_blank: '📡',
  overspeed: '⚡'
}

function formatWeekRange(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  return `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, '0')}-${String(s.getDate()).padStart(2, '0')} ~ ${e.getMonth() + 1}/${e.getDate()}`
}

export default function InterviewManager({
  interviews,
  drivers,
  fleets,
  onClose,
  onDelete
}: InterviewManagerProps) {
  const [filterDriver, setFilterDriver] = useState<string>('all')
  const [filterFleet, setFilterFleet] = useState<string>('all')
  const [filterWeekStart, setFilterWeekStart] = useState<string>('')
  const [viewingRecord, setViewingRecord] = useState<StoredInterviewRecord | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  const filteredInterviews = useMemo(() => {
    let list = interviews
    if (filterDriver !== 'all') {
      list = list.filter(i => i.driverId === filterDriver)
    }
    if (filterFleet !== 'all') {
      list = list.filter(i => i.fleetId === filterFleet)
    }
    if (filterWeekStart) {
      list = list.filter(i => i.weekStart === filterWeekStart)
    }
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [interviews, filterDriver, filterFleet, filterWeekStart])

  const weekOptions = useMemo(() => {
    const set = new Set<string>()
    interviews.forEach(i => set.add(i.weekStart))
    return Array.from(set).sort((a, b) => b.localeCompare(a))
  }, [interviews])

  const handlePrint = (record: StoredInterviewRecord) => {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>司机面谈记录 - ${record.driverName}</title>
  <style>
    @media print {
      body { margin: 0; padding: 0; }
      .no-print { display: none !important; }
    }
    body { font-family: 'Microsoft YaHei', -apple-system, sans-serif; padding: 40px; color: #1f2937; line-height: 1.6; font-size: 13px; }
    h1 { text-align: center; font-size: 22px; margin: 0 0 4px 0; font-weight: 700; }
    .subtitle { text-align: center; color: #6b7280; font-size: 12px; margin-bottom: 10px; }
    .period { text-align: center; color: #3b82f6; font-weight: 600; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 26px; }
    .info-item .label { font-size: 11px; color: #6b7280; margin-bottom: 4px; }
    .info-item .value { font-size: 15px; font-weight: 600; }
    .section-title { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 10px; }
    .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 22px; }
    .metric { background: #f9fafb; padding: 12px; border-radius: 6px; text-align: center; }
    .metric-label { font-size: 10px; color: #6b7280; }
    .metric-value { font-size: 17px; font-weight: 700; margin-top: 4px; }
    .anomaly-list { background: #f9fafb; border-radius: 6px; overflow: hidden; margin-bottom: 22px; }
    .anomaly-item { padding: 12px; border-bottom: 1px solid #e5e7eb; display: flex; gap: 12px; }
    .anomaly-item:last-child { border-bottom: none; }
    .anomaly-icon { width: 26px; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; }
    .requirements { background: #f9fafb; padding: 14px; border-radius: 6px; font-size: 13px; line-height: 1.8; margin-bottom: 18px; white-space: pre-wrap; }
    .notes-section { margin-bottom: 26px; }
    .sign-area { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; padding-top: 24px; border-top: 1px solid #e5e7eb; }
    .sign-box { text-align: center; }
    .sign-label { font-size: 11px; color: #6b7280; margin-bottom: 32px; }
    .sign-line { border-bottom: 1px solid #6b7280; padding-bottom: 8px; }
    .sign-date { margin-top: 6px; font-size: 11px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="no-print" style="position:fixed; top:20px; right:20px; z-index:999; display:flex; gap:10px;">
    <button onclick="window.print()" style="padding:8px 20px; background:#3b82f6; color:white; border:none; border-radius:6px; cursor:pointer; font-size:13px;">🖨️ 打印</button>
    <button onclick="window.close()" style="padding:8px 20px; background:#9ca3af; color:white; border:none; border-radius:6px; cursor:pointer; font-size:13px;">关闭</button>
  </div>

  <h1>校车司机面谈记录表</h1>
  <div class="subtitle">School Bus Driver Interview Record</div>
  <div class="period">考核周期：${record.weekStart} 至 ${record.weekEnd}</div>

  <div class="info-grid">
    <div class="info-item"><div class="label">驾驶员姓名</div><div class="value">${record.driverName}</div></div>
    <div class="info-item"><div class="label">工号</div><div class="value">${record.driverEmployeeId}</div></div>
    ${record.fleetName ? `<div class="info-item"><div class="label">所属车队</div><div class="value">${record.fleetName}</div></div>` : ''}
    <div class="info-item"><div class="label">所属线路</div><div class="value">${record.routeName || '-'}</div></div>
    <div class="info-item"><div class="label">联系电话</div><div class="value">${record.driverPhone}</div></div>
    <div class="info-item"><div class="label">面谈日期</div><div class="value">${record.interviewDate.replace(/-/g, ' / ')}</div></div>
    <div class="info-item"><div class="label">下次观察日期</div><div class="value" style="color:#3b82f6;">${record.nextReviewDate.replace(/-/g, ' / ')}</div></div>
  </div>

  <div class="section-title">需整改问题项 (${record.anomalyDetails.length}项)</div>
  <div class="anomaly-list">
    ${record.anomalyDetails.map(a => `
      <div class="anomaly-item">
        <div class="anomaly-icon" style="background:${ANOMALY_COLORS[a.type]}25;color:${ANOMALY_COLORS[a.type]};">
          ${ANOMALY_ICONS[a.type]}
        </div>
        <div style="flex:1;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-weight:600; color:${ANOMALY_COLORS[a.type]}; font-size:13px;">${ANOMALY_LABELS[a.type]}</span>
            <span style="font-size:10px; padding:1px 8px; border-radius:10px; background:${a.severity === 'high' ? '#fef2f2; color:#dc2626' : a.severity === 'medium' ? '#fefce8; color:#ca8a04' : '#f3f4f6; color:#6b7280'};">
              ${a.severity === 'high' ? '高危' : a.severity === 'medium' ? '中危' : '低危'}
            </span>
          </div>
          <div style="font-size:12px; color:#6b7280; margin-top:4px;">
            ${a.date.replace(/-/g, '/')} ${a.time} · ${a.locationName}
          </div>
          <div style="font-size:12px; color:#374151; margin-top:4px;">${a.description}</div>
        </div>
      </div>
    `).join('')}
  </div>

  <div class="section-title">改进要求</div>
  <div class="requirements">${record.improvementRequirements || '（未填写）'}</div>

  ${record.notes ? `
    <div class="notes-section">
      <div class="section-title">主管备注</div>
      <div class="requirements">${record.notes}</div>
    </div>
  ` : ''}

  <div class="sign-area">
    <div class="sign-box">
      <div class="sign-label">驾驶员签字确认</div>
      <div class="sign-line">&nbsp;</div>
      <div class="sign-date">日期：____________</div>
    </div>
    <div class="sign-box">
      <div class="sign-label">面谈主管签字</div>
      <div class="sign-line" style="font-weight:500;">${record.supervisor}</div>
      <div class="sign-date">日期：${record.interviewDate.replace(/-/g, ' / ')}</div>
    </div>
  </div>
</body>
</html>
    `
    const win = window.open('', '_blank', 'width=800,height=900')
    if (win) {
      win.document.write(html)
      win.document.close()
    }
  }

  const driverOptions = useMemo(() => {
    const set = new Set<string>()
    interviews.forEach(i => set.add(i.driverId))
    return Array.from(set).map(id => {
      const name = interviews.find(i => i.driverId === id)?.driverName || ''
      const d = drivers.find(d => d.id === id)
      return { id, name: d?.name || name }
    }).sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
  }, [interviews, drivers])

  const isOverdue = (nextDate: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(nextDate) < today
  }

  const handleConfirmDelete = (id: string) => {
    onDelete(id)
    setConfirmDeleteId(null)
    if (viewingRecord?.id === id) setViewingRecord(null)
  }

  return (
    <div style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>📝 面谈记录管理</h2>
          <div style={{ marginTop: 4, fontSize: 13, color: 'var(--text-muted)' }}>
            共 {interviews.length} 份面谈记录 · 按司机、线路、周次筛选
          </div>
        </div>
        <button className="btn btn-secondary" onClick={onClose}>
          ← 返回概览
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <select
          value={filterDriver}
          onChange={e => setFilterDriver(e.target.value)}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '8px 12px',
            color: 'var(--text-primary)',
            fontSize: 13,
            minWidth: 160
          }}
        >
          <option value="all">全部司机</option>
          {driverOptions.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
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
            fontSize: 13,
            minWidth: 160
          }}
        >
          <option value="all">全部车队</option>
          {fleets.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
        <select
          value={filterWeekStart}
          onChange={e => setFilterWeekStart(e.target.value)}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '8px 12px',
            color: 'var(--text-primary)',
            fontSize: 13,
            minWidth: 160
          }}
        >
          <option value="">全部周次</option>
          {weekOptions.map(w => (
            <option key={w} value={w}>{formatWeekRange(w, interviews.find(i => i.weekStart === w)?.weekEnd || '')}</option>
          ))}
        </select>
        <div style={{ flex: 1 }} />
        <div style={{ alignSelf: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
          筛选后 {filteredInterviews.length} 条
        </div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, minHeight: 0 }}>
        <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="section-header">
            <span>面谈记录列表</span>
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {filteredInterviews.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                {interviews.length === 0
                  ? '暂无面谈记录。在司机详情页勾选问题后生成面谈记录并保存。'
                  : '没有匹配的记录，请调整筛选条件。'}
              </div>
            ) : (
              <table className="drivers-table">
                <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)' }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px 12px' }}>司机</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px' }}>车队/线路</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px' }}>周次</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px' }}>问题</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px' }}>下次观察</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInterviews.map(iv => {
                    const isSel = viewingRecord?.id === iv.id
                    const overdue = isOverdue(iv.nextReviewDate)
                    return (
                      <tr
                        key={iv.id}
                        onClick={() => setViewingRecord(iv)}
                        style={{
                          cursor: 'pointer',
                          background: isSel ? 'var(--accent)15' : undefined,
                          borderLeft: isSel ? '3px solid var(--accent)' : undefined
                        }}
                      >
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{iv.driverName}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{iv.driverEmployeeId}</div>
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--text-muted)' }}>
                          {iv.fleetName?.split('（')[0]}
                          <br />{iv.routeName?.split('线')[0]}线
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 12 }}>
                          {formatWeekRange(iv.weekStart, iv.weekEnd)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span className="badge badge-red" style={{ fontSize: 10 }}>
                            {iv.anomalyDetails.length} 项
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 12 }}>
                          {overdue ? (
                            <span style={{ color: 'var(--danger)', fontWeight: 600 }}>⚠️ {iv.nextReviewDate}</span>
                          ) : (
                            <span>{iv.nextReviewDate}</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                          <button
                            className="filter-chip"
                            onClick={() => handlePrint(iv)}
                            style={{ fontSize: 10, padding: '2px 8px', marginRight: 4 }}
                          >
                            🖨️ 打印
                          </button>
                          <button
                            className="filter-chip"
                            onClick={() => setConfirmDeleteId(iv.id)}
                            style={{ fontSize: 10, padding: '2px 8px', color: 'var(--danger)' }}
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="section-header">
            <span>面谈详情</span>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
            {!viewingRecord ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                从左侧选择一条记录查看详情
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div className="driver-avatar-sm" style={{
                      width: 32, height: 32, fontSize: 14,
                      background: 'linear-gradient(135deg, var(--accent), var(--purple))'
                    }}>
                      {viewingRecord.driverName.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>{viewingRecord.driverName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        工号 {viewingRecord.driverEmployeeId} · {viewingRecord.driverPhone}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
                  padding: 12, background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 12
                }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>车队 / 线路</div>
                    <div style={{ fontWeight: 500, marginTop: 2 }}>
                      {viewingRecord.fleetName || '-'}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      {viewingRecord.routeName || '-'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>考核周期</div>
                    <div style={{ fontWeight: 500, marginTop: 2 }}>
                      {formatWeekRange(viewingRecord.weekStart, viewingRecord.weekEnd)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>面谈日期</div>
                    <div style={{ fontWeight: 500, marginTop: 2 }}>{viewingRecord.interviewDate}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>下次观察日期</div>
                    <div style={{
                      fontWeight: 500, marginTop: 2,
                      color: isOverdue(viewingRecord.nextReviewDate) ? 'var(--danger)' : 'var(--accent)'
                    }}>
                      {isOverdue(viewingRecord.nextReviewDate) ? '⚠️ ' : ''}{viewingRecord.nextReviewDate}
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    📋 问题清单 ({viewingRecord.anomalyDetails.length}项)
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                    {viewingRecord.anomalySummaries.map((s, idx) => (
                      <span
                        key={idx}
                        className="badge"
                        style={{
                          fontSize: 10, padding: '2px 8px',
                          background: `${ANOMALY_COLORS[s.type]}22`,
                          color: ANOMALY_COLORS[s.type]
                        }}
                      >
                        {ANOMALY_LABELS[s.type]} {s.count}
                      </span>
                    ))}
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, overflow: 'hidden' }}>
                    {viewingRecord.anomalyDetails.map((a, idx) => (
                      <div
                        key={a.id}
                        style={{
                          padding: 10,
                          borderBottom: idx < viewingRecord.anomalyDetails.length - 1 ? '1px solid var(--border)' : undefined,
                          display: 'flex', gap: 8
                        }}
                      >
                        <div style={{
                          width: 22, height: 22, borderRadius: 4, flexShrink: 0,
                          background: `${ANOMALY_COLORS[a.type]}25`, color: ANOMALY_COLORS[a.type],
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11
                        }}>
                          {ANOMALY_ICONS[a.type]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 500, color: ANOMALY_COLORS[a.type] }}>
                              {ANOMALY_LABELS[a.type]}
                            </span>
                            <span style={{
                              fontSize: 9, padding: '1px 6px', borderRadius: 8,
                              background: a.severity === 'high' ? 'var(--danger)22' : a.severity === 'medium' ? 'var(--warning)22' : 'var(--bg-tertiary)',
                              color: a.severity === 'high' ? 'var(--danger)' : a.severity === 'medium' ? 'var(--warning)' : 'var(--text-muted)'
                            }}>
                              {a.severity === 'high' ? '高危' : a.severity === 'medium' ? '中危' : '低危'}
                            </span>
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                            {a.date} {a.time} · {a.locationName}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
                            {a.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    📝 改进要求
                  </div>
                  <div style={{
                    background: 'var(--bg-secondary)',
                    padding: 12, borderRadius: 8,
                    fontSize: 12, lineHeight: 1.7,
                    whiteSpace: 'pre-wrap', color: 'var(--text-secondary)'
                  }}>
                    {viewingRecord.improvementRequirements || '（未填写）'}
                  </div>
                </div>

                {viewingRecord.notes && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      💬 主管备注
                    </div>
                    <div style={{
                      background: 'var(--bg-secondary)',
                      padding: 12, borderRadius: 8,
                      fontSize: 12, lineHeight: 1.7,
                      whiteSpace: 'pre-wrap', color: 'var(--text-secondary)'
                    }}>
                      {viewingRecord.notes}
                    </div>
                  </div>
                )}

                <div style={{
                  marginTop: 4, padding: 10,
                  background: 'var(--bg-secondary)', borderRadius: 8,
                  fontSize: 11, color: 'var(--text-muted)',
                  display: 'flex', justifyContent: 'space-between'
                }}>
                  <div>面谈主管：<span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{viewingRecord.supervisor}</span></div>
                  <div>创建于：{new Date(viewingRecord.createdAt).toLocaleDateString('zh-CN')}</div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => handlePrint(viewingRecord)}>
                    🖨️ 打印该记录
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                    onClick={() => setConfirmDeleteId(viewingRecord.id)}
                  >
                    🗑️ 删除
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {confirmDeleteId && (
        <div className="modal-overlay" onClick={() => setConfirmDeleteId(null)}>
          <div className="modal" style={{ width: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">⚠️ 确认删除</div>
            </div>
            <div className="modal-body" style={{ padding: '20px 24px' }}>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7 }}>
                确定要删除这条面谈记录吗？删除后无法恢复。
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setConfirmDeleteId(null)}>取消</button>
              <button className="btn btn-primary" style={{ background: 'var(--danger)' }} onClick={() => handleConfirmDelete(confirmDeleteId)}>
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
      <div ref={printRef} style={{ display: 'none' }} />
    </div>
  )
}
