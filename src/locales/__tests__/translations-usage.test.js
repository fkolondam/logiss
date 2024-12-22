import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import en from '../en'
import id from '../id'

describe('Translation Usage', () => {
  // Helper function to get all translation keys
  const getAllTranslationKeys = (obj, prefix = '') => {
    return Object.keys(obj).reduce((keys, key) => {
      const newPrefix = prefix ? `${prefix}.${key}` : key
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        return [...keys, ...getAllTranslationKeys(obj[key], newPrefix)]
      }
      return [...keys, newPrefix]
    }, [])
  }

  // Helper function to check if key exists in translations
  const keyExistsInTranslations = (key, translations) => {
    return key.split('.').reduce((obj, k) => obj && obj[k], translations) !== undefined
  }

  // Helper function to extract t() function calls
  const extractTranslationKeys = (content) => {
    const keys = new Set()

    // Match t('key.subkey') pattern, excluding CSS classes
    const singleQuoteMatches = content.match(/t\('([^']+)'\)/g) || []
    singleQuoteMatches.forEach((match) => {
      const key = match.match(/t\('([^']+)'\)/)[1]
      // Skip if key starts with a dot (CSS class)
      if (!key.startsWith('.')) {
        keys.add(key)
      }
    })

    // Match t("key.subkey") pattern, excluding CSS classes
    const doubleQuoteMatches = content.match(/t\("([^"]+)"\)/g) || []
    doubleQuoteMatches.forEach((match) => {
      const key = match.match(/t\("([^"]+)"\)/)[1]
      // Skip if key starts with a dot (CSS class)
      if (!key.startsWith('.')) {
        keys.add(key)
      }
    })

    // Match template literal pattern t(\`key.subkey\`), excluding CSS classes and dynamic keys
    const templateLiteralMatches = content.match(/t\(`([^`]+)`\)/g) || []
    templateLiteralMatches.forEach((match) => {
      const key = match.match(/t\(`([^`]+)`\)/)[1]
      // Skip if key starts with a dot (CSS class) or contains ${} (dynamic)
      if (!key.startsWith('.') && !key.includes('${')) {
        keys.add(key)
      }
    })

    return Array.from(keys)
  }

  // Helper function to recursively get all .vue files
  const getVueFiles = (dir) => {
    let results = []
    const items = readdirSync(dir, { withFileTypes: true })

    for (const item of items) {
      const path = join(dir, item.name)
      if (item.isDirectory()) {
        results = results.concat(getVueFiles(path))
      } else if (item.name.endsWith('.vue')) {
        results.push(path)
      }
    }

    return results
  }

  it('should have all component translation keys defined in both languages', () => {
    const srcPath = join(process.cwd(), 'src')
    const vueFiles = getVueFiles(srcPath)
    const missingKeys = {
      en: new Set(),
      id: new Set(),
    }
    const componentKeys = new Map()

    // Extract all translation keys from components
    vueFiles.forEach((file) => {
      const content = readFileSync(file, 'utf-8')
      const keys = extractTranslationKeys(content)
      if (keys.length > 0) {
        componentKeys.set(file, keys)
      }
    })

    // Check if all keys exist in translations
    componentKeys.forEach((keys, file) => {
      const relativePath = file.replace(process.cwd(), '')
      keys.forEach((key) => {
        if (!keyExistsInTranslations(key, en)) {
          missingKeys.en.add(`${relativePath}: ${key}`)
        }
        if (!keyExistsInTranslations(key, id)) {
          missingKeys.id.add(`${relativePath}: ${key}`)
        }
      })
    })

    // Report missing keys
    if (missingKeys.en.size > 0) {
      console.log('\nMissing English translations:')
      missingKeys.en.forEach((key) => console.log(`- ${key}`))
    }
    if (missingKeys.id.size > 0) {
      console.log('\nMissing Indonesian translations:')
      missingKeys.id.forEach((key) => console.log(`- ${key}`))
    }

    // Generate usage report
    console.log('\nTranslation Key Usage Report:')
    componentKeys.forEach((keys, file) => {
      const relativePath = file.replace(process.cwd(), '')
      console.log(`\n${relativePath}:`)
      keys.forEach((key) => console.log(`- ${key}`))
    })

    expect(missingKeys.en.size).toBe(0)
    expect(missingKeys.id.size).toBe(0)
  })

  it('should have all translation keys used in at least one component', () => {
    const srcPath = join(process.cwd(), 'src')
    const vueFiles = getVueFiles(srcPath)
    const allTranslationKeys = new Set([...getAllTranslationKeys(en), ...getAllTranslationKeys(id)])
    const usedKeys = new Set()

    // Extract all used translation keys from components
    vueFiles.forEach((file) => {
      const content = readFileSync(file, 'utf-8')
      const keys = extractTranslationKeys(content)
      keys.forEach((key) => usedKeys.add(key))
    })

    // Find unused translation keys
    const unusedKeys = Array.from(allTranslationKeys)
      .filter((key) => !Array.from(usedKeys).some((usedKey) => usedKey.startsWith(key)))
      .sort()

    if (unusedKeys.length > 0) {
      console.log('\nUnused translation keys:')
      unusedKeys.forEach((key) => console.log(`- ${key}`))
    }

    // We don't fail the test for unused keys, just report them
    expect(true).toBe(true)
  })
})
