import { useEffect, useState, useCallback } from 'react'
import { saveToLocalStorage, loadFromLocalStorage, removeFromLocalStorage } from '@/lib/local-storage'

/**
 * A React hook that works similarly to useState, but persists the value to local storage
 * with hash-based security to prevent tampering.
 * 
 * @param key - The key under which to store the value in local storage
 * @param initialValue - The initial value to use if no stored value is found
 * @returns An array containing the current value, a setter function, and a delete function
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): readonly [T, (newValue: T | ((oldValue: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(initialValue)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load the initial value from local storage
  useEffect(() => {
    const loadValue = async () => {
      const stored = await loadFromLocalStorage<T>(key)
      if (stored !== null) {
        setValue(stored)
      }
      setIsLoaded(true)
    }
    
    loadValue()
  }, [key])

  // Setter function that updates both state and local storage
  const setStoredValue = useCallback(
    (newValue: T | ((oldValue: T) => T)) => {
      setValue(prevValue => {
        const valueToStore = newValue instanceof Function ? newValue(prevValue) : newValue
        
        // Save to local storage asynchronously
        if (isLoaded) {
          saveToLocalStorage(key, valueToStore)
        }
        
        return valueToStore
      })
    },
    [key, isLoaded]
  )

  // Delete function to remove the value from local storage
  const deleteValue = useCallback(() => {
    removeFromLocalStorage(key)
    setValue(initialValue)
  }, [key, initialValue])

  return [value, setStoredValue, deleteValue] as const
}
