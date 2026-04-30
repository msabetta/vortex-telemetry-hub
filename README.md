# Vortex Telemetry Hub 🌪️

Vortex is a high-performance telemetry ingestion pipeline and monitoring dashboard. It simulates a massive-scale data architecture designed for IoT and industrial telemetry, processing hundreds of thousands of events per second with low latency and high reliability.

## 🏗️ Architecture Overview

The system follows a classic big-data ingestion pattern optimized for high-throughput and fault tolerance:

1.  **Ingestion Layer**: High-velocity sensor data simulators generating thousands of messages/sec.
2.  **Streaming Bus (Kafka)**: Acts as the distributed commit log to decouple ingestion from processing, providing backpressure handling.
3.  **Stream Processing (Flink)**: Real-time windowing and aggregation engine for complex event processing.
4.  **Storage Engine (Ozone)**: High-density object storage (Hadoop-compatible) for long-term persistence of telemetry data.
5.  **Intelligence Layer (Gemini AI)**: Integrated SRE assistant for automated log analysis and performance diagnostics.

## 🚀 Key Features

-   **Real-time Visualization**: Live updates via Socket.io for immediate visibility into pipeline health.
-   **AI Diagnostics**: One-click performance analysis using Google Gemini to identify scaling bottlenecks.
-   **Technical Dashboard**: Industrial-grade UI with high-density metrics, trend analysis, and topological pipeline visualization.
-   **Performance Metrics**: Continuous tracking of throughput (OPS/S), end-to-end latency (MS), and Kafka consumer lag.
-   **Full-Stack Simulation**: An Express-powered backend that mimics production data flows and failure modes.

## 💻 Tech Stack

-   **Frontend**: React 19, Tailwind CSS 4, Motion/React, Recharts.
-   **Backend**: Node.js (Express), Socket.io (for real-time websocket streams).
-   **AI**: Google Generative AI (Gemini 2.0 Flash).
-   **Deployment**: Optimized for Vercel and Cloud Run.

## 🛠️ Getting Started

### Prerequisites
- Node.js (v20+)
- A Google AI Studio API Key (set as `GEMINI_API_KEY` in your environment)

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🔒 Security & Compliance

-   **Authentication**: Integrated for secure access to the diagnostic hub.
-   **Authorization**: Layered RBAC (Role-Based Access Control) simulated for engineering, operations, and audit teams.
-   **Serialization**: Designed for optimized network traffic using simulated Avro/Protobuf patterns.

## 📈 Roadmap
- [ ] Integration with physical IoT gateways via MQTT.
- [ ] Predictive failure modeling using historical telemetry trends.
- [ ] Kubernetes Operator for automated scaling of Flink task managers.

---
*Built with ❤️ for high-performance engineering teams.*
