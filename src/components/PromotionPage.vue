<script setup>
import { computed, onMounted, ref } from 'vue'
import ActionToast from './ActionToast.vue'
import AnimatedNumber from './AnimatedNumber.vue'
import BaseModal from './BaseModal.vue'
import { currentLocalDate, promotionStatus, useShopOverview } from '../composables/useShopOverview'

const { promotions: items, promotionNotice: notice, today: currentDay } = useShopOverview()
const search = ref('')
const filter = ref('all')
const formOpen = ref(false)
const deleteOpen = ref(false)
const pendingDelete = ref(null)
const editingId = ref(null)
const message = ref('')
const error = ref('')
const today = currentLocalDate
const emptyForm = () => ({ name: '', product: '', type: 'percent', discount: 10, price: 100, start: today(), end: today(), enabled: true })
const form = ref(emptyForm())
const discountedPrice = item => Math.max(0, item.type === 'percent' ? item.price * (1 - item.discount / 100) : item.price - item.discount)
const money = value => value.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })
const dateLabel = value => new Date(`${value}T00:00:00`).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
const status = item => promotionStatus(item, currentDay.value)
const labels = { active: 'กำลังใช้งาน', paused: 'ปิดใช้งาน', scheduled: 'รอเริ่ม', expired: 'สิ้นสุดแล้ว' }
const filteredItems = computed(() => items.value.filter(item => {
  return `${item.name} ${item.product}`.toLowerCase().includes(search.value.trim().toLowerCase()) && (filter.value === 'all' || status(item) === filter.value)
}))
const activeCount = computed(() => items.value.filter(item => status(item) === 'active').length)

function openForm(item) {
  editingId.value = item?.id ?? null
  form.value = item ? { ...item } : emptyForm()
  formOpen.value = true
  error.value = ''
  message.value = ''
}

function savePromotion() {
  error.value = ''
  if (!form.value.name.trim() || !form.value.product.trim()) {
    error.value = 'กรุณาระบุชื่อโปรโมชันและสินค้าที่ร่วมรายการ'
    return
  }
  if (form.value.end < form.value.start) {
    error.value = 'วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น'
    return
  }
  if (form.value.type === 'amount' && form.value.discount > form.value.price) {
    error.value = 'ส่วนลดต้องไม่มากกว่าราคาปกติ'
    return
  }
  const item = { ...form.value, name: form.value.name.trim(), product: form.value.product.trim() }
  if (editingId.value) {
    const index = items.value.findIndex(entry => entry.id === editingId.value)
    items.value[index] = { ...item, id: editingId.value }
  } else {
    items.value.push({ ...item, id: `PM-${Date.now()}` })
  }
  closeForm()
  message.value = `บันทึก ${item.name} เรียบร้อยแล้ว`
}

function togglePromotion(item) {
  item.enabled = !item.enabled
  message.value = `${item.enabled ? 'เปิด' : 'ปิด'}ใช้งาน ${item.name} แล้ว`
}
function closeForm() {
  formOpen.value = false
}

function askDelete(item) {
  pendingDelete.value = item
  deleteOpen.value = true
}

function deleteItem() {
  const item = pendingDelete.value
  if (!item) return
  items.value = items.value.filter(entry => entry.id !== item.id)
  deleteOpen.value = false
  message.value = `ลบ ${item.name} เรียบร้อยแล้ว`
}
onMounted(() => {
  const query = new URLSearchParams(window.location.hash.split('?')[1] || '')
  search.value = query.get('search') || ''
  if (query.get('new') === '1') openForm()
})
</script>

