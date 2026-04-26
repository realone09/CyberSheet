import { useEffect, useState } from 'react';
import type { Fill } from '../fillTypes';
import { serializeFill, deserializeFill } from '../fillUtils';
import { NO_FILL } from '../fillTypes';

/**
 * Storage key for recent fills in localStorage
 */
const STORAGE_KEY_FILL = 'cs_recent_fills';

/**
 * Maximum number of recent fills to store
 */
const MAX_RECENT_FILLS = 10;

/**
 * Hook for managing recent fills with localStorage persistence
 * 
 * Same pattern as useRecentColors but works with Fill objects.
 * Uses serialization for localStorage compatibility.
 * 
 * @returns Object with fills array and addFill function
 * 
 * @example
 * const { fills, addFill } = useRecentFills();
 * 
 * // When user picks a fill
 * addFill({ type: 'solid', color: '#FF0000' });
 * 
 * // Display recent fills
 * fills.map(fill => <FillSwatch fill={fill} />)
 */
export function useRecentFills() {
  const [fills, setFills] = useState<Fill[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FILL);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const deserialized = parsed
            .map((str) => deserializeFill(str))
            .slice(0, MAX_RECENT_FILLS);
          setFills(deserialized);
        }
      }
    } catch (error) {
      console.error('Failed to load recent fills from localStorage:', error);
    }
  }, []);

  /**
   * Add a fill to recent fills list
   * 
   * Behavior:
   * - Serializes fill for comparison
   * - Moves fill to front if already exists (prevents duplicates)
   * - Adds to front if new
   * - Limits to MAX_RECENT_FILLS (10)
   * - Persists to localStorage
   * 
   * @param fill - Fill object (solid/pattern/gradient)
   */
  const addFill = (fill: Fill) => {
    setFills((prev) => {
      const serialized = serializeFill(fill);
      
      // Remove existing instance of this fill (compare serialized)
      const filtered = prev.filter((f) => serializeFill(f) !== serialized);
      
      // Add to front
      const next = [fill, ...filtered].slice(0, MAX_RECENT_FILLS);
      
      // Persist to localStorage (serialize all fills)
      try {
        const serializedList = next.map(serializeFill);
        localStorage.setItem(STORAGE_KEY_FILL, JSON.stringify(serializedList));
      } catch (error) {
        console.error('Failed to save recent fills to localStorage:', error);
      }
      
      return next;
    });
  };

  return { fills, addFill };
}
