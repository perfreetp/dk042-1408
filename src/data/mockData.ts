import { Fleet, Route, Driver, DriverPerformance, AnomalyType, Anomaly } from '../types'

export const ANOMALY_LABELS: Record<AnomalyType, string> = {
  early_arrival: '到站过早',
  late_arrival: '到站过晚',
  route_deviation: '线路偏离',
  sudden_brake: '急刹车',
  sudden_turn: '急转弯',
  gps_blank: 'GPS空白',
  overspeed: '超速行驶'
}

export const ANOMALY_COLORS: Record<AnomalyType, string> = {
  early_arrival: '#f59e0b',
  late_arrival: '#ef4444',
  route_deviation: '#8b5cf6',
  sudden_brake: '#dc2626',
  sudden_turn: '#ea580c',
  gps_blank: '#64748b',
  overspeed: '#b91c1c'
}

export const SEVERITY_LABELS = {
  low: '低',
  medium: '中',
  high: '高'
}

export const fleets: Fleet[] = [
  { id: 'fleet-1', name: '第一车队（城东片区）', routeIds: ['route-1', 'route-2'] },
  { id: 'fleet-2', name: '第二车队（城西片区）', routeIds: ['route-3', 'route-4'] },
  { id: 'fleet-3', name: '第三车队（郊线）', routeIds: ['route-5'] }
]

export const routes: Route[] = [
  {
    id: 'route-1',
    name: '1号线 · 阳光花园-实验小学',
    fleetId: 'fleet-1',
    path: [
      { x: 80, y: 380 }, { x: 160, y: 340 }, { x: 240, y: 300 }, { x: 320, y: 270 },
      { x: 400, y: 240 }, { x: 480, y: 220 }, { x: 560, y: 230 }, { x: 640, y: 260 },
      { x: 700, y: 300 }, { x: 760, y: 350 }
    ],
    stops: [
      { id: 's1-1', name: '阳光花园站', scheduledTime: '07:00', order: 1, position: { x: 80, y: 380 } },
      { id: 's1-2', name: '东湖路口站', scheduledTime: '07:05', order: 2, position: { x: 240, y: 300 } },
      { id: 's1-3', name: '文化宫站', scheduledTime: '07:12', order: 3, position: { x: 400, y: 240 } },
      { id: 's1-4', name: '人民广场站', scheduledTime: '07:20', order: 4, position: { x: 560, y: 230 } },
      { id: 's1-5', name: '实验小学站', scheduledTime: '07:30', order: 5, position: { x: 760, y: 350 } }
    ]
  },
  {
    id: 'route-2',
    name: '2号线 · 翠湖小区-第二小学',
    fleetId: 'fleet-1',
    path: [
      { x: 100, y: 420 }, { x: 180, y: 400 }, { x: 280, y: 380 }, { x: 380, y: 370 },
      { x: 480, y: 380 }, { x: 580, y: 400 }, { x: 680, y: 420 }, { x: 760, y: 440 }
    ],
    stops: [
      { id: 's2-1', name: '翠湖小区站', scheduledTime: '06:55', order: 1, position: { x: 100, y: 420 } },
      { id: 's2-2', name: '体育中心站', scheduledTime: '07:03', order: 2, position: { x: 280, y: 380 } },
      { id: 's2-3', name: '图书馆站', scheduledTime: '07:12', order: 3, position: { x: 480, y: 380 } },
      { id: 's2-4', name: '第二小学站', scheduledTime: '07:25', order: 4, position: { x: 760, y: 440 } }
    ]
  },
  {
    id: 'route-3',
    name: '3号线 · 金色家园-育才中学',
    fleetId: 'fleet-2',
    path: [
      { x: 60, y: 200 }, { x: 140, y: 180 }, { x: 240, y: 160 }, { x: 340, y: 150 },
      { x: 440, y: 160 }, { x: 540, y: 180 }, { x: 640, y: 200 }, { x: 740, y: 220 }
    ],
    stops: [
      { id: 's3-1', name: '金色家园站', scheduledTime: '07:10', order: 1, position: { x: 60, y: 200 } },
      { id: 's3-2', name: '科技园站', scheduledTime: '07:18', order: 2, position: { x: 240, y: 160 } },
      { id: 's3-3', name: '软件园站', scheduledTime: '07:28', order: 3, position: { x: 440, y: 160 } },
      { id: 's3-4', name: '育才中学站', scheduledTime: '07:40', order: 4, position: { x: 740, y: 220 } }
    ]
  },
  {
    id: 'route-4',
    name: '4号线 · 西湖名邸-附属小学',
    fleetId: 'fleet-2',
    path: [
      { x: 90, y: 460 }, { x: 180, y: 470 }, { x: 300, y: 490 }, { x: 420, y: 500 },
      { x: 540, y: 490 }, { x: 660, y: 470 }, { x: 760, y: 450 }
    ],
    stops: [
      { id: 's4-1', name: '西湖名邸站', scheduledTime: '06:50', order: 1, position: { x: 90, y: 460 } },
      { id: 's4-2', name: '会展中心站', scheduledTime: '07:02', order: 2, position: { x: 300, y: 490 } },
      { id: 's4-3', name: '博物馆站', scheduledTime: '07:15', order: 3, position: { x: 540, y: 490 } },
      { id: 's4-4', name: '附属小学站', scheduledTime: '07:28', order: 4, position: { x: 760, y: 450 } }
    ]
  },
  {
    id: 'route-5',
    name: '5号线 · 幸福新村-实验中学（郊线）',
    fleetId: 'fleet-3',
    path: [
      { x: 50, y: 520 }, { x: 150, y: 510 }, { x: 280, y: 500 }, { x: 420, y: 480 },
      { x: 560, y: 430 }, { x: 680, y: 380 }, { x: 770, y: 320 }
    ],
    stops: [
      { id: 's5-1', name: '幸福新村站', scheduledTime: '06:40', order: 1, position: { x: 50, y: 520 } },
      { id: 's5-2', name: '东风乡站', scheduledTime: '06:58', order: 2, position: { x: 280, y: 500 } },
      { id: 's5-3', name: '红旗镇站', scheduledTime: '07:20', order: 3, position: { x: 560, y: 430 } },
      { id: 's5-4', name: '实验中学站', scheduledTime: '07:45', order: 4, position: { x: 770, y: 320 } }
    ]
  }
]

