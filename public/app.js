/* =====================================================
 VERSIÓN DE LA APP
===================================================== */
(async function versionGuard() {
  try {
    const res = await fetch("/version.json", { cache: "no-store" });
    const { version } = await res.json();

    const url = new URL(window.location.href);
    const urlVersion = url.searchParams.get("_v");

    // 🔒 SOLO redirigir si la URL no tiene la versión actual
    if (urlVersion !== version) {
      url.searchParams.set("_v", version);
      window.location.replace(url.toString());
    }

  } catch (e) {}
})();


/* =====================================================
 PORTADA E INICIALIZACIÓN DE LA APP
===================================================== */

async function iniciarAplicacion() {
  initMapa();
  await cargarCoordenadas();
  initUI();
  expandPanel();
}

/* =====================================================
PORTADA – LOADING DE RECURSOS
===================================================== */

async function precargarImagen(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.src = src;
    img.onload = async () => {
      if (img.decode) {
        try { await img.decode(); } catch {}
      }
      resolve();
    };
    img.onerror = resolve;
  });
}

async function precargarAudios() {
  const audios = [
    "assets/sonidos/ascensor.mp3",
    "assets/sonidos/llega.mp3",
    "assets/sonidos/walk.mp3"
  ];

  audios.forEach(src => {
    const audio = new Audio(src);
    audio.preload = "auto";
    audio.load();
  });
}

async function precargarRecursos() {
  const imagenes = [
  "assets/fotos/LabTurnos.webp",
  "assets/fotos/Muestra.webp",
  "assets/fotos/Rayos-D.webp",
  "assets/fotos/guardia.webp",
  "assets/fotos/uro.webp",
  "assets/fotos/TraumatoSala.webp",
  "assets/fotos/meson.webp",
  "assets/fotos/farma.webp",
  "assets/fotos/audi.webp",
  "assets/fotos/vacunas.webp",
  "assets/fotos/Int-Inf.webp",
  "assets/fotos/Guar-Ped.webp",
  "assets/fotos/Endoc.webp",
  "assets/fotos/Nuclear.webp",
  "assets/fotos/Gastro.webp",
  "assets/fotos/Traumato.webp",
  "assets/fotos/Jota.webp",
  "assets/fotos/Anato.webp",
  "assets/fotos/Patri.webp",
  "assets/fotos/Int-Ps.webp",
  "assets/fotos/cocina.webp",
  "assets/fotos/ufi.webp",
  "assets/fotos/Bio.webp",
  "assets/fotos/hemote.webp",
  "assets/fotos/Familiar.webp",
  "assets/fotos/confi.webp",
  "assets/fotos/Neuro.webp",
  "assets/fotos/odonto.webp",
  "assets/fotos/Pami.webp",
  "assets/fotos/Terapia.webp",
  "assets/fotos/coope.webp",
  "assets/fotos/Cardio.webp",
  "assets/fotos/onco.webp",
  "assets/fotos/video.webp",
  "assets/fotos/gin-guar.webp",
  "assets/fotos/otorrino.webp",
  "assets/fotos/int-mat.webp",
  "assets/fotos/Cli-Gine.webp",
  "assets/fotos/kine.webp",
  "assets/fotos/diali.webp",
  "assets/fotos/tomo.webp",
  "assets/fotos/Rayos-H.webp",
  "assets/fotos/dermato.webp",
  "assets/fotos/As-Guardia.webp",
  "assets/fotos/As-D.webp",
  "assets/fotos/As-H.webp",
  "assets/fotos/As-I.webp",
  "assets/mapas/dss.webp",
  "assets/mapas/h1.webp",
  "assets/mapas/h2.webp",
  "assets/mapas/i1.webp",
  "assets/mapas/i2.webp",
  "assets/mapas/pb.webp",
  "assets/mapas/x1.webp",
  "assets/mapas/xss.webp"
  ];

  await Promise.all(imagenes.map(precargarImagen));

  await precargarAudios();
}


function habilitarBotonAcceso() {
  const btn = document.getElementById("btnAccederMapa");
  if (!btn) return;

  btn.classList.remove("loading");
  btn.querySelector(".spinner").remove();
  btn.querySelector(".btn-text").textContent = "Accedé al Mapa Interactivo  ";
}

document.addEventListener("DOMContentLoaded", async () => {
  const portada = document.getElementById("portada");
  const btnAcceder = document.getElementById("btnAccederMapa");

  // ✅ Pintar versión en la portada
  const elVer = document.getElementById("appVersion");
  if (elVer && window.APP_VERSION) elVer.textContent =  window.APP_VERSION;

  if (!portada || !btnAcceder) return;

  await precargarRecursos();
  await new Promise(r => setTimeout(r, 2000));
  habilitarBotonAcceso();

  btnAcceder.addEventListener("click", async () => {
    portada.classList.add("portada-hide");
    setTimeout(async () => {
      portada.style.display = "none";
      await iniciarAplicacion();
    }, 300);
  });
});



/* =====================================================
 RESPONSIVE DE CELULARES
===================================================== */

function fixViewport() {
  const vh = window.innerHeight * 0.01;
  const vw = window.innerWidth * 0.01;

  document.documentElement.style.setProperty("--vh", `${vh}px`);
  document.documentElement.style.setProperty("--vw", `${vw}px`);
}

