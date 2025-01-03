<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Expenses Integration Test</h2>

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
    <div v-if="expenses.length" class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th class="px-4 py-2 border">Cabang</th>
            <th class="px-4 py-2 border">Tanggal</th>
            <th class="px-4 py-2 border">Kategori</th>
            <th class="px-4 py-2 border">Komponen</th>
            <th class="px-4 py-2 border">Nomor Polisi</th>
            <th class="px-4 py-2 border">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="expense in expenses.slice(0, 10)"
            :key="expense.idjournal"
            class="hover:bg-gray-50"
          >
            <td class="px-4 py-2 border">{{ expense.branch }}</td>
            <td class="px-4 py-2 border">{{ expense.date }}</td>
            <td class="px-4 py-2 border">{{ expense.category }}</td>
            <td class="px-4 py-2 border">{{ expense.component }}</td>
            <td class="px-4 py-2 border">{{ expense.vehicleNumber }}</td>
            <td class="px-4 py-2 border">{{ formatAmount(expense.amount) }}</td>
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
  name: 'ExpensesTest',
  setup() {
    const expenses = ref([])
    const error = ref(null)
    const totalRecords = ref(0)
    const sampleRecord = ref(null)

    const formatAmount = (amount) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
      }).format(amount)
    }

    const fetchData = async () => {
      try {
        const provider = new GoogleSheetsProvider(sheetsConfig)
        await provider.initialize()

        const result = await provider.fetch('expenses')
        expenses.value = result.data
        totalRecords.value = result.total

        if (result.data.length > 0) {
          sampleRecord.value = JSON.stringify(result.data[0], null, 2)
        }
      } catch (e) {
        error.value = e.message
        console.error('Error fetching expenses:', e)
      }
    }

    onMounted(() => {
      fetchData()
    })

    return {
      expenses,
      error,
      totalRecords,
      sampleRecord,
      formatAmount,
    }
  },
}
</script>
