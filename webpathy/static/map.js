// Initialize the map and set its view to our chosen geographical coordinates and a zoom level
var mymap = L.map('mapid',{doubleClickZoom: false}).setView([51.505, -0.09], 3);
// Add OpenStreetMap tiles:
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(mymap);

var currentMarker = null;

let currentPage = 1;
const entriesPerPage = 20;
let userData = [];

function addMarker(e) {
    // Get the coordinates of the clicked point
    var coords = e.latlng;

    // If there's already a marker on the map, remove it
    if (currentMarker) {
        mymap.removeLayer(currentMarker);
    }

    // Create a new marker and add it to the map
    currentMarker = L.marker(coords).addTo(mymap);

    // Bind a popup to the marker (optional)
    var popupContent = `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}<br>`;
    popupContent += `<button onclick="sendData(${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)})">Find</button>`;

    currentMarker.bindPopup(popupContent).openPopup();
}

function processStream(response) {
    const reader = response.body.getReader();
    let decoder = new TextDecoder();

    return reader.read().then(function processText({ done, value }) {
        if (done) {
            console.log("Stream complete");
            return;
        }

        let str = decoder.decode(value, { stream: true });
        let users = str.split('\n');

        users.forEach((user) => {
            if (user) {
                let userData = JSON.parse(user);
                updateUserDisplay(userData);  // Update the UI for each user
            }
        });

        return reader.read().then(processText);
    });
}

function sendData(lat, lng) {
    const grid = document.getElementById('userDataGrid');
    grid.innerHTML = "";
    console.log('Sending...')
    fetch('/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')  // Ensure CSRF token is included
        },
        body: JSON.stringify({latitude: lat, longitude: lng})
    })
    .then(response => processStream(response))  // Process the streamed response
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Function to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function updateUserDisplay(item) {
    const grid = document.getElementById('userDataGrid');

    // Create a new div for the user's data
    const userDiv = document.createElement('div');
    userDiv.classList.add('user-data');
    userDiv.style.display = 'flex';
    userDiv.style.alignItems = 'flex-start';  // Align items to the top
    userDiv.style.marginBottom = '20px';  // Space between user entries

    // Create an image element
    const imgDiv = document.createElement('div');
    const img = document.createElement('img');
    img.src = `/static/pimgs/${item.u_id}.jpg`;
    img.alt = 'NO USER IMAGE';
    img.style.width = '160px';
    img.style.height = '160px';
    img.style.objectFit = 'cover';
    img.style.marginRight = '20px';  // Space between image and text
    imgDiv.appendChild(img);

    // Create a div for text data
    const textDiv = document.createElement('div');

    // Check if username exists and create a link if it does
    let usernameDisplay;
    if (item.username) {
        usernameDisplay = `<a href="https://t.me/${item.username}" target="_blank">${item.username}</a>`;
    } else {
        usernameDisplay = 'null';
    }

    textDiv.innerHTML = `
        <p>User ID: ${item.u_id}</p>
        <p>Distance: ${item.dst}</p>
        <p>First Name: ${item.f_name}</p>
        <p>Last Name: ${item.l_name}</p>
        <p>Username: ${usernameDisplay}</p>
        <p>Phone: ${item.phone}</p>
        <p>Account Hash: ${item.a_hash}</p>
        <p>Status: ${item.status}</p>
    `;

    // Append image and text divs to the userDiv
    userDiv.appendChild(imgDiv);
    userDiv.appendChild(textDiv);

    // Append the new div to the grid
    grid.appendChild(userDiv);
}




mymap.on('dblclick', addMarker);