window.addEventListener("resize", fixViewport);
window.addEventListener("orientationchange", fixViewport);
fixViewport();

/* =====================================================
0. SWITCH DEV Y FIREBASE
===================================================== */

const IS_DEV = location.hostname === "localhost";

// 🛠️ editor SOLO en desarrollo
if (IS_DEV) {
  window.addEventListener("load", () => {
    const script = document.createElement("script");
    script.src = "/dev/editor-tools.js";
    document.body.appendChild(script);
  });
}

/* =====================================================
1. UTILIDADES / DEBUG
===================================================== */
const userIcon = L.icon({
  iconUrl: "assets/person.webp",
  iconSize: [80, 80],
  iconAnchor: [40, 80],   // pies apoyados en el punto
  popupAnchor: [0, -32]
});


function nivelDePlano(planoId) {
  if (planoId === "pb") return 0;
  if (planoId.endsWith("ss")) return -1;
  if (planoId.endsWith("1")) return 1;
  if (planoId.endsWith("2")) return 2;
  return 0; // fallback
}

function calcularDireccion(planoActual, planoDestino) {
  const a = nivelDePlano(planoActual);
  const b = nivelDePlano(planoDestino);

  // 👉 devolvemos la dirección **del ascensor**
  //   b > a  → sube
  //   b <= a → baja
  return b > a ? "sube" : "baja";

  
}

/* =====================================================
2. VARIABLES GLOBALES CONTROLADAS
===================================================== */

let inputActivo = "origen"; // "origen" | "destino"
let origenSeleccionado = null;
let destinoSeleccionado = null;
let rutaVerde = null;
let panelState = "expanded";
let ui = null
let mapPB = null
let fotosServicio = null;
let origenMarker = null;
let cursorMarker = null;
let audioWalk = null;
let audioLlego = null;
let audioHabilitado = false;
let ultimoCaminoIds = null;
let marcadorLlegada = null;
let huboRecorrido = false;
let planoVerticalActual = "pb";
let audioAscensor = null;

/* =====================================================
4. MAPA LEAFLET — INIT
===================================================== */

const PLANOS_CONFIG = {
  "pb": {
    image: "assets/mapas/pb.webp"
  },
  "h1":{
    image: "assets/mapas/h1.webp"
  },
  "h2": {
    image: "assets/mapas/h2.webp"
  },
  "i1": {
    image: "assets/mapas/i1.webp"
  },
  "i2": {
    image: "assets/mapas/i2.webp"
  },
  "x1": {
    image: "assets/mapas/x1.webp"
  },
  "xss": {
    image: "assets/mapas/xss.webp"
  },
  "dss": {
    image: "assets/mapas/dss.webp"
  }
  
};

function initMapa() {
  mapPB = L.map("mapPB", {
    crs: L.CRS.Simple,
    zoomControl: false,
    attributionControl: false,
    touchZoom: true,
    dragging: true,
    maxZoom: 2
  });

  window.map = mapPB;

  const imageWidth = 440;
  const imageHeight = 760;
  const bounds = [[0, 0], [imageHeight, imageWidth]];

  window.MAP_BOUNDS = bounds;
  window.overlaysPorPlano = {};

  Object.entries(PLANOS_CONFIG).forEach(([planoId, cfg]) => {
    const overlay = L.imageOverlay(cfg.image, bounds).addTo(mapPB);

    overlay.setOpacity(planoId === "pb" ? 1 : 0);
    window.overlaysPorPlano[planoId] = overlay;
  });

  
  //setAppHeight();

  // calcular zoom cuando el viewport ya está estable
  requestAnimationFrame(() => {
    mapPB.invalidateSize();
    mapPB.fitBounds(bounds);
  });

  mapPB.setMaxBounds(bounds);
  mapPB.options.maxBoundsViscosity = 1.0;
}


/* =====================================================
5. CARGA DE DATOS
===================================================== */

function cargarCoordenadas() {
  return fetch("coordenadas.json")
    .then(res => res.json())
    .then(data => {
      window.coordenadas = data;
      console.log("📦 coordenadas.json cargado");
    })
    .catch(err => {
      console.error("❌ Error cargando coordenadas.json", err);
    });
}

/* =====================================================
7. UI / INTERACCIONES
===================================================== */

const handle = document.querySelector(".panel-handle");

handle.addEventListener("click", (e) => {
  if (panelState === "expanded") {
    collapsePanel();
    e.stopPropagation();
  }
});

function bindGlobalClicks() {
  document.addEventListener("click", (e) => {
    // si el click fue dentro del panel, no hago nada
    if (e.target.closest("#topPanel")) return;

    resetVisualBuscador();
  });
}

function bindPanelReset() {
  ui.panel.addEventListener("click", (e) => {

    // ❌ clicks que NO deben resetear
    if (
      e.target.closest("input") ||
      e.target.closest("#results") ||
      e.target.closest(".sugerencia") ||
      e.target.closest("#panelHandle")
    ) {
      return;
    }

    // 👉 click en zona libre del panel
    resetVisualBuscador();
  });
}


function expandPanel() {
  ui.panel.style.transform = "";
  ui.panel.classList.add("expanded");
  ui.panel.classList.remove("collapsed");
  panelState = "expanded";
}

function collapsePanel() {
  const handleHeight = ui.panelHandle.offsetHeight;

  ui.panel.style.transform =
    `translateY(-${ui.panel.offsetHeight - handleHeight}px)`;

  ui.panel.classList.add("collapsed");
  ui.panel.classList.remove("expanded");
  panelState = "collapsed";
}


