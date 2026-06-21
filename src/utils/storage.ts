import { WeekArchive, StoredInterviewRecord } from '../types'

const STORAGE_KEYS = {
  ARCHIVES: 'bus_trace_archives',
  INTERVIEWS: 'bus_trace_interviews',
  CUSTOM_META: 'bus_trace_custom_meta',
} as const

export const storageUtils = {
  // ============ 周复盘档案 ============
  getArchives(): WeekArchive[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ARCHIVES)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  },

  saveArchives(list: WeekArchive[]): void {
    localStorage.setItem(STORAGE_KEYS.ARCHIVES, JSON.stringify(list))
  },

  addArchive(archive: WeekArchive): void {
    const list = this.getArchives()
    list.unshift(archive)
    this.saveArchives(list)
  },

  updateArchive(id: string, updates: Partial<WeekArchive>): void {
    const list = this.getArchives()
    const idx = list.findIndex(a => a.id === id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...updates }
      this.saveArchives(list)
    }
  },

  deleteArchive(id: string): void {
    const list = this.getArchives().filter(a => a.id !== id)
    this.saveArchives(list)
  },

  getArchive(id: string): WeekArchive | undefined {
    return this.getArchives().find(a => a.id === id)
  },

  // ============ 面谈记录 ============
  getInterviews(): StoredInterviewRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.INTERVIEWS)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  },

  saveInterviews(list: StoredInterviewRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(list))
  },

  addInterview(record: StoredInterviewRecord): void {
    const list = this.getInterviews()
    list.unshift(record)
    this.saveInterviews(list)
  },

  updateInterview(id: string, updates: Partial<StoredInterviewRecord>): void {
    const list = this.getInterviews()
    const idx = list.findIndex(r => r.id === id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() }
      this.saveInterviews(list)
    }
  },

  deleteInterview(id: string): void {
    const list = this.getInterviews().filter(r => r.id !== id)
    this.saveInterviews(list)
  },

  getInterview(id: string): StoredInterviewRecord | undefined {
    return this.getInterviews().find(r => r.id === id)
  },

  getInterviewsByDriver(driverId: string): StoredInterviewRecord[] {
    return this.getInterviews().filter(r => r.driverId === driverId)
  },

  getInterviewsByWeek(weekStart: string): StoredInterviewRecord[] {
    return this.getInterviews().filter(r => r.weekStart === weekStart)
  },

  // ============ 导入数据元信息 ============
  getCustomMeta(): { imported: boolean; importedAt?: string; dataHash?: string } {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_META)
      return raw ? JSON.parse(raw) : { imported: false }
    } catch {
      return { imported: false }
    }
  },

  setCustomMeta(meta: { imported: boolean; importedAt?: string; dataHash?: string }): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_META, JSON.stringify(meta))
  },

  clearCustomMeta(): void {
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_META)
  },
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
