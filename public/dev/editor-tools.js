/* ======================================================
   1. UTILIDADES
   ====================================================== */

function whenMapReady(cb) {
  if (window.map) {
    cb();
    return;
  }

  const interval = setInterval(() => {
    if (window.map) {
      clearInterval(interval);
      cb();
    }
  }, 50);
}

/* ======================================================
   2. ESTADO DEL EDITOR (NO USA MAPA)
   ====================================================== */

const PLANOS = Object.keys(PLANOS_CONFIG);

let planoActivoIndex = 0;
let planoActivo = PLANOS[planoActivoIndex];

/* ======================================================
   3. INIT EDITOR (TODO LO QUE USA window.map)
   ====================================================== */

function initEditor() {
  whenMapReady(() => {

    
  /* ======================================================
    PANE EXCLUSIVO PARA EDITOR
    ====================================================== */

  if (!window.map.getPane("editorPane")) {
    window.map.createPane("editorPane");
    window.map.getPane("editorPane").style.zIndex = 1000;
  }

  let modoCoords = false;
  let coordLabel = null;
  let modoPuntos = false;
  let modoNodos = false;
  let nodosLayer = L.layerGroup([], {
    pane: "editorPane"
  }).addTo(window.map);

  // 🗝️ Tecla C para toggle modo coords
  document.addEventListener("keydown", (e) => {
    // ignorar si estoy escribiendo
    if (
      e.target.tagName === "INPUT" ||
      e.target.tagName === "TEXTAREA" ||
      e.target.isContentEditable
    ) return;

    // SHIFT + C
    if (!(e.shiftKey && e.key.toLowerCase() === "c")) return;


    modoCoords = !modoCoords;
    console.log("📐 Modo coordenadas:", modoCoords ? "ON" : "OFF");

    coordLabel.style.display = modoCoords ? "block" : "none";
  });


  // 🏷️ Label flotante
  coordLabel = document.createElement("div");
  coordLabel.id = "coordLabel";
  coordLabel.style.display = "none";
  document.body.appendChild(coordLabel);

  // estilos básicos del label
  Object.assign(coordLabel.style, {
    position: "fixed",
    padding: "4px 8px",
    background: "rgba(0,0,0,0.7)",
    color: "#fff",
    fontSize: "12px",
    borderRadius: "4px",
    pointerEvents: "none",
    zIndex: 9999
  });

  // 🧭 Movimiento sobre el mapa
  const mapContainer = window.map.getContainer();

  mapContainer.addEventListener("mousemove", (e) => {
    if (!modoCoords) return;

    const rect = mapContainer.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const latlng = window.map.containerPointToLatLng([px, py]);

    const x = Math.round(latlng.lat);
    const y = Math.round(latlng.lng);

    coordLabel.textContent = `plano: ${planoActivo} | x: ${x} | y: ${y}`;
    coordLabel.style.left = e.clientX + 12 + "px";
    coordLabel.style.top = e.clientY + 12 + "px";
  });

  /* ======================================================
    MULTIPLANO
    ====================================================== */

  async function asegurarPlanoEditor(plano) {
    if (window.overlaysPorPlano?.[plano]) return;

    const cfg = PLANOS_CONFIG[plano];
    if (!cfg) {
      console.warn("⚠️ Plano no definido en PLANOS_CONFIG:", plano);
      return;
    }

    const imageWidth = 440;
    const imageHeight = 760;
    const bounds = [[0, 0], [imageHeight, imageWidth]];

    const overlay = L.imageOverlay(cfg.image, bounds).addTo(window.map);
    overlay.setOpacity(0);

    window.overlaysPorPlano[plano] = overlay;

    // deja que Leaflet inserte el <img> real
    await new Promise(r => requestAnimationFrame(r));
  }

  async function activarPlano(plano) {
    planoActivo = plano;
    console.log("🧭 Plano activo (editor):", planoActivo);

    if (!window.overlaysPorPlano) {
      window.overlaysPorPlano = {};
    }

    // 🔑 garantizar que el overlay exista
    await asegurarPlanoEditor(planoActivo);

    // 🔁 prender / apagar overlays
    Object.entries(window.overlaysPorPlano).forEach(([planoId, overlay]) => {
      overlay.setOpacity(planoId === planoActivo ? 1 : 0);
    });

    // 🧩 refrescar nodos si están visibles
    if (modoNodos) {
      renderizarNodosPlanoActivo();
    }
  }

  document.addEventListener("keydown", e => {
    if (!(e.shiftKey && e.key.toLowerCase() === "p")) return;

    planoActivoIndex = (planoActivoIndex + 1) % PLANOS.length;
    activarPlano(PLANOS[planoActivoIndex]);
  });

  /* ======================================================
    3. MODO EDICIÓN DE CAMINOS (TECLA 'E')
    ====================================================== */

  let modoEdicion = false;
  let puntosEdicion = [];
  let lineaEdicion = null;

  function initEditMode() {
    document.addEventListener("keydown", (e) => {
          // ignorar si estoy escribiendo
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.isContentEditable
      ) return;

      // SHIFT + C
      if (!(e.shiftKey && e.key.toLowerCase() === "e")) return;

      modoEdicion = !modoEdicion;
      console.log("✏️ Modo edición:", modoEdicion ? "ON" : "OFF");

      if (!modoEdicion) {
        limpiarEdicion();
      }
    });

    window.map.on("click", (e) => {
      if (!modoEdicion) return;

      const punto = [e.latlng.lat, e.latlng.lng];
      puntosEdicion.push(punto);

      // punto visual
      L.circleMarker(punto, {
        radius: 4,
        color: "#ff3333",
        weight: 2,
        fillOpacity: 1
      }).addTo(window.map);

      // línea
      if (!lineaEdicion) {
        lineaEdicion = L.polyline([punto], {
          color: "#ff3333",
          weight: 3,
          dashArray: "5,5"
        }).addTo(window.map);
      } else {
        lineaEdicion.addLatLng(punto);
      }
    });

    document.addEventListener("keydown", (e) => {
      if (!modoEdicion) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        puntosEdicion.pop();
        if (lineaEdicion) {
          lineaEdicion.setLatLngs(puntosEdicion);
        }
      }

      if (e.key === "Enter") {
        e.preventDefault();
        console.log("📦 Camino exportado:");
        console.log(JSON.stringify(puntosEdicion, null, 2));
      }
    });
  }

  function limpiarEdicion() {
    puntosEdicion = [];
    if (lineaEdicion) {
      window.map.removeLayer(lineaEdicion);
      lineaEdicion = null;
    }
  }


  /* ======================================================
    4. INIT
    ====================================================== */

  initEditMode();

  // ======================================================
  // MODO NODOS (TECLA 'N') — DEBUG VISUAL (ÚNICO)
  // ======================================================


  function renderizarNodosPlanoActivo() {
  nodosLayer.clearLayers();

  const nodos = (window.coordenadas?.nodos || [])
    .filter(n => n.plano === planoActivo);

  nodos.forEach(n => {
    const marker = L.circleMarker([n.x, n.y], {
      pane: "editorPane",
      radius: 1,
      color: "#ff8800",
      weight: 1,
      fillColor: "#ff8800",
      fillOpacity: 1
    });

    marker.bindTooltip(`N${n.id}`, {
      permanent: true,
      direction: "top",
      className: "node-label"
    });

    nodosLayer.addLayer(marker);
  });
}

  

  // 🗝️ Shift + N → toggle nodos
  document.addEventListener("keydown", (e) => {
    if (
      e.target.tagName === "INPUT" ||
      e.target.tagName === "TEXTAREA" ||
      e.target.isContentEditable
    ) return;

    if (!(e.shiftKey && e.key.toLowerCase() === "n")) return;

    modoNodos = !modoNodos;
    console.log("🧩 Modo nodos:", modoNodos ? "ON" : "OFF");

    if (modoNodos) {
      renderizarNodosPlanoActivo();
    } else {
      nodosLayer.clearLayers();
    }
  });

  if (!window.overlaysPorPlano) {
  window.overlaysPorPlano = {};
}

activarPlano(planoActivo);

    });
}

  initEditor();

