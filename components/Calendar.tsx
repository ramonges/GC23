'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarProps {
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  disableWeekends?: boolean
}

export default function Calendar({
  selectedDate,
  onSelectDate,
  minDate,
  maxDate,
  disableWeekends = true,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate || minDate || new Date()
  )

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const { daysInMonth, startingDayOfWeek, year, month } = useMemo(
    () => getDaysInMonth(currentMonth),
    [currentMonth]
  )

  const isDateDisabled = (date: Date) => {
    if (disableWeekends) {
      const day = date.getDay()
      if (day === 0 || day === 6) return true
    }

    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true

    return false
  }

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day)
    if (!isDateDisabled(date)) {
      onSelectDate(date)
    }
  }

  const renderCalendarDays = () => {
    const days = []
    
    // Empty cells before first day of month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square" />
      )
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const disabled = isDateDisabled(date)
      const selected = isDateSelected(date)
      const today = isToday(date)

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(day)}
          disabled={disabled}
          className={`
            aspect-square rounded-lg font-medium text-sm transition-all duration-200
            ${disabled 
              ? 'text-gray-300 cursor-not-allowed bg-gray-50' 
              : 'text-black hover:bg-gray-100 cursor-pointer'
            }
            ${selected 
              ? 'bg-black text-white hover:bg-black' 
              : ''
            }
            ${today && !selected 
              ? 'border-2 border-accent' 
              : 'border border-transparent'
            }
          `}
        >
          {day}
        </button>
      )
    }

    return days
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} className="text-black" />
        </button>

        <h3 className="text-xl font-bold text-black">
          {monthNames[month]} {year}
        </h3>

        <button
          type="button"
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight size={20} className="text-black" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {renderCalendarDays()}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-accent"></div>
          <span className="text-gray-600">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-black"></div>
          <span className="text-gray-600">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gray-50 border border-gray-200"></div>
          <span className="text-gray-600">Unavailable</span>
        </div>
      </div>

      {disableWeekends && (
        <p className="text-center text-xs text-gray-500 mt-4">
          Weekends are not available for booking
        </p>
      )}
    </div>
  )
}
