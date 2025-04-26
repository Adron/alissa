class MenuBar {
    constructor(container) {
        this.container = container;
        this.menuBar = document.createElement('div');
        this.menuBar.className = 'menu-bar';
        this.container.insertBefore(this.menuBar, this.container.firstChild);
        
        this.createMenuItems();
        this.createHelpDialog();
        
        // Listen for console menu updates
        require('electron').ipcRenderer.on('update-console-menu', (event, isConsoleOpen) => {
            this.updateConsoleMenuItem(isConsoleOpen);
        });
    }
    
    createMenuItems() {
        const menuItems = [
            {
                label: 'App',
                id: 'app-menu',
                items: [
                    { label: 'Settings', action: 'openSettings' },
                    { label: 'Exit', action: 'exitApp' }
                ]
            },
            {
                label: 'File',
                id: 'file-menu',
                items: [
                    { label: 'Tag', action: 'tagFile' },
                    { label: 'Properties', action: 'showProperties' },
                    { label: 'Open', action: 'openFile' }
                ]
            },
            {
                label: 'View',
                id: 'view-menu',
                items: [
                    { label: 'Show Console', action: 'showConsole' }
                ]
            },
            {
                label: 'Operations',
                id: 'operations-menu',
                items: [
                    { label: 'Export', action: 'exportFiles' },
                    { label: 'Group', action: 'groupFiles' },
                    { label: 'Batch', action: 'batchOperation' }
                ]
            },
            {
                label: 'Help',
                id: 'help-menu',
                action: 'showHelp'
            }
        ];
        
        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            menuItem.id = item.id;
            menuItem.textContent = item.label;
            
            if (item.items) {
                const submenu = this.createSubmenu(item.items);
                menuItem.appendChild(submenu);
                submenu.style.display = 'none';
                
                menuItem.addEventListener('mouseenter', () => {
                    submenu.style.display = 'block';
                });
                
                menuItem.addEventListener('mouseleave', () => {
                    submenu.style.display = 'none';
                });
            } else {
                menuItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleMenuAction(item.action);
                });
            }
            
            this.menuBar.appendChild(menuItem);
        });
    }
    
    createSubmenu(items) {
        const submenu = document.createElement('div');
        submenu.className = 'submenu';
        
        items.forEach(item => {
            const submenuItem = document.createElement('div');
            submenuItem.className = 'submenu-item';
            submenuItem.textContent = item.label;
            
            submenuItem.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleMenuAction(item.action);
            });
            
            submenu.appendChild(submenuItem);
        });
        
        return submenu;
    }
    
    createHelpDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'modal';
        dialog.id = 'help-dialog';
        dialog.style.display = 'none';
        
        const content = document.createElement('div');
        content.className = 'modal-content';
        
        const header = document.createElement('h2');
        header.textContent = 'Help';
        
        const message = document.createElement('p');
        message.textContent = 'Coming soon!';
        
        content.appendChild(header);
        content.appendChild(message);
        dialog.appendChild(content);
        
        document.body.appendChild(dialog);
    }
    
    handleMenuAction(action) {
        switch (action) {
            case 'exitApp':
                require('electron').ipcRenderer.send('exit-app');
                break;
            case 'openSettings':
                require('electron').ipcRenderer.send('open-modal');
                break;
            case 'showConsole':
                require('electron').ipcRenderer.send('show-console');
                break;
            case 'showHelp':
                const helpDialog = document.getElementById('help-dialog');
                helpDialog.style.display = 'block';
                helpDialog.addEventListener('click', (e) => {
                    if (e.target === helpDialog) {
                        helpDialog.style.display = 'none';
                    }
                });
                break;
            default:
                console.log(`Action not implemented: ${action}`);
        }
    }
    
    updateConsoleMenuItem(isConsoleOpen) {
        const viewMenu = document.getElementById('view-menu');
        if (viewMenu) {
            const submenu = viewMenu.querySelector('.submenu');
            if (submenu) {
                const consoleItem = submenu.querySelector('.submenu-item');
                if (consoleItem) {
                    consoleItem.textContent = isConsoleOpen ? 'Close Console' : 'Show Console';
                }
            }
        }
    }
}

// Initialize menu bar when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const container = document.body;
    new MenuBar(container);
}); 