<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# **Demographic Doppelgänger**

<p align="center">
  <img src="https://img.shields.io/badge/Google_Cloud_Run-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white" alt="Google Cloud Run">
  <img src="https://img.shields.io/badge/API_Gateway-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white" alt="Google API Gateway">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/Firestore-FFCA28?style=for-the-badge&logo=googlecloud&logoColor=black" alt="Firestore">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License: MIT">
</p>

**Demographic Doppelgänger** is a full-stack web application that allows users to explore the demographic "DNA" of any U.S. ZIP code and then, on-demand, use Gemini to find its "twin" elsewhere in the country.

It combines a client-side frontend deployed from **Google AI Studio** with a decoupled microservice backend. The backend consists of **Google API Gateway** as the public-facing entry point, which routes requests to a private **Python** "engine" service. This engine orchestrates calls to the U.S. Census and Google Gemini, with all results cached in **Firestore** for production-grade speed and efficiency.

## **Live Application**

**Try the application:** [https://demographic-doppelganger-71027948544.us-west1.run.app/](https://demographic-doppelganger-71027948544.us-west1.run.app/)

The application is deployed and running on Google Cloud Run. Explore any U.S. ZIP code to discover its demographic profile and find similar communities across the country!

## **Architecture Documentation**

For detailed technical architecture documentation, including diagrams, data flows, and component specifications, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## **Inspiration**

Every community has a character shaped by its people and economy, but what if there's another place across the country with nearly identical traits?
The idea of a *"place doppelgänger"* came from that curiosity. By architecting a scalable backend service to orchestrate U.S. Census data and the Google Gemini LLM, we wanted to build a tool that transforms demographics into a story, helping users discover surprising similarities between distant communities.

## **Core Features**

* **On-Demand AI Analysis**:
    The core user flow is a deliberate, two-step process. First, the application fetches and displays only the raw demographic data for a ZIP code. Only when the user clicks the "Get AI Insights" button does the frontend call the backend service to perform the powerful (and cost-incurring) AI analysis.

* **High-Speed Caching with Firestore**:
    The backend engine automatically caches all Census and AI-generated results in a **Firestore** database. Subsequent requests for a previously-searched ZIP code are served instantly (sub-second) from the cache, bypassing all expensive API calls, saving money, and providing a vastly improved user experience.

* **Geospatial Visualization**:
    The frontend uses the **Google Maps JavaScript API** to render precise ZIP code boundaries. When a doppelgänger is selected, it's displayed alongside the original, connected by a geodesic line to visualize the link between demographically similar but geographically distant places.

* **AI-Powered Backend Microservices**:
    A secure, multi-service backend provides the application's "brains." **Google API Gateway** acts as the public-facing "front door," handling authentication, rate limiting, and request routing. It forwards requests to a **private Python engine service** which does the heavy lifting: fetching Census data, building prompts, and calling the Gemini API to generate profiles and find doppelgänger ZIPs.

* **UI/UX**:

  * **Engaging Load State**: Instead of a generic spinner, a "Knowledge Carousel" displays fascinating, rotating facts to keep the user engaged while waiting for AI results, complete with a cancel button.
  * **Custom Animated Markers**: Selected points of interest are highlighted with a custom, pulsating map marker and a "frosted glass" `InfoWindow` that provides at-a-glance demographic context.

* **Accurate Local Context**:
    The frontend uses the **Google Places API** and performs a precise point-in-polygon check to display accurate, relevant points of interest that are guaranteed to be within the ZIP code's true boundary.

## **Technical Architecture Overview**

### **High-Level Design**

The application follows a modern **multi-service architecture**, with a clean separation between the frontend, a public-facing API Gateway, and a private compute engine. All backend services are containerized and deployed independently on **Google Cloud Run**.

```
+------------------------------------------+
|          Web Browser (User)              |
| (Frontend deployed from AI Studio)       |
| (URL: ...demographic-doppelg-nger...)    |
+--------------------+---------------------+
                     |
(1. HTTPS Request)   (POST /find-twin with x-api-key header)
                     |
+--------------------v---------------------+
|   GOOGLE API GATEWAY (Public Entry)      |
|------------------------------------------|
| - Service: `doppelganger-gateway`        |
| - Handles API key authentication         |
| - Manages CORS preflight requests        |
| - Routes to backend with IAM auth        |
| - 120s timeout for long-running requests |
+--------------------+---------------------+
                     |
(2. Authenticated Request via IAM)
                     |
+--------------------v---------------------+  <--(3. Check Cache)--+
|  PRIVATE ENGINE SERVICE (Cloud Run)      |                       |
|------------------------------------------|                       |
| - Service: `doppelganger-engine` (Python)|                       |
| - Tuned: 2Gi RAM, 120s Timeout, 1 Min    |                       |
|   Instance (for 0 cold starts)           |                       |
| - **NO** public internet access          |                       |
| - Requires authentication (IAM roles)    |                       |
+--------------------+---------------------+                       |
                     |                                             |
          (4. Cache Miss: Fetch Data)                              |
                     |                                             v
+--------------------v---------------------+           +----------------------+
|                |                 |                   |   DATABASE (Cache)   |
| (5a. Census)   | (5b. Gemini AI) |                   |     (Firestore)      |
v                v                 |                   |     (Collection:     |
+------------+   +-------------+   |                   |     'zip_cache')     |
| U.S. Census|   | Gemini API  |   |                   +----------^-----------+
| API        |   | (via Secret |   |                              |
|            |   |  Manager)   |   |                    (7. Return Cached Data)
+------------+   +-------------+   |                              |
                     |             |                    +--------------------+
                     |             +------------------------------|
                     |
                     '----(6. Save to Cache)
```

### **Detailed Architecture Flow**

1. **Frontend Request**:
   * User clicks "Get AI Insights" button in the React frontend
   * Frontend sends POST request to API Gateway with `x-api-key` header
   * Request includes ZIP code in JSON body

2. **API Gateway Processing**:
   * Google API Gateway validates the API key
   * Handles CORS preflight (OPTIONS) requests automatically
   * Authenticates itself to Cloud Run using IAM service account
   * Forwards request to private Python engine with 120-second timeout

3. **Python Engine Processing**:
   * **Cache Check**: First checks Firestore for cached results
   * **Cache Hit**: Returns cached data immediately (< 1 second)
   * **Cache Miss**: Proceeds with data fetching:
     * Fetches demographic data from U.S. Census Bureau API
     * Generates community profile using Gemini AI
     * Finds similar ZIP codes (doppelgangers) using Gemini AI
     * Caches results in Firestore for future requests
     * Returns combined results

4. **Response Flow**:
   * Python engine returns JSON response
   * API Gateway forwards response to frontend
   * Frontend displays results on the map

## **Setup & Configuration**

### **Environment Variables**

Create a `.env.local` file in the root directory with the following variables:

```bash
# Google Maps API Key
# Get your API key from: https://console.cloud.google.com/apis/credentials
# Restrict this key to specific HTTP referrers (your frontend URL)
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here

# API Gateway Configuration
# Your Google API Gateway endpoint URL
VITE_API_GATEWAY_URL=https://your-gateway-name.gateway.dev/find-twin

# API Gateway API Key
# Get your API key from Google Cloud Console → APIs & Services → Credentials
# This key is used to authenticate requests to the API Gateway
VITE_API_GATEWAY_KEY=your-api-gateway-key-here
```

### **Local Development**

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Create `.env.local` file:**

   ```bash
   cp .env.example .env.local  # If .env.example exists
   # Then edit .env.local with your actual keys
   ```

3. **Run development server:**

   ```bash
   npm run dev
   ```

4. **Build for production:**

   ```bash
   npm run build
   ```

## **How We Built It**

* **Frontend Service**: Deployed from Google AI Studio

  * **UI Library**: React / TypeScript base with Material-UI (MUI).
  * **Map Visualization**: Google Maps JavaScript, Geocoding, and Places APIs (with Geometry library).
  * **Deployment**: Deployed as a service on **Google Cloud Run** directly from the **Google AI Studio** platform.
  * **Security**: The Google Maps API Key is restricted via **HTTP Referrer** to *only* accept requests from the deployed application's URL.
  * **API Gateway Integration**: Frontend includes API Gateway API key in `x-api-key` header for all backend requests.
  * **Environment Variables**: All API keys and URLs are loaded from environment variables for security.

* **API Gateway**: Google Cloud API Gateway

  * **Service Name**: `doppelganger-gateway`
  * **Role**: The public-facing "front door" that provides enterprise-grade API management.
  * **Configuration**: Defined via OpenAPI 2.0 specification (see `api-gateway-spec` repository)
  * **Features**:
    * **API Key Authentication**: Requires valid API key in `x-api-key` header
    * **CORS Handling**: Automatically handles OPTIONS preflight requests
    * **Request Routing**: Routes requests to private Cloud Run service
    * **IAM Authentication**: Uses service account to authenticate to backend
    * **Timeout Management**: Configured with 120-second deadline for long-running requests
  * **Deployment**: Managed service on Google Cloud Platform
  * **Security**: API keys are managed through Google Cloud Console with restrictions (referrer, API targets)

* **Backend Engine Service**: Python + Flask

  * **Service Name**: `doppelganger-engine` | [public repo](https://github.com/ChrisMahlke/doppelganger-engine)
  * **Role**: The private, secure "brains" of the operation.
  * **Features**:
    * **Caching**: Connects to **Firestore** to implement a read-through/write-through cache, drastically improving performance.
    * **AI Integration**: Calls the Google Gemini API (using a key from **Secret Manager**) to generate profiles and find doppelgangers.
    * **Data Source**: Calls the U.S. Census Bureau's ACS API using the `requests` library.
    * **CORS Support**: Handles CORS preflight requests for cross-origin browser access.
  * **Deployment**: Deployed as a **private (requires authentication)** service on Cloud Run, tuned for performance:
    * `--memory=2Gi`: To handle large data and AI model libraries.
    * `--timeout=120s`: To allow Gunicorn time for complex, long-running Gemini requests.
    * `--min-instances=1`: To eliminate "cold starts" and ensure the app is always fast and responsive for the first user.
    * `--no-allow-unauthenticated`: Requires IAM authentication, ensuring only the API Gateway can invoke it.

## **Technical Highlights & Challenges**

* **Full-Stack Microservices with API Gateway**:
    Successfully designed a complete three-part system (Frontend, API Gateway, Engine), demonstrating a cloud-native architecture with enterprise-grade API management.

* **Secure Service-to-Service Communication**:
    The API Gateway calls the Python engine using IAM-based authentication. The API Gateway service account has the `roles/run.invoker` permission on the Python service, ensuring the engine is completely protected from the public internet while still being accessible to the gateway.

* **API Key Management**:
    Implemented API key authentication through Google Cloud API Gateway, with keys restricted to specific referrers and API targets. This provides a secure, scalable authentication mechanism without requiring user accounts.

* **CORS Handling**:
    Configured API Gateway to handle CORS preflight requests (OPTIONS) without requiring authentication, while still requiring API keys for actual data requests. This enables seamless cross-origin browser access.

* **Performant Caching & Performance Tuning**:
    By implementing a Firestore cache, we solved a major performance and cost bottleneck. We also diagnosed and solved real-world production issues, including `Out of Memory` errors (fixed by scaling to 2Gi) and `Worker Timeout` errors (fixed by configuring a 120s Gunicorn timeout). The API Gateway timeout is configured to match the backend timeout.

* **User-Centric On-Demand Architecture**:
    A key challenge was refining the data flow. We intentionally moved from a single, automatic API call to a two-step process where the user explicitly requests AI analysis. This respects user intent and provides a more efficient, cost-effective solution.

* **Robust Asynchronous Handling**:
    The on-demand AI fetch is fully cancellable using an `AbortController`, a modern web standard that ensures network requests can be cleanly terminated by the user, showcasing robust async control flow.

## **Accomplishments**

* **Production-Grade Architecture**:
    Built a decoupled, scalable, and maintainable system that mirrors professional-grade software development practices, using enterprise API Gateway patterns.

* **Delightful User Experience**:
    Transformed standard UI elements, like loading states and map markers, into engaging, animated, and contextually rich components that enhance the user journey.

* **Humanized Data Storytelling**:
    The application transforms impersonal datasets into accessible narratives that help users connect with places on a deeper level.

## **Key Learnings**

* **LLMs as a Backend Engine**:
    Large language models can serve as a powerful computation and analysis layer. Our Python service acts as a true "engine," interpreting structured data, performing fuzzy similarity analysis, and generating natural-language insights.

* **The Power of API Gateway Architecture**:
    Using Google API Gateway provides enterprise-grade features like API key management, rate limiting, and request routing without building custom infrastructure. This decoupling allows us to tune the Python engine (2Gi RAM, 120s timeout) for heavy compute, while the gateway handles security and routing.

* **Cloud Run for Full-Stack Development**:
    Cloud Run is an incredibly powerful platform for deploying both user-facing web apps and complex, multi-service backend APIs, making it an ideal choice for full-stack serverless development.

* **IAM-Based Service Authentication**:
    Using IAM roles for service-to-service authentication provides a secure, scalable alternative to API keys or tokens, ensuring services can only communicate with authorized partners.

## **Security Architecture**

* **API Gateway Authentication**:
  * All requests require a valid API key in the `x-api-key` header
  * API keys are restricted to specific referrers (frontend URL) and API targets
  * Keys are managed through Google Cloud Console

* **Backend Service Security**:
  * Python engine service requires IAM authentication (no public access)
  * Only the API Gateway service account has permission to invoke the engine
  * All secrets (Gemini API key) are stored in Google Secret Manager

* **CORS Configuration**:
  * OPTIONS requests are handled without authentication (required for CORS preflight)
  * POST requests require API key authentication
  * Frontend URL is whitelisted via API key referrer restrictions

## **Next Steps**

1. **DONE: Cache Backend Responses**:
    The backend engine now successfully uses **Firestore** as a high-speed caching layer to store results for frequently requested ZIP codes, reducing latency and API costs.

2. **DONE: API Gateway Integration**:
    Migrated from Node.js API service to Google API Gateway for enterprise-grade API management, authentication, and routing.

3. **Add Temporal Analysis**:
    Enhance the backend to fetch multi-year ACS data to allow the AI to analyze how a community's demographics have evolved over time.

4. **"Anti-Doppelgänger" Search**:
    Introduce a new backend endpoint (and corresponding Python logic) to find ZIP codes that are *most different* demographically.

5. **Rate Limiting**:
    Configure API Gateway rate limiting to protect against abuse and manage costs.

## **Project Repository Structure**

This is a **multi-repository project** with the following components:

### **Core Repositories**

* **Frontend** (This Repository): [`doppelganger`](https://github.com/ChrisMahlke/doppelganger) - React/TypeScript frontend application
  * Live Application: [https://demographic-doppelganger-71027948544.us-west1.run.app/](https://demographic-doppelganger-71027948544.us-west1.run.app/)
  * UI components, map visualization, and user interaction

* **Backend Engine**: [`doppelganger-engine`](https://github.com/ChrisMahlke/doppelganger-engine) - Python Flask service
  * Handles Census data fetching, AI analysis, and Firestore caching
  * [README](https://github.com/ChrisMahlke/doppelganger-engine/blob/master/README.md) - Detailed service documentation

* **API Gateway Specification**: [`api-gateway-spec`](https://github.com/ChrisMahlke/api-gateway-spec) - OpenAPI 2.0 specification
  * Defines the API Gateway configuration and routes
  * [README](https://github.com/ChrisMahlke/api-gateway-spec/blob/master/README.md) - Gateway deployment and configuration guide

### **Legacy/Reference Repository**

* **Node.js API Gateway** (Deprecated): [`doppelganger-api`](https://github.com/ChrisMahlke/doppelganger-api) - Node.js Express service
  * Previously used as the API gateway (now replaced by Google API Gateway)
  * Kept for reference or alternative deployment scenarios
  * [README](https://github.com/ChrisMahlke/doppelganger-api/blob/master/README.md) - Service documentation

### **How the Repositories Work Together**

```
┌─────────────────────────────────────────────────────────────────────┐
│  Frontend (doppelganger)                                            │
│  https://demographic-doppelganger-71027948544.us-west1.run.app/     │
│  .run.app/                                                          │
└──────────────────┬──────────────────────────────────────────────────┘
                   │
                   │ API Requests (with x-api-key)
                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  API Gateway (api-gateway-spec)                                     │
│  OpenAPI Specification → Google Cloud API Gateway                   │
└──────────────────┬──────────────────────────────────────────────────┘
                   │
                   │ IAM Authentication
                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Backend Engine (doppelganger-engine)                               │
│  Python Flask → Census API + Gemini AI + Firestore                  │
└─────────────────────────────────────────────────────────────────────┘
```

## **Related Documentation**

* **Live Application**: [https://demographic-doppelganger-71027948544.us-west1.run.app/](https://demographic-doppelganger-71027948544.us-west1.run.app/)
* **API Gateway Spec**: [api-gateway-spec](https://github.com/ChrisMahlke/api-gateway-spec) - OpenAPI 2.0 spec and deployment guide
* **Backend Engine**: [doppelganger-engine](https://github.com/ChrisMahlke/doppelganger-engine) - Python service documentation
* **Node.js API** (Deprecated): [doppelganger-api](https://github.com/ChrisMahlke/doppelganger-api) - Reference implementation
