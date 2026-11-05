const Recurring = require("./models/recurring");
const Entry = require("./models/entry");
const Notification = require("./models/notification");

// Helper to format Date object as YYYY-MM-DD string
function formatDateString(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

async function processRecurringForUser(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let notificationsCreated = 0;
    let entriesCreated = 0;

    const recurringRules = await Recurring.find({});

    for (const rec of recurringRules) {
        const nextDate = new Date(rec.nextDate);
        nextDate.setHours(0, 0, 0, 0);

        // --- Handle notifications ---
        if (rec.notify && !rec.alerted) {
            const notifyDate = new Date(nextDate);
            notifyDate.setDate(notifyDate.getDate() - rec.notifyDaysBefore);

            if (notifyDate <= today) {
                await Notification.create({
                    user: rec.user,
                    title: `Upcoming transaction: ${rec.name}`,
                    message: `${rec.name} of ${rec.amount.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD"
                    })} will apply on ${formatDateString(nextDate)}`,
                    read: false
                });

                rec.alerted = true;
                await rec.save();

                notificationsCreated++;
            }
        }

        // --- Handle automatic entry creation ---
        if (nextDate <= today) {
            await Entry.create({
                user: rec.user,
                name: rec.name,
                amount: rec.amount,
                tags: rec.tag ? rec.tag.split(",").map((t) => t.trim()) : [],
                date: formatDateString(nextDate)
            });

            entriesCreated++;

            // Advance nextDate according to frequency
            switch (rec.frequency) {
                case "daily":
                    nextDate.setDate(nextDate.getDate() + 1);
                    break;
                case "weekly":
                    nextDate.setDate(nextDate.getDate() + 7);
                    break;
                case "monthly":
                    nextDate.setMonth(nextDate.getMonth() + 1);
                    break;
                case "yearly":
                    nextDate.setFullYear(nextDate.getFullYear() + 1);
                    break;
            }

            rec.nextDate = nextDate;
            rec.alerted = false; // reset alert for next cycle
            await rec.save();
        }
    }

    return { notificationsCreated, entriesCreated };
}

module.exports = { processRecurringForUser };
