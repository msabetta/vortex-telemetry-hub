# Vortex Telemetry Hub 🌪️

[![license](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![build](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![version](https://img.shields.io/badge/version-0.1.0-blue)](#)

Vortex is a high-performance telemetry ingestion pipeline and monitoring dashboard. It simulates a massive-scale data architecture designed for IoT and industrial telemetry, processing hundreds of thousands of events per second with low latency and high reliability.

Short purpose: Provide a local, full-stack simulation of a large-scale telemetry pipeline (ingest → stream → storage → AI diagnostics) so engineering and SRE teams can test scale, diagnose issues, and visualize topology in real time.

Table of Contents
- Architecture Overview
- Key Features
- Tech Stack
- Getting Started
  - Prerequisites
  - Installation
  - Environment Variables
  - Run Locally
- Usage / Examples
- Security & Compliance
- Roadmap
- Contributing
- Running Tests
- License
- Authors & Acknowledgements


Badges

Place important badges near the top so visitors see build status, license, and latest version quickly:

[![license](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE) [![build](https://img.shields.io/badge/build-passing-brightgreen)](#) [![version](https://img.shields.io/badge/version-0.1.0-blue)](#)

## 🚀 Key Features

- Real-time Visualization: Live updates via Socket.io for immediate visibility into pipeline health.
- AI Diagnostics: One-click performance analysis using Google Gemini to identify scaling bottlenecks.
- Technical Dashboard: Industrial-grade UI with high-density metrics, trend analysis, and topological pipeline visualization.
- Performance Metrics: Continuous tracking of throughput (OPS/S), end-to-end latency (MS), and Kafka consumer lag.
- Full-Stack Simulation: An Express-powered backend that mimics production data flows and failure modes.

Example: Use the dashboard to simulate bursts of sensor traffic and observe latency/lag metrics and AI-suggested remediation steps.

## 💻 Tech Stack

- Frontend: React 19, Tailwind CSS 4, Motion/React, Recharts.
- Backend: Node.js (Express), Socket.io for realtime websocket streams.
- Stream: Kafka (simulated in the full-stack demo).
- Processing: Flink (architecture integration).
- Storage: Apache Ozone (Hadoop-compatible object store).
- AI: Google Generative AI (Gemini 2.0 Flash).
- Deployment: Vercel, Cloud Run (optimized builds and container configuration).

Links & resources:
- Kafka: https://kafka.apache.org/
- Flink: https://flink.apache.org/
- Ozone: https://hadoop.apache.org/ozone/
- Google Generative AI (Gemini): https://developers.generativeai.google/

## 🏗️ Architecture Overview

The system follows a classic big-data ingestion pattern optimized for high-throughput and fault tolerance:

1.  Ingestion Layer: High-velocity sensor data simulators generating thousands of messages/sec.
2.  Streaming Bus (Kafka): Acts as the distributed commit log to decouple ingestion from processing, providing backpressure handling.
3.  Stream Processing (Flink): Real-time windowing and aggregation engine for complex event processing.
4.  Storage Engine (Ozone): High-density object storage (Hadoop-compatible) for long-term persistence of telemetry data.
5.  Intelligence Layer (Gemini AI): Integrated SRE assistant for automated log analysis and performance diagnostics.

### Event Flow Sequence

```mermaid
sequenceDiagram
    participant S as Simulator / IoT Device
    participant K as Kafka Bus
    participant F as Flink Processor
    participant O as Ozone Storage
    participant D as Dashboard (UI)
    participant G as Gemini AI

    S->>K: Produce Raw Telemetry (Avro/Proto)
    K->>F: Consume Stream
    F->>F: Aggregate / Filter / Window
    F->>O: Commit Persistent Block
    F->>D: Push Live Metrics (Socket.io)
    D->>G: Request Health Diagnostic
    G-->>D: Return AI Insights
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (v20+)
- npm (or pnpm/yarn)
- Optional (for full-scale testing): Docker & Docker Compose, local Kafka stack, or cloud Kafka provider
- A Google AI Studio API Key (set as GEMINI_API_KEY)

### Installation
1. Clone the repository

```bash
git clone https://github.com/msabetta/vortex-telemetry-hub.git
cd vortex-telemetry-hub
```

2. Install dependencies

```bash
npm install
```

3. Create a .env file (see Environment Variables below)

4. Start the development server

```bash
npm run dev
```

Common scripts (add these to package.json if not present):
- npm run dev — start a hot-reloading dev server
- npm run build — build for production
- npm start — run the production server
- npm test — run test suite
- npm run lint — lint codebase

Environment Variables

Create a .env in the project root. Example:

```bash
# .env
NODE_ENV=development
PORT=3000
GEMINI_API_KEY=your-google-gemini-api-key
KAFKA_BROKER=localhost:9092
OZONE_ENDPOINT=http://localhost:9862
```

Notes:
- GEMINI_API_KEY: required for AI diagnostics. Keep it secret — do not commit to git.
- KAFKA_BROKER/OZONE_ENDPOINT: only required if you run the integrations locally or point to a test cluster.

Run Locally

To run the app locally for development:

1. Ensure prerequisites and .env are set.
2. Install packages (npm install).
3. Start the app:

```bash
npm run dev
```

If using Docker (example):

```bash
docker-compose up --build
```

(Provide a docker-compose.yml that brings up Kafka, Zookeeper, and a minimal Ozone or S3-compatible store if you want full pipeline simulation.)

Usage / Examples

Frontend:
- Open http://localhost:3000 to view the dashboard.
- Use the simulator controls to generate bursts and observe metrics.

Programmatic example (emit a simulated event to the ingest endpoint):

```bash
curl -X POST http://localhost:3000/api/simulate -H "Content-Type: application/json" -d '{"deviceId":"dev-1","metric":42.7}'
```

Example WebSocket (Socket.io) client snippet (Node):

```js
const io = require('socket.io-client');
const socket = io('http://localhost:3000');
socket.on('connect', () => console.log('connected'));
socket.on('telemetry', (data) => console.log('telemetry', data));
```

If the project exposes other API endpoints, document them in /docs/api.md or a dedicated API Reference section.

## 🔒 Security & Compliance

- Authentication: Integrated for secure access to the diagnostic hub.
- Authorization: Layered RBAC (Role-Based Access Control) simulated for engineering, operations, and audit teams.
- Serialization: Designed for optimized network traffic using simulated Avro/Protobuf patterns.

Recommendations:
- Store secrets in environment variables or a secrets manager (Vault, GCP Secret Manager).
- Add an audit log for sensitive actions.
- Provide instructions for rotating GEMINI_API_KEY and other credentials.

## 📈 Roadmap
- Integration with physical IoT gateways via MQTT.
- Predictive failure modeling using historical telemetry trends.
- Kubernetes Operator for automated scaling of Flink task managers.

If you'd like to contribute roadmap items, open an issue with 'roadmap' label and describe the feature and motivation.

Contributing

Thanks for considering contributing! A minimal contributing guide:

1. Fork the repo and create a feature branch (feature/my-feature).
2. Run tests and linting locally.
3. Open a PR with a clear description, screenshots (if UI change), and linked issue.
4. Follow commit message conventions and ensure CI passes.

Add a CONTRIBUTING.md describing branching model, PR expectations, code style, and how to run the test suite locally.


Authors & Acknowledgements

- Project created by: msabetta / QuantumFlux
- Built with ❤️ for high-performance engineering teams.

Support

For questions or feedback, open an issue or contact the maintainers via the project email/contact link. Add a SUPPORT.md if you provide paid or prioritized support tiers.

Appendix / Resources

- Architecture diagram: /docs/architecture.png
- API reference: /docs/api.md
- Deployment guides: /docs/deploy.md
- External resources and references (Kafka, Flink, Ozone, Gemini) with links included in the Tech Stack section.