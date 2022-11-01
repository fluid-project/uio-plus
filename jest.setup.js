// Add chrome object to global scope
Object.assign(global, require("jest-chrome"));

global.chrome.scripting = {
    executeScript: jest.fn()
};
