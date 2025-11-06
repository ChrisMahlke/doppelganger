# Demographic Doppelgänger - Technical Architecture

## Executive Summary

Demographic Doppelgänger is a full-stack web application that enables users to explore U.S. ZIP code demographics and discover demographically similar communities using AI. The system is built entirely on Google Cloud Platform, leveraging Cloud Run for serverless containerized services, API Gateway for secure API management, Firestore for caching, and Gemini AI for intelligent analysis. The front-end was built entirely in Google AI Studio and deployed from Google AI Studio. Repositoty links can be found at this end of this document.

**Live Application**: [https://demographic-doppelganger-71027948544.us-west1.run.app/](https://demographic-doppelganger-71027948544.us-west1.run.app/)

## System Architecture Overview

The application follows a **multi-service microservices architecture** with clear separation of concerns:

- **Frontend Service**: React/TypeScript application deployed on Cloud Run
- **API Gateway**: Google Cloud API Gateway (managed service) for authentication and routing
- **Backend Engine**: Python Flask service deployed on Cloud Run (private, IAM-authenticated)
- **Data Layer**: Firestore for caching, U.S. Census Bureau API for demographic data, Gemini AI for analysis

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
 │                         User Browser                                    │
 │                    (React Application)                                  │
 │  https://demographic-doppelganger-71027948544.us-west1.run.app/         │
 └────────────────────────────┬────────────────────────────────────────────┘
                              │
                              │ HTTPS POST /find-twin
                              │ Headers: x-api-key, Content-Type
                              │ Body: {"zip_code": "90210"}
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Google Cloud API Gateway                             │
│                    (Managed Service)                                    │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ • API Key Validation (x-api-key header)                          │   │  
│  │ • CORS Preflight Handling (OPTIONS)                              │   │
│  │ • Request Routing                                                │   │
│  │ • IAM Service Account Authentication                             │   │
│  │ • 120s Deadline Configuration                                    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│  Gateway URL: doppelganger-gateway-wmo7fuo.uc.gateway.dev               │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             │ Authenticated Request
                             │ (IAM Service Account Token)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              Backend Engine Service (Cloud Run)                         │
│              Service: doppelganger-engine                               │
│              Region: us-central1                                        │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Configuration:                                                   │   │
│  │ • Memory: 2Gi                                                    │   │
│  │ • Timeout: 120s                                                  │   │
│  │ • Min Instances: 1 (zero cold starts)                            │   │
│  │ • Authentication: IAM only (no public access)                    │   │
│  │ • Container: Python 3.x + Flask + Gunicorn                       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
    ┌───────────────┐ ┌──────────────┐ ┌──────────────┐
    │   Firestore   │ │ U.S. Census  │ │ Gemini AI    │
    │   (Cache)     │ │ Bureau API   │ │ (Analysis)   │
    │               │ │              │ │              │
    │ Collection:   │ │ ACS 5-Year   │ │ Model:       │
    │ zip_cache     │ │ Estimates    │ │ gemini-2.5-  │
    │               │ │              │ │ flash        │
    └───────────────┘ └──────────────┘ └──────────────┘
```

## Component Architecture

### 1. Frontend Service (Cloud Run)

**Repository**: [`doppelganger`](https://github.com/ChrisMahlke/doppelganger)

**Technology Stack**:

- React 18+ with TypeScript
- Material-UI (MUI) for UI components
- Google Maps JavaScript API for geospatial visualization
- Vite for build tooling

**Deployment**:

- **Platform**: Google Cloud Run
- **Region**: us-west1
- **URL**: `https://demographic-doppelganger-71027948544.us-west1.run.app/`
- **Deployment Method**: Deployed via Google AI Studio

**Key Features**:

- Interactive map visualization with ZIP code boundaries
- Real-time demographic data display
- AI-powered insights on user demand
- Geodesic line visualization connecting doppelgängers
- Custom animated markers and InfoWindows
- Point-in-polygon validation for Places API results

**Environment Variables**:

- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps API key (HTTP referrer restricted)
- `VITE_API_GATEWAY_URL`: API Gateway endpoint URL
- `VITE_API_GATEWAY_KEY`: API Gateway API key

**API Integration**:

- **Google Maps JavaScript API**: Map rendering, boundaries, markers
- **Google Geocoding API**: Coordinate to ZIP code conversion
- **Google Places API**: Points of interest within ZIP codes
- **API Gateway**: Backend data requests (with `x-api-key` header)

### 2. API Gateway (Google Cloud API Gateway)

**Repository**: [`api-gateway-spec`](https://github.com/ChrisMahlke/api-gateway-spec)

**Configuration**: OpenAPI 2.0 (Swagger) specification

**Service Details**:

- **Gateway Name**: `doppelganger-gateway`
- **Location**: `us-central1`
- **Gateway URL**: `https://doppelganger-gateway-wmo7fuo.uc.gateway.dev`
- **API Config**: Versioned (v1, v2, etc.)

**Authentication**:

- **Method**: API Key in `x-api-key` header
- **Key Restrictions**: 
  - HTTP Referrer: Frontend URL only
  - API Targets: `apigateway.googleapis.com`
- **Key Management**: Google Cloud Console → APIs & Services → Credentials

**Backend Configuration**:
```yaml
x-google-backend:
  address: https://doppelganger-engine-5znouwfmaa-uc.a.run.app/find-twin
  deadline: 120  # Matches Cloud Run service timeout
```

**Endpoints**:

- **POST `/find-twin`**: Requires API key authentication
- **OPTIONS `/find-twin`**: CORS preflight (no authentication required)

**IAM Configuration**:

- API Gateway service account: `doppelganger-gateway-sa@PROJECT_ID.iam.gserviceaccount.com`
- Required role on backend: `roles/run.invoker`

### 3. Backend Engine Service (Cloud Run)

**Repository**: [`doppelganger-engine`](https://github.com/ChrisMahlke/doppelganger-engine)

**Technology Stack**:

- Python 3.x
- Flask (web framework)
- Gunicorn (WSGI server)
- `google-generativeai` (Gemini AI SDK)
- `google-cloud-firestore` (Firestore client)
- `requests` (HTTP client for Census API)
- `flask-cors` (CORS support)

**Deployment Configuration**:

```bash
gcloud run deploy doppelganger-engine \
  --image gcr.io/PROJECT_ID/doppelganger-engine \
  --platform managed \
  --region us-central1 \
  --memory=2Gi \
  --timeout=120s \
  --min-instances=1 \
  --no-allow-unauthenticated
```

**Service Specifications**:

- **Memory**: 2Gi (required for large datasets and AI libraries)
- **CPU**: Default (scales automatically)
- **Timeout**: 120s (allows for Census API + 2x Gemini AI calls)
- **Min Instances**: 1 (eliminates cold starts)
- **Max Instances**: Auto-scales based on traffic
- **Authentication**: IAM only (requires `roles/run.invoker`)

**Environment Variables**:

- `GEMINI_API_KEY`: Gemini API key (from Secret Manager in production)
- `PORT`: Server port (defaults to 8080)
- `GOOGLE_APPLICATION_CREDENTIALS`: Optional (uses Cloud Run service account by default)

**API Endpoint**: `POST /find-twin`

**Request Format**:

```json
{
  "zip_code": "90210"
}
```

**Response Format**:
```json
{
  "demographics": {
    "name": "ZIP Code Tabulation Area 90210",
    "population": 20575,
    "medianIncome": 123456,
    "medianAge": 42.5,
    ...
  },
  "profile": {
    "whoAreWe": "A narrative description...",
    "ourNeighborhood": ["Fact 1", "Fact 2", ...],
    "socioeconomicTraits": ["Trait 1", "Trait 2", ...]
  },
  "doppelgangers": [
    {
      "zipCode": "12345",
      "city": "City Name",
      "state": "CA",
      "similarityReason": "Similar income and education",
      "similarityPercentage": 95.5
    },
    ...
  ]
}
```

### 4. Data Layer

#### Firestore (Caching Layer)

**Collection**: `zip_cache`

**Document ID**: ZIP code (e.g., "90210")

**Document Structure**: Matches API response format


**Cache Strategy**:

- **Read-Through**: Check cache before external API calls
- **Write-Through**: Save results after successful processing
- **Cache Key**: ZIP code string
- **TTL**: No expiration (manual invalidation if needed)
- **Graceful Degradation**: Service continues if Firestore unavailable

**Performance**:

- **Cache Hit**: < 1 second response time
- **Cache Miss**: 20-60 seconds (Census API + 2x Gemini AI calls)

#### U.S. Census Bureau API

**API**: American Community Survey (ACS) 5-Year Estimates

**Data Year**: 2022

**Endpoint**: `https://api.census.gov/data/2022/acs/acs5`

**Data Retrieved**:

- Population demographics
- Income statistics
- Education levels
- Housing characteristics
- Age distribution
- Employment data

**Integration**: Direct HTTP requests using Python `requests` library

#### Gemini AI (Google Generative AI)

**Model**: `gemini-2.5-flash`

**SDK**: `google-generativeai` Python library

**Use Cases**:

1. **Community Profile Generation**: Converts structured demographic data into narrative descriptions
2. **Doppelgänger Matching**: Identifies similar ZIP codes based on demographic similarity

**Configuration**:

- **Response Format**: JSON (enforced via `response_mime_type` and `response_schema`)

- **Temperature**: Default (structured output)

- **API Key**: Stored in environment variables (Secret Manager in production)

## Data Flow Diagrams

### Primary Request Flow (Cache Miss)

```
┌──────────┐
 │  User    │
 │ Browser  │
 └────┬─────┘
      │
      │ 1. POST /find-twin
      │    Headers: x-api-key, Content-Type
      │    Body: {"zip_code": "90210"}
      │
      ▼
┌─────────────────────┐
│  Frontend Service   │
│  (Cloud Run)        │
│  • Validates input  │
│  • Adds API key     │
└────┬────────────────┘
     │
     │ 2. Forward to API Gateway
     │
     ▼
┌─────────────────────┐
│  API Gateway        │
│  • Validates API key│
│  • Checks referrer  │
│  • Generates IAM    │
│    token            │
└────┬────────────────┘
     │
     │ 3. Authenticated request
     │    (IAM service account)
     │
     ▼
┌─────────────────────┐
│  Backend Engine     │
│  (Cloud Run)        │
│                     │
│  4. Check Firestore │
│     Cache           │
└────┬────────────────┘
     │
     │ Cache MISS
     │
     ├─────────────────┐
     │                 │
     ▼                 ▼
┌──────────┐    ┌──────────────┐
│ Census   │    │  Gemini AI   │
│ API      │    │  (2 calls)   │
│          │    │              │
│ 5a. Fetch│    │ 5b. Generate │
│    demo  │    │    profile   │
│    data  │    │ 5c. Find     │
│          │    │    matches   │
└────┬─────┘    └──────┬───────┘
     │                 │
     └────────┬────────┘
              │
              │ 6. Combine results
              │
              ▼
     ┌─────────────────┐
     │  Firestore      │
     │  (Cache)        │
     │                 │
     │  7. Save to     │
     │     cache       │
     └────────┬────────┘
              │
              │ 8. Return response
              │
              ▼
     ┌─────────────────┐
     │  API Gateway    │
     │  (forwards)     │
     └────────┬────────┘
              │
              │ 9. JSON response
              │
              ▼
     ┌─────────────────┐
     │  Frontend       │
     │  (displays)     │
     └─────────────────┘
```

### Cached Request Flow (Cache Hit)

```
┌──────────┐
 │  User    │
 │ Browser  │
 └────┬─────┘
      │
      │ 1. POST /find-twin
      │    {"zip_code": "90210"}
      │
      ▼
┌─────────────────────┐
│  Frontend Service   │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│  API Gateway        │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│  Backend Engine     │
│                     │
│  2. Check Firestore │
│     Cache           │
└────┬────────────────┘
     │
     │ Cache HIT ✓
     │
     ▼
┌─────────────────────┐
│  Firestore          │
│  • Retrieve cached  │
│    document         │
│  • < 1s response    │
└────┬────────────────┘
     │
     │ 3. Return cached data
     │
     ▼
┌─────────────────────┐
│  API Gateway        │
│  → Frontend         │
│  → User             │
└─────────────────────┘

Total Time: < 1 second
```

### CORS Preflight Flow

```
┌──────────┐
│  Browser │
│  (Auto)  │
└────┬─────┘
     │
     │ OPTIONS /find-twin
     │ (CORS preflight)
     │
     ▼
┌─────────────────────┐
│  API Gateway        │
│  • No auth required │
│  • Routes to backend│
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│  Backend Engine     │
│  • Flask-CORS       │
│  • Returns 200 OK   │
│  • CORS headers     │
└────┬────────────────┘
     │
     │ 204 No Content
     │ (with CORS headers)
     │
     ▼
┌─────────────────────┐
│  Browser            │
│  • Validates CORS   │
│  • Sends POST       │
└─────────────────────┘
```

## Security Architecture

### Authentication & Authorization Flow

```
┌─────────────────────────────────────────────────────────────┐
 │                    Security Layers                          │
 └─────────────────────────────────────────────────────────────┘

Layer 1: Frontend → API Gateway
├── Authentication: API Key (x-api-key header)
├── Validation: API Gateway validates key
├── Restrictions:
│   ├── HTTP Referrer: Frontend URL only
│   └── API Target: apigateway.googleapis.com
└── Key Management: Google Cloud Console

Layer 2: API Gateway → Backend Engine
├── Authentication: IAM Service Account
├── Method: Service Account Token (automatic)
├── Permission: roles/run.invoker
├── Service Account: doppelganger-gateway-sa@PROJECT_ID.iam.gserviceaccount.com
└── Backend Config: --no-allow-unauthenticated

Layer 3: Backend Engine → External APIs
├── Gemini API: API Key (environment variable)
├── Census API: Public (no auth required)
└── Firestore: Cloud Run service account (automatic)
```

### IAM Configuration

**API Gateway Service Account**:

- **Name**: `doppelganger-gateway-sa@PROJECT_ID.iam.gserviceaccount.com`
- **Role on Backend**: `roles/run.invoker`
- **Purpose**: Allows API Gateway to invoke private Cloud Run service

**Backend Engine Service Account**:

- **Default**: Cloud Run service account
- **Firestore Access**: Cloud Datastore User role (automatic)
- **Purpose**: Access Firestore for caching

**Granting Permissions**:
```bash
# Get API Gateway service account
GATEWAY_SA=$(gcloud api-gateway gateways describe doppelganger-gateway \
  --location=us-central1 \
  --project=PROJECT_ID \
  --format="value(serviceAccount)")

# Grant permission to invoke backend
gcloud run services add-iam-policy-binding doppelganger-engine \
  --region=us-central1 \
  --member="serviceAccount:${GATEWAY_SA}" \
  --role="roles/run.invoker" \
  --project=PROJECT_ID
```

### API Key Security

**Frontend API Key Configuration**:

- **Storage**: Environment variable (`VITE_API_GATEWAY_KEY`)
- **Restrictions**:
  - **HTTP Referrer**: `https://demographic-doppelganger-71027948544.us-west1.run.app/*`
  - **API Target**: `apigateway.googleapis.com`
- **Management**: Google Cloud Console → APIs & Services → Credentials

**Backend API Keys**:

- **Gemini API Key**: Environment variable (Secret Manager in production)
- **Google Maps API Key**: Frontend only (HTTP referrer restricted)

## Performance Architecture

### Response Time Breakdown

**Cache Hit Scenario**:
```
Frontend Processing:      ~50ms
API Gateway Routing:      ~100ms
Backend Cache Lookup:     ~200ms
Firestore Read:           ~300ms
API Gateway Response:     ~100ms
Frontend Rendering:       ~250ms
───────────────────────────────
Total:                    ~1 second
```

**Cache Miss Scenario**:
```
Frontend Processing:      ~50ms
API Gateway Routing:      ~100ms
Backend Cache Check:      ~200ms (miss)
Census API Call:          ~2-5 seconds
Gemini Profile Call:      ~10-20 seconds
Gemini Doppelganger Call: ~10-20 seconds
Firestore Write:          ~300ms
API Gateway Response:     ~100ms
Frontend Rendering:       ~250ms
───────────────────────────────
Total:                    20-60 seconds
```

### Caching Strategy

**Cache Key Design**:

- **Key**: ZIP code string (e.g., "90210")
- **Collection**: `zip_cache`
- **Document Structure**: Complete API response

**Cache Invalidation**:

- **Current**: Manual (no TTL)
- **Future**: Could implement TTL for data freshness

**Cache Performance**:

- **Hit Rate**: High for popular ZIP codes
- **Storage**: Firestore (scalable, managed)
- **Cost**: Minimal (Firestore free tier covers most usage)

### Cloud Run Configuration Impact

**Min Instances = 1**:

- **Benefit**: Zero cold starts
- **Cost**: Always-on instance (~$0.10/hour)
- **Trade-off**: Higher baseline cost, instant response

**Memory = 2Gi**:

- **Requirement**: Large datasets + AI libraries
- **Previous Issue**: Out of Memory errors at 512Mi
- **Solution**: Scaled to 2Gi

**Timeout = 120s**:

- **Requirement**: Census API + 2x Gemini AI calls
- **Previous Issue**: Worker timeout at 60s
- **Solution**: Increased to 120s (matches API Gateway deadline)

## Deployment Architecture

### Repository Structure

```
doppelganger/              # Frontend (React/TypeScript)
├── src/
│   ├── App.tsx           # Main application
│   ├── components/       # UI components
│   └── utils/            # API helpers, data processing
├── public/
├── package.json
├── vite.config.ts
└── Dockerfile

doppelganger-engine/       # Backend (Python/Flask)
├── main.py               # Flask application
├── requirements.txt      # Python dependencies
└── Dockerfile

api-gateway-spec/         # API Gateway Configuration
├── openapi.yaml          # OpenAPI 2.0 specification
└── README.md

doppelganger-api/         # Legacy Node.js Gateway (Deprecated)
├── index.js              # Express application
├── package.json
└── Dockerfile
```

### Deployment Flow

```
┌─────────────────────────────────────────────────────────────┐
 │                    Deployment Process                       │
 └─────────────────────────────────────────────────────────────┘

1. Frontend Deployment
   ├── Source: Google AI Studio
   ├── Build: Vite production build
   ├── Container: Docker image
   └── Deploy: Cloud Run (us-west1)

2. Backend Deployment
   ├── Build: gcloud builds submit
   ├── Container: gcr.io/PROJECT_ID/doppelganger-engine
   └── Deploy: Cloud Run (us-central1)
       ├── --memory=2Gi
       ├── --timeout=120s
       ├── --min-instances=1
       └── --no-allow-unauthenticated

3. API Gateway Deployment
   ├── Config: openapi.yaml
   ├── Create: gcloud api-gateway api-configs create
   └── Deploy: gcloud api-gateway gateways update

4. IAM Configuration
   └── Grant: roles/run.invoker to API Gateway service account
```

## Network Architecture

### Request Routing

```
Internet
  │
  ├─→ Frontend (Cloud Run)
  │   └─→ API Gateway (Managed Service)
  │       └─→ Backend Engine (Cloud Run, Private)
  │           ├─→ Firestore (Same Project)
  │           ├─→ Census API (External)
  │           └─→ Gemini AI (External)
```

### Service Communication

**Frontend ↔ API Gateway**:

- **Protocol**: HTTPS
- **Authentication**: API Key (x-api-key header)
- **CORS**: Handled by API Gateway and backend

**API Gateway ↔ Backend Engine**:

- **Protocol**: HTTPS
- **Authentication**: IAM Service Account Token
- **Method**: Automatic token generation by API Gateway
- **Network**: Google Cloud internal network (optimized)

**Backend Engine ↔ Firestore**:

- **Protocol**: gRPC (Firestore client library)
- **Authentication**: Cloud Run service account
- **Network**: Google Cloud internal network

**Backend Engine ↔ External APIs**:

- **Census API**: HTTPS (public endpoint)
- **Gemini AI**: HTTPS (authenticated with API key)

## Error Handling & Resilience

### Error Scenarios

**1. API Key Invalid**:
```
Frontend → API Gateway → 403 Forbidden
Response: {"error": "Invalid API key"}
```

**2. Backend Service Unavailable**:
```
Frontend → API Gateway → Backend Engine → 503 Service Unavailable
Response: {"error": "Service temporarily unavailable"}
```

**3. Cache Unavailable**:
```
Backend Engine → Firestore → Error
Behavior: Graceful degradation, continues without cache
```

**4. Census API Failure**:

```
Backend Engine → Census API → Error
Response: 404 Not Found
Message: "No demographic data found for ZIP code"
```

**5. Gemini AI Failure**:

```
Backend Engine → Gemini AI → Error
Response: 500 Internal Server Error
Message: "Failed to generate profile" or "Failed to find doppelgangers"
```

### Resilience Patterns

- **Graceful Degradation**: Firestore cache failures don't break the service
- **Timeout Handling**: 120s timeout prevents indefinite hangs
- **Error Propagation**: Clear error messages returned to frontend
- **Retry Logic**: Not implemented (could be added for external APIs)

## Monitoring & Observability

### Logging

**Frontend**:

- Browser console logs
- Network request logging
- Error boundary logging

**API Gateway**:

- Google Cloud Logging (automatic)
- Request/response logging
- Error logging

**Backend Engine**:

- Python logging module
- Cloud Run logs (stdout/stderr)
- Structured logging for:
  - Cache hits/misses
  - API call durations
  - Error details

### Metrics

**Cloud Run Metrics** (Automatic):

- Request count
- Request latency
- Error rate
- Instance count
- CPU utilization
- Memory utilization

**Custom Metrics** (Potential):

- Cache hit rate
- API call durations
- Gemini AI call success rate
- Census API call success rate

## Cost Optimization

### Current Optimizations

1. **Firestore Caching**: Reduces API calls by 99%+ for repeated requests
2. **Min Instances = 1**: Prevents cold starts but increases baseline cost
3. **On-Demand AI**: User must explicitly request AI analysis
4. **Efficient Data Structures**: Minimal data transfer

### Cost Breakdown (Estimated)

**Cloud Run**:

- Frontend: ~$0.10/hour (min instance) + request costs
- Backend: ~$0.10/hour (min instance) + request costs

**API Gateway**:

- Per-request pricing
- No base cost

**Firestore**:

- Free tier: 1GB storage, 50K reads/day, 20K writes/day
- Most usage covered by free tier

**Gemini AI**:

- Per-token pricing
- Reduced by caching

## Scalability Considerations

### Horizontal Scaling

**Frontend**:

- Cloud Run auto-scales based on traffic
- Stateless design enables easy scaling

**Backend Engine**:

- Cloud Run auto-scales based on traffic
- Min instances = 1 ensures availability
- Max instances: Auto (no limit)

**API Gateway**:

- Managed service, scales automatically
- No configuration needed

**Firestore**:

- Fully managed, scales automatically
- No configuration needed

### Vertical Scaling

**Backend Engine**:

- Memory: 2Gi (fixed, could increase if needed)
- CPU: Auto-scales with memory allocation

### Bottlenecks

**Current**:

- Gemini AI API rate limits (not encountered yet)
- Census API rate limits (not encountered yet)
- Firestore read/write limits (free tier sufficient)

**Potential**:

- Concurrent AI requests (could implement queue)
- Large ZIP code datasets (optimized data structures)

## Future Architecture Considerations

### Planned Enhancements

1. **Temporal Analysis**: Multi-year Census data for trend analysis
2. **Rate Limiting**: API Gateway rate limiting configuration
3. **Monitoring**: Custom metrics and alerting
4. **Caching TTL**: Implement cache expiration for data freshness

### Potential Improvements

1. **CDN**: Cloud CDN for frontend static assets
2. **Load Balancing**: Multi-region deployment
3. **Queue System**: Cloud Tasks for async AI processing
4. **Database**: Consider Cloud SQL for complex queries (if needed)

## Technical Specifications Summary

| Component | Technology | Deployment | Configuration |
|-----------|-----------|------------|---------------|
| Frontend | React/TypeScript | Cloud Run (us-west1) | Auto-scaling |
| API Gateway | Google API Gateway | Managed (us-central1) | OpenAPI 2.0 spec |
| Backend Engine | Python/Flask | Cloud Run (us-central1) | 2Gi RAM, 120s timeout, min-instances=1 |
| Cache | Firestore | Managed | Collection: zip_cache |
| AI Model | Gemini 2.5 Flash | API | JSON response format |
| Data Source | U.S. Census ACS | External API | 2022 5-Year Estimates |

## References

- **Frontend Repository**: [doppelganger](https://github.com/ChrisMahlke/doppelganger)
- **Backend Engine Repository**: [doppelganger-engine](https://github.com/ChrisMahlke/doppelganger-engine)
- **API Gateway Specification**: [api-gateway-spec](https://github.com/ChrisMahlke/api-gateway-spec)
- **Legacy Node.js API**: [doppelganger-api](https://github.com/ChrisMahlke/doppelganger-api) (Deprecated)
- **Live Application**: [https://demographic-doppelganger-71027948544.us-west1.run.app/](https://demographic-doppelganger-71027948544.us-west1.run.app/)

## Document Version

**Version**: 1.1.0  
**Last Updated**: Nov 06, 2025  
**Author**: Chris Mahlke

