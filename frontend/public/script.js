// Replace this with your actual Render backend URL
const BACKEND_URL = "https://ai-farmer-advisor-1.onrender.com";

async function generateAdvice() {
  const nameEl = document.getElementById("name");
  const cropEl = document.getElementById("crop");
  const soilEl = document.getElementById("soil");
  const weatherEl = document.getElementById("weather");
  const languageEl = document.getElementById("language");

  if (!nameEl || !cropEl || !soilEl || !weatherEl || !languageEl) {
    alert("Some input fields are missing in HTML.");
    return;
  }

  const name = nameEl.value;
  const crop = cropEl.value;
  const soil = soilEl.value;
  const weather = weatherEl.value;
  const language = languageEl.value;

  const button = document.getElementById("adviceBtn");
  if (button) {
    button.disabled = true;
    button.textContent = "Generating Advice...";
  }

  try {
    // FIXED: Using backticks (`) instead of double quotes (") for template literals
    const response = await fetch(`${BACKEND_URL}/advice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ crop, soil, weather, language })
    });

    const data = await response.json();

    localStorage.setItem("farmerName", name);
    localStorage.setItem("advice", data.advice);

    document.getElementById("advice_result").innerText =
      "AI Advice:\n" + data.advice;

  } catch (error) {
    console.error(error);
    alert("Error connecting to AI service");
  }

  if (button) {
    button.disabled = false;
    button.textContent = "Get AI Advice";
  }
}

async function predictYield() {
  const areaEl = document.getElementById("area");
  const cropEl = document.getElementById("crop");
  const yearEl = document.getElementById("year");
  const rainfallEl = document.getElementById("rainfall");
  const pesticideEl = document.getElementById("pesticide");
  const temperatureEl = document.getElementById("temperature");

  if (!areaEl || !cropEl || !yearEl || !rainfallEl || !pesticideEl || !temperatureEl) {
    alert("Some prediction input fields are missing in HTML.");
    return;
  }

  const area = areaEl.value;
  const crop = cropEl.value;
  const year = yearEl.value;
  const rainfall = rainfallEl.value;
  const pesticide = pesticideEl.value;
  const temperature = temperatureEl.value;

  const button = document.getElementById("predictBtn");
  if (button) {
    button.disabled = true;
    button.textContent = "Predicting...";
  }

  try {
    // FIXED: Using backticks (`) for template literals
    const response = await fetch(`${BACKEND_URL}/predict-yield`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        area,
        crop,
        Year: parseInt(year),
        rainfall: parseFloat(rainfall),
        pesticide: parseFloat(pesticide),
        temperature: parseFloat(temperature)
      })
    });

    const data = await response.json();
    const resultBox = document.getElementById("yield_result");

    if (data.predicted_yield) {
      resultBox.innerText =
        "Estimated Crop Yield: " + data.predicted_yield.toFixed(2) + " hg/ha";
    } else {
      resultBox.innerText =
        "Prediction failed: " + (data.error || "Unknown error");
    }

  } catch (error) {
    console.error(error);
    alert("Error connecting to Prediction API");
  }

  if (button) {
    button.disabled = false;
    button.textContent = "Predict Yield";
  }
}