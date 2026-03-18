type TokenRecord = {
  token: string
  expiresAt: number
}

let userTokenRecord: TokenRecord | null = null
let staffTokenRecord: TokenRecord | null = null

function getRecordKey(actorType: 'user' | 'staff') {
  return actorType === 'user' ? 'stackread_user_token' : 'stackread_staff_token'
}

function parseStoredRecord(value: string | null): TokenRecord | null {
  if (!value) {
    return null
  }

  try {
    const parsed = JSON.parse(value) as TokenRecord

    if (!parsed?.token || !parsed?.expiresAt) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

function persistRecord(
  actorType: 'user' | 'staff',
  record: TokenRecord | null,
) {
  if (typeof window === 'undefined') {
    return
  }

  const key = getRecordKey(actorType)

  if (!record) {
    window.localStorage.removeItem(key)
    return
  }

  window.localStorage.setItem(key, JSON.stringify(record))
}

export function setAccessToken(
  actorType: 'user' | 'staff',
  token: string,
  expiresAt: number,
) {
  const record = { token, expiresAt }

  if (actorType === 'user') {
    userTokenRecord = record
  } else {
    staffTokenRecord = record
  }

  persistRecord(actorType, record)
}

export function getAccessToken(actorType: 'user' | 'staff') {
  const inMemory = actorType === 'user' ? userTokenRecord : staffTokenRecord

  if (inMemory) {
    return inMemory.token
  }

  if (typeof window === 'undefined') {
    return null
  }

  const fromStorage = parseStoredRecord(
    window.localStorage.getItem(getRecordKey(actorType)),
  )

  if (!fromStorage) {
    return null
  }

  if (Date.now() >= fromStorage.expiresAt) {
    clearAccessToken(actorType)
    return null
  }

  if (actorType === 'user') {
    userTokenRecord = fromStorage
  } else {
    staffTokenRecord = fromStorage
  }

  return fromStorage.token
}

export function getAccessTokenExpiry(actorType: 'user' | 'staff') {
  const inMemory = actorType === 'user' ? userTokenRecord : staffTokenRecord

  if (inMemory) {
    return inMemory.expiresAt
  }

  if (typeof window === 'undefined') {
    return null
  }

  const fromStorage = parseStoredRecord(
    window.localStorage.getItem(getRecordKey(actorType)),
  )
  return fromStorage?.expiresAt ?? null
}

export function isAccessTokenExpired(actorType: 'user' | 'staff') {
  const expiresAt = getAccessTokenExpiry(actorType)

  if (!expiresAt) {
    return true
  }

  return Date.now() >= expiresAt
}

export function clearAccessToken(actorType: 'user' | 'staff') {
  if (actorType === 'user') {
    userTokenRecord = null
  } else {
    staffTokenRecord = null
  }

  persistRecord(actorType, null)
}

export function clearAllAccessTokens() {
  clearAccessToken('user')
  clearAccessToken('staff')
}
