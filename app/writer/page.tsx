'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  LogIn, LogOut, FileText, Plus, Edit3, Trash2, Save, Loader2, Image as ImageIcon,
  X, ArrowLeft, Eye, Calendar, Tag, ChevronRight
} from 'lucide-react'
import Link from 'next/link'

const CATEGORIES = [
  'Market Analysis', 'Geopolitics', 'Supply & Demand', 'Macro / Central Banks',
  'Shipping & Freight', 'Energy Transition', 'Metals & Mining', 'Agriculture', 'Regulatory', 'Other',
]

interface Article {
  id: string
  title: string
  subtitle: string
  summary: string
  content: string
  image_url: string
  source_url: string
  category: string
  tags: string[]
  published: boolean
  created_at: string
  updated_at: string
}

export default function WriterPage() {
  const [authed, setAuthed] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [articles, setArticles] = useState<Article[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [editing, setEditing] = useState(false)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(false)

  const [form, setForm] = useState({
    title: '', subtitle: '', content: '', image_url: '', source_url: '',
    category: 'Market Analysis', tags: '', published: true,
  })

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('writer_token')
    if (token) setAuthed(true)
  }, [])

  const handleLogin = async () => {
    setLoginLoading(true)
    setLoginError('')
    try {
      const resp = await fetch('/api/writer-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Login failed')
      localStorage.setItem('writer_token', data.token)
      setAuthed(true)
    } catch (err: any) {
      setLoginError(err.message)
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('writer_token')
    setAuthed(false)
    setEmail('')
    setPassword('')
  }

  // Fetch articles
  const fetchArticles = useCallback(async () => {
    const { data } = await supabase
      .from('research_articles')
      .select('*')
      .order('created_at', { ascending: false })
    setArticles(data || [])
  }, [])

  useEffect(() => {
    if (authed) fetchArticles()
  }, [authed, fetchArticles])

  const openCreate = () => {
    setForm({ title: '', subtitle: '', content: '', image_url: '', source_url: '', category: 'Market Analysis', tags: '', published: true })
    setCreating(true); setEditing(false); setSelectedArticle(null); setPreview(false)
  }

  const openEdit = (a: Article) => {
    setForm({
      title: a.title, subtitle: a.subtitle || '', content: a.content,
      image_url: a.image_url || '', source_url: a.source_url || '',
      category: a.category, tags: (a.tags || []).join(', '), published: a.published ?? true,
    })
    setEditing(true); setCreating(false); setSelectedArticle(a); setPreview(false)
  }

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true); setError(null)
    try {
      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        summary: form.content.trim().slice(0, 200),
        content: form.content.trim(),
        image_url: form.image_url.trim(),
        source_url: form.source_url.trim(),
        category: form.category,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        published: form.published,
        updated_at: new Date().toISOString(),
      }
      if (creating) {
        const { data, error: err } = await supabase
          .from('research_articles')
          .insert({ ...payload, created_at: new Date().toISOString() })
          .select().single()
        if (err) throw err
        setSelectedArticle(data)
      } else if (editing && selectedArticle) {
        const { data, error: err } = await supabase
          .from('research_articles')
          .update(payload)
          .eq('id', selectedArticle.id)
          .select().single()
        if (err) throw err
        setSelectedArticle(data)
      }
      setEditing(false); setCreating(false)
      fetchArticles()
    } catch (err: any) {
      setError(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article permanently?')) return
    await supabase.from('research_articles').delete().eq('id', id)
    if (selectedArticle?.id === id) setSelectedArticle(null)
    fetchArticles()
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const name = `articles/${Date.now()}.${ext}`
      const { error: err } = await supabase.storage.from('research-images').upload(name, file, { upsert: true })
      if (err) throw err
      const { data } = supabase.storage.from('research-images').getPublicUrl(name)
      setForm({ ...form, image_url: data.publicUrl })
    } catch (err: any) {
      setError(err.message || 'Upload failed — make sure a "research-images" storage bucket exists in Supabase')
    } finally {
      setUploading(false)
    }
  }

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
    catch { return d }
  }

  // LOGIN SCREEN
  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-black">Writer Login</h1>
            <p className="text-gray-500 text-sm mt-1">Commodities Earth Research</p>
          </div>
          {loginError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 mb-4">{loginError}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" placeholder="••••••••" />
            </div>
            <button onClick={handleLogin} disabled={loginLoading || !email || !password} className="w-full py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium">
              {loginLoading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />} Sign In
            </button>
          </div>
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-black">Back to home</Link>
          </div>
        </div>
      </div>
    )
  }

  // WRITER DASHBOARD
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-black"><ArrowLeft size={20} /></Link>
          <div>
            <h1 className="text-xl font-bold text-black">Writer Dashboard</h1>
            <p className="text-xs text-gray-500">Commodities Earth Research</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={openCreate} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 text-sm"><Plus size={16} /> New Article</button>
          <button onClick={handleLogout} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"><LogOut size={18} /></button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left: article list */}
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col flex-shrink-0 overflow-y-auto">
          <div className="p-3 border-b border-gray-100 text-xs text-gray-500 font-medium">{articles.length} article{articles.length !== 1 ? 's' : ''}</div>
          {articles.map(a => (
            <button
              key={a.id}
              onClick={() => { setSelectedArticle(a); setEditing(false); setCreating(false); setPreview(false) }}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-all ${selectedArticle?.id === a.id ? 'bg-gray-50 border-l-2 border-l-black' : ''}`}
            >
              <div className="font-medium text-sm text-black truncate">{a.title}</div>
              {a.subtitle && <div className="text-xs text-gray-500 truncate">{a.subtitle}</div>}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{a.category}</span>
                {!a.published && <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">Draft</span>}
                <span className="text-[10px] text-gray-400">{formatDate(a.created_at)}</span>
              </div>
            </button>
          ))}
          {articles.length === 0 && (
            <div className="text-center py-12 px-4">
              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-gray-400 text-sm">No articles yet</p>
            </div>
          )}
        </div>

        {/* Right: editor / preview */}
        <div className="flex-1 overflow-y-auto">
          {(creating || editing) ? (
            <div className="max-w-3xl mx-auto p-8 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-black">{creating ? 'New Article' : 'Edit Article'}</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPreview(!preview)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1"><Eye size={14} /> {preview ? 'Edit' : 'Preview'}</button>
                  <button onClick={() => { setEditing(false); setCreating(false) }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
              </div>
              {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">{error}</div>}

              {preview ? (
                /* Preview mode */
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  {form.image_url && <img src={form.image_url} alt="" className="w-full h-64 object-cover rounded-lg mb-6" />}
                  <h1 className="text-3xl font-bold text-black mb-2">{form.title || 'Untitled'}</h1>
                  {form.subtitle && <p className="text-lg text-gray-500 mb-4">{form.subtitle}</p>}
                  <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">{form.content || 'No content.'}</div>
                </div>
              ) : (
                /* Edit mode */
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-lg" placeholder="Article title..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                    <input type="text" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" placeholder="Subtitle or tagline..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={18} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-y text-sm leading-relaxed" placeholder="Write your article here..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                    <div className="flex items-center gap-3">
                      <label className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-sm">
                        <ImageIcon size={16} /> {uploading ? 'Uploading...' : 'Upload Image'}
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                      <span className="text-xs text-gray-400">or</span>
                      <input type="text" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="Paste image URL..." />
                    </div>
                    {form.image_url && <img src={form.image_url} alt="Preview" className="mt-2 h-32 object-cover rounded-lg" />}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Source URL</label>
                      <input type="url" value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" placeholder="https://..." />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                    <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" placeholder="e.g. oil, OPEC, supply cut" />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="rounded" />
                    <span className="text-sm">Publish (visible on Research page)</span>
                  </label>
                </>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 flex items-center gap-2 text-sm font-medium">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {saving ? 'Saving...' : (form.published ? 'Publish' : 'Save Draft')}
                </button>
                <button onClick={() => { setEditing(false); setCreating(false) }} className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Cancel</button>
              </div>
            </div>
          ) : selectedArticle ? (
            <div className="max-w-3xl mx-auto p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  {!selectedArticle.published && <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded mb-2 inline-block">Draft</span>}
                  <h2 className="text-2xl font-bold text-black">{selectedArticle.title}</h2>
                  {selectedArticle.subtitle && <p className="text-lg text-gray-500 mt-1">{selectedArticle.subtitle}</p>}
                  <div className="flex items-center gap-3 text-sm text-gray-400 mt-2">
                    <span><Calendar size={14} className="inline mr-1" />{formatDate(selectedArticle.created_at)}</span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">{selectedArticle.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <button onClick={() => openEdit(selectedArticle)} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"><Edit3 size={16} /></button>
                  <button onClick={() => handleDelete(selectedArticle.id)} className="p-2 border border-red-200 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={16} /></button>
                </div>
              </div>
              {selectedArticle.image_url && <img src={selectedArticle.image_url} alt="" className="w-full h-64 object-cover rounded-lg mb-6" />}
              <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedArticle.content || 'No content.'}</div>
              {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-200">
                  {selectedArticle.tags.map((tag, i) => <span key={i} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"><Tag size={10} />{tag}</span>)}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Select an article or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
