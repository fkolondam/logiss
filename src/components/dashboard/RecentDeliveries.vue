<script>
// Script section remains unchanged
import { Truck, TrendingUp, Clock, AlertCircle, ArrowRight } from 'lucide-vue-next'
import { useTranslations } from '../../composables/useTranslations'
import { useRouter } from 'vue-router'

export default {
  name: 'RecentDeliveries',
  components: {
    Truck,
    TrendingUp,
    Clock,
    AlertCircle,
    ArrowRight
  },
  props: {
    deliveries: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    }
  },
  setup(props) {
    const { t } = useTranslations()
    const router = useRouter()

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

    const navigateToDeliveries = (params = {}) => {
      router.push({
        name: 'deliveries',
        query: params
      })
    }

    return {
      t,
      getDeliveryStats,
      navigateToDeliveries
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
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex items-center gap-2 text-red-600 py-4">
        <AlertCircle class="w-5 h-5" />
        <span>{{ error }}</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="!deliveries.length" class="text-gray-500 text-center py-4">
        {{ t('dashboard.noDeliveries') }}
      </div>

      <!-- Content -->
      <div v-else class="space-y-6">
        <!-- Key Metrics -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- Total Pengiriman -->
          <div class="bg-blue-50 rounded-lg p-3">
            <div class="grid grid-rows-[36px_48px_24px_32px] h-full">
              <!-- Row 1: Label (fixed 36px height for 2 lines) -->
              <div class="flex items-start h-[36px]">
                <div class="text-[9px] text-gray-600 uppercase tracking-wider leading-[18px] line-clamp-2">{{ t('dashboard.deliveryStats.total') }}</div>
              </div>
              
              <!-- Row 2: Value -->
              <div class="flex items-center">
                <div class="text-4xl font-heading font-semibold text-blue-600 tabular-nums leading-none">
                  {{ getDeliveryStats().total }}
                </div>
              </div>
              
              <!-- Row 3: Indicator (empty for consistency) -->
              <div class="flex items-center"></div>
              
              <!-- Row 4: Link -->
              <div class="flex items-end justify-end">
                <button 
                  @click="navigateToDeliveries()"
                  class="flex items-center gap-1 text-[9px] font-medium text-blue-700 hover:text-blue-800 transition-colors"
                >
                  <span>{{ t('common.viewAll') }}</span>
                  <ArrowRight class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          
          <!-- Tingkat Keberhasilan -->
          <div class="bg-green-50 rounded-lg p-3">
            <div class="grid grid-rows-[36px_48px_24px_32px] h-full">
              <!-- Row 1: Label (fixed 36px height for 2 lines) -->
              <div class="flex items-start h-[36px]">
                <div class="text-[9px] text-gray-600 uppercase tracking-wider leading-[18px] line-clamp-2">{{ t('dashboard.deliveryStats.succesRate') }}</div>
              </div>
              
              <!-- Row 2: Value -->
              <div class="flex items-center">
                <div class="text-4xl font-heading font-semibold text-green-600 tabular-nums leading-none">
                  {{ getDeliveryStats().successRate }}%
                </div>
              </div>
              
              <!-- Row 3: Indicator -->
              <div class="flex items-center">
                <div class="flex items-center text-green-600 text-[10px]">
                  <TrendingUp class="w-3 h-3" />
                  <span>+5%</span>
                </div>
              </div>
              
              <!-- Row 4: Link -->
              <div class="flex items-end justify-end">
                <button 
                  @click="navigateToDeliveries({ status: 'completed' })"
                  class="flex items-center gap-1 text-[9px] font-medium text-green-700 hover:text-green-800 transition-colors"
                >
                  <span>{{ t('common.details') }}</span>
                  <ArrowRight class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          
          <!-- Pembatalan -->
          <div class="bg-red-50 rounded-lg p-3">
            <div class="grid grid-rows-[36px_48px_24px_32px] h-full">
              <!-- Row 1: Label (fixed 36px height for 2 lines) -->
              <div class="flex items-start h-[36px]">
                <div class="text-[9px] text-gray-600 uppercase tracking-wider leading-[18px] line-clamp-2">{{ t('dashboard.deliveryStats.cancelled') }}</div>
              </div>
              
              <!-- Row 2: Value -->
              <div class="flex items-center">
                <div class="text-4xl font-heading font-semibold text-red-600 tabular-nums leading-none">
                  {{ getDeliveryStats().cancelled }}
                </div>
              </div>
              
              <!-- Row 3: Indicator (empty for consistency) -->
              <div class="flex items-center"></div>
              
              <!-- Row 4: Link -->
              <div class="flex items-end justify-end">
                <button 
                  @click="navigateToDeliveries({ status: 'cancelled' })"
                  class="flex items-center gap-1 text-[9px] font-medium text-red-700 hover:text-red-800 transition-colors"
                >
                  <span>{{ t('common.details') }}</span>
                  <ArrowRight class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Breakdown -->
        <div class="space-y-2">
          <div class="text-sm font-heading font-semibold text-gray-900">{{ t('dashboard.deliveryStats.deliveryStatus') }}</div>
          <div class="space-y-3">
            <!-- Completed -->
            <div 
              class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
              @click="navigateToDeliveries({ status: 'completed' })"
            >
              <div class="flex-1">
                <div class="flex items-center justify-between mb-1.5">
                  <div class="flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                    <span class="text-base text-gray-600 truncate">{{ t('deliveries.status.diterima - semua') }}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="text-base font-medium tabular-nums">{{ getDeliveryStats().completed }}</span>
                    <span class="text-2xs text-gray-500 tabular-nums">{{ Math.round(getDeliveryStats().completed / getDeliveryStats().total * 100) }}%</span>
                  </div>
                </div>
                <div class="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div class="bg-green-600 h-1.5 rounded-full transition-all duration-300" 
                       :style="{ width: (getDeliveryStats().completed / getDeliveryStats().total * 100) + '%' }">
                  </div>
                </div>
              </div>
            </div>

            <!-- Partial -->
            <div 
              class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
              @click="navigateToDeliveries({ status: 'partial' })"
            >
              <div class="flex-1">
                <div class="flex items-center justify-between mb-1.5">
                  <div class="flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                    <span class="text-base text-gray-600 truncate">{{ t('deliveries.status.diterima - sebagian') }}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="text-base font-medium tabular-nums">{{ getDeliveryStats().partial }}</span>
                    <span class="text-2xs text-gray-500 tabular-nums">{{ Math.round(getDeliveryStats().partial / getDeliveryStats().total * 100) }}%</span>
                  </div>
                </div>
                <div class="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div class="bg-amber-600 h-1.5 rounded-full transition-all duration-300" 
                       :style="{ width: (getDeliveryStats().partial / getDeliveryStats().total * 100) + '%' }">
                  </div>
                </div>
              </div>
            </div>

            <!-- Pending (Kirim Ulang) -->
            <div 
              class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
              @click="navigateToDeliveries({ status: 'pending' })"
            >
              <div class="flex-1">
                <div class="flex items-center justify-between mb-1.5">
                  <div class="flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    <span class="text-base text-gray-600 truncate">{{ t('deliveries.status.kirim ulang') }}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="text-base font-medium tabular-nums">{{ getDeliveryStats().pending }}</span>
                    <span class="text-2xs text-gray-500 tabular-nums">{{ Math.round(getDeliveryStats().pending / getDeliveryStats().total * 100) }}%</span>
                  </div>
                </div>
                <div class="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div class="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                       :style="{ width: (getDeliveryStats().pending / getDeliveryStats().total * 100) + '%' }">
                  </div>
                </div>
              </div>
            </div>

            <!-- Cancelled -->
            <div 
              class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
              @click="navigateToDeliveries({ status: 'cancelled' })"
            >
              <div class="flex-1">
                <div class="flex items-center justify-between mb-1.5">
                  <div class="flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                    <span class="text-base text-gray-600 truncate">{{ t('deliveries.status.batal') }}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="text-base font-medium tabular-nums">{{ getDeliveryStats().cancelled }}</span>
                    <span class="text-2xs text-gray-500 tabular-nums">{{ Math.round(getDeliveryStats().cancelled / getDeliveryStats().total * 100) }}%</span>
                  </div>
                </div>
                <div class="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div class="bg-red-600 h-1.5 rounded-full transition-all duration-300" 
                       :style="{ width: (getDeliveryStats().cancelled / getDeliveryStats().total * 100) + '%' }">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
