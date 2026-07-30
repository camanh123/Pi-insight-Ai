// Evolution Engine Authentication
// Internal-only developer access control
// Protects Evolution Engine from end-user access

export interface DeveloperCredentials {
  token: string
  teamName: string
  permissions: DeveloperPermission[]
  issuedAt: Date
  expiresAt: Date
}

export type DeveloperPermission = 
  | 'view-reports'
  | 'generate-reports'
  | 'manage-sources'
  | 'configure-alerts'
  | 'export-data'
  | 'admin-dashboard'

const VALID_DEV_TOKENS = process.env.EVOLUTION_ENGINE_DEV_TOKEN?.split(',') || [
  'dev_evolution_2025_internal_only'
]

const DEVELOPER_TEAMS = {
  'core-platform': {
    name: 'Core Platform Team',
    permissions: ['view-reports', 'generate-reports', 'manage-sources', 'export-data', 'admin-dashboard'] as DeveloperPermission[]
  },
  'ai-team': {
    name: 'AI/ML Team',
    permissions: ['view-reports', 'generate-reports', 'export-data'] as DeveloperPermission[]
  },
  'infrastructure': {
    name: 'Infrastructure Team',
    permissions: ['view-reports', 'manage-sources', 'configure-alerts'] as DeveloperPermission[]
  },
  'product': {
    name: 'Product Team',
    permissions: ['view-reports', 'export-data'] as DeveloperPermission[]
  }
}

export function validateDeveloperToken(token: string): DeveloperCredentials | null {
  if (!token || !VALID_DEV_TOKENS.includes(token)) {
    return null
  }

  // Determine team from token prefix or env config
  let teamName = 'core-platform'
  const teams = Object.keys(DEVELOPER_TEAMS)
  const tokenPrefix = token.split('_')[1]
  if (tokenPrefix && teams.includes(tokenPrefix)) {
    teamName = tokenPrefix
  }

  const team = DEVELOPER_TEAMS[teamName as keyof typeof DEVELOPER_TEAMS]
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hour expiration

  return {
    token,
    teamName: team.name,
    permissions: team.permissions,
    issuedAt: now,
    expiresAt
  }
}

export function hasPermission(
  credentials: DeveloperCredentials | null,
  requiredPermission: DeveloperPermission
): boolean {
  if (!credentials) return false
  if (credentials.expiresAt < new Date()) return false
  return credentials.permissions.includes(requiredPermission)
}

export function extractAuthToken(authHeader: string | null): string | null {
  if (!authHeader) return null
  
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null
  
  return parts[1]
}

export class EvolutionAuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message)
    this.name = 'EvolutionAuthError'
  }
}

export function createDevAccessLog(
  token: string,
  action: string,
  details: Record<string, any>
): void {
  // Log developer access attempts for audit trail
  const timestamp = new Date().toISOString()
  const maskedToken = token.slice(0, 10) + '***'
  
  console.log('[EVOLUTION_DEV_ACCESS]', {
    timestamp,
    maskedToken,
    action,
    ...details
  })
}

// Verify request comes from approved internal network/source
export function isInternalRequest(
  origin: string | null,
  userAgent: string | null
): boolean {
  // In production, implement IP whitelisting or other checks
  // For now, require proper auth header (token)
  
  if (!origin) return false
  
  // Allowed internal development hosts
  const internalOrigins = [
    'localhost',
    '127.0.0.1',
    process.env.EVOLUTION_ENGINE_INTERNAL_HOST || ''
  ].filter(Boolean)

  try {
    const originUrl = new URL(origin)
    return internalOrigins.some(allowed => 
      originUrl.hostname.includes(allowed)
    )
  } catch {
    return false
  }
}
