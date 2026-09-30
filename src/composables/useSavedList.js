import { effectScope, ref, watch } from 'vue'

const savedLists = new Map()

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T12:00:00`)
  return !Number.isNaN(date.getTime()) && date.getFullYear() === Number(value.slice(0, 4))
    && date.getMonth() + 1 === Number(value.slice(5, 7))
    && date.getDate() === Number(value.slice(8, 10))
}

function validItems(items, initialItems) {
  if (!Array.isArray(items)) return false
  const template = initialItems[0]
  const ids = new Set()

  return items.every(item => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return false
    if (template && !Object.entries(template).every(([field, example]) => {
      const value = item[field]
      if (typeof value !== typeof example) return false
      if (typeof example === 'number') return Number.isFinite(value) && value >= 0
      if (typeof example === 'string') return !example.trim() || Boolean(value.trim())
      return true
    })) return false

    if (template?.id !== undefined) {
      if (ids.has(item.id)) return false
      ids.add(item.id)
    }

    if (template?.start && template?.end) {
      if (!validDate(item.start) || !validDate(item.end) || item.end < item.start) return false
    }

    if (template?.type === 'percent' || template?.type === 'amount') {
      if (!['percent', 'amount'].includes(item.type)) return false
      if (item.discount > (item.type === 'percent' ? 100 : item.price)) return false
    }

    return true
  })
}

export function useSavedList(key, initialItems) {
  if (savedLists.has(key)) return savedLists.get(key)

  const notice = ref('')
  let savedItems = JSON.parse(JSON.stringify(initialItems))

  try {
    const raw = localStorage.getItem(key)
    if (raw !== null) {
      const stored = JSON.parse(raw)
      if (!validItems(stored, initialItems)) throw new Error('Invalid saved list')
      savedItems = stored
    }
  } catch {
    notice.value = 'อ่านข้อมูลที่บันทึกไว้ไม่ได้ กำลังแสดงข้อมูลตัวอย่าง'
  }

  const items = ref(savedItems)
  const store = { items, notice }
  savedLists.set(key, store)

  effectScope(true).run(() => {
    watch(items, value => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
        notice.value = ''
      } catch {
        notice.value = 'บันทึกลงอุปกรณ์ไม่ได้ ข้อมูลจะอยู่เฉพาะครั้งนี้'
      }
    }, { deep: true, flush: 'sync' })
  })

  return store
}
