(function(){
  // Tipos e cores ícones
  const MATERIAL_TYPES = [
    { key:'plastico',     label:'Plástico',     color:'#2dd4bf' },
    { key:'vidro',        label:'Vidro',        color:'#22c55e' },
    { key:'metal',        label:'Metal',        color:'#f59e0b' },
    { key:'papel',        label:'Papel',        color:'#60a5fa' },
    { key:'organico',     label:'Orgânico',     color:'#a3e635' },
    { key:'eletronicos',  label:'Eletrônicos',  color:'#ef4444' },
  ];

  // Fonte de dados: prioriza variável injetada na view; se vazia, tenta API
  async function loadPoints(){
    if (Array.isArray(window.__POINTS__) && window.__POINTS__.length){
      return window.__POINTS__;
    }
    try{
      const r = await fetch('/api/pontos');
      if(!r.ok) throw new Error('erro api');
      return await r.json();
    }catch(e){
      console.warn('Sem pontos, usando exemplo');
      return [];
    }
  }

  let leafletMap, markerCluster;
  function initLeaflet(points){
    leafletMap = L.map('map-leaflet', {
      zoomControl: true, attributionControl: true
    }).setView([-19.9167, -43.9345], 13);

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(leafletMap);

    markerCluster = L.markerClusterGroup();
    leafletMap.addLayer(markerCluster);

    renderLeafletMarkers(points);
  }

  function markerHtml(color){
    const size = 22;
    const dot = 10;
    return `
      <div style="
        width:${size}px;height:${size}px;border-radius:50%;
        background:#fff;border:2px solid ${color};
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 2px 8px rgba(0,0,0,.15)">
        <span style="display:block;width:${dot}px;height:${dot}px;border-radius:50%;background:${color}"></span>
      </div>`;
  }

  function renderLeafletMarkers(points, activeKeys){
    markerCluster.clearLayers();
    points
      .filter(p => {
        if(!activeKeys || activeKeys.size===0) return true;
        return (p.materials||[]).some(m => activeKeys.has(m));
      })
      .forEach(p => {
        const firstType = (p.materials && p.materials[0]) || 'plastico';
        const mat = MATERIAL_TYPES.find(m => m.key===firstType) || MATERIAL_TYPES[0];
        const icon = L.divIcon({className:'', html:markerHtml(mat.color), iconSize:[24,24], iconAnchor:[12,12]});
        const mk = L.marker([p.lat, p.lng], { icon });
        mk.bindPopup(`
          <strong>${p.name || 'Ponto de Descarte'}</strong><br/>
          ${p.address || ''}<br/>
          <small>Materiais: ${(p.materials||[]).map(k => MATERIAL_TYPES.find(m=>m.key===k)?.label || k).join(', ')}</small><br/>
          <a href="/pontos/${p.id || ''}" style="color:#34A853;font-weight:800">Detalhes</a>
        `);
        markerCluster.addLayer(mk);
      });

    if(markerCluster.getLayers().length){
      leafletMap.fitBounds(markerCluster.getBounds().pad(0.12));
    }
  }

  // MAPLIBRE (3D/perspectiva)
  let mlMap, mlMarkers = [];
  function initMapLibre(points){
    mlMap = new maplibregl.Map({
    container: 'map-maplibre',
    style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${window.MAPTILER_KEY}`,
    center: [-46.6388, -23.5489],
    zoom: 12,
    pitch: 60,
    bearing: -20,
    attributionControl: true
  });
  mlMap.addControl(new maplibregl.NavigationControl(), 'top-right');

  mlMap.on('load', () => {
    // Efeitos 3D adicionais
    mlMap.addSource('terrain', {
      type: 'raster-dem',
      url: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json',
      tileSize: 256,
      maxzoom: 14
    });
    mlMap.setTerrain({ source: 'terrain', exaggeration: 1.3 });
    // Céu atmosférico
    mlMap.addLayer({
      id: 'sky',
      type: 'sky',
      paint: {
        'sky-type': 'atmosphere',
        'sky-atmosphere-sun': [0.0, 0.0],
        'sky-atmosphere-sun-intensity': 12
      }
    });
    // Edifícios 3D
    mlMap.addLayer(
      {
        id: '3d-buildings',
        source: 'openmaptiles',           
        'source-layer': 'building',
        filter: ['==', ['get', 'extrude'], 'true'],
        type: 'fill-extrusion',
        minzoom: 15,
        paint: {
          'fill-extrusion-color': '#b8c2cc',
          'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 10],
          'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
          'fill-extrusion-opacity': 0.7
        }
      },
      (mlMap.getStyle().layers.find(l => l.type === 'symbol') || {}).id
    );
    renderMapLibreMarkers(points);
  });

    mlMap.addControl(new maplibregl.NavigationControl(), 'top-right');
    mlMap.on('load', () => renderMapLibreMarkers(points));
  }

  function renderMapLibreMarkers(points, activeKeys){
    mlMarkers.forEach(m => m.remove());
    mlMarkers = [];

    points
      .filter(p => {
        if(!activeKeys || activeKeys.size===0) return true;
        return (p.materials||[]).some(m => activeKeys.has(m));
      })
      .forEach(p => {
        const firstType = (p.materials && p.materials[0]) || 'plastico';
        const mat = MATERIAL_TYPES.find(m => m.key===firstType) || MATERIAL_TYPES[0];
        const el = document.createElement('div');
        el.style.width='18px'; el.style.height='18px';
        el.style.border='2px solid '+mat.color;
        el.style.background='#fff';
        el.style.borderRadius='50%';
        el.style.boxShadow='0 2px 8px rgba(0,0,0,.25)';
        const inner=document.createElement('div');
        inner.style.width='8px'; inner.style.height='8px'; inner.style.borderRadius='50%';
        inner.style.background=mat.color; inner.style.margin='3px auto';
        el.appendChild(inner);

        const popupHtml = `
          <div style="font-family:Inter,system-ui">
            <strong>${p.name || 'Ponto de Descarte'}</strong><br/>
            ${p.address || ''}<br/>
            <small>Materiais: ${(p.materials||[]).map(k => MATERIAL_TYPES.find(m=>m.key===k)?.label || k).join(', ')}</small><br/>
            <a href="/pontos/${p.id || ''}" style="color:#34A853;font-weight:800">Detalhes</a>
          </div>`;

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([p.lng, p.lat])
          .setPopup(new maplibregl.Popup({ offset: 18 }).setHTML(popupHtml))
          .addTo(mlMap);

        mlMarkers.push(marker);
      });

    if(points.length){
      const bounds = new maplibregl.LngLatBounds();
      points.forEach(p => bounds.extend([p.lng, p.lat]));
      if(!bounds.isEmpty()){
        mlMap.fitBounds(bounds, { padding: 80, duration: 600, pitch: 55, bearing: -20 });
      }
    }
  }

  // Filtros e troca de visão 
  const active = new Set(); 
  function mountChips(){
    const chipsBox = document.getElementById('chips');
    chipsBox.innerHTML = '';
    MATERIAL_TYPES.forEach(t => {
      const b = document.createElement('button');
      b.className = 'chip';
      b.dataset.key = t.key;
      b.textContent = t.label;
      b.addEventListener('click', () => {
        if(active.has(t.key)){ active.delete(t.key); b.classList.remove('active'); }
        else { active.add(t.key); b.classList.add('active'); }
        renderWithFilter();
      });
      chipsBox.appendChild(b);
    });
    document.getElementById('clearFilters').addEventListener('click', () => {
      active.clear();
      chipsBox.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      renderWithFilter();
    });
  }

  function renderWithFilter(){
    if(leafletMap) renderLeafletMarkers(window.__ALL_POINTS__, active);
    if(mlMap) renderMapLibreMarkers(window.__ALL_POINTS__, active);
  }

  function initViewToggle(){
    const btns = Array.from(document.querySelectorAll('.btn-toggle'));
    const l = document.getElementById('map-leaflet');
    const m = document.getElementById('map-maplibre');

    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => { x.classList.remove('active'); x.setAttribute('aria-selected','false'); });
      b.classList.add('active'); b.setAttribute('aria-selected','true');

      const view = b.dataset.view;
      if(view === 'leaflet'){
        l.classList.add('is-visible'); m.classList.remove('is-visible');
        setTimeout(()=> { leafletMap && leafletMap.invalidateSize(); }, 50);
      }else{
        m.classList.add('is-visible'); l.classList.remove('is-visible');
        setTimeout(()=> { mlMap && mlMap.resize(); }, 50);
      }
    }));
  }

  // Boot 
  document.addEventListener('DOMContentLoaded', async () => {
    mountChips();
    const points = await loadPoints();
    window.__ALL_POINTS__ = points || [];
    initLeaflet(window.__ALL_POINTS__);
    initMapLibre(window.__ALL_POINTS__);
    initViewToggle();
    document.querySelector('.btn-toggle[data-view="leaflet"]').click();
  });
})();
