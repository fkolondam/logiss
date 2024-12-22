import { describe, it, expect } from 'vitest'
import en from '../en'
import id from '../id'

describe('Translation Files', () => {
  // Helper function to get all keys recursively
  const getAllKeys = (obj, prefix = '') => {
    return Object.keys(obj).reduce((keys, key) => {
      const newPrefix = prefix ? `${prefix}.${key}` : key
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        return [...keys, ...getAllKeys(obj[key], newPrefix)]
      }
      return [...keys, newPrefix]
    }, [])
  }

  // Helper function to get value by path
  const getValueByPath = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj)
  }

  it('should have matching keys in en and id translations', () => {
    const enKeys = getAllKeys(en).sort()
    const idKeys = getAllKeys(id).sort()

    // Check if all English keys exist in Indonesian
    const missingInId = enKeys.filter((key) => !idKeys.includes(key))
    if (missingInId.length > 0) {
      console.log('Keys missing in Indonesian translation:', missingInId)
    }

    // Check if all Indonesian keys exist in English
    const missingInEn = idKeys.filter((key) => !enKeys.includes(key))
    if (missingInEn.length > 0) {
      console.log('Keys missing in English translation:', missingInEn)
    }

    expect(missingInId).toHaveLength(0)
    expect(missingInEn).toHaveLength(0)
    expect(enKeys).toEqual(idKeys)
  })

  it('should not have empty or null values', () => {
    const enKeys = getAllKeys(en)
    const idKeys = getAllKeys(id)

    // Check English translations
    const emptyEn = enKeys.filter((key) => {
      const value = getValueByPath(en, key)
      return value === '' || value === null || value === undefined
    })
    if (emptyEn.length > 0) {
      console.log('Empty values in English translation:', emptyEn)
    }
    expect(emptyEn).toHaveLength(0)

    // Check Indonesian translations
    const emptyId = idKeys.filter((key) => {
      const value = getValueByPath(id, key)
      return value === '' || value === null || value === undefined
    })
    if (emptyId.length > 0) {
      console.log('Empty values in Indonesian translation:', emptyId)
    }
    expect(emptyId).toHaveLength(0)
  })

  it('should have string values at leaf nodes', () => {
    const enKeys = getAllKeys(en)
    const idKeys = getAllKeys(id)

    // Check English translations
    const nonStringEn = enKeys.filter((key) => {
      const value = getValueByPath(en, key)
      return typeof value !== 'string'
    })
    if (nonStringEn.length > 0) {
      console.log('Non-string values in English translation:', nonStringEn)
    }
    expect(nonStringEn).toHaveLength(0)

    // Check Indonesian translations
    const nonStringId = idKeys.filter((key) => {
      const value = getValueByPath(id, key)
      return typeof value !== 'string'
    })
    if (nonStringId.length > 0) {
      console.log('Non-string values in Indonesian translation:', nonStringId)
    }
    expect(nonStringId).toHaveLength(0)
  })

  it('should not have extra whitespace in translations', () => {
    const enKeys = getAllKeys(en)
    const idKeys = getAllKeys(id)

    // Check English translations
    const whitespaceEn = enKeys.filter((key) => {
      const value = getValueByPath(en, key)
      return typeof value === 'string' && (value.startsWith(' ') || value.endsWith(' '))
    })
    if (whitespaceEn.length > 0) {
      console.log('Values with extra whitespace in English translation:', whitespaceEn)
    }
    expect(whitespaceEn).toHaveLength(0)

    // Check Indonesian translations
    const whitespaceId = idKeys.filter((key) => {
      const value = getValueByPath(id, key)
      return typeof value === 'string' && (value.startsWith(' ') || value.endsWith(' '))
    })
    if (whitespaceId.length > 0) {
      console.log('Values with extra whitespace in Indonesian translation:', whitespaceId)
    }
    expect(whitespaceId).toHaveLength(0)
  })

  it('should have valid interpolation placeholders', () => {
    const enKeys = getAllKeys(en)
    const idKeys = getAllKeys(id)

    // Helper to extract placeholders like {name}, {count}, etc.
    const getPlaceholders = (str) => {
      const matches = str.match(/\{([^}]+)\}/g) || []
      return matches.map((m) => m.slice(1, -1))
    }

    // Check that placeholders match between translations
    const mismatchedPlaceholders = enKeys.filter((key) => {
      const enValue = getValueByPath(en, key)
      const idValue = getValueByPath(id, key)
      if (typeof enValue !== 'string' || typeof idValue !== 'string') return false

      const enPlaceholders = getPlaceholders(enValue)
      const idPlaceholders = getPlaceholders(idValue)

      return (
        !enPlaceholders.every((p) => idPlaceholders.includes(p)) ||
        !idPlaceholders.every((p) => enPlaceholders.includes(p))
      )
    })

    if (mismatchedPlaceholders.length > 0) {
      console.log('Keys with mismatched placeholders:', mismatchedPlaceholders)
      mismatchedPlaceholders.forEach((key) => {
        const enValue = getValueByPath(en, key)
        const idValue = getValueByPath(id, key)
        console.log(`\nKey: ${key}`)
        console.log('EN:', enValue)
        console.log('ID:', idValue)
        console.log('EN placeholders:', getPlaceholders(enValue))
        console.log('ID placeholders:', getPlaceholders(idValue))
      })
    }

    expect(mismatchedPlaceholders).toHaveLength(0)
  })
})
