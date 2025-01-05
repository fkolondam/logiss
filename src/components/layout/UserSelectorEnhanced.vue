<template>
  <div class="relative user-selector">
    <!-- User Button with Role Indicator -->
    <button @click="isOpen = !isOpen" class="flex items-center gap-3 h-full relative group">
      <!-- Avatar with Role Border -->
      <div
        class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center relative"
        :class="[currentUser ? getRoleBorderClass(currentUser.role) : 'border-2 border-gray-300']"
      >
        <UserCircle
          class="w-4 h-4"
          :class="currentUser ? getRoleIconClass(currentUser.role) : 'text-gray-500'"
        />
        <!-- Role Level Indicator -->
        <div
          v-if="currentUser"
          class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-medium border-1 border-white"
          :class="getRoleLevelClass(currentUser.role)"
        >
          {{ getRoleLevelIcon(currentUser.role) }}
        </div>
      </div>

      <div class="hidden md:flex flex-col items-start">
        <span class="text-sm font-medium text-gray-900">{{ currentUserLabel }}</span>
        <span class="text-xs text-gray-500 flex items-center gap-1">
          <component :is="getCurrentScopeIcon" class="w-3 h-3" />
          {{ getScopeLabel(currentUser?.scope) }}
        </span>
      </div>

      <ChevronDown
        class="w-4 h-4 text-gray-500 hidden md:block transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- Backdrop Overlay for Mobile -->
    <div
      v-if="isMobile && isOpen"
      class="fixed inset-0 bg-black/50 z-[15] top-[72px] bottom-[72px] transition-opacity duration-300 ease-out-cubic"
      :class="{ 'opacity-0 pointer-events-none': !isOpen }"
      @click="isOpen = false"
    ></div>

    <!-- Enhanced Dropdown Menu -->
    <div
      v-if="isOpen"
      class="bg-white z-[16] flex flex-col transform will-change-transform transition-transform duration-300 ease-out-cubic"
      :class="[
        isMobile
          ? 'fixed inset-x-0 top-[72px] bottom-[72px] shadow-none'
          : 'absolute right-0 top-[calc(100%+0px)] w-[420px] rounded-lg shadow-lg border border-white-200',
        !isOpen ? 'translate-x-full' : 'translate-x-0',
      ]"
    >
      <!-- Mobile Header -->
      <div
        v-if="isMobile"
        class="flex items-center justify-between h-14 px-3 border-b border-white-200/80"
      >
        <div class="flex items-center gap-3">
          <button
            @click="isOpen = false"
            class="p-2 -ml-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 active:bg-gray-200/80 transition-all duration-200"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <h2 class="text-lg font-display font-bold tracking-tight text-gray-900">Pilih User</h2>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-white-200/80 bg-white/80 backdrop-blur-sm">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="flex-1 flex items-center justify-center gap-1.5 relative text-sm font-medium transition-all duration-200"
          :class="[
            isMobile ? 'px-2 py-2' : 'px-3 py-2.5',
            activeTab === tab.key
              ? 'text-primary-600 font-medium bg-primary-50/50'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/80',
          ]"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          {{ t(tab.translationKey) }}
          <div
            v-if="activeTab === tab.key"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
          ></div>
        </button>
      </div>

      <!-- Quick Filters (Desktop Only) -->
      <div v-if="activeTab === 'selector'" class="hidden md:block border-b p-4 space-y-3">
        <!-- Region Quick Filters -->
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="region in availableRegions"
            :key="region"
            @click="toggleRegionFilter(region)"
            class="px-2 py-1 text-xs font-medium rounded-md transition-colors"
            :class="[
              activeRegionFilters.includes(region)
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ]"
          >
            <Map class="w-3 h-3 inline-block mr-1" />
            {{ region }}
          </button>
        </div>

        <!-- Scope Type Filters -->
        <div class="flex gap-1.5">
          <button
            v-for="filter in scopeFilters"
            :key="filter.id"
            @click="toggleScopeFilter(filter.id)"
            :class="[
              'flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md transition-colors',
              activeScopeFilters.includes(filter.id)
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ]"
          >
            <component :is="filter.icon" class="w-3 h-3" />
            {{ filter.label }}
          </button>
        </div>
      </div>

      <!-- Current User Info -->
      <div
        v-if="currentUser && activeTab === 'info'"
        class="p-3 bg-blue-50/50 border-b"
        :class="{ 'md:p-4': !isMobile }"
      >
        <div class="flex items-start gap-4">
          <!-- Avatar with Role Indicator -->
          <div class="relative">
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center"
              :class="getRoleBackgroundClass(currentUser.role)"
            >
              <UserCircle class="w-6 h-6" :class="getRoleIconClass(currentUser.role)" />
            </div>
            <div
              class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white"
              :class="getRoleLevelClass(currentUser.role)"
            >
              {{ getRoleLevelIcon(currentUser.role) }}
            </div>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <div class="font-medium text-gray-900">{{ currentUser.name }}</div>
              <span
                :class="[
                  'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full',
                  getRoleBadgeClasses(currentUser.role),
                ]"
              >
                {{ t(`roles.${currentUser.role}`) }}
              </span>
            </div>
            <div class="text-sm text-gray-600 flex items-center gap-1.5 mt-0.5">
              <component :is="getCurrentScopeIcon" class="w-3.5 h-3.5" />
              {{ getScopeLabel(currentUser.scope) }}
            </div>

            <!-- Permission Summary -->
            <div class="mt-3 grid grid-cols-2 gap-3">
              <!-- Access Level -->
              <div class="bg-white rounded-md p-2 border">
                <div class="text-xs font-medium text-gray-500 mb-1.5">
                  {{ t('userSelector.accessLevel') }}
                </div>
                <div class="flex items-center gap-1.5">
                  <Layers class="w-4 h-4" :class="getRoleIconClass(currentUser.role)" />
                  <span class="text-sm font-medium" :class="getRoleTextClass(currentUser.role)">
                    {{ t(`scope.level.${roles[currentUser.role].level}`) }}
                  </span>
                </div>
              </div>

              <!-- Permission Count -->
              <div class="bg-white rounded-md p-2 border">
                <div class="text-xs font-medium text-gray-500 mb-1.5">
                  {{ t('userSelector.permissions') }}
                </div>
                <div class="flex items-center gap-1.5">
                  <Shield class="w-4 h-4" :class="getRoleIconClass(currentUser.role)" />
                  <span class="text-sm font-medium" :class="getRoleTextClass(currentUser.role)">
                    {{ getCurrentUserPermissions.length }} {{ t('userSelector.permissionsCount') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Permissions List -->
        <div class="mt-3">
          <div class="flex flex-wrap gap-1">
            <span
              v-for="permission in getCurrentUserPermissions"
              :key="permission"
              class="inline-flex items-center px-2 py-0.5 text-xs bg-white text-gray-600 rounded-md border"
            >
              {{ t(`permissions.${permission}`) }}
            </span>
          </div>
        </div>
      </div>

      <!-- User List -->
      <div
        v-if="activeTab === 'selector'"
        class="flex-1 overflow-y-auto"
        :class="[isMobile ? 'scrollbar-elegant' : 'max-h-[calc(100vh-500px)]']"
      >
        <!-- Role Groups -->
        <div v-for="(users, role) in filteredUsersByRole" :key="role" class="py-2">
          <div
            class="px-4 py-2 text-xs font-medium text-gray-500 uppercase flex items-center justify-between bg-gray-50"
          >
            <div class="flex items-center gap-2">
              <span>{{ t(`roles.${role}`) }}</span>
              <span
                class="px-1.5 py-0.5 rounded-full text-[10px] bg-white border"
                :class="getRoleTextClass(role)"
              >
                {{ users.length }}
              </span>
            </div>
            <span class="text-xs normal-case text-gray-400">
              {{ t(`scope.level.${roles[role].level}`) }}
            </span>
          </div>

          <!-- User Cards -->
          <div class="space-y-0.5">
            <button
              v-for="user in users"
              :key="user.id"
              @click="selectUser(user)"
              class="w-full hover:bg-gray-50 transition-colors group"
              :class="[
                isMobile ? 'px-3 py-1.5' : 'px-4 py-2',
                currentUser?.id === user.id ? 'bg-blue-50/50' : '',
              ]"
            >
              <div class="flex items-center gap-3">
                <!-- User Avatar with Role -->
                <div class="relative">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center"
                    :class="getRoleBackgroundClass(user.role)"
                  >
                    <UserCircle class="w-4 h-4" :class="getRoleIconClass(user.role)" />
                  </div>
                  <div
                    class="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-medium border-2 border-white"
                    :class="getRoleLevelClass(user.role)"
                  >
                    {{ getRoleLevelIcon(user.role) }}
                  </div>
                </div>

                <!-- User Info -->
                <div class="flex-1 min-w-0 text-left">
                  <div class="flex items-center gap-2">
                    <span
                      class="font-medium"
                      :class="currentUser?.id === user.id ? 'text-blue-700' : 'text-gray-900'"
                    >
                      {{ user.name }}
                    </span>
                  </div>
                  <div class="text-sm text-gray-500 flex items-center gap-1.5">
                    <component :is="getScopeIcon(user.scope.type)" class="w-3.5 h-3.5" />
                    {{ getScopeLabel(user.scope) }}
                  </div>
                </div>

                <!-- Selection Indicator -->
                <div
                  v-if="currentUser?.id === user.id"
                  class="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center"
                >
                  <Check class="w-3 h-3 text-blue-600" />
                </div>
              </div>

              <!-- Hover Details -->
              <div
                class="mt-2 grid grid-cols-2 gap-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                :class="{ 'opacity-100': currentUser?.id === user.id }"
              >
                <!-- Permission Summary -->
                <div class="flex items-center gap-1.5 text-gray-500">
                  <Shield class="w-3.5 h-3.5" />
                  <span
                    >{{ getUserPermissions(user).length }}
                    {{ t('userSelector.permissionsCount') }}</span
                  >
                </div>
                <!-- Branch Count (for Regional Managers) -->
                <div
                  v-if="user.role === 'regional_manager'"
                  class="flex items-center gap-1.5 text-gray-500"
                >
                  <Building2 class="w-3.5 h-3.5" />
                  <span
                    >{{ getBranchCount(user.scope.value) }}
                    {{ t('scope.branches').toLowerCase() }}</span
                  >
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Info Tab Content -->
      <div v-if="activeTab === 'info'" class="flex-1 overflow-y-auto scrollbar-elegant">
        <div class="flex flex-col items-center justify-center h-full text-gray-500 p-3 md:p-4">
          <Info class="w-8 h-8 mb-2" />
          <p class="text-sm">{{ t('userSelector.infoTabPlaceholder') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  UserCircle,
  ChevronDown,
  Search,
  Check,
  Shield,
  Layers,
  Map,
  Globe,
  Building2,
  Users,
  ArrowLeft,
  X,
  Settings,
  Info,
} from 'lucide-vue-next'
import { useUserStore } from '../../stores/user'
import { predefinedUsers, roles } from '../../config/users'
import { dataProviderFactory } from '../../services/DataProviderFactory'
import { useTranslations } from '../../composables/useTranslations'

const userStore = useUserStore()
const { t } = useTranslations()

// UI State
const isOpen = ref(false)
const searchQuery = ref('')
const activeRegionFilters = ref([])
const activeScopeFilters = ref([])
const isMobile = ref(false)
const activeTab = ref('selector')

// Tabs configuration
const tabs = [
  {
    key: 'selector',
    translationKey: 'Pilih User',
    icon: Users,
  },
  {
    key: 'info',
    translationKey: 'Info User',
    icon: Info,
  },
]

// Check if mobile on mount and window resize
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

// Data provider setup
const dataProvider = dataProviderFactory.getCurrentProvider()
const branches = ref([])
const regions = ref([])

// Fetch branch data on mount
onMounted(async () => {
  try {
    const response = await dataProvider.fetch('branches')
    const branchData = response.data
    branches.value = branchData
    regions.value = [...new Set(branchData.map((b) => b.region))]
  } catch (error) {
    console.error('Error fetching branch data:', error)
  }
})

// Available regions from branch data
const availableRegions = computed(() => regions.value)

// Scope filters configuration
const scopeFilters = [
  { id: 'global', label: t('scope.global'), icon: Globe },
  { id: 'region', label: t('scope.region'), icon: Map },
  { id: 'branch', label: t('scope.branch'), icon: Building2 },
]

// Current user from store
const currentUser = computed(() => userStore.currentUser)

// Computed label for current user
const currentUserLabel = computed(() => currentUser.value?.name || t('userSelector.selectUser'))

// Get current user's permissions
const getCurrentUserPermissions = computed(() => {
  if (!currentUser.value) return []
  return roles[currentUser.value.role].permissions
})

// Get current scope icon
const getCurrentScopeIcon = computed(() => {
  if (!currentUser.value?.scope) return Globe
  return getScopeIcon(currentUser.value.scope.type)
})

// Filter and group users
const filteredUsersByRole = computed(() => {
  let filtered = [...predefinedUsers]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query) ||
        (user.scope.value || '').toLowerCase().includes(query),
    )
  }

  // Apply region filters
  if (activeRegionFilters.value.length > 0) {
    filtered = filtered.filter((user) => {
      if (user.scope.type === 'region') {
        return activeRegionFilters.value.includes(user.scope.value)
      }
      if (user.scope.type === 'branch') {
        const branch = branches.value.find((b) => b.branchName === user.scope.value)
        return activeRegionFilters.value.includes(branch?.region)
      }
      return true
    })
  }

  // Apply scope type filters
  if (activeScopeFilters.value.length > 0) {
    filtered = filtered.filter((user) => activeScopeFilters.value.includes(user.scope.type))
  }

  // Group by role
  return filtered.reduce((acc, user) => {
    if (!acc[user.role]) {
      acc[user.role] = []
    }
    acc[user.role].push(user)
    return acc
  }, {})
})

