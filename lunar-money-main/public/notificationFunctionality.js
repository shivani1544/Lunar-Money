async function createNotification(userId, title, message) {
    await Notification.create({
        userId,
        title,
        message,
        createdAt: new Date(),
        read: false
    });
}

// make sure the DOM is loaded first
document.addEventListener("DOMContentLoaded", async () => {
    await renderNotifications();
});

// GET /api/notifications
async function loadNotifications() {
    try {
        const response = await fetch("/api/notifications");
        if (!response.ok) throw new Error("Failed to fetch notifications");
        const notifications = await response.json();
        return notifications;
    } catch (e) {
        console.error(e);
        return [];
    }
}

// GET /api/notifications/unread-count
async function loadUnreadCount() {
    try {
        const response = await fetch("/api/notifications/unread-count");
        if (!response.ok) throw new Error("Failed to fetch unread count");
        const data = await response.json();
        return data.count; // number
    } catch (e) {
        console.error(e);
        return 0;
    }
}

// PUT /api/notifications/:id/read
async function markAsRead(notificationId) {
    try {
        const response = await fetch(`/api/notifications/${notificationId}/read`, {
            method: "PUT"
        });
        if (!response.ok) throw new Error("Failed to mark notification as read");
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

// PUT /api/notifications/mark-all-read
async function markAllAsRead() {
    try {
        const response = await fetch("/api/notifications/mark-all-read", { method: "PUT" });
        if (!response.ok) throw new Error("Failed to mark all as read");
        renderNotifications(); // 🔥 refresh badge + list
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

async function renderNotifications() {
    const container = document.getElementById("notificationsContainer");

    // Clear old notifications but keep the header
    const existingHeader = container.innerHTML;
    container.innerHTML = existingHeader.split("</li>")[0] + "</li><li><hr class='dropdown-divider'></li>";

    const notifications = await loadNotifications();
    const unreadCount = await loadUnreadCount();

    const badge = document.getElementById("notificationBadge");
    if (badge) badge.textContent = unreadCount > 99 ? "99+" : unreadCount;
    badge.style.display = unreadCount > 0 ? "inline-block" : "none";

    notifications.forEach((n, index) => {
        const li = document.createElement("li");
        li.className = `notification-item p-2 ${n.read ? "" : "unread"}`;
        li.style.cursor = "pointer";

        // Main message
        const messageDiv = document.createElement("div");
        messageDiv.innerHTML = `<strong>${n.title}</strong>: ${n.message}`;
        li.appendChild(messageDiv);

        // Timestamp
        const dateDiv = document.createElement("div");
        dateDiv.className = "text-muted small text-end";
        const createdDate = new Date(n.createdAt);
        dateDiv.textContent = createdDate.toLocaleString();
        li.appendChild(dateDiv);

        // Prevent dropdown from closing
        li.addEventListener("click", async (event) => {
            event.stopPropagation();
            if (!n.read) {
                await markAsRead(n._id);
                li.classList.remove("unread");
            }
            renderNotifications();
        });

        container.appendChild(li);

        // Separator
        if (index < notifications.length - 1) {
            const hrLi = document.createElement("li");
            hrLi.innerHTML = `<hr class="dropdown-divider">`;
            container.appendChild(hrLi);
        }
    });
}
