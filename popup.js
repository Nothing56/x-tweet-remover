document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const statusEl = document.getElementById('status');
    const countEl = document.getElementById('count');
    const delayInput = document.getElementById('delay');

    // Load saved state
    chrome.storage.local.get(['isDeleting', 'deleteCount', 'delay'], (data) => {
        if (data.isDeleting) {
            setDeletingState(true);
        }
        if (data.deleteCount) {
            countEl.textContent = `Deleted: ${data.deleteCount}`;
        }
        if (data.delay) {
            delayInput.value = data.delay;
        }
    });

    startBtn.addEventListener('click', () => {
        const delay = parseInt(delayInput.value) || 2000;
        chrome.storage.local.set({ isDeleting: true, delay: delay }, () => {
            setDeletingState(true);
            sendMessageToContent({ action: 'start', delay: delay });
        });
    });

    stopBtn.addEventListener('click', () => {
        chrome.storage.local.set({ isDeleting: false }, () => {
            setDeletingState(false);
            sendMessageToContent({ action: 'stop' });
        });
    });

    function setDeletingState(isDeleting) {
        startBtn.disabled = isDeleting;
        stopBtn.disabled = !isDeleting;
        delayInput.disabled = isDeleting;
        statusEl.textContent = isDeleting ? 'Running...' : 'Stopped';
    }

    function sendMessageToContent(message) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, message);
            }
        });
    }

    // Listen for updates from content script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'updateStatus') {
            if (request.count !== undefined) {
                countEl.textContent = `Deleted: ${request.count}`;
                chrome.storage.local.set({ deleteCount: request.count });
            }
            if (request.status) {
                statusEl.textContent = request.status;
                if (request.status === 'Stopped' || request.status === 'Finished') {
                    setDeletingState(false);
                    chrome.storage.local.set({ isDeleting: false });
                }
            }
        }
    });
});
