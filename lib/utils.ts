import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { isToday as dateFnsIsToday, isTomorrow as dateFnsIsTomorrow, format, startOfDay, addDays, getDay } from "date-fns"
import { ptBR } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isToday(date: Date): boolean {
  return dateFnsIsToday(date)
}

export function isTomorrow(date: Date): boolean {
  return dateFnsIsTomorrow(date)
}

export function formatDate(date: Date): string {
  return format(date, 'dd/MM/yyyy', { locale: ptBR })
}

export function getDayNameShort(date: Date): string {
  return format(date, 'EEE', { locale: ptBR })
}

export function getNextWeekdays(count: number = 7): Date[] {
  const today = startOfDay(new Date())
  const weekdays: Date[] = []
  let currentDate = today
  let daysAdded = 0
  
  while (daysAdded < count) {
    const dayOfWeek = getDay(currentDate)
    // 0 = Domingo, 6 = Sábado. Vamos incluir todos os dias
    weekdays.push(new Date(currentDate))
    daysAdded++
    currentDate = addDays(currentDate, 1)
  }
  
  return weekdays
}

export function generateTimeSlots(startTime: string, endTime: string, duration: number): string[] {
  const slots: string[] = []
  
  // Converter horários para minutos
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  
  // Gerar slots a cada 'duration' minutos
  let currentMinutes = startMinutes
  
  while (currentMinutes + duration <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60)
    const minutes = currentMinutes % 60
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    slots.push(timeString)
    currentMinutes += duration
  }
  
  return slots
}
