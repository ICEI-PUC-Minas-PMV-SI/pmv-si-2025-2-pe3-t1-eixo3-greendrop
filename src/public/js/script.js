// Activate Feather Icons
feather.replace();

// Mobile Menu Toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
mobileMenuButton?.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
});

// MAPA 
document.addEventListener('DOMContentLoaded', () => {
  // Dados de exemplo
  const locations = [
    { id: 5,  name: 'Parque Municipal',            address: 'Av. Afonso Pena, 1377 - Centro, BH', lat: -19.9191, lng: -43.9386, type: "Plástico, Papel, Vidro, Metal, Isopor" },
    { id: 14, name: 'Savassi – GV x Inconfidentes', address: 'Savassi, BH',                        lat: -19.9367, lng: -43.9332, type: "Vidro" },
    { id: 31, name: 'URPV Pindorama',               address: 'Av. Amintas Jacques de Moraes, 2500 - BH', lat: -19.975,  lng: -44.0125, type: "Plástico, Papel, Vidro, Metal, Isopor" },
    { id: 49, name: 'UFMG – Portaria 6',            address: 'Av. Pres. Carlos Luz, BH',           lat: -19.8702, lng: -43.9675, type: "Plástico, Papel, Vidro, Metal, Isopor" },
    { id: 57, name: 'Zoológico (região)',           address: 'Av. Otacílio Negrão de Lima, 8000 - BH', lat: -19.8653, lng: -43.9712, type: "Plástico, Papel, Vidro, Metal, Isopor" },
    { id: 101,name: 'E-Mile – Sion',                address: 'Rua Montreal, 232 - BH',             lat: -19.9528, lng: -43.9279, type: "Eletrônicos, Baterias" },
    { id: 102,name: 'E-Mile – Savassi',             address: 'Rua Fernandes Tourinho, 500 - BH',   lat: -19.9369, lng: -43.9350, type: "Eletrônicos, Baterias, Pilhas" },
    { id: 103,name: 'E-Mile – Pampulha',            address: 'Av. Antônio Carlos, 8000 - BH',      lat: -19.8641, lng: -43.9718, type: "Eletrônicos, Baterias, Plástico" },
    { id: 104,name: 'E-Mile – Barreiro',            address: 'Av. Afonso Vaz de Melo, 640 - BH',   lat: -19.9776, lng: -44.0102, type: "Eletrônicos, Baterias" },
  ];

  const SUGGESTIONS_LIMIT = 3;
  const DEFAULT_RADIUS_KM = 5;

  const normalize = (str) =>
    (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const toRad = (deg) => (deg * Math.PI) / 180;
  function distanceKm(aLat, aLng, bLat, bLng) {
    const R = 6371; // km
    const dLat = toRad(bLat - aLat);
    const dLng = toRad(bLng - aLng);
    const s1 = Math.sin(dLat / 2) ** 2 +
               Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) *
               Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(s1), Math.sqrt(1 - s1));
    return R * c;
  }

  let userLatLng = null;    
  let markers = [];
  const listContainer = document.getElementById('locations-list');
  const searchInput  = document.getElementById('coleta-search');
  const filterSelect = document.getElementById('filter-material');

  // Inicializa o mapa
  const map = L.map('map').setView([-19.9191, -43.9386], 13);

  L.Control.MapRedirect = L.Control.extend({
    onAdd: function () {
      const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
      btn.innerHTML = '🌍';
      btn.title = 'Visualizar em tela cheia';
      btn.style.backgroundColor = '#10b981';
      btn.style.color = '#fff';
      btn.style.fontSize = '20px';
      btn.style.border = 'none';
      btn.style.cursor = 'pointer';
      btn.style.borderRadius = '6px';
      btn.style.width = '38px';
      btn.style.height = '38px';
      btn.onclick = () => window.location.href = '/mapa';
      return btn;
    }
  });
  L.control.mapRedirect = (opts) => new L.Control.MapRedirect(opts);
  L.control.mapRedirect({ position: 'bottomright' }).addTo(map);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  L.Control.RecenterMe = L.Control.extend({
    onAdd: function () {
      const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
      btn.innerHTML = '📍';
      btn.title = 'Centralizar em mim';
      Object.assign(btn.style, {
        backgroundColor: '#10b981',
        color: '#fff',
        border: 'none',
        fontSize: '18px',
        borderRadius: '6px',
        cursor: 'pointer',
        width: '38px',
        height: '38px',
        boxShadow: '0 3px 6px rgba(0,0,0,0.25)',
        transition: 'transform .2s ease'
      });
      btn.onmouseover  = () => btn.style.transform = 'scale(1.06)';
      btn.onmouseleave = () => btn.style.transform = 'scale(1.0)';
      btn.onclick = () => {
        if (userLatLng) {
          map.flyTo(userLatLng, Math.max(map.getZoom(), 15), { duration: 0.5 });
        } else {
          startLiveLocation();
        }
      };
      return btn;
    }
  });
  L.control.recenterMe = (opts) => new L.Control.RecenterMe(opts);
  L.control.recenterMe({ position: 'bottomright' }).addTo(map);

  const greenIcon = L.divIcon({
    className: 'custom-marker-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });

  // GEOLOCALIZAÇÃO
  let watchId = null;
  let userMarker = null;
  let accuracyCircle = null;
  let firstFixDone = false;

  function onPositionSuccess(pos) {
    const { latitude, longitude, accuracy } = pos.coords;
    const latlng = [latitude, longitude];
    userLatLng = { lat: latitude, lng: longitude };

    if (!userMarker) {
      userMarker = L.marker(latlng, { title: 'Você está aqui', zIndexOffset: 1000 })
        .addTo(map).bindPopup('📍 Você está aqui');
      accuracyCircle = L.circle(latlng, {
        radius: accuracy || 30, color: '#10b981', fillColor: '#10b981', fillOpacity: 0.15, weight: 1
      }).addTo(map);
    } else {
      userMarker.setLatLng(latlng);
      accuracyCircle.setLatLng(latlng);
      accuracyCircle.setRadius(accuracy || 30);
    }
    if (!firstFixDone) {
      firstFixDone = true;
      map.flyTo(latlng, Math.max(map.getZoom(), 15), { duration: 0.8 });
      userMarker.openPopup();
    }

    annotateDistances();
    applyFilters();           
    renderNearbySuggestions(); 
  }

  function onPositionError(err) {
    const msgs = {
      1: 'Permissão negada. Ative a localização do navegador.',
      2: 'Posição indisponível. Tente novamente.',
      3: 'Tempo esgotado ao obter posição. Tente novamente.'
    };
    console.warn('Geolocation error:', err);
    const msg = msgs[err.code] || 'Não foi possível obter sua localização.';
  }

  function startLiveLocation() {
    if (!('geolocation' in navigator)) {
      console.warn('Geolocalização não suportada neste navegador.');
      return;
    }
    watchId = navigator.geolocation.watchPosition(onPositionSuccess, onPositionError, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 10000
    });
  }
  function stopLiveLocation() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
  }

  startLiveLocation();

  function annotateDistances() {
    if (!userLatLng) {
      locations.forEach(p => delete p._distanceKm);
      return;
    }
    locations.forEach(p => {
      p._distanceKm = distanceKm(userLatLng.lat, userLatLng.lng, p.lat, p.lng);
    });
  }

  function sortByDistance(arr) {
    if (!userLatLng) return arr.slice();
    return arr.slice().sort((a, b) => {
      const da = Number.isFinite(a._distanceKm) ? a._distanceKm : Infinity;
      const db = Number.isFinite(b._distanceKm) ? b._distanceKm : Infinity;
      return da - db;
    });
  }

  function kmLabel(v) {
    if (!Number.isFinite(v)) return '';
    if (v < 1)  return `${Math.round(v * 1000)} m`;
    return `${v.toFixed(1)} km`;
  }

  function renderMarkers(filteredLocations) {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    if (listContainer) {
      const sugg = document.getElementById('nearby-suggestions');
      listContainer.innerHTML = '';
      if (sugg) listContainer.appendChild(sugg);
    }

    // Ordena por proximidade se tivermos userLatLng
    const listToRender = sortByDistance(filteredLocations);

    listToRender.forEach(loc => {
      const marker = L.marker([loc.lat, loc.lng], { icon: greenIcon }).addTo(map);

      const distText = Number.isFinite(loc._distanceKm) ? `<br/><small>Distância: ${kmLabel(loc._distanceKm)}</small>` : '';
      marker.bindPopup(`
        <div class="font-sans">
          <h3 class="font-bold text-lg brand-dark-green">${loc.name}</h3>
          <p class="text-gray-600">${loc.address}</p>
          <p class="text-sm text-gray-500 mt-1"><strong>Materiais:</strong> ${loc.type}</p>
          ${distText}
        </div>
      `);
      markers.push(marker);

      // item na lista lateral
      if (listContainer) {
        const item = document.createElement('div');
        item.className = 'p-4 rounded-lg cursor-pointer hover:bg-green-50 transition-colors';
        item.innerHTML = `
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="font-semibold brand-dark-green">${loc.name}</h3>
              <p class="text-sm text-gray-600">${loc.address}</p>
            </div>
            ${Number.isFinite(loc._distanceKm) ? `<span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">${kmLabel(loc._distanceKm)}</span>` : ''}
          </div>
        `;
        item.addEventListener('click', () => {
          map.flyTo([loc.lat, loc.lng], 15);
          marker.openPopup();
        });
        listContainer.appendChild(item);
      }
    });
  }

  function renderNearbySuggestions() {
    if (!listContainer || !userLatLng) return;

    const nearby = sortByDistance(
      locations.filter(p => Number.isFinite(p._distanceKm) && p._distanceKm <= DEFAULT_RADIUS_KM)
    ).slice(0, SUGGESTIONS_LIMIT);

    let box = document.getElementById('nearby-suggestions');

    if (!nearby.length) {
      if (box) box.remove();
      return;
    }

    if (!box) {
      box = document.createElement('div');
      box.id = 'nearby-suggestions';
      box.className = 'mb-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50';
      listContainer.prepend(box);
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

    // binds
    box.querySelectorAll('button[data-id]')?.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        const pt = locations.find(x => x.id === id);
        if (!pt) return;
        const mk = markers.find(m => {
          const ll = m.getLatLng();
          return Math.abs(ll.lat - pt.lat) < 1e-8 && Math.abs(ll.lng - pt.lng) < 1e-8;
        });

        map.flyTo([pt.lat, pt.lng], 16);
        mk?.openPopup();
      });
    });
  }

  function applyFilters() {
    const text = normalize(searchInput?.value || '');
    const selectedMaterial = normalize(filterSelect?.value || '');

    const filtered = locations.filter(loc => {
      const matchText =
        normalize(loc.name).includes(text) ||
        normalize(loc.address).includes(text);
      const matchMaterial = !selectedMaterial ||
        normalize(loc.type).includes(selectedMaterial);
      return matchText && matchMaterial;
    });

    renderMarkers(filtered);
  }

  searchInput?.addEventListener('input', applyFilters);
  filterSelect?.addEventListener('change', applyFilters);

  renderMarkers(locations);
});
