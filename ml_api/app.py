from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import os
import datetime
import pickle
import shutil
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type, Authorization'
app.config['CORS_SUPPORTS_CREDENTIALS'] = True

# Initialize CORS AFTER config set
cors = CORS(app, resources={
    r"/api/*": {
        "origins": "https://ml-hackethon-cyberbullying-1.onrender.com",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "Cookie"],
        "supports_credentials": True,
        "expose_headers": "*"
    }
})

# =============================================================================
# FIND AND LOAD MODEL (With auto-copy from parent folder)
# =============================================================================

def setup_model():
    """Find model in parent folder and use it, or train new one."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(current_dir)
    
    # Check locations
    local_model = os.path.join(current_dir, 'model.pkl')
    local_vec = os.path.join(current_dir, 'vectorizer.pkl')
    parent_model = os.path.join(parent_dir, 'model.pkl')
    parent_vec = os.path.join(parent_dir, 'vectorizer.pkl')
    
    # If model is in parent, copy to local (so it works reliably)
    if os.path.exists(parent_model) and os.path.exists(parent_vec):
        try:
            shutil.copy(parent_model, local_model)
            shutil.copy(parent_vec, local_vec)
            logger.info("✅ Copied model from parent folder to ml_api")
        except Exception as e:
            logger.error(f"Could not copy model: {e}")
    
    # Now try to load from local
    if os.path.exists(local_model) and os.path.exists(local_vec):
        try:
            with open(local_model, 'rb') as f:
                model = pickle.load(f)
            with open(local_vec, 'rb') as f:
                vectorizer = pickle.load(f)
            logger.info("🧠 ML Model loaded successfully!")
            return model, vectorizer, "loaded"
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
    
    return None, None, "missing"

model, vectorizer, model_status = setup_model()

# =============================================================================
# AUTO-TRAIN IF NEEDED (Fixed label handling)
# =============================================================================

if model_status == "missing":
    logger.info("🔄 Training new model from CSV...")
    try:
        import pandas as pd
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.naive_bayes import MultinomialNB
        
        # Find CSV
        csv_file = None
        for fname in ['cyberbullying_tweets[1].csv', 'cyberbullying_tweets.csv']:
            if os.path.exists(fname):
                csv_file = fname
                break
        
        if csv_file:
            df = pd.read_csv(csv_file)
            logger.info(f"📊 Loaded {len(df)} rows")
            
            # Detect columns
            text_col = [c for c in df.columns if 'text' in c.lower()][0] if any('text' in c.lower() for c in df.columns) else df.columns[0]
            label_col = [c for c in df.columns if 'label' in c.lower() or 'class' in c.lower()][0] if any('label' in c.lower() for c in df.columns) else df.columns[1]
            
            X = df[text_col].astype(str)
            
            # ✅ FIXED: Proper mapping for cyberbullying_tweets.csv format
            raw_labels = df[label_col].astype(str).str.lower().str.strip()

            logger.info(f"Sample labels: {raw_labels.unique()}")  # Debug: see what labels look like

            def map_label(x):
                if x == 'not_cyberbullying':
                    return 0
                elif x in ['gender', 'religion', 'age', 'ethnicity']:  # These = cyberbullying types
                    return 1
                elif 'cyberbullying' in x or x in ['1', 'yes', 'true']:
                    return 1
                else:
                    return 0  # Default safe

            y = raw_labels.apply(map_label).astype(int)

            logger.info(f"✅ Final labels - Cyberbullying (1): {y.sum()}, Safe (0): {len(y) - y.sum()}")
            
            # Train
            vectorizer = TfidfVectorizer(max_features=5000, stop_words='english')
            X_vec = vectorizer.fit_transform(X)
            model = MultinomialNB()
            model.fit(X_vec, y)
            
            # Save
            with open('model.pkl', 'wb') as f:
                pickle.dump(model, f)
            with open('vectorizer.pkl', 'wb') as f:
                pickle.dump(vectorizer, f)
            
            model_status = "trained"
            logger.info("✅ Training complete!")
            
    except Exception as e:
        logger.error(f"Training failed: {e}")
        import traceback
        traceback.print_exc()

use_ml_model = (model is not None and vectorizer is not None)

# =============================================================================
# DETECTION
# =============================================================================

def detect_cyberbullying(text):
    if not text or len(text.strip()) == 0:
        return {'is_cyberbullying': False, 'confidence': 0.0, 'category': 'empty', 'severity': 'LOW', 'message': 'No text'}
    
    if use_ml_model:
        try:
            clean = re.sub(r"http\S+", "", text.lower())
            clean = re.sub(r"[^a-zA-Z\s]", " ", clean)
            clean = re.sub(r"\s+", " ", clean).strip()
            
            vec = vectorizer.transform([clean])
            pred = model.predict(vec)[0]
            prob = float(model.predict_proba(vec)[0][1])
            
            is_cb = (pred == 1)
            return {
                'is_cyberbullying': is_cb,
                'confidence': round(prob, 2),
                'category': 'ai_detected',
                'severity': 'HIGH' if prob > 0.8 else 'MEDIUM' if prob > 0.6 else 'LOW',
                'message': '⚠️ Cyberbullying detected' if is_cb else '✅ Safe message',
                'method': 'ai_ml'
            }
        except Exception as e:
            logger.error(f"ML error: {e}")
    
    return {'is_cyberbullying': False, 'confidence': 0.1, 'message': 'Analysis unavailable', 'method': 'none'}

# =============================================================================
# ROUTES
# =============================================================================

users_db = {}
analysis_history = []
alerts_db = []

@app.route('/api/auth/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    name = data.get('name', '').strip()
    if not email or not password or not name:
        return jsonify({'error': 'All fields required'}), 400
    if email in users_db:
        return jsonify({'error': 'User exists'}), 409
    users_db[email] = {'name': name, 'password': password, 'email': email}
    return jsonify({'success': True, 'user': {'email': email, 'name': name}}), 201

@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    user = users_db.get(email)
    if not user or user['password'] != password:
        return jsonify({'error': 'Invalid credentials'}), 401
    return jsonify({'success': True, 'user': {'email': user['email'], 'name': user['name']}}), 200

@app.route('/api/analyze', methods=['POST', 'OPTIONS'])
def analyze():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    
    data = request.get_json()
    text = data.get('text', '').strip()
    if not text:
        return jsonify({'success': False, 'error': 'No text'}), 400
    
    result = detect_cyberbullying(text)
    
    entry = {
        'id': len(analysis_history) + 1,
        'text': text[:150] + '...' if len(text) > 150 else text,
        'result': result,
        'timestamp': datetime.datetime.now().isoformat()
    }
    analysis_history.append(entry)
    
    if result['is_cyberbullying']:
        alerts_db.append({
            'id': len(alerts_db) + 1,
            'text': entry['text'],
            'confidence': result['confidence'],
            'severity': result['severity'],
            'timestamp': entry['timestamp'],
            'status': 'active'
        })
    
    return jsonify({'success': True, 'analysis': result}), 200

@app.route('/api/history', methods=['GET', 'OPTIONS'])
def get_history():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    return jsonify(analysis_history[-50:]), 200

@app.route('/api/statistics', methods=['GET', 'OPTIONS'])
def stats():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    total = len(analysis_history)
    bullying = sum(1 for item in analysis_history if item['result'].get('is_cyberbullying'))
    return jsonify({
        'success': True,
        'statistics': {
            'total_analyzed': total,
            'cyberbullying_detected': bullying,
            'safe_messages': total - bullying,
            'model_type': 'AI/ML' if use_ml_model else 'None'
        }
    }), 200

@app.route('/api/alerts', methods=['GET', 'OPTIONS'])
def alerts():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    return jsonify({'success': True, 'alerts': [a for a in alerts_db if a['status'] == 'active']}), 200

@app.route('/api/dashboard', methods=['GET', 'OPTIONS'])
def dashboard():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    return jsonify({
        'success': True,
        'dashboard': {
            'total_scanned': len(analysis_history),
            'threats_detected': sum(1 for i in analysis_history if i['result'].get('is_cyberbullying')),
            'model_active': use_ml_model,
            'model_status': model_status
        }
    }), 200

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "model_loaded": use_ml_model,
        "model_status": model_status,
        "analyses_count": len(analysis_history)
    })

if __name__ == "__main__":
    logger.info(f"🚀 Starting server | Model: {model_status} | Active: {use_ml_model}")
    app.run(host='0.0.0.0', port=5000, debug=True)
