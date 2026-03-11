from flask import Flask, request, jsonify
import numpy as np
import cloudpickle

app = Flask(__name__)

# Load trained model
with open("crop_yield_model.cpkl", "rb") as f:
    model = cloudpickle.load(f)

# Load encoders
with open("area_encoder.pkl", "rb") as f:
    area_encoder = cloudpickle.load(f)

with open("crop_encoder.pkl", "rb") as f:
    crop_encoder = cloudpickle.load(f)

print(crop_encoder.classes_)

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        if data is None:
            return jsonify({"error": "Invalid JSON format"}), 400

        # Encode categorical values
        area = area_encoder.transform([data["area"]])[0]
        crop = crop_encoder.transform([data["crop"]])[0]

        year = data["Year"]
        rainfall = data["rainfall"]
        pesticide = data["pesticide"]
        temperature = data["temperature"]

        # Create feature array
        features = np.array([[area, crop, year, rainfall, pesticide, temperature]])

        # Prediction
        prediction = model.predict(features)

        return jsonify({
            "predicted_yield": float(prediction[0])
        })

    except KeyError as e:
        return jsonify({
            "error": f"Missing field: {str(e)}"
        }), 400

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)