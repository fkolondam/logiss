<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Google Sheets Integration Test</h2>

    <!-- Stats Summary -->
    <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h3 class="text-lg font-semibold mb-2">Data Summary</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div class="text-sm text-gray-600">Total Branches:</div>
          <div class="font-medium">{{ branches.length }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-600">Total Deliveries:</div>
          <div class="font-medium">{{ deliveries.length }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-600">Total Expenses:</div>
          <div class="font-medium">{{ expenses.length }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-600">Total Vehicles:</div>
          <div class="font-medium">{{ vehicles.length }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-600">Total Invoices:</div>
          <div class="font-medium">{{ invoices.length }}</div>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="hasErrors" class="mb-6 bg-red-50 p-4 rounded-lg border border-red-200">
      <h3 class="text-lg font-semibold mb-2 text-red-700">Errors</h3>
      <div v-if="error.branches" class="text-red-600">Branches: {{ error.branches }}</div>
      <div v-if="error.deliveries" class="text-red-600">Deliveries: {{ error.deliveries }}</div>
      <div v-if="error.expenses" class="text-red-600">Expenses: {{ error.expenses }}</div>
      <div v-if="error.vehicles" class="text-red-600">Vehicles: {{ error.vehicles }}</div>
      <div v-if="error.invoices" class="text-red-600">Invoices: {{ error.invoices }}</div>
    </div>

    <!-- Data Sections -->
    <div class="space-y-8">
      <!-- Branches Section -->
      <section v-if="branches.length" class="border rounded-lg p-4">
        <h3 class="text-lg font-semibold mb-4">Branches ({{ branches.length }})</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border">
            <thead>
              <tr>
                <th class="px-4 py-2 border">Branch ID</th>
                <th class="px-4 py-2 border">Branch Name</th>
                <th class="px-4 py-2 border">Region</th>
                <th class="px-4 py-2 border">Address</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="branch in branches.slice(0, 5)" :key="branch.branchId">
                <td class="px-4 py-2 border">{{ branch.branchId }}</td>
                <td class="px-4 py-2 border">{{ branch.branchName }}</td>
                <td class="px-4 py-2 border">{{ branch.region }}</td>
                <td class="px-4 py-2 border">{{ branch.address }}</td>
              </tr>
            </tbody>
          </table>
          <div class="mt-2 text-sm text-gray-600">Showing first 5 records</div>
        </div>
      </section>

      <!-- Deliveries Section -->
      <section v-if="deliveries.length" class="border rounded-lg p-4">
        <h3 class="text-lg font-semibold mb-4">Deliveries ({{ deliveries.length }})</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border">
            <thead>
              <tr>
                <th class="px-4 py-2 border">Branch</th>
                <th class="px-4 py-2 border">Date</th>
                <th class="px-4 py-2 border">Driver</th>
                <th class="px-4 py-2 border">Customer</th>
                <th class="px-4 py-2 border">Amount</th>
                <th class="px-4 py-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="delivery in deliveries.slice(0, 5)" :key="delivery.id">
                <td class="px-4 py-2 border">{{ delivery.branchName }}</td>
                <td class="px-4 py-2 border">{{ delivery.date }}</td>
                <td class="px-4 py-2 border">{{ delivery.driver }}</td>
                <td class="px-4 py-2 border">{{ delivery.customer }}</td>
                <td class="px-4 py-2 border text-right">{{ formatAmount(delivery.amount) }}</td>
                <td class="px-4 py-2 border">{{ delivery.status }}</td>
              </tr>
            </tbody>
          </table>
          <div class="mt-2 text-sm text-gray-600">Showing first 5 records</div>
        </div>
      </section>

      <!-- Expenses Section -->
      <section v-if="expenses.length" class="border rounded-lg p-4">
        <h3 class="text-lg font-semibold mb-4">Expenses ({{ expenses.length }})</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border">
            <thead>
              <tr>
                <th class="px-4 py-2 border">Branch</th>
                <th class="px-4 py-2 border">Date</th>
                <th class="px-4 py-2 border">Category</th>
                <th class="px-4 py-2 border">Component</th>
                <th class="px-4 py-2 border">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="expense in expenses.slice(0, 5)" :key="expense.idjournal">
                <td class="px-4 py-2 border">{{ expense.branch }}</td>
                <td class="px-4 py-2 border">{{ expense.date }}</td>
                <td class="px-4 py-2 border">{{ expense.category }}</td>
                <td class="px-4 py-2 border">{{ expense.component }}</td>
                <td class="px-4 py-2 border text-right">{{ formatAmount(expense.amount) }}</td>
              </tr>
            </tbody>
          </table>
          <div class="mt-2 text-sm text-gray-600">Showing first 5 records</div>
        </div>
      </section>

      <!-- Vehicles Section -->
      <section v-if="vehicles.length" class="border rounded-lg p-4">
        <h3 class="text-lg font-semibold mb-4">Vehicles ({{ vehicles.length }})</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border">
            <thead>
              <tr>
                <th class="px-4 py-2 border">Branch</th>
                <th class="px-4 py-2 border">Vehicle Number</th>
                <th class="px-4 py-2 border">Type</th>
                <th class="px-4 py-2 border">Status</th>
                <th class="px-4 py-2 border">STNK Expiry</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="vehicle in vehicles.slice(0, 5)" :key="vehicle.vehicleNumber">
                <td class="px-4 py-2 border">{{ vehicle.branch }}</td>
                <td class="px-4 py-2 border">{{ vehicle.vehicleNumber }}</td>
                <td class="px-4 py-2 border">{{ vehicle.type }}</td>
                <td class="px-4 py-2 border">{{ vehicle.status }}</td>
                <td class="px-4 py-2 border">{{ vehicle.stnkExpiry }}</td>
              </tr>
            </tbody>
          </table>
          <div class="mt-2 text-sm text-gray-600">Showing first 5 records</div>
        </div>
      </section>

      <!-- Invoices Section -->
      <section v-if="invoices.length" class="border rounded-lg p-4">
        <h3 class="text-lg font-semibold mb-4">Invoices ({{ invoices.length }})</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border">
            <thead>
              <tr>
                <th class="px-4 py-2 border">Branch</th>
                <th class="px-4 py-2 border">Date</th>
                <th class="px-4 py-2 border">Invoice Number</th>
                <th class="px-4 py-2 border">Customer</th>
                <th class="px-4 py-2 border">DPP</th>
                <th class="px-4 py-2 border">PPN</th>
                <th class="px-4 py-2 border">Net Sales</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="invoice in invoices.slice(0, 5)" :key="invoice.invoiceNumber">
                <td class="px-4 py-2 border">{{ invoice.branch }}</td>
                <td class="px-4 py-2 border">{{ invoice.date }}</td>
                <td class="px-4 py-2 border">{{ invoice.invoiceNumber }}</td>
                <td class="px-4 py-2 border">{{ invoice.customerName }}</td>
                <td class="px-4 py-2 border text-right">{{ formatAmount(invoice.dpp) }}</td>
                <td class="px-4 py-2 border text-right">{{ formatAmount(invoice.ppn) }}</td>
                <td class="px-4 py-2 border text-right">{{ formatAmount(invoice.netSales) }}</td>
              </tr>
            </tbody>
          </table>
          <div class="mt-2 text-sm text-gray-600">Showing first 5 records</div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { GoogleSheetsProvider } from '@/services/providers/GoogleSheetsProvider'
import { sheetsConfig } from '@/services/config/googleSheets'

// Data refs
const branches = ref([])
const deliveries = ref([])
const expenses = ref([])
const vehicles = ref([])
const invoices = ref([])

// Error handling
const error = ref({
  branches: null,
  deliveries: null,
  expenses: null,
  vehicles: null,
  invoices: null,
})

const hasErrors = computed(() => {
  return Object.values(error.value).some((err) => err !== null)
})

// Format amount as currency
const formatAmount = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Fetch data for each resource
const fetchData = async (resource) => {
  try {
    const provider = new GoogleSheetsProvider(sheetsConfig)
    const result = await provider.fetch(resource)
    return result.data
  } catch (e) {
    error.value[resource] = e.message
    console.error(`Error fetching ${resource}:`, e)
    return []
  }
}

onMounted(async () => {
  try {
    const provider = new GoogleSheetsProvider(sheetsConfig)
    await provider.initialize()

    // Fetch all data in parallel
    const results = await Promise.all([
      fetchData('branches'),
      fetchData('deliveries'),
      fetchData('expenses'),
      fetchData('vehicles'),
      fetchData('invoices'),
    ])

    // Update refs
    ;[branches.value, deliveries.value, expenses.value, vehicles.value, invoices.value] = results

    console.log('All data fetched:', {
      branches: branches.value.length,
      deliveries: deliveries.value.length,
      expenses: expenses.value.length,
      vehicles: vehicles.value.length,
      invoices: invoices.length,
    })
  } catch (e) {
    console.error('Error initializing provider:', e)
    error.value.general = e.message
  }
})
</script>
