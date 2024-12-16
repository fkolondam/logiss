import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import DataSourceTester from '../debug/DataSourceTester.vue'
import { useDataSourceStore } from '../stores/dataSource.js' // Adjusted import path
import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../stores/dataSource.js') // Adjusted mock path

describe('DataSourceTester.vue', () => {
  let store
  let wrapper
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    store = {
      provider: {
        fetch: vi.fn()
      },
      switchDataSource: vi.fn()
    }
    useDataSourceStore.mockReturnValue(store)

    wrapper = mount(DataSourceTester, {
      global: {
        plugins: [pinia]
      }
    })
  })

  it('renders correctly and fetches data', async () => {
    const mockData = {
      deliveries: [{ id: 1, name: 'Delivery 1' }],
      expenses: [{ id: 1, amount: 100 }],
      vehicles: [{ id: 1, vehicle: 'Vehicle 1' }]
    }

    store.provider.fetch.mockImplementation((type) => {
      return Promise.resolve(mockData[type] || [])
    })

    // Wait for initial fetch to complete
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verify the results
    expect(store.provider.fetch).toHaveBeenCalledWith('deliveries', { limit: 5 })
    expect(store.provider.fetch).toHaveBeenCalledWith('expenses', { limit: 5 })
    expect(store.provider.fetch).toHaveBeenCalledWith('vehicles', { limit: 5 })

    // Check if data is displayed
    const text = wrapper.text()
    expect(text).toContain('Found 1 records')
  })

  it('handles errors when fetching data', async () => {
    const errorMessage = 'Fetch error'
    store.provider.fetch.mockRejectedValueOnce(new Error(errorMessage))
      .mockResolvedValue([]) // Other calls return empty arrays

    wrapper = mount(DataSourceTester)

    // Wait for error to appear
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(wrapper.text()).toContain(`Error: ${errorMessage}`)
  })

  it('switches data sources', async () => {
    store.provider.fetch.mockResolvedValue([])
    wrapper = mount(DataSourceTester)
    
    const newSource = 'NEW_SOURCE'
    await wrapper.vm.switchSource(newSource)

    expect(store.switchDataSource).toHaveBeenCalledWith(newSource)
  })
})