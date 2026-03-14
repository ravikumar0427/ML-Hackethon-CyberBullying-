# Cyberbullying Detection System

A comprehensive cyberbullying detection system that uses machine learning to analyze and identify potentially harmful messages in real-time.

## Features

- **Real-time Analysis**: Instant detection of cyberbullying content
- **ML-powered Detection**: Advanced machine learning models for accurate analysis
- **Dashboard**: Comprehensive statistics and monitoring
- **Alert System**: Real-time alerts for high-risk content
- **History Tracking**: Complete analysis history and trends
- **Safety Tools**: Resources for safe online communication

## Project Structure

```
ml neurothon/
├── backend/           # Node.js Express server
├── frontend/          # React frontend application
├── ml_api/           # Python Flask ML API
├── package.json      # Root package configuration
└── README.md         # This file
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

2. **Start the development servers:**
   ```bash
   npm run dev
   ```

This will start:
- Backend server on `http://localhost:5001`
- Frontend on `http://localhost:3000`
- ML API on `http://localhost:5000`

### Individual Services

**Backend only:**
```bash
npm run backend
```

**Frontend only:**
```bash
npm run frontend
```

**ML API only:**
```bash
npm run ml-api
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Analysis
- `POST /api/analyze` - Analyze message for cyberbullying

### Data
- `GET /api/history` - Get analysis history
- `GET /api/statistics` - Get statistics
- `GET /api/alerts` - Get alerts
- `GET /api/safety-tools` - Get safety resources

## Usage

1. Register a new account or login
2. Navigate to the Message Analyzer to check messages
3. View statistics and history in the Dashboard
4. Monitor real-time alerts in the Alerts section
5. Access safety tools and resources

## ML Model

The system uses a Naive Bayes classifier trained on cyberbullying tweets dataset. The model automatically trains if no pre-trained model is found.

### Model Training

The model will automatically train when the ML API starts if `model.pkl` is not found. Training uses the `cyberbullying_tweets.csv` dataset.

### Features

- Text preprocessing and cleaning
- TF-IDF vectorization
- Multi-category classification
- Confidence scoring

## Development

### Environment Variables

Create a `.env` file in the frontend root:

```
REACT_APP_API_URL=http://localhost:5001/api
```

### Build for Production

```bash
npm run build
```

## Technologies Used

- **Frontend**: React, Material-UI, Chart.js
- **Backend**: Node.js, Express, Socket.io
- **ML API**: Python, Flask, scikit-learn
- **Database**: In-memory storage (demo)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is for educational purposes only.

## Support

For issues and questions, please create an issue in the repository.
