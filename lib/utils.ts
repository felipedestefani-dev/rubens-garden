import { addDays, format, isSameDay, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDate(date: Date): string {
  return format(date, 'dd/MM/yyyy', { locale: ptBR })
}

export function formatTime(time: string): string {
  return time
}

export function getDayName(date: Date): string {
  return format(date, 'EEEE', { locale: ptBR })
}

export function getDayNameShort(date: Date): string {
  return format(date, 'EEE', { locale: ptBR })
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

export function isTomorrow(date: Date): boolean {
  return isSameDay(date, addDays(new Date(), 1))
}

export function getNextWeekdays(): Date[] {
  const today = new Date()
  const weekdays: Date[] = []
  
  // Começa de amanhã
  let currentDate = addDays(today, 1)
  
  // Pega os próximos 5 dias úteis (segunda a sexta)
  let count = 0
  while (count < 5 && weekdays.length < 5) {
    const dayOfWeek = currentDate.getDay()
    // Ignora domingo (0) e sábado (6)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      weekdays.push(startOfDay(currentDate))
      count++
    }
    currentDate = addDays(currentDate, 1)
  }
  
  return weekdays
}

export function generateTimeSlots(startTime: string, endTime: string, duration: number): string[] {
  const slots: string[] = []
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  
  const startTotalMinutes = startHour * 60 + startMin
  const endTotalMinutes = endHour * 60 + endMin
  
  let currentTotalMinutes = startTotalMinutes
  
  while (currentTotalMinutes + duration <= endTotalMinutes) {
    const hour = Math.floor(currentTotalMinutes / 60)
    const min = currentTotalMinutes % 60
    const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`
    slots.push(timeStr)
    
    currentTotalMinutes += duration
  }
  
  return slots
}

