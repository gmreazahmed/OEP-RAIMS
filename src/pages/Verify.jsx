import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getRecord } from "../services/api";

import "./Verify.css";

const API_URL = (
  import.meta.env.VITE_API_URL || ""
).replace(/\/$/, "");


/* =========================================================
   DATE HELPERS
========================================================= */

function formatEcDate(value) {
  if (!value) return "";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const [year, month, day] =
    value.split("-");

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return `${day}/${months[Number(month) - 1]}/${year}`;
}


function formatDate(value) {
  if (!value) return "";

  return value;
}


/* =========================================================
   SAFE VALUE
========================================================= */

function displayValue(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  return value;
}


/* =========================================================
   PHOTO URL
========================================================= */

function getPhotoUrl(photo) {
  if (!photo) {
    return "/images/photo.png";
  }

  const value = String(photo).trim();

  if (!value) {
    return "/images/photo.png";
  }

  /* Already complete URL */

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  /* Absolute API path */

  if (value.startsWith("/")) {
    return `${API_URL}${value}`;
  }

  /* Stored only as filename */

  if (
    value.startsWith("uploads/")
  ) {
    return `${API_URL}/${value}`;
  }

  return `${API_URL}/uploads/${value}`;
}


/* =========================================================
   VERIFY PAGE
========================================================= */

