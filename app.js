"use strict";

// =============================================
// 1. DATOS: PRODUCTOS Y MARCAS DE EJEMPLO
// Reemplaza estos datos por los de tu proyecto.
// =============================================

const productos = [
  {
    id: "auriculares-a",
    nombre: "SoundBeat Pro",
    marca: "SoundBeat",
    categoria: "tecnologia",
    precio: 180000,
    detalle: "Auriculares inalámbricos · Ejemplo"
  },
  {
    id: "auriculares-b",
    nombre: "AudioFlex Air",
    marca: "AudioFlex",
    categoria: "tecnologia",
    precio: 150000,
    detalle: "Auriculares Bluetooth · Ejemplo"
  },
  {
    id: "reloj-a",
    nombre: "FitPulse Active",
    marca: "FitPulse",
    categoria: "tecnologia",
    precio: 220000,
    detalle: "Reloj deportivo · Ejemplo"
  },
  {
    id: "reloj-b",
    nombre: "MoveTrack One",
    marca: "MoveTrack",
    categoria: "tecnologia",
    precio: 190000,
    detalle: "Reloj inteligente · Ejemplo"
  },
  {
    id: "crema-a",
    nombre: "HidraPlus",
    marca: "HidraPlus",
    categoria: "cuidado",
    precio: 45000,
    detalle: "Crema hidratante · Ejemplo"
  },
  {
    id: "crema-b",
    nombre: "DermaSoft",
    marca: "DermaSoft",
    categoria: "cuidado",
    precio: 52000,
    detalle: "Crema facial · Ejemplo"
  },
  {
    id: "limpiador-a",
    nombre: "PureSkin",
    marca: "PureSkin",
    categoria: "cuidado",
    precio: 38000,
    detalle: "Limpiador facial · Ejemplo"
  },
  {
    id: "limpiador-b",
    nombre: "FreshDerm",
    marca: "FreshDerm",
    categoria: "cuidado",
    precio: 42000,
    detalle: "Gel limpiador · Ejemplo"
  },
  {
    id: "licuadora-a",
    nombre: "MixHome 500",
    marca: "MixHome",
    categoria: "hogar",
    precio: 160000,
    detalle: "Licuadora doméstica · Ejemplo"
  },
  {
    id: "licuadora-b",
    nombre: "CocinaPlus",
    marca: "CocinaPlus",
    categoria: "hogar",
    precio: 140000,
    detalle: "Licuadora compacta · Ejemplo"
  },
  {
    id: "cafetera-a",
    nombre: "CaféPro Mini",
    marca: "CaféPro",
    categoria: "hogar",
    precio: 210000,
    detalle: "Cafetera doméstica · Ejemplo"
  },
  {
    id: "cafetera-b",
    nombre: "AromaHome",
    marca: "AromaHome",
    categoria: "hogar",
    precio: 185000,
    detalle: "Cafetera compacta · Ejemplo"
  },
  {
    id: "zapatillas-a",
    nombre: "RunFast",
    marca: "RunFast",
    categoria: "deporte",
    precio: 240000,
    detalle: "Zapatillas deportivas · Ejemplo"
  },
  {
    id: "zapatillas-b",
    nombre: "UrbanMove",
    marca: "UrbanMove",
    categoria: "deporte",
    precio: 200000,
    detalle: "Calzado deportivo · Ejemplo"
  },
  {
    id: "botella-a",
    nombre: "HydroGo",
    marca: "HydroGo",
    categoria: "deporte",
    precio: 55000,
    detalle: "Botella reutilizable · Ejemplo"
  },
  {
    id: "botella-b",
    nombre: "SportFlow",
    marca: "SportFlow",
    categoria: "deporte",
    precio: 48000,
    detalle: "Botella deportiva · Ejemplo"
  }
];

const segmentos = {
  general: "Comprador general",
  ahorro: "Comprador que prioriza el ahorro",
  premium: "Comprador que prioriza prestaciones"
};

