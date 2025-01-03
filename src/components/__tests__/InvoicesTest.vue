<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Invoices Integration Test</h2>

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
    <div v-if="invoices.length" class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th class="px-4 py-2 border">Branch</th>
            <th class="px-4 py-2 border">Date</th>
            <th class="px-4 py-2 border">Invoice Number</th>
            <th class="px-4 py-2 border">Customer</th>
            <th class="px-4 py-2 border">Channel</th>
            <th class="px-4 py-2 border">Transaction Type</th>
            <th class="px-4 py-2 border">DPP</th>
            <th class="px-4 py-2 border">PPN</th>
            <th class="px-4 py-2 border">Net Sales</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="invoice in invoices.slice(0, 10)"
            :key="invoice.invoiceNumber"
            class="hover:bg-gray-50"
          >
            <td class="px-4 py-2 border">{{ invoice.branch }}</td>
            <td class="px-4 py-2 border">{{ invoice.date }}</td>
            <td class="px-4 py-2 border">{{ invoice.invoiceNumber }}</td>
            <td class="px-4 py-2 border">{{ invoice.customerName }}</td>
            <td class="px-4 py-2 border">{{ invoice.channel }}</td>
            <td class="px-4 py-2 border">{{ invoice.transactionType }}</td>
            <td class="px-4 py-2 border">{{ formatAmount(invoice.dpp) }}</td>
            <td class="px-4 py-2 border">{{ formatAmount(invoice.ppn) }}</td>
            <td class="px-4 py-2 border">{{ formatAmount(invoice.netSales) }}</td>
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
  name: 'InvoicesTest',
  setup() {
    const invoices = ref([])
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

        const result = await provider.fetch('invoices')
        invoices.value = result.data
        totalRecords.value = result.total

        if (result.data.length > 0) {
          sampleRecord.value = JSON.stringify(result.data[0], null, 2)
        }
      } catch (e) {
        error.value = e.message
        console.error('Error fetching invoices:', e)
      }
    }

    onMounted(() => {
      fetchData()
    })

    return {
      invoices,
      error,
      totalRecords,
      sampleRecord,
      formatAmount,
    }
  },
}
</script>
