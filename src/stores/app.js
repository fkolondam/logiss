import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    user: {
      name: 'John Doe',
      role: 'Admin'
    },
    isAuthenticated: true,
    sidebarOpen: false,
    rightSidebarOpen: false,
    activeDeliveryId: null,
    currentView: null,
    previousView: null,
    sidebarHistory: {},
    viewTransitions: {},
    lastInteractionTime: null
  }),
  
  getters: {
    shouldRestoreSidebar: (state) => (viewName) => {
      const history = state.sidebarHistory[viewName]
      return history && history.open && history.deliveryId
    },
    
    currentViewState: (state) => {
      return state.currentView ? state.sidebarHistory[state.currentView] : null
    },
    
    hasViewState: (state) => (viewName) => {
      return state.sidebarHistory[viewName] !== undefined
    }
  },
  
  actions: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
      this.updateLastInteraction()
    },
    
    setUser(userData) {
      this.user = userData
      this.isAuthenticated = true
    },
    
    openRightSidebar(deliveryId) {
      this.rightSidebarOpen = true
      this.activeDeliveryId = deliveryId
      this.updateLastInteraction()
      
      if (this.currentView === 'deliveries') {
        this.sidebarHistory['deliveries'] = {
          open: true,
          deliveryId,
          timestamp: Date.now()
        }
      }
    },
    
    closeRightSidebar() {
      this.rightSidebarOpen = false
      this.activeDeliveryId = null
      this.updateLastInteraction()
      
      if (this.currentView === 'deliveries') {
        delete this.sidebarHistory['deliveries']
      }
    },
    
    setCurrentView(viewName) {
      if (this.currentView === viewName) return
      
      this.previousView = this.currentView
      this.currentView = viewName
      
      // When leaving deliveries view, keep the sidebar state in history
      if (this.previousView === 'deliveries' && viewName !== 'deliveries') {
        if (this.rightSidebarOpen && this.activeDeliveryId) {
          this.saveSidebarState()
          // Ensure layout is reset when leaving deliveries
          this.rightSidebarOpen = false
          this.activeDeliveryId = null
        }
      }
      
      // Only restore sidebar state when explicitly returning to deliveries
      if (viewName === 'deliveries' && this.previousView !== 'deliveries' && this.sidebarHistory['deliveries']) {
        const state = this.sidebarHistory['deliveries']
        const stateAge = Date.now() - state.timestamp
        
        if (stateAge < 30 * 60 * 1000) { // 30 minutes
          // Delay sidebar restoration to ensure smooth transition
          setTimeout(() => {
            this.rightSidebarOpen = true
            this.activeDeliveryId = state.deliveryId
          }, 100)
        } else {
          delete this.sidebarHistory['deliveries']
        }
      }
      
      if (this.previousView) {
        this.viewTransitions[this.previousView] = {
          to: viewName,
          timestamp: Date.now()
        }
      }
    },
    
    handleDeliveriesReturn() {
      const deliveriesState = this.sidebarHistory['deliveries']
      if (deliveriesState && deliveriesState.open) {
        const stateAge = Date.now() - deliveriesState.timestamp
        if (stateAge < 30 * 60 * 1000) { // 30 minutes
          // Delay the sidebar opening slightly to ensure smooth transition
          setTimeout(() => {
            this.rightSidebarOpen = true
            this.activeDeliveryId = deliveriesState.deliveryId
          }, 100)
        } else {
          delete this.sidebarHistory['deliveries']
        }
      }
    },
    
    resetUIState() {
      this.rightSidebarOpen = false
      this.activeDeliveryId = null
      this.sidebarHistory = {}
      this.viewTransitions = {}
      this.lastInteractionTime = null
    },
    
    handleRouteChange(to, from) {
      const toDeliveries = to.name === 'deliveries'
      const fromDeliveries = from.name === 'deliveries'
      
      this.setCurrentView(to.name)
      
      // Reset sidebar and save state when leaving deliveries
      if (fromDeliveries && !toDeliveries) {
        if (this.rightSidebarOpen) {
          this.saveSidebarState()
          // Force close sidebar and reset layout when leaving deliveries
          this.rightSidebarOpen = false
          this.activeDeliveryId = null
          // Reset any stored sidebar history for non-deliveries views
          Object.keys(this.sidebarHistory).forEach(viewName => {
            if (viewName !== 'deliveries') {
              delete this.sidebarHistory[viewName]
            }
          })
        }
      }
      
      // Only restore sidebar state when explicitly returning to deliveries
      if (toDeliveries && !fromDeliveries) {
        this.handleDeliveriesReturn()
      }
      
      this.cleanupOldTransitions()
    },
    
    saveSidebarState() {
      if (this.currentView === 'deliveries' && this.rightSidebarOpen) {
        this.sidebarHistory['deliveries'] = {
          open: this.rightSidebarOpen,
          deliveryId: this.activeDeliveryId,
          timestamp: Date.now()
        }
      }
    },
    
    restoreSidebarState(viewName) {
      const state = this.sidebarHistory[viewName]
      if (state && state.open) {
        const stateAge = Date.now() - state.timestamp
        if (stateAge < 30 * 60 * 1000) {
          this.rightSidebarOpen = true
          this.activeDeliveryId = state.deliveryId
          return true
        } else {
          delete this.sidebarHistory[viewName]
        }
      }
      return false
    },
    
    updateLastInteraction() {
      this.lastInteractionTime = Date.now()
    },
    
    cleanupOldTransitions() {
      const now = Date.now()
      const maxAge = 30 * 60 * 1000
      
      Object.keys(this.viewTransitions).forEach(viewName => {
        const transition = this.viewTransitions[viewName]
        if (now - transition.timestamp > maxAge) {
          delete this.viewTransitions[viewName]
        }
      })
      
      Object.keys(this.sidebarHistory).forEach(viewName => {
        const state = this.sidebarHistory[viewName]
        if (now - state.timestamp > maxAge) {
          delete this.sidebarHistory[viewName]
        }
      })
    }
  }
})
