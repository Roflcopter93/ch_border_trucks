// Initialize the map
let map;
let routeLines = [];
let animatedMarkers = [];
let currentCutoffTime = 17;

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    setupEventListeners();
});

function initializeMap() {
    // Create map centered on D-A-CH-IT region
    map = L.map('map', {
        center: [47.0, 8.5], // Centered on Switzerland/Austria border region
        zoom: 6,
        zoomControl: true,
        attributionControl: true
    });

    // Add base tile layer (political map)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);

    // Add start point marker
    addStartPointMarker();
    
    // Add customs crossing markers
    addCustomsMarkers();
    
    // Add destination markers
    addDestinationMarkers();
    
    // Draw initial routes
    drawRoutes();
}

function addStartPointMarker() {
    const startIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="
            background-color: #e74c3c;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 16px;
        ">🏭</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    L.marker(mapData.startPoint.coords, { icon: startIcon })
        .bindPopup(`
            <div class="popup-title">${mapData.startPoint.popup}</div>
            <div class="popup-info"><strong>Location:</strong> ${mapData.startPoint.name}</div>
            <div class="popup-info"><strong>Current Cut-off:</strong> <span id="popup-cutoff">${currentCutoffTime}:00</span></div>
        `)
        .addTo(map);
}

function addCustomsMarkers() {
    mapData.customsPoints.forEach(customs => {
        const customsIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="
                background-color: #f39c12;
                width: 25px;
                height: 25px;
                border-radius: 4px;
                border: 2px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 12px;
            ">🛃</div>`,
            iconSize: [25, 25],
            iconAnchor: [12.5, 12.5]
        });

        L.marker(customs.coords, { icon: customsIcon })
            .bindPopup(`
                <div class="popup-title">${customs.name}</div>
                <div class="popup-info"><strong>Opening Hours:</strong><br>${customs.openingHours}</div>
                <div class="popup-info"><strong>Truck Waiting Times:</strong><br>${customs.waitingTimes}</div>
            `)
            .addTo(map);
    });
}

function addDestinationMarkers() {
    mapData.destinations.forEach(destination => {
        const destIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="
                background-color: #27ae60;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 14px;
            ">🎯</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
        });

        const marker = L.marker(destination.coords, { icon: destIcon })
            .bindPopup(generateDestinationPopup(destination))
            .addTo(map);

        // Add hover event for dynamic popup updates
        marker.on('mouseover', function() {
            this.openPopup();
        });
    });
}

function generateDestinationPopup(destination) {
    const arrivalA_B = calculateArrivalTime(destination.routes.A_B.transitTimeHours);
    const arrivalA_C = calculateArrivalTime(destination.routes.A_C.transitTimeHours);
    
    return `
        <div class="popup-title">${destination.name}</div>
        <div class="popup-info">
            <strong>Früheste Ankunft A → B:</strong><br>
            <span class="popup-time ${arrivalA_B.isDelayed ? 'delayed' : ''}">${arrivalA_B.time}</span>
        </div>
        <div class="popup-info">
            <strong>Früheste Ankunft A → C:</strong><br>
            <span class="popup-time ${arrivalA_C.isDelayed ? 'delayed' : ''}">${arrivalA_C.time}</span>
        </div>
    `;
}

function calculateArrivalTime(transitHours) {
    const cutoffHour = currentCutoffTime;
    const currentDate = new Date();
    const cutoffTime = new Date(currentDate);
    cutoffTime.setHours(cutoffHour, 0, 0, 0);
    
    // If current time is past cutoff, move to next day
    if (currentDate.getHours() >= cutoffHour) {
        cutoffTime.setDate(cutoffTime.getDate() + 1);
    }
    
    const arrivalTime = new Date(cutoffTime.getTime() + (transitHours * 60 * 60 * 1000));
    const dayDiff = Math.floor((arrivalTime.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000));
    
    const timeString = arrivalTime.toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
    
    let dayString;
    if (dayDiff === 0) {
        dayString = "Heute";
    } else if (dayDiff === 1) {
        dayString = "D + 1";
    } else {
        dayString = `D + ${dayDiff}`;
    }
    
    return {
        time: `${dayString}, ${timeString}`,
        isDelayed: dayDiff > 1
    };
}

