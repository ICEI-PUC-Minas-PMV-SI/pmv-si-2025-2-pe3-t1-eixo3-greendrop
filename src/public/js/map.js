/* global L, maplibregl */

;(() => {
  // Referências às bibliotecas globais (carregadas via CDN no HTML)
  const Leaflet = window.L
  const MapLibreGL = window.maplibregl

  const MATERIAL_TYPES = [
    { key: "plastico", label: "Plástico", color: "#2dd4bf" },
    { key: "papel", label: "Papel", color: "#60a5fa" },
    { key: "vidro", label: "Vidro", color: "#22c55e" },
    { key: "metal", label: "Metal", color: "#f59e0b" },
    { key: "organico", label: "Orgânico", color: "#16a34a" },
    { key: "eletronicos", label: "Eletrônicos", color: "#ef4444" },
    { key: "baterias", label: "Baterias", color: "#991b1b" },
    { key: "isopor", label: "Isopor", color: "#a855f7" },
    { key: "oleo", label: "Óleo", color: "#8b5cf6" },
    { key: "pilhas", label: "Pilhas", color: "#7c3aed" },
  ]

  // ------ helpers de DOM ------
  const $search = () => document.getElementById("map-search")
  const $select = () => document.getElementById("map-filter-material")
  const $openNow = () => document.getElementById("map-open-now")
  const $chipsBox = () => document.getElementById("chips")
  const $cardsBox = () => document.getElementById("locations-list")

  // ------ utils ------
  const normalize = (str = "") =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
  const toRad = (deg) => (deg * Math.PI) / 180
  function distanceKm(aLat, aLng, bLat, bLng) {
    const R = 6371
    const dLat = toRad(bLat - aLat)
    const dLng = toRad(bLng - aLng)
    const s1 = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(s1), Math.sqrt(1 - s1))
    return R * c
  }
  const kmLabel = (v) => (!Number.isFinite(v) ? "" : v < 1 ? `${Math.round(v * 1000)} m` : `${v.toFixed(1)} km`)

  // ------ horário ------
  const DAY_IDX = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6, sáb: 6 }
  const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]
  function parseTimeToMin(t) {
    const m = /^(\d{1,2}):(\d{2})$/.exec((t || "").trim())
    if (!m) return null
    const h = +m[1],
      mi = +m[2]
    if (h < 0 || h > 23 || mi < 0 || mi > 59) return null
    return h * 60 + mi
  }
  function expandDayRange(token) {
    token = (token || "").toLowerCase().replace(/\s+/g, "").replace(/sáb/g, "sab")
    const dash = /–|—|-/
    if (/^diariamente$/.test(token)) return ALL_DAYS.slice()
    if (dash.test(token)) {
      const [a, b] = token.split(dash)
      const start = DAY_IDX[a],
        end = DAY_IDX[b]
      if (start == null || end == null) return []
      if (start <= end) return Array.from({ length: end - start + 1 }, (_, i) => start + i)
      return [
        ...Array.from({ length: 6 - start + 1 }, (_, i) => start + i),
        ...Array.from({ length: end + 1 }, (_, i) => i),
      ]
    }
    const d = DAY_IDX[token]
    return d == null ? [] : [d]
  }
  function parseHorario(horarioRaw = "") {
    const schedule = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
    const parts = horarioRaw
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean)
    parts.forEach((chunk) => {
      const dash = /–|—|-/
      const m = chunk.match(/(\d{1,2}:\d{2})\s*(?:–|—|-)\s*(\d{1,2}:\d{2})/)
      if (!m) {
        if (/^diariamente/i.test(chunk.trim())) {
          const t = chunk.replace(/^diariamente/i, "").trim()
          const [h1, h2] = t
            .split(dash)
            .map((s) => s.trim())
            .filter(Boolean)
          const a = parseTimeToMin(h1),
            b = parseTimeToMin(h2)
          if (a != null && b != null) ALL_DAYS.forEach((d) => schedule[d].push([a, b]))
        }
        return
      }
      const a = parseTimeToMin(m[1]),
        b = parseTimeToMin(m[2])
      if (a == null || b == null) return
      const daysPart = chunk.slice(0, m.index).trim()
      const dayTokens = daysPart
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
      dayTokens.forEach((tok) => expandDayRange(tok).forEach((d) => schedule[d].push([a, b])))
    })
    return schedule
  }
  function isOpenNow(horarioRaw, now = new Date()) {
    const sched = parseHorario(horarioRaw)
    const d = now.getDay()
    const minutes = now.getHours() * 60 + now.getMinutes()
    return (sched[d] || []).some(([a, b]) => minutes >= a && minutes <= b)
  }

  // ------ dados ------
  async function loadPoints() {
    if (Array.isArray(window.__POINTS__) && window.__POINTS__.length) return window.__POINTS__
    try {
      const r = await fetch("/api/pontos")
      if (!r.ok) throw new Error("API")
      return await r.json()
    } catch (e) {
      console.warn("Sem pontos válidos da API.", e)
      return []
    }
  }
  // ------ main ------
  let ALL = []
  const activeKeys = new Set()
  let leafletMap, markerCluster
  let mlMap,
    mlMarkers = []
  let userLatLng = null
  let userMarkerLeaflet = null
  let userAccuracyLeaflet = null
  let userMarkerML = null
  let mlMapInitialized = false

  // ------ filtros ------
  function applyHomeLikeFilters(points) {
    let out = points.slice()

    const term = normalize($search()?.value || "")
    if (term) {
      out = out.filter((p) => normalize(p.name || "").includes(term) || normalize(p.address || "").includes(term))
    }

    const selected = ($select()?.value || "").trim()
    if (selected) {
      out = out.filter((p) => (p.materials || []).includes(selected))
    }

    if (activeKeys.size > 0) {
      out = out.filter((p) => (p.materials || []).some((m) => activeKeys.has(m)))
    }

    if ($openNow()?.checked) {
      out = out.filter((p) => isOpenNow(p.horario))
    }

    if (userLatLng) {
      out.forEach((p) => (p._distanceKm = distanceKm(userLatLng.lat, userLatLng.lng, p.lat, p.lng)))
      out.sort((a, b) => (a._distanceKm ?? Number.POSITIVE_INFINITY) - (b._distanceKm ?? Number.POSITIVE_INFINITY))
    }

    return out
  }

  // ------ Leaflet ------
  function initLeaflet(points) {
    leafletMap = Leaflet.map("map-leaflet", { zoomControl: true, attributionControl: true }).setView(
      [-19.9167, -43.9345],
      13,
    )

    Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(leafletMap)

    markerCluster = Leaflet.markerClusterGroup()
    leafletMap.addLayer(markerCluster)

    renderLeaflet(points)
    startLiveLocationLeaflet()
  }

  function markerHtml(color) {
    const size = 22,
      dot = 10
    return `
      <div style="
        width:${size}px;height:${size}px;border-radius:50%;
        background:#fff;border:2px solid ${color};
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 2px 8px rgba(0,0,0,.15)">
        <span style="display:block;width:${dot}px;height:${dot}px;border-radius:50%;background:${color}"></span>
      </div>`
  }

  function popupHtml(p) {
    const mats = (p.materials || []).map((k) => MATERIAL_TYPES.find((m) => m.key === k)?.label || k).join(", ")
    const horario = p.horario ? `<br/><small><strong>Horário:</strong> ${p.horario}</small>` : ""
    const dist = Number.isFinite(p._distanceKm)
      ? `<br/><small><strong>Distância:</strong> ${kmLabel(p._distanceKm)}</small>`
      : ""

    const rating = p.rating || 0
    const totalReviews = p.totalReviews || 0
    const starsHtml = renderStars(rating, false)
    const ratingSection =
      rating > 0
        ? `<div style="margin: 8px 0; cursor: pointer;" onclick="event.stopPropagation(); window.openReviewsModal && window.openReviewsModal(${p.id}, '${(p.name || "").replace(/'/g, "\\'")}')">${starsHtml} <small style="color:#6B7280;">(${totalReviews} avaliação${totalReviews !== 1 ? "ões" : ""})</small></div>`
        : `<div style="margin: 8px 0; cursor: pointer;" onclick="event.stopPropagation(); window.openReviewsModal && window.openReviewsModal(${p.id}, '${(p.name || "").replace(/'/g, "\\'")}')">${starsHtml} <small style="color:#9CA3AF;">Sem avaliações</small></div>`

    return `
      <div style="font-family: Inter, system-ui;">
        <strong>${p.name || "Ponto de Descarte"}</strong><br/>
        ${p.address || ""}<br/>
        <small>Materiais: ${mats}</small>
        ${horario}
        ${dist}
        ${ratingSection}
        <br/>
        <a href="/pontos/${p.id || ""}" style="color:#34A853;font-weight:800">Detalhes</a>
      </div>
    `
  }

  function renderLeaflet(points) {
    markerCluster.clearLayers()
    const filtered = applyHomeLikeFilters(points)

    filtered.forEach((p) => {
      const firstType = (p.materials && p.materials[0]) || "plastico"
      const mat = MATERIAL_TYPES.find((m) => m.key === firstType) || MATERIAL_TYPES[0]
      const icon = Leaflet.divIcon({
        className: "",
        html: markerHtml(mat.color),
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })
      const mk = Leaflet.marker([p.lat, p.lng], { icon }).bindPopup(popupHtml(p))
      markerCluster.addLayer(mk)
    })

    if (markerCluster.getLayers().length) {
      leafletMap.fitBounds(markerCluster.getBounds().pad(0.12))
    }

    renderCards(filtered)
  }

  function initMapLibre(points) {
    const container = document.getElementById("map-maplibre")
    if (!container) {
      console.warn("Container do MapLibre não encontrado")
      return
    }

    if (!MapLibreGL) {
      console.warn("MapLibre GL não carregado")
      return
    }

    const maptilerKey = window.MAPTILER_KEY
    if (!maptilerKey || maptilerKey === "{{MAPTILER_KEY}}" || maptilerKey === "undefined") {
      console.warn("Chave MapTiler não configurada, usando estilo simplificado")
      initMapLibreSimple(points)
      return
    }

    try {
      mlMap = new MapLibreGL.Map({
        container: "map-maplibre",
        style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`,
        center: [-43.9345, -19.9167],
        zoom: 12,
        pitch: 45,
        bearing: -20,
        attributionControl: true,
        maxPitch: 60,
        antialias: false,
      })

      mlMap.addControl(new MapLibreGL.NavigationControl(), "top-right")

      mlMap.on("load", () => {
        mlMapInitialized = true

        try {
          mlMap.addLayer({
            id: "sky",
            type: "sky",
            paint: {
              "sky-type": "gradient",
              "sky-gradient": ["interpolate", ["linear"], ["sky-radial-progress"], 0.8, "#87CEEB", 1, "#E0F6FF"],
            },
          })
        } catch (e) {
          console.warn("Sky layer não suportado:", e)
        }

        renderMapLibre(points)
        startLiveLocationMapLibre()
      })

      mlMap.on("error", (e) => {
        console.warn("Erro no MapLibre:", e)
        if (!mlMapInitialized) {
          initMapLibreSimple(points)
        }
      })
    } catch (e) {
      console.warn("Erro ao inicializar MapLibre, usando fallback:", e)
      initMapLibreSimple(points)
    }
  }

  function initMapLibreSimple(points) {
    if (!MapLibreGL) return

    try {
      mlMap = new MapLibreGL.Map({
        container: "map-maplibre",
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "&copy; OpenStreetMap contributors",
            },
          },
          layers: [
            {
              id: "osm",
              type: "raster",
              source: "osm",
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center: [-43.9345, -19.9167],
        zoom: 12,
        pitch: 30,
        bearing: 0,
        attributionControl: true,
      })

      mlMap.addControl(new MapLibreGL.NavigationControl(), "top-right")

      mlMap.on("load", () => {
        mlMapInitialized = true
        renderMapLibre(points)
        startLiveLocationMapLibre()
      })
    } catch (e) {
      console.error("Falha ao inicializar MapLibre:", e)
    }
  }

  function renderMapLibre(points) {
    if (!mlMap || !mlMapInitialized || !MapLibreGL) return

    mlMarkers.forEach((m) => m.remove())
    mlMarkers = []

    const filtered = applyHomeLikeFilters(points)

    filtered.forEach((p) => {
      const firstType = (p.materials && p.materials[0]) || "plastico"
      const mat = MATERIAL_TYPES.find((m) => m.key === firstType) || MATERIAL_TYPES[0]

      const el = document.createElement("div")
      el.style.cssText = `width:18px;height:18px;border:2px solid ${mat.color};background:#fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.25)`
      const inner = document.createElement("div")
      inner.style.cssText = `width:8px;height:8px;border-radius:50%;background:${mat.color};margin:3px auto`
      el.appendChild(inner)

      const marker = new MapLibreGL.Marker({ element: el })
        .setLngLat([p.lng, p.lat])
        .setPopup(
          new MapLibreGL.Popup({ offset: 18 }).setHTML(
            `<div style="font-family:Inter,system-ui">${popupHtml(p)}</div>`,
          ),
        )
        .addTo(mlMap)

      mlMarkers.push(marker)
    })

    if (filtered.length) {
      const bounds = new MapLibreGL.LngLatBounds()
      filtered.forEach((p) => bounds.extend([p.lng, p.lat]))
      if (!bounds.isEmpty()) {
        mlMap.fitBounds(bounds, { padding: 80, duration: 600, pitch: 35, bearing: 0 })
      }
    }

    renderCards(filtered)
  }

  function renderStars(rating, interactive = false) {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    for (let i = 1; i <= 5; i++) {
      let starClass = ""
      if (i <= fullStars) {
        starClass = "active"
      } else if (i === fullStars + 1 && hasHalfStar) {
        starClass = "active"
      }
      stars.push(`<span class="star ${starClass}" ${interactive ? `data-rating="${i}"` : ""}>★</span>`)
    }
    return `<div class="rating-stars ${interactive ? "interactive" : ""}">${stars.join("")}</div>`
  }

  // ------ Cards (lista lateral) ------
  function renderCards(list) {
    const box = $cardsBox()
    if (!box) return
    box.innerHTML = ""

    if (!list.length) {
      box.innerHTML = `<div class="text-sm text-gray-500">Nenhum ponto encontrado para os filtros atuais.</div>`
      return
    }

    list.forEach((p) => {
      const firstType = (p.materials && p.materials[0]) || "plastico"
      const mat = MATERIAL_TYPES.find((m) => m.key === firstType) || MATERIAL_TYPES[0]

      const badgeDist = Number.isFinite(p._distanceKm)
        ? `<span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">${kmLabel(p._distanceKm)}</span>`
        : ""

      const mats =
        (p.materials || [])
          .slice(0, 4)
          .map((k) => {
            const mm = MATERIAL_TYPES.find((m) => m.key === k)
            const c = mm ? mm.color : "#2dd4bf"
            const lbl = mm ? mm.label : k
            return `<span class="px-2 py-0.5 text-xs font-medium rounded-full" style="background:${c}22;color:#064e3b;border:1px solid ${c}66">${lbl}</span>`
          })
          .join(" ") + ((p.materials || []).length > 4 ? ' <span class="text-xs text-gray-500">…</span>' : "")

      const rating = p.rating || 0
      const totalReviews = p.totalReviews || 0
      const starsHtml = renderStars(rating, false)

      const card = document.createElement("div")
      card.className = "p-4 rounded-lg cursor-pointer hover:bg-green-50 transition-colors border border-gray-100"
      card.innerHTML = `
        <div class="flex items-center justify-between gap-3">
          <div class="flex-1">
            <h3 class="font-semibold brand-dark-green">${p.name || "Ponto de Descarte"}</h3>
            <p class="text-sm text-gray-600">${p.address || ""}</p>
            ${p.horario ? `<p class="text-xs text-gray-500 mt-1"><strong>Horário:</strong> ${p.horario}</p>` : ""}
            <div class="mt-2 flex items-center gap-2 cursor-pointer rating-clickable" data-point-id="${p.id}" data-point-name="${(p.name || "").replace(/"/g, "&quot;")}">
              ${starsHtml}
              ${totalReviews > 0 ? `<span class="text-xs text-gray-500">(${totalReviews})</span>` : '<span class="text-xs text-gray-400">Sem avaliações</span>'}
            </div>
          </div>
          <div style="background:${mat.color}22;border:1px solid ${mat.color}77;border-radius:50%;width:30px;height:30px;"></div>
        </div>
        <div class="flex items-center justify-between mt-2">
          <div class="flex flex-wrap gap-1">${mats}</div>
          ${badgeDist}
        </div>
      `
      card.addEventListener("click", () => {
        if (leafletMap) leafletMap.flyTo([p.lat, p.lng], 15, { duration: 0.5 })
      })

      const ratingDiv = card.querySelector(".rating-clickable")
      if (ratingDiv) {
        ratingDiv.addEventListener("click", (e) => {
          e.stopPropagation()
          const pointId = Number.parseInt(ratingDiv.dataset.pointId)
          const pointName = ratingDiv.dataset.pointName || p.name || "Ponto de Coleta"
          window.openReviewsModal(pointId, pointName)
        })
      }

      box.appendChild(card)
    })
  }

  // ------ Geolocalização ------
  function startLiveLocationLeaflet() {
    if (!navigator.geolocation) return
    navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords
        userLatLng = { lat: latitude, lng: longitude }

        if (!userMarkerLeaflet) {
          const userIcon = Leaflet.divIcon({
            className: "user-location-icon",
            html: `<div style="width:20px;height:20px;background:#10b981;border:3px solid white;border-radius:50%;box-shadow:0 0 8px #10b981"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          })
          userMarkerLeaflet = Leaflet.marker([latitude, longitude], { icon: userIcon, zIndexOffset: 1000 })
            .addTo(leafletMap)
            .bindPopup("<strong>📍 Você está aqui</strong>")
          userAccuracyLeaflet = Leaflet.circle([latitude, longitude], {
            radius: accuracy || 20,
            color: "#10b981",
            fillColor: "#10b981",
            fillOpacity: 0.15,
            weight: 1,
          }).addTo(leafletMap)
        } else {
          userMarkerLeaflet.setLatLng([latitude, longitude])
          userAccuracyLeaflet.setLatLng([latitude, longitude])
          userAccuracyLeaflet.setRadius(accuracy || 20)
        }

        renderLeaflet(ALL)
        if (mlMap && mlMapInitialized) renderMapLibre(ALL)
      },
      (err) => console.warn("Geo erro (Leaflet):", err),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 },
    )
  }

  function startLiveLocationMapLibre() {
    if (!navigator.geolocation || !mlMap || !mlMapInitialized || !MapLibreGL) return
    navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        userLatLng = { lat: latitude, lng: longitude }

        if (!userMarkerML) {
          const el = document.createElement("div")
          el.style.cssText = `width:16px;height:16px;border:3px solid #fff;background:#10b981;border-radius:50%;box-shadow:0 0 8px #10b981`
          userMarkerML = new MapLibreGL.Marker({ element: el }).setLngLat([longitude, latitude]).addTo(mlMap)
        } else {
          userMarkerML.setLngLat([longitude, latitude])
        }

        renderLeaflet(ALL)
        if (mlMapInitialized) renderMapLibre(ALL)
      },
      (err) => console.warn("Geo erro (MapLibre):", err),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 },
    )
  }

  // ------ chips / eventos ------
  function mountChips() {
    const box = $chipsBox()
    if (!box) return
    box.innerHTML = ""
    MATERIAL_TYPES.forEach((t) => {
      const b = document.createElement("button")
      b.className = "chip"
      b.dataset.key = t.key
      b.textContent = t.label
      b.addEventListener("click", () => {
        if (activeKeys.has(t.key)) {
          activeKeys.delete(t.key)
          b.classList.remove("active")
        } else {
          activeKeys.add(t.key)
          b.classList.add("active")
        }
        renderLeaflet(ALL)
        if (mlMap && mlMapInitialized) renderMapLibre(ALL)
      })
      box.appendChild(b)
    })

    document.getElementById("clearFilters")?.addEventListener("click", () => {
      activeKeys.clear()
      box.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"))
      if ($search()) $search().value = ""
      if ($select()) $select().value = ""
      if ($openNow()) $openNow().checked = false
      renderLeaflet(ALL)
      if (mlMap && mlMapInitialized) renderMapLibre(ALL)
    })
  }

  function bindInputs() {
    $search()?.addEventListener("input", () => {
      renderLeaflet(ALL)
      if (mlMap && mlMapInitialized) renderMapLibre(ALL)
    })
    $select()?.addEventListener("change", () => {
      renderLeaflet(ALL)
      if (mlMap && mlMapInitialized) renderMapLibre(ALL)
    })
    $openNow()?.addEventListener("change", () => {
      renderLeaflet(ALL)
      if (mlMap && mlMapInitialized) renderMapLibre(ALL)
    })
  }

  function initViewToggle() {
    const btns = Array.from(document.querySelectorAll(".btn-toggle"))
    const l = document.getElementById("map-leaflet")
    const m = document.getElementById("map-maplibre")
    btns.forEach((b) =>
      b.addEventListener("click", () => {
        btns.forEach((x) => {
          x.classList.remove("active")
          x.setAttribute("aria-selected", "false")
        })
        b.classList.add("active")
        b.setAttribute("aria-selected", "true")
        const view = b.dataset.view
        if (view === "leaflet") {
          l.classList.add("is-visible")
          m.classList.remove("is-visible")
          setTimeout(() => {
            leafletMap && leafletMap.invalidateSize()
          }, 50)
        } else {
          m.classList.add("is-visible")
          l.classList.remove("is-visible")
          setTimeout(() => {
            mlMap && mlMap.resize()
          }, 50)
        }
      }),
    )
  }

  // ------ Modal de Avaliações ------
  let currentPontoId = null
  let currentRating = 0

  window.openReviewsModal = async (pontoId, pointName) => {
    currentPontoId = pontoId
    document.getElementById("modal-point-name").textContent = `${pointName} - Avaliações`
    document.getElementById("reviews-modal").classList.remove("hidden")

    const stars = document.querySelectorAll("#modal-rating-stars .star")
    stars.forEach((s) => s.classList.remove("active"))
    currentRating = 0

    await loadReviews(pontoId)

    bindModalStarEvents()
    bindSubmitReview()
  }

  window.closeReviewsModal = () => {
    document.getElementById("reviews-modal").classList.add("hidden")
    currentPontoId = null
    currentRating = 0
  }

  function bindModalStarEvents() {
    const stars = document.querySelectorAll("#modal-rating-stars .star")
    stars.forEach((star, index) => {
      star.onclick = () => {
        const rating = index + 1
        currentRating = rating
        stars.forEach((s, i) => {
          if (i < rating) s.classList.add("active")
          else s.classList.remove("active")
        })
      }
    })
  }

  function bindSubmitReview() {
    document.getElementById("modal-submit-review").onclick = async () => {
      if (!currentRating) {
        alert("Por favor, selecione uma nota")
        return
      }

      try {
        const comentario = document.getElementById("modal-review-comment").value
        const response = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            pontoColetaId: currentPontoId,
            nota: currentRating,
            comentario: comentario || null,
          }),
        })

        if (!response.ok) {
          if (response.status === 401) {
            alert("Você precisa estar logado para avaliar")
            return
          }
          throw new Error("Erro ao enviar avaliação")
        }

        await loadReviews(currentPontoId)
        document.getElementById("modal-review-comment").value = ""
        currentRating = 0
        document.querySelectorAll("#modal-rating-stars .star").forEach((s) => s.classList.remove("active"))

        ALL = await loadPoints()
        ALL = (ALL || [])
          .map((p) => ({
            ...p,
            lat: Number.parseFloat(p.lat),
            lng: Number.parseFloat(p.lng),
            materials: Array.isArray(p.materials) ? p.materials : [],
          }))
          .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))

        renderLeaflet(ALL)
        if (mlMap && mlMapInitialized) renderMapLibre(ALL)
      } catch (error) {
        console.error("Erro ao enviar avaliação:", error)
        alert("Erro ao enviar avaliação. Tente novamente.")
      }
    }
  }

  async function loadReviews(pontoId) {
    try {
      const response = await fetch(`/api/reviews/ponto/${pontoId}`)
      const reviews = await response.json()

      const reviewsList = document.getElementById("modal-reviews-list")
      if (!reviews || reviews.length === 0) {
        reviewsList.innerHTML =
          '<p class="text-sm text-gray-500 text-center py-4">Ainda não há avaliações para este ponto.</p>'
        return
      }

      reviewsList.innerHTML = reviews
        .map((review) => {
          const user = review.user || {}
          const userName = user.name || "Usuário Anônimo"
          const userInitial = userName.charAt(0).toUpperCase()
          const date = new Date(review.createdAt)
          const timeAgo = getTimeAgo(date)
          const starsHtml = renderStars(review.nota, false)

          return `
          <div class="review-item">
            <div class="review-header">
              <div class="review-avatar">${userInitial}</div>
              <div class="review-info">
                <div class="review-author">${userName}</div>
                <div class="review-date">${timeAgo}</div>
              </div>
            </div>
            <div class="review-rating">${starsHtml}</div>
            ${review.comentario ? `<div class="review-comment">${review.comentario}</div>` : ""}
          </div>
        `
        })
        .join("")
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error)
      document.getElementById("modal-reviews-list").innerHTML =
        '<p class="text-sm text-red-500 text-center py-4">Erro ao carregar avaliações.</p>'
    }
  }

  function getTimeAgo(date) {
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffDays / 365)

    if (diffMins < 1) return "Agora"
    if (diffMins < 60) return `${diffMins} minuto${diffMins > 1 ? "s" : ""} atrás`
    if (diffHours < 24) return `${diffHours} hora${diffHours > 1 ? "s" : ""} atrás`
    if (diffDays < 30) return `${diffDays} dia${diffDays > 1 ? "s" : ""} atrás`
    if (diffMonths < 12) return `${diffMonths} mês${diffMonths > 1 ? "es" : ""} atrás`
    return `${diffYears} ano${diffYears > 1 ? "s" : ""} atrás`
  }

  // ------ boot ------
  document.addEventListener("DOMContentLoaded", async () => {
    mountChips()
    bindInputs()
    ALL = await loadPoints()
    ALL = (ALL || [])
      .map((p) => ({
        ...p,
        lat: Number.parseFloat(p.lat),
        lng: Number.parseFloat(p.lng),
        materials: Array.isArray(p.materials) ? p.materials : [],
      }))
      .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))

    initLeaflet(ALL)
    initMapLibre(ALL)
    initViewToggle()
    document.querySelector('.btn-toggle[data-view="leaflet"]')?.click()
  })
})()
