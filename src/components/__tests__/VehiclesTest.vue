<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Vehicles Integration Test</h2>

    <!-- Stats Summary -->
    <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h3 class="font-semibold mb-2">Data Summary:</h3>
      <p>Total Records: {{ totalRecords }}</p>
      <p>Sample Record:</p>
      <pre class="mt-2 p-2 bg-white rounded text-sm overflow-auto">{{ sampleRecord }}</pre>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="p-4 bg-red-50 text-red-700 rounded-lg mb-6">
      <h3 class="font-semibold mb-2">Error:</h3>
      <p>{{ error }}</p>
    </div>

    <!-- Data Table -->
    <div v-if="vehicles.length" class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th class="px-4 py-2 border">Branch</th>
            <th class="px-4 py-2 border">Vehicle Number</th>
            <th class="px-4 py-2 border">Type</th>
            <th class="px-4 py-2 border">Status</th>
            <th class="px-4 py-2 border">Owner</th>
            <th class="px-4 py-2 border">Brand/Model</th>
            <th class="px-4 py-2 border">STNK Expiry</th>
            <th class="px-4 py-2 border">Tax Expiry</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="vehicle in vehicles.slice(0, 10)"
            :key="vehicle.vehicleNumber"
            class="hover:bg-gray-50"
          >
            <td class="px-4 py-2 border">{{ vehicle.branch }}</td>
            <td class="px-4 py-2 border">{{ vehicle.vehicleNumber }}</td>
            <td class="px-4 py-2 border">{{ vehicle.type }}</td>
            <td class="px-4 py-2 border">{{ vehicle.status }}</td>
            <td class="px-4 py-2 border">{{ vehicle.ownerName }}</td>
            <td class="px-4 py-2 border">{{ vehicle.brand }}/{{ vehicle.model }}</td>
            <td class="px-4 py-2 border">{{ vehicle.stnkExpiry }}</td>
            <td class="px-4 py-2 border">{{ vehicle.taxExpiry }}</td>
          </tr>
        </tbody>
      </table>
      <p class="mt-2 text-sm text-gray-600">Showing first 10 records</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { sheetsConfig } from '@/services/config/googleSheets'
import { GoogleSheetsProvider } from '@/services/providers/GoogleSheetsProvider'

export default {
  name: 'VehiclesTest',
  setup() {
    const vehicles = ref([])
    const error = ref(null)
    const totalRecords = ref(0)
    const sampleRecord = ref(null)

    const fetchData = async () => {
      try {
        const provider = new GoogleSheetsProvider(sheetsConfig)
        await provider.initialize()

        const result = await provider.fetch('vehicles')
        vehicles.value = result.data
        totalRecords.value = result.total

        if (result.data.length > 0) {
          sampleRecord.value = JSON.stringify(result.data[0], null, 2)
        }
      } catch (e) {
        error.value = e.message
        console.error('Error fetching vehicles:', e)
      }
    }

    onMounted(() => {
      fetchData()
    })

    return {
      vehicles,
      error,
      totalRecords,
      sampleRecord,
    }
  },
}
</script>
