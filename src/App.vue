<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import DashboardPage from './components/DashboardPage.vue'
import RewardComponent from './components/RewardComponent.vue'
import StockPage from './components/StockPage.vue'
import PromotionPage from './components/PromotionPage.vue'

const activePage = ref('dashboard')
const routeKey = ref('')
const currentView = computed(() => ({ dashboard: DashboardPage, home: RewardComponent, stock: StockPage, promotions: PromotionPage })[activePage.value])
function syncPage() {
  routeKey.value = window.location.hash
  const route = window.location.hash.slice(1).split('?')[0]
  activePage.value = ['home', 'stock', 'promotions'].includes(route) ? route : route === 'rewards' || route === 'history' ? 'home' : 'dashboard'
}

onMounted(() => {
  syncPage()
  window.addEventListener('hashchange', syncPage)
})

onUnmounted(() => {
  window.removeEventListener('hashchange', syncPage)
})
</script>

<template>
  <div class="app-shell">
    <div class="app-content">
      <Transition name="page-change" mode="out-in">
        <component :is="currentView" :key="routeKey" />
      </Transition>
    </div>
  </div>
</template>
