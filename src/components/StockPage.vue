<script setup>
import { computed, onMounted, ref } from 'vue'
import ActionToast from './ActionToast.vue'
import AnimatedNumber from './AnimatedNumber.vue'
import BaseModal from './BaseModal.vue'
import { initialStock } from '../data/management'
import { useSavedList } from '../composables/useSavedList'

const { items, notice } = useSavedList('cafe-stock-v1', initialStock)
const search = ref('')
const filter = ref('all')
const editingId = ref(null)
const formOpen = ref(false)
const deleteOpen = ref(false)
const pendingDelete = ref(null)
const message = ref('')
const error = ref('')
const emptyForm = () => ({ name: '', category: 'วัตถุดิบ', quantity: 0, minimum: 5, unit: 'ชิ้น', price: 0 })
const form = ref(emptyForm())
const status = item => item.quantity === 0 ? 'empty' : item.quantity <= item.minimum ? 'low' : 'ready'
const labels = { ready: 'พร้อมใช้งาน', low: 'ใกล้หมด', empty: 'หมดสต็อก' }
const lowCount = computed(() => items.value.filter(item => status(item) === 'low').length)
const emptyCount = computed(() => items.value.filter(item => status(item) === 'empty').length)
const filteredItems = computed(() => items.value.filter(item => {
  const matchesSearch = `${item.name} ${item.id}`.toLowerCase().includes(search.value.trim().toLowerCase())
  return matchesSearch && (filter.value === 'all' || status(item) === filter.value)
}))

function openForm(item) {
  editingId.value = item?.id ?? null
  form.value = item ? { ...item } : emptyForm()
  error.value = ''
  formOpen.value = true
  message.value = ''
}

