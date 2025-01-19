<template>
  <div class="flex flex-col sm:flex-row sm:items-center sm:gap-4">
    <!-- Date Range Label -->
    <div class="mb-3 sm:mb-0 max-w-full sm:max-w-[70%]">
      <div class="flex items-center gap-1.5 mb-0.5">
        <div class="h-1 w-1 bg-indigo-400 rounded-full"></div>
        <div class="text-[10px] uppercase tracking-wider text-indigo-500/80 font-medium">
          {{ t('common.timeline.select_period') }}
        </div>
      </div>
      <div
        class="text-[13px] sm:text-sm text-gray-500 font-normal leading-relaxed line-clamp-2 sm:line-clamp-1"
      >
        {{ dateRangeInfo }}
      </div>
    </div>

    <!-- Timeline Selector -->
    <div class="relative inline-block shrink-0">
      <button
        ref="buttonRef"
        @click="toggleDatePicker"
        class="p-3 sm:p-2.5 text-sm font-medium transition-all duration-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 border border-gray-200 w-full sm:w-auto bg-white"
        :class="[isOpen ? 'bg-blue-50 !border-blue-200 text-blue-600 shadow-sm' : 'text-gray-600']"
        :title="t('common.timeline.select_period')"
      >
        <CalendarRange
          class="w-5 h-5 sm:w-4 sm:h-4"
          :class="[isOpen ? 'text-blue-500' : 'text-gray-500']"
        />
        <span class="text-sm font-medium" :class="[isOpen ? 'text-blue-600' : 'text-gray-700']">
          {{ currentPeriodLabel }}
        </span>
        <ChevronDown
          class="w-5 h-5 sm:w-4 sm:h-4 transition-transform ml-auto sm:ml-0"
          :class="[{ 'rotate-180': isOpen }, isOpen ? 'text-blue-500' : 'text-gray-400']"
        />
      </button>

      <!-- Dropdown Panel -->
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 md:absolute md:inset-auto md:right-0 md:top-full md:mt-2"
        @click.self="closeDatePicker"
      >
        <!-- Mobile Overlay -->
        <div
          class="fixed inset-0 bg-black/25 backdrop-blur-sm md:hidden"
          @click="closeDatePicker"
        ></div>

        <!-- Panel Content -->
        <div
          ref="popupRef"
          class="fixed inset-x-0 top-[64px] bottom-0 md:relative md:inset-auto bg-white rounded-t-xl md:rounded-lg shadow-xl w-full md:w-[320px] animate-slideUp md:animate-fadeIn flex flex-col md:flex-none"
        >
          <!-- Mobile Header -->
          <div class="flex items-center justify-between p-3 border-b md:hidden">
            <h3 class="text-base font-medium">{{ t('common.timeline.select_period') }}</h3>
            <button @click="closeDatePicker" class="p-2 text-gray-500 hover:text-gray-700">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="p-3 flex-1 md:flex-none">
            <!-- Shortcut Buttons -->
            <div class="grid grid-cols-2 gap-2 mb-3">
              <button
                v-for="(label, period) in PERIOD_LABELS"
                :key="period"
                @click="selectPeriod(period)"
                class="p-2 text-sm rounded-lg transition-colors text-left"
                :class="[
                  selectedPeriod === period
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100',
                ]"
              >
                {{ t(`common.periods.${period}`) }}
              </button>
            </div>

            <!-- Custom Date Range -->
            <div class="relative" v-if="selectedPeriod === PERIODS.CUSTOM_RANGE">
              <div class="space-y-3">
                <!-- Mobile Date Inputs -->
                <div class="md:hidden">
                  <!-- Start Date -->
                  <div class="mb-4">
                    <div class="flex items-center justify-between mb-2">
                      <label class="text-xs font-medium text-gray-500">{{
                        t('common.timeline.from')
                      }}</label>
                      <span class="text-xs text-gray-400">{{ formatMobileDate(startDate) }}</span>
                    </div>
                    <div class="grid grid-cols-3 gap-2">
                      <select
                        v-model="mobileStartMonth"
                        class="p-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                        @change="updateMobileStartDate"
                      >
                        <option v-for="(month, index) in months" :key="index" :value="index">
                          {{ month }}
                        </option>
                      </select>
                      <select
                        v-model="mobileStartYear"
                        class="p-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                        @change="updateMobileStartDate"
                      >
                        <option v-for="year in years" :key="year" :value="year">
                          {{ year }}
                        </option>
                      </select>
                      <select
                        v-model="mobileStartDay"
                        class="p-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                        @change="updateMobileStartDate"
                      >
                        <option v-for="day in daysInMonth" :key="day" :value="day">
                          {{ day }}
                        </option>
                      </select>
                    </div>
                  </div>

                  <!-- End Date -->
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="text-xs font-medium text-gray-500">{{
                        t('common.timeline.to')
                      }}</label>
                      <span class="text-xs text-gray-400">{{ formatMobileDate(endDate) }}</span>
                    </div>
                    <div class="grid grid-cols-3 gap-2">
                      <select
                        v-model="mobileEndMonth"
                        class="p-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                        @change="updateMobileEndDate"
                      >
                        <option v-for="(month, index) in months" :key="index" :value="index">
                          {{ month }}
                        </option>
                      </select>
                      <select
                        v-model="mobileEndYear"
                        class="p-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                        @change="updateMobileEndDate"
                      >
                        <option v-for="year in years" :key="year" :value="year">
                          {{ year }}
                        </option>
                      </select>
                      <select
                        v-model="mobileEndDay"
                        class="p-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                        @change="updateMobileEndDate"
                      >
                        <option v-for="day in daysInMonth" :key="day" :value="day">
                          {{ day }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Desktop Date Inputs -->
                <div class="hidden md:block space-y-3">
                  <div class="space-y-1.5">
                    <label class="block text-sm font-medium text-gray-700">{{
                      t('common.timeline.from')
                    }}</label>
                    <div class="relative">
                      <input
                        type="date"
                        v-model="startDate"
                        :max="endDate || today"
                        class="w-full p-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white pr-10"
                      />
                      <Calendar
                        class="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>

                  <div class="space-y-1.5">
                    <label class="block text-sm font-medium text-gray-700">{{
                      t('common.timeline.to')
                    }}</label>
                    <div class="relative">
                      <input
                        type="date"
                        v-model="endDate"
                        :min="startDate"
                        :max="today"
                        class="w-full p-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white pr-10"
                      />
                      <Calendar
                        class="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-end gap-2 mt-4">
                  <button
                    @click="cancelCustomRange"
                    class="px-3 py-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {{ t('common.timeline.cancel') }}
                  </button>
                  <button
                    @click="applyCustomRange"
                    class="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="!isValidRange"
                  >
                    {{ t('common.timeline.apply') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { CalendarRange, Calendar, X, ChevronDown } from 'lucide-vue-next'
import {
  PERIODS,
  PERIOD_LABELS,
  getDateRangeForPeriod,
  formatDateRange,
} from '../../constants/periods'
import { useTranslations } from '../../composables/useTranslations'
import { toDisplayFormat, getJakartaDate, getJakartaToday } from '../../config/dateFormat'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  customRange: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'update:customRange'])
const { t } = useTranslations()

const isOpen = ref(false)
const selectedPeriod = ref(props.modelValue || PERIODS.TODAY)

// Get today's date in Jakarta timezone - make it reactive
const jakartaToday = ref(getJakartaToday())
const today = computed(() => jakartaToday.value.toISOString().split('T')[0])

// Refresh Jakarta date every minute to ensure it's current
setInterval(() => {
  jakartaToday.value = getJakartaToday()
}, 60000)

// Initialize dates if custom range exists
const startDate = ref(props.customRange[0]?.toISOString().split('T')[0] || '')
const endDate = ref(props.customRange[1]?.toISOString().split('T')[0] || '')

const formatDate = (date) => {
  // Ensure we have a Date object
  const dateObj = date instanceof Date ? date : new Date(date)
  // Pass the Date object directly to toDisplayFormat
  return toDisplayFormat(dateObj)
}

// Watch for prop changes
watch(
  () => props.modelValue,
  (newValue) => {
    console.log('Period prop changed:', {
      from: selectedPeriod.value,
      to: newValue,
    })
    selectedPeriod.value = newValue || PERIODS.TODAY
    if (newValue !== PERIODS.CUSTOM_RANGE) {
      startDate.value = ''
      endDate.value = ''
    }
  },
  { immediate: true },
)

watch(
  () => props.customRange,
  (newValue) => {
    if (newValue?.length === 2) {
      startDate.value = newValue[0].toISOString().split('T')[0]
      endDate.value = newValue[1].toISOString().split('T')[0]
    }
  },
)

const isValidRange = computed(() => {
  return startDate.value && endDate.value && startDate.value <= endDate.value
})

const toggleDatePicker = () => {
  isOpen.value = !isOpen.value
}

const closeDatePicker = () => {
  isOpen.value = false
  if (selectedPeriod.value === PERIODS.CUSTOM_RANGE && !isValidRange.value) {
    selectedPeriod.value = props.modelValue
    startDate.value = props.customRange[0]?.toISOString().split('T')[0] || ''
    endDate.value = props.customRange[1]?.toISOString().split('T')[0] || ''
  }
}

const dateRangeInfo = computed(() => {
  if (selectedPeriod.value === PERIODS.CUSTOM_RANGE && props.customRange?.length === 2) {
    const [start, end] = props.customRange
    return `${t('common.timeline.from')} ${formatDate(start)} ${t('common.timeline.to')} ${formatDate(end)}`
  }

  // Use getDateRangeForPeriod to get consistent date ranges
  const { start, end } = getDateRangeForPeriod(selectedPeriod.value)
  const formattedRange = formatDateRange({ start, end })

  console.log('Date range info:', {
    period: selectedPeriod.value,
    range: formattedRange,
  })

  // For TODAY, just show the date without "Dari ... Sampai ..."
  if (selectedPeriod.value === PERIODS.TODAY) {
    return formatDate(start)
  }

  return `${t('common.timeline.from')} ${formatDate(start)} ${t('common.timeline.to')} ${formatDate(end)}`
})

const currentPeriodLabel = computed(() => {
  return t(`common.periods.${selectedPeriod.value}`) || t('common.timeline.select_period')
})

const selectPeriod = (period) => {
  console.log('Selecting period:', {
    from: selectedPeriod.value,
    to: period,
  })
  selectedPeriod.value = period
  if (period !== PERIODS.CUSTOM_RANGE) {
    emit('update:modelValue', period)
    closeDatePicker()
  }
}

const applyCustomRange = () => {
  if (isValidRange.value) {
    const range = [new Date(startDate.value), new Date(endDate.value)]
    console.log('Applying custom range:', {
      range: formatDateRange({
        start: range[0],
        end: range[1],
      }),
    })
    emit('update:modelValue', PERIODS.CUSTOM_RANGE)
    emit('update:customRange', range)
    closeDatePicker()
  }
}

// Mobile date picker data
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Mobile date picker data computed from reactive jakartaToday
const jakartaYear = computed(() => jakartaToday.value.getFullYear())
const years = computed(() => Array.from({ length: 10 }, (_, i) => jakartaYear.value - i))

const mobileStartMonth = ref(jakartaToday.value.getMonth())
const mobileStartYear = ref(jakartaYear.value)
const mobileStartDay = ref(jakartaToday.value.getDate())

const mobileEndMonth = ref(jakartaToday.value.getMonth())
const mobileEndYear = ref(jakartaYear.value)
const mobileEndDay = ref(jakartaToday.value.getDate())

const daysInMonth = computed(() => {
  const year =
    mobileStartMonth.value === mobileEndMonth.value ? mobileStartYear.value : mobileEndYear.value
  const month =
    mobileStartMonth.value === mobileEndMonth.value ? mobileStartMonth.value : mobileEndMonth.value
  return new Date(year, month + 1, 0).getDate()
})

const formatMobileDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const updateMobileStartDate = () => {
  // Create date in UTC at noon to avoid any timezone issues
  const utcDate = new Date(
    Date.UTC(mobileStartYear.value, mobileStartMonth.value, mobileStartDay.value, 12, 0, 0, 0),
  )
  startDate.value = utcDate.toISOString().split('T')[0]
}

const updateMobileEndDate = () => {
  // Create date in UTC at noon to avoid any timezone issues
  const utcDate = new Date(
    Date.UTC(mobileEndYear.value, mobileEndMonth.value, mobileEndDay.value, 12, 0, 0, 0),
  )
  endDate.value = utcDate.toISOString().split('T')[0]
}

// Initialize mobile date values when custom range changes
watch(
  () => props.customRange,
  (newValue) => {
    if (newValue?.length === 2) {
      const startDate = new Date(newValue[0])
      mobileStartMonth.value = startDate.getMonth()
      mobileStartYear.value = startDate.getFullYear()
      mobileStartDay.value = startDate.getDate()

      const endDate = new Date(newValue[1])
      mobileEndMonth.value = endDate.getMonth()
      mobileEndYear.value = endDate.getFullYear()
      mobileEndDay.value = endDate.getDate()
    }
  },
  { immediate: true },
)

const cancelCustomRange = () => {
  if (props.modelValue !== PERIODS.CUSTOM_RANGE) {
    selectedPeriod.value = props.modelValue
  } else {
    startDate.value = props.customRange[0]?.toISOString().split('T')[0] || ''
    endDate.value = props.customRange[1]?.toISOString().split('T')[0] || ''
  }
  closeDatePicker()
}

// Initialize with Jakarta timezone on mount
onMounted(() => {
  const jakartaDate = getJakartaDate()
  console.log('Mounted with Jakarta time:', jakartaDate.toISOString())
})
</script>

<style>
.animate-slideUp {
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Style the date inputs */
input[type='date'] {
  appearance: none;
  -webkit-appearance: none;
  background-color: white;
  cursor: pointer;
}

input[type='date']::-webkit-calendar-picker-indicator {
  opacity: 0;
  cursor: pointer;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: auto;
  height: auto;
}

/* Mobile Optimizations */
@media (max-width: 768px) {
  input[type='date'] {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}

/* Line clamp for different screens */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
