'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileText, Search, Calendar, Tag, ExternalLink, Loader2, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'

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

const CATEGORIES = [
  'Market Analysis', 'Geopolitics', 'Supply & Demand', 'Macro / Central Banks',
  'Shipping & Freight', 'Energy Transition', 'Metals & Mining', 'Agriculture', 'Regulatory', 'Other',
]

export default function Research() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('research_articles')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (filterCategory) query = query.eq('category', filterCategory)
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,summary.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
      }

      const { data, error: err } = await query
      if (err) throw err
      setArticles(data || [])
    } catch {
      setArticles([])
    } finally {
      setLoading(false)
    }
  }, [filterCategory, searchQuery])

  useEffect(() => { fetchArticles() }, [fetchArticles])

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }
    catch { return d }
  }

  // Detail view
  if (selectedArticle) {
    return (
      <div className="bg-gray-50 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-8 py-8">
            <button onClick={() => setSelectedArticle(null)} className="flex items-center gap-1 text-gray-500 hover:text-black text-sm mb-6 transition-colors">
              <ArrowLeft size={16} /> Back to articles
            </button>

            {selectedArticle.image_url && (
              <img src={selectedArticle.image_url} alt={selectedArticle.title} className="w-full h-72 object-cover rounded-xl mb-6" />
            )}

            <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
              <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(selectedArticle.created_at)}</span>
              <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">{selectedArticle.category}</span>
            </div>

            <h1 className="text-3xl font-bold text-black mb-2">{selectedArticle.title}</h1>
            {selectedArticle.subtitle && (
              <p className="text-lg text-gray-500 mb-6">{selectedArticle.subtitle}</p>
            )}

            {selectedArticle.source_url && (
              <a href={selectedArticle.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mb-6">
                <ExternalLink size={14} /> Source
              </a>
            )}

            <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed text-[15px]">
              {selectedArticle.content || 'No content.'}
            </div>

            {selectedArticle.tags && selectedArticle.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-4 border-t border-gray-200">
                {selectedArticle.tags.map((tag, i) => (
                  <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    <Tag size={10} />{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // List view
  return (
    <div className="bg-gray-50 flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
        <h1 className="text-3xl font-bold text-black mb-2">Research</h1>
        <p className="text-gray-600">Articles, news & analysis on commodity markets</p>
      </div>

      {/* Filters */}
      <div className="px-8 py-4 flex-shrink-0 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
        >
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Articles grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">No articles published yet</p>
            <p className="text-gray-400 text-sm mt-1">Check back soon for commodity market research and analysis</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {articles.map(article => (
              <button
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all text-left group"
              >
                {article.image_url ? (
                  <img src={article.image_url} alt={article.title} className="w-full h-44 object-cover group-hover:scale-[1.02] transition-transform" />
                ) : (
                  <div className="w-full h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <FileText className="w-10 h-10 text-gray-300" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">{article.category}</span>
                    <span className="text-[10px] text-gray-400">{formatDate(article.created_at)}</span>
                  </div>
                  <h3 className="font-semibold text-black text-sm mb-1 line-clamp-2">{article.title}</h3>
                  {article.subtitle && <p className="text-xs text-gray-500 mb-1 line-clamp-1">{article.subtitle}</p>}
                  <p className="text-xs text-gray-400 line-clamp-2">{article.summary || article.content?.slice(0, 120)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
