<template>
    <div class="min-h-screen bg-gray-100">

        <!-- แถบเมนู -->
        <header class="bg-white border-b">
            <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <h1 class="text-xl font-bold">
                    ระบบสะสมแต้ม
                </h1>

                <nav class="flex gap-6">
                    <a href="#">หน้าหลัก</a>
                    <a href="#">ของรางวัล</a>
                    <a href="#">ประวัติแต้ม</a>
                    <a href="#">รางวัลของฉัน</a>
                </nav>

                <button class="border px-4 py-2 rounded-lg">
                    โปรไฟล์
                </button>
            </div>
        </header>


        <!-- เนื้อหาหลัก -->
        <main class="max-w-7xl mx-auto px-6 py-8 space-y-8">

            <!-- ระดับสมาชิก -->
            <section class="rounded-[32px] p-7 md:p-9 text-white
         bg-gradient-to-br from-[#2C2923] via-[#40392F] to-[#27241F]">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                    <!-- ข้อมูลระดับ -->
                    <div>
                        <p class="text-[#FF6B00] font-bold tracking-wider text-sm">
                            ระดับสมาชิกปัจจุบัน
                        </p>

                        <h2 class="text-3xl font-bold mt-2">
                            Gold Member
                        </h2>

                        <p class="text-white/60 mt-1">
                            สมาชิกระดับ Gold
                        </p>
                    </div>

                    <!-- Badge -->
                    <div class="self-start md:self-auto
             flex items-center gap-2
             border-2 border-[#FFB800]
             text-[#FFB800]
             px-5 py-3
             rounded-2xl
             font-bold">
                        <span class="text-xl">★</span>
                        <span>Golden Bloom</span>
                    </div>

                </div>

                <!-- คะแนน -->
                <div class="mt-12">
                    <p class="text-white/60">
                        คะแนนสะสม (Available Points)
                    </p>

                    <div class="flex items-end gap-2 mt-1">
                        <h3 class="text-5xl font-bold text-[#FF6B00]">
                            {{ points.toLocaleString() }}
                        </h3>

                        <span class="text-2xl font-bold text-[#FF6B00] mb-1">
                            pts
                        </span>
                    </div>
                </div>

                <!-- Progress -->
                <div class="mt-7">
                    <div class="flex justify-between text-sm text-white/60 mb-2">
                        <span>Gold</span>
                        <span>Platinum</span>
                    </div>

                    <div class="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                        <div class="h-full bg-[#FF6B00] rounded-full" :style="{ width: `${progress}%` }"></div>
                    </div>

                    <p class="text-white/60 mt-4">
                        สะสมอีก
                        <span class="text-white font-medium">
                            {{ (5000 - points).toLocaleString() }} คะแนน
                        </span>
                        เพื่อเลื่อนสู่ระดับถัดไป
                    </p>
                </div>
            </section>

            <!-- Stamp + รายการล่าสุด -->
            <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <!-- สะสมแก้ว -->
                <div class="bg-white border border-gray-200 rounded-2xl px-6 py-5">

                    <!-- Header -->
                    <div class="flex items-start justify-between">
                        <div>
                            <h3 class="text-lg font-bold text-gray-900">
                                ซื้อ 10 แก้ว ฟรี 1 แก้ว
                            </h3>

                            <p class="text-sm text-gray-400 mt-1">
                                ทุก 1 แก้ว รับ 1 แสตมป์
                            </p>
                        </div>

                        <div class="flex items-baseline gap-1">
                            <span class="text-2xl font-bold text-orange-500">
                                {{ stamps }}
                            </span>

                            <span class="text-sm text-gray-400">
                                / 10
                            </span>
                        </div>
                    </div>


                    <!-- Stamp -->
                    <div class="flex items-center gap-2 mt-5">
                        <div v-for="index in 10" :key="index" class="w-9 h-9 shrink-0 rounded-full
                       flex items-center justify-center
                       text-xs font-medium border-2" :class="index <= stamps
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : 'border-dashed border-gray-200 text-gray-300'
                        ">
                            <span v-if="index <= stamps">
                                <i class="fa-solid fa-mug-hot"></i>
                            </span>

                            <span v-else>
                                {{ index }}
                            </span>
                        </div>
                    </div>


                    <!-- Status -->
                    <p v-if="stamps < 10" class="text-sm text-gray-500 mt-5">
                        อีก
                        <span class="font-bold text-orange-500">
                            {{ 10 - stamps }} แก้ว
                        </span>
                        รับเครื่องดื่มฟรี
                    </p>

                    <button v-else class="mt-5 bg-black text-white
                   px-5 py-2 rounded-full text-sm">
                        ใช้สิทธิ์
                    </button>

                </div>


                <!-- รายการล่าสุด -->
                <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">

                    <!-- Header -->
                    <div class="px-6 py-5 flex items-start justify-between">
                        <div>
                            <h3 class="text-lg font-bold text-gray-900">
                                รายการล่าสุด
                            </h3>

                            <p class="text-sm text-gray-400 mt-1">
                                ประวัติการได้รับและใช้คะแนน
                            </p>
                        </div>

                        <button class="text-sm text-orange-500 hover:underline">
                            ดูทั้งหมด
                        </button>
                    </div>


                    <!-- History -->
                    <div class="px-6">

                        <div v-for="item in history.slice(0, 2)" :key="item.id" class="flex items-center justify-between
                       py-3 border-t border-gray-100">
                            <div>
                                <p class="text-sm font-medium text-gray-800">
                                    {{ item.title }}
                                </p>

                                <p class="text-xs text-gray-400 mt-0.5">
                                    {{ item.date }}
                                </p>
                            </div>

                            <span class="text-sm font-bold" :class="item.points > 0
                                ? 'text-green-600'
                                : 'text-red-500'
                                ">
                                {{ item.points > 0 ? '+' : '' }}
                                {{ item.points.toLocaleString() }}
                                คะแนน
                            </span>
                        </div>

                    </div>

                </div>

            </section>


            <section>
                <div class="flex items-end justify-between mb-5">
                    <div>
                        <h2 class="text-2xl font-bold">
                            แลกของรางวัล & ส่วนลด (Redeem Rewards)
                        </h2>
                        <p class="text-gray-500 mt-1">
                            ใช้คะแนนสะสมเพื่อแลกรับสิทธิพิเศษ
                        </p>
                    </div>

                    <button class="text-sm text-orange-500 hover:underline">
                        ดูทั้งหมด
                    </button>
                </div>

                <!-- Reward List -->
                <div class="space-y-4">
                    <div v-for="reward in rewards" :key="reward.id" class="relative flex items-center bg-white
             border border-gray-100 rounded-2xl
             shadow-sm overflow-hidden min-h-[130px]">
                        <!-- รอยเว้าด้านซ้าย -->
                        <div class="absolute -left-3 top-1/2 -translate-y-1/2
               w-6 h-6 bg-gray-100 rounded-full"></div>

                        <!-- รอยเว้าด้านขวา -->
                        <div class="absolute -right-3 top-1/2 -translate-y-1/2
               w-6 h-6 bg-gray-100 rounded-full"></div>


                        <!-- รูปของรางวัล -->
                        <div class="w-[150px] self-stretch
               flex items-center justify-center
               p-5">
                            <div class="w-20 h-20 rounded-full
                 bg-gray-100
                 flex items-center justify-center
                 overflow-hidden">
                                <img v-if="reward.image" :src="reward.image" :alt="reward.name"
                                    class="w-full h-full object-cover" />

                                <span v-else class="text-xs text-gray-400">
                                    รูป
                                </span>
                            </div>
                        </div>


                        <!-- เส้นแบ่ง -->
                        <div class="h-20 border-l border-dashed border-gray-300"></div>


                        <!-- รายละเอียด -->
                        <div class="flex-1 px-6 py-5">
                            <h3 class="text-lg font-bold text-orange-500">
                                {{ reward.name }}
                            </h3>

                            <p class="text-sm text-gray-500 mt-1">
                                {{ reward.description }}
                            </p>

                            <p class="text-xs text-gray-400 mt-3">
                                ใช้ได้ถึง {{ reward.expire }}
                            </p>
                        </div>


                        <!-- คะแนน + ปุ่ม -->
                        <div class="px-8 py-5 text-right">
                            <p class="text-sm text-gray-400">
                                ใช้คะแนน
                            </p>

                            <p class="text-xl font-bold text-gray-900">
                                {{ reward.points.toLocaleString() }}
                                <span class="text-sm font-normal">
                                    คะแนน
                                </span>
                            </p>

                            <button class="mt-3 bg-black text-white
                 px-6 py-2 rounded-full
                 text-sm font-medium
                 hover:bg-gray-800
                 transition">
                                แลกรางวัล
                            </button>
                        </div>
                    </div>
                </div>
            </section>

        </main>

    </div>
</template>


<script setup>
import { computed, ref } from 'vue'

const points = ref(2450)

const progress = computed(() => {
    return (points.value / 5000) * 100
})

const rewards = ref([
    {
        id: 1,
        name: 'เครื่องดื่มฟรี 1 แก้ว',
        description: 'รับเครื่องดื่มเมนูใดก็ได้ฟรี 1 แก้ว',
        points: 500,
        expire: '31 ธันวาคม 2569',
        image: ''
    },
    {
        id: 2,
        name: 'ส่วนลด 10%',
        description: 'รับส่วนลด 10% สำหรับการสั่งซื้อครั้งถัดไป',
        points: 800,
        expire: '31 ธันวาคม 2569',
        image: ''
    },
    {
        id: 3,
        name: 'ของหวานฟรี',
        description: 'แลกรับของหวานฟรี 1 รายการ',
        points: 1000,
        expire: '31 ธันวาคม 2569',
        image: ''
    }
])

const history = ref([
    {
        id: 1,
        title: 'ได้รับคะแนนจากการสั่งซื้อ',
        date: '30 ก.ย. 2569',
        points: 120
    },
    {
        id: 2,
        title: 'แลกเครื่องดื่มฟรี',
        date: '28 ก.ย. 2569',
        points: -500
    },
    {
        id: 3,
        title: 'ได้รับคะแนนจากการสั่งซื้อ',
        date: '25 ก.ย. 2569',
        points: 250
    }
])

const stamps = ref(9)

const stampProgress = computed(() => {
    return Math.min((stamps.value / 10) * 100, 100)
})
</script>