function bindPanelUX() {

  // 🔹 TAP EN PANEL COLAPSADO → EXPANDIR
  ui.panel.addEventListener("click", (e) => {
    if (panelState === "collapsed") {
      expandPanel();
      e.stopPropagation();
    }
  });

  // 🔹 TAP EN HANDLE (solo cuando está EXPANDIDO) → COLAPSAR
  const handle = document.getElementById("panelHandle");

  if (handle) {
    handle.addEventListener("click", (e) => {
      if (panelState === "expanded") {
        collapsePanel();
        e.stopPropagation();
      }
    });
  }
}

function onIniciarClick(e) {

  
  e.stopPropagation(); // ⛔ CLAVE

  if (!origenSeleccionado || !destinoSeleccionado) return;

    // 🧹 limpiar llegada anterior
  if (marcadorLlegada) {
    marcadorLlegada.remove();
    marcadorLlegada = null;
  }

  // 🧹 ocultar carpeta de fotos de recorrido anterior
  const fotoTrayecto = document.getElementById("fotoTrayecto");
  if (fotoTrayecto) {
    fotoTrayecto.classList.add("hidden");
    fotoTrayecto
      .querySelector(".foto-trayecto-minis")
      ?.replaceChildren();
  }

  // 🧹 reset lógico de fotos
  fotosGuardadas.length = 0;

  huboRecorrido = true; // 👈 CLAVE

  iniciarAudio();

  const inicio = origenSeleccionado.nodo;
  const fin = destinoSeleccionado.nodo;

  const camino = calcularRecorrido(inicio, fin);

  // 🧹 limpiar inputs (el estado ya vive en "confirmados")
  ui.inputDesde.value = "";
  ui.inputHacia.value = "";
  ui.resultsList.innerHTML = "";
  ui.panel.classList.remove("mostrando-resultados");
  ui.confirmados.classList.remove("hidden");


  collapsePanel();
  ultimoCaminoIds = camino;
  if (btnReplay) btnReplay.classList.add("hidden");
  recorridoEnCurso = true;

  setTimeout(() => {
    
     dibujarCamino(camino).finally(() => {
      recorridoEnCurso = false;
      if (btnReplay) btnReplay.classList.remove("hidden");
    });
  }, 1000);
}

function initUI() {
  ui = {
    inputDesde: document.getElementById("inputDesde"),
    inputHacia: document.getElementById("searchInput"),
    resultsList: document.getElementById("results"),
    confirmados: document.getElementById("confirmados"),
    confirmDesde: document.getElementById("confirmDesde"),
    confirmHacia: document.getElementById("confirmHacia"),
    panelHandle: document.getElementById("panelHandle"),
    panel: document.getElementById("topPanel"),
    indicator: document.getElementById("panelIndicator"),
    btnIniciar: document.getElementById("btnIniciar"),
    // repeatBtn: document.getElementById("repeatBtn"), próximamente por canal 22 a las 19 hs
  };

  const contenedor = document.getElementById("fotoTrayecto");
    if (contenedor) {
      contenedor.addEventListener("click", abrirVisor);
    }


  // 🔒 Validación temprana (opcional pero MUY recomendable)
  if (!ui.panel || !ui.inputDesde || !ui.inputHacia) {
    console.error("UI incompleta, abortando initUI");
    return;
  }

  // 🔹 Sub-inits de UI
  initBuscador(ui);
  bindPanelUX();
  bindGlobalClicks();
  bindPanelReset();

  // 🔹 Botones simples
  if (ui.btnIniciar) {
    ui.btnIniciar.addEventListener("click", onIniciarClick);
  }

}

function resetVisualBuscador() {
  const hint = document.getElementById("hintBusqueda");
  if (!hint) return;

  // 🔹 limpiar resultados (incluye sugerencia amarilla)
  ui.resultsList.innerHTML = "";
  ui.resultsList.style.display = "none";
  ui.resultsList.style.pointerEvents = "none";

  // 🔹 sacar estado de resultados
  ui.panel.classList.remove("mostrando-resultados");

  // 🔹 volver al estado inicial SOLO si:
  // - inputs vacíos
  // - y ningún input tiene foco
  const hayFoco =
    document.activeElement === ui.inputDesde ||
    document.activeElement === ui.inputHacia;

  if (!ui.inputDesde.value && !ui.inputHacia.value && !hayFoco) {
    hint.classList.remove("hidden");
  }
}



function resetUIParaNuevaBusqueda() {
  origenSeleccionado = null;
  destinoSeleccionado = null;

  ui.confirmDesde.textContent = "";
  ui.confirmHacia.textContent = "";
  ui.confirmados.classList.add("hidden");

  ui.btnIniciar.classList.add("hidden");

  // 🧹 limpiar resultados / sugerencias
  ui.resultsList.innerHTML = "";

  // ✍️ volver a mostrar el hint blanco
  const hint = document.getElementById("hintBusqueda");
  if (hint) hint.classList.remove("hidden");
}


////////////////////////////////////////
// BUSCADOR Y SELECCIÓN DE ORIGEN/DESTINO
////////////////////////////////////////

