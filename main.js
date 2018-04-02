
const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;
let addWindow;

// Listen for the app is ready

app.on('ready', function() {
    // create window
    mainWindow = new BrowserWindow({});  // no configure to the window....that's why is the empty object {}
    // Load  html into the window
    mainWindow.loadURL( url.format({
        pathname: path.join( __dirname, 'mainWindow.html' ),
        protocol: 'file:',
        slashes: true
    }) );  // ez igazából, mint.... file://dirname/mainWindow.html 
    // Quit app when closed
    mainWindow.on('closed', () => {
        app.quit();
    })

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate( mainMenuTemplate );
    // Insert the menu
    Menu.setApplicationMenu( mainMenu );
});

// Handle create addWindow
function createAddWindow(){
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Shoping List Item'
    });
    // Load  html into the window
    addWindow.loadURL( url.format({
        pathname: path.join( __dirname, 'addWindow.html' ),
        protocol: 'file:',
        slashes: true
    }) );
    // Garbage collection handle
    addWindow.on('close', () => {
        addWindow = null;
    });
}

// Catch item add
ipcMain.on('item:add', (event, item)=> {
    console.log(item);
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

// Create mainMenuTemplate
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clead Item',
                click(){
                    mainWindow.webContents.send('item:clear');
                }

            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

// IF MAC add empty object to the menu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

// Add DEV Tool item if not prod
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label:'Developer Tools',
        submenu: [
            {
                label: 'Toggle BevTool',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',                
                click( item, focusedWindow ){
                    focusedWindow.toggleDevTools();      
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}