<template>
  <main class="management-page">
    <header class="management-heading">
      <div>
        <h1>Price promotion</h1>
        <p>จัดการราคาและส่วนลด เพื่อทุกช่วงเวลาพิเศษของร้าน</p>
      </div>
      <button class="action-button" type="button" data-add-item @click="openForm()">+ เพิ่มโปรโมชัน</button>
    </header>
    <p class="demo-note">ข้อมูลตัวอย่าง · การเปลี่ยนแปลงบันทึกไว้ในเบราว์เซอร์นี้</p>
    <p v-if="notice" class="feedback" role="alert">{{ notice }}</p>
    <ActionToast v-model="message" />
    <section class="promotion-intro">
      <div>
        <h2>โปรโมชันของร้าน</h2>
        <p>กำหนดราคาที่ใช่ พร้อมเลือกช่วงเวลาให้ลูกค้ารับสิทธิพิเศษ</p>
      </div>
      <p>
        <strong><AnimatedNumber :value="activeCount" /></strong> กำลังใช้งาน <span>จากทั้งหมด {{ items.length }} โปรโมชัน</span>
      </p>
    </section>
    <BaseModal
      v-model="formOpen"
      :title="editingId ? 'แก้ไขโปรโมชัน' : 'เพิ่มโปรโมชัน'"
      description="กำหนดส่วนลดและช่วงเวลาที่ร่วมรายการ"
    >
      <form class="management-form" @submit.prevent="savePromotion">
        <label>ชื่อโปรโมชัน<input data-initial-focus v-model="form.name" required maxlength="100" />
        </label>
        <label>สินค้าที่ร่วมรายการ<input v-model="form.product" required maxlength="150" />
        </label>
        <label>รูปแบบส่วนลด<select v-model="form.type">
            <option value="percent">เปอร์เซ็นต์ (%)</option>
            <option value="amount">จำนวนเงิน (บาท)</option>
          </select>
        </label>
        <label>ส่วนลด ({{ form.type === 'percent' ? '%' : 'บาท' }})<input v-model.number="form.discount" required type="number" min="0.01" :max="form.type === 'percent' ? 100 : form.price" step="0.01" />
        </label>
        <label>ราคาปกติ (บาท)<input v-model.number="form.price" required type="number" min="0.01" step="0.01" />
        </label>
        <div class="price-preview">
          <span>ราคาหลังส่วนลด</span>
          <strong>{{ money(discountedPrice(form)) }}</strong>
        </div>
        <label>วันเริ่มต้น<input v-model="form.start" required type="date" />
        </label>
        <label>วันสิ้นสุด<input v-model="form.end" required type="date" :min="form.start" />
        </label>
        <label class="checkbox-label">
          <input v-model="form.enabled" type="checkbox" /> เปิดใช้งานโปรโมชัน</label>
        <p v-if="error" class="form-error" role="alert">{{ error }}</p>
        <div class="form-actions">
          <button type="button" class="quiet-button" @click="closeForm">ยกเลิก</button>
          <button class="action-button">บันทึกโปรโมชัน</button>
        </div>
      </form>
    </BaseModal>
    <BaseModal
      v-model="deleteOpen"
      title="ลบโปรโมชันนี้?"
      description="รายการนี้จะถูกนำออกจากข้อมูลที่บันทึกในเบราว์เซอร์"
      compact
    >
      <div class="delete-summary">
        <span>โปรโมชันที่ต้องการลบ</span>
        <strong>{{ pendingDelete?.name }}</strong>
        <p>เมื่อลบแล้วจะไม่สามารถเรียกคืนได้</p>
      </div>
      <div class="form-actions">
        <button type="button" class="outline-button" data-initial-focus @click="deleteOpen = false">ยกเลิก</button>
        <button type="button" class="danger-button" @click="deleteItem">ยืนยันการลบ</button>
      </div>
    </BaseModal>
    <section aria-labelledby="promotions-title">
      <div class="panel-heading">
        <h2 id="promotions-title">รายการโปรโมชัน</h2>
        <span class="muted">{{ filteredItems.length }} รายการ</span>
      </div>
      <div class="filter-bar promotion-filters">
        <label class="search-field">ค้นหาโปรโมชัน<input v-model="search" type="search" placeholder="ค้นหาชื่อโปรโมชัน หรือสินค้า" />
        </label>
        <label>สถานะ<select v-model="filter">
            <option value="all">ทุกสถานะ</option>
            <option v-for="(label, key) in labels" :key="key" :value="key">{{ label }}</option>
          </select>
        </label>
      </div>
      <TransitionGroup name="list-change" tag="div" class="promotion-list animated-list">
        <article v-for="item in filteredItems" :key="item.id" class="promotion-card">
          <div class="promotion-discount">
            <strong>{{ item.discount }}<small>{{ item.type === 'percent' ? '%' : '฿' }}</small>
            </strong>
            <span>ส่วนลด</span>
          </div>
          <div class="promotion-details">
            <span class="status-badge" :class="status(item)">{{ labels[status(item)] }}</span>
            <h3>{{ item.name }}</h3>
            <p>{{ item.product }}</p>
            <p class="muted">{{ dateLabel(item.start) }} – {{ dateLabel(item.end) }}</p>
          </div>
          <div class="promotion-price">
            <span class="muted">ราคาหลังส่วนลด</span>
            <strong>{{ money(discountedPrice(item)) }}</strong>
            <s class="muted">{{ money(item.price) }}</s>
          </div>
          <div class="promotion-actions">
            <button class="delete-button" type="button" :aria-label="`ลบ ${item.name}`" @click="askDelete(item)">ลบ</button>
            <button class="outline-button" :aria-label="`แก้ไข ${item.name}`" @click="openForm(item)">แก้ไข</button>
            <button class="promotion-toggle" :aria-pressed="item.enabled" :aria-label="`${item.enabled ? 'ปิด' : 'เปิด'}ใช้งาน ${item.name}`" @click="togglePromotion(item)">
              <span class="toggle-track" aria-hidden="true"><span></span></span>
              <span>{{ item.enabled ? 'เปิดอยู่' : 'ปิดอยู่' }}</span>
            </button>
          </div>
        </article>
      </TransitionGroup>
      <div v-if="!filteredItems.length" class="management-panel empty-state">
        <h3>ไม่พบโปรโมชัน</h3>
        <p>ลองค้นหาชื่ออื่น หรือเปลี่ยนตัวกรองสถานะ</p>
        <button class="quiet-button" @click="search = ''; filter = 'all'">ล้างตัวกรอง</button>
      </div>
    </section>
  </main>
</template>
