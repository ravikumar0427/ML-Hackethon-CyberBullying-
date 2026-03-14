const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   Temporary User Storage
========================= */

const users = [];

/* =========================
   TEST ROUTE
========================= */

app.get("/", (req, res) => {
  res.send("Cyberbullying Detection API Running");
});

/* =========================
   REGISTER API
========================= */

app.post("/api/auth/register", (req, res) => {

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingUser = users.find(user => user.email === email);

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    password
  };

  users.push(newUser);

  res.json({
    message: "Registration successful"
  });

});

/* =========================
   LOGIN API
========================= */

app.post("/api/auth/login", (req, res) => {

  const { email, password } = req.body;

  const user = users.find(
    user => user.email === email && user.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({
    token: "demo_token",
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });

});

/* =========================
   CYBERBULLYING PREDICTION
========================= */

const alerts = [];
const alertThresholds = {
  highRisk: 0.8,
  mediumRisk: 0.6,
  multipleOffenses: 3
};

// Mock database for demonstration
const analysisHistory = [
  {
    id: 1,
    text: "This is a sample safe message",
    is_bullying: false,
    confidence: 0.2,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    userId: 1
  },
  {
    id: 2,
    text: "I hate you and you should disappear",
    is_bullying: true,
    confidence: 0.8,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    userId: 1
  },
  {
    id: 3,
    text: "You're so stupid and ugly",
    is_bullying: true,
    confidence: 0.9,
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    userId: 2
  },
  {
    id: 4,
    text: "Have a great day everyone!",
    is_bullying: false,
    confidence: 0.1,
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    userId: 1
  },
  {
    id: 5,
    text: "Nobody likes you, just go away",
    is_bullying: true,
    confidence: 0.85,
    timestamp: new Date(Date.now() - 18000000).toISOString(),
    userId: 2
  },
  {
    id: 6,
    text: "Love this community! So supportive",
    is_bullying: false,
    confidence: 0.05,
    timestamp: new Date(Date.now() - 21600000).toISOString(),
    userId: 1
  },
  {
    id: 7,
    text: "You're worthless and should die",
    is_bullying: true,
    confidence: 0.95,
    timestamp: new Date(Date.now() - 25200000).toISOString(),
    userId: 2
  }
];

const createAlert = (analysis, userId) => {
  if (analysis.is_bullying && analysis.confidence >= alertThresholds.highRisk) {
    const alert = {
      id: Date.now(),
      type: 'HIGH_RISK_DETECTED',
      text: analysis.text,
      message: analysis.text,
      confidence: analysis.confidence,
      userId: userId,
      timestamp: new Date().toISOString(),
      severity: 'HIGH',
      status: 'PENDING'
    };
    alerts.push(alert);
    return alert;
  }
  return null;
};

app.post("/api/analyze", async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ 
        error: "Text is required",
        is_bullying: false,
        confidence: 0,
        message: "No text provided"
      });
    }

    // Get user from token (simplified for demo)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let userId = 1; // Default user for demo
    
    if (token === 'demo_token') {
      userId = 1;
    }

    // Use the simple Python predictor with file-based communication
    const tempFile = `temp_input_${Date.now()}.json`;
    
    // Write input to temporary file
    fs.writeFileSync(tempFile, JSON.stringify({text}));
    
    const command = `python ml-models/simple_predict.py ${tempFile}`;

    exec(command, (error, stdout, stderr) => {
      // Clean up temp file
      try {
        fs.unlinkSync(tempFile);
      } catch (e) {
        // Ignore cleanup errors
      }
      
      if (error) {
        console.error("Python script error:", error);
        return res.status(500).json({ 
          error: "ML model error",
          is_bullying: false,
          confidence: 0,
          message: "Error analyzing message"
        });
      }

      try {
        const result = JSON.parse(stdout.trim());
        
        // Store analysis in history
        const analysisEntry = {
          id: Date.now(),
          text: text,
          is_bullying: result.is_bullying,
          confidence: result.confidence,
          timestamp: new Date().toISOString(),
          userId: userId
        };
        analysisHistory.push(analysisEntry);
        
        // Create alert for moderators/parents if high risk
        const alert = createAlert({...result, text: text}, userId);
        
        // Include alert info in response
        const response = {
          ...result,
          alertCreated: alert ? true : false,
          alertId: alert ? alert.id : null
        };
        
        res.json(response);
      } catch (parseError) {
        console.error("Parse error:", parseError);
        console.error("Raw output:", stdout);
        res.status(500).json({ 
          error: "Failed to parse ML result",
          is_bullying: false,
          confidence: 0,
          message: "Error processing result"
        });
      }
    });

  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ 
      error: "Server error",
      is_bullying: false,
      confidence: 0,
      message: "Internal server error"
    });
  }
});

