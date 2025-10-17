// Activate Feather Icons
feather.replace();

// Mobile Menu Toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Map Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Dados de exemplo
    const locations = [
        {
            id: 01,
            name: "Ponto de Coleta – Centro (Praça Sete)",
            address: "Av. Afonso Pena, 700 – Centro",
            lat: -19.9191, lng: -43.9386,
            type: "Plástico, Papel, Vidro, Metal"
        },
        {
            id: 02,
            name: "Eco Ponto – Savassi",
            address: "Praça Diogo de Vasconcelos – Savassi",
            lat: -19.9367, lng: -43.9332,
            type: "Plástico, Papel, Vidro"
        },
        {
            id: 03,
            name: "Green Station – Funcionários",
            address: "Av. Getúlio Vargas, 1200 – Funcionários",
            lat: -19.9345, lng: -43.9359,
            type: "Eletrônicos, Baterias"
        },
        {
            id: 04,
            name: "Ponto de Coleta – Santa Efigênia",
            address: "Av. do Contorno, 4800 – Santa Efigênia",
            lat: -19.9222, lng: -43.9219,
            type: "Plástico, Papel, Vidro, Óleo de Cozinha"
        },
        {
            id: 05,
            name: "Eco Ponto – Pampulha (Mineirão)",
            address: "Av. Antônio Abrahão Caram, 1001 – São José",
            lat: -19.8653, lng: -43.9712,
            type: "Plástico, Papelão, Vidro"
        },
        {
            id: 06,
            name: "Ponto de Coleta – UFMG",
            address: "Av. Pres. Carlos Luz, 6627 – Pampulha",
            lat: -19.8702, lng: -43.9675,
            type: "Eletrônicos, Pilhas/Baterias"
        },
        {
            id: 07,
            name: "Green Station – Barreiro",
            address: "Av. Olinto Meireles, 1800 – Barreiro",
            lat: -19.9750, lng: -44.0125,
            type: "Plástico, Papel, Vidro, Metal"
        },
    ];

    // Cria o mapa
    const map = L.map('map').setView([-19.9191, -43.9386], 13);

    // Camada base
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    const greenIcon = L.divIcon({
        className: 'custom-marker-icon',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10]
    });

    // Popula lista com marcadores
    const list = document.getElementById('locations-list');
    locations.forEach(loc => {
        const marker = L.marker([loc.lat, loc.lng], { icon: greenIcon })
            .addTo(map)
            .bindPopup(`
                <div class="font-sans">
                    <h3 class="font-bold text-lg brand-dark-green">${loc.name}</h3>
                    <p class="text-gray-600">${loc.address}</p>
                    <p class="text-sm text-gray-500 mt-1"><strong>Coleta:</strong> ${loc.type}</p>
                </div>
                `);

        if (list) {
            const item = document.createElement('div');
            item.className = 'p-4 rounded-lg cursor-pointer hover:bg-green-50 transition-colors';
            item.innerHTML = `<h3 class="font-semibold brand-dark-green">${loc.name}</h3>
                                <p class="text-sm text-gray-600">${loc.address}</p>`;
            item.addEventListener('click', () => { map.flyTo([loc.lat, loc.lng], 15); marker.openPopup(); });
            list.appendChild(item);
        }
    });
});