// Helper functions
const getUserPermissions = (user) => {
  return roles[user.role].permissions
}

const getBranchCount = (region) => {
  return branches.value.filter((b) => b.region === region).length
}

const getScopeIcon = (type) => {
  switch (type) {
    case 'global':
      return Globe
    case 'region':
      return Map
    case 'branch':
      return Building2
    case 'personal':
      return Users
    default:
      return Globe
  }
}

// Role-based styling
const getRoleBadgeClasses = (role) => {
  const classes = {
    admin: 'bg-purple-100 text-purple-700',
    regional_manager: 'bg-blue-100 text-blue-700',
    branch_manager: 'bg-green-100 text-green-700',
    staff: 'bg-orange-100 text-orange-700',
    operational: 'bg-gray-100 text-gray-700',
  }
  return classes[role] || 'bg-gray-100 text-gray-700'
}

const getRoleBorderClass = (role) => {
  const classes = {
    admin: 'border-2 border-purple-500',
    regional_manager: 'border-2 border-blue-500',
    branch_manager: 'border-2 border-green-500',
    staff: 'border-2 border-orange-500',
    operational: 'border-2 border-gray-500',
  }
  return classes[role] || 'border-2 border-gray-300'
}

const getRoleBackgroundClass = (role) => {
  const classes = {
    admin: 'bg-purple-100',
    regional_manager: 'bg-blue-100',
    branch_manager: 'bg-green-100',
    staff: 'bg-orange-100',
    operational: 'bg-gray-100',
  }
  return classes[role] || 'bg-gray-100'
}

