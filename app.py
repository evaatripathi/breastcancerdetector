from flask import Flask, render_template, request, jsonify
import numpy as np
import tensorflow as tf
import joblib
import os

app = Flask(__name__)

# Attempt to load the model and scaler on startup
MODEL_PATH = 'breast_cancer_model.keras'
SCALER_PATH = 'scaler.pkl'

try:
    model = tf.keras.models.load_model(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    print("Model and Scaler loaded successfully.")
except Exception as e:
    print(f"Error loading model or scaler. Ensure files exist in the root directory. Details: {e}")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # Extract all 30 features in the exact order trained
        feature_values = []
        for i in range(1, 31):
            val = data.get(f'feature_{i}')
            if val is None or val == '':
                return jsonify({'success': False, 'error': f'Missing value for feature_{i}'}), 400
            feature_values.append(float(val))
            
        # 1. Change input data to a numpy array
        input_data_as_numpy_array = np.asarray(feature_values)
        
        # 2. Reshape the numpy array as we are predicting for one data point
        input_data_reshaped = input_data_as_numpy_array.reshape(1, -1)
        
        # 3. Standardizing the input data exactly as in training
        input_data_std = scaler.transform(input_data_reshaped)
        
        # 4. Make prediction
        prediction_prob = model.predict(input_data_std)
        
        # 5. Get the max index (0 = Malignant, 1 = Benign based on sklearn dataset)
        predicted_class = int(np.argmax(prediction_prob[0]))
        
        # Calculate confidences
        prob_malignant = float(prediction_prob[0][0]) * 100
        prob_benign = float(prediction_prob[0][1]) * 100
        
        if predicted_class == 0:
            result_label = "Malignant"
            confidence = prob_malignant
        else:
            result_label = "Benign"
            confidence = prob_benign

        return jsonify({
            'success': True,
            'prediction': result_label,
            'confidence': round(confidence, 2),
            'probabilities': {
                'malignant': round(prob_malignant, 2),
                'benign': round(prob_benign, 2)
            }
        })

    except ValueError as ve:
         return jsonify({'success': False, 'error': 'Invalid numerical input provided.'}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)