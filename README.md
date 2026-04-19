# Cyclone Tracker & Eye Predictor

A full-stack AI-powered dashboard estimating the trajectory and wind dynamics of cyclones. 

## Features
- **Scikit-Learn Backend**: Predicts location shifts (Latitude/Longitude) utilizing a Random Forest Regressor acting on meteorological features.
- **Flask API**: High-performance backend API serving prediction data.
- **Beautiful Dashboard**: Glassmorphism aesthetic dark mode.
- **Leaflet.js Maps**: Integrated cartographic plotting over dark tile layers, dynamically demonstrating trajectory paths.

## Setup Instructions

1. Ensure **Python** is installed.
2. Open a terminal and navigate to this folder.
3. Create a python virtual environment:
   ```bash
   python -m venv venv
   ```
4. Activate the virtual environment:
   - PowerShell: `.\venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
5. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
6. Run the local backend server:
   ```bash
   python app.py
   ```
7. Visit `http://127.0.0.1:5000` in your web browser.
