export const initialStock = [
  { id: 'ST-001', name: 'เมล็ดกาแฟ House Blend', category: 'วัตถุดิบ', quantity: 12, minimum: 5, unit: 'ถุง', price: 350 },
  { id: 'ST-002', name: 'นมสด', category: 'วัตถุดิบ', quantity: 4, minimum: 8, unit: 'ขวด', price: 85 },
  { id: 'ST-003', name: 'ไซรัปวานิลลา', category: 'วัตถุดิบ', quantity: 0, minimum: 3, unit: 'ขวด', price: 220 },
  { id: 'ST-004', name: 'แก้วเย็น 16 ออนซ์', category: 'บรรจุภัณฑ์', quantity: 240, minimum: 100, unit: 'ใบ', price: 3 },
  { id: 'ST-005', name: 'ครัวซองต์', category: 'เบเกอรี', quantity: 18, minimum: 6, unit: 'ชิ้น', price: 45 },
]

export const initialPromotions = [
  { id: 'PM-001', name: 'Coffee Happy Hour', product: 'เครื่องดื่มทุกเมนู', type: 'percent', discount: 10, price: 100, start: '2026-09-01', end: '2026-12-31', enabled: true },
  { id: 'PM-002', name: 'หวานคู่กาแฟ', product: 'ชุดกาแฟและครัวซองต์', type: 'amount', discount: 25, price: 150, start: '2026-09-01', end: '2026-12-31', enabled: true },
  { id: 'PM-003', name: 'Weekend Special', product: 'เครื่องดื่มเมนูพิเศษ', type: 'percent', discount: 15, price: 120, start: '2026-10-01', end: '2026-10-31', enabled: false },
]
