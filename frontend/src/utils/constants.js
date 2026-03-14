export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register'
  },
  ANALYSIS: {
    ANALYZE: '/analyze'
  },
  HISTORY: '/history',
  STATISTICS: '/statistics',
  ALERTS: '/alerts',
  SAFETY_TOOLS: '/safety-tools'
};

export const ALERT_SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
};

export const BULLYING_CATEGORIES = {
  VERBAL: 'verbal',
  THREATS: 'threats',
  HARASSMENT: 'harassment',
  HATE_SPEECH: 'hateSpeech',
  OTHER: 'other'
};

export const CHART_COLORS = {
  PRIMARY: '#6366f1',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6'
};

export const DASHBOARD_CARD_DATA = [
  {
    title: 'Total Messages',
    key: 'totalMessages',
    icon: 'message',
    color: 'primary'
  },
  {
    title: 'Threats Detected',
    key: 'bullyingDetected',
    icon: 'warning',
    color: 'error'
  },
  {
    title: 'Safe Messages',
    key: 'safeMessages',
    icon: 'check',
    color: 'success'
  },
  {
    title: 'Detection Rate',
    key: 'detectionRate',
    icon: 'percent',
    color: 'info'
  }
];

export const ANIMATION_VARIANTS = {
  HIDDEN: { opacity: 0, y: 20 },
  VISIBLE: { opacity: 1, y: 0 },
  EXIT: { opacity: 0, y: -20 }
};

export const TOAST_CONFIG = {
  duration: 4000,
  position: 'top-right',
  style: {
    background: '#1f2937',
    color: '#fff'
  }
};

export const ROUTES = {
  DASHBOARD: '/',
  ANALYZER: '/analyzer',
  STATISTICS: '/statistics',
  HISTORY: '/history',
  ALERTS: '/alerts',
  SAFETY: '/safety'
};