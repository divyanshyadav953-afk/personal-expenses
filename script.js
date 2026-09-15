const STORAGE_KEY = "daily-spending-tracker-expenses";
const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

const expenseForm = document.querySelector("#expense-form");
const expenseNameInput = document.querySelector("#expense-name");
const expenseAmountInput = document.querySelector("#expense-amount");
const formMessage = document.querySelector("#form-message");
const expenseList = document.querySelector("#expense-list");
const emptyState = document.querySelector("#empty-state");
const totalAmount = document.querySelector("#total-amount");
const expenseCount = document.querySelector("#expense-count");

let expenses = loadExpenses();

function loadExpenses() {
  try {
    const savedExpenses = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!Array.isArray(savedExpenses)) {
      return [];
    }

    return savedExpenses.filter((expense) => (
      expense
      && typeof expense.id === "string"
      && typeof expense.name === "string"
      && Number.isFinite(Number(expense.amount))
      && Number(expense.amount) > 0
    ));
  } catch (error) {
    return [];
  }
}

function saveExpenses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function formatCurrency(amount) {
  return currencyFormatter.format(amount);
}

function showMessage(message = "") {
  formMessage.textContent = message;
}

function renderExpenses() {
  expenseList.replaceChildren();
  emptyState.hidden = expenses.length > 0;
  expenseCount.textContent = `${expenses.length} ${expenses.length === 1 ? "item" : "items"}`;

  expenses.forEach((expense) => {
    const listItem = document.createElement("li");
    listItem.className = "expense-item";

    const details = document.createElement("div");
    details.className = "expense-details";

    const name = document.createElement("p");
    name.className = "expense-name";
    name.textContent = expense.name;

    const amount = document.createElement("p");
    amount.className = "expense-amount";
    amount.textContent = formatCurrency(expense.amount);

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.dataset.expenseId = expense.id;
    deleteButton.setAttribute("aria-label", `Remove ${expense.name}`);
    deleteButton.textContent = "Remove";

    details.append(name, amount);
    listItem.append(details, deleteButton);
    expenseList.append(listItem);
  });

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  totalAmount.textContent = formatCurrency(total);
}

function addExpense(event) {
  event.preventDefault();

  const name = expenseNameInput.value.trim();
  const amount = Number(expenseAmountInput.value);

  if (!name) {
    showMessage("Please enter an expense name.");
    expenseNameInput.focus();
    return;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    showMessage("Please enter an amount greater than ₹0.00.");
    expenseAmountInput.focus();
    return;
  }

  expenses.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    name,
    amount: Math.round(amount * 100) / 100,
  });

  saveExpenses();
  renderExpenses();
  expenseForm.reset();
  showMessage("");
  expenseNameInput.focus();
}

function removeExpense(expenseId) {
  expenses = expenses.filter((expense) => expense.id !== expenseId);
  saveExpenses();
  renderExpenses();
}

expenseForm.addEventListener("submit", addExpense);
expenseList.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-expense-id]");

  if (deleteButton) {
    removeExpense(deleteButton.dataset.expenseId);
  }
});

renderExpenses();
