feather.replace();
document.getElementById('mobile-menu-button')?.addEventListener('click', () => {
  document.getElementById('mobile-menu')?.classList.toggle('hidden');
});

document.addEventListener('DOMContentLoaded', () => {
  // ---------- Constantes ----------
  const MATERIALS = [
    { key: 'plastico', label: 'Plástico', color: '#2dd4bf' },
    { key: 'papel', label: 'Papel', color: '#60a5fa' },
    { key: 'vidro', label: 'Vidro', color: '#22c55e' },
    { key: 'metal', label: 'Metal', color: '#f59e0b' },
    { key: 'organico', label: 'Orgânico', color: '#16a34a' },
    { key: 'eletronicos', label: 'Eletrônicos', color: '#ef4444' },
    { key: 'baterias', label: 'Baterias', color: '#991b1b' },
    { key: 'isopor', label: 'Isopor', color: '#a855f7' },
    { key: 'oleo', label: 'Óleo', color: '#8b5cf6' },
    { key: 'pilhas', label: 'Pilhas', color: '#7c3aed' },
  ];
  const MAT_BY_KEY = new Map(MATERIALS.map(m => [m.key, m]));

  const SUGGESTIONS_LIMIT = 3;
  const DEFAULT_RADIUS_KM = 5;

  // ---------- Utils ----------
  const norm = (s) => (s || '').toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  const toRad = (deg) => (deg * Math.PI) / 180;
  function distanceKm(aLat, aLng, bLat, bLng) {
    const R = 6371;
    const dLat = toRad(bLat - aLat);
    const dLng = toRad(bLng - aLng);
    const s1 = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) *
      Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(s1), Math.sqrt(1 - s1));
    return R * c;
  }
  const kmLabel = (v) => (!Number.isFinite(v) ? '' : (v < 1 ? `${Math.round(v * 1000)} m` : `${v.toFixed(1)} km`));
  function extractFirstTimeRange(str) {
    if (!str) return null;
    const clean = str.replace(/–/g, '-');
    const m = clean.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
    if (!m) return null;
    return [m[1], m[2]];
  }
  function checkOpenNow(horario) {
    const range = extractFirstTimeRange(horario);
    if (!range) return true;
    const [start, end] = range;
    const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); };
    const now = new Date(), nowM = now.getHours() * 60 + now.getMinutes();
    return nowM >= toMin(start) && nowM <= toMin(end);
  }
  function keyFromLabelOrKey(s) {
    const t = norm(s);
    if (MAT_BY_KEY.has(t)) return t;
    const hit = MATERIALS.find(m => t === norm(m.label) || t.includes(m.key) || t.includes(norm(m.label)));
    return hit?.key ?? 'plastico';
  }

  // ---------- DOM ----------
  const $list = document.getElementById('locations-list');
  const $search = document.getElementById('map-search');
  const $select = document.getElementById('map-filter-material');
  const $openNow = document.getElementById('map-open-now');
  const $chips = document.getElementById('chips');
  const $clearBtn = document.getElementById('clearFilters');

  // ---------- Estado ----------
  let locations = [];
  let markers = [];
  let userLatLng = null;
  let map;
  const activeMaterials = new Set();

  // ---------- Mapa ----------
  function colorDotIcon(hex) {
    return L.divIcon({
      className: 'custom-marker-icon',
      html: `<div style="background:${hex};width:18px;height:18px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 6px ${hex}99"></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      popupAnchor: [0, -10]
    });
  }

  function initMap() {
    if (map) return;
    map = L.map('map').setView([-19.9191, -43.9386], 13);

    // Base OSM
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    L.Control.MapRedirect = L.Control.extend({
      onAdd: function () {
        const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
        btn.title = 'Visualizar em tela cheia';
        Object.assign(btn.style, {
          backgroundColor: '#10b981', color: '#fff', fontSize: '16px',
          border: 'none', cursor: 'pointer', borderRadius: '6px',
          width: '38px', height: '38px', display: 'grid', placeItems: 'center'
        });
        btn.textContent = '⤢';
        btn.onclick = () => window.location.href = '/mapa';
        return btn;
      }
    });
    L.control.mapRedirect = (opts) => new L.Control.MapRedirect(opts);
    L.control.mapRedirect({ position: 'bottomright' }).addTo(map);

    L.Control.RecenterMe = L.Control.extend({
      onAdd: function () {
        const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
        btn.title = 'Centralizar em mim';
        Object.assign(btn.style, {
          backgroundColor: '#10b981', color: '#fff', border: 'none', fontSize: '16px',
          borderRadius: '6px', cursor: 'pointer', width: '38px', height: '38px',
          boxShadow: '0 3px 6px rgba(0,0,0,0.25)', transition: 'transform .2s ease',
          display: 'grid', placeItems: 'center'
        });
        btn.textContent = '📍';
        btn.onmouseover = () => btn.style.transform = 'scale(1.06)';
        btn.onmouseleave = () => btn.style.transform = 'scale(1.0)';
        btn.onclick = () => {
          if (userLatLng) map.flyTo(userLatLng, Math.max(map.getZoom(), 15), { duration: 0.5 });
          else startLiveLocation();
        };
        return btn;
      }
    });
    L.control.recenterMe = (opts) => new L.Control.RecenterMe(opts);
    L.control.recenterMe({ position: 'bottomright' }).addTo(map);

    const userIcon = L.divIcon({
      className: 'user-location-icon',
      html: `
      <div style="
        width:20px;height:20px;
        background:#10b981;
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 0 8px #10b981;
      "></div>
    `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    let userMarker = null;
    let accuracyCircle = null;
    let firstFix = false;

    // --- GEOLOCALIZAÇÃO (tempo real) ---
    function updateUserLocation(lat, lng, accuracy) {
      userLatLng = { lat, lng };

      if (!userMarker) {
        userMarker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 })
          .addTo(map)
          .bindPopup('<strong>📍 Você está aqui</strong>')
          .openPopup();

        accuracyCircle = L.circle([lat, lng], {
          radius: accuracy || 20,
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.15,
          weight: 1
        }).addTo(map);
      } else {
        userMarker.setLatLng([lat, lng]);
        accuracyCircle.setLatLng([lat, lng]);
        accuracyCircle.setRadius(accuracy || 20);
      }

      if (!firstFix) {
        map.flyTo([lat, lng], 15, { duration: 0.8 });
        firstFix = true;
      }
    }

    function startLiveLocation() {
      if (!navigator.geolocation) {
        console.warn('Geolocalização não suportada neste navegador.');
        return;
      }
      navigator.geolocation.watchPosition(
        pos => {
          const { latitude, longitude, accuracy } = pos.coords;
          updateUserLocation(latitude, longitude, accuracy);
          annotateDistances();
          renderNearbySuggestions();
        },
        err => {
          console.warn('Erro ao obter localização:', err);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
      );
    }
    startLiveLocation();
  }

  // ---------- Dados ----------
  async function loadLocations() {
    try {
      const resp = await fetch('/api/pontos', { cache: 'no-store' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const pontos = await resp.json();
      locations = (pontos || []).map(p => {
        const lat = Number(p.latitude ?? p.lat);
        const lng = Number(p.longitude ?? p.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        const mats = Array.isArray(p.materials) ? p.materials.map(keyFromLabelOrKey) : [];
        return {
          id: p.id,
          name: p.name || p.nome || 'Ponto de Coleta',
          address: p.address || p.endereco || '',
          lat, lng,
          materials: mats,
          horario: p.horario || p.horarioFuncionamento || '',
          telefone: p.telefone || ''
        };
      }).filter(Boolean);

      if (!locations.length) throw new Error('Lista vazia');
    } catch (e) {
      console.warn('API falhou, usando exemplos:', e);
      const examples = [
        { id: 5, name: 'Parque Municipal', address: 'Av. Afonso Pena, 1377 - Centro, BH', lat: -19.9191, lng: -43.9386, materials: ['papel', 'metal', 'plastico', 'isopor', 'vidro'], horario: '09:00-18:00' },
        { id: 14, name: 'Savassi – GV x Inconfidentes', address: 'Savassi, BH', lat: -19.9367, lng: -43.9332, materials: ['vidro'], horario: '08:00-20:00' },
      ];
      locations = examples.map(p => ({
        ...p,
        materials: p.materials.map(keyFromLabelOrKey),
      }));
    }
  }

  // ---------- Render ----------
  function annotateDistances() {
    if (!userLatLng) { locations.forEach(p => delete p._distanceKm); return; }
    locations.forEach(p => p._distanceKm = distanceKm(userLatLng.lat, userLatLng.lng, p.lat, p.lng));
  }
  function sortByDistance(arr) {
    if (!userLatLng) return arr.slice();
    return arr.slice().sort((a, b) => (a._distanceKm ?? Infinity) - (b._distanceKm ?? Infinity));
  }

  function clearMarkers() { markers.forEach(m => map.removeLayer(m)); markers = []; }

  function renderMarkers(list) {
    clearMarkers();

    if ($list) {
      const sugg = document.getElementById('nearby-suggestions');
      $list.innerHTML = '';
      if (sugg) $list.appendChild(sugg);
    }

    const ordered = sortByDistance(list);

    ordered.forEach(loc => {
      const firstKey = loc.materials?.[0] || 'plastico';
      const color = MAT_BY_KEY.get(firstKey)?.color || '#2dd4bf';

      const marker = L.marker([loc.lat, loc.lng], { icon: colorDotIcon(color) }).addTo(map);

      const distText = Number.isFinite(loc._distanceKm)
        ? `<br/><small>Distância: ${kmLabel(loc._distanceKm)}</small>` : '';

      marker.bindPopup(`
        <div class="font-sans">
          <h3 class="font-bold text-lg brand-dark-green">${loc.name}</h3>
          <p class="text-gray-600">${loc.address}</p>
          <p class="text-sm text-gray-500 mt-1"><strong>Materiais:</strong> ${loc.materials.join(', ')}</p>
          ${loc.horario ? `<p class="text-sm"><strong>Horário:</strong> ${loc.horario}</p>` : ''}
          ${distText}
        </div>
      `);
      markers.push(marker);

      if ($list) {
        const item = document.createElement('div');
        item.className = 'p-4 rounded-lg cursor-pointer hover:bg-green-50 transition-colors';
        item.innerHTML = `
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="font-semibold brand-dark-green">${loc.name}</h3>
              <p class="text-sm text-gray-600">${loc.address}</p>
              ${loc.horario ? `<p class="text-xs text-gray-500 mt-1"><strong>Horário:</strong> ${loc.horario}</p>` : ''}
            </div>
            <span style="display:inline-block;width:14px;height:14px;border-radius:50%;
                         background:${color};border:1px solid ${color}88"></span>
          </div>
          <div class="flex flex-wrap gap-1 mt-2">
            ${loc.materials.slice(0, 4).map(k => {
          const c = MAT_BY_KEY.get(k)?.color || '#2dd4bf';
          return `<span class="px-2 py-0.5 text-xs font-medium rounded-full"
                           style="background:${c}22;color:#064e3b;border:1px solid ${c}66">${k}</span>`;
        }).join('')}
            ${loc.materials.length > 4 ? '<span class="text-xs text-gray-500">…</span>' : ''}
          </div>
        `;
        item.addEventListener('click', () => {
          map.flyTo([loc.lat, loc.lng], 15);
          marker.openPopup();
        });
        $list.appendChild(item);
      }
    });

    if (ordered.length) {
      const bounds = L.latLngBounds(ordered.map(l => [l.lat, l.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  function renderNearbySuggestions() {
    if (!$list || !userLatLng) return;
    const nearby = sortByDistance(
      locations.filter(p => Number.isFinite(p._distanceKm) && p._distanceKm <= DEFAULT_RADIUS_KM)
    ).slice(0, SUGGESTIONS_LIMIT);

    let box = document.getElementById('nearby-suggestions');
    if (!nearby.length) { if (box) box.remove(); return; }

    if (!box) {
      box = document.createElement('div');
      box.id = 'nearby-suggestions';
      box.className = 'mb-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50';
      $list.prepend(box);
    }

    box.innerHTML = `
      <div class="flex items-center justify-between mb-2">
        <strong class="text-emerald-900">Perto de você (até ${DEFAULT_RADIUS_KM} km)</strong>
        <small class="text-emerald-700">${nearby.length} sugestão(ões)</small>
      </div>
      <div class="space-y-2">
        ${nearby.map(p => `
          <button data-id="${p.id}" class="w-full text-left p-2 rounded bg-white hover:bg-emerald-100 transition">
            <div class="flex items-center justify-between">
              <span class="font-semibold text-emerald-900">${p.name}</span>
              <span class="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">${kmLabel(p._distanceKm)}</span>
            </div>
            <div class="text-xs text-emerald-800">${p.address}</div>
          </button>
        `).join('')}
      </div>
    `;

    box.querySelectorAll('button[data-id]')?.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        const pt = locations.find(x => x.id === id);
        if (!pt) return;
        const mk = markers.find(mk => {
          const ll = mk.getLatLng();
          return Math.abs(ll.lat - pt.lat) < 1e-8 && Math.abs(ll.lng - pt.lng) < 1e-8;
        });
        map.flyTo([pt.lat, pt.lng], 16);
        mk?.openPopup();
      });
    });
  }

  // ---------- Filtros ----------
  function applyFilters() {
    const text = norm($search?.value || '');
    const selectKey = norm($select?.value || '');
    const onlyOpen = !!$openNow?.checked;

    const filtered = locations.filter(loc => {
      const matchText =
        norm(loc.name).includes(text) || norm(loc.address).includes(text);
      const matchSelect = !selectKey || loc.materials.some(k => k === selectKey);
      const matchChips = activeMaterials.size === 0 ||
        loc.materials.some(k => activeMaterials.has(k));

      const isOpen = !onlyOpen || checkOpenNow(loc.horario);

      return matchText && matchSelect && matchChips && isOpen;
    });

    renderMarkers(filtered);
  }

  function renderChips() {
    if (!$chips) return;
    $chips.innerHTML = '';
    MATERIALS.forEach(m => {
      const chip = document.createElement('button');
      chip.className = 'chip';
      chip.dataset.key = m.key;
      chip.innerHTML = `
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;
                     background:${m.color};margin-right:8px;border:1px solid ${m.color}aa"></span>${m.label}
      `;
      chip.addEventListener('click', () => {
        chip.classList.toggle('active');
        if (activeMaterials.has(m.key)) activeMaterials.delete(m.key);
        else activeMaterials.add(m.key);
        applyFilters();
      });
      $chips.appendChild(chip);
    });
  }

  // ---------- Listeners ----------
  $search?.addEventListener('input', applyFilters);
  $select?.addEventListener('change', applyFilters);
  $openNow?.addEventListener('change', applyFilters);
  $clearBtn?.addEventListener('click', () => {
    activeMaterials.clear();
    $chips?.querySelectorAll('.chip.active')?.forEach(c => c.classList.remove('active'));
    if ($search) $search.value = '';
    if ($select) $select.value = '';
    if ($openNow) $openNow.checked = false;
    applyFilters();
  });

  // ---------- Start ----------
  (async () => {
    initMap();
    await loadLocations();
    annotateDistances();
    renderChips();
    renderMarkers(locations);
    renderNearbySuggestions();
  })();
});
