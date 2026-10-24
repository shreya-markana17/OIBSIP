const temperatureInput = document.getElementById("temperature");
const unitSelect = document.getElementById("unit");
const convertBtn = document.getElementById("convertBtn");

const errorMessage = document.getElementById("errorMessage");

const celsiusResult = document.getElementById("celsiusResult");
const fahrenheitResult = document.getElementById("fahrenheitResult");
const kelvinResult = document.getElementById("kelvinResult");

convertBtn.addEventListener("click", convertTemperature);

function convertTemperature() {
  const value = temperatureInput.value.trim();
  const unit = unitSelect.value;

  errorMessage.textContent = "";

  if (value === "") {
    showError("Please enter a temperature value.");
    resetResults();
    return;
  }

  const temperature = Number(value);

  if (Number.isNaN(temperature)) {
    showError("Please enter a valid numeric temperature.");
    resetResults();
    return;
  }

  let celsius;
  let fahrenheit;
  let kelvin;

  if (unit === "celsius") {
    celsius = temperature;

    if (celsius < -273.15) {
      showError("Temperature cannot be below absolute zero (-273.15°C).");
      resetResults();
      return;
    }

    fahrenheit = (celsius * 9) / 5 + 32;
    kelvin = celsius + 273.15;
  }

  if (unit === "fahrenheit") {
    fahrenheit = temperature;

    if (fahrenheit < -459.67) {
      showError("Temperature cannot be below absolute zero (-459.67°F).");
      resetResults();
      return;
    }

    celsius = ((fahrenheit - 32) * 5) / 9;
    kelvin = celsius + 273.15;
  }

  if (unit === "kelvin") {
    kelvin = temperature;

    if (kelvin < 0) {
      showError("Kelvin temperature cannot be below 0 K.");
      resetResults();
      return;
    }

    celsius = kelvin - 273.15;
    fahrenheit = (celsius * 9) / 5 + 32;
  }

  displayResults(celsius, fahrenheit, kelvin);
}

function displayResults(celsius, fahrenheit, kelvin) {
  celsiusResult.textContent = `${celsius.toFixed(2)} °C`;
  fahrenheitResult.textContent = `${fahrenheit.toFixed(2)} °F`;
  kelvinResult.textContent = `${kelvin.toFixed(2)} K`;
}

function showError(message) {
  errorMessage.textContent = message;
}

function resetResults() {
  celsiusResult.textContent = "-- °C";
  fahrenheitResult.textContent = "-- °F";
  kelvinResult.textContent = "-- K";
}