const contextos = {
  valor: {
    nombre: "Valor por dinero",
    pregunta: "¿Cuál elegirías por lo que ofrece frente a su precio?"
  },
  calidad: {
    nombre: "Calidad percibida",
    pregunta: "¿Cuál te inspira más confianza por sus características?"
  },
  compra: {
    nombre: "Intención de compra",
    pregunta: "Si tuvieras que decidir hoy, ¿cuál comprarías?"
  }
};

const categorias = {
  tecnologia: "Tecnología",
  cuidado: "Cuidado personal",
  hogar: "Hogar",
  deporte: "Deporte"
};

// =============================================
// 2. CONFIGURACIÓN E INICIALIZACIÓN
// =============================================

const RATING_INICIAL = 1000;
const K = 32;
// Diseño propio: la intensidad del ajuste cambia según el perfil.
// Ahorro: cambios más suaves (preferencias más estables).
// Prestaciones: cambios más fuertes (decisiones más marcadas).
const K_POR_PERFIL = { general: 32, ahorro: 24, premium: 40 };
const STORAGE_KEY = "bestbuy_state_v1";

function bucketKey(segmento, contexto, categoria) {
  return `${segmento}__${contexto}__${categoria}`;
}

function productosDe(categoria) {
  return productos.filter(p => p.categoria === categoria);
}

function defaultState() {
  const buckets = {};

  for (const segmento of Object.keys(segmentos)) {
    for (const contexto of Object.keys(contextos)) {
      for (const categoria of Object.keys(categorias)) {
        const key = bucketKey(segmento, contexto, categoria);
        buckets[key] = {};

        for (const producto of productosDe(categoria)) {
          buckets[key][producto.id] = RATING_INICIAL;
        }
      }
    }
  }

  return { buckets, votes: [] };
}

function isValidState(data) {
  return Boolean(
    data &&
    typeof data === "object" &&
    data.buckets &&
    typeof data.buckets === "object" &&
    Array.isArray(data.votes)
  );
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();

    const data = JSON.parse(raw);

    return isValidState(data) ? data : defaultState();
  } catch (error) {
    console.warn("No fue posible cargar los datos guardados.", error);
    return defaultState();
  }
}

let state = loadState();

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.warn("No fue posible guardar los datos.", error);
    return false;
  }
}

// =============================================
// 3. MOTOR ELO: SE CONSERVA LA LÓGICA ORIGINAL
// =============================================

function expectedScore(ra, rb) {
  return 1 / (1 + Math.pow(10, (rb - ra) / 400));
}

function updateElo(bucket, idA, idB, winner, k = K) {
  const ra = bucket[idA];
  const rb = bucket[idB];

  const ea = expectedScore(ra, rb);
  const eb = expectedScore(rb, ra);

  const sa = winner === "A" ? 1 : 0;
  const sb = winner === "B" ? 1 : 0;

  bucket[idA] = ra + k * (sa - ea);
  bucket[idB] = rb + k * (sb - eb);
}

// =============================================
// 4. COMPARACIÓN Y CÁLCULO DEL RANKING
// =============================================

function randomPair(categoria) {
  const disponibles = productosDe(categoria);

  if (disponibles.length < 2) return null;

  const indexA = Math.floor(Math.random() * disponibles.length);
  let indexB = Math.floor(Math.random() * (disponibles.length - 1));

  // Garantiza que A y B sean productos diferentes.
  if (indexB >= indexA) indexB++;

  return [disponibles[indexA], disponibles[indexB]];
}

function topN(bucket, categoria, n = 10) {
  return productosDe(categoria)
    .map(producto => ({
      ...producto,
      rating: bucket[producto.id] ?? RATING_INICIAL
    }))
    .sort((a, b) => b.rating - a.rating || a.nombre.localeCompare(b.nombre))
    .slice(0, n);
}

