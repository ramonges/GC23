'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileText, Plus, Trash2, Edit3, Save, X, Search, Calendar, Tag, ExternalLink, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Article {
  id: string
  title: string
  summary: string
  content: string
  source_url: string
  category: string
  tags: string[]
  created_at: string
  updated_at: string
}

const CATEGORIES = [
  'Market Analysis',
  'Geopolitics',
  'Supply & Demand',
  'Macro / Central Banks',
  'Shipping & Freight',
  'Energy Transition',
  'Metals & Mining',
  'Agriculture',
  'Regulatory',
  'Other',
]

export default function Research() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [form, setForm] = useState({
    title: '',
    summary: '',
    content: '',
    source_url: '',
    category: 'Market Analysis',
    tags: '',
  })

  // Load articles
  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('research_articles')
        .select('*')
        .order('created_at', { ascending: false })

      if (filterCategory) {
        query = query.eq('category', filterCategory)
      }
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,summary.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
      }

      const { data, error: err } = await query
      if (err) throw err
      setArticles(data || [])
    } catch (err: any) {
      console.error('Error fetching articles:', err)
      // If table doesn't exist yet, show empty state
      setArticles([])
    } finally {
      setLoading(false)
    }
  }, [filterCategory, searchQuery])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  const openCreate = () => {
    setForm({ title: '', summary: '', content: '', source_url: '', category: 'Market Analysis', tags: '' })
    setIsCreating(true)
    setIsEditing(false)
    setSelectedArticle(null)
  }

  const openEdit = (article: Article) => {
    setForm({
      title: article.title,
      summary: article.summary,
      content: article.content,
      source_url: article.source_url || '',
      category: article.category,
      tags: (article.tags || []).join(', '),
    })
    setIsEditing(true)
    setIsCreating(false)
    setSelectedArticle(article)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setIsCreating(false)
  }

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError(null)
    try {
      const payload = {
        title: form.title.trim(),
        summary: form.summary.trim(),
        content: form.content.trim(),
        source_url: form.source_url.trim(),
        category: form.category,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        updated_at: new Date().toISOString(),
      }

      if (isCreating) {
        const { data, error: err } = await supabase
          .from('research_articles')
          .insert({ ...payload, created_at: new Date().toISOString() })
          .select()
          .single()
        if (err) throw err
        setSelectedArticle(data)
      } else if (isEditing && selectedArticle) {
        const { data, error: err } = await supabase
          .from('research_articles')
          .update(payload)
          .eq('id', selectedArticle.id)
          .select()
          .single()
        if (err) throw err
        setSelectedArticle(data)
      }
      setIsEditing(false)
      setIsCreating(false)
      fetchArticles()
    } catch (err: any) {
      setError(err.message || 'Failed to save article')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article?')) return
    try {
      const { error: err } = await supabase.from('research_articles').delete().eq('id', id)
      if (err) throw err
      if (selectedArticle?.id === id) setSelectedArticle(null)
      fetchArticles()
    } catch (err: any) {
      setError(err.message || 'Failed to delete')
    }
  }

  const filteredArticles = articles

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
    catch { return d }
  }

  return (
    <div className="bg-gray-50 flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Research</h1>
            <p className="text-gray-600">Articles, news & analysis on commodity markets</p>
          </div>
          <button onClick={openCreate} className="px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 text-sm font-medium">
            <Plus size={18} /> New Article
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left: article list */}
        <div className="w-96 border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
          {/* Filters */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
            >
              <option value="">All categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Article list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-12 px-4">
                <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 text-sm">No articles yet</p>
                <p className="text-gray-400 text-xs mt-1">Click "New Article" to add your first research piece</p>
              </div>
            ) : (
              filteredArticles.map(article => (
                <button
                  key={article.id}
                  onClick={() => { setSelectedArticle(article); setIsEditing(false); setIsCreating(false) }}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-all ${selectedArticle?.id === article.id ? 'bg-gray-50 border-l-2 border-l-black' : ''}`}
                >
                  <div className="font-medium text-sm text-black truncate">{article.title}</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{article.summary || 'No summary'}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{article.category}</span>
                    <span className="text-[10px] text-gray-400">{formatDate(article.created_at)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: article detail or editor */}
        <div className="flex-1 overflow-y-auto">
          {(isCreating || isEditing) ? (
            <div className="max-w-3xl mx-auto p-8 space-y-5">
              <h2 className="text-xl font-semibold text-black">{isCreating ? 'New Article' : 'Edit Article'}</h2>
              {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" placeholder="Article title..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none" placeholder="Brief summary..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={14} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-y font-mono text-sm" placeholder="Full article text, analysis, notes..." />
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
              <div className="flex items-center gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 flex items-center gap-2 text-sm font-medium">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={cancelEdit} className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Cancel</button>
              </div>
            </div>
          ) : selectedArticle ? (
            <div className="max-w-3xl mx-auto p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-black mb-2">{selectedArticle.title}</h2>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(selectedArticle.created_at)}</span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{selectedArticle.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <button onClick={() => openEdit(selectedArticle)} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"><Edit3 size={16} /></button>
                  <button onClick={() => handleDelete(selectedArticle.id)} className="p-2 border border-red-200 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={16} /></button>
                </div>
              </div>
              {selectedArticle.summary && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-700 italic">{selectedArticle.summary}</div>
              )}
              {selectedArticle.source_url && (
                <a href={selectedArticle.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mb-4">
                  <ExternalLink size={14} /> Source
                </a>
              )}
              <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedArticle.content || 'No content.'}</div>
              {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-200">
                  {selectedArticle.tags.map((tag, i) => (
                    <span key={i} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"><Tag size={10} />{tag}</span>
                  ))}
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
