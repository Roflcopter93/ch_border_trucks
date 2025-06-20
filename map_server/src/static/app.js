// Initialize the map
let map;
let routeLines = [];
let animatedMarkers = [];
let destinationMarker = null;
let currentCutoffTime = 17;

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    setupEventListeners();
    const dateInput = document.getElementById('departureDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
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

        destinationMarker = L.marker(destination.coords, { icon: destIcon })
            .bindPopup(generateDestinationPopup(destination))
            .addTo(map);

        // Add hover event for dynamic popup updates
        destinationMarker.on('mouseover', function() {
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
    
    let arrivalTime = new Date(cutoffTime.getTime() + (transitHours * 60 * 60 * 1000));
    arrivalTime = adjustForWeekend(arrivalTime);
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


function setupEventListeners() {
    const routeButton = document.getElementById('routeButton');
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
    const departureTimeInput = document.getElementById('departureTime');
    const departureDateInput = document.getElementById('departureDate');
    const postalCode = postalInput.value.trim();
    if (!postalCode) {
        alert('Bitte PLZ eingeben');
        return;
    }

    const departTime = departureTimeInput.value.trim();
    const departDate = departureDateInput.value.trim();
    if (!departTime || !departDate) {
        alert('Bitte Datum und Uhrzeit angeben');
        return;
    }
    if (!/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/.test(departTime)) {
        alert('Bitte Zeit im Format HH:MM angeben');
        return;
    }

    try {
        const destInfo = await geocodePostalCode(postalCode);
        if (!destInfo) {
            alert('Ort nicht gefunden');
            return;
        }
        await planRoute(destInfo, departDate, departTime);
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
        const item = data[0];
        const name = item.display_name.split(',')[0];
        return { coords: [parseFloat(item.lat), parseFloat(item.lon)], name };
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

async function planRoute(destInfo, departDateStr, departTimeStr) {
    const destCoords = destInfo.coords;
    const postalCodeDisplay = destInfo.name;
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

    const departDate = getDepartureDate(departDateStr, departTimeStr);
    const firstLeg = driveSegment(departDate, first.duration / 3600, 0);
    let arrivalAtCustoms = adjustForCustoms(firstLeg.time, customs.schedule);
    arrivalAtCustoms = new Date(arrivalAtCustoms.getTime() + (customs.averageWaitingMinutes || 0) * 60000);
    const secondLeg = driveSegment(arrivalAtCustoms, second.duration / 3600, firstLeg.hoursToday);
    let arrivalDestination = adjustForWeekend(secondLeg.time);

    if (destinationMarker) {
        destinationMarker.setLatLng(destCoords);
    } else {
        destinationMarker = L.marker(destCoords).addTo(map);
    }
    destinationMarker
        .bindPopup(
            `Ankunft Zoll (${customs.name}): ${formatDate(arrivalAtCustoms)}<br>` +
            `Früheste Ankunft (${postalCodeDisplay}): ${formatDate(arrivalDestination)}`
        )
        .openPopup();
    map.fitBounds(poly.getBounds(), { padding: [20, 20] });
}

async function fetchRoute(a, b) {
    const url = `https://router.project-osrm.org/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?overview=full&geometries=geojson`;
    const resp = await fetch(url);
    const data = await resp.json();
    const route = data.routes[0];
    const speedMS = 70 * 1000 / 3600;
    const duration = route.distance / speedMS; // seconds
    return {
        coords: route.geometry.coordinates.map(c => [c[1], c[0]]),
        duration
    };
}

function driveSegment(startTime, durationHours, hoursToday) {
    let time = new Date(startTime);
    let remaining = durationHours;
    let driven = hoursToday;
    while (remaining > 0) {
        const timeUntilBreak = 5 - (driven % 5);
        const timeUntilLimit = 9 - driven;
        let drive = Math.min(remaining, timeUntilBreak, timeUntilLimit);
        time = new Date(time.getTime() + drive * 3600000);
        remaining -= drive;
        driven += drive;
        if (remaining <= 0) break;
        if (driven % 5 === 0 && driven < 9) {
            time = new Date(time.getTime() + 45 * 60000);
        }
        if (driven >= 9) {
            time = new Date(time.getTime() + 11 * 3600000);
            driven = 0;
        }
    }
    return { time, hoursToday: driven };
}

function getDepartureDate(dateStr, timeStr) {
    const [y, mo, d] = dateStr.split('-').map(Number);
    const [h, m] = timeStr.split(':').map(Number);
    return new Date(y, mo - 1, d, h, m, 0, 0);
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
        const currentHour = date.getHours() + date.getMinutes() / 60;
        if (currentHour < open) {
            const oh = Math.floor(open);
            const om = Math.round((open - oh) * 60);
            date.setHours(oh, om, 0, 0);
            break;
        }
        if (currentHour >= close) {
            date.setDate(date.getDate() + 1);
            date.setHours(0,0,0,0);
            continue;
        }
        break;
    }
    return date;
}

function adjustForWeekend(date) {
    const day = date.getDay();
    if (day === 6) { // Saturday
        date.setDate(date.getDate() + 2);
    } else if (day === 0) { // Sunday
        date.setDate(date.getDate() + 1);
    }
    return date;
}

function formatDate(d) {
    return d.toLocaleString('de-CH', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
}

