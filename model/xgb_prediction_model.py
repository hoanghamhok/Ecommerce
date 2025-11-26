import pickle
from xgboost import XGBClassifier
from flask import Flask, request, jsonify
import numpy as np

with open("model.pkl", "rb") as file:
    all_data = pickle.load(file)

model = all_data["model"]
gender_encoder = all_data["gender_encoder"]
category_encoder = all_data["category_encoder"]
fav_category_encoder = all_data["fav_category_encoder"]
next_category_encoder = all_data["next_category_encoder"]

app = Flask(__name__)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    features = data["features"]
    gender = gender_encoder.transform([features["gender"]])[0]
    fav_category = fav_category_encoder.transform([features["fav_category"]])[0]
    age = features["age"]
    avg_spend = features["avg_spend"]
    input_features = np.array([[gender, age, fav_category, avg_spend]])
    prediction = model.predict(input_features)
    prediction = next_category_encoder.inverse_transform(prediction)[0]
    return jsonify({"prediction": prediction})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True) 



