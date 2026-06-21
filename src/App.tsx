import { useState, useMemo, useRef, useEffect } from 'react'
import { Driver, DriverPerformance, Fleet, Route, WeekArchive, StoredInterviewRecord, AnomalyType } from './types'
import {
  fleets as defaultFleets,
  routes as defaultRoutes,
  drivers as defaultDrivers,
  generatePerformanceData,
  generatePerformanceDataWithDrivers,
  validateAndParseImportedData,
  generateSampleExportData,
  ANOMALY_LABELS,
  computeDataHash,
  calculateRiskProfiles
} from './data/mockData'
import { storageUtils, generateId } from './utils/storage'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import DriverDetail from './components/DriverDetail'
import InterviewModal from './components/InterviewModal'
import ArchiveManager from './components/ArchiveManager'
import InterviewManager from './components/InterviewManager'
import RiskDashboard from './components/RiskDashboard'

type ViewMode = 'dashboard' | 'archives' | 'interviews' | 'risk'

function App() {
  const [weekStart, setWeekStart] = useState('2026-06-15')
  const [fleets, setFleets] = useState<Fleet[]>(defaultFleets)
  const [routes, setRoutes] = useState<Route[]>(defaultRoutes)
  const [drivers, setDrivers] = useState<Driver[]>(defaultDrivers)
  const [customPerformanceData, setCustomPerformanceData] = useState<Record<string, DriverPerformance> | null>(null)
  const [isCustomDataMode, setIsCustomDataMode] = useState(false)
  const [customDataHash, setCustomDataHash] = useState<string>('')
  const [expandedFleets, setExpandedFleets] = useState<Set<string>>(new Set(['fleet-1', 'fleet-2', 'fleet-3']))
  const [selectedFleetId, setSelectedFleetId] = useState<string | null>(null)
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [interviewDriverId, setInterviewDriverId] = useState<string | null>(null)
  const [selectedTrainingIdsMap, setSelectedTrainingIdsMap] = useState<Record<string, Set<string>>>({})
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [showArchiveManager, setShowArchiveManager] = useState(false)
  const [showInterviewManager, setShowInterviewManager] = useState(false)
  const [showRiskDashboard, setShowRiskDashboard] = useState(false)
  const [storedInterviews, setStoredInterviews] = useState<StoredInterviewRecord[]>([])
  const [viewingInterviewId, setViewingInterviewId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setStoredInterviews(storageUtils.getInterviews())
  }, [])

  const generatedPerformanceData = useMemo(() => {
    if (isCustomDataMode && drivers.length > 0) {
      return generatePerformanceDataWithDrivers(weekStart, drivers, routes, fleets)
    }
    return generatePerformanceData(weekStart)
  }, [weekStart, isCustomDataMode, drivers, routes, fleets])

  const performanceData = customPerformanceData || generatedPerformanceData

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 6)
    return d.toISOString().split('T')[0]
  }, [weekStart])

  const weekLabel = useMemo(() => {
    const format = (s: string) => {
      const d = new Date(s)
      return `${d.getMonth() + 1}月${d.getDate()}日`
    }
    return `${format(weekStart)} - ${format(weekEnd)}`
  }, [weekStart, weekEnd])

  const filteredDrivers = useMemo(() => {
    let list = drivers
    if (selectedFleetId) {
      list = list.filter(d => d.fleetId === selectedFleetId)
    }
    if (selectedRouteId) {
      list = list.filter(d => d.routeId === selectedRouteId)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.employeeId.toLowerCase().includes(q)
      )
    }
    return list
  }, [drivers, selectedFleetId, selectedRouteId, searchQuery])

  const toggleFleet = (fleetId: string) => {
    setExpandedFleets(prev => {
      const next = new Set(prev)
      if (next.has(fleetId)) next.delete(fleetId)
      else next.add(fleetId)
      return next
    })
  }

  const handleSelectDriver = (driverId: string) => {
    setSelectedDriverId(driverId)
    setViewMode('dashboard')
  }

  const handleBackToList = () => {
    setSelectedDriverId(null)
  }

  const handleOpenInterview = (driverId: string) => {
    setInterviewDriverId(driverId)
    setShowInterviewModal(true)
  }

  const handlePrevWeek = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() - 7)
    setWeekStart(d.toISOString().split('T')[0])
    setCustomPerformanceData(null)
    setSelectedTrainingIdsMap({})
  }

  const handleNextWeek = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    setWeekStart(d.toISOString().split('T')[0])
    setCustomPerformanceData(null)
    setSelectedTrainingIdsMap({})
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const parsed = validateAndParseImportedData(content)
      if (parsed) {
        const hasCustomStructure = !!(parsed.drivers && parsed.routes && parsed.fleets)
        setWeekStart(parsed.weekStart)
        if (hasCustomStructure) {
          setDrivers(parsed.drivers!)
          setRoutes(parsed.routes!)
          setFleets(parsed.fleets!)
          setIsCustomDataMode(true)
          setCustomPerformanceData(parsed.performances)
          const hash = computeDataHash({ drivers: parsed.drivers, routes: parsed.routes, fleets: parsed.fleets })
          setCustomDataHash(hash)
          storageUtils.setCustomMeta({ imported: true, importedAt: new Date().toISOString(), dataHash: hash })
        } else {
          setCustomPerformanceData(parsed.performances)
        }
        setSelectedTrainingIdsMap({})
        alert(`数据导入成功！已加载 ${parsed.weekStart} 周数据，共 ${Object.keys(parsed.performances).length} 名司机${hasCustomStructure ? '（含自定义车队/线路/司机）' : ''}`)
      } else {
        alert('数据格式不正确，请选择有效的 JSON 数据文件')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleResetToDefault = () => {
    if (!isCustomDataMode && !customPerformanceData) return
    if (!confirm('确定要恢复默认数据吗？导入的车队/线路/司机将被清空。')) return
    setFleets(defaultFleets)
    setRoutes(defaultRoutes)
    setDrivers(defaultDrivers)
    setIsCustomDataMode(false)
    setCustomPerformanceData(null)
    setCustomDataHash('')
    setSelectedFleetId(null)
    setSelectedRouteId(null)
    setSelectedDriverId(null)
    setSelectedTrainingIdsMap({})
    storageUtils.clearCustomMeta()
  }

  const handleExportSample = () => {
    const data = isCustomDataMode
      ? JSON.stringify({
          weekStart,
          performances: performanceData,
          drivers,
          routes,
          fleets
        }, null, 2)
      : generateSampleExportData(weekStart)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bus-trace-${weekStart}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getSelectedTrainingIds = (driverId: string): Set<string> => {
    return selectedTrainingIdsMap[driverId] || new Set()
  }

  const setSelectedTrainingIds = (driverId: string, ids: Set<string>) => {
    setSelectedTrainingIdsMap(prev => ({
      ...prev,
      [driverId]: ids
    }))
  }

  const handleSaveInterview = (record: StoredInterviewRecord) => {
    storageUtils.addInterview(record)
    setStoredInterviews(storageUtils.getInterviews())
  }

  const getAnomalySummary = (): Record<AnomalyType, number> => {
    const summary: Record<AnomalyType, number> = {
      early_arrival: 0, late_arrival: 0, route_deviation: 0,
      sudden_brake: 0, sudden_turn: 0, gps_blank: 0, overspeed: 0
    }
    Object.values(performanceData).forEach(p => {
      p.anomalies.forEach(a => {
        summary[a.type]++
      })
    })
    return summary
  }

  const handleSaveArchive = () => {
    const defaultName = `${weekLabel} 复盘档案`
    const name = prompt('请输入档案名称：', defaultName)
    if (!name) return

    const highRiskDriverIds = Object.values(performanceData)
      .filter(p => p.onTimeRate < 85 || p.anomalies.length > 10)
      .map(p => p.driverId)

    const keyDriverIds = Array.from(new Set([
      ...highRiskDriverIds,
      ...Object.keys(selectedTrainingIdsMap).filter(id => selectedTrainingIdsMap[id].size > 0)
    ])).slice(0, 10)

    const archive: WeekArchive = {
      id: generateId('archive'),
      name: name.trim(),
      weekStart,
      weekEnd,
      createdAt: new Date().toISOString(),
      fleetId: selectedFleetId,
      routeId: selectedRouteId,
      searchQuery,
      keyDriverIds,
      anomalySummary: getAnomalySummary(),
      interviewNoteIds: storedInterviews.filter(r => r.weekStart === weekStart).map(r => r.id),
      customDataHash: isCustomDataMode ? customDataHash : undefined
    }
    storageUtils.addArchive(archive)
    alert('档案保存成功！')
    setShowArchiveManager(true)
  }

  const handleLoadArchive = (archive: WeekArchive) => {
    if (archive.customDataHash && archive.customDataHash !== customDataHash) {
      alert('此档案是基于不同的自定义车队/司机数据创建的，部分信息可能不匹配。建议先重新导入对应的数据文件。')
    }
    setWeekStart(archive.weekStart)
    setSelectedFleetId(archive.fleetId)
    setSelectedRouteId(archive.routeId)
    setSearchQuery(archive.searchQuery)
    setCustomPerformanceData(null)
    setSelectedDriverId(null)
    setShowArchiveManager(false)
    alert(`已加载档案：${archive.name}`)
  }

  const selectedDriver: Driver | undefined = selectedDriverId
    ? drivers.find(d => d.id === selectedDriverId)
    : undefined

  const selectedPerf: DriverPerformance | undefined = selectedDriverId
    ? performanceData[selectedDriverId]
    : undefined

  const riskProfiles = useMemo(() => {
    return calculateRiskProfiles(drivers, routes, fleets, weekStart, storedInterviews)
  }, [drivers, routes, fleets, weekStart, storedInterviews])

  const viewingInterview = viewingInterviewId
    ? storedInterviews.find(r => r.id === viewingInterviewId)
    : undefined

  return (
    <div className="app-container">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".json"
        onChange={handleFileChange}
      />

      <header className="app-header">
        <div className="app-header-left">
          <div className="app-logo">
            <div className="app-logo-icon">🚌</div>
            <div>
              <div className="app-logo-text">校车轨迹复盘系统</div>
              <div className="app-logo-sub">调度主管工作台</div>
            </div>
          </div>
          <div className="week-selector">
            <button onClick={handlePrevWeek} title="上一周">‹</button>
            <div className="week-label">
              {weekLabel} 运营数据
              {customPerformanceData && (
                <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--success)' }}>● 已导入</span>
              )}
              {isCustomDataMode && (
                <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--accent)' }}>● 自定义数据</span>
              )}
            </div>
            <button onClick={handleNextWeek} title="下一周">›</button>
            <button className="week-import-btn" style={{ marginLeft: 8 }} onClick={handleImportClick}>
              📥 导入数据
            </button>
            <button
              className="btn btn-outline"
              style={{ padding: '6px 12px', fontSize: 12 }}
              onClick={handleExportSample}
              title="导出当前周数据为 JSON 示例"
            >
              📤 导出
            </button>
            {isCustomDataMode && (
              <button
                className="btn btn-outline"
                style={{ padding: '6px 12px', fontSize: 12, borderColor: 'var(--danger)', color: 'var(--danger)' }}
                onClick={handleResetToDefault}
                title="恢复默认车队/线路/司机数据"
              >
                ↺ 恢复默认
              </button>
            )}
          </div>
        </div>
        <div className="app-header-right">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginRight: 16 }}>
            <button
              className="btn btn-outline"
              style={{
                padding: '6px 12px', fontSize: 12,
                background: viewMode === 'dashboard' && !selectedDriverId ? 'var(--accent)' : undefined,
                borderColor: viewMode === 'dashboard' && !selectedDriverId ? 'var(--accent)' : undefined,
                color: viewMode === 'dashboard' && !selectedDriverId ? 'white' : undefined
              }}
              onClick={() => { setViewMode('dashboard'); setSelectedDriverId(null); setShowArchiveManager(false); setShowInterviewManager(false); setShowRiskDashboard(false) }}
            >
              📊 概览
            </button>
            <button
              className="btn btn-outline"
              style={{
                padding: '6px 12px', fontSize: 12,
                background: showRiskDashboard ? 'var(--accent)' : undefined,
                borderColor: showRiskDashboard ? 'var(--accent)' : undefined,
                color: showRiskDashboard ? 'white' : undefined
              }}
              onClick={() => { setShowRiskDashboard(!showRiskDashboard); setShowArchiveManager(false); setShowInterviewManager(false); setSelectedDriverId(null) }}
              title="司机风险分层视图"
            >
              ⚠️ 风险分层
            </button>
            <button
              className="btn btn-outline"
              style={{
                padding: '6px 12px', fontSize: 12,
                background: showArchiveManager ? 'var(--accent)' : undefined,
                borderColor: showArchiveManager ? 'var(--accent)' : undefined,
                color: showArchiveManager ? 'white' : undefined
              }}
              onClick={() => { setShowArchiveManager(!showArchiveManager); setShowInterviewManager(false); setShowRiskDashboard(false); setSelectedDriverId(null) }}
              title="周复盘档案管理"
            >
              🗂️ 档案{storageUtils.getArchives().length > 0 && <span style={{ marginLeft: 4 }}>({storageUtils.getArchives().length})</span>}
            </button>
            <button
              className="btn btn-outline"
              style={{
                padding: '6px 12px', fontSize: 12,
                background: showInterviewManager ? 'var(--accent)' : undefined,
                borderColor: showInterviewManager ? 'var(--accent)' : undefined,
                color: showInterviewManager ? 'white' : undefined
              }}
              onClick={() => { setShowInterviewManager(!showInterviewManager); setShowArchiveManager(false); setShowRiskDashboard(false); setSelectedDriverId(null) }}
              title="面谈记录管理"
            >
              📝 面谈{storedInterviews.length > 0 && <span style={{ marginLeft: 4 }}>({storedInterviews.length})</span>}
            </button>
            {!selectedDriverId && viewMode === 'dashboard' && !showArchiveManager && !showInterviewManager && !showRiskDashboard && (
              <button
                className="btn btn-primary"
                style={{ padding: '6px 12px', fontSize: 12 }}
                onClick={handleSaveArchive}
                title="把当前周保存为复盘档案"
              >
                💾 保存档案
              </button>
            )}
          </div>
          <div className="user-info">
            <div className="user-avatar">王</div>
            <div>
              <div className="user-name">王主管</div>
              <div className="user-role">调度中心 · 调度主管</div>
            </div>
          </div>
        </div>
      </header>

      <div className="app-main">
        <Sidebar
          fleets={fleets}
          routes={routes}
          drivers={drivers}
          performanceData={performanceData}
          expandedFleets={expandedFleets}
          selectedFleetId={selectedFleetId}
          selectedRouteId={selectedRouteId}
          selectedDriverId={selectedDriverId}
          searchQuery={searchQuery}
          onToggleFleet={toggleFleet}
          onSelectFleet={setSelectedFleetId}
          onSelectRoute={setSelectedRouteId}
          onSelectDriver={handleSelectDriver}
          onSearch={setSearchQuery}
        />

        <div className="content-area" style={{ padding: selectedDriverId || showArchiveManager || showInterviewManager || showRiskDashboard ? 0 : 20, overflowY: selectedDriverId ? 'hidden' : 'auto' }}>
          {showRiskDashboard ? (
            <RiskDashboard
              profiles={riskProfiles}
              drivers={drivers}
              fleets={fleets}
              routes={routes}
              weekStart={weekStart}
              onSelectDriver={handleSelectDriver}
            />
          ) : showArchiveManager ? (
            <ArchiveManager
              archives={storageUtils.getArchives()}
              drivers={drivers}
              fleets={fleets}
              anomalyLabels={ANOMALY_LABELS}
              onLoad={handleLoadArchive}
              onDelete={(id) => {
                if (confirm('确定删除此档案吗？')) {
                  storageUtils.deleteArchive(id)
                  alert('已删除')
                  setShowArchiveManager(false)
                  setTimeout(() => setShowArchiveManager(true), 10)
                }
              }}
              onClose={() => setShowArchiveManager(false)}
            />
          ) : showInterviewManager ? (
            <InterviewManager
              interviews={storedInterviews}
              drivers={drivers}
              fleets={fleets}
              onDelete={(id) => {
                if (confirm('确定删除此面谈记录吗？')) {
                  storageUtils.deleteInterview(id)
                  setStoredInterviews(storageUtils.getInterviews())
                }
              }}
              onClose={() => setShowInterviewManager(false)}
            />
          ) : viewingInterview ? (
            <InterviewManager
              interviews={storedInterviews}
              drivers={drivers}
              fleets={fleets}
              onDelete={(id) => {
                if (confirm('确定删除此面谈记录吗？')) {
                  storageUtils.deleteInterview(id)
                  setStoredInterviews(storageUtils.getInterviews())
                  setViewingInterviewId(null)
                }
              }}
              onClose={() => setViewingInterviewId(null)}
            />
          ) : !selectedDriverId ? (
            <Dashboard
              weekLabel={weekLabel}
              weekStart={weekStart}
              weekEnd={weekEnd}
              drivers={filteredDrivers}
              allDrivers={drivers}
              fleets={fleets}
              routes={routes}
              performanceData={performanceData}
              selectedFleetId={selectedFleetId}
              selectedRouteId={selectedRouteId}
              onSelectDriver={handleSelectDriver}
              onClearFleet={() => setSelectedFleetId(null)}
              onClearRoute={() => setSelectedRouteId(null)}
              onOpenInterview={handleOpenInterview}
              riskProfiles={riskProfiles}
            />
          ) : selectedDriver && selectedPerf ? (
            <DriverDetail
              driver={selectedDriver}
              performance={selectedPerf}
              route={routes.find(r => r.id === selectedDriver.routeId)!}
              selectedTrainingIds={getSelectedTrainingIds(selectedDriver.id)}
              onSelectedTrainingChange={ids => setSelectedTrainingIds(selectedDriver.id, ids)}
              onBack={handleBackToList}
              onOpenInterview={() => handleOpenInterview(selectedDriver.id)}
              interviewHistory={storedInterviews.filter(r => r.driverId === selectedDriver.id)}
            />
          ) : null}
        </div>
      </div>

      {showInterviewModal && interviewDriverId && performanceData[interviewDriverId] && (
        <InterviewModal
          driver={drivers.find(d => d.id === interviewDriverId)!}
          performance={performanceData[interviewDriverId]}
          selectedAnomalyIds={getSelectedTrainingIds(interviewDriverId)}
          onSelectedChange={ids => setSelectedTrainingIds(interviewDriverId, ids)}
          weekStart={weekStart}
          weekEnd={weekEnd}
          fleetName={fleets.find(f => f.id === drivers.find(d => d.id === interviewDriverId)?.fleetId)?.name || ''}
          routeName={routes.find(r => r.id === drivers.find(d => d.id === interviewDriverId)?.routeId)?.name || ''}
          onClose={() => setShowInterviewModal(false)}
          onSave={(record) => {
            handleSaveInterview(record)
            setShowInterviewModal(false)
            alert('面谈记录已保存！可在「面谈记录」管理页查看')
          }}
        />
      )}
    </div>
  )
}

export default App
