import { describe, it, expect, beforeEach, vi } from 'vitest'
import { saveToLocalStorage, loadFromLocalStorage, removeFromLocalStorage, clearAllGameData } from './local-storage'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => Object.keys(store)[index] || null
  }
})()

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
})

describe('local-storage', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('saveToLocalStorage and loadFromLocalStorage', () => {
    it('saves and loads simple data correctly', async () => {
      const testData = { value: 42, name: 'test' }
      await saveToLocalStorage('test-key', testData)
      const loaded = await loadFromLocalStorage<typeof testData>('test-key')
      expect(loaded).toEqual(testData)
    })

    it('saves and loads complex nested data', async () => {
      const testData = {
        resources: 100,
        inventory: [
          { id: '1', type: 'sword', traits: { quality: 10, speed: 5, durability: 8, style: 3 } }
        ],
        nested: {
          deep: {
            value: 'test'
          }
        }
      }
      await saveToLocalStorage('complex-key', testData)
      const loaded = await loadFromLocalStorage<typeof testData>('complex-key')
      expect(loaded).toEqual(testData)
    })

    it('returns null for non-existent keys', async () => {
      const loaded = await loadFromLocalStorage('non-existent')
      expect(loaded).toBeNull()
    })

    it('detects and rejects tampered data', async () => {
      const testData = { coins: 100 }
      await saveToLocalStorage('tamper-test', testData)
      
      // Tamper with the data
      const stored = localStorage.getItem('trait-crafter-tamper-test')
      if (stored) {
        const parsed = JSON.parse(stored)
        parsed.data.coins = 999999 // Change the coins value
        localStorage.setItem('trait-crafter-tamper-test', JSON.stringify(parsed))
      }
      
      // Should return null because hash doesn't match
      const loaded = await loadFromLocalStorage('tamper-test')
      expect(loaded).toBeNull()
    })

    it('handles corrupted JSON gracefully', async () => {
      localStorage.setItem('trait-crafter-corrupted', 'invalid json{{}')
      const loaded = await loadFromLocalStorage('corrupted')
      expect(loaded).toBeNull()
    })

    it('stores data with prefix', async () => {
      await saveToLocalStorage('test', { value: 1 })
      const storedKey = 'trait-crafter-test'
      expect(localStorage.getItem(storedKey)).not.toBeNull()
    })
  })

  describe('removeFromLocalStorage', () => {
    it('removes data from storage', async () => {
      await saveToLocalStorage('remove-test', { value: 1 })
      expect(await loadFromLocalStorage('remove-test')).not.toBeNull()
      
      removeFromLocalStorage('remove-test')
      expect(await loadFromLocalStorage('remove-test')).toBeNull()
    })
  })

  describe('clearAllGameData', () => {
    it('clears all game data with prefix', async () => {
      await saveToLocalStorage('game-1', { value: 1 })
      await saveToLocalStorage('game-2', { value: 2 })
      await saveToLocalStorage('game-3', { value: 3 })
      
      // Add some other data not from the game
      localStorage.setItem('other-data', 'should remain')
      
      clearAllGameData()
      
      expect(localStorage.getItem('trait-crafter-game-1')).toBeNull()
      expect(localStorage.getItem('trait-crafter-game-2')).toBeNull()
      expect(localStorage.getItem('trait-crafter-game-3')).toBeNull()
      expect(localStorage.getItem('other-data')).toBe('should remain')
    })

    it('handles empty storage gracefully', () => {
      expect(() => clearAllGameData()).not.toThrow()
    })
  })

  describe('hash security', () => {
    it('generates consistent hashes for same data', async () => {
      const testData = { value: 42 }
      
      await saveToLocalStorage('hash-test-1', testData)
      const stored1 = localStorage.getItem('trait-crafter-hash-test-1')
      const hash1 = stored1 ? JSON.parse(stored1).hash : null
      
      localStorage.clear()
      
      await saveToLocalStorage('hash-test-2', testData)
      const stored2 = localStorage.getItem('trait-crafter-hash-test-2')
      const hash2 = stored2 ? JSON.parse(stored2).hash : null
      
      expect(hash1).toBe(hash2)
      expect(hash1).toBeTruthy()
    })

    it('generates different hashes for different data', async () => {
      await saveToLocalStorage('diff-1', { value: 1 })
      await saveToLocalStorage('diff-2', { value: 2 })
      
      const stored1 = localStorage.getItem('trait-crafter-diff-1')
      const stored2 = localStorage.getItem('trait-crafter-diff-2')
      
      const hash1 = stored1 ? JSON.parse(stored1).hash : null
      const hash2 = stored2 ? JSON.parse(stored2).hash : null
      
      expect(hash1).not.toBe(hash2)
    })
  })
})
