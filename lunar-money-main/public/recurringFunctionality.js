// ================= RecurringModals.js =================

// Helpers
function formatDateToMDY(isoDate) {
    if (!isoDate) return "";
    const [y, m, d] = isoDate.split("-");
    return `${m}/${d}/${y}`;
}

// ---------- NEW MODAL ----------

const newRecModalEl = document.getElementById("newRecurringModal");
if (newRecModalEl) {
    newRecModalEl.addEventListener("show.bs.modal", () => {
        const fields = [
            "#new-rec-date",
            "#new-rec-name",
            "#new-rec-category",
            "#new-rec-amount",
            "#new-rec-notify",
            "#new-rec-notify-days",
            "#new-rec-frequency"
        ];
        fields.forEach((sel) => {
            const el = document.querySelector(sel);
            if (!el) return;
            if (el.type === "checkbox") el.checked = false;
            else if (el.tagName === "SELECT") el.selectedIndex = 0;
            else el.value = "";
        });

        // default date to today
        const dateEl = document.querySelector("#new-rec-date");
        if (dateEl) {
            const now = new Date();
            const yyyy = now.getFullYear();
            const mm = String(now.getMonth() + 1).padStart(2, "0");
            const dd = String(now.getDate()).padStart(2, "0");
            dateEl.value = `${yyyy}-${mm}-${dd}`;
        }
    });
}

// ---------- EDIT MODAL ----------

const editRecModalEl = document.getElementById("editRecurringModal");
let editRecModal;
if (editRecModalEl) editRecModal = new bootstrap.Modal(editRecModalEl);

function openEditRecurring(row) {
    if (!row) return;

    const id = row.dataset.recId;
    const name = row.dataset.recName || "";
    const amount = row.dataset.recAmount || "";
    const category = row.dataset.recCategory || "";
    const frequency = row.dataset.recFrequency || "";
    const date = row.dataset.recDate || "";

    // Populate edit modal
    const idEl = document.getElementById("edit-rec-id");
    if (idEl) idEl.value = id;

    const nameEl = document.getElementById("edit-rec-name");
    if (nameEl) nameEl.value = name;

    const amountEl = document.getElementById("edit-rec-amount");
    if (amountEl) amountEl.value = Number(amount).toFixed(2);

    const categoryEl = document.getElementById("edit-rec-category");
    if (categoryEl) categoryEl.value = category;

    const frequencyEl = document.getElementById("edit-rec-frequency");
    if (frequencyEl) frequencyEl.value = frequency;

    const dateEl = document.getElementById("edit-rec-date");
    if (dateEl) dateEl.value = date;

    const notifyEl = document.getElementById("edit-rec-notify");
    if (notifyEl) notifyEl.checked = row.dataset.recNotify === "true";

    const notifyDaysEl = document.getElementById("edit-rec-notify-days");
    if (notifyDaysEl) notifyDaysEl.value = row.dataset.recNotifyDays || 0;

    // set form actions
    const editForm = document.getElementById("editRecurringForm");
    if (editForm) editForm.action = `/recurring/${id}?_method=PUT`;

    const deleteForm = document.getElementById("deleteRecurringForm");
    if (deleteForm) {
        deleteForm.action = `/recurring/${id}?_method=DELETE`;
        console.log("deleteForm " + deleteForm);
    } else {
        console.log("deleteForm :<");
    }

    if (editRecModal) editRecModal.show();
}

// ---------- Row click handlers ----------

document.querySelectorAll(".entry-row").forEach((row) => {
    row.addEventListener("click", () => openEditRecurring(row));
});

// ---------- Amount Toggle ----------

function setupToggle(btnId, inputId) {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    if (!btn || !input) return;

    function updateType() {
        const val = parseFloat(input.value) || 0;
        if (val < 0) {
            btn.textContent = "Expense";
            btn.classList.remove("btn-outline-success");
            btn.classList.add("btn-outline-danger");
        } else {
            btn.textContent = "Income";
            btn.classList.remove("btn-outline-danger");
            btn.classList.add("btn-outline-success");
        }
    }

    input.addEventListener("input", updateType);
    btn.addEventListener("click", () => {
        input.value = (-1 * parseFloat(input.value) || 0).toFixed(2);
        updateType();
    });

    updateType();
}

setupToggle("new-rec-amount-type-toggle", "new-rec-amount");
setupToggle("edit-rec-amount-type-toggle", "edit-rec-amount");
