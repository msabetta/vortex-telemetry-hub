export interface TelemetryMetrics {
  timestamp: string;
  throughput: number;
  latency: number;
  ozoneUsage: number;
  kafkaLag: number;
  flinkProcessingRate: number;
  errors: number;
  activeSensors: number;
}

export type PipelineNode = 'INGEST' | 'KAFKA' | 'FLINK' | 'OZONE';
