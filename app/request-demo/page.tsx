'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function RequestDemo() {
  const [formData, setFormData] = useState({
    company: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    message: '',
  })
  const [selectedDate, setSelectedDate] = useState('')
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
            demo_date: selectedDate,
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
      setSelectedDate('')
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
  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Check if selected date is a weekday
  const isWeekday = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDay()
    return day !== 0 && day !== 6 // 0 = Sunday, 6 = Saturday
  }

  return (
    <div className="min-h-screen bg-dark-blue">
      {/* Header */}
      <header className="bg-brand-blue border-b border-brand-green py-4">
        <div className="container mx-auto px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-brand-green hover:text-light-green transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-xl font-bold">Commodities Earth</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-4">Request a Demo</h1>
          <p className="text-xl text-gray-300 mb-12">
            Schedule a personalized demo of Commodities Earth platform
          </p>

          {success ? (
            <div className="bg-brand-green bg-opacity-20 border-2 border-brand-green rounded-lg p-8 text-center">
              <h2 className="text-3xl font-bold text-brand-green mb-4">Request Submitted!</h2>
              <p className="text-xl text-white mb-6">
                Thank you for your interest. We'll contact you shortly to confirm your demo.
              </p>
              <Link
                href="/"
                className="inline-block px-8 py-3 bg-brand-green text-white font-bold rounded-lg hover:bg-light-green transition-colors"
              >
                Back to Home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-brand-blue rounded-lg p-8 border-2 border-brand-green">
              {error && (
                <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-white mb-2 font-medium">Company *</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-dark-blue text-white border border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2 font-medium">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-dark-blue text-white border border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2 font-medium">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-dark-blue text-white border border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2 font-medium">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-dark-blue text-white border border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white mb-2 font-medium">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-dark-blue text-white border border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white mb-2 font-medium">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-dark-blue text-white border border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green"
                    placeholder="Tell us about your needs..."
                  />
                </div>
              </div>

              {/* Calendar Section */}
              <div className="border-t border-brand-green pt-6 mb-6">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Calendar className="text-brand-green" />
                  Schedule Your Demo
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white mb-2 font-medium">Select Date *</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        if (isWeekday(e.target.value)) {
                          setSelectedDate(e.target.value)
                          setError('')
                        } else {
                          setError('Please select a weekday (Monday-Friday)')
                          setSelectedDate('')
                        }
                      }}
                      min={today}
                      max={maxDate}
                      className="w-full px-4 py-3 rounded-lg bg-dark-blue text-white border border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green"
                      required
                    />
                    <p className="text-sm text-gray-400 mt-2">Monday to Friday only</p>
                  </div>

                  <div>
                    <label className="block text-white mb-2 font-medium flex items-center gap-2">
                      <Clock size={18} className="text-brand-green" />
                      Select Time Slot (30 min) *
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-dark-blue text-white border border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green"
                      required
                    >
                      <option value="">Choose a time</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-400 mt-2">9:00 AM - 7:00 PM</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-green hover:bg-light-green text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
