// let voiceflowRuntime;

// async function initializeVoiceflow() {
//     voiceflowRuntime = await window.voiceflow.createRuntime({
//         projectID: 'YOUR_VOICEFLOW_PROJECT_ID',
//         versionID: 'YOUR_VOICEFLOW_VERSION_ID',
//         apiKey: 'YOUR_VOICEFLOW_API_KEY'
//     });
// }
let map;
let platform;
let searchService;
let searchButton;
let locationInput;
let resultsContainer;
let bookingFormContainer;
let bookingForm;
let selectedStation;
let dashboardContainer;
let adminLoginForm;
let adminPortal;
let adminDashboard;
// Simulated database for station availability and bookings
const stationAvailability = {};
const bookings = [];

const adminCredentials = { username: 'admin', password: 'password' };

function initMap() {
    platform = new H.service.Platform({
        apikey: '65jwV26Xcq8I_t3oy-tMgNH3IVK2bm5uA-2uN8S2xxw'
    });

    const defaultLayers = platform.createDefaultLayers();

    map = new H.Map(
        document.getElementById('map-container'),
        defaultLayers.vector.normal.map,
        {
            zoom: 10,
            center: { lat: 21.1959, lng: 81.2989 }
        }
    );

    window.addEventListener('resize', () => map.getViewPort().resize());
    new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    H.ui.UI.createDefault(map, defaultLayers);

    searchService = platform.getSearchService();
}

async function searchLocation() {
    const query = locationInput.value;

    try {
        const result = await new Promise((resolve, reject) => {
            searchService.geocode({ q: query }, resolve, reject);
        });

        if (result.items && result.items.length > 0) {
            const position = result.items[0].position;
            map.setCenter({ lat: position.lat, lng: position.lng });
            map.setZoom(14);
            fetchChargingStations(position.lat, position.lng);
        } else {
            alert('Location not found. Please try a different search term.');
        }
    } catch (error) {
        console.error('Error during geocoding:', error);
        alert('Error searching for location. Please try again.');
    }
}

