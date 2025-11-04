/**
 * Local storage utility with hash-based security to prevent cheating
 * The hash is calculated from the data and a secret salt to verify integrity
 * 
 * NOTE: This is client-side security, so the salt is visible in the JavaScript bundle.
 * The goal is to make casual cheating more difficult, not to provide cryptographic security.
 * For true security, validation should be done server-side.
 */

const STORAGE_PREFIX = 'trait-crafter-'
// Secret salt for hashing - visible in client code but makes casual tampering harder
const SECRET_SALT = 'mystic-forge-2024'

/**
 * Simple hash function using the Web Crypto API
 */
async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataWithSalt = data + SECRET_SALT
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(dataWithSalt))
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Verifies if the data matches the stored hash
 */
async function verifyHash(data: string, hash: string): Promise<boolean> {
  const calculatedHash = await generateHash(data)
  return calculatedHash === hash
}

interface StoredData<T> {
  data: T
  hash: string
  timestamp: number
}

/**
 * Saves data to local storage with a hash for security
 */
export async function saveToLocalStorage<T>(key: string, value: T): Promise<void> {
  try {
    const fullKey = STORAGE_PREFIX + key
    const jsonData = JSON.stringify(value)
    const hash = await generateHash(jsonData)
    
    const storedData: StoredData<T> = {
      data: value,
      hash,
      timestamp: Date.now()
    }
    
    localStorage.setItem(fullKey, JSON.stringify(storedData))
  } catch (error) {
    console.error('Error saving to local storage:', error)
  }
}

/**
 * Loads data from local storage and verifies its integrity
 * Returns null if data is corrupted or doesn't exist
 */
export async function loadFromLocalStorage<T>(key: string): Promise<T | null> {
  try {
    const fullKey = STORAGE_PREFIX + key
    const stored = localStorage.getItem(fullKey)
    
    if (!stored) {
      return null
    }
    
    const storedData: StoredData<T> = JSON.parse(stored)
    const jsonData = JSON.stringify(storedData.data)
    
    // Verify hash
    const isValid = await verifyHash(jsonData, storedData.hash)
    
    if (!isValid) {
      console.warn('Data integrity check failed for key:', key)
      // Clear corrupted data
      localStorage.removeItem(fullKey)
      return null
    }
    
    return storedData.data
  } catch (error) {
    console.error('Error loading from local storage:', error)
    return null
  }
}

/**
 * Removes data from local storage
 */
export function removeFromLocalStorage(key: string): void {
  try {
    const fullKey = STORAGE_PREFIX + key
    localStorage.removeItem(fullKey)
  } catch (error) {
    console.error('Error removing from local storage:', error)
  }
}

/**
 * Clears all game data from local storage
 */
export function clearAllGameData(): void {
  try {
    const keysToRemove: string[] = []
    // Iterate through all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    // Remove all identified keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })
  } catch (error) {
    console.error('Error clearing game data:', error)
  }
}