export const drivers: Driver[] = [
  { id: 'd-001', name: '张建国', employeeId: 'DRV2023001', fleetId: 'fleet-1', routeId: 'route-1', phone: '138****1234', hireDate: '2020-03-15' },
  { id: 'd-002', name: '李明华', employeeId: 'DRV2023002', fleetId: 'fleet-1', routeId: 'route-1', phone: '139****5678', hireDate: '2019-07-22' },
  { id: 'd-003', name: '王志强', employeeId: 'DRV2023003', fleetId: 'fleet-1', routeId: 'route-2', phone: '137****9012', hireDate: '2021-01-10' },
  { id: 'd-004', name: '赵德胜', employeeId: 'DRV2023004', fleetId: 'fleet-2', routeId: 'route-3', phone: '136****3456', hireDate: '2018-11-05' },
  { id: 'd-005', name: '刘建军', employeeId: 'DRV2023005', fleetId: 'fleet-2', routeId: 'route-3', phone: '135****7890', hireDate: '2022-05-18' },
  { id: 'd-006', name: '陈海涛', employeeId: 'DRV2023006', fleetId: 'fleet-2', routeId: 'route-4', phone: '138****2345', hireDate: '2020-09-30' },
  { id: 'd-007', name: '周大伟', employeeId: 'DRV2023007', fleetId: 'fleet-3', routeId: 'route-5', phone: '139****6789', hireDate: '2017-06-12' },
  { id: 'd-008', name: '吴明辉', employeeId: 'DRV2023008', fleetId: 'fleet-3', routeId: 'route-5', phone: '137****0123', hireDate: '2021-08-25' }
]