function drawRoutes() {
    // Clear existing routes
    routeLines.forEach(line => map.removeLayer(line));
    routeLines = [];

    mapData.destinations.forEach(destination => {
        // Draw A → B route (Standard-Direkt) - Blue solid line
        const routeA_B = L.polyline([
            mapData.startPoint.coords,
            destination.coords
        ], {
            color: '#2980b9',
            weight: 4,
            opacity: 0.8
        }).addTo(map);
        
        routeLines.push(routeA_B);

        // Draw A → C route (Westschweiz-Optimierung) - Green dashed line
        const routeA_C = L.polyline([
            mapData.startPoint.coords,
            destination.coords
        ], {
            color: '#27ae60',
            weight: 4,
            opacity: 0.8,
            dashArray: '10, 10'
        }).addTo(map);
        
        routeLines.push(routeA_C);

        // Add animated arrows for transit time visualization
        addAnimatedArrows(routeA_B, destination.routes.A_B.transitTimeHours, '#2980b9');
        addAnimatedArrows(routeA_C, destination.routes.A_C.transitTimeHours, '#27ae60');
    });
}

function addAnimatedArrows(polyline, transitHours, color) {
    // Create animated arrows along the route
    // Speed is inversely proportional to transit time (faster animation = shorter transit)
    const animationSpeed = Math.max(1000, 5000 - (transitHours * 100)); // Faster for shorter times
    
    // Get route coordinates
    const latlngs = polyline.getLatLngs();
    if (latlngs.length < 2) return;
    
    // Create multiple arrow markers along the route
    const numArrows = 3;
    for (let i = 0; i < numArrows; i++) {
        const progress = (i + 1) / (numArrows + 1);
        const lat = latlngs[0].lat + (latlngs[1].lat - latlngs[0].lat) * progress;
        const lng = latlngs[0].lng + (latlngs[1].lng - latlngs[0].lng) * progress;
        
        const arrowIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="
                color: ${color};
                font-size: 16px;
                text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
                animation: pulse ${animationSpeed}ms infinite;
                animation-delay: ${i * (animationSpeed / numArrows)}ms;
            ">➤</div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });
        
        const arrowMarker = L.marker([lat, lng], { icon: arrowIcon }).addTo(map);
        animatedMarkers.push(arrowMarker);
    }
}

function setupEventListeners() {
    const slider = document.getElementById('cutoffSlider');
    const timeDisplay = document.getElementById('timeDisplay');
    const routeButton = document.getElementById('routeButton');

    slider.addEventListener('input', function() {
        currentCutoffTime = parseInt(this.value);
        timeDisplay.textContent = `${currentCutoffTime}:00`;
        
        // Update popup cutoff time display
        const popupCutoff = document.getElementById('popup-cutoff');
        if (popupCutoff) {
            popupCutoff.textContent = `${currentCutoffTime}:00`;
        }
        
        // Refresh destination popups with new arrival times
        updateDestinationPopups();
    });

    if (routeButton) {
        routeButton.addEventListener('click', handleRouteSearch);
    }
}

function updateDestinationPopups() {
    // Find all destination markers and update their popups
    map.eachLayer(function(layer) {
        if (layer instanceof L.Marker) {
            const popup = layer.getPopup();
            if (popup && popup.getContent().includes('Früheste Ankunft')) {
                // Find the corresponding destination data
                const markerLatLng = layer.getLatLng();
                const destination = mapData.destinations.find(dest => 
                    Math.abs(dest.coords[0] - markerLatLng.lat) < 0.001 && 
                    Math.abs(dest.coords[1] - markerLatLng.lng) < 0.001
                );
                
                if (destination) {
                    layer.setPopupContent(generateDestinationPopup(destination));
                }
            }
        }
    });
}