function initBuscador(ui) {
  const { inputDesde, inputHacia, resultsList, confirmados, confirmDesde, confirmHacia } = ui;
  const ENTRADA_SALIDA = "Entrada Principal / Salida";
  const hint = document.getElementById("hintBusqueda");

  function ocultarResults() {
    ui.resultsList.innerHTML = "";
    ui.resultsList.style.display = "none";
    ui.resultsList.style.pointerEvents = "none";
  }

  function mostrarResults() {
    ui.resultsList.style.display = "block";
    ui.resultsList.style.pointerEvents = "auto";
  }

  function seleccionarServicio(servicio) {
        if (!inputActivo) {
      inputDesde.focus();
      inputActivo = "origen";
    }

    const nodo = window.coordenadas.servicios[servicio];
    if (!nodo) return;

    if (inputActivo === "origen") {
      inputDesde.value = servicio;
      origenSeleccionado = { nombre: servicio, nodo };
      confirmDesde.textContent = `📍 Desde: ${servicio} ✔`;
    } else {
      inputHacia.value = servicio;
      destinoSeleccionado = { nombre: servicio, nodo };
      confirmHacia.textContent = `🎯 Hacia: ${servicio} ✔`;
    }

    resultsList.innerHTML = "";
    ui.panel.classList.remove("mostrando-resultados");
    ui.confirmados.classList.remove("hidden");
    actualizarEstadoInicio();
  }

  function mostrarSugerenciaEntradaSalida() {
  if (
    origenSeleccionado?.nombre === ENTRADA_SALIDA ||
    destinoSeleccionado?.nombre === ENTRADA_SALIDA
  ) {
    ocultarResults();
    return;
  }

  ocultarResults();   // limpiar
  mostrarResults();   // 🔑 ESTA LÍNEA ES CLAVE

  const li = document.createElement("li");
  li.textContent = "¿Entrada / Salida?";
  li.className = "sugerencia";

  li.addEventListener("mousedown", (e) => {
    e.preventDefault();
    seleccionarServicio(ENTRADA_SALIDA);
  });

  ui.resultsList.appendChild(li);
}



  const listaServicios = Object.keys(window.coordenadas?.servicios || {});

  if (!inputDesde || !inputHacia || !resultsList ) {
    console.warn("Buscador incompleto");
    return;
  }
  
  inputDesde.addEventListener("focus", () => {
    hint?.classList.add("hidden");
    inputActivo = "origen";
    manejarBusqueda(inputDesde.value);
  });

  inputHacia.addEventListener("focus", () => {
    hint?.classList.add("hidden");
    inputActivo = "destino";
    manejarBusqueda(inputHacia.value);
  });


  function manejarBusqueda(valor) {
  const query = valor.toLowerCase().trim();

  ui.panel.classList.add("mostrando-resultados");
  ui.confirmados.classList.add("hidden");

  // 👉 foco sin escribir → sugerencia amarilla
  if (!query) {
    hint?.classList.add("hidden");
    mostrarSugerenciaEntradaSalida();
    return;
  }

  // 👉 hay texto real
  hint?.classList.add("hidden");
  ocultarResults();
  mostrarResults();   // 🔑 OTRA VEZ CLAVE

  const matches = listaServicios.filter(nombre =>
    nombre.toLowerCase().includes(query)
  );

  matches.forEach(servicio => {
    const li = document.createElement("li");
    li.textContent = servicio;
    li.addEventListener("click", () => seleccionarServicio(servicio));
    ui.resultsList.appendChild(li);
  });
}



  // enganchar ambos inputs
 inputDesde.addEventListener("input", () => {
    if (huboRecorrido) {
      resetUIParaNuevaBusqueda();
      huboRecorrido = false;
    }

    manejarBusqueda(inputDesde.value);
  });

  inputHacia.addEventListener("input", () => {
    if (huboRecorrido) {
      resetUIParaNuevaBusqueda();
      huboRecorrido = false;
    }

    manejarBusqueda(inputHacia.value);
  });

}

  function actualizarEstadoInicio() {
  const btn = ui?.btnIniciar;
  if (!btn) return;

  const listo =
    origenSeleccionado?.nodo != null &&
    destinoSeleccionado?.nodo != null;

  btn.classList.toggle("hidden", !listo);
}

/////////////////////////////////////
// FUNCIONES DE RUTA
/////////////////////////////////////

function calcularRecorrido(origenId, destinoId) {
  const nodos = window.coordenadas.nodos;

  const origen = nodos.find(n => n.id === origenId);
  const destino = nodos.find(n => n.id === destinoId);

  if (!origen || !destino) return [];
  // 🧠 Motor real: un solo cálculo sobre el grafo completo
  return buscarCamino(nodos, origenId, destinoId);
}

function buscarCamino(nodos, inicioId, finId) {
  const dist = {};
  const prev = {};
  const visitados = new Set();

  nodos.forEach(n => {
    dist[n.id] = Infinity;
    prev[n.id] = null;
  });

  dist[inicioId] = 0;

  while (true) {
    let actual = null;
    let menorDist = Infinity;

    for (const id in dist) {
      if (!visitados.has(id) && dist[id] < menorDist) {
        menorDist = dist[id];
        actual = id;
      }
    }

    if (actual === null) break;
    if (Number(actual) === finId) break;

    visitados.add(actual);

    const nodoActual = nodos.find(n => n.id === Number(actual));
    if (!nodoActual) continue;

    nodoActual.links.forEach(vecinoId => {
      if (visitados.has(String(vecinoId))) return;

      const vecino = nodos.find(n => n.id === vecinoId);
      if (!vecino) return;

      const dx = nodoActual.x - vecino.x;
      const dy = nodoActual.y - vecino.y;
      const peso = Math.sqrt(dx * dx + dy * dy);

      const alt = dist[actual] + peso;
      if (alt < dist[vecinoId]) {
        dist[vecinoId] = alt;
        prev[vecinoId] = Number(actual);
      }
    });
  }

  // reconstruir camino
  const camino = [];
  let actual = finId;

  while (actual !== null) {
    camino.unshift(actual);
    actual = prev[actual];
  }

  return camino;
}

