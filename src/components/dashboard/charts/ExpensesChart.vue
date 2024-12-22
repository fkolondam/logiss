<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useTranslations } from '../../../composables/useTranslations'

// Register Chart.js components
Chart.register(...registerables)

const props = defineProps({
  expenses: {
    type: Object,
    required: true,
    default: () => ({
      byCategory: {},
      totalAmount: 0,
    }),
  },
})

const { t } = useTranslations()
const chartRef = ref(null)
const chart = ref(null)

// Computed properties for chart data
const chartData = computed(() => {
  const categories = Object.keys(props.expenses.byCategory || {})
  const amounts = categories.map((category) => {
    const categoryData = props.expenses.byCategory[category]
    return typeof categoryData === 'object' ? categoryData.amount || 0 : categoryData || 0
  })
  const colors = [
    'rgba(59, 130, 246, 0.8)', // blue
    'rgba(245, 158, 11, 0.8)', // amber
    'rgba(16, 185, 129, 0.8)', // green
    'rgba(139, 92, 246, 0.8)', // purple
    'rgba(107, 114, 128, 0.8)', // gray
  ]

  const total = amounts.reduce((sum, amount) => sum + amount, 0)
  const percentages = amounts.map((amount) => ((amount / total) * 100).toFixed(1))

  return {
    labels: categories.map(
      (category, index) => `${t(`expenses.categories.${category}`)} (${percentages[index]}%)`,
    ),
    datasets: [
      {
        data: amounts,
        backgroundColor: colors.slice(0, categories.length),
        borderWidth: 0,
        borderRadius: 4,
      },
    ],
  }
})

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const value = context.raw
          const total = context.dataset.data.reduce((sum, val) => sum + val, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          const formattedValue = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(value)
          return `${formattedValue} (${percentage}%)`
        },
      },
    },
  },
}

// Initialize and update chart
const updateChart = () => {
  if (chart.value) {
    chart.value.destroy()
  }

  if (chartRef.value) {
    chart.value = new Chart(chartRef.value, {
      type: 'doughnut',
      data: chartData.value,
      options: chartOptions,
    })
  }
}

// Watch for changes in expenses data
watch(
  () => props.expenses,
  () => {
    updateChart()
  },
  { deep: true },
)

onMounted(() => {
  updateChart()
})

onUnmounted(() => {
  if (chart.value) {
    chart.value.destroy()
  }
})
</script>

<template>
  <div class="relative h-64">
    <canvas ref="chartRef"></canvas>
  </div>
</template>