async function fetchChargingStations(lat, lon) {
    try {
        const response = await fetch(`/api/charging-stations?lat=${lat}&lon=${lon}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        displayChargingStations(data);
    } catch (error) {
        console.error('Error fetching charging stations:', error);
        alert('Error fetching charging stations. Please try again later.');
    }
}

function displayChargingStations(stations) {
    resultsContainer.innerHTML = '';
    stations.forEach(station => {
        const marker = new H.map.Marker({ lat: station.AddressInfo.Latitude, lng: station.AddressInfo.Longitude });
        map.addObject(marker);

        const card = document.createElement('div');
        card.className = 'station-card';
        card.innerHTML = `
            <h3>${station.AddressInfo.Title}</h3>
            <p>Address: ${station.AddressInfo.AddressLine1}</p>
            <p>Charging Speed: ${station.Connections[0]?.PowerKW || 'N/A'} kW</p>
            <p>Available: ${station.StatusType?.IsOperational ? 'Yes' : 'No'}</p>
            <button class="book-button">Book Now</button>
        `;
        resultsContainer.appendChild(card);

        // Initialize availability for this station if not already set
        if (!stationAvailability[station.AddressInfo.Title]) {
            stationAvailability[station.AddressInfo.Title] = {
                totalSlots: 5,
                availableSlots: 5
            };
        }

        const bookButton = card.querySelector('.book-button');
        bookButton.addEventListener('click', () => {
            if (stationAvailability[station.AddressInfo.Title].availableSlots > 0) {
                selectedStation = station;
                showBookingForm();
            } else {
                bookButton.textContent = 'All Slots Full';
                bookButton.disabled = true;
            }
        });
    });
    updateDashboard();
}
function showBookingForm() {
    bookingFormContainer.style.display = 'block';
    updateAvailableSlots();
}

function updateAvailableSlots() {
    const availabilityInfo = stationAvailability[selectedStation.AddressInfo.Title];
    const availabilityElement = bookingFormContainer.querySelector('#availability-info');
    if (availabilityElement) {
        availabilityElement.textContent = `Available slots: ${availabilityInfo.availableSlots}/${availabilityInfo.totalSlots}`;
    } else {
        const infoElement = document.createElement('p');
        infoElement.id = 'availability-info';
        infoElement.textContent = `Available slots: ${availabilityInfo.availableSlots}/${availabilityInfo.totalSlots}`;
        bookingForm.insertBefore(infoElement, bookingForm.firstChild);
    }
}

async function submitBooking(event) {
    event.preventDefault();
    const evModel = document.getElementById('ev-model').value;
    const date = document.getElementById('booking-date').value;
    const time = document.getElementById('booking-time').value;

    if (await checkAvailability(selectedStation.AddressInfo.Title, date, time)) {
        await createBooking(selectedStation.AddressInfo.Title, evModel, date, time);
        alert('Booking successful!');
        bookingFormContainer.style.display = 'none';
        updateDashboard();
    } else {
        alert('Sorry, this slot is no longer available. Please choose another time.');
    }
}

async function checkAvailability(stationTitle, date, time) {
    // Simulate a server request
    await new Promise(resolve => setTimeout(resolve, 500));

    const availability = stationAvailability[stationTitle];
    return availability.availableSlots > 0;
}

async function createBooking(stationTitle, evModel, date, time) {
    // Simulate a server request
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update local availability
    stationAvailability[stationTitle].availableSlots--;

    // Create a new booking
    const booking = {
        id: bookings.length + 1,
        stationTitle,
        evModel,
        date,
        time,
        user: getCurrentUser(),
        status: 'active'
    };
    bookings.push(booking);

    updateAvailableSlots();
    scheduleBookingCompletion(booking);
}

function getCurrentUser() {
    // In a real app, you'd get this from your authentication system
    return {
        id: Math.floor(Math.random() * 1000),
        name: `User${Math.floor(Math.random() * 100)}`
    };
}

function scheduleBookingCompletion(booking) {
    // For demonstration purposes, we'll complete the booking after 2 minutes
    setTimeout(() => {
        completeBooking(booking);
    }, 120000); // 2 minutes
}

function completeBooking(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
        booking.status = 'completed';
        stationAvailability[booking.stationTitle].availableSlots++;
        updateAdminDashboard();
        updateDashboard();
    }
}

function showAdminLoginForm() {
    adminLoginForm.style.display = 'block';
    adminPortal.style.display = 'none';
}

function hideAdminLoginForm() {
    adminLoginForm.style.display = 'none';
}

function showAdminPortal() {
    adminPortal.style.display = 'block';
    adminLoginForm.style.display = 'none';
    updateAdminDashboard();
}

function hideAdminPortal() {
    adminPortal.style.display = 'none';
}

function adminLogin(event) {
    event.preventDefault();
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;

    if (username === adminCredentials.username && password === adminCredentials.password) {
        showAdminPortal();
    } else {
        alert('Invalid admin credentials');
    }
}


function updateDashboard() {
    dashboardContainer.innerHTML = '<h2>Booking Dashboard</h2>';
    
    const activeBookings = bookings.filter(booking => booking.status === 'active');
    if (activeBookings.length > 0) {
        const bookingList = document.createElement('ul');
        activeBookings.forEach(booking => {
            const listItem = document.createElement('li');
            listItem.textContent = `${booking.user.name} - ${booking.stationTitle} - ${booking.date} ${booking.time}`;
            bookingList.appendChild(listItem);
        });
        dashboardContainer.appendChild(bookingList);
    } else {
        dashboardContainer.innerHTML += '<p>No active bookings</p>';
    }

    // Display station availability
    const availabilityInfo = document.createElement('div');
    availabilityInfo.innerHTML = '<h3>Station Availability</h3>';
    for (const [station, availability] of Object.entries(stationAvailability)) {
        availabilityInfo.innerHTML += `<p>${station}: ${availability.availableSlots}/${availability.totalSlots} slots available</p>`;
    }
    dashboardContainer.appendChild(availabilityInfo);
}





// async function handleVoiceInput() {
//     try {
//         const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//         recognition.lang = 'en-US';

//         recognition.onresult = async (event) => {
//             const transcript = event.results[0][0].transcript;
//             locationInput.value = transcript;

//             // Process the voice input through Voiceflow
//             const response = await voiceflowRuntime.interact({ type: 'text', payload: transcript });
            
//             // Handle Voiceflow response
//             if (response.length > 0) {
//                 const lastResponse = response[response.length - 1];
//                 if (lastResponse.type === 'speak') {
//                     // Voiceflow has a response, use text-to-speech to read it out
//                     const utterance = new SpeechSynthesisUtterance(lastResponse.payload.message);
//                     window.speechSynthesis.speak(utterance);
//                 }
//             }

//             // Trigger the search
//             searchLocation();
//         };

//         recognition.start();
//     } catch (error) {
//         console.error('Error in voice recognition:', error);
//         alert('Voice recognition is not supported in this browser.');
//     }
// }




function updateAdminDashboard() {
    adminDashboard.innerHTML = '<h2>Admin Dashboard</h2>';
    
    // Station management
    const stationManagement = document.createElement('div');
    stationManagement.innerHTML = '<h3>Station Management</h3>';
    for (const [station, availability] of Object.entries(stationAvailability)) {
        const stationDiv = document.createElement('div');
        stationDiv.innerHTML = `
            <h4>${station}</h4>
            <p>Total Slots: <span id="${station}-total">${availability.totalSlots}</span></p>
            <p>Available Slots: <span id="${station}-available">${availability.availableSlots}</span></p>
            <button onclick="updateSlots('${station}', 1)">+</button>
            <button onclick="updateSlots('${station}', -1)">-</button>
        `;
        stationManagement.appendChild(stationDiv);
    }
    adminDashboard.appendChild(stationManagement);

    // Booking management
    const bookingManagement = document.createElement('div');
    bookingManagement.innerHTML = '<h3>Active Bookings</h3>';
    const activeBookings = bookings.filter(booking => booking.status === 'active');
    if (activeBookings.length > 0) {
        const bookingList = document.createElement('ul');
        activeBookings.forEach(booking => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                ${booking.user.name} - ${booking.stationTitle} - ${booking.date} ${booking.time}
                <button onclick="completeBooking(${booking.id})">Mark as Completed</button>
            `;
            bookingList.appendChild(listItem);
        });
        bookingManagement.appendChild(bookingList);
    } else {
        bookingManagement.innerHTML += '<p>No active bookings</p>';
    }
    adminDashboard.appendChild(bookingManagement);
}