function segmentarCaminoPorPlano(caminoIds) {
  const segmentos = [];
  let segmentoActual = [];
  let planoActual = null;

  for (const id of caminoIds) {
    const nodo = window.coordenadas.nodos.find(n => n.id === id);
    if (!nodo) continue;

    // primer nodo
    if (planoActual === null) {
      planoActual = nodo.plano;
    }

    // cambio de plano → cerrar segmento
    if (nodo.plano !== planoActual) {
      segmentos.push({
        plano: planoActual,
        nodos: segmentoActual
      });
      segmentoActual = [];
      planoActual = nodo.plano;
    }

    segmentoActual.push(id);
  }

  // último segmento
  if (segmentoActual.length) {
    segmentos.push({
      plano: planoActual,
      nodos: segmentoActual
    });
  }

  return segmentos;
}

function crearCursor(punto) {
  if (cursorMarker) {
    cursorMarker.remove();
    cursorMarker = null;
  }

  cursorMarker = L.circleMarker(punto, {
    radius: 6,
    weight: 2,
    color: "#000000",     // borde azul oscuro
    fillColor: "#0099ff", // 🔵 azul movimiento
    fillOpacity: 1,
    pane: "markerPane"    // opcional, para que quede arriba
  }).addTo(mapPB);

  return cursorMarker;
}

async function cambiarPlano(planoDestino) {
  
  const overlays = window.overlaysPorPlano;
  if (!overlays?.[planoDestino]) return;

  const DURACION = 0;

  Object.entries(overlays).forEach(([plano, overlay]) => {
    const el = overlay.getElement();
    if (!el) return;

    el.style.transition = `opacity ${DURACION}ms ease`;
    overlay.setOpacity(plano === planoDestino ? 1 : 0);
  });

  // 🔑 CLAVE: re-encuadrar mapa
  window.map.invalidateSize();
  window.map.fitBounds(window.MAP_BOUNDS);

  await esperar(DURACION);

  Object.entries(window.overlaysPorPlano).forEach(([plano, overlay]) => {
  const el = overlay.getElement();
  if (!el) return;
  console.log(
    "🖼️ overlay",
    plano,
    "opacity:",
    el.style.opacity,
    "display:",
    getComputedStyle(el).display
  );
});

}

async function dibujarCamino(caminoIds) {
  if (!caminoIds || caminoIds.length === 0) return;

  const segmentos = segmentarCaminoPorPlano(caminoIds);

  for (let i = 0; i < segmentos.length; i++) {
  const segmento = segmentos[i];
  const esUltimo = i === segmentos.length - 1;

  await cambiarPlano(segmento.plano);

  const resultado = await dibujarTramo(segmento.nodos, { esUltimo });

  if (resultado?.tipo === "conexion") {
  const planoActual = segmento.plano;
  const planoDestino = segmentos[i + 1].plano;

  // 🎬 transición vertical (cine)
  await transicionVertical(planoActual, planoDestino);

    // 🔑 dirección del ASCENSOR (lógica)
  const direccionAscensor = calcularDireccion(planoActual, planoDestino);

  // 🔑 dirección VISUAL DEL MUNDO (la que entiende el cine)
  const direccionMundo =
    direccionAscensor === "sube" ? "baja" : "sube";

  ocultarElementosRecorrido();

  await transicionCine(planoActual, planoDestino, {
    direccion: direccionMundo
  });

  await esperar(100); //
  
}
} huboRecorrido = true;
}

