"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { lines, sectionList, stationSeed, stopReasonSeed } from "@/data/lines";

const STORAGE_KEYS = {
  lineOverrides: "jft-mes-line-overrides-v1",
  stopReasons: "jft-mes-stop-reasons-v1",
  lineStops: "jft-mes-line-stops-v1",
};

const DEFAULT_DASHBOARD_SWITCH_SECONDS = 10;

function cloneStations() {
  return stationSeed.map((item) => ({ ...item }));
}

function makeInitialLineStops() {
  return lines.reduce((acc, item) => {
    acc[item.slug] = cloneStations();
    return acc;
  }, {});
}

function readStorage(key, fallback) {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn(`Cannot read ${key} from localStorage`, error);
    return fallback;
  }
}

function usePersistentState(key, fallback) {
  const [value, setValue] = useState(fallback);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setValue(readStorage(key, fallback));
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!ready || typeof window === "undefined") return;

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Cannot save ${key} to localStorage`, error);
    }
  }, [key, ready, value]);

  return [value, setValue];
}

function parsePlanningHours(value) {
  if (value === null || value === undefined || value === "") return 0;
  const numeric = Number(String(value).replace(/hr|h/gi, "").trim());
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatPlanningHours(value) {
  const numeric = parsePlanningHours(value);
  const formatted = Number.isInteger(numeric)
    ? String(numeric)
    : numeric.toFixed(1).replace(/\.0$/, "");
  return `${formatted}H`;
}

function getReasonUsageMap(lineStops = []) {
  return lineStops.reduce((acc, station) => {
    if (!station.reason) return acc;
    const current = acc.get(station.reason) || [];
    current.push(station.label);
    acc.set(station.reason, current);
    return acc;
  }, new Map());
}

const emptyLineForm = {
  code: "",
  name: "",
  ip: "",
  plc: "Omron",
  order: "",
  dashboardSwitchSeconds: String(DEFAULT_DASHBOARD_SWITCH_SECONDS),
  active: false,
};

const emptyStopReasonForm = {
  code: "",
  name: "",
  color: "#ff0000",
  order: "",
  active: false,
};

function Icon({ name, className = "" }) {
  return <i className={`ti ${name} ${className}`} />;
}

function PageHeader({ icon, iconStyle, title, description, path, action }) {
  return (
    <div className="page-header">
      <div className="page-header-left">
        <div className="page-header-icon" style={iconStyle}>
          <Icon name={icon} />
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
        {/* {path ? (
          <div className="path-pill">
            <Icon name="ti-route" /> Path: <strong>{path}</strong>
          </div>
        ) : null} */}
      </div>
      {action}
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span className={`badge ${active ? "badge-green" : "badge-gray"}`}>
      {active ? "● Active" : "○ Inactive"}
    </span>
  );
}

function TopBar({ line, activeSection }) {
  const router = useRouter();

  const handleLineChange = (event) => {
    router.push(`/${event.target.value}/${activeSection}`);
  };

  return (
    <header className="topbar">
      <Link className="brand" href={`/${line.slug}/dashboard`}>
        <div className="brand-icon">
          <Icon name="ti-cpu-2" />
        </div>
        <div>
          <div className="brand-name">JFT-MES</div>
          <div className="brand-sub">Manufacturing Execution System</div>
        </div>
      </Link>

      <nav className="nav-tabs">
        <div className="nav-divider" />
        {sectionList.map((item, index) => (
          <div
            key={item.slug}
            style={{ display: "flex", alignItems: "center" }}
          >
            {index === 1 || index === 3 ? (
              <div className="nav-divider" />
            ) : null}
            <Link
              className={`nav-tab ${activeSection === item.slug ? "active" : ""}`}
              href={`/${line.slug}/${item.slug}`}
            >
              <Icon name={item.icon} />
              {item.label}
            </Link>
          </div>
        ))}
      </nav>

      <div className="topbar-right">
        <div className="line-select" title="Switch line path">
          <Icon name="ti-route" />
          <select value={line.slug} onChange={handleLineChange}>
            {lines.map((item) => (
              <option key={item.slug} value={item.slug}>
                /{item.slug} · {item.code}
              </option>
            ))}
          </select>
        </div>
        {/* <button className="icon-btn" title="Notifications" type="button">
          <Icon name="ti-bell" />
        </button> */}
        <button className="icon-btn" title="Settings" type="button">
          <Icon name="ti-settings" />
        </button>
        <div className="avatar" title="Admin">
          AD
        </div>
      </div>
    </header>
  );
}

function formatDashboardDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
  }).format(date);
}

function ProgressRing({ value, color, label, lines }) {
  const radius = 90;
  const circumference = 565;
  const offset =
    circumference - (Math.min(Math.max(value, 0), 120) / 100) * circumference;

  return (
    <div className="dashboard-ring-panel">
      <div className="dashboard-ring-wrap">
        <svg
          className="dashboard-ring"
          viewBox="0 0 200 200"
          aria-label={label}
        >
          <circle
            className="dashboard-ring-bg"
            strokeWidth="14"
            fill="transparent"
            r={radius}
            cx="100"
            cy="100"
          />
          <circle
            stroke={color}
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx="100"
            cy="100"
          />
        </svg>
        <div className="dashboard-ring-value">{value}%</div>
      </div>
      <div className="dashboard-ring-text">
        {lines.map((item) => (
          <p key={item}>{item}</p>
        ))}
        <h3>{label}</h3>
      </div>
    </div>
  );
}

function DashboardInfoRow({ label, value, valueClassName = "" }) {
  return (
    <div className="dashboard-info-row">
      <div className="dashboard-info-label">{label}</div>
      <div className={`dashboard-info-value ${valueClassName}`}>{value}</div>
    </div>
  );
}

function DashboardPage({ line }) {
  const [now, setNow] = useState(() => new Date());
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!line.partImageSrc) {
      setShowImage(false);
      return undefined;
    }

    const seconds = Math.max(
      1,
      Number(line.dashboardSwitchSeconds) || DEFAULT_DASHBOARD_SWITCH_SECONDS,
    );
    const timer = setInterval(() => {
      setShowImage((value) => !value);
    }, seconds * 1000);

    return () => clearInterval(timer);
  }, [line.dashboardSwitchSeconds, line.partImageSrc]);

  const planRate = Math.round(
    (line.actualQty / Math.max(line.planQty, 1)) * 100,
  );
  const productiveRate = Math.round(
    (line.productiveActual / Math.max(line.productiveTarget, 1)) * 100,
  );
  const switchSeconds = Math.max(
    1,
    Number(line.dashboardSwitchSeconds) || DEFAULT_DASHBOARD_SWITCH_SECONDS,
  );

  if (showImage && line.partImageSrc) {
    return (
      <div className="dashboard-page dashboard-image-page">
        <div className="dashboard-image-topline">
          <div>
            <h1>{line.dashboardTitle}</h1>
            {/* <p>{line.displayName} · Part Reference Image · Auto switch every {switchSeconds} sec.</p> */}
          </div>
          <div className="dashboard-clock">
            <div>{formatDashboardDate(now)}</div>
            <div>{now.toLocaleTimeString("en-GB", { hour12: false })}</div>
          </div>
        </div>
        <div className="dashboard-image-stage">
          <img src={line.partImageSrc} alt="uploaded part reference" />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-screen">
        <div className="dashboard-topline">
          <div>
            <h1>{line.dashboardTitle}</h1>
            {/* <p>{line.displayName} · Path /{line.slug}/dashboard</p> */}
          </div>
          <div className="dashboard-clock">
            <div>{formatDashboardDate(now)}</div>
            <div>{now.toLocaleTimeString("en-GB", { hour12: false })}</div>
          </div>
        </div>

        <div className="dashboard-main-grid">
          <div className="dashboard-left-grid">
            <div className="dashboard-product-row">
              <div className="dashboard-product-label">Product Code</div>
              <div className="dashboard-product-value">
                {line.productCode || line.currentPartCode}
              </div>
            </div>

            <DashboardInfoRow
              label="Operator Configuration (People)"
              value={line.operatorCount}
            />
            <DashboardInfoRow
              label="Production Start"
              value={line.productionStart}
            />
            <DashboardInfoRow
              label="Plan Quantity"
              value={line.planQty.toLocaleString()}
            />
            <DashboardInfoRow
              label="Production Completed"
              value={line.productionCompleted}
              valueClassName="muted"
            />
            <DashboardInfoRow
              label="Production Planning Time"
              value={formatPlanningHours(
                line.planningTimeHours ?? line.planningTime,
              )}
            />
            <DashboardInfoRow
              label="Actual Time Taken"
              value={line.actualTimeTaken}
            />
            <DashboardInfoRow
              label="Actual Quantity"
              value={line.actualQty.toLocaleString()}
            />
            <DashboardInfoRow label="Completion Rate" value="-- %" />
          </div>

          <div className="dashboard-right-grid">
            <ProgressRing
              value={planRate}
              color="#FF4500"
              label="Plan Achievement Rate"
              lines={[`Plan: ${line.planQty}`, `Actual: ${line.actualQty}`]}
            />
            <ProgressRing
              value={productiveRate}
              color="#32CD32"
              label="Productive Achievement Rate"
              lines={[
                `Target: ${line.productiveTarget}`,
                `Actual: ${line.productiveActual}`,
              ]}
            />
          </div>
        </div>

        <div className="dashboard-stop-strip">
          {line.stopSummary.map((item) => (
            <div key={item.name} className={`dashboard-stop-box ${item.color}`}>
              <span>{item.name}</span>
              <strong>{item.hours}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LineMaintenancePage({ line, onUpdateLine }) {
  const [lineRows, setLineRows] = useState(() =>
    lines.map((item) => ({
      code: item.code,
      name: item.name,
      ip: item.ipAddress,
      plc: item.plcBrand,
      order: String(item.displayOrder),
      dashboardSwitchSeconds: String(
        item.dashboardSwitchSeconds || DEFAULT_DASHBOARD_SWITCH_SECONDS,
      ),
      active: item.isActive,
    })),
  );
  const [editIndex, setEditIndex] = useState(-1);
  const [form, setForm] = useState(emptyLineForm);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    setLineRows((prev) =>
      prev.map((item) =>
        item.code === line.code
          ? {
              ...item,
              dashboardSwitchSeconds: String(
                line.dashboardSwitchSeconds || DEFAULT_DASHBOARD_SWITCH_SECONDS,
              ),
            }
          : item,
      ),
    );
  }, [line.code, line.dashboardSwitchSeconds]);

  const openAddForm = () => {
    setEditIndex(-1);
    setForm(emptyLineForm);
    setFormOpen(true);
  };

  const openEditForm = (index) => {
    setEditIndex(index);
    setForm({ ...lineRows[index] });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditIndex(-1);
    setForm(emptyLineForm);
  };

  const saveRow = () => {
    const code = form.code.trim();
    if (!code) {
      alert("Line Code is required.");
      return;
    }

    const switchSeconds = Math.max(
      1,
      Number(form.dashboardSwitchSeconds) || DEFAULT_DASHBOARD_SWITCH_SECONDS,
    );
    const nextRow = {
      ...form,
      code,
      name: form.name.trim(),
      ip: form.ip.trim(),
      order: String(form.order).trim(),
      dashboardSwitchSeconds: String(switchSeconds),
    };

    if (nextRow.code === line.code) {
      onUpdateLine({ dashboardSwitchSeconds: switchSeconds });
    }

    setLineRows((prev) => {
      if (editIndex >= 0) {
        return prev.map((item, index) =>
          index === editIndex ? nextRow : item,
        );
      }
      return [...prev, nextRow];
    });
    closeForm();
  };

  const deleteRow = (index) => {
    const target = lineRows[index];
    if (!target) return;
    const ok = confirm(`Delete line ${target.code}?`);
    if (!ok) return;
    setLineRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
    if (formOpen && editIndex === index) closeForm();
  };

  return (
    <div className="page">
      <PageHeader
        icon="ti-layout-list"
        title="Line Maintenance"
        description="Configure production lines, PLC connections, and display settings"
        path={`/${line.slug}/line-maintenance`}
        action={
          <button
            className="btn btn-primary"
            type="button"
            onClick={openAddForm}
          >
            <Icon name="ti-plus" /> Add New Line
          </button>
        }
      />

      <div className="card">
        <div className="card-header">
          <div className="card-header-left">
            <Icon name="ti-table" />
            <div>
              <div className="card-header-title">Production Lines</div>
              <div className="card-header-sub">
                {lineRows.length} line{lineRows.length !== 1 ? "s" : ""}{" "}
                configured
              </div>
            </div>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  <Icon name="ti-hash" /> Code
                </th>
                <th>
                  <Icon name="ti-tag" /> Line Name
                </th>
                <th>
                  <Icon name="ti-network" /> IP Address
                </th>
                <th>
                  <Icon name="ti-circuit-board" /> PLC Brand
                </th>
                <th>
                  <Icon name="ti-sort-ascending" /> Order
                </th>
                <th>
                  <Icon name="ti-clock" /> Switch Sec.
                </th>
                <th>
                  <Icon name="ti-activity" /> Status
                </th>
                <th aria-label="Action" />
              </tr>
            </thead>
            <tbody>
              {lineRows.length === 0 ? (
                <tr>
                  <td colSpan="8">
                    <div className="empty">
                      <div className="empty-icon">
                        <Icon name="ti-database-off" />
                      </div>
                      <p>No lines configured yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                lineRows.map((row, index) => (
                  <tr key={`${row.code}-${index}`}>
                    <td>
                      <strong>{row.code}</strong>
                    </td>
                    <td>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Icon name="ti-tag" />
                        {row.name || "—"}
                      </span>
                    </td>
                    <td>
                      <code className="ip">{row.ip || "—"}</code>
                    </td>
                    <td>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Icon name="ti-circuit-board" />
                        {row.plc}
                      </span>
                    </td>
                    <td>{row.order || "—"}</td>
                    <td>
                      {row.dashboardSwitchSeconds ||
                        DEFAULT_DASHBOARD_SWITCH_SECONDS}{" "}
                      sec.
                    </td>
                    <td>
                      <StatusBadge active={row.active} />
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="edit-btn"
                          type="button"
                          onClick={() => openEditForm(index)}
                        >
                          <Icon name="ti-pencil" /> Edit
                        </button>
                        <button
                          className="delete-btn"
                          type="button"
                          onClick={() => deleteRow(index)}
                        >
                          <Icon name="ti-trash" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {formOpen ? (
        <div
          className="modal-bg"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <div className="modal modal-wide">
            <div className="modal-header">
              <div>
                <div className="modal-title">
                  {editIndex >= 0 ? `Edit Line — ${form.code}` : "Add New Line"}
                </div>
                <div className="modal-sub">
                  Enter production line, PLC, and display configuration.
                </div>
              </div>
              <button className="modal-close" type="button" onClick={closeForm}>
                <Icon name="ti-x" />
              </button>
            </div>

            <div className="grid3">
              <div className="fg">
                <label>Line Code</label>
                <input
                  type="text"
                  value={form.code}
                  placeholder="e.g. ARM1"
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>
              <div className="fg">
                <label>Line Name</label>
                <input
                  type="text"
                  value={form.name}
                  placeholder="e.g. Assembly Line 1"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="fg">
                <label>IP Address</label>
                <input
                  type="text"
                  value={form.ip}
                  placeholder="192.168.1.100"
                  onChange={(e) => setForm({ ...form, ip: e.target.value })}
                />
              </div>
              <div className="fg">
                <label>PLC Brand</label>
                <select
                  value={form.plc}
                  onChange={(e) => setForm({ ...form, plc: e.target.value })}
                >
                  <option>Omron</option>
                  <option>Keyence</option>
                  {/* <option>Siemens</option>
                  <option>Allen Bradley</option>
                  <option>Schneider</option> */}
                </select>
              </div>
              <div className="fg">
                <label>Display Order</label>
                <input
                  type="text"
                  value={form.order}
                  placeholder="1"
                  onChange={(e) => setForm({ ...form, order: e.target.value })}
                />
              </div>
              <div className="fg">
                <label>Dashboard Switch Time (sec.)</label>
                <input
                  type="number"
                  min="1"
                  value={form.dashboardSwitchSeconds}
                  placeholder="10"
                  onChange={(e) =>
                    setForm({ ...form, dashboardSwitchSeconds: e.target.value })
                  }
                />
              </div>
              <div className="fg">
                <label>Active Status</label>
                <div className="toggle-row">
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) =>
                        setForm({ ...form, active: e.target.checked })
                      }
                    />
                    <span className="tsl" />
                  </label>
                  <span style={{ fontSize: 13, color: "var(--text2)" }}>
                    {form.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-actions split-actions">
              <div className="row-actions">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={saveRow}
                >
                  <Icon name="ti-device-floppy" />
                  Save Line
                </button>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={closeForm}
                >
                  <Icon name="ti-x" />
                  Cancel
                </button>
              </div>
              {editIndex >= 0 ? (
                <button
                  className="btn btn-danger"
                  type="button"
                  onClick={() => deleteRow(editIndex)}
                >
                  <Icon name="ti-trash" />
                  Delete
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StopReasonMaintenancePage({
  line,
  stopReasons,
  setStopReasons,
  lineStops,
}) {
  const [editIndex, setEditIndex] = useState(-1);
  const [form, setForm] = useState(emptyStopReasonForm);
  const [formOpen, setFormOpen] = useState(false);
  const reasonUsageMap = useMemo(
    () => getReasonUsageMap(lineStops),
    [lineStops],
  );
  const displayStopReasons = useMemo(() => {
    const knownNames = new Set(stopReasons.map((item) => item.name));
    const dynamicReasons = Array.from(reasonUsageMap.keys())
      .filter((reason) => !knownNames.has(reason))
      .map((reason, index) => ({
        code: `AUTO-${index + 1}`,
        name: reason,
        order: "—",
        active: true,
        isDynamic: true,
      }));

    return [...stopReasons, ...dynamicReasons];
  }, [reasonUsageMap, stopReasons]);

  const openAddForm = () => {
    setEditIndex(-1);
    setForm(emptyStopReasonForm);
    setFormOpen(true);
  };

  const openEditForm = (index) => {
    setEditIndex(index);
    setForm({ ...stopReasons[index] });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditIndex(-1);
    setForm(emptyStopReasonForm);
  };

  const saveRow = () => {
    const code = form.code.trim();
    if (!code) {
      alert("Stop Reason Code is required.");
      return;
    }

    const nextRow = {
      ...form,
      code,
      name: form.name.trim(),
      color: form.color || "#cccccc",
      order: String(form.order).trim(),
    };

    setStopReasons((prev) => {
      if (editIndex >= 0) {
        return prev.map((item, index) =>
          index === editIndex ? nextRow : item,
        );
      }
      return [...prev, nextRow];
    });
    closeForm();
  };

  const deleteRow = (index) => {
    const target = stopReasons[index];
    if (!target) return;
    const ok = confirm(`Delete stop reason ${target.code}?`);
    if (!ok) return;
    setStopReasons((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
    if (formOpen && editIndex === index) closeForm();
  };

  return (
    <div className="page">
      <PageHeader
        icon="ti-alert-triangle"
        iconStyle={{ background: "#fff7ed", color: "var(--warn)" }}
        title="Stop Reason Maintenance"
        description="Define and manage production stop reason codes"
        path={`/${line.slug}/stop-reason-maintenance`}
        action={
          <button
            className="btn btn-primary"
            type="button"
            onClick={openAddForm}
          >
            <Icon name="ti-plus" /> Add Stop Reason
          </button>
        }
      />

      <div className="card">
        <div className="card-header">
          <div className="card-header-left">
            <Icon name="ti-list-details" />
            <div>
              <div className="card-header-title">Stop Reason Codes</div>
              <div className="card-header-sub">
                {displayStopReasons.length} reason
                {displayStopReasons.length !== 1 ? "s" : ""} defined
              </div>
            </div>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  <Icon name="ti-hash" /> Code
                </th>
                <th>
                  <Icon name="ti-file-description" /> Stop Reason Name
                </th>
                <th>
                  <Icon name="ti-palette" /> Color
                </th>
                <th>
                  <Icon name="ti-sort-ascending" /> Display Order
                </th>
                <th>
                  <Icon name="ti-activity" /> Status
                </th>
                <th aria-label="Action" />
              </tr>
            </thead>
            <tbody>
              {displayStopReasons.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty">
                      <div className="empty-icon">
                        <Icon name="ti-alert-circle" />
                      </div>
                      <p>No stop reasons defined yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayStopReasons.map((row, index) => {
                  const usages = reasonUsageMap.get(row.name) || [];
                  return (
                    <tr key={`${row.code}-${index}`}>
                      <td>
                        <span className="badge badge-orange">{row.code}</span>
                      </td>
                      <td>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Icon name="ti-alert-triangle" />
                          {row.name || "—"}
                        </span>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <div
                            style={{
                              width: "24px",
                              height: "24px",
                              backgroundColor: row.color || "#cccccc",
                              borderRadius: "4px",
                              border: "1px solid var(--border)",
                            }}
                          />
                          <span
                            style={{
                              fontFamily: "monospace",
                              textTransform: "uppercase",
                            }}
                          >
                            {row.color || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td>{row.order || "—"}</td>
                      <td>
                        <StatusBadge active={row.active} />
                      </td>
                      <td>
                        {row.isDynamic ? (
                          <span className="badge badge-blue">
                            Auto from Line Stop
                          </span>
                        ) : (
                          <div className="row-actions">
                            <button
                              className="edit-btn"
                              type="button"
                              onClick={() => openEditForm(index)}
                            >
                              <Icon name="ti-pencil" /> Edit
                            </button>
                            <button
                              className="delete-btn"
                              type="button"
                              onClick={() => deleteRow(index)}
                            >
                              <Icon name="ti-trash" /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {formOpen ? (
        <div
          className="modal-bg"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <div className="modal modal-wide">
            <div className="modal-header">
              <div>
                <div className="modal-title">
                  {editIndex >= 0
                    ? `Edit Stop Reason — ${form.code}`
                    : "Add Stop Reason"}
                </div>
                <div className="modal-sub">
                  Maintain stop reason code, name, display order, and active
                  status.
                </div>
              </div>
              <button className="modal-close" type="button" onClick={closeForm}>
                <Icon name="ti-x" />
              </button>
            </div>

            <div className="grid3">
              <div className="fg">
                <label>Stop Reason Code</label>
                <input
                  type="text"
                  value={form.code}
                  placeholder="e.g. SR001"
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>
              <div className="fg">
                <label>Stop Reason Name</label>
                <input
                  type="text"
                  value={form.name}
                  placeholder="e.g. Machine Breakdown"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="fg">
                <label>Display Order</label>
                <input
                  type="text"
                  value={form.order}
                  placeholder="1"
                  onChange={(e) => setForm({ ...form, order: e.target.value })}
                />
              </div>
              <div className="fg">
                <label>Color</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="color"
                    value={form.color || "#CC539A"}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    style={{
                      width: "42px",
                      height: "42px",
                      padding: "2px",
                      border: "1.5px solid var(--border)",
                      borderRadius: "var(--r-sm)",
                      cursor: "pointer",
                      background: "var(--surface)",
                    }}
                  />
                  <input
                    type="text"
                    value={form.color || ""}
                    placeholder="#CC539A"
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    style={{
                      flex: 1,
                      fontFamily: "monospace",
                      fontSize: "15px",
                      textTransform: "uppercase",
                      padding: "8px 12px",
                      border: "1.5px solid var(--border)",
                      borderRadius: "var(--r-sm)",
                      outline: "none",
                      background: "var(--surface)",
                    }}
                  />
                </div>
              </div>
              <div className="fg">
                <label>Active Status</label>
                <div className="toggle-row">
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) =>
                        setForm({ ...form, active: e.target.checked })
                      }
                    />
                    <span className="tsl" />
                  </label>
                  <span style={{ fontSize: 13, color: "var(--text2)" }}>
                    {form.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-actions split-actions">
              <div className="row-actions">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={saveRow}
                >
                  <Icon name="ti-device-floppy" />
                  Save
                </button>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={closeForm}
                >
                  <Icon name="ti-x" />
                  Cancel
                </button>
              </div>
              {editIndex >= 0 ? (
                <button
                  className="btn btn-danger"
                  type="button"
                  onClick={() => deleteRow(editIndex)}
                >
                  <Icon name="ti-trash" />
                  Delete
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProductionUpdatePage({ line, onUpdateLine }) {
  const [operatorCount, setOperatorCount] = useState(line.operatorCount || 0);
  const [planningHours, setPlanningHours] = useState(
    parsePlanningHours(line.planningTimeHours ?? line.planningTime),
  );
  const [imageSrc, setImageSrc] = useState(line.partImageSrc || "");
  const [saved, setSaved] = useState(false);
  const progress = Math.min(
    100,
    Math.round((line.actualQty / Math.max(line.planQty, 1)) * 100),
  );

  useEffect(() => {
    setOperatorCount(line.operatorCount || 0);
    setPlanningHours(
      parsePlanningHours(line.planningTimeHours ?? line.planningTime),
    );
    setImageSrc(line.partImageSrc || "");
  }, [
    line.operatorCount,
    line.planningTime,
    line.planningTimeHours,
    line.partImageSrc,
  ]);

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (result) => {
      const nextImageSrc = String(result.target?.result || "");
      setImageSrc(nextImageSrc);
      onUpdateLine({ partImageSrc: nextImageSrc });
    };
    reader.readAsDataURL(file);
  };

  const saveProductionInfo = () => {
    onUpdateLine({
      operatorCount,
      planningTimeHours: parsePlanningHours(planningHours),
      partImageSrc: imageSrc,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div className="page">
      <PageHeader
        icon="ti-chart-bar-popular"
        iconStyle={{ background: "#f0fdf4", color: "var(--success)" }}
        title="Production Update"
        description={`Line ${line.code} · Monitor live production progress and operator status`}
        path={`/${line.slug}/line-production-update`}
      />

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-icon">
            <Icon name="ti-cpu-2" />
          </div>
          <div className="stat-label">Line Name</div>
          <div className="stat-value" style={{ color: "var(--accent)" }}>
            {line.name}
          </div>
          <div className="stat-sub">{line.displayName}</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">
            <Icon name="ti-calendar-event" />
          </div>
          <div className="stat-label">Production Date</div>
          <div className="stat-value" style={{ fontSize: 17 }}>
            {line.productionDate}
          </div>
          <div className="stat-sub">Morning shift</div>
        </div>
        <div className="stat-card warn">
          <div className="stat-icon">
            <Icon name="ti-barcode" />
          </div>
          <div className="stat-label">Current Part Code</div>
          <div
            className="stat-value"
            style={{ fontSize: 16, color: "var(--warn)" }}
          >
            {line.currentPartCode}
          </div>
          <div className="stat-sub">Active part</div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">
            <Icon name="ti-box" />
          </div>
          <div className="stat-label">Actual / Plan Qty</div>
          <div className="stat-value">
            <span style={{ color: "var(--success)" }}>{line.actualQty}</span>
            <span style={{ fontSize: 15, color: "var(--text3)" }}>
              {" "}
              / {line.planQty}
            </span>
          </div>
          <div className="prog-bg">
            <div className="prog-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="stat-sub" style={{ marginTop: 6 }}>
            {progress}% complete
          </div>
        </div>
      </div>

      <div className="prod-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-header-left">
              <Icon name="ti-photo" />
              <div>
                <div className="card-header-title">Part Reference Image</div>
                <div className="card-header-sub">
                  Upload the current part image
                </div>
              </div>
            </div>
          </div>
          <div className="card-body">
            <label
              className={`img-drop ${imageSrc ? "has-img" : ""}`}
              htmlFor="partImageFile"
            >
              {imageSrc ? (
                <img src={imageSrc} alt="part reference" />
              ) : (
                <>
                  <div className="img-drop-icon">
                    <Icon name="ti-cloud-upload" />
                  </div>
                  <p>Click or drag to upload image</p>
                  <span>PNG, JPG up to 10MB</span>
                </>
              )}
            </label>
            <input
              id="partImageFile"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImage}
            />
            <label className="upload-strip" htmlFor="partImageFile">
              <Icon name="ti-upload" /> Upload Image
            </label>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-header-left">
              <Icon name="ti-users" />
              <div>
                <div className="card-header-title">Shift & Operator Info</div>
                <div className="card-header-sub">
                  Update operator count for this shift
                </div>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="info-tiles">
              <div className="info-tile">
                <div className="lbl">
                  <Icon name="ti-clock" /> Shift
                </div>
                <div className="val">{line.shift}</div>
              </div>
              <div className="info-tile">
                <div className="lbl">
                  <Icon name="ti-user-shield" /> Supervisor
                </div>
                <div className="val">{line.supervisor}</div>
              </div>
              <div className="info-tile">
                <div className="lbl">
                  <Icon name="ti-circuit-board" /> PLC Brand
                </div>
                <div className="val">{line.plcBrand}</div>
              </div>
              <div className="info-tile">
                <div className="lbl">
                  <Icon name="ti-activity" /> Line Status
                </div>
                <div className="val" style={{ color: "var(--success)" }}>
                  <Icon name="ti-circle-filled" /> Running
                </div>
              </div>
            </div>
            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: 18,
                marginTop: 4,
              }}
            >
              <div className="fg" style={{ marginBottom: 10 }}>
                <label>
                  <Icon name="ti-users" /> Operator Count
                </label>
              </div>
              <div className="op-counter">
                <button
                  className="counter-btn"
                  type="button"
                  onClick={() =>
                    setOperatorCount((value) => Math.max(0, value - 1))
                  }
                >
                  <Icon name="ti-minus" />
                </button>
                <input
                  className="counter-input"
                  type="number"
                  value={operatorCount}
                  onChange={(e) =>
                    setOperatorCount(Math.max(0, Number(e.target.value) || 0))
                  }
                />
                <button
                  className="counter-btn"
                  type="button"
                  onClick={() => setOperatorCount((value) => value + 1)}
                >
                  <Icon name="ti-plus" />
                </button>
                <span
                  style={{ fontSize: 13, color: "var(--text3)", marginLeft: 4 }}
                >
                  operators on duty
                </span>
              </div>

              {/* <div className="planning-time-control">
                <div className="fg">
                  <label>
                    <Icon name="ti-clock-hour-4" /> Production Planning Time
                  </label>
                </div>
                <div className="planning-time-row">
                  <input
                    className="counter-input planning-time-input"
                    type="number"
                    step="0.1"
                    min="0"
                    value={planningHours}
                    onChange={(e) => setPlanningHours(e.target.value)}
                  />
                  <span>Hr.</span>
                </div>
              </div> */}

              <button
                className="btn btn-primary"
                style={
                  saved
                    ? { marginTop: 16, background: "var(--success)" }
                    : { marginTop: 16 }
                }
                type="button"
                onClick={saveProductionInfo}
              >
                <Icon name={saved ? "ti-check" : "ti-device-floppy"} />{" "}
                {saved ? "Dashboard Updated!" : "Save Production Info"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LineStopUpdatePage({ line, stopReasons, stops = [], setStops }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");

  const activeStopCount = stops.filter((item) => item.reason).length;
  const progress = Math.min(
    100,
    Math.round((line.actualQty / Math.max(line.planQty, 1)) * 100),
  );
  const activeReasons = useMemo(
    () =>
      stopReasons
        .filter((item) => item.active)
        .map((item) => item.name)
        .filter(Boolean),
    [stopReasons],
  );

  const openModal = (index) => {
    setSelectedIndex(index);
    setSelectedReason(stops[index].reason || "");
  };

  const closeModal = () => {
    setSelectedIndex(null);
    setSelectedReason("");
  };

  const stopStation = () => {
    if (selectedIndex === null) return;
    if (!selectedReason) {
      alert("Please select a stop reason before stopping the line.");
      return;
    }
    setStops((prev) =>
      prev.map((item, index) =>
        index === selectedIndex ? { ...item, reason: selectedReason } : item,
      ),
    );
    closeModal();
  };

  const startStation = (index) => {
    const target = stops[index];
    if (!target?.reason) return;
    const ok = confirm(`Start ${target.label}?`);
    if (!ok) return;
    setStops((prev) =>
      prev.map((item, rowIndex) =>
        rowIndex === index ? { ...item, reason: "" } : item,
      ),
    );
    if (selectedIndex === index) closeModal();
  };

  const selectedStop = selectedIndex === null ? null : stops[selectedIndex];
  const selectedStopped = Boolean(selectedStop?.reason);

  return (
    <div className="page">
      <PageHeader
        icon="ti-player-stop-filled"
        iconStyle={{ background: "#fef2f2", color: "var(--danger)" }}
        title="Line Stop Update"
        description={`${line.code} · Stop a station with reason, then Start again after recovery`}
        path={`/${line.slug}/line-stop-update`}
      />

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-icon">
            <Icon name="ti-cpu-2" />
          </div>
          <div className="stat-label">Line</div>
          <div className="stat-value" style={{ color: "var(--accent)" }}>
            {line.name}
          </div>
        </div>
        <div className="stat-card warn">
          <div className="stat-icon">
            <Icon name="ti-barcode" />
          </div>
          <div className="stat-label">Part Code</div>
          <div
            className="stat-value"
            style={{ fontSize: 16, color: "var(--warn)" }}
          >
            {line.currentPartCode}
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">
            <Icon name="ti-box" />
          </div>
          <div className="stat-label">Actual / Plan</div>
          <div className="stat-value">
            <span style={{ color: "var(--success)" }}>{line.actualQty}</span>
            <span style={{ fontSize: 15, color: "var(--text3)" }}>
              {" "}
              / {line.planQty}
            </span>
          </div>
          <div className="prog-bg">
            <div className="prog-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
        {/* <div className="stat-card">
          <div className="stat-icon">
            <Icon name="ti-player-stop-filled" />
          </div>
          <div className="stat-label">Active Stops</div>
          <div className="stat-value" style={{ color: "var(--danger)" }}>
            {activeStopCount}
          </div>
          <div className="stat-sub">of {stops.length} stations</div>
        </div> */}
      </div>

      <div className="stop-grid">
        {stops.map((station, index) => {
          const stopped = Boolean(station.reason);

          // ค้นหาสีจากเหตุผลที่ถูกเลือก
          const activeReason = stopReasons.find(
            (r) => r.name === station.reason,
          );
          const reasonColor = activeReason?.color || "var(--danger)";

          return (
            <div
              key={station.label}
              className={`stop-card ${stopped ? "stopped" : ""}`}
              style={
                stopped
                  ? {
                      "--danger": reasonColor, // เพื่อ override ขอบด้านบน (::after) แบบไดนามิก
                      borderColor: reasonColor,
                      backgroundColor: `${reasonColor}0C`, // เพิ่มแสงสีจางๆ ให้พื้นหลัง
                    }
                  : {}
              }
            >
              <div className="stop-card-head">
                <span className="stop-num">
                  <Icon name={station.icon} />
                  {station.label}
                </span>
                <span
                  className={`status-dot ${stopped ? "on" : ""}`}
                  style={
                    stopped
                      ? {
                          background: reasonColor,
                          boxShadow: `0 0 0 3px ${reasonColor}33`,
                        }
                      : {}
                  }
                />
              </div>
              <div className="stop-name">{stopped ? "Stopped" : "Running"}</div>
              <div style={{ fontSize: 12, color: "var(--text3)" }}>
                {station.sub}
              </div>
              {stopped ? (
                <div
                  className="stop-reason-text"
                  style={{ color: reasonColor, fontWeight: 700 }}
                >
                  <Icon name="ti-alert-circle" />
                  {station.reason}
                </div>
              ) : (
                <div className="stop-idle">No active stop event</div>
              )}
              <div className="stop-card-actions">
                {stopped ? (
                  <>
                    <button
                      className="btn btn-primary btn-sm"
                      type="button"
                      onClick={() => startStation(index)}
                    >
                      <Icon name="ti-player-play-filled" /> Start
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      type="button"
                      onClick={() => openModal(index)}
                    >
                      <Icon name="ti-pencil" /> Edit Reason
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-danger btn-sm"
                    type="button"
                    onClick={() => openModal(index)}
                  >
                    <Icon name="ti-player-stop-filled" /> Stop
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedStop ? (
        <div
          className="modal-bg"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div>
                <div className="modal-title">
                  {selectedStopped ? "Update Stop Event" : "Record Stop Event"}{" "}
                  — {selectedStop.label}
                </div>
                <div className="modal-sub">
                  {selectedStop.sub} ·{" "}
                  {selectedStopped
                    ? "Update reason or Start the station"
                    : "Select reason before stopping"}
                </div>
              </div>
              <button
                className="modal-close"
                type="button"
                onClick={closeModal}
              >
                <Icon name="ti-x" />
              </button>
            </div>
            <div className="fg" style={{ marginBottom: 4 }}>
              <label>
                <Icon name="ti-alert-triangle" /> Stop Reason
              </label>
              <select
                value={selectedReason}
                onChange={(event) => setSelectedReason(event.target.value)}
              >
                <option value="">— Select stop reason —</option>
                {activeReasons.map((reason) => (
                  <option key={reason}>{reason}</option>
                ))}
                <option>Other</option>
              </select>
            </div>
            <div className="modal-actions split-actions">
              <div className="row-actions">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={stopStation}
                >
                  <Icon name="ti-check" />{" "}
                  {selectedStopped ? "Update Reason" : "Stop Line"}
                </button>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={closeModal}
                >
                  <Icon name="ti-x" />
                  Cancel
                </button>
              </div>
              {selectedStopped ? (
                <button
                  className="btn btn-success"
                  type="button"
                  onClick={() => startStation(selectedIndex)}
                >
                  <Icon name="ti-player-play-filled" />
                  Start Line
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function MesShell({ line, activeSection }) {
  const [stopReasons, setStopReasons] = usePersistentState(
    STORAGE_KEYS.stopReasons,
    stopReasonSeed,
  );
  const [lineOverrides, setLineOverrides] = usePersistentState(
    STORAGE_KEYS.lineOverrides,
    {},
  );
  const [lineStopsBySlug, setLineStopsBySlug] = usePersistentState(
    STORAGE_KEYS.lineStops,
    makeInitialLineStops(),
  );

  const liveLine = useMemo(
    () => ({
      ...line,
      ...(lineOverrides[line.slug] || {}),
    }),
    [line, lineOverrides],
  );

  const currentLineStops = lineStopsBySlug[line.slug] || cloneStations();

  const updateCurrentLine = (patch) => {
    setLineOverrides((prev) => ({
      ...prev,
      [line.slug]: {
        ...(prev[line.slug] || {}),
        ...patch,
      },
    }));
  };

  const updateCurrentLineStops = (updater) => {
    setLineStopsBySlug((prev) => {
      const previousStops = prev[line.slug] || cloneStations();
      const nextStops =
        typeof updater === "function" ? updater(previousStops) : updater;

      return {
        ...prev,
        [line.slug]: nextStops,
      };
    });
  };

  return (
    <>
      {activeSection !== "dashboard" ? (
        <TopBar line={liveLine} activeSection={activeSection} />
      ) : null}
      <main
        className={
          activeSection === "dashboard" ? "pages dashboard-pages" : "pages"
        }
      >
        {activeSection === "dashboard" ? (
          <DashboardPage line={liveLine} />
        ) : null}
        {activeSection === "line-maintenance" ? (
          <LineMaintenancePage
            line={liveLine}
            onUpdateLine={updateCurrentLine}
          />
        ) : null}
        {activeSection === "stop-reason-maintenance" ? (
          <StopReasonMaintenancePage
            line={liveLine}
            stopReasons={stopReasons}
            setStopReasons={setStopReasons}
            lineStops={currentLineStops}
          />
        ) : null}
        {activeSection === "line-production-update" ? (
          <ProductionUpdatePage
            line={liveLine}
            onUpdateLine={updateCurrentLine}
          />
        ) : null}
        {activeSection === "line-stop-update" ? (
          <LineStopUpdatePage
            line={liveLine}
            stopReasons={stopReasons}
            stops={currentLineStops}
            setStops={updateCurrentLineStops}
          />
        ) : null}
      </main>
    </>
  );
}
