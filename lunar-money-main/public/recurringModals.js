document.addEventListener("DOMContentLoaded", () => {
    // Utility to get attr safely
    const $ = (sel) => document.querySelector(sel);

    function getCurrentDate() {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    }

    function formatDate(date) {
        if (!date) return "";
        const d = new Date(date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${mm}/${dd}/${yyyy}`;
    }

    function formatForDateInput(date) {
        if (!date) return "";
        const d = new Date(date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    }
    // ---------- New Recurring Modal ----------
    const newRecModalEl = $("#newRecurringModal");
    if (newRecModalEl) {
        newRecModalEl.addEventListener("show.bs.modal", () => {
            const fields = [
                "#new-rec-date",
                "#new-rec-name",
                "#new-rec-category",
                "#new-rec-frequency",
                "#new-rec-notify",
                "#new-rec-notify-days",
                "#edit-rec-id"
            ];
            fields.forEach((s) => {
                const el = $(s);
                if (!el) return;
                if (el.type === "checkbox") el.checked = false;
                else if (el.tagName === "SELECT") el.selectedIndex = 0;
                else el.value = "";
            });

            const amountEl = $("#new-rec-amount");
            if (amountEl) amountEl.value = Number(0).toFixed(2);

            console.log("asdfasdfasdfasdfasdf");
            const dateEl = $("#new-rec-date");
            if (dateEl) dateEl.value = getCurrentDate();

            // reset form action to POST
            const form = $("#recurringForm");
            if (form) form.action = "/recurring";
        });
    }

    // ---------- Edit Recurring ----------
    const recurringRows = document.querySelectorAll(".recurring-row");
    const editModal = new bootstrap.Modal(document.getElementById("editRecurringModal"));

    recurringRows.forEach((row) => {
        row.addEventListener("click", () => {
            const id = row.dataset.id;
            const name = row.dataset.name;
            const amount = row.dataset.amount;
            const nextDate = row.dataset.date;
            const tag = row.dataset.tag;
            const frequency = row.dataset.frequency;

            // Populate EDIT modal fields (correct IDs)
            document.getElementById("edit-recurring-id").value = id; // hidden input
            document.getElementById("edit-rec-name").value = name;
            document.getElementById("edit-rec-amount").value = Number(amount).toFixed(2);
            document.getElementById("edit-rec-date").value = formatForDateInput(nextDate);
            document.getElementById("edit-rec-category").value = tag;
            document.getElementById("edit-rec-frequency").value = frequency;

            // Update form action for PUT
            const form = document.getElementById("editRecurringForm");
            form.action = `/recurring/${id}?_method=PUT`;

            // Update delete form action
            const delForm = document.getElementById("deleteRecurringForm");
            delForm.action = `/recurring/${id}?_method=DELETE`;

            // Show modal
            editModal.show();
        });
    });

    // ---------- Toggle button logic ----------
    const newAmountInput = $("#new-rec-amount");
    const editAmountInput = $("#edit-rec-amount");
    const newToggleBtn = $("#new-rec-amount-type-toggle");
    const editToggleBtn = $("#edit-rec-amount-type-toggle");

    function updateAmountType() {
        const newVal = parseFloat(newAmountInput.value) || 0;
        if (newVal < 0) {
            newToggleBtn.textContent = "Expense";
            newToggleBtn.classList.remove("btn-outline-success");
            newToggleBtn.classList.add("btn-outline-danger");
        } else {
            newToggleBtn.textContent = "Income";
            newToggleBtn.classList.remove("btn-outline-danger");
            newToggleBtn.classList.add("btn-outline-success");
        }

        const editVal = parseFloat(editAmountInput.value) || 0;
        if (editVal < 0) {
            editToggleBtn.textContent = "Expense";
            editToggleBtn.classList.remove("btn-outline-success");
            editToggleBtn.classList.add("btn-outline-danger");
        } else {
            editToggleBtn.textContent = "Income";
            editToggleBtn.classList.remove("btn-outline-danger");
            editToggleBtn.classList.add("btn-outline-success");
        }
    }

    if (newAmountInput) newAmountInput.addEventListener("input", updateAmountType);
    if (editAmountInput) editAmountInput.addEventListener("input", updateAmountType);

    if (newToggleBtn) {
        newToggleBtn.addEventListener("click", () => {
            const val = -1 * (parseFloat(newAmountInput.value) || 0);
            newAmountInput.value = Number(val).toFixed(2);
            updateAmountType();
        });
    }
    if (editToggleBtn) {
        editToggleBtn.addEventListener("click", () => {
            const val = -1 * (parseFloat(editAmountInput.value) || 0);
            editAmountInput.value = Number(val).toFixed(2);
            updateAmountType();
        });
    }

    updateAmountType();
});
