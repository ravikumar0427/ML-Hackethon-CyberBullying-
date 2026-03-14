import sys
import json
import pickle
import re
import nltk
from nltk.corpus import stopwords

# Download NLTK resources if not already downloaded
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')

# Load the saved model and vectorizer
try:
    model = pickle.load(open('cyberbullying_model.pkl', 'rb'))
    vectorizer = pickle.load(open('vectorizer.pkl', 'rb'))
    print("Model and vectorizer loaded successfully", file=sys.stderr)
except Exception as e:
    print(f"Error loading model: {str(e)}", file=sys.stderr)
    sys.exit(1)

stop_words = set(stopwords.words('english'))

def clean_text(text):
    """Clean and preprocess the input text"""
    text = str(text).lower()
    text = re.sub(r'http\S+', '', text)  # Remove URLs
    text = re.sub(r'[^a-zA-Z]', ' ', text)  # Remove special characters
    text = re.sub(r'\s+', ' ', text)  # Remove extra spaces
    words = text.split()
    words = [word for word in words if word not in stop_words]  # Remove stopwords
    return " ".join(words)

if __name__ == "__main__":
    try:
        # Get input from command line argument
        input_data = json.loads(sys.argv[1])
        message = input_data['text']
        
        print(f"Received message: {message}", file=sys.stderr)
        
        # Clean the text
        cleaned = clean_text(message)
        print(f"Cleaned text: {cleaned}", file=sys.stderr)
        
        # Transform using vectorizer
        vector = vectorizer.transform([cleaned])
        
        # Make prediction
        prediction = model.predict(vector)[0]
        probability = model.predict_proba(vector)[0][1]
        
        # Prepare result
        result = {
            'is_bullying': bool(prediction),
            'confidence': float(probability),
            'message': 'Cyberbullying Detected' if prediction else 'Safe Message'
        }
        
        print(f"Prediction result: {result}", file=sys.stderr)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            'error': str(e),
            'is_bullying': False,
            'confidence': 0.0,
            'message': 'Error processing message'
        }
        print(json.dumps(error_result), file=sys.stderr)
        print(json.dumps(error_result))