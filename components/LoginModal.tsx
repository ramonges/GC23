'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setFirstName('')
    setLastName('')
    setPhone('')
    setCompany('')
    setError('')
    setSuccess('')
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    resetForm()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Redirect to platform
      window.location.href = '/platform'
    } catch (err: any) {
      setError(err.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            company: company,
          },
        },
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('User creation failed')
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: email,
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            company: company,
          },
        ])

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Continue anyway as auth user was created
      }

      setSuccess('Account created successfully! You can now log in.')
      setTimeout(() => {
        setIsSignUp(false)
        resetForm()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 overflow-y-auto py-8">
      <div className="relative bg-brand-blue rounded-lg shadow-2xl w-full max-w-md p-8 border-2 border-brand-green my-8">
        <button
          onClick={() => {
            onClose()
            resetForm()
            setIsSignUp(false)
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-3xl font-bold text-white mb-2">
          {isSignUp ? 'Sign Up' : 'Log In'}
        </h2>
        <p className="text-gray-300 mb-6">
          {isSignUp
            ? 'Create your Commodities Earth account'
            : 'Access the Commodities Earth Platform'}
        </p>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-200 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {isSignUp ? (
          // Sign Up Form
          <form onSubmit={handleSignUp}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="firstName" className="block text-white mb-2 font-medium">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-dark-blue text-white border border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green"
                  placeholder="First name"
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-white mb-2 font-medium">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-dark-blue text-white border border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green"
                  placeholder="Last name"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-white mb-2 font-medium">
                Email *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-dark-blue text-white border border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-white mb-2 font-medium">
                Password *
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-dark-blue text-white border border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green"
                placeholder="Create a password (min 6 characters)"
                required
                minLength={6}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="phone" className="block text-white mb-2 font-medium">
                Phone *
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-dark-blue text-white border border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green"
                placeholder="Phone number"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="company" className="block text-white mb-2 font-medium">
                Company *
              </label>
              <input
                type="text"
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-dark-blue text-white border border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green"
                placeholder="Company name"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-green hover:bg-light-green text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-brand-green hover:text-light-green transition-colors"
              >
                Already have an account? <span className="font-bold">Log In</span>
              </button>
            </div>
          </form>
        ) : (
          // Login Form
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-white mb-2 font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-dark-blue text-white border border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-white mb-2 font-medium">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-dark-blue text-white border border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-green hover:bg-light-green text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>

            <div className="text-center">
              <p className="text-gray-300 mb-2">Don't have an account?</p>
              <button
                type="button"
                onClick={toggleMode}
                className="text-brand-green hover:text-light-green transition-colors font-bold text-lg"
              >
                Sign Up
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
