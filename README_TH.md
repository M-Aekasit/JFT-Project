# JFT-MES Next.js Prototype

โปรเจกต์นี้เป็น Next.js + React JavaScript สำหรับ JFT-MES แยกหน้าตาม path ของแต่ละ line

## Run

```bash
npm install
npm run dev
```

## Main Paths

```text
/ARM1/dashboard
/ARM2/dashboard

/ARM1/line-maintenance
/ARM1/stop-reason-maintenance
/ARM1/line-production-update
/ARM1/line-stop-update

/ARM2/line-maintenance
/ARM2/stop-reason-maintenance
/ARM2/line-production-update
/ARM2/line-stop-update
```

## Update ล่าสุด

- Dashboard แสดงแบบเต็มจอ ไม่มี Navigation Bar
- Dashboard สลับระหว่างหน้าข้อมูล Production กับรูป Part Reference ที่อัปโหลดจากหน้า Production Update
- Line Maintenance เพิ่มช่อง Dashboard Switch Time หน่วยวินาที เพื่อกำหนดเวลาสลับหน้าบน Dashboard
- Production Update อัปโหลดรูปแล้วบันทึกไปที่ Dashboard ของ Line นั้น
- Production Update บันทึก Operator Count และ Production Planning Time ไปอัปเดต Dashboard
- Stop Reason Maintenance มี Column Reason สำหรับแสดง Reason ที่ถูกใช้งานจาก Line Stop Update
- Line Stop Update สามารถ Stop พร้อมเลือก Reason และ Start กลับเป็น Running ได้
- Add/Edit แสดงเป็น Popup และ Delete มี Confirm ก่อนลบ

## แก้ข้อมูล Mock

```text
data/lines.js
```
