let isRunning = false;
let deleteCount = 0;
let delay = 3000;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'start') {
        if (!isRunning) {
            isRunning = true;
            delay = request.delay || 3000;
            // Don't reset deleteCount here if we want to keep it across stops/starts in same session
            // But usually user wants to see session progress.
            // unique session count vs total count.
            processQueue();
        }
    } else if (request.action === 'stop') {
        isRunning = false;
        chrome.runtime.sendMessage({ action: 'updateStatus', status: 'Stopped' });
    }
});

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function processQueue() {
    if (!isRunning) return;

    chrome.runtime.sendMessage({ action: 'updateStatus', status: 'Scanning...' });

    // 1. Find tweets
    // We target data-testid="tweet" which is the standard container
    const articles = document.querySelectorAll('article[data-testid="tweet"]');

    if (articles.length === 0) {
        // No tweets visible.
        // Try scrolling down to load more.
        window.scrollBy(0, 500);
        await wait(2000);

        // Check again
        const moreArticles = document.querySelectorAll('article[data-testid="tweet"]');
        if (moreArticles.length === 0) {
            chrome.runtime.sendMessage({ action: 'updateStatus', status: 'No tweets found. Scrolling...' });
            // Keep trying. 
            setTimeout(processQueue, 3000);
            return;
        }
    }

    // Always process the first one in the list.
    const tweet = articles[0];

    // Scroll it into view nicely
    tweet.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await wait(1000);

    // 2. Find the Caret (Menu button)
    // data-testid="caret" serves as the "More" menu
    const caret = tweet.querySelector('[data-testid="caret"]');

    if (!caret) {
        // If we can't find the menu, we can't delete it. 
        // Could be an ad, or a different type of content.
        // Scroll past it to try the next one.
        window.scrollBy(0, 200);
        await wait(1000);

        // We call processQueue again, hoping the next querySelectorAll picks up the next one as [0] because we scrolled?
        // Actually querySelectorAll gets all in DOM. We need to be careful not to get stuck on index 0 if we can't delete it.
        // But if we scroll it out of view, does it disappear from DOM? Not immediately.
        // X.com uses virtualization, so things out of view might be removed.
        // However, if we fail to delete [0], and it stays at [0], we are stuck.
        // A simple fix: remove it from DOM temporarily (client-side only).
        tweet.remove();
        setTimeout(processQueue, 1000);
        return;
    }

    // 3. Click Caret to open menu
    caret.click();
    await wait(1500); // Wait for menu animation

    // 4. Find the "Delete" or "Undo Repost" action
    // X.com menus use role="menuitem"
    const menuItems = document.querySelectorAll('[role="menuitem"]');
    let deleteBtn = null;
    let actionType = 'delete';

    for (const item of menuItems) {
        const text = item.innerText.toLowerCase();
        // Check for 'delete' (EN) or 'sil' (TR)
        if (text.includes('delete') || text.includes('sil')) {
            deleteBtn = item;
            actionType = 'delete';
            break;
        }
        // Check for 'undo repost' (EN) or 'retweeti geri al' (TR)
        if (text.includes('undo repost') || text.includes('retweeti geri al') || text.includes('undo retweet')) {
            deleteBtn = item;
            actionType = 'unretweet';
            break;
        }
    }

    if (!deleteBtn) {
        // Menu contains no delete option (Not our tweet or Ad).
        // Strategy: Click the caret again to toggle/close the menu safely.
        // This is safer than clicking random coordinates.
        caret.click();

        await wait(500);

        // Remove this tweet from DOM to move to the next one
        tweet.remove();
        chrome.runtime.sendMessage({ action: 'updateStatus', status: 'Skipped non-deletable tweet' });
        setTimeout(processQueue, 500);
        return;
    }

    // 5. Click the Action Button
    deleteBtn.click();
    await wait(1000);

    // 6. Handle Confirmation
    if (actionType === 'delete') {
        const confirmBtn = document.querySelector('[data-testid="confirmationSheetConfirm"]');
        if (confirmBtn) {
            confirmBtn.click();
            await wait(2000); // Wait for API to process and UI to update

            deleteCount++;
            chrome.runtime.sendMessage({ action: 'updateStatus', count: deleteCount, status: `Deleted: ${deleteCount}` });
        } else {
            // Weird state, cancel nicely
            document.body.click();
            tweet.remove(); // Remove to avoid getting stuck
        }
    } else {
        // Unretweet
        // Sometimes valid unretweet asks for confirmation, sometimes not.
        const confirmBtn = document.querySelector('[data-testid="confirmationSheetConfirm"]');
        if (confirmBtn) {
            confirmBtn.click();
            await wait(1500);
        }
        // If no confirmation was needed, it's likely done.

        deleteCount++;
        chrome.runtime.sendMessage({ action: 'updateStatus', count: deleteCount, status: `Removed Repost` });
    }

    // 7. Loop with random delay
    // Add randomness to behave more like a human
    const randomDelay = Math.floor(Math.random() * 1000) + delay;
    setTimeout(processQueue, randomDelay);
}
