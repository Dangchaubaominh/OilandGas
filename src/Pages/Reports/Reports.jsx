import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaDownload,
  FaPlus,
  FaSearch,
  FaSyncAlt,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { jsPDF } from "jspdf";
import reportsApi from "../../services/reportsApi";
import { showToast } from "../../utils/toastHandler";
import ReportsModal from "./ReportsModal";

const REPORT_TYPES = [
  "kpi",
  "maintenance",
  "incident",
  "sensor",
  "equipment",
  "custom",
];
const REPORT_STATUSES = [
  "pending",
  "generating",
  "completed",
  "failed",
  "cancelled",
];
const REPORT_CATEGORIES = [
  "operational",
  "technical",
  "safety",
  "environmental",
  "financial",
  "regulatory",
];
const REPORT_FORMATS = ["pdf", "csv"];
const REPORT_TEMPLATES = ["standard", "executive", "detailed"];
const DEFAULT_LIMIT = 10;

const formatLabel = (value = "") =>
  value.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const getToday = () => new Date().toISOString().slice(0, 10);

const getMonthStart = () => {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  return monthStart.toISOString().slice(0, 10);
};

const getResponsePayload = (response) =>
  response?.data?.data ?? response?.data ?? {};

const getReportIdentifier = (report) =>
  report?._id ||
  report?.id ||
  report?.reportId ||
  report?.reportCode ||
  report?.code;

const normalizeReport = (report = {}) => {
  const fileInfo = report.fileInfo || {};
  const status = (report.status || "pending").toLowerCase();

  return {
    ...report,
    _reportId: getReportIdentifier(report),
    title: report.title || report.name || "Untitled report",
    type: (report.type || "custom").toLowerCase(),
    category: (report.category || "technical").toLowerCase(),
    status,
    description:
      report.description || report.summary || "No description provided.",
    createdAt:
      report.createdAt || report.generatedAt || report.updatedAt || null,
    progress: typeof report.progress === "number" ? report.progress : null,
    canDownload: Boolean(
      report.canDownload ?? report.isReady ?? status === "completed",
    ),
    fileInfo: {
      fileName: fileInfo.fileName || report.fileName || null,
      fileSize: fileInfo.fileSize || report.fileSize || null,
      format:
        fileInfo.format ||
        report.format ||
        getFileExtension(fileInfo.fileName || report.fileName || "") ||
        null,
    },
  };
};

const normalizeReportsResponse = (response, fallbackPage, fallbackLimit) => {
  const payload = getResponsePayload(response);
  const reportsSource =
    payload?.reports ||
    payload?.items ||
    payload?.results ||
    payload?.records ||
    (Array.isArray(payload) ? payload : []);

  const reports = reportsSource.map(normalizeReport);
  const payloadPagination = payload?.pagination || {};

  return {
    reports,
    pagination: {
      currentPage:
        payloadPagination.currentPage || payload.page || fallbackPage,
      totalPages: payloadPagination.totalPages || payload.totalPages || 1,
      totalItems:
        payloadPagination.totalItems || payload.totalItems || reports.length,
      limit: payloadPagination.limit || payload.limit || fallbackLimit,
    },
  };
};

const getFileExtension = (value = "") => {
  const parts = String(value).split(".");
  if (parts.length < 2) return "";
  return parts[parts.length - 1].toLowerCase();
};

const sanitizeFileName = (value = "report") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "") || "report";

const escapeCsvValue = (value) => {
  if (value === null || value === undefined) return "";
  const stringValue = String(value).replace(/"/g, '""');
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue}"`;
  }
  return stringValue;
};

