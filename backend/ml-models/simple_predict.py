import sys
import json
import re

def simple_cyberbullying_detection(text):
    """Enhanced context-aware cyberbullying detection with pattern recognition"""
    
    # Enhanced cyberbullying keywords and patterns
    severe_toxic = [
        'kill yourself', 'go die', 'worthless', 'should die', 'end your life',
        'jump off', 'hang yourself', 'drink bleach', 'commit suicide'
    ]
    
    strong_toxic = [
        'hate', 'kill', 'die', 'stupid', 'idiot', 'ugly', 'fat', 'loser',
        'pathetic', 'worthless', 'disgusting', 'freak', 'moron', 'retard',
        'bully', 'harass', 'threat', 'hurt', 'harm', 'abuse', 'attack',
        'fuck', 'shit', 'bitch', 'bastard', 'asshole', 'damn', 'hell'
    ]
    
    medium_toxic = [
        'annoying', 'dumb', 'weird', 'creepy', 'stupid', 'hate', 'loser',
        'shut up', 'go away', 'nobody likes', 'everyone hates'
    ]
    
    # Context patterns for cyberbullying (more comprehensive)
    bullying_patterns = [
        r'you\s+(are|is)\s+(a\s+)?(stupid|idiot|ugly|fat|loser|worthless|pathetic|disgusting|creepy|annoying)',
        r'go\s+(away|die|kill\s+yourself|hell)',
        r'nobody\s+likes\s+you',
        r'everyone\s+hates\s+you',
        r'you\s+should\s+(die|go\s+away|disappear|get\s+lost)',
        r'i\s+hate\s+you',
        r'you\s+(are|is)\s+so\s+(annoying|dumb|stupid|ugly|fat|worthless|pathetic)',
        r'why\s+are\s+you\s+so\s+(stupid|dumb|ugly|fat|annoying)',
        r'you\s+(are|is)\s+(a\s+)?(bitch|asshole|bastard|moron|retard)',
        r'no\s+one\s+likes\s+you',
        r'everyone\s+thinks\s+you\s+(are|is)\s+(stupid|ugly|dumb)',
        r'you\s+(have|has)\s+no\s+friends',
        r'you\s+(are|is)\s+(a\s+)?(mistake|failure|disappointment)',
        r'go\s+(back|away|home|to\s+hell)',
        r'shut\s+(up|your\s+mouth)',
        r'who\s+(do|does)\s+you\s+think\s+you\s+(are|is)',
        r'you\s+(are|is)\s+(nothing|nobody|useless)',
        r'die\s+(in\s+a\s+fire|alone|now)',
        r'kill\s+(yourself|you)',
        r'end\s+(it|your\s+life)',
        r'you\s+(deserve|should)\s+(to\s+die|this)',
        r'i\s+(wish|hope)\s+you\s+(die|get|hurt)',
        r'you\s+(make|makes)\+me\s+sick',
        r'you\s+(are|is)\s+(so|very)\s+(stupid|dumb|ugly|fat|annoying)',
    ]
    
    # Safe indicators
    safe_keywords = [
        'friend', 'love', 'happy', 'good', 'nice', 'great', 'awesome',
        'wonderful', 'amazing', 'beautiful', 'kind', 'help', 'support',
        'thank you', 'please', 'sorry', 'excuse me', 'hello', 'hi',
        'how are you', 'good morning', 'good night', 'take care', 'best wishes'
    ]
    
    text_lower = text.lower()
    
    # Check for severe toxicity first
    for phrase in severe_toxic:
        if phrase in text_lower:
            return True, 0.95
    
    # Check for bullying patterns (most important)
    for pattern in bullying_patterns:
        if re.search(pattern, text_lower):
            return True, 0.85
    
    # Enhanced word-based detection with context
    words = text_lower.split()
    toxic_count = 0
    severe_count = 0
    strong_count = 0
    medium_count = 0
    safe_count = 0
    
    # Check each word against toxic lists
    for word in words:
        if any(toxic in word for toxic in severe_toxic):
            severe_count += 1
        elif any(toxic in word for toxic in strong_toxic):
            strong_count += 1
        elif any(toxic in word for toxic in medium_toxic):
            medium_count += 1
        elif any(safe in word for safe in safe_keywords):
            safe_count += 1
    
    total_toxic = severe_count + strong_count + medium_count
    
    # Advanced scoring algorithm with context awareness
    if total_toxic > 0:
        # Weight the toxic words
        weighted_score = (severe_count * 0.4) + (strong_count * 0.3) + (medium_count * 0.2)
        
        # Consider safe words as negative weight
        if safe_count > 0:
            weighted_score -= (safe_count * 0.1)
        
        # Check for intensity indicators
        intensity_words = ['very', 'so', 'really', 'extremely', 'totally', 'completely']
        intensity_count = sum(1 for word in intensity_words if word in text_lower)
        if intensity_count > 0:
            weighted_score += (intensity_count * 0.1)
        
        # Check for personal attacks (you, your, etc.)
        personal_words = ['you', 'your', 'yourself']
        personal_count = sum(1 for word in personal_words if word in words)
        if personal_count > 0:
            weighted_score += (personal_count * 0.05)
        
        # Calculate confidence
        if weighted_score >= 0.3:
            confidence = min(0.95, 0.5 + weighted_score)
            return True, confidence
        else:
            confidence = max(0.1, 0.3 - weighted_score)
            return False, confidence
    else:
        # No toxic words detected
        if safe_count > 0:
            return False, 0.1  # Very low confidence for safe
        else:
            return False, 0.3  # Neutral confidence

if __name__ == "__main__":
    try:
        # Get input from command line argument (file path)
        if len(sys.argv) > 1:
            file_path = sys.argv[1]
            with open(file_path, 'r') as f:
                input_data = json.load(f)
            message = input_data['text']
        else:
            # Fallback to reading from stdin
            input_str = sys.stdin.read().strip()
            input_data = json.loads(input_str)
            message = input_data['text']
        
        # Make prediction
        is_bullying, confidence = simple_cyberbullying_detection(message)
        
        # Prepare result
        result = {
            'is_bullying': is_bullying,
            'confidence': confidence,
            'message': 'Cyberbullying Detected' if is_bullying else 'Safe Message'
        }
        
        # Output result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            'error': str(e),
            'is_bullying': False,
            'confidence': 0.0,
            'message': 'Error processing message'
        }
        print(json.dumps(error_result))