async function dibujarTramo(nodosIds, { esUltimo }) {
  
  // limpiar visual anterior
  rutaVerde?.remove();
  rutaVerde = null;

  const primerNodo = window.coordenadas.nodos.find(n => n.id === nodosIds[0]);

  crearMarcadorOrigen([primerNodo.x, primerNodo.y]);
  const cursor = crearCursor([primerNodo.x, primerNodo.y]);
  mostrarElementosRecorrido();

  const polyline = crearRutaVacia();

  reproducirWalk();

  for (let i = 0; i < nodosIds.length; i++) {
    const nodo = window.coordenadas.nodos.find(n => n.id === nodosIds[i]);
    const punto = [nodo.x, nodo.y];

    // 🎨 estado del cursor (prioridad correcta)
    if (esUltimo && i === nodosIds.length - 1) {
      // 🟢 destino final
      cursor.setStyle({
        fillColor: "#00ff66",
        color: "#000"
      });
    } else if (nodo.conexion) {
      // 🟡 ascensor / conexión
      cursor.setStyle({
        fillColor: "#ffd400",
        color: "#000"
      });
    } else {
      // 🔵 recorrido normal
      cursor.setStyle({
        fillColor: "#4da6ff",
        color: "#000"
      });
    }

    moverMarcador(cursor, punto);
    polyline.addLatLng(punto);
    await esperar(600);
  }


  detenerWalk();

  const ultimoNodo = window.coordenadas.nodos.find(
    n => n.id === nodosIds[nodosIds.length - 1]
  );
 
  // 🛗 fin de tramo intermedio → conexión (siempre que haya conexion)
  if (!esUltimo && ultimoNodo?.conexion) {

    // 🟡 estado conexión
    cursor.setStyle({
      fillColor: "#ffd400",
      color: "#000"
    });

   // 🛗 fin de tramo intermedio → conexión
   const contenedor = document.getElementById("fotoTrayecto");

   // 📸 foto opcional: solo si existe img
    if (ultimoNodo?.img) {
      await mostrarFoto(
        "conexion",
        ultimoNodo.img,
        [ultimoNodo.x, ultimoNodo.y]
      );

    await volarFotoAlContenedor(ultimoNodo.img);

    if (!esUltimo) {
      setTimeout(() => {
        contenedor.classList.add("fade-out");
      }, 380); // o 400 para margen
    }

    }

    // 🧹 limpiar ruta ANTES de cambiar de plano
      rutaVerde?.remove();
      rutaVerde = null;

      // devolver control al orquestador
      return {
        tipo: "conexion"
      };

  }
  
  // 🎯 último tramo → destino
  if (esUltimo) {
    marcarLlegada(cursor);

    reproducirLlego();

    const servicio = destinoSeleccionado?.nombre;
    const fotosServicioCfg = window.recorridoConfig?.fotosServicio || {};
    
    if (servicio && fotosServicioCfg[servicio]) {
      await mostrarFoto(
        servicio,
        fotosServicioCfg[servicio],
        [ultimoNodo.x, ultimoNodo.y]
      );

      await volarFotoAlContenedor(fotosServicioCfg[servicio]);
      
    }

      // 🔁 habilitar replay SOLO al final real
    if (btnReplay) {
      
      btnReplay.classList.remove("hidden");

      // forzar reflow para animación CSS
      btnReplay.getBoundingClientRect();

      btnReplay.classList.add("visible");
    }
  
  } 
  
}

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function crearRutaVacia() {
  rutaVerde = L.polyline([], {
    color: "#f238f8",
    weight: 4,
    lineJoin: "round",   // 🔥 esquinas redondeadas
    lineCap: "round",     // 🔥 extremos redondeados
    smoothFactor: 1.5,   // 🔥 ESTE es el que faltaba
    renderer: L.canvas(), // 🔥 clave en CRS.Simple
    opacity: 0.9
  }).addTo(mapPB);

  return rutaVerde;
}

function crearMarcadorOrigen(punto) {
  if (origenMarker) {
    origenMarker.remove();
  }

  origenMarker = L.marker(punto, {
    icon: userIcon,
    interactive: false
  }).addTo(mapPB);

  return origenMarker;
}

function moverMarcador(marker, punto) {
  marker.setLatLng(punto);
}

function iniciarAudio() {
  if (audioHabilitado) return;

  audioWalk = new Audio("assets/sonidos/walk.mp3");
  audioWalk.loop = true;
  audioWalk.volume = 0.6;

  // 👇 este play es el desbloqueo
  audioWalk.play()
    .then(() => {
      audioWalk.pause();
      audioWalk.currentTime = 0;
      audioHabilitado = true;
    })
    .catch(err => {
    });
}

function reproducirWalk() {
  if (!audioHabilitado || !audioWalk) return;
  audioWalk.currentTime = 0;
  audioWalk.play().catch(() => {});
}

function detenerWalk() {
  if (!audioWalk) return;
  audioWalk.pause();
  audioWalk.currentTime = 0;
}

function reproducirLlego() {
  if (!audioHabilitado) return;

  audioLlego = new Audio("assets/sonidos/llega.mp3");
  audioLlego.volume = 0.8;
  audioLlego.play().catch(() => {});
}


function repetirRecorrido() {

  cerrarVisorDOM();
  
  if (!ultimoCaminoIds || recorridoEnCurso) return;
  
    // 🧹 borrar marcador verde final
  if (marcadorLlegada) {
    marcadorLlegada.remove();
    marcadorLlegada = null;
  }

  // por las dudas, cursor viejo
  if (cursorMarker) {
    cursorMarker.remove();
    cursorMarker = null;
  }

  // limpiar visual previo si aplica
  rutaVerde?.remove();
  rutaVerde = null;

  // opcional: si querés vaciar fotos al repetir, dejalo.
  // si NO, comentá estas dos líneas.
  fotosGuardadas.length = 0;
  document.querySelector("#fotoTrayecto .foto-trayecto-minis")?.replaceChildren();

  // 👇 OCULTAR AMBOS AL REINICIAR
  btnReplay.classList.add("hidden");
  fotoTrayecto.classList.add("hidden");

  recorridoEnCurso = true;
  dibujarCamino(ultimoCaminoIds).finally(() => {
    recorridoEnCurso = false;
    btnReplay.classList.remove("hidden");
    fotoTrayecto.classList.remove("hidden");
  });
}

const btnReplay = document.getElementById("btnReplay");

if (btnReplay) {
  btnReplay.classList.add("hidden"); // estado inicial

  btnReplay.addEventListener("click", (e) => {
    e.stopPropagation();   // ⛔ clave en Leaflet
    repetirRecorrido();
  });
}

