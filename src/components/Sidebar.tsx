import { useMemo } from 'react'
import { Fleet, Route, Driver, DriverPerformance } from '../types'

interface SidebarProps {
  fleets: Fleet[]
  routes: Route[]
  drivers: Driver[]
  performanceData: Record<string, DriverPerformance>
  expandedFleets: Set<string>
  selectedFleetId: string | null
  selectedRouteId: string | null
  selectedDriverId: string | null
  searchQuery: string
  onToggleFleet: (id: string) => void
  onSelectFleet: (id: string | null) => void
  onSelectRoute: (id: string | null) => void
  onSelectDriver: (id: string) => void
  onSearch: (q: string) => void
}

function getRateClass(rate: number) {
  if (rate >= 93) return 'good'
  if (rate >= 85) return 'warn'
  return 'bad'
}

function Sidebar({
  fleets,
  routes,
  drivers,
  performanceData,
  expandedFleets,
  selectedFleetId,
  selectedRouteId,
  selectedDriverId,
  searchQuery,
  onToggleFleet,
  onSelectFleet,
  onSelectRoute,
  onSelectDriver,
  onSearch
}: SidebarProps) {
  const routesByFleet = useMemo(() => {
    const map: Record<string, Route[]> = {}
    routes.forEach(r => {
      if (!map[r.fleetId]) map[r.fleetId] = []
      map[r.fleetId].push(r)
    })
    return map
  }, [routes])

  const driversByRoute = useMemo(() => {
    const map: Record<string, Driver[]> = {}
    drivers.forEach(d => {
      if (!map[d.routeId]) map[d.routeId] = []
      map[d.routeId].push(d)
    })
    return map
  }, [drivers])

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">车队导航</div>
        <div className="sidebar-search">
          <input
            type="text"
            placeholder="搜索司机姓名或工号..."
            value={searchQuery}
            onChange={e => onSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="sidebar-content">
        <div
          className={`route-item ${!selectedFleetId && !selectedRouteId ? 'active' : ''}`}
          style={{ paddingLeft: 16, marginTop: 4 }}
          onClick={() => { onSelectFleet(null); onSelectRoute(null) }}
        >
          <span style={{ marginRight: 8 }}>📊</span>
          全部车队概览
        </div>

        {fleets.map(fleet => (
          <div key={fleet.id} className="fleet-group">
            <div
              className="fleet-header"
              onClick={() => onToggleFleet(fleet.id)}
            >
              <div className="fleet-header-left">
                <div className="fleet-icon">🚍</div>
                <div
                  className="fleet-name"
                  onClick={e => { e.stopPropagation(); onSelectFleet(fleet.id); onSelectRoute(null) }}
                  style={selectedFleetId === fleet.id && !selectedRouteId ? { color: 'var(--accent)' } : {}}
                >
                  {fleet.name}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="fleet-count">
                  {(driversByRoute[fleet.routeIds[0]]?.length || 0) + (driversByRoute[fleet.routeIds[1]]?.length || 0) || 0} 人
                </span>
                <span className={`fleet-chevron ${expandedFleets.has(fleet.id) ? 'expanded' : ''}`}>
                  ▶
                </span>
              </div>
            </div>

            {expandedFleets.has(fleet.id) && (
              <div className="route-list">
                {routesByFleet[fleet.id]?.map(route => (
                  <div key={route.id}>
                    <div
                      className={`route-item ${selectedRouteId === route.id ? 'active' : ''}`}
                      onClick={() => { onSelectRoute(route.id); onSelectFleet(null) }}
                    >
                      <span style={{ marginRight: 8 }}>🛣️</span>
                      {route.name}
                    </div>
                    {driversByRoute[route.id]?.map(driver => {
                      const perf = performanceData[driver.id]
                      return (
                        <div
                          key={driver.id}
                          className={`driver-item ${selectedDriverId === driver.id ? 'active' : ''}`}
                          onClick={() => onSelectDriver(driver.id)}
                        >
                          <div className="driver-avatar-sm" style={{
                            background: selectedDriverId === driver.id
                              ? 'linear-gradient(135deg, var(--accent), var(--purple))'
                              : 'var(--bg-tertiary)'
                          }}>
                            {driver.name.charAt(0)}
                          </div>
                          <div className="driver-info-sm">
                            <div className="driver-name-sm">{driver.name}</div>
                            <div className="driver-meta-sm">{driver.employeeId}</div>
                          </div>
                          {perf && (
                            <div className={`driver-rate-sm ${getRateClass(perf.onTimeRate)}`}>
                              {perf.onTimeRate}%
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}

export default Sidebar
