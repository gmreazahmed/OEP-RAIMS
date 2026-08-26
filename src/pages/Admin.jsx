import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  LogOut,
  Search,
  QrCode,
  X,
  ExternalLink,
  UserRound,
  FileCheck2,
  Globe2,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

import { QRCodeSVG } from "qrcode.react";

import {
  getRecords,
  createRecord,
  updateRecord,
  deleteRecord,
} from "../services/api";

import "./Admin.css";


/* =========================================================
   EMPTY FORM
========================================================= */

const emptyForm = {
  ec_no: "",
  ec_date: "",

  name: "",
  birth_date: "",
  gender: "",
  blood_group: "",
  nid: "",

  passport_no: "",
  passport_issue_date: "",
  passport_expire_date: "",

  visa_no: "",
  visa_issue_date: "",
  visa_expire_date: "",

  referral_no: "",

  recruiting_agency: "",
  employer: "",
  country: "",

  bmet_no: "",
  passport_no_1: "",

  status: "VERIFIED",
  description: "",
};


/* =========================================================
   ADMIN
========================================================= */

export default function Admin() {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState(null);

  const [qrRecord, setQrRecord] = useState(null);


  /* =======================================================
     AUTH
  ======================================================= */

  useEffect(() => {
    const loggedIn =
      sessionStorage.getItem("admin_logged_in");

    if (loggedIn !== "true") {
      navigate("/admin", { replace: true });
      return;
    }

    loadRecords();
  }, [navigate]);


  /* =======================================================
     LOAD RECORDS
  ======================================================= */

  async function loadRecords(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const result = await getRecords();

      setRecords(result.data || []);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load verification records."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }


  /* =======================================================
     ADD
  ======================================================= */

  function openAdd() {
    setEditing(null);
    setForm({ ...emptyForm });
    setPhoto(null);
    setError("");
    setShowForm(true);
  }


  /* =======================================================
     EDIT
  ======================================================= */

  function openEdit(record) {
    setEditing(record);

    setForm({
      ec_no: record.ec_no || "",
      ec_date: record.ec_date || "",

      name: record.name || "",
      birth_date: record.birth_date || "",
      gender: record.gender || "",
      blood_group: record.blood_group || "",
      nid: record.nid || "",

      passport_no: record.passport_no || "",
      passport_issue_date:
        record.passport_issue_date || "",
      passport_expire_date:
        record.passport_expire_date || "",

      visa_no: record.visa_no || "",
      visa_issue_date:
        record.visa_issue_date || "",
      visa_expire_date:
        record.visa_expire_date || "",

      referral_no:
        record.referral_no || "",

      recruiting_agency:
        record.recruiting_agency || "",

      employer:
        record.employer || "",

      country:
        record.country || "",

      bmet_no:
        record.bmet_no || "",

      passport_no_1:
        record.passport_no_1 || "",

      status:
        record.status || "VERIFIED",

      description:
        record.description || "",
    });

    setPhoto(null);
    setError("");
    setShowForm(true);
  }


  /* =======================================================
     INPUT
  ======================================================= */

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }


  function handlePhoto(e) {
    setPhoto(e.target.files?.[0] || null);
  }


  /* =======================================================
     SAVE
  ======================================================= */

  async function saveRecord(e) {
    e.preventDefault();

    if (!form.ec_no.trim()) {
      setError("EC No is required.");
      return;
    }

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = new FormData();

      if (editing) {
        data.append("id", editing.id);
      }

      Object.entries(form).forEach(
        ([key, value]) => {
          data.append(key, value ?? "");
        }
      );

      if (photo) {
        data.append("photo", photo);
      }

      if (editing) {
        await updateRecord(data);
      } else {
        await createRecord(data);
      }

      setShowForm(false);
      setEditing(null);
      setPhoto(null);

      await loadRecords();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to save verification record."
      );
    } finally {
      setSaving(false);
    }
  }


  /* =======================================================
     DELETE
  ======================================================= */

  async function handleDelete(record) {
    const confirmed = window.confirm(
      `Delete ${record.name}'s verification record?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteRecord(record.id);

      await loadRecords();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to delete record."
      );
    }
  }


  /* =======================================================
     LOGOUT
  ======================================================= */

  function logout() {
    sessionStorage.removeItem(
      "admin_logged_in"
    );

    navigate("/admin", {
      replace: true,
    });
  }


  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredRecords = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return records;
    }

    return records.filter((record) => {
      const fields = [
        record.name,
        record.ec_no,
        record.bmet_no,
        record.passport_no,
        record.visa_no,
        record.country,
        record.recruiting_agency,
      ];

      return fields.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [records, search]);


  /* =======================================================
     VERIFY URL
  ======================================================= */

  function getVerifyUrl(ecNo) {
    return `https://raims.oep-gov-bd.site/verify/${encodeURIComponent(
      ecNo
    )}`;
  }


  /* =======================================================
     VIEW VERIFICATION
  ======================================================= */

  function openVerification(record) {
    if (!record?.ec_no) {
      setError(
        "This record does not have an EC No."
      );
      return;
    }

    const verifyUrl =
      `/verify/${encodeURIComponent(
        record.ec_no
      )}`;

    window.open(
      verifyUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }


  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalRecords =
    records.length;

  const verifiedRecords =
    records.filter(
      (record) =>
        String(record.status)
          .toUpperCase() ===
        "VERIFIED"
    ).length;

  const pendingRecords =
    records.filter(
      (record) =>
        String(record.status)
          .toUpperCase() ===
        "PENDING"
    ).length;

  const countryCount =
    new Set(
      records
        .map(
          (record) =>
            String(
              record.country || ""
            )
              .trim()
              .toLowerCase()
        )
        .filter(Boolean)
    ).size;


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="admin-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="admin-header">

        <div className="admin-brand-area">

          <div className="admin-brand-icon">
            <img
            src="/icon.png"
            alt="OEP RAIMS"
          />
          </div>

          <div className="admin-brand-copy">

            <div className="admin-eyebrow">
              VERIFICATION SYSTEM
            </div>

            <h1>
              Verification Records
            </h1>

            <p>
              Manage verified records,
              documents and QR access.
            </p>

          </div>

        </div>


        <div className="admin-header-actions">

          <button
            type="button"
            className="refresh-button"
            onClick={() =>
              loadRecords(true)
            }
            disabled={refreshing}
          >
            <RefreshCw
              size={15}
              className={
                refreshing
                  ? "spin"
                  : ""
              }
            />

            <span>
              Refresh
            </span>
          </button>


          <button
            type="button"
            className="logout-button"
            onClick={logout}
          >
            <LogOut size={16} />

            <span>
              Logout
            </span>
          </button>

        </div>

      </header>


      {/* ===================================================
          CONTENT
      =================================================== */}

      <section className="admin-content">

        {/* ERROR */}

        {error && (
          <div className="admin-error">

            <div className="admin-error-content">
              <span className="admin-error-dot" />

              <span>
                {error}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              <X size={15} />
            </button>

          </div>
        )}


        {/* =================================================
            STATS
        ================================================= */}

        <div className="stats-grid">

          <StatCard
            icon={
              <FileCheck2
                size={19}
              />
            }
            label="Total Records"
            value={totalRecords}
            type="blue"
          />

          <StatCard
            icon={
              <ShieldCheck
                size={19}
              />
            }
            label="Verified"
            value={verifiedRecords}
            type="green"
          />

          <StatCard
            icon={
              <UserRound
                size={19}
              />
            }
            label="Pending"
            value={pendingRecords}
            type="orange"
          />

          <StatCard
            icon={
              <Globe2
                size={19}
              />
            }
            label="Countries"
            value={countryCount}
            type="purple"
          />

        </div>


        {/* =================================================
            RECORDS
        ================================================= */}

        <section className="records-card">

          {/* RECORD HEADER */}

          <div className="records-card-header">

            <div className="records-title-area">

              <div className="section-kicker">
                DATABASE
              </div>

              <h2>
                All Verification Records
              </h2>

              <p>
                Search, edit, view or generate
                a QR code for any record.
              </p>

            </div>


            <div className="records-header-right">

              <button
                type="button"
                className="records-add-button"
                onClick={openAdd}
              >
                <Plus
                  size={16}
                  strokeWidth={2.3}
                />

                <span>
                  Add Data
                </span>
              </button>


              <div className="header-record-count">

                <strong>
                  {filteredRecords.length}
                </strong>

                <span>
                  RECORDS
                </span>

              </div>

            </div>

          </div>


          {/* SEARCH */}

          <div className="record-toolbar">

            <div className="search-admin">

              <Search size={17} />

              <input
                type="text"
                placeholder="Search name, EC No, passport, BMET..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

              {search && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() =>
                    setSearch("")
                  }
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}

            </div>

            {search && (
              <div className="search-result-count">
                {filteredRecords.length} result
                {filteredRecords.length !== 1
                  ? "s"
                  : ""}
              </div>
            )}

          </div>


          {/* TABLE */}

          <div className="admin-table-wrapper">

            {loading ? (

              <div className="admin-loading">

                <div className="table-spinner" />

                <strong>
                  Loading records
                </strong>

                <span>
                  Please wait...
                </span>

              </div>

            ) : filteredRecords.length > 0 ? (

              <table className="admin-table">

                <thead>
                  <tr>
                    <th>EC NO</th>
                    <th>NAME</th>
                    <th>BMET NO</th>
                    <th>PASSPORT</th>
                    <th>COUNTRY</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>


                <tbody>

                  {filteredRecords.map(
                    (record) => (

                      <tr
                        key={record.id}
                      >

                        {/* EC */}

                        <td>
                          <div className="ec-cell">

                            <span className="ec-dot" />

                            <strong>
                              {record.ec_no ||
                                "—"}
                            </strong>

                          </div>
                        </td>


                        {/* NAME */}

                        <td>

                          <div className="name-cell">

                            <div className="name-avatar">
                              {record.name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "?"}
                            </div>

                            <div className="name-content">

                              <strong>
                                {record.name ||
                                  "—"}
                              </strong>

                              <span>
                                {record.recruiting_agency ||
                                  "Verification record"}
                              </span>

                            </div>

                          </div>

                        </td>


                        {/* BMET */}

                        <td>
                          <span className="table-value">
                            {record.bmet_no ||
                              "—"}
                          </span>
                        </td>


                        {/* PASSPORT */}

                        <td>
                          <span className="table-value">
                            {record.passport_no ||
                              "—"}
                          </span>
                        </td>


                        {/* COUNTRY */}

                        <td>
                          <span className="country-value">
                            {record.country ||
                              "—"}
                          </span>
                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={`status-badge ${String(
                              record.status ||
                                ""
                            ).toLowerCase()}`}
                          >
                            <span className="status-dot" />

                            {record.status ||
                              "UNKNOWN"}
                          </span>

                        </td>


                        {/* ACTIONS */}

                        <td>

                          <div className="row-actions">

                            <button
                              type="button"
                              className="action-button view"
                              title="View Verification"
                              onClick={() =>
                                openVerification(
                                  record
                                )
                              }
                            >
                              <Eye size={15} />
                            </button>


                            <button
                              type="button"
                              className="action-button edit"
                              title="Edit"
                              onClick={() =>
                                openEdit(
                                  record
                                )
                              }
                            >
                              <Pencil size={15} />
                            </button>


                            <button
                              type="button"
                              className="action-button qr"
                              title="Generate QR"
                              onClick={() =>
                                setQrRecord(
                                  record
                                )
                              }
                            >
                              <QrCode size={15} />
                            </button>


                            <button
                              type="button"
                              className="action-button delete"
                              title="Delete"
                              onClick={() =>
                                handleDelete(
                                  record
                                )
                              }
                            >
                              <Trash2 size={15} />
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            ) : (

              <div className="no-records">

                <div className="no-records-icon">
                  <Search size={21} />
                </div>

                <strong>
                  No records found
                </strong>

                <span>
                  {search
                    ? "Try another search term."
                    : "Add a new verification record to get started."}
                </span>

                {!search && (
                  <button
                    type="button"
                    onClick={openAdd}
                  >
                    <Plus size={14} />
                    Add Data
                  </button>
                )}

              </div>

            )}

          </div>

        </section>

      </section>


      {/* ===================================================
          ADD / EDIT MODAL
      =================================================== */}

      {showForm && (

        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              setShowForm(false);
            }
          }}
        >

          <div className="data-modal">

            <div className="modal-header">

              <div className="modal-heading">

                <div className="modal-icon">
                  {editing ? (
                    <Pencil size={18} />
                  ) : (
                    <Plus size={18} />
                  )}
                </div>

                <div>

                  <div className="section-kicker">
                    {editing
                      ? "EDIT RECORD"
                      : "NEW RECORD"}
                  </div>

                  <h2>
                    {editing
                      ? "Edit Verification"
                      : "Add Verification"}
                  </h2>

                  <p>
                    Enter the verification
                    information below.
                  </p>

                </div>

              </div>


              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setShowForm(false)
                }
                aria-label="Close"
              >
                <X size={18} />
              </button>

            </div>


            <form
              onSubmit={saveRecord}
              className="verification-form"
            >

              <FormSection
                title="EC Card"
                description="Basic emigration clearance information."
              >
                <div className="form-grid">

                  <Field
                    label="EC No"
                    name="ec_no"
                    value={form.ec_no}
                    onChange={handleChange}
                    placeholder="IE-I-2025-8851896"
                    required
                  />

                  <Field
                    label="EC Date"
                    name="ec_date"
                    type="date"
                    value={form.ec_date}
                    onChange={handleChange}
                  />

                </div>
              </FormSection>


              <FormSection
                title="Personal Information"
                description="Identity and personal details."
              >

                <Field
                  label="Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  required
                />

                <div className="form-grid">

                  <Field
                    label="Birth Date"
                    name="birth_date"
                    type="date"
                    value={form.birth_date}
                    onChange={handleChange}
                  />

                  <SelectField
                    label="Gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    options={[
                      "",
                      "Male",
                      "Female",
                      "Other",
                    ]}
                  />

                  <Field
                    label="Blood Group"
                    name="blood_group"
                    value={form.blood_group}
                    onChange={handleChange}
                    placeholder="O+"
                  />

                  <Field
                    label="NID"
                    name="nid"
                    value={form.nid}
                    onChange={handleChange}
                  />

                </div>

                <FileField
                  label="Photo"
                  onChange={handlePhoto}
                  file={photo}
                />

              </FormSection>


              <FormSection
                title="Passport"
                description="Passport number and validity."
              >

                <Field
                  label="Passport No"
                  name="passport_no"
                  value={form.passport_no}
                  onChange={handleChange}
                />

                <div className="form-grid">

                  <Field
                    label="Issue Date"
                    name="passport_issue_date"
                    type="date"
                    value={
                      form.passport_issue_date
                    }
                    onChange={handleChange}
                  />

                  <Field
                    label="Expire Date"
                    name="passport_expire_date"
                    type="date"
                    value={
                      form.passport_expire_date
                    }
                    onChange={handleChange}
                  />

                </div>

              </FormSection>


              <FormSection
                title="Visa"
                description="Visa number and validity."
              >

                <Field
                  label="Visa No"
                  name="visa_no"
                  value={form.visa_no}
                  onChange={handleChange}
                />

                <div className="form-grid">

                  <Field
                    label="Issue Date"
                    name="visa_issue_date"
                    type="date"
                    value={
                      form.visa_issue_date
                    }
                    onChange={handleChange}
                  />

                  <Field
                    label="Expire Date"
                    name="visa_expire_date"
                    type="date"
                    value={
                      form.visa_expire_date
                    }
                    onChange={handleChange}
                  />

                </div>

              </FormSection>


              <FormSection
                title="Referral"
                description="Referral information."
              >
                <Field
                  label="Referral No"
                  name="referral_no"
                  value={form.referral_no}
                  onChange={handleChange}
                />
              </FormSection>


              <FormSection
                title="Employment"
                description="Agency, employer and destination."
              >

                <Field
                  label="Recruiting Agency"
                  name="recruiting_agency"
                  value={
                    form.recruiting_agency
                  }
                  onChange={handleChange}
                />

                <div className="form-grid">

                  <Field
                    label="Employer"
                    name="employer"
                    value={form.employer}
                    onChange={handleChange}
                  />

                  <Field
                    label="Country"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                  />

                </div>

              </FormSection>


              <FormSection
                title="BMET Registration"
                description="BMET registration details."
              >
                <Field
                  label="BMET No"
                  name="bmet_no"
                  value={form.bmet_no}
                  onChange={handleChange}
                />
              </FormSection>


              <FormSection
                title="Passports"
                description="Additional passport record."
              >
                <Field
                  label="Passport No 1"
                  name="passport_no_1"
                  value={
                    form.passport_no_1
                  }
                  onChange={handleChange}
                />
              </FormSection>


              <FormSection
                title="Status & Notes"
                description="Verification status and optional notes."
              >

                <SelectField
                  label="Verification Status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  options={[
                    "VERIFIED",
                    "PENDING",
                    "EXPIRED",
                    "REVOKED",
                  ]}
                />

                <div className="form-field">

                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Additional information..."
                  />

                </div>

              </FormSection>


              {error && (
                <div className="form-error">
                  <span className="admin-error-dot" />
                  {error}
                </div>
              )}


              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() =>
                    setShowForm(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                  disabled={saving}
                >

                  {saving ? (
                    <>
                      <span className="button-spinner" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editing ? (
                        <Pencil size={15} />
                      ) : (
                        <Plus size={15} />
                      )}

                      {editing
                        ? "Save Changes"
                        : "Add Data"}
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ===================================================
          QR MODAL
      =================================================== */}

      {qrRecord && (

        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              setQrRecord(null);
            }
          }}
        >

          <div className="qr-modal">

            <button
              type="button"
              className="qr-close"
              onClick={() =>
                setQrRecord(null)
              }
              aria-label="Close QR"
            >
              <X size={18} />
            </button>


            <div className="qr-modal-header">

              <div className="qr-modal-icon">
                <QrCode size={20} />
              </div>

              <div>

                <div className="section-kicker">
                  QR VERIFICATION
                </div>

                <h2>
                  Verification QR
                </h2>

                <p>
                  Scan to open the public
                  verification page.
                </p>

              </div>

            </div>


            <div className="qr-record-info">

              <span>
                EC No
              </span>

              <strong>
                {qrRecord.ec_no || "—"}
              </strong>

            </div>


            <div className="qr-box">

              <QRCodeSVG
                value={getVerifyUrl(
                  qrRecord.ec_no
                )}
                size={220}
                level="H"
                includeMargin
              />

            </div>


            <div className="qr-url">
              {getVerifyUrl(
                qrRecord.ec_no
              )}
            </div>


            <button
              type="button"
              className="qr-open-button"
              onClick={() =>
                openVerification(
                  qrRecord
                )
              }
            >
              <ExternalLink size={15} />
              Open Verification
            </button>

          </div>

        </div>

      )}

    </main>
  );
}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
  type,
}) {
  return (
    <div
      className={`stat-card ${type}`}
    >

      <div className="stat-icon">
        {icon}
      </div>

      <div className="stat-content">

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </div>
  );
}


/* =========================================================
   FORM SECTION
========================================================= */

function FormSection({
  title,
  description,
  children,
}) {
  return (
    <section className="form-section">

      <div className="form-section-heading">

        <h3>
          {title}
        </h3>

        <p>
          {description}
        </p>

      </div>

      <div className="form-section-content">
        {children}
      </div>

    </section>
  );
}


/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
}) {
  return (
    <div className="form-field">

      <label htmlFor={name}>

        {label}

        {required && (
          <span className="required-star">
            *
          </span>
        )}

      </label>

      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />

    </div>
  );
}


/* =========================================================
   SELECT
========================================================= */

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}) {
  return (
    <div className="form-field">

      <label htmlFor={name}>
        {label}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
      >

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option || "Select"}
          </option>
        ))}

      </select>

    </div>
  );
}


/* =========================================================
   FILE
========================================================= */

function FileField({
  label,
  onChange,
  file,
}) {
  return (
    <div className="file-field">

      <label>
        {label}
      </label>

      <label className="file-dropzone">

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onChange}
        />

        <div className="file-drop-icon">
          <UserRound size={18} />
        </div>

        <div className="file-drop-copy">

          <strong>
            {file
              ? file.name
              : "Choose profile photo"}
          </strong>

          <span>
            JPG, PNG or WEBP
          </span>

        </div>

      </label>

    </div>
  );
}