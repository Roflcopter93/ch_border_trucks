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

