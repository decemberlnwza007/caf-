<script setup>
import { computed, ref } from 'vue'
import AnimatedNumber from './AnimatedNumber.vue'
import { useShopOverview } from '../composables/useShopOverview'

const {
  stock, promotions, stockNotice, promotionNotice, today,
  lowStock, activePromotions, expiringPromotions, inventoryValue,
} = useShopOverview()
const selectedFilter = ref('all')
const alertCount = computed(() => lowStock.value.length + expiringPromotions.value.length)
const money = value => value.toLocaleString('th-TH', { maximumFractionDigits: 2 })
const dateLabel = value => new Date(`${value}T00:00:00`).toLocaleDateString('th-TH', {
  day: 'numeric', month: 'long', year: 'numeric',
})
const alerts = computed(() => [
  ...lowStock.value.map(item => ({
    id: `stock-${item.id}`,
    type: 'stock',
    name: item.name,
    detail: `เหลือ ${item.quantity} ${item.unit} · จุดแจ้งเตือน ${item.minimum} ${item.unit}`,
    badge: item.quantity === 0 ? 'หมดสต็อก' : 'ใกล้หมด',
    urgent: item.quantity === 0,
    href: `#stock?search=${encodeURIComponent(item.name)}`,
    action: 'จัดการสต็อก',
  })),
  ...expiringPromotions.value.map(item => ({
    id: `promotion-${item.id}`,
    type: 'promotion',
    name: item.name,
    detail: `สิ้นสุด ${dateLabel(item.end)}`,
    badge: item.end === today.value ? 'วันสุดท้าย' : 'ใกล้สิ้นสุด',
    urgent: item.end === today.value,
    href: `#promotions?search=${encodeURIComponent(item.name)}`,
    action: 'ดูโปรโมชัน',
  })),
])
const visibleAlerts = computed(() => alerts.value.filter(alert => {
  return selectedFilter.value === 'all' || alert.type === selectedFilter.value
}))
const filters = computed(() => [
  { id: 'all', label: 'ทั้งหมด', count: alertCount.value },
  { id: 'stock', label: 'สต็อก', count: lowStock.value.length },
  { id: 'promotion', label: 'โปรโมชัน', count: expiringPromotions.value.length },
])
</script>

