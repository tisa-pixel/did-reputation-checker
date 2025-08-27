# Dialpad API Integration Guide

## How to Connect Dialpad API for Real Call Metrics

### 1. Get Your Dialpad API Credentials

1. **Log into Dialpad Admin Console**
   - Go to https://dialpad.com/app
   - Click Admin Settings → API

2. **Create an API Key**
   - Click "Create API Key"
   - Name it: "DID Reputation Checker"
   - Select permissions: 
     - `calls:read` - Read call logs
     - `users:read` - Read user info
     - `numbers:read` - Read phone numbers
   - Copy your API key (you won't see it again!)

3. **Get Your OAuth Credentials** (if needed)
   - Some endpoints require OAuth
   - Find Client ID and Client Secret
   - Redirect URI: `http://localhost:3000/api/auth/dialpad/callback`

### 2. Add Dialpad Credentials to Your App

Add to `.env.local`:
```env
# Dialpad API
DIALPAD_API_KEY=your_dialpad_api_key_here
DIALPAD_API_URL=https://dialpad.com/api/v2
# Optional OAuth (for advanced features)
DIALPAD_CLIENT_ID=your_client_id
DIALPAD_CLIENT_SECRET=your_client_secret
```

### 3. Key Dialpad API Endpoints

#### Get Call Statistics per DID
```javascript
// GET /api/v2/calls
// Query params:
// - number: specific DID
// - start_time: from date
// - end_time: to date
// - limit: max results

const response = await fetch(
  `${DIALPAD_API_URL}/calls?number=${phoneNumber}&start_time=${startDate}`,
  {
    headers: {
      'Authorization': `Bearer ${DIALPAD_API_KEY}`,
      'Accept': 'application/json'
    }
  }
);
```

#### Get All Your DIDs
```javascript
// GET /api/v2/numbers
const response = await fetch(`${DIALPAD_API_URL}/numbers`, {
  headers: {
    'Authorization': `Bearer ${DIALPAD_API_KEY}`,
    'Accept': 'application/json'
  }
});

// Returns:
{
  "numbers": [
    {
      "number": "+14155551234",
      "type": "local",
      "carrier": "bandwidth.com",
      "assigned_to": "user_id",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Get Call Metrics for Analysis
```javascript
// GET /api/v2/stats/calls
const response = await fetch(
  `${DIALPAD_API_URL}/stats/calls?group_by=number&date_range=30d`,
  {
    headers: {
      'Authorization': `Bearer ${DIALPAD_API_KEY}`,
      'Accept': 'application/json'
    }
  }
);

// Returns per number:
{
  "stats": [
    {
      "number": "+14155551234",
      "total_calls": 1250,
      "answered_calls": 450,
      "answer_rate": 0.36,
      "average_duration": 125,
      "last_call_date": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 4. Add Real Metrics to Health Score

Create a new file `src/lib/dialpad-api.ts`:

```typescript
export async function getDialpadMetrics(phoneNumber: string) {
  const apiKey = process.env.DIALPAD_API_KEY;
  
  if (!apiKey) {
    return null;
  }

  try {
    // Get last 30 days of call data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const response = await fetch(
      `https://dialpad.com/api/v2/stats/calls?` +
      `number=${encodeURIComponent(phoneNumber)}&` +
      `start_time=${thirtyDaysAgo.toISOString()}&` +
      `end_time=${new Date().toISOString()}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error('Dialpad API error:', response.status);
      return null;
    }

    const data = await response.json();
    
    // Calculate metrics
    const stats = data.stats?.[0];
    if (!stats) return null;

    const lastCallDate = new Date(stats.last_call_date);
    const daysSinceLastCall = Math.floor(
      (Date.now() - lastCallDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      totalCalls: stats.total_calls,
      answeredCalls: stats.answered_calls,
      answerRate: stats.answer_rate,
      averageDuration: stats.average_duration,
      daysSinceLastCall,
      dailyAverage: Math.floor(stats.total_calls / 30)
    };
  } catch (error) {
    console.error('Error fetching Dialpad metrics:', error);
    return null;
  }
}
```

### 5. Use in Your Health Score Calculation

Update `src/app/api/validate/route.ts`:

```typescript
import { getDialpadMetrics } from '@/lib/dialpad-api';

// In your validation function:
const dialpadData = await getDialpadMetrics(phoneNumber);

if (dialpadData) {
  // Add answer rate to health score factors
  // Low answer rate (<20%) = problem number
  // Good answer rate (>40%) = healthy number
  
  result.answerRate = dialpadData.answerRate;
  result.totalCalls = dialpadData.totalCalls;
  
  // Adjust health score based on real metrics
  if (dialpadData.answerRate < 0.20) {
    // Poor answer rate - likely flagged
    result.healthScore.score -= 20;
    result.healthScore.recommendations.push(
      `Answer rate is only ${(dialpadData.answerRate * 100).toFixed(1)}% - number may be flagged`
    );
  }
}
```

### 6. Webhooks for Real-Time Updates (Optional)

Set up webhooks to get notified of call events:

1. In Dialpad Admin, go to Webhooks
2. Add webhook URL: `https://your-app.vercel.app/api/webhooks/dialpad`
3. Select events:
   - `call.ended` - Track call completions
   - `call.spam_marked` - Know immediately when flagged

### 7. Important Metrics to Track

From Dialpad's data, focus on:

1. **Answer Rate** - Most important! <20% means trouble
2. **Average Call Duration** - Short calls (<10 seconds) hurt reputation  
3. **Daily Volume Patterns** - Sudden spikes trigger spam detection
4. **Time Since Last Success** - Inactive numbers lose reputation
5. **Carrier Info** - Some carriers have better delivery

### 8. Rate Limits

Dialpad API limits:
- 600 requests per minute
- 20,000 requests per day
- Cache responses for 5 minutes minimum

### 9. Testing Your Integration

```bash
# Test your API key
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://dialpad.com/api/v2/users/me

# Get your numbers
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://dialpad.com/api/v2/numbers

# Get call stats for a number
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://dialpad.com/api/v2/stats/calls?number=+14155551234&date_range=7d"
```

### 10. Support Resources

- **API Documentation**: https://developers.dialpad.com/
- **API Status**: https://status.dialpad.com/
- **Support**: api-support@dialpad.com
- **Rate Limits**: https://developers.dialpad.com/docs/rate-limits

## Pro Tips

1. **Cache Everything** - Don't hit the API on every check
2. **Batch Requests** - Get multiple numbers in one call when possible
3. **Monitor Answer Rates** - This is your #1 indicator
4. **Weekly Reports** - Set up automated checks of all DIDs
5. **Alert on Drops** - If answer rate drops 10% in a day, investigate immediately

## What Answer Rates Mean

- **40%+** - Excellent, no issues
- **30-40%** - Good, monitor occasionally  
- **20-30%** - Warning, may have minor flags
- **10-20%** - Problem, likely flagged as spam
- **<10%** - Critical, heavily flagged or blocked