function marcarLlegada(cursor) {
  if (!cursor) return;

  cursor.setStyle({
    fillColor: "#38f86b"
  });

  // mini pulso visual
  cursor.setRadius(9);
  setTimeout(() => cursor.setRadius(6), 200);
}

/* =====================================================
8. Seccion de fotografias
===================================================== */
const fotosGuardadas = [];

async function mostrarFoto(nombre, src, pos) {
  const [x, y] = pos;

  const img = document.createElement("img");
  img.src = src;
  img.alt = nombre;
  img.className = "foto-destino mini";
  document.body.appendChild(img);

  // Esperar a que cargue la imagen (así medimos bien)
  await new Promise((resolve, reject) => {
    img.onload = async () => {
      if (img.decode) {
        try {
          await img.decode(); // 🔥 clave en móviles lentos
        } catch {}
      }
      resolve();
    };

    img.onerror = reject;
  });

  // Punto en coordenadas del contenedor del mapa
  const p = mapPB.latLngToContainerPoint([x, y]);
  const mapRect = mapPB.getContainer().getBoundingClientRect();

  // Convertir a coordenadas de viewport (lo que entiende position:absolute en body)
  const pViewport = {
    x: mapRect.left + p.x,
    y: mapRect.top + p.y
  };

  // Miniatura en el punto
  img.style.left = `${pViewport.x}px`;
  img.style.top = `${pViewport.y}px`;

  await esperar(60);

  // Pasar a expandida (solo cambia tamaño/estilo)
  img.classList.remove("mini");
  img.classList.add("expandida");

  // Esperar 1 frame para que aplique el CSS
  await new Promise(requestAnimationFrame);

  // Medimos tamaño real expandida
  const rect = img.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;

  // Clamp dentro del área del mapa (no dentro de toda la ventana)
  const margin = 12;

  const minX = mapRect.left + margin + w / 2;
  const maxX = mapRect.right - margin - w / 2;
  const minY = mapRect.top + margin + h / 2;
  const maxY = mapRect.bottom - margin - h / 2;

  let targetX = Math.max(minX, Math.min(maxX, pViewport.x));
  let targetY = Math.max(minY, Math.min(maxY, pViewport.y));

  // Mover al target (suave)
  img.style.left = `${targetX}px`;
  img.style.top = `${targetY}px`;

  // Mantener 3s
  await esperar(1500);
  img.remove();
  
}

function getCentroContenedorFotos() {
  const box = document.getElementById("fotoTrayecto");
  const rect = box.getBoundingClientRect();

  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };
}

async function volarFotoAlContenedor(src) {
  const contenedor = document.getElementById("fotoTrayecto");
  const minis = contenedor.querySelector(".foto-trayecto-minis");
  const icono = contenedor.querySelector(".foto-trayecto-icono");
  fotosGuardadas.push(src);

  // mostrar contenedor si estaba oculto
  contenedor.classList.remove("hidden");

  // 🎯 aseguramos que esté visible
contenedor.classList.remove("fade-out");

  // ocultar ícono
  icono.style.display = "none";
  minis.style.display = "flex";

  // crear mini flotante
  const img = document.createElement("img");
  img.src = src;
  img.style.position = "fixed";
  img.style.width = "220px";
  img.style.borderRadius = "12px";
  img.style.zIndex = 5000;
  img.style.transition = "all 420ms ease";

  document.body.appendChild(img);

  // posición inicial: centro de pantalla
  img.style.left = "50%";
  img.style.top = "50%";
  img.style.transform = "translate(-50%, -50%)";
  
  await esperar(40);

  
  // destino: centro del contenedor
  const dest = getCentroContenedorFotos();

  img.style.width = "40px";
  img.style.left = `${dest.x}px`;
  img.style.top = `${dest.y}px`;
  img.style.transform = "translate(-50%, -50%)";
  img.style.zIndex = 1400;

  await esperar(450);

  // 🎯 ahora el truco clave:
  // convertir el flotante en mini real
  img.style.position = "static";
  img.style.width = "100%";
  img.style.height = "auto";
  img.style.transform = "none";
  img.style.transition = "none";
  img.style.zIndex = "auto";

  // mover la imagen al contenedor
  minis.appendChild(img);
  minis.style.display = "flex";
  icono.style.display = "none";

  minis.classList.toggle("doble", minis.children.length === 2);


// 🎯 rebote del contenedor
contenedor.classList.add("bounce");

// 🧹 eliminar la mini
img.remove();

// ⏱️ al terminar el bounce → fade-out
setTimeout(() => {
  contenedor.classList.remove("bounce");
}, 380);

}


// MODAL POPPUP CON VISOR DE FOTOS, BOTON DE REPETIR RECORRIDO Y NOMBRE DE SERVICIO
function mostrarGaleria({ cont, overlay, fotos }) {
  cont.innerHTML = "";
  overlay.classList.remove("modo-grande");

  fotos.forEach((src) => {
    const thumb = crearImg(src);
    thumb.className = "visor-thumb";

    thumb.addEventListener("click", (e) => {
      e.stopPropagation();
      mostrarFotoGrande({ cont, overlay, fotos, src });
    });

    cont.appendChild(thumb);
  });
}

