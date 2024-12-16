<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">{{ t('expenses.title') }}</h1>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div v-for="(stat, key) in stats" :key="key" class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-500">{{ t(`expenses.stats.${key}`) }}</div>
        <div class="text-2xl font-bold">{{ stat }}</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input 
          v-model="filters.search" 
          type="text" 
          placeholder="Search description"
          class="border rounded px-3 py-2"
          @input="handleSearch"
        />
        <select 
          v-model="filters.category" 
          class="border rounded px-3 py-2"
          @change="handleFilter"
        >
          <option value="">All Categories</option>
          <option value="Fuel">Fuel</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Toll">Toll</option>
        </select>
        <select 
          v-model="filters.status" 
          class="border rounded px-3 py-2"
          @change="handleFilter"
        >
          <option value="">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>
        <button 
          @click="resetFilters"
          class="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded"
        >
          Reset Filters
        </button>
      </div>
    </div>

    <!-- Expenses Table -->
    <div class="bg-white rounded-lg shadow">
      <div v-if="loading" class="p-4 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      </div>
      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="expense in expenses" :key="expense.id">
                <td class="px-6 py-4 whitespace-nowrap">{{ expense.date }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ expense.category }}</td>
                <td class="px-6 py-4">{{ expense.description }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ expense.vehicleNumber }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ expense.driver }}</td>
                <td class="px-6 py-4 whitespace-nowrap font-medium">{{ expense.amount }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[
                    'px-2 py-1 text-xs rounded-full',
                    expense.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  ]">
                    {{ expense.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <button 
                    @click="viewReceipt(expense)"
                    class="text-blue-600 hover:text-blue-900 mr-2"
                  >
                    View Receipt
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
  name: 'ExpensesView',
  setup() {
    const { t } = useTranslations()
    const provider = dataProviderFactory.getProvider()

    const expenses = ref([])
    const stats = ref({
      total: 0,
      pending: 0,
      approved: 0
    })
    const loading = ref(true)

    const filters = ref({
      search: '',
      category: '',
      status: ''
    })

    const fetchExpenses = async () => {
      loading.value = true
      try {
        const params = {
          sort: 'date,desc'
        }

        // Add filters if they exist
        if (filters.value.category) params.category = filters.value.category
        if (filters.value.status) params.status = filters.value.status
        if (filters.value.search) params.search = filters.value.search

        expenses.value = await provider.fetch('expenses', params)
        
        // Calculate stats
        stats.value = {
          total: expenses.value.reduce((sum, exp) => sum + exp.amount, 0),
          pending: expenses.value.filter(exp => exp.status === 'pending').length,
          approved: expenses.value.filter(exp => exp.status === 'approved').length
        }
      } catch (error) {
        console.error('Error fetching expenses:', error)
      } finally {
        loading.value = false
      }
    }

    const handleSearch = () => {
      fetchExpenses()
    }

    const handleFilter = () => {
      fetchExpenses()
    }

    const resetFilters = () => {
      filters.value = {
        search: '',
        category: '',
        status: ''
      }
      fetchExpenses()
    }

    const viewReceipt = (expense) => {
      // Implementation for viewing receipt
      if (expense.receipt) {
        window.open(expense.receipt, '_blank')
      }
    }

    onMounted(fetchExpenses)

    return {
      t,
      expenses,
      stats,
      loading,
      filters,
      handleSearch,
      handleFilter,
      resetFilters,
      viewReceipt
    }
  }
}
</script>
