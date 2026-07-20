import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

// Configure the SDK to export traces to an OTLP endpoint (e.g. Jaeger, Honeycomb, Datadog)
const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    // Optional: Configure your endpoint here, or use OTEL_EXPORTER_OTLP_ENDPOINT env var
    // url: 'http://localhost:4318/v1/traces'
  }),
  instrumentations: [getNodeAutoInstrumentations()]
});

// Start the SDK and gracefully shutdown on exit
sdk.start();

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