function mostrarFotoGrande({ cont, overlay, fotos, src }) {
  cont.innerHTML = "";
  overlay.classList.add("modo-grande");

  const grande = crearImg(src);
  grande.className = "visor-img-grande";

  grande.addEventListener("click", (e) => {
    e.stopPropagation();
    mostrarGaleria({ cont, overlay, fotos });
  });

  cont.appendChild(grande);
}

function abrirVisor() {
  if (!fotosGuardadas.length) return;

  cerrarVisorDOM();

  const overlay = document.createElement("div");
  overlay.className = "visor-overlay";
  overlay.addEventListener("click", cerrarVisorDOM);

  const cont = document.createElement("div");
  cont.className = "visor-contenido";
  cont.addEventListener("click", (e) => e.stopPropagation());

  overlay.appendChild(cont);
  document.body.appendChild(overlay);

  // 🔹 1 foto → grande
  if (fotosGuardadas.length === 1) {
    overlay.classList.add("modo-grande");

    const img = crearImg(fotosGuardadas[0]);
    img.className = "visor-img-grande";
    img.addEventListener("click", (e) => {
      e.stopPropagation();
      cerrarVisorDOM();
    });

    cont.appendChild(img);
    return;
  }

  // 🔹 2-3 fotos → galería
  const fotos = fotosGuardadas.slice(-3);
  cont.classList.toggle("dos-fotos", fotos.length === 2);

  mostrarGaleria({ cont, overlay, fotos });
}


function cerrarVisorDOM() {
  const v = document.querySelector(".visor-overlay");
  if (v) v.remove();
}


function crearImg(src) {
  console.log("[CREAR IMG]", src);

  const img = document.createElement("img");
  img.src = src;
  
  img.onload = () => console.log("✅ IMG CARGADA", src);
  img.onerror = () => console.error("❌ IMG ERROR", src);

  return img;
}

/* =====================================================
    CINE
===================================================== */
function reproducirAscensor() {
  if (!audioAscensor) {
    audioAscensor = new Audio("assets/sonidos/ascensor.mp3");
    audioAscensor.volume = 0.6;
  }

  audioAscensor.currentTime = 0;
  audioAscensor.play().catch(() => {});
}

function detenerAscensor() {
  if (!audioAscensor) return;
  audioAscensor.pause();
  audioAscensor.currentTime = 0;
}


function ocultarElementosRecorrido() {
  if (cursorMarker) {
    cursorMarker.setStyle({ opacity: 0, fillOpacity: 0 });
  }

  if (origenMarker) {
    origenMarker.setOpacity(0);
  }

  if (marcadorLlegada) {
    marcadorLlegada.setOpacity(0);
  }
}

function mostrarElementosRecorrido() {
  if (cursorMarker) {
    cursorMarker.setStyle({ opacity: 1, fillOpacity: 1 });
  }

  if (origenMarker) {
    origenMarker.setOpacity(1);
  }

  if (marcadorLlegada) {
    marcadorLlegada.setOpacity(1);
  }
}


function getIndicadorPiso(planoDestino) {
  if (planoDestino === "pb") return "assets/cine/cinePB.webp";
  if (planoDestino.endsWith("ss")) return "assets/cine/cineSS.webp";
  if (planoDestino.endsWith("1")) return "assets/cine/cine1P.webp";
  if (planoDestino.endsWith("2")) return "assets/cine/cine2P.webp";
  return "assets/cine/pisoPB.webp";
}

async function transicionCine(_planoActual, planoDestino, { direccion }) {
  const overlay   = document.getElementById("cineOverlay");
  const puerta    = document.getElementById("cinePuerta");
  const indicador = document.getElementById("cineIndicador");

  if (!overlay || !puerta || !indicador) return;

  // 🧼 reset limpio
  overlay.style.display = "block";
  puerta.className = "cine-puerta";
  indicador.className = "";
  indicador.style.opacity = 0;

  // setear imagen de piso
  indicador.src = getIndicadorPiso(planoDestino);
  await indicador.decode?.().catch(() => {});

  // 🚪 CERRAR PUERTA
  puerta.classList.add("cerrar");
  await esperar(600);

  // 🧭 INDICADOR EN MOVIMIENTO
  indicador.classList.add(direccion); // "sube" | "baja"
  reproducirAscensor(); 
  await esperar(5000);

  // 🔄 CAMBIO REAL DE PLANO (OCULTO)
  await cambiarPlano(planoDestino);

  detenerAscensor();

  // 🚪 ABRIR PUERTA
  puerta.classList.remove("cerrar");
  puerta.classList.add("abrir");
  await esperar(600);

  // 🧼 LIMPIEZA FINAL
  overlay.style.display = "none";
  puerta.className = "cine-puerta";
  indicador.className = "";
}




async function transicionVertical(_planoActual, _planoDestino) {
  // por ahora, NO hacemos cine acá.
  return;
}
/* =====================================================
  BOOTSTRAP
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // El DOM queda listo,
  // pero la app NO arranca todavía.
});

/* =====================================================
    SERVICE WORKER
===================================================== */

if (!IS_DEV && "serviceWorker" in navigator) {

  navigator.serviceWorker.register("./sw.js")
    .then(() => {
      console.log("Service Worker registrado");

      let reloaded = false;

      navigator.serviceWorker.register("./sw.js")
      .then(() => {
        console.log("Service Worker registrado");
      });


    })
    .catch(err => console.error("SW error:", err));

}
