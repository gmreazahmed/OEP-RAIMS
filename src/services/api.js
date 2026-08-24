const API_URL = (
  import.meta.env.VITE_API_URL || ""
).replace(/\/$/, "");

/* =========================================================
   API REQUEST
   ========================================================= */

async function request(url, options = {}) {
  if (!API_URL) {
    throw new Error(
      "API URL is not configured."
    );
  }

  try {
    const response = await fetch(
      `${API_URL}${url}`,
      {
        ...options,
        headers: {
          Accept: "application/json",
          ...(options.headers || {}),
        },
      }
    );

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error(
        "Invalid response from server."
      );
    }

    if (
      !response.ok ||
      data?.success === false
    ) {
      throw new Error(
        data?.message ||
        "API request failed."
      );
    }

    return data;

  } catch (error) {

    if (
      error instanceof TypeError
    ) {
      throw new Error(
        "Unable to connect to the API server."
      );
    }

    throw error;
  }
}

/* =========================================================
   GET ALL RECORDS
   ========================================================= */

export async function getRecords() {
  return request(
    "/verification/list.php"
  );
}

/* =========================================================
   GET SINGLE RECORD
   EC No দিয়ে
   ========================================================= */

export async function getRecord(ecNo) {
  const code = String(ecNo || "").trim();

  if (!code) {
    throw new Error(
      "EC No is required."
    );
  }

  return request(
    `/verification/get.php?code=${encodeURIComponent(
      code
    )}`
  );
}

/* =========================================================
   CREATE RECORD
   ========================================================= */

export async function createRecord(formData) {
  if (!(formData instanceof FormData)) {
    throw new Error(
      "Form data is required."
    );
  }

  return request(
    "/verification/create.php",
    {
      method: "POST",
      body: formData,
    }
  );
}

/* =========================================================
   UPDATE RECORD
   ========================================================= */

export async function updateRecord(formData) {
  if (!(formData instanceof FormData)) {
    throw new Error(
      "Form data is required."
    );
  }

  return request(
    "/verification/update.php",
    {
      method: "POST",
      body: formData,
    }
  );
}

/* =========================================================
   DELETE RECORD
   ========================================================= */

export async function deleteRecord(id) {
  if (
    id === undefined ||
    id === null ||
    String(id).trim() === ""
  ) {
    throw new Error(
      "Record ID is required."
    );
  }

  const formData = new FormData();

  formData.append(
    "id",
    String(id)
  );

  return request(
    "/verification/delete.php",
    {
      method: "POST",
      body: formData,
    }
  );
}