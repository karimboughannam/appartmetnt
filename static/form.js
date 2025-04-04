document.getElementById("apartmentForm").addEventListener("submit", async function (e) {
    e.preventDefault();
  
    const data = {
      person: document.getElementById("person").value,
      phonenumber: document.getElementById("phone").value,
      description: document.getElementById("description").value,
      quality: document.getElementById("quality").value,
      price: document.getElementById("price").value,
      reference_type: document.getElementById("reference_type").value,
      ref_id: document.getElementById("ref_id").value,
      location: document.getElementById("location").value
    };
  
    const response = await fetch("/api/apartments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
  
    if (response.ok) {
      alert("Apartment added successfully");
      clearForm();
    } else {
      alert("Failed to add apartment");
    }
  });
  
  function clearForm() {
    document.getElementById("apartmentForm").reset();
  }
  