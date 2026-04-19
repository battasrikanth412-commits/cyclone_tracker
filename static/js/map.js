// Leaflet Map Initialization
const defaultLat = 15.0;
const defaultLng = 75.0;

// Set up the map in Dark Mode to match our premium aesthetic
const map = L.map('map', {
    center: [defaultLat, defaultLng],
    zoom: 5,
    zoomControl: false // Will place custom
});

// Move zoom control down to avoid overlapping the status overlay
L.control.zoom({ position: 'bottomright' }).addTo(map);

// Use a beautiful dark map tile layer from CartoDB!
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

// Let's create custom icons
const originIcon = L.divIcon({
    className: 'pulse-marker',
    iconSize: [16, 16]
});

const trajectoryIcon = L.divIcon({
    className: 'trajectory-marker',
    html: '<div style="background:#00d4ff; width:8px; height:8px; border-radius:50%; box-shadow: 0 0 8px #00d4ff;"></div>',
    iconSize: [8, 8]
});

// Massive Animated Hurricane Instance!
const cycloneVortexIcon = L.divIcon({
    className: 'vortex-container',
    html: `
        <div class="hurricane-vortex"></div>
        <div class="rain-field">
            <div class="rain-drop"></div><div class="rain-drop"></div><div class="rain-drop"></div>
            <div class="rain-drop"></div><div class="rain-drop"></div><div class="rain-drop"></div>
            <div class="rain-drop"></div><div class="rain-drop"></div>
        </div>
    `,
    iconSize: [100, 100],
    iconAnchor: [50, 50] // Center precisely on the coordinate!
});

let drawnLayerGroup = L.layerGroup().addTo(map);

// DOM Elements
const predictForm = document.getElementById('predictForm');
const predictBtn = document.getElementById('predictBtn');
const btnText = document.querySelector('.btn-text');
const loadingSpinner = document.getElementById('loadingSpinner');
const statusText = document.getElementById('statusText');
const errorBox = document.getElementById('errorBox');

function setLoading(isLoading) {
    if (isLoading) {
        predictBtn.disabled = true;
        btnText.classList.add('d-none');
        loadingSpinner.classList.remove('d-none');
        statusText.innerHTML = '<span class="text-primary">AI is analyzing meteorological data...</span>';
        errorBox.classList.add('d-none');
    } else {
        predictBtn.disabled = false;
        btnText.classList.remove('d-none');
        loadingSpinner.classList.add('d-none');
    }
}

// Intercept Form Submit
predictForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous prediction elements from map
    drawnLayerGroup.clearLayers();

    // Get parameters
    const payload = {
        latitude: parseFloat(document.getElementById('latitude').value),
        longitude: parseFloat(document.getElementById('longitude').value),
        wind_speed: parseFloat(document.getElementById('wind_speed').value),
        pressure: parseFloat(document.getElementById('pressure').value),
        temperature: parseFloat(document.getElementById('temperature').value),
        humidity: parseFloat(document.getElementById('humidity').value),
        direction: parseFloat(document.getElementById('direction').value)
    };

    setLoading(true);

    try {
        const response = await fetch('/api/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        renderPrediction(data);
        setLoading(false);
        statusText.innerHTML = '<span class="text-success">Prediction complete! Tracking path.</span>';

    } catch (err) {
        console.error(err);
        setLoading(false);
        errorBox.textContent = "Error: " + err.message;
        errorBox.classList.remove('d-none');
        statusText.innerHTML = '<span class="text-danger">Failed to generate prediction.</span>';
    }
});

