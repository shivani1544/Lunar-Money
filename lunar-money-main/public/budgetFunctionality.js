let budgets = [];
let editIndex = null;

const totalBudgetInput = document.getElementById("totalBudget");
const categorySelect = document.getElementById("categoryType");
const alertThresholdInput = document.getElementById("alertThreshold");
const saveButton = document.getElementById("saveBudget");
const categoryContainer = document.getElementById("categoryContainer");

// Load budgets on page load
document.addEventListener("DOMContentLoaded", async () => {
    await loadBudgets();
    await loadTags();
});

// Load budgets from API
async function loadBudgets() {
    try {
        const response = await fetch("/api/budgets");
        if (response.ok) {
            budgets = await response.json();
            renderCategories();
        }
    } catch (e) {
        console.error("Failed to load budgets:", e);
    }
}

// populate list of tags to choose from for category
async function loadTags() {
    try {
        const response = await fetch("/transactions/tags");
        const tags = await response.json();
        const datalist = document.getElementById("existingTags");
        datalist.innerHTML = "";
        tags.forEach((tag) => {
            const option = document.createElement("option");
            option.value = tag;
            datalist.appendChild(option);
        });
    } catch (e) {
        console.error("Failed to load tags:", e);
    }
}

// Save new budget
saveButton.addEventListener("click", async () => {
    const amount = Number(totalBudgetInput.value);
    const threshold = Number(alertThresholdInput.value) || 75;
    const categoryText = categorySelect.value.trim();
    const timeFrame = document.getElementById("budgetPeriod").value === "weekly" ? "Weekly" : "Monthly";

    if (!amount || amount <= 0) {
        alert("Enter a valid budget amount.");
        return;
    }

    try {
        const response = await fetch("/api/budgets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tag: categoryText.toLowerCase(),
                amount,
                timeFrame,
                alertThreshold: threshold,
                startDate: new Date()
            })
        });

        if (response.ok) {
            totalBudgetInput.value = "";
            alertThresholdInput.value = "75";
            await loadBudgets();
        } else {
            alert("Failed to save budget");
        }
    } catch (e) {
        console.error("Error saving budget:", e);
        alert("Failed to save budget");
    }
});

// Render categories
function renderCategories() {
    categoryContainer.innerHTML = "";

    if (budgets.length === 0) {
        categoryContainer.innerHTML =
            '<p class="text-muted">No budgets created yet. Create one above to get started!</p>';
        return;
    }

    budgets.forEach((item, index) => {
        const spent = item.spent || 0;
        const percent = item.amount > 0 ? Math.min((spent / item.amount) * 100, 100) : 0;
        const alertNeeded = percent >= (item.alertThreshold || 75);

        const wrapper = document.createElement("div");
        wrapper.className = "my-3 p-3 border rounded";

        wrapper.innerHTML = `
				<div class="d-flex justify-content-between align-items-center">
					<h6 class="text-capitalize mb-0">${item.tag}</h6>
					<div>
						<button class="btn btn-sm btn-outline-secondary me-1 edit-btn" data-index="${index}">Edit</button>
						<button class="btn btn-sm btn-outline-danger delete-btn" data-id="${item._id}">Delete</button>
					</div>
				</div>
	
				<p class="mt-2 mb-0">
					<strong>Budget: </strong>$${item.amount.toFixed(2)}<br>
					<strong>Spent: </strong>$${spent.toFixed(2)}<br>
					<strong>Remaining: </strong>$${Math.max(0, item.amount - spent).toFixed(2)}<br>
					<strong>Time Frame: </strong>${item.timeFrame}
				</p>
	
				<div class="progress mt-2">
					<div class="progress-bar ${alertNeeded ? "bg-danger" : ""}" 
						role="progressbar"
						style="width:${percent}%;">
						${Math.floor(percent)}%
					</div>
				</div>
	
				${alertNeeded ? `<div class="budget-alert">⚠️ ${item.tag} budget at ${Math.floor(percent)}%!</div>` : ""}
			`;

        categoryContainer.appendChild(wrapper);
    });

    attachEventListeners();
}

// Attach event listeners to buttons
function attachEventListeners() {
    document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            const id = e.target.dataset.id;
            if (confirm("Delete this budget?")) {
                await deleteBudget(id);
            }
        });
    });

    document.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const index = parseInt(e.target.dataset.index);
            openEditModal(index);
        });
    });
}

// Delete budget
async function deleteBudget(id) {
    try {
        const response = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
        if (response.ok) {
            await loadBudgets();
        } else {
            alert("Failed to delete budget");
        }
    } catch (e) {
        console.error("Error deleting budget:", e);
        alert("Failed to delete budget");
    }
}

// Open edit modal
function openEditModal(index) {
    editIndex = index;
    const item = budgets[index];

    document.getElementById("editAmount").value = Number(item.amount).toFixed(2);
    document.getElementById("editSpent").value = item.spent || 0;
    document.getElementById("editThreshold").value = item.alertThreshold || 75;

    const modal = new bootstrap.Modal(document.getElementById("editModal"));
    modal.show();
}

// Save edits
document.getElementById("saveEditBtn").addEventListener("click", async () => {
    const newAmount = Number(document.getElementById("editAmount").value).toFixed(2);
    const newThreshold = Number(document.getElementById("editThreshold").value);
    const budget = budgets[editIndex];

    try {
        const response = await fetch(`/api/budgets/${budget._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: newAmount,
                alertThreshold: newThreshold
            })
        });

        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
            await loadBudgets();
            await renderNotifications();
        } else {
            alert("Failed to update budget");
        }
    } catch (e) {
        console.error("Error updating budget:", e);
        alert("Failed to update budget");
    }
});
