import { useCallback, useEffect, useMemo, useState } from "react";
import { FaDownload, FaPlus, FaSyncAlt, FaTrash } from "react-icons/fa";
import reportsApi from "../../services/reportsApi";
import { showToast } from "../../utils/toastHandler";

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
const REPORT_FORMATS = ["pdf", "excel", "csv"];
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
      format: fileInfo.format || report.format || null,
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

const getFilenameFromHeaders = (headers, fallbackName) => {
  const disposition =
    headers?.["content-disposition"] || headers?.["Content-Disposition"];
  const match = disposition?.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);

  if (!match?.[1]) {
    return fallbackName;
  }

  return match[1].replace(/['"]/g, "");
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeReportId, setActiveReportId] = useState(null);
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
    category: "technical",
    from: getMonthStart(),
    to: getToday(),
    format: "pdf",
    template: "standard",
    title: "",
    description: "",
  });

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
      const response = await reportsApi.generateReport({
        type: reportForm.type,
        from: reportForm.from,
        to: reportForm.to,
        format: reportForm.format,
        template: reportForm.template,
        title:
          reportForm.title.trim() || `${formatLabel(reportForm.type)} Report`,
        description:
          reportForm.description.trim() ||
          `${formatLabel(reportForm.category)} ${formatLabel(reportForm.type)} report for ${reportForm.from} to ${reportForm.to}`,
        filters: {
          category: reportForm.category,
        },
        distribution: {
          email: {
            enabled: false,
          },
        },
      });

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

  const handleDownloadReport = async (report) => {
    const reportId = report._reportId;

    if (!reportId) {
      showToast("warning", "Missing report id.");
      return;
    }

    setActiveReportId(reportId);

    try {
      const response = await reportsApi.downloadReport(reportId);
      const fallbackExtension =
        report.fileInfo?.format || reportForm.format || "pdf";
      const fallbackName = `${(report.title || "report").replace(/\s+/g, "-").toLowerCase()}.${fallbackExtension}`;
      const fileName = getFilenameFromHeaders(response.headers, fallbackName);
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      showToast("success", "Report download started.");
    } catch (error) {
      showToast("error", getErrorMessage(error, "Failed to download report."));
    } finally {
      setActiveReportId(null);
    }
  };

  const handleDeleteReport = async (report) => {
    const reportId = report._reportId;

    if (!reportId) {
      showToast("warning", "Missing report id.");
      return;
    }

    const shouldDelete = window.confirm(`Delete report "${report.title}"?`);

    if (!shouldDelete) {
      return;
    }

    setActiveReportId(reportId);

    try {
      await reportsApi.deleteReport(reportId);
      setReports((prev) => prev.filter((item) => item._reportId !== reportId));
      setPagination((prev) => ({
        ...prev,
        totalItems: Math.max(0, prev.totalItems - 1),
      }));
      showToast("success", "Report deleted successfully.");
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
            onClick={handleGenerateReport}
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

      <div className="reports-surface reports-surface--generator">
        <h2 className="section-title">Generate New Report</h2>
        <div className="report-generator">
          <label className="field-group reports-title-input">
            <span className="field-label">Title</span>
            <input
              type="text"
              className="filter-input"
              placeholder="Report title"
              value={reportForm.title}
              onChange={(event) =>
                handleFormChange("title", event.target.value)
              }
            />
          </label>

          <label className="field-group">
            <span className="field-label">Type</span>
            <select
              className="filter-select"
              value={reportForm.type}
              onChange={(event) => handleFormChange("type", event.target.value)}
            >
              {REPORT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {formatLabel(type)}
                </option>
              ))}
            </select>
          </label>

          <label className="field-group">
            <span className="field-label">Category</span>
            <select
              className="filter-select"
              value={reportForm.category}
              onChange={(event) =>
                handleFormChange("category", event.target.value)
              }
            >
              {REPORT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {formatLabel(category)}
                </option>
              ))}
            </select>
          </label>

          <label className="field-group">
            <span className="field-label">Format</span>
            <select
              className="filter-select"
              value={reportForm.format}
              onChange={(event) =>
                handleFormChange("format", event.target.value)
              }
            >
              {REPORT_FORMATS.map((format) => (
                <option key={format} value={format}>
                  {format.toUpperCase()}
                </option>
              ))}
            </select>
          </label>

          <label className="field-group">
            <span className="field-label">Template</span>
            <select
              className="filter-select"
              value={reportForm.template}
              onChange={(event) =>
                handleFormChange("template", event.target.value)
              }
            >
              {REPORT_TEMPLATES.map((template) => (
                <option key={template} value={template}>
                  {formatLabel(template)}
                </option>
              ))}
            </select>
          </label>

          <div className="field-group date-range-filter">
            <span className="field-label">Date Range</span>
            <div className="date-range-inputs">
              <input
                type="date"
                className="filter-input"
                value={reportForm.from}
                onChange={(event) =>
                  handleFormChange("from", event.target.value)
                }
              />
              <span className="date-separator">-</span>
              <input
                type="date"
                className="filter-input"
                value={reportForm.to}
                onChange={(event) => handleFormChange("to", event.target.value)}
              />
            </div>
          </div>

          <label className="field-group reports-description-input">
            <span className="field-label">Description</span>
            <input
              type="text"
              className="filter-input"
              placeholder="Optional description"
              value={reportForm.description}
              onChange={(event) =>
                handleFormChange("description", event.target.value)
              }
            />
          </label>
        </div>
      </div>

      <div className="reports-surface reports-surface--filters">
        <h2 className="section-title">Filters</h2>
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
              {!isLoading && reports.length === 0 && (
                <tr>
                  <td colSpan="7" className="empty-state-cell">
                    No reports found for the selected filters.
                  </td>
                </tr>
              )}

              {reports.map((report) => {
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
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleCheckStatus(report._reportId)}
                          disabled={isBusy}
                          title="Check status"
                        >
                          <FaSyncAlt />
                        </button>
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleDownloadReport(report)}
                          disabled={isBusy || !report.canDownload}
                          title="Download report"
                        >
                          <FaDownload />
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
    </div>
  );
}
