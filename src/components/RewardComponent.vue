<script setup>
import { computed, ref } from 'vue'
import { history, rewards } from '../data/rewards'

const nextTierPoints = 5000
const stampTarget = 10
const points = ref(2450)
const stamps = ref(9)
const progress = computed(() => Math.min(100, Math.max(0, points.value / nextTierPoints * 100)))
const remainingPoints = computed(() => Math.max(0, nextTierPoints - points.value))
const recentHistory = computed(() => history.slice(0, 2))
</script>

<template>
  <div class="rewards-page">
    <!-- <header class="site-header">
      <div class="page-container header-content">
        <h1>ระบบสะสมแต้ม</h1>
        <nav class="main-nav" aria-label="เมนูหลัก">
          <a href="#">หน้าหลัก</a>
          <a href="#rewards">ของรางวัล</a>
          <a href="#history">ประวัติแต้ม</a>
          <a href="#">รางวัลของฉัน</a>
        </nav>
        <button type="button" class="profile-button">โปรไฟล์</button>
      </div>
    </header> -->

    <main class="page-container main-content">
      <section class="membership" aria-labelledby="membership-title">
        <div class="membership-header">
          <div>
            <p class="membership-label">ระดับสมาชิกปัจจุบัน</p>
            <h2 id="membership-title">Gold Member</h2>
            <p class="membership-caption">สมาชิกระดับ Gold</p>
          </div>
          <div class="member-badge">
            <i class="fa-solid fa-star" aria-hidden="true"></i>
            <span>Golden Bloom</span>
          </div>
        </div>
        <div class="points-summary">
          <p class="membership-caption">คะแนนสะสม (Available Points)</p>
          <p class="points-value">{{ points.toLocaleString() }} <span>pts</span></p>
        </div>
        <div class="tier-progress">
          <div class="tier-labels"><span>Gold</span><span>Platinum</span></div>
          <div
            class="progress-track"
            role="progressbar"
            aria-label="คะแนนสู่ระดับ Platinum"
            :aria-valuenow="Math.min(nextTierPoints, Math.max(0, points))"
            :aria-valuemin="0"
            :aria-valuemax="nextTierPoints"
          >
            <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
          </div>
          <p class="membership-caption next-tier">
            สะสมอีก <strong>{{ remainingPoints.toLocaleString() }} คะแนน</strong>
            เพื่อเลื่อนสู่ระดับถัดไป
          </p>
        </div>
      </section>

      <div class="activity-grid">
        <section class="panel stamp-panel" aria-labelledby="stamps-title">
          <div class="section-heading">
            <div>
              <h2 id="stamps-title">ซื้อ 10 แก้ว ฟรี 1 แก้ว</h2>
              <p class="secondary-text">ทุก 1 แก้ว รับ 1 แสตมป์</p>
            </div>
            <p class="stamp-count">{{ stamps }} <span>/ {{ stampTarget }}</span></p>
          </div>
          <ol class="stamp-grid" :aria-label="`สะสมแล้ว ${stamps} จาก ${stampTarget} แสตมป์`">
            <li
              v-for="index in stampTarget"
              :key="index"
              class="stamp"
              :class="{ 'is-collected': index <= stamps }"
              :aria-label="`แสตมป์ ${index}${index <= stamps ? ' สะสมแล้ว' : ' ยังไม่ได้สะสม'}`"
            >
              <i v-if="index <= stamps" class="fa-solid fa-mug-hot" aria-hidden="true"></i>
              <span v-else>{{ index }}</span>
            </li>
          </ol>
          <p v-if="stamps < stampTarget" class="stamp-status">
            อีก <strong>{{ stampTarget - stamps }} แก้ว</strong> รับเครื่องดื่มฟรี
          </p>
          <button v-else type="button" class="primary-button stamp-status">ใช้สิทธิ์</button>
        </section>

        <section id="history" class="panel" aria-labelledby="history-title">
          <div class="section-heading">
            <div>
              <h2 id="history-title">รายการล่าสุด</h2>
              <p class="secondary-text">ประวัติการได้รับและใช้คะแนน</p>
            </div>
            <button type="button" class="text-button">ดูทั้งหมด</button>
          </div>
          <ul class="history-list">
            <li v-for="item in recentHistory" :key="item.id" class="history-item">
              <div>
                <p>{{ item.title }}</p>
                <p class="history-date">{{ item.date }}</p>
              </div>
              <p class="history-points" :class="item.points > 0 ? 'is-earned' : 'is-spent'">
                {{ item.points > 0 ? '+' : '' }}{{ item.points.toLocaleString() }} คะแนน
              </p>
            </li>
          </ul>
        </section>
      </div>

      <section id="rewards" aria-labelledby="rewards-title">
        <div class="section-heading rewards-heading">
          <div>
            <h2 id="rewards-title">แลกของรางวัล &amp; ส่วนลด (Redeem Rewards)</h2>
            <p class="secondary-text">ใช้คะแนนสะสมเพื่อแลกรับสิทธิพิเศษ</p>
          </div>
          <button type="button" class="text-button">ดูทั้งหมด</button>
        </div>
        <div class="reward-list">
          <article v-for="reward in rewards" :key="reward.id" class="reward-card">
            <div class="reward-image">
              <div class="image-placeholder">
                <img v-if="reward.image" :src="reward.image" :alt="reward.name" loading="lazy" />
                <span v-else>รูป</span>
              </div>
            </div>
            <div class="reward-details">
              <h3>{{ reward.name }}</h3>
              <p class="secondary-text">{{ reward.description }}</p>
              <p class="reward-expiry">ใช้ได้ถึง {{ reward.expire }}</p>
            </div>
            <div class="reward-actions">
              <div>
                <p class="secondary-text">ใช้คะแนน</p>
                <p class="reward-cost">{{ reward.points.toLocaleString() }} <span>คะแนน</span></p>
              </div>
              <button type="button" class="primary-button">แลกรางวัล</button>
            </div>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.rewards-page {
  min-height: 100svh;
  background: #f3f4f6;
}

