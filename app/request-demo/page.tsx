'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Calendar from '@/components/Calendar'

export default function RequestDemo() {
  const [formData, setFormData] = useState({
    company: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    message: '',
  })
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Generate time slots from 9am to 7pm (30-minute intervals)
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour < 19; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!selectedDate || !selectedTime) {
      setError('Please select both a date and time slot')
      setLoading(false)
      return
    }

    try {
      // Format date as YYYY-MM-DD
      const formattedDate = selectedDate.toISOString().split('T')[0]

      const { error: dbError } = await supabase
        .from('demo_requests')
        .insert([
          {
            company: formData.company,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            email: formData.email,
            message: formData.message,
            demo_date: formattedDate,
            demo_time: selectedTime,
          },
        ])

      if (dbError) throw dbError

      setSuccess(true)
      setFormData({
        company: '',
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        message: '',
      })
      setSelectedDate(null)
      setSelectedTime('')
    } catch (err: any) {
      setError(err.message || 'Failed to submit request')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Get min date (today) and max date (3 months from now)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const maxDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  
  const formatDate = (date: Date | null) => {
    if (!date) return ''
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
    return date.toLocaleDateString('en-US', options)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-5 shadow-sm">
        <div className="container mx-auto px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-black hover:text-accent transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-xl font-bold">Commodities Earth</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-black mb-4">Request a Demo</h1>
          <p className="text-xl text-gray-600 mb-12 font-light">
            Schedule a personalized demo of Commodities Earth platform
          </p>

          {success ? (
            <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-12 text-center shadow-xl">
              <div className="text-6xl mb-6">✓</div>
              <h2 className="text-4xl font-bold text-black mb-4">Request Submitted!</h2>
              <p className="text-xl text-gray-700 mb-8">
                Thank you for your interest. We'll contact you shortly to confirm your demo.
              </p>
              <Link
                href="/"
                className="inline-block px-10 py-4 bg-black text-white font-bold rounded-lg hover:bg-accent transition-all duration-200 shadow-lg"
              >
                Back to Home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-10 border-2 border-gray-200 shadow-xl">
              {error && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-black mb-2 font-semibold text-sm">Company *</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="Company name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-black mb-2 font-semibold text-sm">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-black mb-2 font-semibold text-sm">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="John"
                    required
                  />
                </div>

                <div>
                  <label className="block text-black mb-2 font-semibold text-sm">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="Doe"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-black mb-2 font-semibold text-sm">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-black mb-2 font-semibold text-sm">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="Tell us about your needs..."
                  />
                </div>
              </div>

              {/* Calendar Section */}
              <div className="border-t border-gray-200 pt-8 mb-8">
                <h3 className="text-3xl font-bold text-black mb-6 flex items-center gap-3">
                  <CalendarIcon className="text-accent" />
                  Schedule Your Demo
                </h3>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Calendar */}
                  <div>
                    <label className="block text-black mb-4 font-semibold">Select Date *</label>
                    <Calendar
                      selectedDate={selectedDate}
                      onSelectDate={(date) => {
                        setSelectedDate(date)
                        setError('')
                      }}
                      minDate={today}
                      maxDate={maxDate}
                      disableWeekends={true}
                    />
                  </div>

                  {/* Time & Summary */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-black mb-3 font-semibold flex items-center gap-2">
                        <Clock size={18} className="text-accent" />
                        Select Time Slot (30 min) *
                      </label>
                      <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto p-1">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`
                              px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
                              ${selectedTime === slot
                                ? 'bg-black text-white'
                                : 'bg-gray-50 text-black border border-gray-300 hover:bg-gray-100'
                              }
                            `}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-3">Available: 9:00 AM - 7:00 PM</p>
                    </div>

                    {/* Appointment Summary */}
                    {(selectedDate || selectedTime) && (
                      <div className="bg-accent bg-opacity-5 border-2 border-accent rounded-xl p-6 animate-fade-in">
                        <h4 className="font-bold text-black mb-3 flex items-center gap-2">
                          <CalendarIcon size={18} />
                          Your Appointment
                        </h4>
                        <div className="space-y-2">
                          {selectedDate && (
                            <div className="flex items-start gap-2">
                              <span className="text-gray-600 text-sm">Date:</span>
                              <span className="font-semibold text-black text-sm">
                                {formatDate(selectedDate)}
                              </span>
                            </div>
                          )}
                          {selectedTime && (
                            <div className="flex items-start gap-2">
                              <span className="text-gray-600 text-sm">Time:</span>
                              <span className="font-semibold text-black text-sm">
                                {selectedTime} (30 minutes)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-accent text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? 'Submitting...' : 'Submit Demo Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
