<template>
  <div class="relative inline-block">
    <!-- Timeline Selector Button -->
    <button
      @click="toggleDatePicker"
      class="p-2 text-sm font-medium transition-all duration-200 rounded-lg hover:bg-gray-50 flex items-center gap-2"
      :class="[isOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-600']"
      title="Select Period"
    >
      <CalendarRange class="w-5 h-5" />
      <span class="text-xs font-medium text-gray-600 hidden sm:inline">{{
        currentPeriodLabel
      }}</span>
      <ChevronDown
        class="w-4 h-4 hidden sm:block transition-transform"
        :class="{ 'rotate-180': isOpen }"
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
        class="fixed bottom-0 left-0 right-0 md:absolute md:bottom-auto md:right-0 md:left-auto bg-white rounded-t-xl md:rounded-xl shadow-xl md:w-[320px] animate-slideUp md:animate-fadeIn max-h-[90vh] overflow-y-auto"
      >
        <!-- Mobile Header -->
        <div class="flex items-center justify-between p-4 border-b md:hidden">
          <h3 class="text-lg font-medium">{{ t('common.timeline.select_period') }}</h3>
          <button @click="closeDatePicker" class="p-2 text-gray-500 hover:text-gray-700">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-4">
          <!-- Shortcut Buttons -->
          <div class="grid grid-cols-2 gap-2 mb-4">
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
              {{ label }}
            </button>
          </div>

          <!-- Date Range Picker -->
          <Datepicker
            v-model="dateRange"
            range
            :enable-time-picker="false"
            :format="{ date: 'dd MMM yyyy' }"
            :preview-format="{ date: 'dd MMM yyyy' }"
            auto-apply
            :close-on-auto-apply="false"
            :teleport="true"
            :teleport-center="true"
            :placeholder="t('common.timeline.select_range')"
            :cancel-text="t('common.timeline.cancel')"
            :submit-text="t('common.timeline.apply')"
            class="timeline-datepicker"
            @update:model-value="handleDateRangeChange"
          >
            <template #trigger>
              <div
                class="w-full p-2 text-sm bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                :class="[
                  selectedPeriod === PERIODS.CUSTOM_RANGE
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'text-gray-700',
                ]"
              >
                <div class="flex items-center gap-2">
                  <Calendar class="w-4 h-4" />
                  <span>
                    {{ dateRangeLabel }}
                  </span>
                </div>
              </div>
            </template>
          </Datepicker>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { CalendarRange, Calendar, X, ChevronDown } from 'lucide-vue-next'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { PERIODS, PERIOD_LABELS } from '../../constants/periods'
import { useTranslations } from '../../composables/useTranslations'

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
const selectedPeriod = ref(props.modelValue)
const dateRange = ref(props.customRange)

const currentPeriodLabel = computed(() => {
  if (selectedPeriod.value === PERIODS.CUSTOM_RANGE && dateRange.value?.length === 2) {
    return dateRangeLabel.value
  }
  return PERIOD_LABELS[selectedPeriod.value] || t('common.timeline.select_period')
})

const dateRangeLabel = computed(() => {
  if (dateRange.value?.length === 2) {
    const [start, end] = dateRange.value
    const formatDate = (date) => {
      return new Intl.DateTimeFormat('id', {
        day: 'numeric',
        month: 'short',
      }).format(date)
    }
    return `${formatDate(start)} - ${formatDate(end)}`
  }
  return t('common.timeline.select_range')
})

const toggleDatePicker = () => {
  isOpen.value = !isOpen.value
}

const closeDatePicker = () => {
  isOpen.value = false
}

const selectPeriod = (period) => {
  selectedPeriod.value = period
  emit('update:modelValue', period)
  if (period !== PERIODS.CUSTOM_RANGE) {
    closeDatePicker()
  }
}

const handleDateRangeChange = (range) => {
  if (range?.length === 2) {
    dateRange.value = range
    selectedPeriod.value = PERIODS.CUSTOM_RANGE
    emit('update:modelValue', PERIODS.CUSTOM_RANGE)
    emit('update:customRange', range)
    closeDatePicker()
  }
}
</script>

<style>
.timeline-datepicker {
  font-family: inherit;
}

.timeline-datepicker .dp__main {
  border: none;
  box-shadow: none !important;
}

.timeline-datepicker .dp__input {
  display: none;
}

.animate-slideUp {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
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
  animation: fadeIn 0.3s ease-out;
}

/* Mobile Optimizations */
@media (max-width: 768px) {
  .timeline-datepicker .dp__outer_menu {
    position: relative !important;
    transform: none !important;
    width: 100% !important;
    margin-top: 1rem;
  }

  .timeline-datepicker .dp__overlay {
    position: relative !important;
  }

  .timeline-datepicker .dp__overlay_container {
    transform: none !important;
  }

  .timeline-datepicker .dp__calendar_wrap {
    min-width: 100% !important;
  }

  .timeline-datepicker .dp__calendar {
    width: 100% !important;
  }
}
</style>
