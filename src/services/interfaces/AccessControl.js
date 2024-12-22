/**
 * @typedef {import('./DataProvider').AccessLevel} AccessLevel
 * @typedef {import('./DataProvider').Scope} Scope
 */

/**
 * @typedef {Object} Permission
 * @property {string} resource - Resource name
 * @property {Array<string>} actions - Allowed actions
 */

/**
 * @typedef {Object} Role
 * @property {string} name - Role name
 * @property {AccessLevel} level - Access level
 * @property {Array<Permission>} permissions - Role permissions
 */

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} name - User name
 * @property {string} role - Role name
 * @property {Scope} scope - User's access scope
 */

/**
 * Access Control Interface
 * @interface
 */
class AccessControlInterface {
  /**
   * Get current user
   * @returns {User|null}
   */
  getCurrentUser() {
    throw new Error('Not implemented')
  }

  /**
   * Check if current user has permission
   * @param {string} permission - Permission to check
   * @param {string} [resource] - Resource to check permission for
   * @returns {boolean}
   */
  hasPermission(permission, resource) {
    throw new Error('Not implemented')
  }

  /**
   * Get current user's scope
   * @returns {Scope}
   */
  getScope() {
    throw new Error('Not implemented')
  }

  /**
   * Switch current user (for testing)
   * @param {string} userId - User ID to switch to
   * @returns {Promise<User>}
   */
  switchUser(userId) {
    throw new Error('Not implemented')
  }
}

export { AccessControlInterface }
