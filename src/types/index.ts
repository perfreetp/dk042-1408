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
  driverEmployeeId?: string
  driverPhone?: string
  weekStart: string
  weekEnd: string
  interviewDate: string
  nextReviewDate: string
  selectedAnomalyIds: string[]
  anomalySummaries: Array<{
    type: AnomalyType
    count: number
  }>
  improvementRequirements: string
  notes: string
  supervisor: string
  fleetId: string
  fleetName: string
  routeId: string
  routeName: string
}

export interface WeekArchive {
  id: string
  name: string
  weekStart: string
  weekEnd: string
  createdAt: string
  fleetId: string | null
  routeId: string | null
  searchQuery: string
  keyDriverIds: string[]
  anomalySummary: Partial<Record<AnomalyType, number>>
  interviewNoteIds: string[]
  description?: string
  customDataHash?: string
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface DriverRiskProfile {
  driverId: string
  driverName: string
  fleetId: string
  fleetName: string
  routeId: string
  routeName: string
  riskLevel: RiskLevel
  riskScore: number
  riskFactors: string[]
  recommendedActions: string[]
  weeklyTrend: Array<{
    weekStart: string
    onTimeRate: number
    anomalyCount: number
    gpsBlankMinutes: number
  }>
  consecutiveWeeksWithIssues: number
  onTimeRateTrend: 'stable' | 'improving' | 'declining'
  lastInterviewDate?: string
  nextReviewDate?: string
}

export interface StoredInterviewRecord extends InterviewNote {
  id: string
  createdAt: string
  updatedAt: string
  anomalyDetails: Array<{
    id: string
    type: AnomalyType
    severity: 'low' | 'medium' | 'high'
    date: string
    time: string
    locationName: string
    description: string
  }>
}
