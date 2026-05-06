export const sectionList = [
  {
    slug: "dashboard",
    label: "Dashboard",
    shortLabel: "Line Dashboard",
    icon: "ti-dashboard",
  },
  {
    slug: "line-maintenance",
    label: "Line Maintenance",
    shortLabel: "Line Maintenance",
    icon: "ti-layout-list",
  },
  {
    slug: "stop-reason-maintenance",
    label: "Stop Reason",
    shortLabel: "Stop Reason Maintenance",
    icon: "ti-alert-triangle",
  },
  {
    slug: "line-production-update",
    label: "Production Update",
    shortLabel: "Line Production Update",
    icon: "ti-chart-bar-popular",
  },
  {
    slug: "line-stop-update",
    label: "Line Stop Update",
    shortLabel: "Line Stop Update",
    icon: "ti-player-stop-filled",
  },
];

export const lines = [
  {
    slug: "ARM1",
    code: "ARM1",
    name: "ARM1",
    displayName: "Assembly Line 1",
    ipAddress: "192.168.1.101",
    plcBrand: "Omron",
    displayOrder: 1,
    isActive: true,
    dashboardSwitchSeconds: 10,
    productionDate: "2026-05-06",
    currentPartCode: "8978348640",
    planQty: 500,
    actualQty: 120,
    operatorCount: 4,
    shift: "Morning 06:00–14:00",
    supervisor: "Somchai W.",
    // dashboardTitle: "X2 MAIN LINE PRODUCTION",
    // productCode: "69830-0A140",
    dashboardTitle: "ARM1 PRODUCTION",
    productCode: "ARM1",
    productionStart: "13:50",
    productionCompleted: "00:00",
    planningTime: "4.9H",
    actualTimeTaken: "1.1H",
    productiveTarget: 245,
    productiveActual: 256,
    stopSummary: [
      { name: "Machine Malfunction", hours: "0H", color: "pink" },
      { name: "Change the Mold", hours: "0.2H", color: "cyan" },
      { name: "Abnormal Material", hours: "0H", color: "blue" },
      { name: "Quality Anomaly", hours: "0H", color: "yellow" },
    ],
  },
  {
    slug: "ARM2",
    code: "ARM2",
    name: "ARM2",
    displayName: "Assembly Line 2",
    ipAddress: "192.168.1.102",
    plcBrand: "Omron",
    displayOrder: 2,
    isActive: true,
    dashboardSwitchSeconds: 10,
    productionDate: "2026-05-06",
    currentPartCode: "8978348650",
    planQty: 450,
    actualQty: 210,
    operatorCount: 5,
    shift: "Morning 06:00–14:00",
    supervisor: "Suda K.",
    dashboardTitle: "ARM2 PRODUCTION",
    productCode: "ARM2",
    productionStart: "14:20",
    productionCompleted: "00:00",
    planningTime: "5.2H",
    actualTimeTaken: "2.0H",
    productiveTarget: 220,
    productiveActual: 214,
    stopSummary: [
      { name: "Machine Malfunction", hours: "0.3H", color: "pink" },
      { name: "Change the Mold", hours: "0H", color: "cyan" },
      { name: "Abnormal Material", hours: "0.1H", color: "blue" },
      { name: "Quality Anomaly", hours: "0H", color: "yellow" },
    ],
  },
];

export const stopReasonSeed = [
  {
    code: "ST1",
    name: "Machine Malfunction",
    order: 1,
    active: true,
    color: "#CC539A",
  },
  {
    code: "ST2",
    name: "Change the Mold",
    order: 2,
    active: true,
    color: "#00A5B1",
  },
  {
    code: "ST3",
    name: "Abnormal Material",
    order: 3,
    active: true,
    color: "#3554BF",
  },
  {
    code: "ST4",
    name: "Quality Anomaly",
    order: 4,
    active: true,
    color: "#ffd700db",
  },
];

// export const stationSeed = [
//   { label: "Station 1", sub: "Pre-Assembly", icon: "ti-tools", reason: "" },
//   { label: "Station 2", sub: "Main Assembly", icon: "ti-settings", reason: "" },
//   { label: "Station 3", sub: "Welding", icon: "ti-flame", reason: "" },
//   { label: "Station 4", sub: "Inspection", icon: "ti-eye", reason: "" },
// ];

export const stationSeed = [
  { reason: "" },
  { reason: "" },
  { reason: "" },
  { reason: "" },
];

export function getLineBySlug(slug) {
  return lines.find((item) => item.slug === slug);
}