/* =========================
   MIDDLEWARE FOR AUTH
========================= */

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // For demo purposes, we'll accept any token and extract user info
  // In production, you would verify the JWT token
  if (token === 'demo_token') {
    req.user = { id: 1, name: 'Demo User' }; // Default user for demo
    next();
  } else {
    // Try to extract user info from token (simplified)
    try {
      const userInfo = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      req.user = userInfo;
      next();
    } catch (error) {
      return res.status(403).json({ message: 'Invalid token' });
    }
  }
};

/* =========================
   ALERTS API FOR MODERATORS/PARENTS
========================= */

app.post("/api/alerts/:alertId/resolve", authenticateToken, (req, res) => {
  const alertId = parseInt(req.params.alertId);
  const alert = alerts.find(a => a.id === alertId);
  
  if (alert) {
    alert.status = 'RESOLVED';
    alert.resolvedAt = new Date().toISOString();
    alert.resolvedBy = req.user.id;
    res.json({ message: 'Alert resolved successfully', alert });
  } else {
    res.status(404).json({ error: 'Alert not found' });
  }
});

app.get("/api/alerts", authenticateToken, (req, res) => {
  // Return alerts for moderators/parents
  const userAlerts = alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(userAlerts);
});

/* =========================
   SAFE ONLINE ENVIRONMENT TOOLS
========================= */

app.get("/api/safety-tools", authenticateToken, (req, res) => {
  // Provide safety tools and resources
  res.json({
    tools: [
      {
        name: "Report Bullying",
        description: "Report cyberbullying incidents",
        type: "REPORTING"
      },
      {
        name: "Block User",
        description: "Block harmful users",
        type: "PROTECTION"
      },
      {
        name: "Privacy Settings",
        description: "Control who can contact you",
        type: "PRIVACY"
      },
      {
        name: "Safe Messaging Guide",
        description: "Guidelines for safe online communication",
        type: "EDUCATION"
      },
      {
        name: "Parental Controls",
        description: "Monitor and protect children online",
        type: "PARENTAL"
      },
      {
        name: "Emergency Contacts",
        description: "Get help when needed",
        type: "SUPPORT"
      }
    ],
    resources: [
      {
        title: "Cyberbullying Prevention",
        url: "#",
        type: "GUIDE"
      },
      {
        title: "Online Safety Tips",
        url: "#",
        type: "TIPS"
      },
      {
        title: "Report to Authorities",
        url: "#",
        type: "EMERGENCY"
      }
    ]
  });

});

/* =========================
   HISTORY API
========================= */

app.get("/api/history", authenticateToken, (req, res) => {
  // Filter by user ID from authenticated token
  const userId = req.user.id;
  const userHistory = analysisHistory
    .filter(item => item.userId === userId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .map(item => ({
      id: item.id,
      text: item.text,
      is_bullying: item.is_bullying,
      confidence: item.confidence,
      timestamp: item.timestamp,
      userId: item.userId,
      // Add a new property 'category' based on the confidence level
      category: item.confidence > 0.7 ? 'High Risk' : item.confidence > 0.4 ? 'Medium Risk' : 'Low Risk'
    }));
  
  res.json(userHistory);
});

/* =========================
   STATISTICS API
========================= */

app.get("/api/statistics", authenticateToken, (req, res) => {
  // Filter by user ID from authenticated token
  const userId = req.user.id;
  const userHistory = analysisHistory.filter(item => item.userId === userId);
  
  // Calculate real statistics from the user's history data
  const totalMessages = userHistory.length;
  const bullyingDetected = userHistory.filter(item => item.is_bullying).length;
  const safeMessages = totalMessages - bullyingDetected;
  const avgConfidence = totalMessages > 0 ? userHistory.reduce((sum, item) => sum + item.confidence, 0) / totalMessages : 0;
  
  // Calculate accuracy (mock data for demonstration)
  const accuracy = 94.5 + Math.random() * 2; // Random variation
  
  // Response time in seconds
  const responseTime = 0.8 + Math.random() * 0.4;
  
  // Categories (mock data based on user's bullying messages)
  const bullyingMessages = userHistory.filter(item => item.is_bullying);
  const categories = {
    verbal: Math.floor(bullyingDetected * 0.4),
    threats: Math.floor(bullyingDetected * 0.2),
    harassment: Math.floor(bullyingDetected * 0.3),
    hateSpeech: Math.floor(bullyingDetected * 0.1),
    other: Math.floor(bullyingDetected * 0.05)
  };

  res.json({
    totalMessages,
    bullyingDetected,
    safeMessages,
    accuracy: accuracy.toFixed(1),
    responseTime: responseTime.toFixed(1),
    avgConfidence: (avgConfidence * 100).toFixed(1),
    detectionRate: totalMessages > 0 ? ((bullyingDetected / totalMessages) * 100).toFixed(1) : '0',
    categories,
    userId,
    lastUpdated: new Date().toISOString()
  });
});

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});