function generateDateList(weekStart: string): string[] {
  const dates: string[] = []
  const base = new Date(weekStart)
  for (let i = 0; i < 7; i++) {
    const d = new Date(base)
    d.setDate(d.getDate() + i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function getWeekSeed(weekStart: string, driverId: string): number {
  let hash = 0
  const str = weekStart + driverId
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export function generatePerformanceData(weekStart: string): Record<string, DriverPerformance> {
  const result: Record<string, DriverPerformance> = {}
  const dateList = generateDateList(weekStart)

  const driverConfigs: Record<string, { onTime: number; deviate: number; brake: number; turn: number; blank: number }> = {
    'd-001': { onTime: 94, deviate: 2, brake: 3, turn: 1, blank: 8 },
    'd-002': { onTime: 88, deviate: 5, brake: 6, turn: 3, blank: 22 },
    'd-003': { onTime: 91, deviate: 3, brake: 4, turn: 2, blank: 12 },
    'd-004': { onTime: 96, deviate: 1, brake: 2, turn: 0, blank: 4 },
    'd-005': { onTime: 82, deviate: 7, brake: 8, turn: 5, blank: 35 },
    'd-006': { onTime: 89, deviate: 4, brake: 5, turn: 2, blank: 18 },
    'd-007': { onTime: 93, deviate: 2, brake: 3, turn: 1, blank: 10 },
    'd-008': { onTime: 85, deviate: 6, brake: 7, turn: 4, blank: 28 }
  }

  drivers.forEach(driver => {
    const seed = getWeekSeed(weekStart, driver.id)
    const rand = seededRandom(seed)
    const cfg = driverConfigs[driver.id]

    const weeklyVariation = (rand() * 6 - 3)
    const adjustedOnTime = Math.max(60, Math.min(99, cfg.onTime + weeklyVariation))
    const adjustedDeviate = Math.max(0, Math.round(cfg.deviate + (rand() * 3 - 1.5)))
    const adjustedBrake = Math.max(0, Math.round(cfg.brake + (rand() * 4 - 2)))
    const adjustedTurn = Math.max(0, Math.round(cfg.turn + (rand() * 2 - 1)))
    const adjustedBlank = Math.max(0, Math.round(cfg.blank + (rand() * 10 - 5)))

    const dailyStats = dateList.map(date => ({
      date,
      onTimeRate: Math.max(50, Math.min(100, adjustedOnTime + (rand() * 16 - 8))),
      anomalyCount: Math.max(0, Math.round((adjustedDeviate + adjustedBrake + adjustedTurn) / 7 + (rand() * 2 - 1))),
      deviationCount: Math.max(0, Math.round(adjustedDeviate / 7 + (rand() * 1.5 - 0.5))),
      gpsBlankMinutes: Math.max(0, Math.round(adjustedBlank / 7 + (rand() * 4 - 2))),
      suddenEvents: Math.max(0, Math.round((adjustedBrake + adjustedTurn) / 7 + (rand() * 1.5 - 0.5)))
    }))

    const anomalies = generateAnomalies(driver, {
      onTime: adjustedOnTime,
      deviate: adjustedDeviate,
      brake: adjustedBrake,
      turn: adjustedTurn,
      blank: adjustedBlank
    }, dateList, seed)

    const trace = generateTrace(routes.find(r => r.id === driver.routeId)!, seed)

    result[driver.id] = {
      driverId: driver.id,
      weekStart,
      weekEnd: dateList[6],
      totalTrips: 10,
      onTimeRate: Math.round(adjustedOnTime),
      deviationCount: adjustedDeviate,
      suddenBrakeCount: adjustedBrake,
      suddenTurnCount: adjustedTurn,
      gpsBlankMinutes: adjustedBlank,
      dailyStats,
      anomalies,
      trace
    }
  })

  return result
}

function generateAnomalies(
  driver: Driver,
  cfg: { onTime: number; deviate: number; brake: number; turn: number; blank: number },
  dateList: string[],
  seed: number
): Anomaly[] {
  const route = routes.find(r => r.id === driver.routeId)!
  const anomalies: Anomaly[] = []
  let id = 0
  const rand = seededRandom(seed + 1000)

  const earlyCount = Math.max(0, Math.round((100 - cfg.onTime) / 4 + rand() * 2 - 1))
  const lateCount = Math.max(0, Math.round((100 - cfg.onTime) / 6 + rand() * 2 - 1))

  for (let i = 0; i < earlyCount; i++) {
    const stop = route.stops[Math.floor(rand() * route.stops.length)]
    const minutes = Math.floor(rand() * 5) + 1
    anomalies.push({
      id: `${driver.id}-a-${id++}`,
      driverId: driver.id,
      routeId: driver.routeId,
      date: dateList[Math.floor(rand() * 5)],
      type: 'early_arrival',
      time: `${String(7 + Math.floor(rand() * 1)).padStart(2, '0')}:${String(Math.floor(rand() * 60)).padStart(2, '0')}`,
      locationName: stop.name,
      position: { ...stop.position },
      description: `到站时间早于计划 ${minutes} 分钟，学生候车时间不足`,
      severity: minutes >= 4 ? 'high' : minutes >= 2 ? 'medium' : 'low',
      details: {
        scheduledTime: stop.scheduledTime,
        actualTime: addMinutes(stop.scheduledTime, -minutes),
        waitTimeDiff: `${minutes} 分钟`,
        studentCount: String(Math.floor(rand() * 8) + 3)
      },
      selectedForTraining: false
    })
  }

  for (let i = 0; i < lateCount; i++) {
    const stop = route.stops[Math.floor(rand() * route.stops.length)]
    const minutes = Math.floor(rand() * 8) + 2
    anomalies.push({
      id: `${driver.id}-a-${id++}`,
      driverId: driver.id,
      routeId: driver.routeId,
      date: dateList[Math.floor(rand() * 5)],
      type: 'late_arrival',
      time: `${String(7 + Math.floor(rand() * 1)).padStart(2, '0')}:${String(Math.floor(rand() * 60)).padStart(2, '0')}`,
      locationName: stop.name,
      position: { ...stop.position },
      description: `到站时间晚于计划 ${minutes} 分钟，学生候车超时`,
      severity: minutes >= 6 ? 'high' : minutes >= 3 ? 'medium' : 'low',
      details: {
        scheduledTime: stop.scheduledTime,
        actualTime: addMinutes(stop.scheduledTime, minutes),
        waitTimeDiff: `${minutes} 分钟`,
        studentCount: String(Math.floor(rand() * 10) + 5)
      },
      selectedForTraining: false
    })
  }

  for (let i = 0; i < cfg.deviate; i++) {
    const pathIdx = Math.floor(rand() * route.path.length)
    const basePos = route.path[pathIdx]
    anomalies.push({
      id: `${driver.id}-a-${id++}`,
      driverId: driver.id,
      routeId: driver.routeId,
      date: dateList[Math.floor(rand() * 5)],
      type: 'route_deviation',
      time: `${String(7 + Math.floor(rand() * 1)).padStart(2, '0')}:${String(Math.floor(rand() * 60)).padStart(2, '0')}`,
      locationName: `${basePos.x > 400 ? '城区段' : '城郊段'}偏离`,
      position: { x: basePos.x + (rand() * 60 - 30), y: basePos.y + (rand() * 60 - 30) },
      description: `偏离规划线路约 ${(rand() * 300 + 50).toFixed(0)} 米`,
      severity: rand() > 0.6 ? 'high' : rand() > 0.3 ? 'medium' : 'low',
      details: {
        deviationDistance: `${(rand() * 300 + 50).toFixed(0)} 米`,
        duration: `${Math.floor(rand() * 5 + 1)} 分钟`
      },
      selectedForTraining: false
    })
  }

  for (let i = 0; i < cfg.brake; i++) {
    const pathIdx = Math.floor(rand() * route.path.length)
    const basePos = route.path[pathIdx]
    anomalies.push({
      id: `${driver.id}-a-${id++}`,
      driverId: driver.id,
      routeId: driver.routeId,
      date: dateList[Math.floor(rand() * 5)],
      type: 'sudden_brake',
      time: `${String(7 + Math.floor(rand() * 1)).padStart(2, '0')}:${String(Math.floor(rand() * 60)).padStart(2, '0')}`,
      locationName: pathIdx < route.path.length / 2 ? '上行路段' : '下行路段',
      position: { ...basePos },
      description: `急减速，减速度 ${(rand() * 3 + 4).toFixed(1)} m/s²`,
      severity: rand() > 0.5 ? 'high' : 'medium',
      details: {
        deceleration: `${(rand() * 3 + 4).toFixed(1)} m/s²`,
        speedBefore: `${Math.floor(rand() * 20 + 30)} km/h`,
        speedAfter: `${Math.floor(rand() * 10 + 5)} km/h`
      },
      selectedForTraining: false
    })
  }

  for (let i = 0; i < cfg.turn; i++) {
    const pathIdx = Math.floor(rand() * route.path.length)
    const basePos = route.path[pathIdx]
    anomalies.push({
      id: `${driver.id}-a-${id++}`,
      driverId: driver.id,
      routeId: driver.routeId,
      date: dateList[Math.floor(rand() * 5)],
      type: 'sudden_turn',
      time: `${String(7 + Math.floor(rand() * 1)).padStart(2, '0')}:${String(Math.floor(rand() * 60)).padStart(2, '0')}`,
      locationName: '路口转弯处',
      position: { ...basePos },
      description: `急转弯，横向加速度 ${(rand() * 2 + 2.5).toFixed(1)} m/s²`,
      severity: rand() > 0.5 ? 'medium' : 'low',
      details: {
        lateralAcceleration: `${(rand() * 2 + 2.5).toFixed(1)} m/s²`,
        speed: `${Math.floor(rand() * 15 + 20)} km/h`
      },
      selectedForTraining: false
    })
  }

  if (cfg.blank > 10) {
    anomalies.push({
      id: `${driver.id}-a-${id++}`,
      driverId: driver.id,
      routeId: driver.routeId,
      date: dateList[Math.floor(rand() * 5)],
      type: 'gps_blank',
      time: '07:00 - 07:25',
      locationName: '信号盲区段',
      position: route.path[Math.floor(route.path.length / 2)],
      description: `GPS信号中断累计 ${cfg.blank} 分钟，轨迹不完整`,
      severity: cfg.blank > 25 ? 'high' : cfg.blank > 15 ? 'medium' : 'low',
      details: {
        blankDuration: `${cfg.blank} 分钟`,
        segment: '中途段'
      },
      selectedForTraining: false
    })
  }

  return anomalies.sort((a, b) => a.time.localeCompare(b.time))
}

function generateTrace(route: Route, seed: number) {
  const rand = seededRandom(seed + 2000)
  const points = []
  const startTime = 7 * 60
  for (let i = 0; i < route.path.length; i++) {
    const p = route.path[i]
    const t = startTime + i * 4
    points.push({
      time: `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`,
      position: { x: p.x + (rand() * 6 - 3), y: p.y + (rand() * 6 - 3) },
      speed: rand() * 20 + 25,
      timestamp: t
    })
  }
  return points
}

function addMinutes(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(':').map(Number)
  const total = h * 60 + m + minutes
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export interface ImportedData {
  weekStart: string
  performances: Record<string, DriverPerformance>
  drivers?: Driver[]
  routes?: Route[]
  fleets?: Fleet[]
}

export function validateAndParseImportedData(json: string): ImportedData | null {
  try {
    const data = JSON.parse(json)
    if (!data.weekStart || !data.performances) return null
    return data as ImportedData
  } catch {
    return null
  }
}

export function generateSampleExportData(weekStart: string): string {
  const performances = generatePerformanceData(weekStart)
  return JSON.stringify({
    weekStart,
    performances,
    drivers,
    routes,
    fleets
  }, null, 2)
}

export function generatePerformanceDataWithDrivers(
  weekStart: string,
  customDrivers: Driver[],
  customRoutes: Route[] = routes,
  _customFleets: Fleet[] = fleets
): Record<string, DriverPerformance> {
  const result: Record<string, DriverPerformance> = {}
  const dateList = generateDateList(weekStart)

  customDrivers.forEach(driver => {
    const seed = getWeekSeed(weekStart, driver.id)
    const rand = seededRandom(seed)

    const baseOnTime = 85 + (rand() * 12)
    const adjustedOnTime = Math.max(60, Math.min(99, baseOnTime + (rand() * 6 - 3)))
    const adjustedDeviate = Math.max(0, Math.round(rand() * 7))
    const adjustedBrake = Math.max(0, Math.round(rand() * 8))
    const adjustedTurn = Math.max(0, Math.round(rand() * 5))
    const adjustedBlank = Math.max(0, Math.round(rand() * 35))

    const dailyStats = dateList.map(date => ({
      date,
      onTimeRate: Math.max(50, Math.min(100, adjustedOnTime + (rand() * 16 - 8))),
      anomalyCount: Math.max(0, Math.round((adjustedDeviate + adjustedBrake + adjustedTurn) / 7 + (rand() * 2 - 1))),
      deviationCount: Math.max(0, Math.round(adjustedDeviate / 7 + (rand() * 1.5 - 0.5))),
      gpsBlankMinutes: Math.max(0, Math.round(adjustedBlank / 7 + (rand() * 4 - 2))),
      suddenEvents: Math.max(0, Math.round((adjustedBrake + adjustedTurn) / 7 + (rand() * 1.5 - 0.5)))
    }))

    const routeForDriver = customRoutes.find(r => r.id === driver.routeId) || customRoutes[0]

    const anomalies = generateAnomaliesForCustom(driver, {
      onTime: adjustedOnTime,
      deviate: adjustedDeviate,
      brake: adjustedBrake,
      turn: adjustedTurn,
      blank: adjustedBlank
    }, dateList, seed, routeForDriver)

    const trace = generateTrace(routeForDriver, seed)

    result[driver.id] = {
      driverId: driver.id,
      weekStart,
      weekEnd: dateList[6],
      totalTrips: 10,
      onTimeRate: Math.round(adjustedOnTime),
      deviationCount: adjustedDeviate,
      suddenBrakeCount: adjustedBrake,
      suddenTurnCount: adjustedTurn,
      gpsBlankMinutes: adjustedBlank,
      dailyStats,
      anomalies,
      trace
    }
  })

  return result
}

function generateAnomaliesForCustom(
  driver: Driver,
  cfg: { onTime: number; deviate: number; brake: number; turn: number; blank: number },
  dateList: string[],
  seed: number,
  route: Route
): Anomaly[] {
  const anomalies: Anomaly[] = []
  let id = 0
  const rand = seededRandom(seed + 1000)

  const earlyCount = Math.max(0, Math.round((100 - cfg.onTime) / 4 + rand() * 2 - 1))
  const lateCount = Math.max(0, Math.round((100 - cfg.onTime) / 6 + rand() * 2 - 1))

  for (let i = 0; i < earlyCount; i++) {
    const stop = route.stops[Math.floor(rand() * route.stops.length)]
    const minutes = Math.floor(rand() * 5) + 1
    anomalies.push({
      id: `${driver.id}-a-${id++}`,
      driverId: driver.id,
      routeId: driver.routeId,
      date: dateList[Math.floor(rand() * 5)],
      type: 'early_arrival',
      time: `${String(7 + Math.floor(rand() * 1)).padStart(2, '0')}:${String(Math.floor(rand() * 60)).padStart(2, '0')}`,
      locationName: stop.name,
      position: { ...stop.position },
      description: `到站时间早于计划 ${minutes} 分钟，学生候车时间不足`,
      severity: minutes >= 4 ? 'high' : minutes >= 2 ? 'medium' : 'low',
      details: {
        scheduledTime: stop.scheduledTime,
        actualTime: addMinutes(stop.scheduledTime, -minutes),
        waitTimeDiff: `${minutes} 分钟`,
        studentCount: String(Math.floor(rand() * 8) + 3)
      },
      selectedForTraining: false
    })
  }

  for (let i = 0; i < lateCount; i++) {
    const stop = route.stops[Math.floor(rand() * route.stops.length)]
    const minutes = Math.floor(rand() * 8) + 2
    anomalies.push({
      id: `${driver.id}-a-${id++}`,
      driverId: driver.id,
      routeId: driver.routeId,
      date: dateList[Math.floor(rand() * 5)],
      type: 'late_arrival',
      time: `${String(7 + Math.floor(rand() * 1)).padStart(2, '0')}:${String(Math.floor(rand() * 60)).padStart(2, '0')}`,
      locationName: stop.name,
      position: { ...stop.position },
      description: `到站时间晚于计划 ${minutes} 分钟，学生候车超时`,
      severity: minutes >= 6 ? 'high' : minutes >= 3 ? 'medium' : 'low',
      details: {
        scheduledTime: stop.scheduledTime,
        actualTime: addMinutes(stop.scheduledTime, minutes),
        waitTimeDiff: `${minutes} 分钟`,
        studentCount: String(Math.floor(rand() * 10) + 5)
      },
      selectedForTraining: false
    })
  }

  for (let i = 0; i < cfg.deviate; i++) {
    const pathIdx = Math.floor(rand() * route.path.length)
    const basePos = route.path[pathIdx]
    anomalies.push({
      id: `${driver.id}-a-${id++}`,
      driverId: driver.id,
      routeId: driver.routeId,
      date: dateList[Math.floor(rand() * 5)],
      type: 'route_deviation',
      time: `${String(7 + Math.floor(rand() * 1)).padStart(2, '0')}:${String(Math.floor(rand() * 60)).padStart(2, '0')}`,
      locationName: `${basePos.x > 400 ? '城区段' : '城郊段'}偏离`,
      position: { x: basePos.x + (rand() * 60 - 30), y: basePos.y + (rand() * 60 - 30) },
      description: `偏离规划线路约 ${(rand() * 300 + 50).toFixed(0)} 米`,
      severity: rand() > 0.6 ? 'high' : rand() > 0.3 ? 'medium' : 'low',
      details: {
        deviationDistance: `${(rand() * 300 + 50).toFixed(0)} 米`,
        duration: `${Math.floor(rand() * 5 + 1)} 分钟`
      },
      selectedForTraining: false
    })
  }

  for (let i = 0; i < cfg.brake; i++) {
    const pathIdx = Math.floor(rand() * route.path.length)
    const basePos = route.path[pathIdx]
    anomalies.push({
      id: `${driver.id}-a-${id++}`,
      driverId: driver.id,
      routeId: driver.routeId,
      date: dateList[Math.floor(rand() * 5)],
      type: 'sudden_brake',
      time: `${String(7 + Math.floor(rand() * 1)).padStart(2, '0')}:${String(Math.floor(rand() * 60)).padStart(2, '0')}`,
      locationName: pathIdx < route.path.length / 2 ? '上行路段' : '下行路段',
      position: { ...basePos },
      description: `急减速，减速度 ${(rand() * 3 + 4).toFixed(1)} m/s²`,
      severity: rand() > 0.5 ? 'high' : 'medium',
      details: {
        deceleration: `${(rand() * 3 + 4).toFixed(1)} m/s²`,
        speedBefore: `${Math.floor(rand() * 20 + 30)} km/h`,
        speedAfter: `${Math.floor(rand() * 10 + 5)} km/h`
      },
      selectedForTraining: false
    })
  }

  for (let i = 0; i < cfg.turn; i++) {
    const pathIdx = Math.floor(rand() * route.path.length)
    const basePos = route.path[pathIdx]
    anomalies.push({
      id: `${driver.id}-a-${id++}`,
      driverId: driver.id,
      routeId: driver.routeId,
      date: dateList[Math.floor(rand() * 5)],
      type: 'sudden_turn',
      time: `${String(7 + Math.floor(rand() * 1)).padStart(2, '0')}:${String(Math.floor(rand() * 60)).padStart(2, '0')}`,
      locationName: '路口转弯处',
      position: { ...basePos },
      description: `急转弯，横向加速度 ${(rand() * 2 + 2.5).toFixed(1)} m/s²`,
      severity: rand() > 0.5 ? 'medium' : 'low',
      details: {
        lateralAcceleration: `${(rand() * 2 + 2.5).toFixed(1)} m/s²`,
        speed: `${Math.floor(rand() * 15 + 20)} km/h`
      },
      selectedForTraining: false
    })
  }

  if (cfg.blank > 10) {
    anomalies.push({
      id: `${driver.id}-a-${id++}`,
      driverId: driver.id,
      routeId: driver.routeId,
      date: dateList[Math.floor(rand() * 5)],
      type: 'gps_blank',
      time: '07:00 - 07:25',
      locationName: '信号盲区段',
      position: route.path[Math.floor(route.path.length / 2)],
      description: `GPS信号中断累计 ${cfg.blank} 分钟，轨迹不完整`,
      severity: cfg.blank > 25 ? 'high' : cfg.blank > 15 ? 'medium' : 'low',
      details: {
        blankDuration: `${cfg.blank} 分钟`,
        segment: '中途段'
      },
      selectedForTraining: false
    })
  }

  return anomalies.sort((a, b) => a.time.localeCompare(b.time))
}

import type { DriverRiskProfile, RiskLevel, StoredInterviewRecord } from '../types'

export function calculateRiskProfiles(
  driverList: Driver[],
  routeList: Route[],
  fleetList: Fleet[],
  currentWeekStart: string,
  interviewRecords: StoredInterviewRecord[] = []
): DriverRiskProfile[] {
  const weekOffsets = [0, -7, -14, -21, -28]
  const weekStarts = weekOffsets.map(offset => {
    const d = new Date(currentWeekStart)
    d.setDate(d.getDate() + offset)
    return d.toISOString().split('T')[0]
  }).reverse()

  const profiles: DriverRiskProfile[] = []

  driverList.forEach(driver => {
    const weeklyTrend = weekStarts.map(ws => {
      const seed = getWeekSeed(ws, driver.id)
      const rand = seededRandom(seed)
      const onTime = Math.max(60, Math.min(99, 85 + (rand() * 12)))
      const anomalyCount = Math.max(0, Math.round(rand() * 20))
      const gpsBlank = Math.max(0, Math.round(rand() * 35))
      return { weekStart: ws, onTimeRate: Math.round(onTime), anomalyCount, gpsBlankMinutes: gpsBlank }
    })

    const recent3Weeks = weeklyTrend.slice(-3)
    const avgOnTimeRate = recent3Weeks.reduce((s, w) => s + w.onTimeRate, 0) / 3
    const avgAnomalyCount = recent3Weeks.reduce((s, w) => s + w.anomalyCount, 0) / 3
    const avgGpsBlank = recent3Weeks.reduce((s, w) => s + w.gpsBlankMinutes, 0) / 3

    const onTimeRates = weeklyTrend.map(w => w.onTimeRate)
    const recentOnTime = onTimeRates.slice(-2)
    const olderOnTime = onTimeRates.slice(0, -2)
    const recentAvg = recentOnTime.reduce((s, v) => s + v, 0) / Math.max(1, recentOnTime.length)
    const olderAvg = olderOnTime.reduce((s, v) => s + v, 0) / Math.max(1, olderOnTime.length)
    const onTimeRateTrend: 'stable' | 'improving' | 'declining' =
      recentAvg - olderAvg > 3 ? 'improving' :
      recentAvg - olderAvg < -3 ? 'declining' : 'stable'

    let consecutiveWeeksWithIssues = 0
    for (let i = weeklyTrend.length - 1; i >= 0; i--) {
      if (weeklyTrend[i].anomalyCount >= 8 || weeklyTrend[i].onTimeRate < 85 || weeklyTrend[i].gpsBlankMinutes >= 20) {
        consecutiveWeeksWithIssues++
      } else {
        break
      }
    }

    const riskFactors: string[] = []
    if (avgOnTimeRate < 85) riskFactors.push('准点率低于 85%')
    if (onTimeRateTrend === 'declining') riskFactors.push('准点率呈下降趋势')
    if (avgAnomalyCount > 10) riskFactors.push('异常数量偏高（周均 > 10 次）')
    if (consecutiveWeeksWithIssues >= 2) riskFactors.push(`连续 ${consecutiveWeeksWithIssues} 周存在问题`)
    if (avgGpsBlank > 20) riskFactors.push('GPS 空白时长偏高（周均 > 20 分钟）')

    const driverInterviews = interviewRecords.filter(r => r.driverId === driver.id)
      .sort((a, b) => b.date.localeCompare(a.date))
    const lastInterview = driverInterviews[0]
    if (lastInterview && new Date().toISOString().split('T')[0] > lastInterview.nextReviewDate) {
      riskFactors.push('已超过下次观察日期')
    }

    let riskScore = 0
    riskScore += Math.max(0, 100 - avgOnTimeRate)
    riskScore += avgAnomalyCount * 2
    riskScore += consecutiveWeeksWithIssues * 10
    riskScore += avgGpsBlank * 0.5
    if (onTimeRateTrend === 'declining') riskScore += 15

    let riskLevel: RiskLevel = 'low'
    if (riskScore >= 50) riskLevel = 'critical'
    else if (riskScore >= 35) riskLevel = 'high'
    else if (riskScore >= 20) riskLevel = 'medium'

    const recommendedActions: string[] = []
    if (riskLevel === 'critical') {
      recommendedActions.push('立即安排专项面谈，讨论近期严重问题')
      recommendedActions.push('安排跟车检查，现场观察驾驶行为')
      recommendedActions.push('下周起每日复盘重点监控')
    } else if (riskLevel === 'high') {
      recommendedActions.push('安排面谈记录，明确改进要求')
      recommendedActions.push('对比历史数据，查找问题根因')
      recommendedActions.push('下两周列为重点关注对象')
    } else if (riskLevel === 'medium') {
      recommendedActions.push('在下周车队例会上点名提醒')
      recommendedActions.push('检查线路是否存在特殊路况导致异常')
    } else {
      recommendedActions.push('保持正常监控频率')
      recommendedActions.push('可作为正面案例分享')
    }
    if (avgGpsBlank > 20) {
      recommendedActions.push('检查车辆 GPS 设备是否正常工作')
    }
    if (onTimeRateTrend === 'declining') {
      recommendedActions.push('了解司机近期是否有个人情况影响驾驶')
    }

    const route = routeList.find(r => r.id === driver.routeId)
    const fleet = fleetList.find(f => f.id === driver.fleetId)

    profiles.push({
      driverId: driver.id,
      driverName: driver.name,
      fleetId: driver.fleetId,
      fleetName: fleet?.name || '未分配车队',
      routeId: driver.routeId,
      routeName: route?.name || '未分配线路',
      riskLevel,
      riskScore: Math.round(riskScore),
      riskFactors,
      recommendedActions,
      weeklyTrend,
      consecutiveWeeksWithIssues,
      onTimeRateTrend,
      lastInterviewDate: lastInterview?.date,
      nextReviewDate: lastInterview?.nextReviewDate
    })
  })

  return profiles.sort((a, b) => b.riskScore - a.riskScore)
}

export function computeDataHash(obj: unknown): string {
  const str = JSON.stringify(obj)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}
