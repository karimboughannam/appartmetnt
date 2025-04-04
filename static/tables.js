document.addEventListener("DOMContentLoaded", loadApartments);

function filterTable() {
  const filters = {
    person: document.getElementById("filter-person").value.toLowerCase(),
    phone: document.getElementById("filter-phone").value.toLowerCase(),
    description: document.getElementById("filter-description").value.toLowerCase(),
    quality: document.getElementById("filter-quality").value.toLowerCase(),
    price: document.getElementById("filter-price").value.toLowerCase(),
    reference_type: document.getElementById("filter-reference-type").value.toLowerCase(),
    ref_id: document.getElementById("filter-ref-id").value.toLowerCase(),
    location: document.getElementById("filter-location").value.toLowerCase()
  };

  document.querySelectorAll("#apartmentTable tbody tr").forEach(row => {
    let show = true;
    const cells = row.getElementsByTagName("td");
    if (filters.person && !cells[1].textContent.toLowerCase().includes(filters.person)) show = false;
    if (filters.phone && !cells[2].textContent.toLowerCase().includes(filters.phone)) show = false;
    if (filters.description && !cells[3].textContent.toLowerCase().includes(filters.description)) show = false;
    if (filters.quality && !cells[4].textContent.toLowerCase().includes(filters.quality)) show = false;
    if (filters.price && !cells[5].textContent.toLowerCase().includes(filters.price)) show = false;
    if (filters.reference_type && !cells[6].textContent.toLowerCase().includes(filters.reference_type)) show = false;
    if (filters.ref_id && !cells[7].textContent.toLowerCase().includes(filters.ref_id)) show = false;
    if (filters.location && !cells[8].textContent.toLowerCase().includes(filters.location)) show = false;

    row.style.display = show ? "" : "none";
  });
}

async function loadApartments() {
  const res = await fetch("/api/apartments");
  const data = await res.json();
  const tbody = document.querySelector("#apartmentTable tbody");
  tbody.innerHTML = "";

  data.forEach(apartment => {
    const row = document.createElement("tr");
    row.innerHTML = `
    <td data-label="Number">${apartment.number}</td>
      <td data-label="Person">${apartment.person}</td>
      <td data-label="Phone">
      <a href="https://wa.me/${apartment.phonenumber.replace(/[^0-9]/g, '')}" target="_blank">
        ${apartment.phonenumber}
      </a>
    </td>

      <td data-label="Description">${apartment.description}</td>
      <td data-label="Quality">${apartment.quality}</td>
      <td data-label="Price">${apartment.price}</td>
      <td data-label="Ref Type">${apartment.reference_type}</td>
      <td data-label="Ref ID">${apartment.ref_id}</td>
      <td data-label="Location">${apartment.location}</td>
      <td data-label="Status">${apartment.sold ? "Sold" : "Available"}</td>
      <td class="actions">
        <button class="edit-btn" onclick="toggleEdit(this, '${apartment.id}')">Edit</button>
        <button class="sold-btn" onclick="markAsSold('${apartment.id}')">Sold</button>
        <button class="delete-btn" onclick="deleteApartment('${apartment.id}')">Delete</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

function toggleEdit(btn, id) {
  const row = btn.closest("tr");
  const isEditing = btn.textContent === "Edit";

  if (isEditing) {
    // Convert table cells (except actions) to editable fields
    const cells = row.querySelectorAll("td:not(:last-child)");
    cells.forEach((cell, index) => {
      const value = cell.textContent;
      cell.innerHTML = `<input type="text" value="${value}" data-index="${index}">`;
    });
    btn.textContent = "Save";
  } else {
    // Collect updated data
    const updatedData = {};
    row.querySelectorAll("td:not(:last-child) input").forEach((input, index) => {
      updatedData[input.dataset.index] = input.value;
      input.parentElement.textContent = input.value;
    });

    // Send update request to API
    updateApartment(id, updatedData);
    btn.textContent = "Edit";
  }
}

async function updateApartment(id, data) {
  try {
    const response = await fetch(`/api/apartments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      console.log("Apartment updated successfully");
    } else {
      console.error("Failed to update apartment");
    }
  } catch (error) {
    console.error("Error updating apartment:", error);
  }
}

async function markAsSold(id) {
  try {
    const response = await fetch(`/api/apartments/${id}/sold`, { method: "PUT" });

    if (response.ok) {
      loadApartments();
    } else {
      console.error("Failed to mark apartment as sold");
    }
  } catch (error) {
    console.error("Error marking apartment as sold:", error);
  }
}

async function deleteApartment(id) {
  if (!confirm("Are you sure you want to delete this apartment?")) return;

  try {
    const response = await fetch(`/api/apartments/${id}`, { method: "DELETE" });

    if (response.ok) {
      loadApartments();
    } else {
      console.error("Failed to delete apartment");
    }
  } catch (error) {
    console.error("Error deleting apartment:", error);
  }
}

// Add filter inputs above table
const filterRow = document.createElement("tr");
filterRow.innerHTML = `
  <td></td>
  <td><input id="filter-person" placeholder="Person" oninput="filterTable()"/></td>
  <td><input id="filter-phone" placeholder="Phone" oninput="filterTable()"/></td>
  <td><input id="filter-description" placeholder=" Description" oninput="filterTable()"/></td>
  <td><input id="filter-quality" placeholder="Quality" oninput="filterTable()"/></td>
  <td><input id="filter-price" placeholder="Price" oninput="filterTable()"/></td>
  <td><input id="filter-reference-type" placeholder="Type" oninput="filterTable()"/></td>
  <td><input id="filter-ref-id" placeholder="ID" oninput="filterTable()"/></td>
  <td><input id="filter-location" placeholder="Location" oninput="filterTable()"/></td>
  <td colspan="2"></td>
`;
document.querySelector("#apartmentTable thead").appendChild(filterRow);

// Apply better styling with CSS
const style = document.createElement("style");
style.innerHTML = `
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    background: #ffffff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  }
  th, td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  th {
    background: #007bff;
    color: white;
    font-weight: bold;
  }
  tr:nth-child(even) { background-color: #f9f9f9; }
  .actions {
    display: flex;
    gap: 10px;
    justify-content: center;
  }
  button {
    padding: 8px 12px;
    font-size: 14px;
    font-weight: bold;
    border: none;
    cursor: pointer;
    border-radius: 5px;
    transition: 0.3s;
  }
  .edit-btn { background-color: #28a745; color: white; }
  .sold-btn { background-color: #ffc107; color: black; }
  .delete-btn { background-color: #dc3545; color: white; }
  button:hover { opacity: 0.8; transform: scale(1.05); }
  input { padding: 5px; width: 100%; border: 1px solid #ccc; border-radius: 4px; }
`;
document.head.appendChild(style);

async function markAsSold(id) {
    try {
      const response = await fetch(`/api/apartments/${id}/sold`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        await loadApartments();
      } else {
        console.error('Failed to mark as sold');
      }
    } catch (error) {
      console.error('Error marking as sold:', error);
    }
  }
  
  
  