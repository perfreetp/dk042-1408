export interface Fleet {
  id: string
  name: string
  routeIds: string[]
}

export interface BusStop {
  id: string
  name: string
  scheduledTime: string
  order: number
  position: { x: number; y: number }
}

export interface Route {
  id: string
  name: string
  fleetId: string
  stops: BusStop[]
  path: { x: number; y: number }[]
}

export interface Driver {
  id: string
  name: string
  employeeId: string
  fleetId: string
  routeId: string
  avatar?: string
  phone: string
  hireDate: string
}

export type AnomalyType =
  | 'early_arrival'
  | 'late_arrival'
  | 'route_deviation'
  | 'sudden_brake'
  | 'sudden_turn'
  | 'gps_blank'
  | 'overspeed'

export interface Anomaly {
  id: string
  driverId: string
  routeId: string
  date: string
  type: AnomalyType
  time: string
  locationName: string
  position: { x: number; y: number }
  description: string
  severity: 'low' | 'medium' | 'high'
  details?: Record<string, string | number | undefined>
  selectedForTraining?: boolean
}

export interface TracePoint {
  time: string
  position: { x: number; y: number }
  speed: number
  timestamp: number
}

export interface DailyPerformance {
  date: string
  onTimeRate: number
  anomalyCount: number
  deviationCount: number
  gpsBlankMinutes: number
  suddenEvents: number
}

export interface DriverPerformance {
  driverId: string
  weekStart: string
  weekEnd: string
  totalTrips: number
  onTimeRate: number
  deviationCount: number
  suddenBrakeCount: number
  suddenTurnCount: number
  gpsBlankMinutes: number
  dailyStats: DailyPerformance[]
  anomalies: Anomaly[]
  trace: TracePoint[]
}

export interface InterviewNote {
  id?: string
  driverId: string
  driverName: string
  date: string
  nextReviewDate: string
  selectedAnomalies: string[]
  improvementRequirements: string
  notes: string
  supervisor: string
}
