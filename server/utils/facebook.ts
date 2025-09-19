import axios from 'axios'

export interface FacebookPageRaw {
  id: string
  name?: string
  about?: string
  description?: string
  link?: string
  category?: string
  location?: {
    city?: string
    country?: string
  }
  fan_count?: number
  picture?: { data?: { url?: string } }
}

export interface FacebookSearchResult {
  data: FacebookPageRaw[]
  paging?: { cursors?: { after?: string }, next?: string }
}

const FB_GRAPH_VERSION = process.env.FB_GRAPH_VERSION || 'v18.0'
const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN || ''
const FB_GRAPH_URL = `https://graph.facebook.com/${FB_GRAPH_VERSION}`

export class FacebookApiError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'FacebookApiError'
    this.status = status
  }
}

function ensureConfigured() {
  if (!FB_ACCESS_TOKEN) {
    throw new FacebookApiError('FB_ACCESS_TOKEN manquant dans .env', 401)
  }
}

export async function searchPages(query: string, limit = 50, after?: string): Promise<FacebookSearchResult> {
  ensureConfigured()
  const fields = [
    'id', 'name', 'about', 'description', 'link', 'category', 'fan_count',
    'picture.type(large){url}', 'location{city,country}'
  ].join(',')
  const params: Record<string, string> = {
    q: query,
    type: 'page',
    fields,
    limit: String(Math.min(Math.max(limit, 1), 100)),
    access_token: FB_ACCESS_TOKEN
  }
  if (after) params.after = after

  try {
    const url = `${FB_GRAPH_URL}/search`
    const { data } = await axios.get(url, { params, timeout: 12000 })
    return data as FacebookSearchResult
  } catch (err: any) {
    const status = err?.response?.status
    const msg = err?.response?.data?.error?.message || err?.message || 'Erreur Facebook API'
    throw new FacebookApiError(msg, status)
  }
}

export function mapFacebookPageToCompany(page: FacebookPageRaw) {
  return {
    externalId: page.id,
    name: page.name || '',
    bio: page.about || page.description || '',
    profileImage: page.picture?.data?.url || '',
    platform: 'facebook',
    profileUrl: page.link || (page.id ? `https://facebook.com/${page.id}` : ''),
    activityDomain: page.category || 'non spécifié',
    location: [page.location?.city, page.location?.country].filter(Boolean).join(', '),
    followers: page.fan_count || 0,
    hashtags: [] as string[]
  }
}


