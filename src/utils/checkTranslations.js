const enTranslations = require('../locales/en.js').default
const idTranslations = require('../locales/id.js').default

function validateTranslations(en, id) {
  const missingKeys = {
    en: [],
    id: []
  }
  const differences = []

  const checkObjects = (enObj, idObj, path = '') => {
    // Check EN keys that don't exist in ID
    Object.keys(enObj).forEach(key => {
      const currentPath = path ? path + '.' + key : key
      if (!(key in idObj)) {
        missingKeys.id.push(currentPath)
      } else if (typeof enObj[key] === 'object' && enObj[key] !== null) {
        checkObjects(enObj[key], idObj[key], currentPath)
      }
    })

    // Check ID keys that don't exist in EN
    Object.keys(idObj).forEach(key => {
      const currentPath = path ? path + '.' + key : key
      if (!(key in enObj)) {
        missingKeys.en.push(currentPath)
      }
    })

    // Check for different value types
    Object.keys(enObj).forEach(key => {
      const currentPath = path ? path + '.' + key : key
      if (key in idObj) {
        const enType = typeof enObj[key]
        const idType = typeof idObj[key]
        if (enType !== idType && enType !== 'object' && idType !== 'object') {
          differences.push({
            path: currentPath,
            en: { type: enType, value: enObj[key] },
            id: { type: idType, value: idObj[key] }
          })
        }
      }
    })
  }

  checkObjects(en, id)

  return {
    missingKeys,
    differences,
    isValid: missingKeys.en.length === 0 && missingKeys.id.length === 0 && differences.length === 0
  }
}

console.log('Validating translations...\n')

const result = validateTranslations(enTranslations, idTranslations)

if (result.isValid) {
  console.log('✓ All translations are valid!')
} else {
  if (result.missingKeys.en.length > 0) {
    console.log('\nMissing keys in EN:')
    result.missingKeys.en.forEach(key => console.log('  - ' + key))
  }

  if (result.missingKeys.id.length > 0) {
    console.log('\nMissing keys in ID:')
    result.missingKeys.id.forEach(key => console.log('  - ' + key))
  }

  if (result.differences.length > 0) {
    console.log('\nType differences:')
    result.differences.forEach(diff => {
      console.log('  - ' + diff.path + ':')
      console.log('    EN (' + diff.en.type + '): ' + diff.en.value)
      console.log('    ID (' + diff.id.type + '): ' + diff.id.value)
    })
  }
}
