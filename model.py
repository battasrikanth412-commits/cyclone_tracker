import json
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

class CyclonePredictor:
    def __init__(self):
        # We'll use a dummy/simplistic Random Forest model for demonstration.
        # In reality, this would load a pretrained model trained on HURDAT2 or similar dataset.
        self.model_lat = RandomForestRegressor(n_estimators=10, random_state=42)
        self.model_lng = RandomForestRegressor(n_estimators=10, random_state=42)
        self._train_dummy_model()

    def _train_dummy_model(self):
        # Generate some synthetic training data for the model to "learn"
        # Features: [wind_speed, pressure, temp, humidity, wind_direction]
        # Targets: delta_lat, delta_lng
        np.random.seed(42)
        X = np.random.rand(100, 5) * 100
        y_lat = np.random.randn(100) * 0.5
        y_lng = np.random.randn(100) * 0.5
        
        self.model_lat.fit(X, y_lat)
        self.model_lng.fit(X, y_lng)

    def predict_trajectory(self, base_lat, base_lng, wind_speed, pressure, temp, humidity, direction, steps=5):
        """
        Predict a trajectory of the cyclone eye over the next `steps` intervals.
        """
        trajectory = []
        current_lat = base_lat
        current_lng = base_lng
        
        features = np.array([[wind_speed, pressure, temp, humidity, direction]])
        
        # Iterative prediction for trajectory
        # To make it visually interesting, we add a drift based on the initial direction.
        dir_rad = np.radians(direction)
        drift_lat = np.cos(dir_rad) * 0.5
        drift_lng = np.sin(dir_rad) * 0.5
        
        for i in range(steps):
            # Model prediction gives the delta
            delta_lat = self.model_lat.predict(features)[0] + drift_lat
            delta_lng = self.model_lng.predict(features)[0] + drift_lng
            
            # Apply scaling / dampening
            current_lat += delta_lat
            current_lng += delta_lng
            
            trajectory.append({
                "step": i + 1,
                "lat": current_lat,
                "lng": current_lng,
                "wind_speed_forecast": float(wind_speed - (i * 2)) # simplistic decay
            })
            
            # Update features mildly for next step
            features[0][0] = trajectory[-1]["wind_speed_forecast"]

        return trajectory