function updateSlots(station, change) {
    const availability = stationAvailability[station];
    availability.totalSlots = Math.max(0, availability.totalSlots + change);
    availability.availableSlots = Math.min(availability.availableSlots, availability.totalSlots);
    updateAdminDashboard();
    updateDashboard();
}
function displayChargingStations(stations) {
    resultsContainer.innerHTML = '';
    stations.forEach(station => {
        const marker = new H.map.Marker({ lat: station.AddressInfo.Latitude, lng: station.AddressInfo.Longitude });
        map.addObject(marker);

        const card = document.createElement('div');
        card.className = 'station-card';
        card.innerHTML = `
            <h3>${station.AddressInfo.Title}</h3>
            <p>Address: ${station.AddressInfo.AddressLine1}</p>
            <p>Charging Speed: ${station.Connections[0]?.PowerKW || 'N/A'} kW</p>
            <p>Available: ${station.StatusType?.IsOperational ? 'Yes' : 'No'}</p>
            <button class="book-button">Book Now</button>
        `;
        resultsContainer.appendChild(card);

        // Initialize availability for this station if not already set
        if (!stationAvailability[station.AddressInfo.Title]) {
            stationAvailability[station.AddressInfo.Title] = {
                totalSlots: 5,
                availableSlots: 5
            };
        }

        const bookButton = card.querySelector('.book-button');
        bookButton.addEventListener('click', () => {
            if (stationAvailability[station.AddressInfo.Title].availableSlots > 0) {
                selectedStation = station;
                showBookingForm();
            } else {
                bookButton.textContent = 'All Slots Full';
                bookButton.disabled = true;
            }
        });
    });
    updateDashboard();
}

