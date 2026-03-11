import pickle
import numpy as np

model = pickle.load(open("crop_yield_model.pkl", "rb"))

def predict_yield(area, crop, rainfall, temp, pesticide):
    
    data = np.array([[area, crop, rainfall, temp, pesticide]])

    prediction = model.predict(data)

    yield_tons = prediction[0] / 10000

    return yield_tons