// =============================================
// 5. CONEXIÓN CON LA INTERFAZ HTML
// =============================================

const segmentSelect = document.getElementById("segmentSelect");
const contextSelect = document.getElementById("contextSelect");
const categorySelect = document.getElementById("categorySelect");

const questionEl = document.getElementById("question");
const labelA = document.getElementById("labelA");
const labelB = document.getElementById("labelB");
const detailA = document.getElementById("detailA");
const detailB = document.getElementById("detailB");

const btnA = document.getElementById("btnA");
const btnB = document.getElementById("btnB");
const btnNewPair = document.getElementById("btnNewPair");
const btnExport = document.getElementById("btnExport");
const btnReset = document.getElementById("btnReset");

const topBox = document.getElementById("topBox");
const feedback = document.getElementById("feedback");
const voteCount = document.getElementById("voteCount");
const activeProfile = document.getElementById("activeProfile");
const rankingNote = document.getElementById("rankingNote");

let currentA = null;
let currentB = null;

// =============================================
// 6. LLENAR LOS SELECTORES
// =============================================

function fillSelect(selectEl, options) {
  selectEl.replaceChildren();

  for (const [key, value] of Object.entries(options)) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = `${value}`;
    selectEl.appendChild(option);
  }
}

fillSelect(segmentSelect, segmentos);
fillSelect(contextSelect, Object.fromEntries(
  Object.entries(contextos).map(([key, value]) => [
    key,
    value.nombre
  ])
));
fillSelect(categorySelect, categorias);

segmentSelect.value = "general";
contextSelect.value = "valor";
categorySelect.value = "tecnologia";

function getCurrentBucket() {
  return state.buckets[
    bucketKey(
      segmentSelect.value,
      contextSelect.value,
      categorySelect.value
    )
  ];
}

// =============================================
// 7. MOSTRAR UN NUEVO ENFRENTAMIENTO
// =============================================

function refreshQuestion() {
  questionEl.textContent = contextos[contextSelect.value].pregunta;
  activeProfile.textContent = segmentos[segmentSelect.value];
}

function formatPrice(price) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(price);
}

function displayProduct(product, labelEl, detailEl) {
  labelEl.textContent = product.nombre;
  detailEl.textContent =
    `${product.marca} · ${formatPrice(product.precio)} · ${product.detalle}`;
}

function newDuel() {
  const pair = randomPair(categorySelect.value);

  if (!pair) {
    currentA = null;
    currentB = null;
    feedback.textContent = "Necesitas al menos dos productos en esta categoría.";
    btnA.disabled = true;
    btnB.disabled = true;
    return;
  }

  [currentA, currentB] = pair;

  displayProduct(currentA, labelA, detailA);
  displayProduct(currentB, labelB, detailB);

  btnA.disabled = false;
  btnB.disabled = false;

  feedback.textContent = "Selecciona el producto que prefieras.";
  refreshQuestion();
}

// =============================================
// 8. DIBUJAR EL TOP 10
// =============================================

function renderTop() {
  const bucket = getCurrentBucket();
  const categoria = categorySelect.value;
  const ranking = topN(bucket, categoria, 10);

  topBox.replaceChildren();

  if (ranking.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No hay productos para mostrar.";
    topBox.appendChild(empty);
    return;
  }

  ranking.forEach((producto, index) => {
    const row = document.createElement("div");
    row.className = "toprow";

    const name = document.createElement("div");
    name.className = "rank-name";

    const number = document.createElement("span");
    number.className = "rank-number";
    number.textContent = `${index + 1}.`;

    const title = document.createElement("span");
    title.textContent = producto.nombre;

    name.append(number, title);

    const score = document.createElement("span");
    score.className = "rank-score";
    score.textContent = producto.rating.toFixed(1);

    row.append(name, score);
    topBox.appendChild(row);
  });

  const key = bucketKey(
    segmentSelect.value,
    contextSelect.value,
    categorySelect.value
  );

  const votesInBucket = state.votes.filter(vote =>
    vote.bucket === key
  ).length;

  rankingNote.textContent =
    `${votesInBucket} votos en este ranking. ` +
    "Las puntuaciones iniciales son iguales.";
}