<template>
  <main class="management-page dashboard-page">
    <header class="management-heading">
      <div>
        <h1>ภาพรวมร้าน</h1>
        <p>เริ่มวันใหม่ เช็กความพร้อมของร้านในที่เดียว</p>
      </div>
      <time class="dashboard-date" :datetime="today">{{ dateLabel(today) }}</time>
    </header>
    <p class="demo-note">ข้อมูลตัวอย่าง · สรุปจากข้อมูลที่คุณบันทึกไว้ในเบราว์เซอร์นี้</p>
    <p v-if="stockNotice || promotionNotice" class="feedback" role="alert">
      {{ stockNotice || promotionNotice }}
    </p>

    <section class="shop-welcome" aria-labelledby="welcome-title">
      <div>
        <h2 id="welcome-title">จัดร้านให้พร้อม แล้วเริ่มวันดี ๆ</h2>
        <p v-if="alertCount">มี {{ alertCount }} รายการให้แวะดูอีกนิด เช็กได้ที่ด้านล่าง</p>
        <p v-else>ไม่มีสต็อกต่ำหรือโปรโมชันใกล้สิ้นสุดที่ต้องแจ้งเตือนตอนนี้</p>
      </div>
      <div class="welcome-actions">
        <a class="warm-button" href="#stock?new=1">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          เพิ่มสินค้า
        </a>
        <a class="welcome-link" href="#promotions?new=1">สร้างโปรโมชัน <span aria-hidden="true">↗</span></a>
      </div>
    </section>

    <dl class="overview-numbers">
      <div>
        <dt>สินค้าในร้าน</dt>
        <dd><AnimatedNumber :value="stock.length" /> <span>รายการ</span></dd>
        <a href="#stock">ไปที่ Stock <span aria-hidden="true">→</span></a>
      </div>
      <div>
        <dt>มูลค่าสต็อกตามต้นทุน</dt>
        <dd><span>฿</span><AnimatedNumber :value="inventoryValue" :format="money" /></dd>
        <p>จำนวนคงเหลือ × ต้นทุนต่อหน่วย</p>
      </div>
      <div>
        <dt>โปรโมชันที่กำลังใช้งาน</dt>
        <dd><AnimatedNumber :value="activePromotions.length" /> <span>/ {{ promotions.length }} รายการ</span></dd>
        <a href="#promotions">ดูโปรโมชัน <span aria-hidden="true">→</span></a>
      </div>
    </dl>

    <div class="overview-columns">
      <section class="management-panel attention-panel" aria-labelledby="attention-title">
        <div class="panel-heading">
          <div>
            <h2 id="attention-title">แวะดูสักนิด</h2>
            <p class="muted">สต็อกต่ำและโปรโมชันที่จะสิ้นสุดภายใน 7 วัน</p>
          </div>
          <span class="alert-total" :aria-label="`${alertCount} รายการที่ต้องดูแล`">{{ alertCount }}</span>
        </div>
        <div class="attention-filters" role="group" aria-label="กรองการแจ้งเตือน">
          <button
            v-for="filter in filters"
            :key="filter.id"
            type="button"
            :aria-pressed="selectedFilter === filter.id"
            @click="selectedFilter = filter.id"
          >{{ filter.label }} <span>{{ filter.count }}</span></button>
        </div>
        <ul v-if="visibleAlerts.length" class="attention-list">
          <li v-for="alert in visibleAlerts" :key="alert.id">
            <div>
              <span class="status-badge" :class="alert.urgent ? 'empty' : 'low'">{{ alert.badge }}</span>
              <h3>{{ alert.name }}</h3>
              <p class="muted">{{ alert.detail }}</p>
            </div>
            <a :href="alert.href" :aria-label="`${alert.action} ${alert.name}`">
              {{ alert.action }} <span aria-hidden="true">→</span>
            </a>
          </li>
        </ul>
        <div v-else class="attention-clear" role="status">
          <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="24" cy="24" r="20" />
            <path class="ready-check" d="m14 24 7 7 14-14" pathLength="1" />
          </svg>
          <h3>เรียบร้อย สบายใจได้อีกเรื่อง</h3>
          <p>{{ selectedFilter === 'promotion' ? 'ไม่มีโปรโมชันที่กำลังใช้งานใกล้สิ้นสุดใน 7 วันนี้' : 'ไม่มีรายการแจ้งเตือนในหมวดนี้' }}</p>
        </div>
      </section>

      <section class="today-promotions" aria-labelledby="today-promotions-title">
        <div class="panel-heading">
          <h2 id="today-promotions-title">ดีลที่พร้อมเสิร์ฟ</h2>
          <a class="quiet-button" href="#promotions">ดูทั้งหมด</a>
        </div>
        <p class="muted">โปรโมชันที่ลูกค้าใช้ได้ในวันนี้</p>
        <ul v-if="activePromotions.length" class="deal-list">
          <li v-for="item in activePromotions.slice(0, 3)" :key="item.id">
            <a :href="`#promotions?search=${encodeURIComponent(item.name)}`" class="deal-ticket">
              <div class="deal-value">{{ item.discount }}<span>{{ item.type === 'percent' ? '%' : '฿' }}</span><small>ส่วนลด</small></div>
              <div class="deal-copy">
                <h3>{{ item.name }}</h3>
                <p>{{ item.product }}</p>
                <small>ถึง {{ dateLabel(item.end) }}</small>
              </div>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
            </a>
          </li>
        </ul>
        <div v-else class="management-panel empty-state">
          <h3>มีพื้นที่ให้ดีลใหม่ ๆ</h3>
          <p>ยังไม่มีโปรโมชันที่กำลังใช้งานวันนี้</p>
          <a class="quiet-button" href="#promotions?new=1">สร้างโปรโมชันแรก</a>
        </div>
        <a class="rewards-shortcut" href="#home">
          <div><strong>ความพิเศษสำหรับลูกค้าประจำ</strong><span>ดูคะแนน แสตมป์ และของรางวัล</span></div>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 8h16v13H4V8Zm-1 0h18v4H3V8Zm9 0v13M12 8H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z" /></svg>
        </a>
      </section>
    </div>
  </main>
</template>
