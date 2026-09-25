# ELK Stack (Elasticsearch · Logstash · Kibana)

## 1. Overview

### A. Definition
> An open-source log-analysis stack that **collects large volumes of log and event data (Logstash/Beats) → indexes and searches (Elasticsearch) → visualizes (Kibana)**; including the lightweight collector Beats, it is called the **Elastic Stack**.

ELK is a name taken from the initials of three open-source projects, but its essence is a pipeline that "**turns unstructured logs into a searchable structure and queries and analyzes them in real time**." Unlike a relational DB, which handles structured data in rows and columns, logs come in various formats and pour in at tens of thousands per second, so storing and searching them with a traditional RDBMS is inefficient. ELK solves this problem with a search engine based on an **inverted index**.

### B. Background and Necessity of Its Emergence
In MSA and cloud-native environments, a single request passes through dozens of services, so logs are scattered across each server and container. When a failure occurs, it is hard even to know which server's logs to look at. Thus arose the need for an **observability** foundation that **gathers logs in one place (centralization)** and can search them by service, time, and correlation. ELK has a lower adoption cost than commercial APM and SIEM, and by providing indexing, search, and visualization in a single stack, it has become the de facto standard for log integration and real-time analysis.

## 2. Components

```mermaid
flowchart LR
  B[Beats<br/>lightweight collection agent] --> L[Logstash<br/>collect, parse, transform]
  L --> E[Elasticsearch<br/>index, search, aggregate]
  E --> K[Kibana<br/>visualization, dashboards]
  B -.direct ingest.-> E
```

Each component takes charge of one stage of the pipeline, and because the roles are separated, they are combined selectively as needed. For example, if no transformation is needed, you can ingest directly from Beats to Elasticsearch and skip Logstash.

- **Beats (collection)**: lightweight agents installed on each server, divided by purpose—Filebeat (log files), Metricbeat (metrics), Packetbeat (network). Because their resource footprint is small, they can be deployed on thousands of servers without burden.
- **Logstash (transformation)**: parses logs through an input→filter→output pipeline. The core is the **Grok filter**, which structures an unstructured string like `192.168.0.1 - GET /api 200` into `client_ip`, `method`, and `status` fields. It is heavy but capable of powerful transformation.
- **Elasticsearch (core)**: a Lucene-based distributed search engine that provides full-text search via the inverted index and statistics in real time via aggregations. It is the heart of ELK.
- **Kibana (visualization)**: a search, dashboard, and alerting UI. It explores logs with KQL queries and visualizes them as time series, histograms, maps, and more.

| Component | Role | Characteristics |
|---|---|---|
| **Beats** | Lightweight collection | Deployed per server, low load |
| **Logstash** | Parse, transform, ingest | Powerful filters such as Grok |
| **Elasticsearch** | Index, search, aggregate | Inverted index, distributed, real-time |
| **Kibana** | Visualization, alerting | Dashboards, exploration UI |

## 3. Core Technical Principles

ELK's performance comes from two designs of Elasticsearch. First, the **inverted index** flips the index from "document → word" to "**word → list of documents containing that word**." So when finding "logs containing error," it does not scan everything but immediately returns only the documents that the error entry points to. This is why millisecond-level search is possible even across hundreds of millions of logs.

Second, **distribution and sharding**. An index is split into several **shards** distributed across nodes, and each shard is **replicated**. As data grows, you add nodes (horizontal scaling), and even if a node dies, the service is maintained by the replica (high availability). However, if there are too many shards, the overhead actually grows, so shard-count design is the crux of operations.

| Technique | Principle | Effect |
|---|---|---|
| Inverted index | Word→document mapping | Fast full-text search |
| Distribution/sharding | Index splitting/replication | Horizontal scaling, HA |
| Aggregation | Statistical computation over the index | Real-time dashboards |

## 4. Application Areas

Log analysis is the basis, but thanks to the characteristics of "search + aggregation + visualization," the range of use is broad. In **SIEM (Security Information and Event Management)**, it gathers firewall and authentication logs to detect anomalous logins and attack patterns in real time; in **observability (APM)**, it tracks response latency and error rates. For example, if 5xx errors of a particular API surge, it immediately appears as a spike on the Kibana dashboard, and the person in charge is notified via an alert (Watcher).

| Area | Example use |
|---|---|
| Log analysis | Integrating app/system logs, tracing failure causes |
| Security (SIEM) | Anomaly detection, threat hunting, compliance |
| Observability (APM) | Latency/error-rate monitoring, tracing |

## 5. Considerations and Implications
- **Cost and life-cycle management**: Because logs accumulate infinitely, storage cost must be controlled by automatically tiering old indices Hot→Warm→Cold→delete with **ILM (Index Lifecycle Management)**.
- **License issue**: As Elastic changed its license to SSPL, **OpenSearch**, an AWS-led open-source fork, emerged. From the standpoint of vendor lock-in and cost, reviewing alternatives is necessary.
- **Standard linkage**: Recently, the trend is to collect logs, metrics, and traces in an integrated way with the **OpenTelemetry** standard, so ELK too is evolving in the direction of linking with OTel collection pipelines.
- **Operational burden**: Cluster tuning (shards, heap, mapping) is tricky, so using a managed service (Elastic Cloud) is also an alternative.

---

> **In one line**: The ELK stack is an open-source stack that searches and analyzes large volumes of unstructured logs in real time via *Beats/Logstash (collect, transform) → Elasticsearch (inverted index, distributed search) → Kibana (visualization)*; it is used for log analysis, SIEM, and observability, with ILM, licensing (OpenSearch), and OpenTelemetry linkage being operational tasks.
