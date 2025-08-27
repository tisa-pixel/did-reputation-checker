# DID Reputation Checker

A web application to check phone number reputation, spam likelihood, and STIR/SHAKEN attestation ratings. Built to help identify whether your DIDs (Direct Inward Dialing numbers) will connect successfully without being marked as spam.

## Features

- **Single Number Check**: Check individual phone numbers instantly
- **Bulk CSV Upload**: Upload CSV files containing multiple phone numbers
- **Comprehensive Analysis**:
  - Spam/Scam likelihood detection
  - STIR/SHAKEN attestation levels (A, B, C)
  - Carrier-specific flagging status
  - CNAM registration status
  - Risk level assessment (Low, Medium, High)
  - Line type identification
  - Disconnected/Reassigned status
- **Export Results**: Download results as CSV for further analysis
- **Real-time Updates**: Live progress tracking during bulk checks

## Getting Started

### Installation

```bash
npm install
```

### Configuration

Configure API keys in `.env.local`:
```env
# IPQualityScore API Key (recommended)
IPQUALITYSCORE_API_KEY=your_ipqs_api_key_here

# NumVerify API Key (optional)  
NUMVERIFY_API_KEY=your_numverify_api_key_here
```

### Running

```bash
npm run dev
```

Visit http://localhost:3000

## Usage

1. **Single Check**: Enter a phone number and click Check
2. **Bulk Upload**: Upload a CSV file with phone numbers
3. **Review Results**: See detailed reputation analysis
4. **Export**: Download results as CSV

## API Integration

Currently integrates with:
- IPQualityScore (fraud scoring, carrier info)
- NumVerify (basic validation)
- Simulated data when no API keys configured