function renderPrediction(data) {
    const { initial, trajectory } = data;

    // 1. Draw origin marker
    L.marker([initial.lat, initial.lng], { icon: originIcon })
        .bindPopup(`<b>Origin</b><br>Lat: ${initial.lat.toFixed(2)}, Lng: ${initial.lng.toFixed(2)}`)
        .addTo(drawnLayerGroup);

    // 2. Spawn the colossal VFX vortex storm exactly at origin
    let mainStormVortex = L.marker([initial.lat, initial.lng], { icon: cycloneVortexIcon, zIndexOffset: 1000 })
        .addTo(drawnLayerGroup);

    // 3. Animate drawing the trajectory
    let currentLatLngs = [[initial.lat, initial.lng]];

    // Activate 2-Second Rapid Glitch Shake!
    const mapEl = document.getElementById('map');
    mapEl.classList.add('shake-intense');
    setTimeout(() => {
        mapEl.classList.remove('shake-intense');
    }, 2000);

    // Build a polyline with 0 points initially, we will add dynamically
    let polyline = L.polyline(currentLatLngs, {
        color: '#ff00ff', // High-contrast neon magenta
        weight: 5,
        opacity: 0.9,
        dashArray: '10, 15',
        className: 'animated-trajectory'
    }).addTo(drawnLayerGroup);

    // Pan map to area safely, bounds covering both initial and rough estimate of end
    const lastPoint = trajectory[trajectory.length - 1];
    const bounds = L.latLngBounds([initial.lat, initial.lng], [lastPoint.lat, lastPoint.lng]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });

    let stepIndex = 0;

    // Smooth interval to draw points one by one for dynamic wow effect
    const animationInterval = setInterval(() => {
        if (stepIndex >= trajectory.length) {
            clearInterval(animationInterval);

            // Dispatch live news report
            const wVel = document.getElementById('wind_speed').value;
            const pVal = document.getElementById('pressure').value;
            generateNewsReport(initial, trajectory[trajectory.length - 1], wVel, pVal);

            return;
        }

        const point = trajectory[stepIndex];
        currentLatLngs.push([point.lat, point.lng]);

        // Move the giant storm vortex to the new coordinate
        mainStormVortex.setLatLng([point.lat, point.lng]);

        // Update line path
        polyline.setLatLngs(currentLatLngs);

        // Add a trace dot for mapping history
        L.marker([point.lat, point.lng], { icon: trajectoryIcon })
            .bindPopup(`<b>Step ${point.step}</b><br>Wind Forecast: ${point.wind_speed_forecast.toFixed(1)} km/h<br>Lat: ${point.lat.toFixed(2)} Lng: ${point.lng.toFixed(2)}`)
            .addTo(drawnLayerGroup);

        stepIndex++;
    }, 650); // Slower interval (650ms) so users can watch the storm ravage the area!
}

// Initial draw an empty state status
statusText.innerHTML = "AWAITING COMM...";

// --- News Report Logic ---
async function getLocationName(lat, lng) {
    try {
        // Use OpenStreetMap Nominatim for free reverse geocoding
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
        const data = await response.json();
        if (data && data.address) {
            // Pick the most relevant location name available
            return data.address.city || data.address.town || data.address.county || data.address.state || data.address.country || `${lat.toFixed(2)} N, ${lng.toFixed(2)} E`;
        }
    } catch (e) {
        console.error("Geocoding failed:", e);
    }
    return `${lat.toFixed(2)} N, ${lng.toFixed(2)} E`; // Fallback if API fails
}

async function generateNewsReport(initial, finalPoint, windVelocity, pressureVal) {
    const newsPanel = document.getElementById('newsPanel');
    const newsContent = document.getElementById('newsContent');

    // Open panel and clear old reports
    newsPanel.classList.add('open');
    newsContent.innerHTML = "Retrieving geospatial location data...";

    // Fetch place names
    const startLoc = await getLocationName(initial.lat, initial.lng);
    const endLoc = await getLocationName(finalPoint.lat, finalPoint.lng);
    
    newsContent.innerHTML = ""; // Clear loader once data is ready

    // Determine compass directions for flavor
    const dirTxt = initial.lat < finalPoint.lat ? "North" : "South";
    const dirTxt2 = initial.lng < finalPoint.lng ? "East" : "West";

    const text = `>> URGENT WEATHER BULLETIN <<

A severe cyclonic storm has formed near ${startLoc} with an intense initial barometric pressure of ${pressureVal} hPa.

The system is currently tracking ${dirTxt}-${dirTxt2} on a high-threat trajectory. Sustained winds have maxed at ${windVelocity} km/h, carrying heavy precipitation and structural threat potential.

Current projections estimate landfall or continued movement towards ${endLoc}. All regions in the projection path are advised to initiate emergency protocols immediately.

>> END OF TRANSMISSION`;

    let i = 0;
    function typeWriter() {
        if (i < text.length) {
            let char = text.charAt(i);
            if (char === '\n') {
                newsContent.innerHTML += '<br>';
            } else {
                newsContent.innerHTML += char;
            }
            i++;
            setTimeout(typeWriter, 15); // Typewriter speed
        }
    }
    typeWriter();
}

function closeNews() {
    document.getElementById('newsPanel').classList.remove('open');
}