document.addEventListener('DOMContentLoaded', () => {

    // initializeVoiceflow();

    // // Add voice search button
    // const voiceSearchButton = document.createElement('button');
    // voiceSearchButton.id = 'voice-search-button';
    // voiceSearchButton.innerHTML = '🎤'; // Microphone emoji
    // voiceSearchButton.addEventListener('click', handleVoiceInput);

    // // Insert voice search button after the search button
    // searchButton.parentNode.insertBefore(voiceSearchButton, searchButton.nextSibling);

    searchButton = document.getElementById('search-button');
    locationInput = document.getElementById('location-input');
    resultsContainer = document.getElementById('results-container');
    bookingFormContainer = document.getElementById('booking-form-container');
    bookingForm = document.getElementById('booking-form');
    dashboardContainer = document.getElementById('dashboard-container');
    adminLoginForm = document.getElementById('admin-login-form');
    adminPortal = document.getElementById('admin-portal');
    adminDashboard = document.getElementById('admin-dashboard');

    // Admin login form event listener
    adminLoginForm.addEventListener('submit', adminLogin);


    initMap();

    searchButton.addEventListener('click', searchLocation);
    locationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchLocation();
        }
    });

    bookingForm.addEventListener('submit', submitBooking);

    document.getElementById('cancel-booking').addEventListener('click', () => {
        bookingFormContainer.style.display = 'none';
    });
      
    document.getElementById('admin-logout').addEventListener('click', () => {
        hideAdminPortal();
        showAdminLoginForm();
    });
    // User authentication status
    const userInfo = document.getElementById('user-info');
    const token = localStorage.getItem('token');

    if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userInfo.textContent = `Welcome, ${payload.username} (${payload.email})`;
    } else {
        userInfo.textContent = 'You are not logged in';
    }

    // Logout functionality
    document.getElementById('logout-button').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin-token');
        window.location.href = 'login.html';
    });
    document.getElementById('show-admin-login').addEventListener('click', showAdminLoginForm);
    // Initialize dashboard
    updateDashboard();
});









// let map;
// let platform;
// let searchService;
// let searchButton;
// let locationInput;
// let resultsContainer;
// let bookingFormContainer;
// let bookingForm;
// let selectedStation;

// // Simulated database for station availability
// const stationAvailability = {};

// function initMap() {
//     platform = new H.service.Platform({
//         apikey: '65jwV26Xcq8I_t3oy-tMgNH3IVK2bm5uA-2uN8S2xxw'
//     });

//     const defaultLayers = platform.createDefaultLayers();

//     map = new H.Map(
//         document.getElementById('map-container'),
//         defaultLayers.vector.normal.map,
//         {
//             zoom: 10,
//             center: { lat: 21.1959, lng: 81.2989 }
//         }
//     );

//     window.addEventListener('resize', () => map.getViewPort().resize());
//     new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
//     H.ui.UI.createDefault(map, defaultLayers);

//     searchService = platform.getSearchService();
// }

// async function searchLocation() {
//     const query = locationInput.value;

//     try {
//         const result = await new Promise((resolve, reject) => {
//             searchService.geocode({ q: query }, resolve, reject);
//         });

//         if (result.items && result.items.length > 0) {
//             const position = result.items[0].position;
//             map.setCenter({ lat: position.lat, lng: position.lng });
//             map.setZoom(14);
//             fetchChargingStations(position.lat, position.lng);
//         } else {
//             alert('Location not found. Please try a different search term.');
//         }
//     } catch (error) {
//         console.error('Error during geocoding:', error);
//         alert('Error searching for location. Please try again.');
//     }
// }

// async function fetchChargingStations(lat, lon) {
//     try {
//         const response = await fetch(`/api/charging-stations?lat=${lat}&lon=${lon}`);
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();
//         displayChargingStations(data);
//     } catch (error) {
//         console.error('Error fetching charging stations:', error);
//         alert('Error fetching charging stations. Please try again later.');
//     }
// }

// function displayChargingStations(stations) {
//     resultsContainer.innerHTML = '';
//     stations.forEach(station => {
//         const marker = new H.map.Marker({ lat: station.AddressInfo.Latitude, lng: station.AddressInfo.Longitude });
//         map.addObject(marker);

