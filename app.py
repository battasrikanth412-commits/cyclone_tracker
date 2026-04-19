import os
from flask import Flask, request, jsonify, render_template
from model import CyclonePredictor

app = Flask(__name__)
# Initialize the prediction model
predictor = CyclonePredictor()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        # Extract features
        base_lat = float(data.get('latitude', 15.0)) # Example default: Bay of Bengal/Arabian Sea
        base_lng = float(data.get('longitude', 75.0))
        wind_speed = float(data.get('wind_speed', 120))
        pressure = float(data.get('pressure', 980))
        temp = float(data.get('temperature', 28))
        humidity = float(data.get('humidity', 90))
        direction = float(data.get('direction', 45)) # Bearing in degrees

        # Predict
        trajectory = predictor.predict_trajectory(
            base_lat, base_lng, wind_speed, pressure, temp, humidity, direction, steps=10
        )
        
        return jsonify({
            "status": "success",
            "initial": {"lat": base_lat, "lng": base_lng},
            "trajectory": trajectory
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
