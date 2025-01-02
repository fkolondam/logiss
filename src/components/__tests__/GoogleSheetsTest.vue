<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Google Sheets Integration Test</h2>

    <!-- Stats Summary -->
    <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h3 class="text-lg font-semibold mb-2">Data Summary</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div class="text-sm text-gray-600">Cutoff Date:</div>
          <div class="font-medium">October 22, 2024</div>
        </div>
        <div>
          <div class="text-sm text-gray-600">Total Branches:</div>
          <div class="font-medium">{{ branches.length }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-600">Total Deliveries (After Cutoff):</div>
          <div class="font-medium">{{ deliveries.length }}</div>
        </div>
        <div v-if="deliveries.length > 0">
          <div class="text-sm text-gray-600">Date Range:</div>
          <div class="font-medium">
            {{ formatDate(getDateRange().start) }} - {{ formatDate(getDateRange().end) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Debug Info -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-2">Debug Information</h3>
      <div class="bg-gray-100 p-4 rounded">
        <div>Branches URL: {{ branchesUrl }}</div>
        <div>Deliveries URL: {{ deliveriesUrl }}</div>
        <div class="mt-2">
          <button
            @click="testUrls"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test URLs Directly
          </button>
        </div>
      </div>
    </div>

    <!-- Raw CSV Data -->
    <div v-if="rawData.branches || rawData.deliveries" class="mb-6">
      <h3 class="text-lg font-semibold mb-2">Raw CSV Data</h3>
      <div v-if="rawData.branches" class="mb-4">
        <h4 class="font-semibold">Branches CSV (First 200 chars):</h4>
        <pre class="bg-gray-100 p-2 rounded text-sm">{{ rawData.branches }}</pre>
      </div>
      <div v-if="rawData.deliveries">
        <h4 class="font-semibold">Deliveries CSV (First 200 chars):</h4>
        <pre class="bg-gray-100 p-2 rounded text-sm">{{ rawData.deliveries }}</pre>
      </div>
    </div>

    <!-- Branches Data -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-2">
        Branches ({{ branches.length }})
        <span v-if="loading.branches" class="text-sm text-gray-500 ml-2">Loading...</span>
      </h3>
      <div v-if="error.branches" class="text-red-500 mb-2">{{ error.branches }}</div>
      <div v-else-if="branches.length > 0" class="overflow-x-auto">
        <table class="min-w-full bg-white border">
          <thead>
            <tr>
              <th class="px-4 py-2 border">Branch ID</th>
              <th class="px-4 py-2 border">Branch Name</th>
              <th class="px-4 py-2 border">Region</th>
              <th class="px-4 py-2 border">Address</th>
              <th class="px-4 py-2 border">Coordinates</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="branch in branches" :key="branch.branchId">
              <td class="px-4 py-2 border font-mono">{{ branch.branchId }}</td>
              <td class="px-4 py-2 border">{{ branch.branchName }}</td>
              <td class="px-4 py-2 border">{{ branch.region }}</td>
              <td class="px-4 py-2 border">{{ branch.address }}</td>
              <td class="px-4 py-2 border">
                {{ branch.coordinates.lat }}, {{ branch.coordinates.lng }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Deliveries Data -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-2">
        Recent Deliveries ({{ deliveries.length }})
        <span v-if="loading.deliveries" class="text-sm text-gray-500 ml-2">Loading...</span>
      </h3>
      <div v-if="error.deliveries" class="text-red-500 mb-2">{{ error.deliveries }}</div>
      <div v-else-if="deliveries.length > 0">
        <div class="mb-2 text-sm text-gray-600">
          Showing latest 10 deliveries ({{ deliveries.length }} total records after Oct 22, 2024)
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border">
            <thead>
              <tr>
                <th class="px-4 py-2 border">ID</th>
                <th class="px-4 py-2 border">Branch Name</th>
                <th class="px-4 py-2 border">Driver</th>
                <th class="px-4 py-2 border">Date</th>
                <th class="px-4 py-2 border">Time</th>
                <th class="px-4 py-2 border">Customer</th>
                <th class="px-4 py-2 border">Amount</th>
                <th class="px-4 py-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="delivery in deliveries.slice(0, 10)" :key="delivery.id">
                <td class="px-4 py-2 border font-mono">{{ delivery.id }}</td>
                <td class="px-4 py-2 border">{{ delivery.branchName }}</td>
                <td class="px-4 py-2 border">{{ delivery.driver }}</td>
                <td class="px-4 py-2 border">{{ formatDate(delivery.date) }}</td>
                <td class="px-4 py-2 border">{{ delivery.time }}</td>
                <td class="px-4 py-2 border">{{ delivery.customer }}</td>
                <td class="px-4 py-2 border text-right">{{ formatAmount(delivery.amount) }}</td>
                <td class="px-4 py-2 border">{{ delivery.status }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Sample Raw Data -->
        <div class="mt-4">
          <button
            @click="showRawData = !showRawData"
            class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            {{ showRawData ? 'Hide' : 'Show' }} Raw Data Sample
          </button>
          <pre v-if="showRawData" class="mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-96">
            {{ JSON.stringify(deliveries[0], null, 2) }}
          </pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { dataProviderFactory } from '@/services/DataProviderFactory'

const branches = ref([])
const deliveries = ref([])
const loading = ref({ branches: true, deliveries: true })
const error = ref({ branches: null, deliveries: null })
const showRawData = ref(false)
const rawData = ref({ branches: '', deliveries: '' })

// Get URLs from environment
const branchesUrl = ref(import.meta.env.VITE_SHEETS_BRANCHES_URL || 'Not configured')
const deliveriesUrl = ref(import.meta.env.VITE_SHEETS_DELIVERIES_URL || 'Not configured')

// Get date range of deliveries
const getDateRange = () => {
  if (deliveries.value.length === 0) {
    return { start: null, end: null }
  }

  const dates = deliveries.value.map((d) => new Date(d.date))
  return {
    start: new Date(Math.min(...dates)),
    end: new Date(Math.max(...dates)),
  }
}

// Format amount as currency
const formatAmount = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format date for display
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

// Test URLs directly
const testUrls = async () => {
  console.log('Testing URLs directly...')

  try {
    // Test branches URL
    console.log('Testing branches URL:', branchesUrl.value)
    const branchesResponse = await fetch(branchesUrl.value)
    const branchesText = await branchesResponse.text()
    rawData.value.branches = branchesText.substring(0, 200)
    console.log('Branches response:', {
      status: branchesResponse.status,
      headers: Object.fromEntries(branchesResponse.headers),
      sample: branchesText.substring(0, 200),
    })

    // Test deliveries URL
    console.log('Testing deliveries URL:', deliveriesUrl.value)
    const deliveriesResponse = await fetch(deliveriesUrl.value)
    const deliveriesText = await deliveriesResponse.text()
    rawData.value.deliveries = deliveriesText.substring(0, 200)
    console.log('Deliveries response:', {
      status: deliveriesResponse.status,
      headers: Object.fromEntries(deliveriesResponse.headers),
      sample: deliveriesText.substring(0, 200),
    })
  } catch (e) {
    console.error('Error testing URLs:', e)
  }
}

onMounted(async () => {
  try {
    console.log('Initializing data provider...')

    // Initialize the provider
    await dataProviderFactory.initialize()
    console.log('Provider initialized')

    // Fetch branches
    try {
      loading.value.branches = true
      console.log('Fetching branches...')
      const branchesResult = await dataProviderFactory.getData('branches', { type: 'global' })
      branches.value = branchesResult.data
      console.log('Branches fetched:', branchesResult)
    } catch (e) {
      error.value.branches = e.message
      console.error('Error fetching branches:', e)
    } finally {
      loading.value.branches = false
    }

    // Fetch deliveries
    try {
      loading.value.deliveries = true
      console.log('Fetching deliveries...')
      const deliveriesResult = await dataProviderFactory.getData('deliveries', { type: 'global' })
      deliveries.value = deliveriesResult.data
      console.log('Deliveries fetched:', deliveriesResult)
    } catch (e) {
      error.value.deliveries = e.message
      console.error('Error fetching deliveries:', e)
    } finally {
      loading.value.deliveries = false
    }
  } catch (e) {
    console.error('Error initializing provider:', e)
    error.value.branches = 'Failed to initialize data provider: ' + e.message
    error.value.deliveries = 'Failed to initialize data provider: ' + e.message
  }
})
</script>
