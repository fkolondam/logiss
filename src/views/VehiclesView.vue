<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">{{ t('vehicles.title') }}</h1>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-500">Total Vehicles</div>
        <div class="text-2xl font-bold">{{ stats.total }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-500">Active</div>
        <div class="text-2xl font-bold text-green-600">{{ stats.active }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-500">Maintenance</div>
        <div class="text-2xl font-bold text-yellow-600">{{ stats.maintenance }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-500">Due for Service</div>
        <div class="text-2xl font-bold text-red-600">{{ stats.dueService }}</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input 
          v-model="filters.search" 
          type="text" 
          placeholder="Search plate number or model"
          class="border rounded px-3 py-2"
          @input="handleSearch"
        />
        <select 
          v-model="filters.type" 
          class="border rounded px-3 py-2"
          @change="handleFilter"
        >
          <option value="">All Types</option>
          <option value="Truck">Truck</option>
          <option value="Van">Van</option>
        </select>
        <select 
          v-model="filters.status" 
          class="border rounded px-3 py-2"
          @change="handleFilter"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="maintenance">Maintenance</option>
        </select>
        <button 
          @click="resetFilters"
          class="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded"
        >
          Reset Filters
        </button>
      </div>
    </div>

    <!-- Vehicles Table -->
    <div class="bg-white rounded-lg shadow">
      <div v-if="loading" class="p-4 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      </div>
      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Info</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Service</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Service</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="vehicle in vehicles" :key="vehicle.id">
                <td class="px-6 py-4">
                  <div class="font-medium">{{ vehicle.plateNumber }}</div>
                  <div class="text-sm text-gray-500">{{ vehicle.model }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>{{ vehicle.type }}</div>
                  <div class="text-sm text-gray-500">{{ vehicle.capacity }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[
                    'px-2 py-1 text-xs rounded-full',
                    vehicle.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  ]">
                    {{ vehicle.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">{{ vehicle.lastServiceDate }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div :class="[
                    isServiceDue(vehicle.nextServiceDue) ? 'text-red-600 font-medium' : ''
                  ]">
                    {{ vehicle.nextServiceDue }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  {{ vehicle.assignedDriver?.name || 'Unassigned' }}
                </td>
                <td class="px-6 py-4">
                  <div v-if="vehicle.currentLocation">
                    <button 
                      @click="viewLocation(vehicle)"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      View Map
                    </button>
                    <div class="text-sm text-gray-500">
                      Last update: {{ formatDateTime(vehicle.currentLocation.lastUpdate) }}
                    </div>
                  </div>
                  <div v-else class="text-gray-500">No location data</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <button 
                    @click="viewDetails(vehicle)"
                    class="text-blue-600 hover:text-blue-900 mr-2"
                  >
                    Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useTranslations } from '@/composables/useTranslations'
import { dataProviderFactory } from '@/services/DataProviderFactory'

export default {
  name: 'VehiclesView',
  setup() {
    const { t } = useTranslations()
    const provider = dataProviderFactory.getProvider()

    const vehicles = ref([])
    const stats = ref({
      total: 0,
      active: 0,
      maintenance: 0,
      dueService: 0
    })
    const loading = ref(true)

    const filters = ref({
      search: '',
      type: '',
      status: ''
    })

    const fetchVehicles = async () => {
      loading.value = true
      try {
        const params = {
          sort: 'plateNumber,asc'
        }

        // Add filters if they exist
        if (filters.value.type) params.type = filters.value.type
        if (filters.value.status) params.status = filters.value.status
        if (filters.value.search) params.search = filters.value.search

        vehicles.value = await provider.fetch('vehicles', params)
        
        // Calculate stats
        stats.value = {
          total: vehicles.value.length,
          active: vehicles.value.filter(v => v.status === 'active').length,
          maintenance: vehicles.value.filter(v => v.status === 'maintenance').length,
          dueService: vehicles.value.filter(v => isServiceDue(v.nextServiceDue)).length
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error)
      } finally {
        loading.value = false
      }
    }

    const isServiceDue = (date) => {
      if (!date) return false
      const serviceDate = new Date(date)
      const today = new Date()
      return serviceDate <= today
    }

    const formatDateTime = (dateTime) => {
      if (!dateTime) return ''
      return new Date(dateTime).toLocaleString()
    }

    const handleSearch = () => {
      fetchVehicles()
    }

    const handleFilter = () => {
      fetchVehicles()
    }

    const resetFilters = () => {
      filters.value = {
        search: '',
        type: '',
        status: ''
      }
      fetchVehicles()
    }

    const viewLocation = (vehicle) => {
      // Implementation for viewing vehicle location on map
      console.log('View location:', vehicle.currentLocation)
    }

    const viewDetails = (vehicle) => {
      // Implementation for viewing vehicle details
      console.log('View details:', vehicle)
    }

    onMounted(fetchVehicles)

    return {
      t,
      vehicles,
      stats,
      loading,
      filters,
      handleSearch,
      handleFilter,
      resetFilters,
      viewLocation,
      viewDetails,
      isServiceDue,
      formatDateTime
    }
  }
}
</script>
