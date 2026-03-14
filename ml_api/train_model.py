# ============================================================
# CYBERBULLYING DETECTION SYSTEM
# BERT + Logistic Regression + Explainable AI (LIME)
# ============================================================

# ------------------------------
# INSTALL LIBRARIES (RUN ONCE)
# ------------------------------
# !pip install transformers torch lime nltk scikit-learn pandas


# ------------------------------
# IMPORT LIBRARIES
# ------------------------------

import pandas as pd
import numpy as np
import torch
import re
import nltk

from transformers import BertTokenizer, BertModel

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

from lime.lime_text import LimeTextExplainer

from nltk.corpus import stopwords


# ------------------------------
# DOWNLOAD NLTK DATA
# ------------------------------

nltk.download('stopwords')

stop_words = set(stopwords.words('english'))


# ============================================================
# LOAD DATASET
# ============================================================

print("Loading dataset...")

data = pd.read_csv(
    "cyberbullying_tweets[1].csv",
    encoding='latin1',
    on_bad_lines='skip'
)

print("Dataset loaded successfully")

print("\nFirst rows:")
print(data.head())


# ============================================================
# SELECT REQUIRED COLUMNS
# ============================================================

data = data[['tweet_text','cyberbullying_type']]

data.drop_duplicates(inplace=True)


# ============================================================
# TEXT CLEANING
# ============================================================

def clean_text(text):

    text = str(text)

    text = text.lower()

    text = re.sub(r"http\S+","",text)

    text = re.sub(r"[^a-zA-Z ]"," ",text)

    text = re.sub(r"\s+"," ",text)

    words = text.split()

    words = [w for w in words if w not in stop_words]

    return " ".join(words)


print("\nCleaning text...")

data['clean_text'] = data['tweet_text'].apply(clean_text)


# ============================================================
# LOAD BERT MODEL
# ============================================================

print("\nLoading BERT model...")

tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

bert_model = BertModel.from_pretrained('bert-base-uncased')

print("BERT loaded successfully")


# ============================================================
# FUNCTION TO CREATE BERT EMBEDDINGS
# ============================================================

def get_bert_embedding(text):

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=64
    )

    with torch.no_grad():

        outputs = bert_model(**inputs)

    embedding = outputs.last_hidden_state[:,0,:].numpy()

    return embedding.flatten()


# ============================================================
# GENERATE EMBEDDINGS
# ============================================================

print("\nGenerating BERT embeddings (this may take a few minutes)...")

X = []

for text in data['clean_text']:

    emb = get_bert_embedding(text)

    X.append(emb)

X = np.array(X)

y = data['cyberbullying_type']

print("Embedding shape:",X.shape)


# ============================================================
# TRAIN TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)


# ============================================================
# TRAIN CLASSIFIER
# ============================================================

print("\nTraining classifier...")

clf = LogisticRegression(max_iter=2000)

clf.fit(X_train,y_train)

print("Training completed")


# ============================================================
# MODEL EVALUATION
# ============================================================

print("\nEvaluating model...")

pred = clf.predict(X_test)

accuracy = accuracy_score(y_test,pred)

print("\nAccuracy:",accuracy)

print("\nClassification Report:\n")

print(classification_report(y_test,pred))


# ============================================================
# EXPLAINABLE AI SETUP
# ============================================================

explainer = LimeTextExplainer(class_names=clf.classes_)


# ============================================================
# PREDICT PROBABILITY FUNCTION FOR LIME
# ============================================================

def predict_proba(texts):

    embeddings = []

    for text in texts:

        cleaned = clean_text(text)

        emb = get_bert_embedding(cleaned)

        embeddings.append(emb)

    embeddings = np.array(embeddings)

    return clf.predict_proba(embeddings)


# ============================================================
# PREDICTION + EXPLANATION FUNCTION
# ============================================================

def analyze_message(message):

    print("\n----------------------------------")

    print("Message:",message)

    cleaned = clean_text(message)

    embedding = get_bert_embedding(cleaned).reshape(1,-1)

    pred = clf.predict(embedding)[0]

    probs = clf.predict_proba(embedding)

    confidence = np.max(probs)

    print("\nPrediction:",pred)

    print("Confidence:",round(confidence*100,2),"%")

    if pred!="not_cyberbullying":

        print("Cyberbullying Type:",pred)

    else:

        print("Message appears safe")


    # LIME explanation

    print("\nImportant Words Influencing Prediction:\n")

    explanation = explainer.explain_instance(
        message,
        predict_proba,
        num_features=6
    )

    for word,weight in explanation.as_list():

        print(word,"->",round(weight,3))


# ============================================================
# SAMPLE TEST
# ============================================================

print("\nTesting example messages...")

analyze_message("You are such a stupid idiot")

analyze_message("Great job on your project")


# ============================================================
# USER INPUT SYSTEM
# ============================================================

print("\nCyberbullying Detection System Ready")

while True:

    user_input = input("\nEnter message (type quit to stop): ")

    if user_input.lower()=="quit":

        print("System closed")

        break

    analyze_message(user_input)