<template>
  <div class="p-4">
    <div class="mb-4">
      <h2 class="text-xl font-bold mb-2">Data Source Control</h2>
      <div class="flex gap-2">
        <button 
          v-for="type in dataSourceTypes" 
          :key="type"
          @click="switchDataSource(type)"
          :class="[
            'px-4 py-2 rounded',
            currentSource === type 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          ]"
        >
          {{ type }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-gray-600">
      Loading...
    </div>
    <div v-else>
      <h3 class="font-bold mb-2">Recent Deliveries</h3>
      <div class="space-y-2">
        <div 
          v-for="delivery in deliveries" 
          :key="delivery.id"
          class="p-4 bg-white rounded shadow"
        >
          <div class="flex justify-between">
            <div>
              <div class="font-bold">{{ delivery.customer }}</div>
              <div class="text-sm text-gray-600">{{ delivery.location }}</div>
            </div>
            <div class="text-right">
              <div>{{ delivery.date }} {{ delivery.time }}</div>
              <div :class="[
                'text-sm font-medium',
                delivery.status.includes('DITERIMA') ? 'text-green-600' : 'text-red-600'
              ]">
                {{ delivery.status }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { dataProviderFactory, DataSourceType } from '@/services/DataProviderFactory'

export default {
  name: 'DataSourceExample',
  setup() {
    const deliveries = ref([])
    const loading = ref(false)
    const currentSource = ref(DataSourceType.MOCK)
    const dataSourceTypes = Object.values(DataSourceType)

    const fetchDeliveries = async () => {
      loading.value = true
      try {
        const provider = dataProviderFactory.getProvider()
        deliveries.value = await provider.fetch('deliveries', {
          sort: 'date,desc',
          limit: 5
        })
      } catch (error) {
        console.error('Error fetching deliveries:', error)
      } finally {
        loading.value = false
      }
    }

    const switchDataSource = async (type) => {
      currentSource.value = type
      dataProviderFactory.setDataSource(type)
      await fetchDeliveries()
    }

    onMounted(fetchDeliveries)

    return {
      deliveries,
      loading,
      currentSource,
      dataSourceTypes,
      switchDataSource
    }
  }
}
</script>
