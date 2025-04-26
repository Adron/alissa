const { ipcRenderer } = require('electron');

const consoleElement = document.getElementById('console');

// Function to add a log entry
function addLogEntry(type, message, data = null) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    
    const timestamp = new Date().toISOString();
    const timestampSpan = document.createElement('span');
    timestampSpan.className = 'timestamp';
    timestampSpan.textContent = timestamp;
    
    const typeSpan = document.createElement('span');
    typeSpan.className = 'event-type';
    typeSpan.textContent = type;
    
    const messageSpan = document.createElement('span');
    messageSpan.className = type.toLowerCase();
    messageSpan.textContent = message;
    
    entry.appendChild(timestampSpan);
    entry.appendChild(typeSpan);
    entry.appendChild(messageSpan);
    
    if (data) {
        const dataPre = document.createElement('pre');
        dataPre.className = 'info';
        dataPre.textContent = JSON.stringify(data, null, 2);
        entry.appendChild(dataPre);
    }
    
    consoleElement.appendChild(entry);
    consoleElement.scrollTop = consoleElement.scrollHeight;
}

// Listen for events from the main window
ipcRenderer.on('monitor-event', (event, { type, message, data }) => {
    addLogEntry(type, message, data);
});

// Initial message
addLogEntry('INFO', 'Monitor window initialized'); 