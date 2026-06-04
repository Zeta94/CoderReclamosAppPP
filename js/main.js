const claimsList = document.querySelector("#claims-list");
const statsContainer = document.querySelector("#stats");
const resultsCount = document.querySelector("#results-count");
const claimForm = document.querySelector("#claim-form");
const searchInput = document.querySelector("#search");
const statusFilter = document.querySelector("#filter-status");
const priorityFilter = document.querySelector("#filter-priority");
const clearFiltersButton = document.querySelector("#clear-filters");

const priorityOrder = {
  Alta: 1,
  Media: 2,
  Baja: 3
};

let claims = [];

document.addEventListener("DOMContentLoaded", loadClaims);
claimForm.addEventListener("submit", createClaim);
searchInput.addEventListener("input", renderApp);
statusFilter.addEventListener("change", renderApp);
priorityFilter.addEventListener("change", renderApp);
clearFiltersButton.addEventListener("click", clearFilters);
claimsList.addEventListener("click", handleClaimAction);

async function loadClaims() {
  try {
    const response = await fetch("data/reclamos.json");

    if (!response.ok) {
      throw new Error("No se pudieron cargar los reclamos iniciales.");
    }

    claims = await response.json();
    renderApp();
  } catch (error) {
    claimsList.innerHTML = `<div class="empty-state">${error.message}</div>`;
  }
}

function renderApp() {
  const filteredClaims = getFilteredClaims();
  renderStats();
  renderClaims(filteredClaims);
}

function getFilteredClaims() {
  const searchText = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;
  const selectedPriority = priorityFilter.value;

  return claims
    .filter((claim) => {
      const matchesSearch =
        claim.cliente.toLowerCase().includes(searchText) ||
        claim.email.toLowerCase().includes(searchText) ||
        claim.descripcion.toLowerCase().includes(searchText);

      const matchesStatus = selectedStatus === "" || claim.estado === selectedStatus;
      const matchesPriority = selectedPriority === "" || claim.prioridad === selectedPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => priorityOrder[a.prioridad] - priorityOrder[b.prioridad]);
}

function renderClaims(claimsToRender) {
  resultsCount.textContent = `${claimsToRender.length} resultado(s)`;

  if (claimsToRender.length === 0) {
    claimsList.innerHTML = '<div class="empty-state">No se encontraron reclamos con los filtros aplicados.</div>';
    return;
  }

  claimsList.innerHTML = claimsToRender.map((claim) => {
    const isClosed = claim.estado === "Cerrado";

    return `
      <article class="claim-card">
        <div class="claim-top">
          <div>
            <h3>${claim.cliente}</h3>
            <p>${claim.email}</p>
          </div>
          <span class="badge priority-${normalizeClassName(claim.prioridad)}">${claim.prioridad}</span>
        </div>

        <div class="badges">
          <span class="badge status-${normalizeClassName(claim.estado)}">${claim.estado}</span>
          <span class="badge">${claim.categoria}</span>
        </div>

        <p>${claim.descripcion}</p>

        <div class="claim-meta">
          <span><strong>ID:</strong> #${claim.id}</span>
          <span><strong>Fecha:</strong> ${formatDate(claim.fecha)}</span>
        </div>

        <button class="status-button" type="button" data-id="${claim.id}" ${isClosed ? "disabled" : ""}>
          ${isClosed ? "Reclamo cerrado" : "Cambiar estado"}
        </button>
      </article>
    `;
  }).join("");
}

function renderStats() {
  const stats = claims.reduce((accumulator, claim) => {
    accumulator.total += 1;

    if (claim.estado === "Abierto") accumulator.open += 1;
    if (claim.estado === "En proceso") accumulator.inProcess += 1;
    if (claim.estado === "Cerrado") accumulator.closed += 1;
    if (claim.prioridad === "Alta") accumulator.highPriority += 1;

    return accumulator;
  }, {
    total: 0,
    open: 0,
    inProcess: 0,
    closed: 0,
    highPriority: 0
  });

  const statsItems = [
    { label: "Total de reclamos", value: stats.total },
    { label: "Abiertos", value: stats.open },
    { label: "En proceso", value: stats.inProcess },
    { label: "Cerrados", value: stats.closed },
    { label: "Prioridad alta", value: stats.highPriority }
  ];

  statsContainer.innerHTML = statsItems.map((item) => `
    <article class="stat-card">
      <span>${item.label}</span>
      <strong>${item.value}</strong>
    </article>
  `).join("");
}

async function createClaim(event) {
  event.preventDefault();

  const formData = new FormData(claimForm);
  const newClaim = {
    id: getNextId(),
    cliente: formData.get("cliente").trim(),
    email: formData.get("email").trim(),
    categoria: formData.get("categoria"),
    descripcion: formData.get("descripcion").trim(),
    estado: "Abierto",
    prioridad: formData.get("prioridad"),
    fecha: new Date().toISOString().slice(0, 10)
  };

  if (!isValidClaim(newClaim)) {
    await Swal.fire({
      icon: "error",
      title: "Formulario incompleto",
      text: "Completá todos los campos para crear el reclamo."
    });
    return;
  }

  claims.push(newClaim);
  claimForm.reset();
  renderApp();

  Swal.fire({
    icon: "success",
    title: "Reclamo creado",
    text: `El reclamo #${newClaim.id} fue registrado correctamente.`,
    timer: 1800,
    showConfirmButton: false
  });
}

function isValidClaim(claim) {
  return Boolean(
    claim.cliente &&
    claim.email &&
    claim.categoria &&
    claim.descripcion &&
    claim.prioridad
  );
}

async function handleClaimAction(event) {
  const button = event.target.closest(".status-button");

  if (!button) return;

  const claimId = Number(button.dataset.id);
  const claim = claims.find((item) => item.id === claimId);

  if (!claim || claim.estado === "Cerrado") return;

  const nextStatus = getNextStatus(claim.estado);
  const result = await Swal.fire({
    icon: "question",
    title: "Cambiar estado",
    text: `El reclamo #${claim.id} pasará de "${claim.estado}" a "${nextStatus}".`,
    showCancelButton: true,
    confirmButtonText: "Confirmar",
    cancelButtonText: "Cancelar"
  });

  if (!result.isConfirmed) return;

  claim.estado = nextStatus;
  renderApp();

  if (claim.estado === "Cerrado") {
    Swal.fire({
      icon: "success",
      title: "Reclamo cerrado",
      text: `El reclamo #${claim.id} fue cerrado correctamente.`
    });
  }
}

function getNextStatus(currentStatus) {
  const statusFlow = {
    Abierto: "En proceso",
    "En proceso": "Cerrado",
    Cerrado: "Cerrado"
  };

  return statusFlow[currentStatus];
}

function clearFilters() {
  searchInput.value = "";
  statusFilter.value = "";
  priorityFilter.value = "";
  renderApp();
}

function getNextId() {
  const highestId = claims.reduce((maxId, claim) => Math.max(maxId, claim.id), 0);
  return highestId + 1;
}

function normalizeClassName(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

function formatDate(dateValue) {
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString("es-AR");
}