//         const card = document.createElement('div');
//         card.className = 'station-card';
//         card.innerHTML = `
//             <h3>${station.AddressInfo.Title}</h3>
//             <p>Address: ${station.AddressInfo.AddressLine1}</p>
//             <p>Charging Speed: ${station.Connections[0]?.PowerKW || 'N/A'} kW</p>
//             <p>Available: ${station.StatusType?.IsOperational ? 'Yes' : 'No'}</p>
//             <button class="book-button">Book</button>
//         `;
//         resultsContainer.appendChild(card);

//         // Initialize availability for this station
//         stationAvailability[station.AddressInfo.Title] = {
//             totalSlots: 5,
//             availableSlots: 5
//         };

//         card.querySelector('.book-button').addEventListener('click', () => {
//             selectedStation = station;
//             showBookingForm();
//         });
//     });
// }

// function showBookingForm() {
//     bookingFormContainer.style.display = 'block';
//     updateAvailableSlots();
// }

// function updateAvailableSlots() {
//     const availabilityInfo = stationAvailability[selectedStation.AddressInfo.Title];
//     const availabilityElement = bookingFormContainer.querySelector('#availability-info');
//     if (availabilityElement) {
//         availabilityElement.textContent = `Available slots: ${availabilityInfo.availableSlots}/${availabilityInfo.totalSlots}`;
//     } else {
//         const infoElement = document.createElement('p');
//         infoElement.id = 'availability-info';
//         infoElement.textContent = `Available slots: ${availabilityInfo.availableSlots}/${availabilityInfo.totalSlots}`;
//         bookingForm.insertBefore(infoElement, bookingForm.firstChild);
//     }
// }

// async function submitBooking(event) {
//     event.preventDefault();
//     const evModel = document.getElementById('ev-model').value;
//     const date = document.getElementById('booking-date').value;
//     const time = document.getElementById('booking-time').value;

//     if (await checkAvailability(selectedStation.AddressInfo.Title, date, time)) {
//         await createBooking(selectedStation.AddressInfo.Title, evModel, date, time);
//         alert('Booking successful!');
//         bookingFormContainer.style.display = 'none';
//     } else {
//         alert('Sorry, this slot is no longer available. Please choose another time.');
//     }
// }

// async function checkAvailability(stationTitle, date, time) {
//     // Simulate a server request
//     await new Promise(resolve => setTimeout(resolve, 500));

//     const availability = stationAvailability[stationTitle];
//     return availability.availableSlots > 0;
// }

// async function createBooking(stationTitle, evModel, date, time) {
//     // Simulate a server request
//     await new Promise(resolve => setTimeout(resolve, 500));

//     // Update local availability
//     stationAvailability[stationTitle].availableSlots--;

//     // In a real application, you would send this data to your server
//     console.log('Booking created:', { stationTitle, evModel, date, time });

//     updateAvailableSlots();
// }

// document.addEventListener('DOMContentLoaded', () => {
//     searchButton = document.getElementById('search-button');
//     locationInput = document.getElementById('location-input');
//     resultsContainer = document.getElementById('results-container');
//     bookingFormContainer = document.getElementById('booking-form-container');
//     bookingForm = document.getElementById('booking-form');

//     initMap();

//     searchButton.addEventListener('click', searchLocation);
//     locationInput.addEventListener('keypress', (e) => {
//         if (e.key === 'Enter') {
//             searchLocation();
//         }
//     });

//     bookingForm.addEventListener('submit', submitBooking);

//     document.getElementById('cancel-booking').addEventListener('click', () => {
//         bookingFormContainer.style.display = 'none';
//     });

//     // User authentication status
//     const userInfo = document.getElementById('user-info');
//     const token = localStorage.getItem('token');

//     if (token) {
//         const payload = JSON.parse(atob(token.split('.')[1]));
//         userInfo.textContent = `Welcome, ${payload.username} (${payload.email})`;
//     } else {
//         userInfo.textContent = 'You are not logged in';
//     }

//     // Logout functionality
//     document.getElementById('logout-button').addEventListener('click', () => {
//         localStorage.removeItem('token');
//         localStorage.removeItem('admin-token');
//         window.location.href = 'login.html';
//     });
// });