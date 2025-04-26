const { ipcRenderer } = require('electron');

const consoleElement = document.getElementById('console');

// Function to add a log entry to the console
function addLogEntry(type, data) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    
    const timestamp = new Date().toISOString();
    const timestampSpan = document.createElement('span');
    timestampSpan.className = 'timestamp';
    timestampSpan.textContent = `[${timestamp}] `;
    
    const typeSpan = document.createElement('span');
    typeSpan.className = 'event-type';
    typeSpan.textContent = `${type}: `;
    
    const dataSpan = document.createElement('span');
    dataSpan.className = 'event-data';
    dataSpan.textContent = JSON.stringify(data, null, 2);
    
    entry.appendChild(timestampSpan);
    entry.appendChild(typeSpan);
    entry.appendChild(dataSpan);
    
    consoleElement.appendChild(entry);
    consoleElement.scrollTop = consoleElement.scrollHeight;
}

// Listen for events from the main process
ipcRenderer.on('console-event', (event, type, data) => {
    addLogEntry(type, data);
});

// Clear console when requested
ipcRenderer.on('clear-console', () => {
    consoleElement.innerHTML = '';
}); 