const triggerFileDownload = (fileContent, fileName, mimeType) => {
  const blob = new Blob([fileContent], { type: mimeType });
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeReportId, setActiveReportId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    category: "",
    page: 1,
    limit: DEFAULT_LIMIT,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: DEFAULT_LIMIT,
  });
  const [reportForm, setReportForm] = useState({
    type: "maintenance",
    from: getMonthStart(),
    to: getToday(),
    format: "pdf",
    template: "standard",
    title: "",
    description: "",
    // Thêm 2 mảng này vào để khớp với cấu trúc payload mới
    locations: ["Platform A", "Platform B"],
    equipmentTypes: ["pumping", "drilling"],
  });
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, report: null });

  const reportStats = useMemo(() => {
    const completed = reports.filter(
      (item) => item.status === "completed",
    ).length;
    const generating = reports.filter(
      (item) => item.status === "generating",
    ).length;
    const failed = reports.filter((item) => item.status === "failed").length;

    return {
      total: pagination.totalItems || reports.length,
      completed,
      generating,
      failed,
    };
  }, [pagination.totalItems, reports]);

  const visibleReports = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return reports;

    return reports.filter((report) => {
      const blob = [
        report._reportId,
        report.title,
        report.description,
        report.type,
        report.category,
        report.status,
        report.fileInfo?.fileName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return blob.includes(keyword);
    });
  }, [reports, searchQuery]);

  const fetchReports = useCallback(
    async (page = filters.page) => {
      setIsLoading(true);

      try {
        const response = await reportsApi.getReports({
          type: filters.type || undefined,
          status: filters.status || undefined,
          category: filters.category || undefined,
          page,
          limit: filters.limit,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        });

        const normalized = normalizeReportsResponse(
          response,
          page,
          filters.limit,
        );

        setReports(normalized.reports);
        setPagination(normalized.pagination);
        setFilters((prev) => ({
          ...prev,
          page: normalized.pagination.currentPage,
        }));
      } catch (error) {
        showToast("error", getErrorMessage(error, "Failed to load reports."));
      } finally {
        setIsLoading(false);
      }
    },
    [
      filters.category,
      filters.limit,
      filters.page,
      filters.sortBy,
      filters.sortOrder,
      filters.status,
      filters.type,
    ],
  );

  useEffect(() => {
    fetchReports(filters.page);
  }, [fetchReports, filters.page]);

  const getStatusClass = (status) => {
    switch ((status || "").toLowerCase()) {
      case "completed":
        return "status-completed";
      case "generating":
        return "status-generating";
      case "failed":
        return "status-failed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-pending";
    }
  };

  const formatDateTime = (dateValue) => {
    if (!dateValue) {
      return { date: "-", time: "-" };
    }

    const parsedDate = new Date(dateValue);

    if (Number.isNaN(parsedDate.getTime())) {
      return { date: dateValue, time: "-" };
    }

    return {
      date: parsedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      time: parsedDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  };

  const handleFormChange = (key, value) => {
    setReportForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerateReport = async () => {
    if (!reportForm.from || !reportForm.to) {
      showToast("warning", "Please select a valid date range.");
      return;
    }

    if (reportForm.from > reportForm.to) {
      showToast("warning", '"From" date must be earlier than "To" date.');
      return;
    }

    setIsGenerating(true);

    try {
      const payload = {
        type: reportForm.type,
        from: reportForm.from,
        to: reportForm.to,
        format: reportForm.format,
        template: reportForm.template,
        title: reportForm.title.trim() || "Monthly Maintenance Report",
        description:
          reportForm.description.trim() ||
          "Comprehensive maintenance report for March 2026",
        filters: {
          locations: reportForm.locations,
          equipmentTypes: reportForm.equipmentTypes,
        },
        distribution: {
          email: {
            enabled: false,
          },
        },
      };

      const response = await reportsApi.generateReport(payload);

      const generatedReport = normalizeReport(getResponsePayload(response));

      if (generatedReport._reportId) {
        setReports((prev) => [
          generatedReport,
          ...prev.filter(
            (item) => item._reportId !== generatedReport._reportId,
          ),
        ]);
      }

      showToast("success", "Report generation started successfully.");
      await fetchReports(1);
    } catch (error) {
      showToast("error", getErrorMessage(error, "Failed to generate report."));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCheckStatus = async (reportId) => {
    setActiveReportId(reportId);

    try {
      const response = await reportsApi.getReportStatus(reportId);
      const updatedReport = normalizeReport(getResponsePayload(response));

      setReports((prev) =>
        prev.map((item) =>
          item._reportId === reportId
            ? {
                ...item,
                ...updatedReport,
                fileInfo: updatedReport.fileInfo || item.fileInfo,
              }
            : item,
        ),
      );

      showToast("info", `Report status: ${formatLabel(updatedReport.status)}.`);
    } catch (error) {
      showToast(
        "error",
        getErrorMessage(error, "Failed to fetch report status."),
      );
    } finally {
      setActiveReportId(null);
    }
  };

  const handleDownloadReport = async (report, requestedFormat) => {
    const reportId = report._reportId;

    if (!reportId) {
      showToast("warning", "Missing report id.");
      return;
    }

    setActiveReportId(reportId);

    try {
      const normalizedRequestedFormat = (
        requestedFormat ||
        report.fileInfo?.format ||
        reportForm.format ||
        "pdf"
      )
        .toLowerCase()
        .trim();
      const baseFileName = sanitizeFileName(
        report.title || report._reportId || report.reportCode || "report",
      );

      if (normalizedRequestedFormat === "csv") {
        const csvHeaders = [
          "Report ID",
          "Title",
          "Type",
          "Category",
          "Status",
          "Description",
          "Created At",
          "Progress",
          "File Name",
          "File Size",
        ];
        const csvRow = [
          report._reportId || "",
          report.title || "",
          report.type || "",
          report.category || "",
          report.status || "",
          report.description || "",
          report.createdAt || "",
          report.progress ?? "",
          report.fileInfo?.fileName || "",
          report.fileInfo?.fileSize ?? "",
        ];
        const csvContent = `${csvHeaders.map(escapeCsvValue).join(",")}\n${csvRow.map(escapeCsvValue).join(",")}`;
        triggerFileDownload(
          csvContent,
          `${baseFileName}.csv`,
          "text/csv;charset=utf-8;",
        );
        showToast("success", "Report CSV downloaded successfully.");
        return;
      }

      if (normalizedRequestedFormat === "pdf") {
        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const left = 40;
        const pageHeight = doc.internal.pageSize.getHeight();
        let y = 50;

        const drawField = (label, value) => {
          if (y > pageHeight - 60) {
            doc.addPage();
            y = 50;
          }
          doc.setFont("helvetica", "bold");
          doc.text(`${label}:`, left, y);
          doc.setFont("helvetica", "normal");
          const wrapped = doc.splitTextToSize(
            String(value ?? "-"),
            doc.internal.pageSize.getWidth() - left * 2 - 80,
          );
          doc.text(wrapped, left + 80, y);
          y += 22 + (wrapped.length - 1) * 14;
        };

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("Technical Report", left, y);
        y += 30;
        doc.setFontSize(11);

        drawField("Report ID", report._reportId || "-");
        drawField("Title", report.title || "-");
        drawField("Type", formatLabel(report.type || "-"));
        drawField("Category", formatLabel(report.category || "-"));
        drawField("Status", formatLabel(report.status || "-"));
        drawField("Created At", report.createdAt || "-");
        drawField("Progress", report.progress ?? "-");
        drawField("Description", report.description || "-");
        drawField("File Name", report.fileInfo?.fileName || "-");
        drawField("File Size", report.fileInfo?.fileSize || "-");

        doc.save(`${baseFileName}.pdf`);
        showToast("success", "Report PDF downloaded successfully.");
        return;
      }

      showToast("warning", "Unsupported export format.");
    } catch (error) {
      showToast("error", getErrorMessage(error, "Failed to download report."));
    } finally {
      setActiveReportId(null);
    }
  };

  const handleDeleteReport = (report) => {
    setDeleteModal({ open: true, report });
  };

  const confirmDeleteReport = async () => {
    const report = deleteModal.report;
    if (!report) return;
    const reportId = report.reportCode;
    if (!reportId) {
      showToast("warning", "Missing report id.");
      setDeleteModal({ open: false, report: null });
      return;
    }
    setActiveReportId(reportId);
    try {
      await reportsApi.deleteReport(reportId);
      setDeleteModal({ open: false, report: null });
      showToast("success", "Report deleted successfully.");
      // Reload the reports list after deletion
      await fetchReports(1);
    } catch (error) {
      showToast("error", getErrorMessage(error, "Failed to delete report."));
    } finally {
      setActiveReportId(null);
    }
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Engineer Reports</h1>
          <p className="page-subtitle">
            Generate, monitor, download, and manage technical reports.
          </p>
        </div>
        <div className="page-header-actions">
          <button
            className="btn-secondary"
            onClick={() => fetchReports(filters.page)}
            disabled={isLoading}
          >
            <FaSyncAlt /> Refresh
          </button>
          <button
            className="btn-create"
            onClick={() => setShowGenerateModal(true)}
            disabled={isGenerating}
          >
            <FaPlus /> {isGenerating ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>

      <div className="reports-kpi-grid">
        <div className="reports-kpi-card">
          <span className="reports-kpi-label">Total Reports</span>
          <strong className="reports-kpi-value">{reportStats.total}</strong>
        </div>
        <div className="reports-kpi-card">
          <span className="reports-kpi-label">Completed</span>
          <strong className="reports-kpi-value text-completed">
            {reportStats.completed}
          </strong>
        </div>
        <div className="reports-kpi-card">
          <span className="reports-kpi-label">Generating</span>
          <strong className="reports-kpi-value text-generating">
            {reportStats.generating}
          </strong>
        </div>
        <div className="reports-kpi-card">
          <span className="reports-kpi-label">Failed</span>
          <strong className="reports-kpi-value text-failed">
            {reportStats.failed}
          </strong>
        </div>
      </div>

      <div className="reports-surface reports-surface--filters">
        <h2 className="section-title">Filters</h2>
        <div className="search-box reports-search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by report id, title, type, or category..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearchQuery("")}
            >
              <FaTimes />
            </button>
          )}
        </div>
        <div className="reports-filters">
          <label className="field-group compact-field">
            <span className="field-label">Type</span>
            <select
              className="filter-select"
              value={filters.type}
              onChange={(event) =>
                handleFilterChange("type", event.target.value)
              }
            >
              <option value="">All Types</option>
              {REPORT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {formatLabel(type)}
                </option>
              ))}
            </select>
          </label>

          <label className="field-group compact-field">
            <span className="field-label">Status</span>
            <select
              className="filter-select"
              value={filters.status}
              onChange={(event) =>
                handleFilterChange("status", event.target.value)
              }
            >
              <option value="">All Statuses</option>
              {REPORT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatLabel(status)}
                </option>
              ))}
            </select>
          </label>

          <label className="field-group compact-field">
            <span className="field-label">Category</span>
            <select
              className="filter-select"
              value={filters.category}
              onChange={(event) =>
                handleFilterChange("category", event.target.value)
              }
            >
              <option value="">All Categories</option>
              {REPORT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {formatLabel(category)}
                </option>
              ))}
            </select>
          </label>

          <label className="field-group compact-field">
            <span className="field-label">Sort</span>
            <select
              className="filter-select"
              value={filters.sortOrder}
              onChange={(event) =>
                handleFilterChange("sortOrder", event.target.value)
              }
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </label>

          <label className="field-group compact-field">
            <span className="field-label">Per Page</span>
            <select
              className="filter-select"
              value={filters.limit}
              onChange={(event) =>
                handleFilterChange("limit", Number(event.target.value))
              }
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </label>
        </div>
      </div>

      <div className="reports-summary">
        <span>
          {isLoading
            ? "Loading reports..."
            : searchQuery
              ? `${visibleReports.length} reports matched on this page`
              : `${pagination.totalItems} reports found`}
        </span>
        <span>
          Page {pagination.currentPage} / {pagination.totalPages}
        </span>
      </div>

      <div className="reports-surface reports-surface--table">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>REPORT ID</th>
                <th>TITLE</th>
                <th>TYPE</th>
                <th>CATEGORY</th>
                <th>STATUS</th>
                <th>CREATED</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && visibleReports.length === 0 && (
                <tr>
                  <td colSpan="7" className="empty-state-cell">
                    No reports found for the selected filters/search.
                  </td>
                </tr>
              )}

              {visibleReports.map((report) => {
                const created = formatDateTime(report.createdAt);
                const isBusy = activeReportId === report._reportId;

                return (
                  <tr
                    key={
                      report._reportId || `${report.title}-${report.createdAt}`
                    }
                  >
                    <td>{report._reportId || "-"}</td>
                    <td>
                      <div className="report-title-cell">
                        <span className="report-title">{report.title}</span>
                        <span className="report-description">
                          {report.description}
                        </span>
                        {report.fileInfo?.fileName && (
                          <span className="report-meta">
                            File: {report.fileInfo.fileName}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{formatLabel(report.type)}</td>
                    <td>{formatLabel(report.category)}</td>
                    <td>
                      <div className="status-wrapper">
                        <span
                          className={`status-badge ${getStatusClass(report.status)}`}
                        >
                          {formatLabel(report.status)}
                        </span>
                        {typeof report.progress === "number" && (
                          <span className="report-meta">
                            {report.progress}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="datetime-cell">
                        <span>{created.date}</span>
                        <span className="time-text">{created.time}</span>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {/* Check status button removed */}
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleDownloadReport(report, "pdf")}
                          disabled={isBusy || !report.canDownload}
                          title="Export PDF"
                        >
                          <FaDownload />
                        </button>
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleDownloadReport(report, "csv")}
                          disabled={isBusy || !report.canDownload}
                          title="Export CSV"
                        >
                          CSV
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteReport(report)}
                          disabled={isBusy}
                          title="Delete report"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pagination-controls">
        <button
          className="btn-secondary"
          onClick={() =>
            handleFilterChange("page", Math.max(1, filters.page - 1))
          }
          disabled={isLoading || pagination.currentPage <= 1}
        >
          Previous
        </button>
        <span className="pagination-meta">
          Showing page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <button
          className="btn-secondary"
          onClick={() =>
            handleFilterChange(
              "page",
              Math.min(pagination.totalPages, filters.page + 1),
            )
          }
          disabled={
            isLoading || pagination.currentPage >= pagination.totalPages
          }
        >
          Next
        </button>
      </div>

      <ReportsModal
        isOpen={showGenerateModal}
        isGenerating={isGenerating}
        reportForm={reportForm}
        onFormChange={handleFormChange}
        onGenerate={async () => {
          await handleGenerateReport();
          setShowGenerateModal(false);
          // Always reload after modal closes, in case of async issues
          await fetchReports(1);
        }}
        onClose={() => setShowGenerateModal(false)}
      />

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15,23,42,0.8)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#1e293b",
              color: "#f8fafc",
              borderRadius: 8,
              padding: 32,
              minWidth: 340,
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
              Delete Report
            </div>
            <div style={{ color: "#94a3b8", textAlign: "center" }}>
              Are you sure you want to delete report{" "}
              <b>"{deleteModal.report?.title}"</b>?
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
              <button
                onClick={() => setDeleteModal({ open: false, report: null })}
                style={{
                  padding: "10px 20px",
                  background: "transparent",
                  border: "1px solid #334155",
                  borderRadius: 6,
                  color: "#f8fafc",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
                disabled={activeReportId === deleteModal.report?.reportCode}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteReport}
                style={{
                  padding: "10px 20px",
                  background: "#ef4444",
                  border: "none",
                  borderRadius: 6,
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
                disabled={activeReportId === deleteModal.report?.reportCode}
              >
                {activeReportId === deleteModal.report?.reportCode
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
