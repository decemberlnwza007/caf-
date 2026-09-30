import { computed, getCurrentScope, onScopeDispose, ref } from 'vue'
import { initialPromotions, initialStock } from '../data/management.js'
import { useSavedList } from './useSavedList.js'

export function currentLocalDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function promotionStatus(item, today = currentLocalDate()) {
  if (!item.enabled) return 'paused'
  if (item.end < today) return 'expired'
  if (item.start > today) return 'scheduled'
  return 'active'
}

function useCurrentDate() {
  const today = ref(currentLocalDate())

  if (typeof window !== 'undefined' && getCurrentScope()) {
    let timer
    const refresh = () => {
      clearTimeout(timer)
      today.value = currentLocalDate()
      const now = new Date()
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      timer = setTimeout(refresh, midnight.getTime() - now.getTime() + 50)
    }

    refresh()
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)

    onScopeDispose(() => {
      clearTimeout(timer)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    })
  }

  return today
}

export function useShopOverview() {
  const { items: stock, notice: stockNotice } = useSavedList('cafe-stock-v1', initialStock)
  const { items: promotions, notice: promotionNotice } = useSavedList('cafe-promotions-v1', initialPromotions)
  const today = useCurrentDate()
  const lowStock = computed(() => stock.value.filter(item => item.quantity <= item.minimum))
  const activePromotions = computed(() => promotions.value.filter(item => promotionStatus(item, today.value) === 'active'))
  const expiringPromotions = computed(() => {
    const [year, month, day] = today.value.split('-').map(Number)
    const deadline = currentLocalDate(new Date(year, month - 1, day + 7, 12))
    return activePromotions.value.filter(item => item.end <= deadline)
  })
  const inventoryValue = computed(() => stock.value.reduce((total, item) => total + item.quantity * item.price, 0))

  return { stock, promotions, stockNotice, promotionNotice, today, lowStock, activePromotions, expiringPromotions, inventoryValue }
}
