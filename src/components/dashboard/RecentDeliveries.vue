<script>
import { Truck, TrendingUp, Clock } from 'lucide-vue-next'
import { useTranslations } from '../../composables/useTranslations'

export default {
  name: 'RecentDeliveries',
  components: {
    Truck,
    TrendingUp,
    Clock
  },
  props: {
    deliveries: Array,
    loading: Boolean
  },
  setup(props) {
    const { t } = useTranslations()

    const getDeliveryStats = () => {
      if (!props.deliveries?.length) return { 
        total: 0, 
        completed: 0, 
        partial: 0,
        pending: 0,
        cancelled: 0,
        todayCount: 0,
        successRate: 0
      }
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const stats = props.deliveries.reduce((acc, delivery) => {
        // Total counts
        acc.total++
        const status = delivery.status.toLowerCase()
        
        if (status === 'diterima - semua') {
          acc.completed++
        } 
        else if (status === 'diterima - sebagian') {
          acc.partial++
        }
        else if (status === 'kirim ulang') {
          acc.pending++
        }
        else if (status.includes('batal')) {
          acc.cancelled++
        }

        // Today's deliveries
        const deliveryDate = new Date(delivery.date)
        if (deliveryDate >= today) {
          acc.todayCount++
        }

        return acc
      }, { 
        total: 0, 
        completed: 0, 
        partial: 0,
        pending: 0,
        cancelled: 0,
        todayCount: 0
      })

      // Calculate success rate
      stats.successRate = Math.round((stats.completed / stats.total) * 100) || 0
      
      return stats
    }

    return {
      t,
      getDeliveryStats
    }
  }
}
</script>

<template>
  <div class="bg-white rounded-lg shadow">
    <div class="p-4 border-b">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Truck class="w-5 h-5 text-blue-500" />
          <h2 class="text-base font-heading font-semibold tracking-tight">{{ t('dashboard.recentDeliveries') }}</h2>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <Clock class="w-4 h-4 text-gray-500" />
          <span class="text-gray-600">Hari Ini: {{ getDeliveryStats().todayCount }}</span>
        </div>
      </div>
    </div>
    <div class="p-4">
      <div v-if="loading" class="flex justify-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
      <div v-else-if="!deliveries?.length" class="text-gray-500 text-center py-4">
        {{ t('dashboard.noDeliveries') }}
      </div>
      <div v-else class="space-y-6">
        <!-- Key Metrics -->
        <div class="grid grid-cols-3 gap-3">
          <!-- Total Pengiriman -->
          <div class="bg-blue-50 hover:bg-blue-100 transition-colors rounded-lg p-3">
            <div class="text-gray-600 text-2xs uppercase tracking-wide">{{ t('dashboard.deliveryStats.total') }}</div>
            <div class="text-3xl font-heading font-semibold text-blue-600 mt-1">
              {{ getDeliveryStats().total }}
            </div>
          </div>
          
          <!-- Tingkat Keberhasilan -->
          <div class="bg-green-50 hover:bg-green-100 transition-colors rounded-lg p-3">
            <div class="text-gray-600 text-2xs uppercase tracking-wide">{{ t('dashboard.deliveryStats.succesRate') }}</div>
            <div class="grid grid-rows-2 mt-1">
              <span class="text-2xl font-heading font-semibold text-green-600">{{ getDeliveryStats().successRate }}%</span>
              <div class="flex items-center text-green-600 text-2xs">
                <TrendingUp class="w-4 h-4" />
                <span>+5%</span>
              </div>
            </div>
          </div>
          
          <!-- Pembatalan -->
          <div class="bg-red-50 hover:bg-red-100 transition-colors rounded-lg p-3">
            <div class="text-gray-600 text-2xs uppercase tracking-wide">{{ t('dashboard.deliveryStats.cancelled') }}</div>
            <div class="text-3xl font-heading font-semibold text-red-600 mt-1 text-center">
              {{ getDeliveryStats().cancelled }}
            </div>
          </div>
        </div>

        <!-- Status Breakdown -->
        <div class="space-y-2">
          <div class="text-sm font-heading font-semibold text-gray-900">{{ t('dashboard.deliveryStats.deliveryStatus') }}</div>
          <div class="space-y-1.5">
            <!-- Completed -->
            <div class="flex items-center gap-2">
              <div class="flex-1 bg-gray-200 rounded-full h-2">
                <div class="bg-green-600 h-2 rounded-full" 
                     :style="{ width: (getDeliveryStats().completed / getDeliveryStats().total * 100) + '%' }">
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-green-600"></span>
                <span class="text-sm text-gray-600">{{ t('deliveries.status.diterima - semua') }} ({{ getDeliveryStats().completed }})</span>
                <span class="text-xs text-gray-500">{{ Math.round(getDeliveryStats().completed / getDeliveryStats().total * 100) }}%</span>
              </div>
            </div>

            <!-- Partial -->
            <div class="flex items-center gap-2">
              <div class="flex-1 bg-gray-200 rounded-full h-2">
                <div class="bg-yellow-600 h-2 rounded-full" 
                     :style="{ width: (getDeliveryStats().partial / getDeliveryStats().total * 100) + '%' }">
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-yellow-600"></span>
                <span class="text-sm text-gray-600">{{ t('deliveries.status.diterima - sebagian') }} ({{ getDeliveryStats().partial }})</span>
                <span class="text-xs text-gray-500">{{ Math.round(getDeliveryStats().partial / getDeliveryStats().total * 100) }}%</span>
              </div>
            </div>

            <!-- Pending (Kirim Ulang) -->
            <div class="flex items-center gap-2">
              <div class="flex-1 bg-gray-200 rounded-full h-2">
                <div class="bg-blue-600 h-2 rounded-full" 
                     :style="{ width: (getDeliveryStats().pending / getDeliveryStats().total * 100) + '%' }">
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span class="text-sm text-gray-600">{{ t('deliveries.status.kirim ulang') }} ({{ getDeliveryStats().pending }})</span>
                <span class="text-xs text-gray-500">{{ Math.round(getDeliveryStats().pending / getDeliveryStats().total * 100) }}%</span>
              </div>
            </div>

            <!-- Cancelled -->
            <div class="flex items-center gap-2">
              <div class="flex-1 bg-gray-200 rounded-full h-2">
                <div class="bg-red-600 h-2 rounded-full" 
                     :style="{ width: (getDeliveryStats().cancelled / getDeliveryStats().total * 100) + '%' }">
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                <span class="text-sm text-gray-600">{{ t('deliveries.status.batal') }} ({{ getDeliveryStats().cancelled }})</span>
                <span class="text-xs text-gray-500">{{ Math.round(getDeliveryStats().cancelled / getDeliveryStats().total * 100) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
