import { useState, useMemo } from 'react'
import { Driver, DriverPerformance } from './types'
import { fleets, routes, drivers, generatePerformanceData } from './data/mockData'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import DriverDetail from './components/DriverDetail'
import InterviewModal from './components/InterviewModal'

function App() {
  const [weekStart, setWeekStart] = useState('2026-06-15')
  const [expandedFleets, setExpandedFleets] = useState<Set<string>>(new Set(['fleet-1', 'fleet-2', 'fleet-3']))
  const [selectedFleetId, setSelectedFleetId] = useState<string | null>(null)
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [interviewDriverId, setInterviewDriverId] = useState<string | null>(null)

  const performanceData = useMemo(() => generatePerformanceData(), [])

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
  }, [selectedFleetId, selectedRouteId, searchQuery])

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
  }

  const handleNextWeek = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    setWeekStart(d.toISOString().split('T')[0])
  }

  const selectedDriver: Driver | undefined = selectedDriverId
    ? drivers.find(d => d.id === selectedDriverId)
    : undefined

  const selectedPerf: DriverPerformance | undefined = selectedDriverId
    ? performanceData[selectedDriverId]
    : undefined

  return (
    <div className="app-container">
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
            <div className="week-label">{weekLabel} 运营数据</div>
            <button onClick={handleNextWeek} title="下一周">›</button>
            <button className="week-import-btn" style={{ marginLeft: 8 }}>
              📥 导入数据
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
              onBack={handleBackToList}
              onOpenInterview={() => handleOpenInterview(selectedDriver.id)}
            />
          ) : null}
        </div>
      </div>

      {showInterviewModal && interviewDriverId && (
        <InterviewModal
          driver={drivers.find(d => d.id === interviewDriverId)!}
          performance={performanceData[interviewDriverId]}
          onClose={() => setShowInterviewModal(false)}
        />
      )}
    </div>
  )
}

export default App
