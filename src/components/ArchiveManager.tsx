import { useState, useMemo } from 'react'
import { WeekArchive, Driver, Fleet, AnomalyType } from '../types'

interface ArchiveManagerProps {
  archives: WeekArchive[]
  drivers: Driver[]
  fleets: Fleet[]
  anomalyLabels: Record<AnomalyType, string>
  onLoad: (archive: WeekArchive) => void
  onDelete: (id: string) => void
  onClose: () => void
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatWeekRange(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  return `${s.getMonth() + 1}/${s.getDate()} - ${e.getMonth() + 1}/${e.getDate()}`
}

export default function ArchiveManager({
  archives,
  drivers,
  fleets,
  anomalyLabels,
  onLoad,
  onDelete,
  onClose
}: ArchiveManagerProps) {
  const [searchText, setSearchText] = useState('')
  const [sortBy, setSortBy] = useState<'createdAt' | 'weekStart'>('createdAt')

  const filtered = useMemo(() => {
    let list = archives
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase()
      list = list.filter(a =>
        a.name.toLowerCase().includes(q)
      )
    }
    list = [...list].sort((a, b) => {
      const av = sortBy === 'createdAt' ? a.createdAt : a.weekStart
      const bv = sortBy === 'createdAt' ? b.createdAt : b.weekStart
      return bv.localeCompare(av)
    })
    return list
  }, [archives, searchText, sortBy])

  return (
    <div style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>🗂️ 周复盘档案</h2>
          <div style={{ marginTop: 4, fontSize: 13, color: 'var(--text-muted)' }}>
          共 {archives.length} 份档案 · 保存每周筛选条件、重点司机、异常摘要
          </div>
        </div>
        <button
          className="btn btn-secondary"
          onClick={onClose}
        >
          ← 返回概览
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="搜索档案名称..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{
            flex: 1,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '8px 12px',
            color: 'var(--text-primary)',
            fontSize: 13
          }}
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as any)}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '8px 12px',
            color: 'var(--text-primary)',
            fontSize: 13
          }}
        >
          <option value="createdAt">按保存时间</option>
          <option value="weekStart">按周次</option>
        </select>
      </div>

      <div className="card" style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{
        padding: 60,
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 14
      }}>
      暂无档案。在概览页点击「💾 保存档案」来创建一份吧
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(archive => {
            const keyDriverNames = archive.keyDriverIds
              .map(id => drivers.find(d => d.id === id)?.name)
              .filter(Boolean)
              .slice(0, 5)
            const fleetName = archive.fleetId ? fleets.find(f => f.id === archive.fleetId)?.name : '全部车队'
            const anomalyTypes = Object.entries(archive.anomalySummary)
              .filter(([, count]) => count > 0)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 4)

            return (
              <div
                key={archive.id}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{archive.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      📅 {formatWeekRange(archive.weekStart, archive.weekEnd)}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {fleetName}
                  {archive.routeId && ' · 筛选中'}
                  {archive.searchQuery && `🔍 "${archive.searchQuery}`}
                </div>

                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>异常类型</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {anomalyTypes.length === 0 ? (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>无异常</span>
                    ) : anomalyTypes.map(([type, count]) => (
                      <span
                        key={type}
                        className="badge"
                        style={{
                          fontSize: 10,
                          padding: '2px 8px',
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {anomalyLabels[type as AnomalyType]} {count}
                      </span>
                    ))}
                  </div>
                </div>

                {keyDriverNames.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>重点司机</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {keyDriverNames.map(name => (
                        <span
                          key={name}
                          className="badge badge-blue"
                          style={{ fontSize: 10, padding: '2px 8px' }}
                        >
                          {name}
                        </span>
                      ))}
                      {archive.keyDriverIds.length > keyDriverNames.length && (
                        <span className="badge" style={{ fontSize: 10, padding: '2px 8px', background: 'var(--bg-tertiary)' }}>
                          +{archive.keyDriverIds.length - keyDriverNames.length}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {archive.interviewNoteIds.length > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--accent)' }}>
                    📝 关联面谈记录 {archive.interviewNoteIds.length} 份
                  </div>
                )}

                <div className="divider" style={{ margin: '4px 0' }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    保存于 {formatDate(archive.createdAt)}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-outline"
                      style={{ fontSize: 11, padding: '4px 10px' }}
                      onClick={() => onLoad(archive)}
                    >
                      加载
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{
                        fontSize: 11, padding: '4px 10px',
                        borderColor: 'var(--danger)',
                        color: 'var(--danger)'
                      }}
                      onClick={() => onDelete(archive.id)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      </div>
    </div>
  )
}
