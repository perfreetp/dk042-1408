import { useState, useMemo, useRef } from 'react'
import { Driver, DriverPerformance, Fleet, Route } from './types'
import {
  fleets as defaultFleets,
  routes as defaultRoutes,
  drivers as defaultDrivers,
  generatePerformanceData,
  validateAndParseImportedData,
  generateSampleExportData
} from './data/mockData'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import DriverDetail from './components/DriverDetail'
import InterviewModal from './components/InterviewModal'

function App() {
  const [weekStart, setWeekStart] = useState('2026-06-15')
  const [fleets, setFleets] = useState<Fleet[]>(defaultFleets)
  const [routes, setRoutes] = useState<Route[]>(defaultRoutes)
  const [drivers, setDrivers] = useState<Driver[]>(defaultDrivers)
  const [customPerformanceData, setCustomPerformanceData] = useState<Record<string, DriverPerformance> | null>(null)
  const [expandedFleets, setExpandedFleets] = useState<Set<string>>(new Set(['fleet-1', 'fleet-2', 'fleet-3']))
  const [selectedFleetId, setSelectedFleetId] = useState<string | null>(null)
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [interviewDriverId, setInterviewDriverId] = useState<string | null>(null)
  const [selectedTrainingIdsMap, setSelectedTrainingIdsMap] = useState<Record<string, Set<string>>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generatedPerformanceData = useMemo(() => generatePerformanceData(weekStart), [weekStart])
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
        setWeekStart(parsed.weekStart)
        setCustomPerformanceData(parsed.performances)
        if (parsed.drivers) setDrivers(parsed.drivers)
        if (parsed.routes) setRoutes(parsed.routes)
        if (parsed.fleets) setFleets(parsed.fleets)
        setSelectedTrainingIdsMap({})
        alert(`数据导入成功！已加载 ${parsed.weekStart} 周数据，共 ${Object.keys(parsed.performances).length} 名司机`)
      } else {
        alert('数据格式不正确，请选择有效的 JSON 数据文件')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleExportSample = () => {
    const data = generateSampleExportData(weekStart)
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

  const selectedDriver: Driver | undefined = selectedDriverId
    ? drivers.find(d => d.id === selectedDriverId)
    : undefined

  const selectedPerf: DriverPerformance | undefined = selectedDriverId
    ? performanceData[selectedDriverId]
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
          </div>
        </div>
        <div className="app-header-right">
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

        <div className="content-area" style={{ padding: selectedDriverId ? 0 : 20, overflowY: selectedDriverId ? 'hidden' : 'auto' }}>
          {!selectedDriverId ? (
            <Dashboard
              weekLabel={weekLabel}
              weekStart={weekStart}
              weekEnd={weekEnd}
              drivers={filteredDrivers}
              allDrivers={drivers}
              performanceData={performanceData}
              selectedFleetId={selectedFleetId}
              selectedRouteId={selectedRouteId}
              onSelectDriver={handleSelectDriver}
              onClearFleet={() => setSelectedFleetId(null)}
              onClearRoute={() => setSelectedRouteId(null)}
              onOpenInterview={handleOpenInterview}
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
          onClose={() => setShowInterviewModal(false)}
        />
      )}
    </div>
  )
}

export default App
