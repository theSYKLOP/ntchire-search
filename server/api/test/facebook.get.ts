export default defineEventHandler(async (event) => {
  const token = process.env.FB_ACCESS_TOKEN
  const version = process.env.FB_GRAPH_VERSION || 'v18.0'
  
  return {
    tokenConfigured: !!token,
    tokenLength: token ? token.length : 0,
    tokenPreview: token ? token.substring(0, 10) + '...' : 'Non configuré',
    version,
    envKeys: Object.keys(process.env).filter(key => key.includes('FB') || key.includes('FACEBOOK'))
  }
})