// =============================================
// 9. REGISTRAR UN VOTO Y ACTUALIZAR ELO
// =============================================

function vote(winner) {
  if (!currentA || !currentB) return;

  const key = bucketKey(
    segmentSelect.value,
    contextSelect.value,
    categorySelect.value
  );

  const bucket = state.buckets[key];

  if (!bucket) return;

  updateElo(
    bucket,
    currentA.id,
    currentB.id,
    winner,
    K_POR_PERFIL[segmentSelect.value] ?? K
  );

  const ganador = winner === "A" ? currentA : currentB;
  const perdedor = winner === "A" ? currentB : currentA;

  state.votes.push({
    ts: new Date().toISOString(),
    segmento: segmentos[segmentSelect.value],
    contexto: contextos[contextSelect.value].nombre,
    categoria: categorias[categorySelect.value],
    bucket: key,
    A: currentA.nombre,
    marcaA: currentA.marca,
    B: currentB.nombre,
    marcaB: currentB.marca,
    ganador: ganador.nombre,
    marcaGanadora: ganador.marca,
    perdedor: perdedor.nombre,
    marcaPerdedora: perdedor.marca
  });

  const saved = saveState();

  voteCount.textContent = String(state.votes.length);
  renderTop();
  newDuel();

  feedback.textContent = saved
    ? `Elegiste ${ganador.nombre}. El ranking ha sido actualizado.`
    : `Elegiste ${ganador.nombre}. Atención: el navegador no confirmó el guardado.`;
}

// =============================================
// 10. EVENTOS DE LOS BOTONES Y SELECTORES
// =============================================

btnA.addEventListener("click", () => vote("A"));
btnB.addEventListener("click", () => vote("B"));

btnNewPair.addEventListener("click", newDuel);

function changeFilters() {
  refreshQuestion();
  renderTop();
  newDuel();
}

segmentSelect.addEventListener("change", changeFilters);
contextSelect.addEventListener("change", changeFilters);
categorySelect.addEventListener("change", changeFilters);

btnReset.addEventListener("click", () => {
  const confirmed = confirm(
    "¿Quieres borrar todos los votos y rankings guardados " +
    "por BestBuy en este navegador?"
  );

  if (!confirmed) return;

  state = defaultState();

  if (!saveState()) {
    feedback.textContent =
      "No se pudo guardar el reinicio en el navegador.";
    return;
  }

  voteCount.textContent = "0";
  feedback.textContent = "Datos locales reiniciados.";
  renderTop();
  newDuel();
});

// =============================================
// 11. EXPORTAR VOTOS A CSV
// =============================================

function csvCell(value) {
  const safe = String(value ?? "").replace(/"/g, '""');
  return `"${safe}"`;
}

btnExport.addEventListener("click", () => {
  if (state.votes.length === 0) {
    alert("Todavía no hay votos para exportar.");
    return;
  }

  const headers = [
    "ts",
    "segmento",
    "contexto",
    "categoria",
    "A",
    "marcaA",
    "B",
    "marcaB",
    "ganador",
    "marcaGanadora",
    "perdedor",
    "marcaPerdedora"
  ];

  const rows = state.votes.map(vote =>
    headers.map(header => csvCell(vote[header])).join(",")
  );

  const csv = "﻿" + [
    headers.map(csvCell).join(","),
    ...rows
  ].join("\r\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "bestbuy_votos.csv";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
});

// =============================================
// 12. INICIAR LA APLICACIÓN
// =============================================

voteCount.textContent = String(state.votes.length);
refreshQuestion();
renderTop();
newDuel();
