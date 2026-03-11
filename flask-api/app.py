import os
import numpy as np
import cloudpickle
from flask import Flask, request, jsonify
from flask_cors import CORS  # NEW: Required for cross-service communication

app = Flask(__name__)
CORS(app)  # NEW: This allows your Node.js backend to talk to this API

# 1. FIX: Use absolute paths so Render/Gunicorn can find your files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def load_file(filename):
    path = os.path.join(BASE_DIR, filename)
    with open(path, "rb") as f:
        return cloudpickle.load(f)

# Load files using the safe path helper
model = load_file("crop_yield_model.cpkl")
area_encoder = load_file("area_encoder.pkl")
crop_encoder = load_file("crop_encoder.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        if data is None:
            return jsonify({"error": "Invalid JSON format"}), 400

        # Encode categorical values
        area = area_encoder.transform([data["area"]])[0]
        crop = crop_encoder.transform([data["crop"]])[0]

        # Extract features (Matching the keys sent by your Node.js server)
        year = data["Year"]
        rainfall = data["rainfall"]
        pesticide = data["pesticide"]
        temperature = data["temperature"]

        features = np.array([[area, crop, year, rainfall, pesticide, temperature]])

        # Prediction
        prediction = model.predict(features)

        return jsonify({
            "predicted_yield": float(prediction[0])
        })

    except KeyError as e:
        return jsonify({"error": f"Missing field: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # 2. FIX: Use 0.0.0.0 and dynamic PORT for Cloud deployment
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)