const currentDisplay = document.getElementById("currentDisplay");
const previousDisplay = document.getElementById("previousDisplay");
const errorMessage = document.getElementById("errorMessage");

const numberButtons = document.querySelectorAll(".number");
const operatorButtons = document.querySelectorAll(".operator");
const actionButtons = document.querySelectorAll(".action-btn");
const equalsButton = document.querySelector(".equals");

let currentValue = "";
let expression = "";

numberButtons.forEach((button) => {
    button.addEventListener("click", () => {
        enterNumber(button.dataset.number);
    });
});

operatorButtons.forEach((button) => {
    button.addEventListener("click", () => {
        chooseOperator(button.dataset.operator);
    });
});

actionButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const action = button.dataset.action;

        if (action === "clear") {
            clearCalculator();
        }

        if (action === "delete") {
            deleteLastCharacter();
        }
    });
});

equalsButton.addEventListener("click", calculateResult);

function enterNumber(number) {
    clearError();

    if (number === "." && currentValue.includes(".")) {
        return;
    }

    if (currentValue === "" && number === ".") {
        currentValue = "0.";
    } else {
        currentValue += number;
    }

    updateDisplay();
}

function chooseOperator(selectedOperator) {
    clearError();

    if (currentValue === "" && expression === "") {
        return;
    }

    if (currentValue !== "") {
        expression += currentValue;
        currentValue = "";
    }

    if (expression !== "" && !expression.endsWith(" ")) {
        expression += ` ${selectedOperator} `;
    } else if (expression.endsWith(" ")) {
        expression = expression.slice(0, -3);
        expression += ` ${selectedOperator} `;
    }

    previousDisplay.textContent = expression;
    currentDisplay.textContent = "0";
}

function calculateResult() {
    clearError();

    if (currentValue !== "") {
        expression += currentValue;
    }

    if (expression.trim() === "") {
        return;
    }

    const parts = expression.trim().split(" ");

    let numbers = [];
    let operators = [];

    for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
            numbers.push(parseFloat(parts[i]));
        } else {
            operators.push(parts[i]);
        }
    }

    if (numbers.some((number) => Number.isNaN(number))) {
        showError("Invalid calculation.");
        return;
    }

    for (let i = 0; i < operators.length; i++) {
        if (operators[i] === "×" || operators[i] === "÷") {
            if (operators[i] === "÷" && numbers[i + 1] === 0) {
                showError("Cannot divide by zero.");
                clearCalculation();
                return;
            }

            let result;

            if (operators[i] === "×") {
                result = numbers[i] * numbers[i + 1];
            } else {
                result = numbers[i] / numbers[i + 1];
            }

            numbers.splice(i, 2, result);
            operators.splice(i, 1);

            i--;
        }
    }

    let result = numbers[0];

    for (let i = 0; i < operators.length; i++) {
        if (operators[i] === "+") {
            result += numbers[i + 1];
        }

        if (operators[i] === "−") {
            result -= numbers[i + 1];
        }
    }

    result = formatResult(result);

    previousDisplay.textContent = `${expression} =`;
    currentValue = result.toString();
    expression = "";
    currentDisplay.textContent = currentValue;
}

function deleteLastCharacter() {
    clearError();

    if (currentValue !== "") {
        currentValue = currentValue.slice(0, -1);
        updateDisplay();
        return;
    }

    if (expression !== "") {
        const parts = expression.trim().split(" ");

        if (parts.length > 0) {
            const lastPart = parts[parts.length - 1];

            if (!isNaN(lastPart)) {
                currentValue = lastPart.slice(0, -1);

                parts.pop();
                expression = parts.join(" ");

                updateDisplay();
            }
        }
    }
}

function clearCalculator() {
    currentValue = "";
    expression = "";

    clearError();

    previousDisplay.textContent = "";
    currentDisplay.textContent = "0";
}

function clearCalculation() {
    currentValue = "";
    expression = "";

    previousDisplay.textContent = "";
    currentDisplay.textContent = "0";
}

function updateDisplay() {
    currentDisplay.textContent = currentValue || "0";

    if (expression) {
        previousDisplay.textContent = expression;
    } else {
        previousDisplay.textContent = "";
    }
}

function showError(message) {
    errorMessage.textContent = message;
}

function clearError() {
    errorMessage.textContent = "";
}

function formatResult(number) {
    if (!Number.isFinite(number)) {
        return "Error";
    }

    return Number(number.toFixed(10));
}