function saveItem() {
  if (!form.value.name.trim() || !form.value.unit.trim()) {
    error.value = 'กรุณาระบุชื่อสินค้าและหน่วย'
    return
  }
  const item = { ...form.value, name: form.value.name.trim(), unit: form.value.unit.trim() }
  if (editingId.value) {
    const index = items.value.findIndex(entry => entry.id === editingId.value)
    items.value[index] = { ...item, id: editingId.value }
  } else {
    items.value.push({ ...item, id: `ST-${Date.now()}` })
  }
  closeForm()
  message.value = `บันทึก ${item.name} เรียบร้อยแล้ว`
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
        <h1>Stock</h1>
        <p>จัดการสินค้าและวัตถุดิบ ให้พร้อมสำหรับทุกออเดอร์</p>
      </div>
      <button class="action-button" type="button" data-add-item @click="openForm()">+ เพิ่มสินค้า</button>
    </header>
    <p class="demo-note">ข้อมูลตัวอย่าง · การเปลี่ยนแปลงบันทึกไว้ในเบราว์เซอร์นี้</p>
    <p v-if="notice" class="feedback" role="alert">{{ notice }}</p>
    <ActionToast v-model="message" />
    <section class="inventory-summary" aria-label="สรุปสต็อกและกรองสถานะ">
      <div>
        <button class="summary-filter" :aria-pressed="filter === 'all'" @click="filter = 'all'">
          <span>สินค้าทั้งหมด</span>
          <strong><AnimatedNumber :value="items.length" /> <small>รายการ</small></strong>
        </button>
      </div>
      <div>
        <button class="summary-filter" :aria-pressed="filter === 'low'" @click="filter = 'low'">
          <span>ใกล้หมด</span>
          <strong><AnimatedNumber :value="lowCount" /> <small>รายการ</small></strong>
        </button>
      </div>
      <div>
        <button class="summary-filter" :aria-pressed="filter === 'empty'" @click="filter = 'empty'">
          <span>หมดสต็อก</span>
          <strong><AnimatedNumber :value="emptyCount" /> <small>รายการ</small></strong>
        </button>
      </div>
    </section>
    <BaseModal
      v-model="formOpen"
      :title="editingId ? 'แก้ไขสินค้า / ปรับสต็อก' : 'เพิ่มสินค้า'"
      description="อัปเดตข้อมูลและจำนวนคงเหลือของสินค้า"
    >
      <form class="management-form" @submit.prevent="saveItem">
        <label>ชื่อสินค้า<input data-initial-focus v-model="form.name" required maxlength="100" />
        </label>
        <label>หมวดหมู่<select v-model="form.category">
            <option>วัตถุดิบ</option>
            <option>บรรจุภัณฑ์</option>
            <option>เบเกอรี</option>
          </select>
        </label>
        <label>จำนวนคงเหลือ<input v-model.number="form.quantity" required type="number" min="0" step="1" />
        </label>
        <label>แจ้งเตือนเมื่อเหลือ<input v-model.number="form.minimum" required type="number" min="0" step="1" />
        </label>
        <label>หน่วย<input v-model="form.unit" required maxlength="20" />
        </label>
        <label>ต้นทุนต่อหน่วย (บาท)<input v-model.number="form.price" required type="number" min="0" step="0.01" />
        </label>
        <p v-if="error" class="form-error" role="alert">{{ error }}</p>
        <div class="form-actions">
          <button type="button" class="quiet-button" @click="closeForm">ยกเลิก</button>
          <button class="action-button">บันทึกสินค้า</button>
        </div>
      </form>
    </BaseModal>
    <BaseModal
      v-model="deleteOpen"
      title="ลบสินค้านี้?"
      description="รายการนี้จะถูกนำออกจากข้อมูลที่บันทึกในเบราว์เซอร์"
      compact
    >
      <div class="delete-summary">
        <span>สินค้าที่ต้องการลบ</span>
        <strong>{{ pendingDelete?.name }}</strong>
        <p>เมื่อลบแล้วจะไม่สามารถเรียกคืนได้</p>
      </div>
      <div class="form-actions">
        <button type="button" class="outline-button" data-initial-focus @click="deleteOpen = false">ยกเลิก</button>
        <button type="button" class="danger-button" @click="deleteItem">ยืนยันการลบ</button>
      </div>
    </BaseModal>
    <section class="management-panel" aria-labelledby="inventory-title">
      <div class="panel-heading">
        <h2 id="inventory-title">รายการสินค้า</h2>
        <span class="muted">{{ filteredItems.length }} รายการ</span>
      </div>
      <div class="filter-bar">
        <label class="search-field">ค้นหาสินค้า<input v-model="search" type="search" placeholder="ค้นหาชื่อสินค้า หรือรหัสสินค้า" />
        </label>
        <label>สถานะ<select v-model="filter">
            <option value="all">ทุกสถานะ</option>
            <option value="ready">พร้อมใช้งาน</option>
            <option value="low">ใกล้หมด</option>
            <option value="empty">หมดสต็อก</option>
          </select>
        </label>
      </div>
      <div class="stock-table">
        <div class="stock-row stock-table-heading" aria-hidden="true">
          <span>สินค้า</span>
          <span>คงเหลือ</span>
          <span>ต้นทุน / หน่วย</span>
          <span>สถานะ</span>
          <span>จัดการ</span>
        </div>
        <TransitionGroup name="list-change" tag="div" class="animated-list">
        <article v-for="item in filteredItems" :key="item.id" class="stock-row">
          <div class="stock-name">
            <h3>{{ item.name }}</h3>
            <p class="muted">{{ item.id }} · {{ item.category }}</p>
          </div>
          <div>
            <span class="mobile-label">คงเหลือ</span>
            <strong>{{ item.quantity.toLocaleString() }}</strong> {{ item.unit }}<p class="muted">ขั้นต่ำ {{ item.minimum }}</p>
          </div>
          <div>
            <span class="mobile-label">ต้นทุน / หน่วย</span>฿{{ item.price.toLocaleString('th-TH') }}</div>
          <div>
            <span class="status-badge" :class="status(item)">{{ labels[status(item)] }}</span>
          </div>
          <div class="row-actions">
            <button class="outline-button" type="button" :aria-label="`แก้ไข ${item.name}`" @click="openForm(item)">แก้ไข</button>
            <button class="delete-button" type="button" :aria-label="`ลบ ${item.name}`" @click="askDelete(item)">ลบ</button>
          </div>
        </article>
        </TransitionGroup>
      </div>
      <div v-if="!filteredItems.length" class="empty-state">
        <h3>ไม่พบสินค้า</h3>
        <p>ลองค้นหาชื่ออื่น หรือเปลี่ยนตัวกรองสถานะ</p>
        <button class="quiet-button" @click="search = ''; filter = 'all'">ล้างตัวกรอง</button>
      </div>
    </section>
  </main>
</template>