export default function Verify() {
  const { code } = useParams();

  const [record, setRecord] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =======================================================
     LOAD RECORD
  ======================================================= */

  useEffect(() => {
    let active = true;

    async function loadRecord() {
      try {
        setLoading(true);
        setError("");
        setRecord(null);

        if (!code) {
          throw new Error(
            "EC No is missing."
          );
        }

        if (!API_URL) {
          throw new Error(
            "Verification API is not configured."
          );
        }

        /*
         * IMPORTANT:
         *
         * `code` is now the EC No.
         *
         * Example:
         * /verify/IE-I-2025-8851896
         *
         * -> getRecord("IE-I-2025-8851896")
         */

        const result =
          await getRecord(code);

        if (!result?.success) {
          throw new Error(
            result?.message ||
              "Verification record not found."
          );
        }

        if (!result?.data) {
          throw new Error(
            "Verification record not found."
          );
        }

        if (active) {
          setRecord(result.data);
        }

      } catch (err) {

        console.error(
          "Verification error:",
          err
        );

        if (active) {
          setRecord(null);

          setError(
            err?.message ||
              "Verification record not found."
          );
        }

      } finally {

        if (active) {
          setLoading(false);
        }
      }
    }

    loadRecord();

    return () => {
      active = false;
    };

  }, [code]);


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="verify-loading-page">

        <div className="verify-loading-box">

          <div className="verify-spinner" />

          <strong>
            Verifying...
          </strong>

          <p>
            Please wait while we verify
            the EC information.
          </p>

        </div>

      </div>
    );
  }


  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !record) {
    return (
      <div className="verify-error-page">

        <div className="verify-error-box">

          <div className="verify-error-icon">
            !
          </div>

          <h2>
            Verification Not Found
          </h2>

          <p>
            {error ||
              "No verification record was found."}
          </p>

          {code && (
            <div className="verify-error-code">

              <span>
                EC No
              </span>

              <strong>
                {code}
              </strong>

            </div>
          )}

        </div>

      </div>
    );
  }


  const photoUrl =
    getPhotoUrl(record.photo);


  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div className="verify-page">

      {/* ===================================================
          EC CARD
      ==================================================== */}

      <div className="verify-card-wrap">

        <div className="verify-top">

          {/* LEFT LOGO */}

          <div className="verify-logo-left">

            <img
              src="/images/logo.png"
              alt="Logo"
              onError={(e) => {
                e.currentTarget.style.display =
                  "none";
              }}
            />

          </div>


          {/* TITLE */}

          <div className="verify-title">

            <span className="gov-title">
              গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
            </span>

            <span className="bureau-title">
              জনশক্তি কর্মসংস্থান ও প্রশিক্ষণ ব্যুরো
            </span>

          </div>


          {/* RIGHT LOGO */}

          <div className="verify-logo-right">

            <img
              src="/images/govt_logo.png"
              alt="Government Logo"
              onError={(e) => {
                e.currentTarget.style.display =
                  "none";
              }}
            />

          </div>

        </div>


        <div className="verify-content">

          {/* PAGE TITLE */}

          <h5 className="clearance-title">

            <span>
              বহির্গমন ছাড়পত্র
            </span>

            <br />

            <span>
              Emigration Clearance
            </span>

          </h5>


          {/* PERSON */}

          <div className="verify-info-board">

            <div className="verify-pic-wrap">

              <img
                src={photoUrl}
                alt={
                  record.name ||
                  "Photo"
                }

                onError={(e) => {
                  if (
                    e.currentTarget.src.endsWith(
                      "/images/photo.png"
                    )
                  ) {
                    return;
                  }

                  e.currentTarget.src =
                    "/images/photo.png";
                }}
              />

            </div>


            <p className="person-name">
              {displayValue(
                record.name
              )}
            </p>


            <p className="person-meta">

              <span className="meta-label">
                EC No:
              </span>{" "}

              <span>
                {displayValue(
                  record.ec_no
                )}
              </span>

              <br />

              <span className="meta-label">
                EC Date:
              </span>{" "}

              <span>
                {displayValue(
                  formatEcDate(
                    record.ec_date
                  )
                )}
              </span>

            </p>


            <img
              src="/images/card_line.png"
              className="card-line"
              alt=""
            />

            <img
              src="/images/card_star.png"
              className="card-star"
              alt=""
            />

          </div>


          {/* DATA TABLE */}

          <div className="verify-agency-board">

            <table className="verify-table">

              <tbody>

                <tr>
                  <th>
                    Birth Date
                  </th>

                  <td>
                    {displayValue(
                      formatDate(
                        record.birth_date
                      )
                    )}
                  </td>
                </tr>


                <tr>
                  <th>
                    Passport No
                  </th>

                  <td>
                    {displayValue(
                      record.passport_no
                    )}
                  </td>
                </tr>


                <tr>
                  <th>
                    Passport Issue Date
                  </th>

                  <td>
                    {displayValue(
                      formatDate(
                        record.passport_issue_date
                      )
                    )}
                  </td>
                </tr>


                <tr>
                  <th>
                    Passport Expire Date
                  </th>

                  <td>
                    {displayValue(
                      formatDate(
                        record.passport_expire_date
                      )
                    )}
                  </td>
                </tr>


                <tr>
                  <th>
                    Visa No
                  </th>

                  <td>
                    {displayValue(
                      record.visa_no
                    )}
                  </td>
                </tr>


                <tr>
                  <th>
                    Visa Issue Date
                  </th>

                  <td>
                    {displayValue(
                      formatDate(
                        record.visa_issue_date
                      )
                    )}
                  </td>
                </tr>


                <tr>
                  <th>
                    Visa Expire Date
                  </th>

                  <td>
                    {displayValue(
                      formatDate(
                        record.visa_expire_date
                      )
                    )}
                  </td>
                </tr>


                <tr>
                  <th>
                    Referral No
                  </th>

                  <td>
                    {displayValue(
                      record.referral_no
                    )}
                  </td>
                </tr>


                <tr>
                  <th>
                    Recruiting Agency
                  </th>

                  <td>
                    {displayValue(
                      record.recruiting_agency
                    )}
                  </td>
                </tr>


                <tr>
                  <th>
                    Employer
                  </th>

                  <td>
                    {displayValue(
                      record.employer
                    )}
                  </td>
                </tr>


                <tr>
                  <th>
                    Country
                  </th>

                  <td>
                    {displayValue(
                      record.country
                    )}
                  </td>
                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </div>


      {/* ===================================================
          BMET REGISTRATION
      ==================================================== */}

      <div className="verify-card-wrap">

        <div className="verify-secondary-top">

          <div className="secondary-title">
            BMET Registration
          </div>


          <div className="secondary-logos">

            <img
              src="/images/govt_logo.png"
              alt="Government Logo"
            />

            <img
              src="/images/logo.png"
              alt="Logo"
            />

          </div>

        </div>


        <div className="verify-content">

          <div className="secondary-table-box">

            <table className="verify-table">

              <tbody>

                <tr>
                  <th>
                    BMET No
                  </th>

                  <td>
                    {displayValue(
                      record.bmet_no
                    )}
                  </td>
                </tr>


                <tr>
                  <th>
                    Name
                  </th>

                  <td>
                    {displayValue(
                      record.name
                    )}
                  </td>
                </tr>


                <tr>
                  <th>
                    Birth Date
                  </th>

                  <td>
                    {displayValue(
                      formatDate(
                        record.birth_date
                      )
                    )}
                  </td>
                </tr>


                <tr>
                  <th>
                    Gender
                  </th>

                  <td>
                    {displayValue(
                      record.gender
                    )}
                  </td>
                </tr>


                <tr>
                  <th>
                    Blood Group
                  </th>

                  <td>
                    {displayValue(
                      record.blood_group
                    )}
                  </td>
                </tr>


                <tr>
                  <th>
                    NID
                  </th>

                  <td>
                    {displayValue(
                      record.nid
                    )}
                  </td>
                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </div>


      {/* ===================================================
          PASSPORTS
      ==================================================== */}

      <div className="verify-card-wrap">

        <div className="verify-secondary-top">

          <div className="secondary-title">
            Passports
          </div>


          <div className="secondary-logos">

            <img
              src="/images/govt_logo.png"
              alt="Government Logo"
            />

            <img
              src="/images/logo.png"
              alt="Logo"
            />

          </div>

        </div>


        <div className="verify-content">

          <div className="secondary-table-box">

            <table className="verify-table">

              <tbody>

                <tr>
                  <th>
                    Name
                  </th>

                  <td>
                    {displayValue(
                      record.name
                    )}
                  </td>
                </tr>


                <tr>
                  <th>
                    Passport No 1
                  </th>

                  <td>
                    {displayValue(
                      record.passport_no_1
                    )}
                  </td>
                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}