async function handleRouteSearch() {
    const postalInput = document.getElementById('postalInput');
    const departureInput = document.getElementById('departureInput');
    const postalCode = postalInput.value.trim();
    if (!postalCode) {
        alert('Bitte PLZ eingeben');
        return;
    }

    const departureTime = departureInput.value || '06:00';

    try {
        const destCoords = await geocodePostalCode(postalCode);
        if (!destCoords) {
            alert('Ort nicht gefunden');
            return;
        }
        await planRoute(destCoords, departureTime);
    } catch (e) {
        console.error(e);
        alert('Fehler bei der Routenberechnung');
    }
}

async function geocodePostalCode(postal) {
    const url = `https://nominatim.openstreetmap.org/search?country=ch&postalcode=${encodeURIComponent(postal)}&format=json&limit=1`;
    const resp = await fetch(url, { headers: { 'Accept-Language': 'de' } });
    const data = await resp.json();
    if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
    return null;
}

function getNearestCustoms(point) {
    let nearest = null;
    let minDist = Infinity;
    mapData.customsPoints.forEach(cp => {
        const dist = Math.hypot(point[0] - cp.coords[0], point[1] - cp.coords[1]);
        if (dist < minDist) {
            minDist = dist;
            nearest = cp;
        }
    });
    return nearest;
}

async function planRoute(destCoords, departTimeStr) {
    // Remove previous dynamic routes
    routeLines.forEach(l => map.removeLayer(l));
    animatedMarkers.forEach(m => map.removeLayer(m));
    routeLines = [];
    animatedMarkers = [];

    const customs = getNearestCustoms(destCoords);
    const start = mapData.startPoint.coords;

    const first = await fetchRoute(start, customs.coords);
    const second = await fetchRoute(customs.coords, destCoords);

    const fullCoords = [...first.coords, ...second.coords.slice(1)];
    const poly = L.polyline(fullCoords.map(c => [c[0], c[1]]), { color: '#8e44ad', weight: 5 }).addTo(map);
    routeLines.push(poly);

    const departDate = getDepartureDate(departTimeStr);
    let arrivalAtCustoms = new Date(departDate.getTime() + first.duration * 1000);
    arrivalAtCustoms = adjustForCustoms(arrivalAtCustoms, customs.schedule);
    arrivalAtCustoms = new Date(arrivalAtCustoms.getTime() + (customs.averageWaitingMinutes || 0) * 60000);
    const arrivalDestination = new Date(arrivalAtCustoms.getTime() + second.duration * 1000);

    const marker = L.marker(destCoords).addTo(map);
    marker.bindPopup(`Früheste Ankunft: ${formatDate(arrivalDestination)}`).openPopup();
    map.fitBounds(poly.getBounds(), { padding: [20, 20] });
}

async function fetchRoute(a, b) {
    const url = `https://router.project-osrm.org/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?overview=full&geometries=geojson`;
    const resp = await fetch(url);
    const data = await resp.json();
    const route = data.routes[0];
    return { coords: route.geometry.coordinates.map(c => [c[1], c[0]]), duration: route.duration };
}

function getDepartureDate(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
    if (d < now) {
        d.setDate(d.getDate() + 1);
    }
    return d;
}

function adjustForCustoms(arrival, schedule) {
    let date = new Date(arrival);
    for (let i = 0; i < 7; i++) {
        const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        const dayName = dayNames[date.getDay()];
        const hours = schedule[dayName];
        if (!hours) {
            // closed whole day
            date.setDate(date.getDate() + 1);
            date.setHours(0,0,0,0);
            continue;
        }
        const [open, close] = hours;
        if (date.getHours() < open) {
            date.setHours(open,0,0,0);
            break;
        }
        if (date.getHours() >= close) {
            date.setDate(date.getDate() + 1);
            date.setHours(0,0,0,0);
            continue;
        }
        break;
    }
    return date;
}

function formatDate(d) {
    return d.toLocaleString('de-CH', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
}