const getRoleIconClass = (role) => {
  const classes = {
    admin: 'text-purple-600',
    regional_manager: 'text-blue-600',
    branch_manager: 'text-green-600',
    staff: 'text-orange-600',
    operational: 'text-gray-600',
  }
  return classes[role] || 'text-gray-600'
}

const getRoleTextClass = (role) => {
  const classes = {
    admin: 'text-purple-700',
    regional_manager: 'text-blue-700',
    branch_manager: 'text-green-700',
    staff: 'text-orange-700',
    operational: 'text-gray-700',
  }
  return classes[role] || 'text-gray-700'
}

const getRoleLevelClass = (role) => {
  const classes = {
    admin: 'bg-purple-600 text-white',
    regional_manager: 'bg-blue-600 text-white',
    branch_manager: 'bg-green-600 text-white',
    staff: 'bg-orange-600 text-white',
    operational: 'bg-gray-600 text-white',
  }
  return classes[role] || 'bg-gray-600 text-white'
}

const getRoleLevelIcon = (role) => {
  const level = roles[role]?.level
  switch (level) {
    case 'global':
      return 'G'
    case 'region':
      return 'R'
    case 'branch':
      return 'B'
    case 'personal':
      return 'P'
    default:
      return '-'
  }
}

// Get readable scope label
const getScopeLabel = (scope) => {
  if (!scope) return ''

  switch (scope.type) {
    case 'global':
      return t('scope.global')
    case 'region':
      return `${t('scope.region')}: ${scope.value}`
    case 'branch':
      return `${t('scope.branch')}: ${scope.value}`
    case 'personal':
      return `${t('scope.personal')}: ${scope.value}`
    default:
      return ''
  }
}

// Toggle filters
const toggleRegionFilter = (region) => {
  const index = activeRegionFilters.value.indexOf(region)
  if (index === -1) {
    activeRegionFilters.value.push(region)
  } else {
    activeRegionFilters.value.splice(index, 1)
  }
}

const toggleScopeFilter = (scopeType) => {
  const index = activeScopeFilters.value.indexOf(scopeType)
  if (index === -1) {
    activeScopeFilters.value.push(scopeType)
  } else {
    activeScopeFilters.value.splice(index, 1)
  }
}

// Handle user selection
const selectUser = async (user) => {
  await userStore.switchUser(user.id)
  isOpen.value = false
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.user-selector')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', checkMobile)
})
</script>
