export class BaseDataProvider {
  constructor() {
    if (this.constructor === BaseDataProvider) {
      throw new Error('Abstract class "BaseDataProvider" cannot be instantiated')
    }
  }

  async fetch(resource, params = {}) {
    throw new Error('Method "fetch" must be implemented')
  }

  async create(resource, data) {
    throw new Error('Method "create" must be implemented')
  }

  async update(resource, id, data) {
    throw new Error('Method "update" must be implemented')
  }

  async delete(resource, id) {
    throw new Error('Method "delete" must be implemented')
  }
}
