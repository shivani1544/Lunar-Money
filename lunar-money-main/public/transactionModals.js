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

    // New Entry modal: clear fields when opened
    const newEntryModalEl = document.getElementById("newEntryModal");
    if (newEntryModalEl) {
        newEntryModalEl.addEventListener("show.bs.modal", () => {
            const fields = ["#new-date", "#new-name", "#new-tags", "#new-amount"];
            fields.forEach((s) => {
                const el = document.querySelector(s);
                if (el) el.value = "";
            });
            // default date to today
            const dateEl = document.querySelector("#new-date");
            if (dateEl) {
                dateEl.value = getCurrentDate();
            }
        });
    }

    // Edit modal logic
    const editModalEl = document.getElementById("editEntryModal");
    let editModal;
    if (editModalEl) editModal = new bootstrap.Modal(editModalEl);

    function openEditModalFromRow(row) {
        const id = row.dataset.entryId;
        const name = row.dataset.entryName || "";
        const amount = row.dataset.entryAmount || "";
        const date = row.dataset.entryDate || "";
        const tags = row.dataset.entryTags || "";

        // populate fields
        const idEl = document.getElementById("edit-entry-id");
        if (idEl) idEl.value = id;

        const nameEl = document.getElementById("edit-name");
        if (nameEl) nameEl.value = name;

        const amountEl = document.getElementById("edit-amount");
        if (amountEl) amountEl.value = Number(amount).toFixed(2);
        updateAmountType();

        const dateEl = document.getElementById("edit-date");
        if (dateEl) dateEl.value = date;

        const tagsEl = document.getElementById("edit-tags");
        if (tagsEl) tagsEl.value = tags;

        // set the edit form's action for PUT (this uses method-override)
        const editForm = document.getElementById("editEntryForm");
        if (editForm) {
            editForm.action = `/transactions/${id}?_method=PUT`;
        }

        // set the delete form action
        const deleteForm = document.getElementById("deleteEntryForm");
        if (deleteForm) {
            deleteForm.action = `/transactions/${id}?_method=DELETE`;
        }

        // show modal
        if (editModal) editModal.show();
    }

    // Attach click listeners to rows
    const table = document.querySelector(".table");
    if (table) {
        table.addEventListener("click", (ev) => {
            // find the row clicked (closest tr with data-entry-id)
            const row = ev.target.closest("tr.entry-row");
            if (!row) return;
            openEditModalFromRow(row);
        });
    }

    // ------- income/expense toggle button section --------
    const newAmountInput = document.getElementById("new-amount");
    const editAmountInput = document.getElementById("edit-amount");
    const newToggleBtn = document.getElementById("new-amount-type-toggle");
    const editToggleBtn = document.getElementById("edit-amount-type-toggle");

    function updateAmountType() {
        let newValue = parseFloat(newAmountInput.value);
        let editValue = parseFloat(editAmountInput.value);

        if (newValue < 0) {
            newToggleBtn.textContent = "Expense";
            newToggleBtn.classList.remove("btn-outline-success");
            newToggleBtn.classList.add("btn-outline-danger");
        } else {
            newToggleBtn.textContent = "Income";
            newToggleBtn.classList.remove("btn-outline-danger");
            newToggleBtn.classList.add("btn-outline-success");
        }

        if (editValue < 0) {
            editToggleBtn.textContent = "Expense";
            editToggleBtn.classList.remove("btn-outline-success");
            editToggleBtn.classList.add("btn-outline-danger");
        } else {
            editToggleBtn.textContent = "Income";
            editToggleBtn.classList.remove("btn-outline-danger");
            editToggleBtn.classList.add("btn-outline-success");
        }
    }

    if (newAmountInput) {
        newAmountInput.addEventListener("input", updateAmountType);
    }
    if (editAmountInput) {
        editAmountInput.addEventListener("input", updateAmountType);
    }

    // Toggle button: flips sign of value
    if (newToggleBtn) {
        newToggleBtn.addEventListener("click", () => {
            let value = -1 * parseFloat(newAmountInput.value) || 0;
            newAmountInput.value = Number(value).toFixed(2);
            updateAmountType();
        });
    }

    // Toggle button: flips sign of value
    if (editToggleBtn) {
        editToggleBtn.addEventListener("click", () => {
            let value = -1 * parseFloat(editAmountInput.value) || 0;
            editAmountInput.value = Number(value).toFixed(2);
            updateAmountType();
        });
    }

    updateAmountType();
});