.page-container {
  width: min(100% - 2rem, 80rem);
  margin-inline: auto;
}

.site-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1rem;
  padding-block: 1rem;
}

.header-content h1 {
  font-size: 1.25rem;
  font-weight: 700;
}

.main-nav {
  order: 3;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  width: 100%;
  gap: 0.25rem 1rem;
}

.main-nav a {
  display: flex;
  align-items: center;
  min-height: 44px;
}

.profile-button {
  min-height: 44px;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
}

.main-content {
  display: grid;
  gap: 2rem;
  padding-block: 1.5rem 3rem;
}

.membership {
  padding: clamp(1.25rem, 4vw, 2.25rem);
  border-radius: 2rem;
  color: white;
  background: linear-gradient(135deg, #2c2923, #40392f, #27241f);
}

.membership-header {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.membership-label {
  color: #ff8a38;
  font-weight: 700;
  font-size: 0.875rem;
}

.membership h2 {
  margin-top: 0.5rem;
  font-size: 1.875rem;
  font-weight: 700;
}

.membership-caption {
  color: #d2cfcb;
}

.member-badge {
  display: flex;
  align-self: flex-start;
  align-items: center;
  gap: 0.5rem;
  border: 2px solid #ffb800;
  color: #ffb800;
  padding: 0.75rem 1.25rem;
  border-radius: 1rem;
  font-weight: 700;
}

.points-summary {
  margin-top: 2.5rem;
}

.points-value {
  color: #ff8a38;
  font-size: clamp(2.5rem, 7vw, 3rem);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.points-value span {
  font-size: 1.5rem;
}

.tier-progress {
  margin-top: 1.75rem;
}

.tier-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #d2cfcb;
}

.progress-track {
  height: 0.75rem;
  overflow: hidden;
  background: #ffffff33;
  border-radius: 1rem;
}

.progress-fill {
  height: 100%;
  background: #ff6b00;
  border-radius: inherit;
}

.next-tier {
  margin-top: 1rem;
}

.next-tier strong {
  color: white;
}

.activity-grid {
  display: grid;
  gap: 1.5rem;
}

.panel {
  min-width: 0;
  padding: 1.25rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.section-heading > div {
  min-width: 0;
}

.section-heading h2 {
  font-size: 1.125rem;
  font-weight: 700;
}

.secondary-text {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.stamp-count {
  flex-shrink: 0;
  color: #c2410c;
  font-size: 1.5rem;
  font-weight: 700;
}

.stamp-count span {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 400;
}

.stamp-panel {
  container: stamps / inline-size;
}

.stamp-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1rem 0.5rem;
  margin-top: 1.5rem;
}

.stamp {
  display: flex;
  justify-content: center;
  align-items: center;
  justify-self: center;
  width: 100%;
  max-width: 4rem;
  aspect-ratio: 1;
  border: 2px dashed #d1d5db;
  border-radius: 50%;
  color: #6b7280;
  font-size: clamp(1rem, 4cqw, 1.25rem);
  font-weight: 700;
}

.stamp i {
  font-size: clamp(1.125rem, 5cqw, 1.75rem);
  line-height: 1;
}

@container stamps (min-width: 44rem) {
  .stamp-grid {
    grid-template-columns: repeat(10, minmax(0, 1fr));
  }
}

.stamp.is-collected {
  background: #c2410c;
  border-color: #c2410c;
  border-style: solid;
  color: white;
}

.stamp-status {
  margin-top: 1.25rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.stamp-status strong {
  color: #c2410c;
}

.text-button {
  flex-shrink: 0;
  min-height: 44px;
  color: #c2410c;
  font-size: 0.875rem;
}

.history-list {
  margin-top: 1rem;
}

.history-item {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem 1rem;
  padding-block: 0.75rem;
  border-top: 1px solid #f3f4f6;
  font-size: 0.875rem;
}

.history-date, .reward-expiry {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.history-points {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.is-earned {
  color: #15803d;
}

.is-spent {
  color: #dc2626;
}

.rewards-heading {
  margin-bottom: 1.25rem;
}

.rewards-heading h2 {
  font-size: clamp(1.25rem, 3vw, 1.5rem);
}

.reward-list {
  display: grid;
  gap: 1rem;
}

.reward-card {
  position: relative;
  display: grid;
  grid-template-columns: 4.5rem minmax(0, 1fr);
  align-items: center;
  overflow: hidden;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 1.25rem;
  gap: 1rem;
}

.reward-card::before, .reward-card::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: #f3f4f6;
  transform: translateY(-50%);
}

.reward-card::before {
  left: -0.75rem;
}

.reward-card::after {
  right: -0.75rem;
}

.reward-image {
  display: flex;
  justify-content: center;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 50%;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 0.75rem;
}

.image-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reward-details {
  min-width: 0;
}

.reward-details h3 {
  color: #c2410c;
  font-size: 1.125rem;
  font-weight: 700;
}

.reward-expiry {
  margin-top: 0.75rem;
}

.reward-actions {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px dashed #d1d5db;
  padding-top: 1rem;
}

.reward-cost {
  font-size: 1.25rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.reward-cost span {
  font-size: 0.875rem;
  font-weight: 400;
}

.primary-button {
  min-height: 44px;
  padding: 0.625rem 1.5rem;
  border-radius: 2rem;
  background: #111827;
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
}

@media (hover: hover) {
  .primary-button:hover {
    background: #374151;
  }

  .main-nav a:hover, .text-button:hover {
    text-decoration: underline;
    text-underline-offset: 0.25em;
  }

}

@media (min-width: 36rem) {
  .page-container {
    width: min(100% - 3rem, 80rem);
  }

  .main-nav {
    display: flex;
    justify-content: space-between;
    gap: 1.5rem;
  }

  .membership-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .member-badge {
    align-self: auto;
  }

  .panel {
    padding: 1.5rem;
  }

}

@media (min-width: 48rem) {
  .header-content {
    flex-wrap: nowrap;
  }

  .main-nav {
    order: 0;
    width: auto;
  }

  .main-content {
    padding-top: 2rem;
  }

  .reward-card {
    grid-template-columns: 7rem minmax(0, 1fr) auto;
    gap: 1.5rem;
  }

  .image-placeholder {
    width: 5rem;
  }

  .reward-details {
    border-left: 1px dashed #d1d5db;
    padding-left: 1.5rem;
  }

  .reward-actions {
    grid-column: auto;
    flex-direction: column;
    align-items: flex-end;
    border-top: 0;
    padding-top: 0;
    text-align: right;
  }

}

@media (min-width: 64rem) {
  .activity-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

}
</style>
