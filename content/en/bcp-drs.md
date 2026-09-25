# Key BCP Metrics and Considerations for Building a DRS

## 1. Overview

### A. Definition
> **BCP (Business Continuity Planning)** is a comprehensive plan and framework established so that **core business operations continue without interruption (or with minimal interruption)** even in a disaster or failure situation, and **DRS (Disaster Recovery System)** is the technical means within it that recovers IT systems and data.

BCP and DRS are in a superordinate–subordinate relationship. BCP is a **management-level continuity strategy** encompassing people, processes, facilities, and IT, while DRS handles "how to recover the IT systems" within it. In other words, DRS is a necessary but not sufficient condition for BCP; even if the system is recovered, continuity is not achieved without business procedures and human response.

### B. Necessity
Disasters include not only physical events such as earthquakes and fires but also cyber threats such as **ransomware and system failures**, and in today's world of high digital dependence, a business interruption directly translates into loss of revenue and trust. In particular, the financial sector (through the Regulation on Supervision of Electronic Financial Transactions) and the public sector (through the disaster-mitigation activity management framework, etc.) have **made building a DR framework mandatory through regulation**, so BCP/DRS has become not an option but a necessity.

## 2. BCP Establishment Procedure and Key Metrics

```mermaid
flowchart LR
  B[BIA<br/>Business Impact Analysis] --> R[Risk assessment]
  R --> S[Establish recovery strategy]
  S --> P[Establish and drill BCP]
```

The starting point of BCP is **BIA (Business Impact Analysis)**. Because protecting all business operations equally is inefficient, BIA analyzes the impact of interrupting each operation to determine **priorities and target recovery levels**. The key metrics derived here are RTO and RPO. **RTO (Recovery Time Objective)**—"how quickly must we recover?"—determines the level of system redundancy, and **RPO (Recovery Point Objective)**—"how much data loss can we tolerate?"—determines the backup/replication interval.

To give an example of the relationship between the two metrics: if the RPO is "1 hour," you must back up (or replicate) at least every hour, and if the RTO is "2 hours," you must have infrastructure ready to bring the system back within 2 hours. Because demanding RTO/RPO close to 0 causes cost to surge, the principle is to set them differentially per operation based on BIA results.

| Metric | Meaning |
|---|---|
| **RTO** (Recovery Time Objective) | Allowable time from failure occurrence to completion of recovery |
| **RPO** (Recovery Point Objective) | Tolerable range of data loss (backup/replication interval) |
| **RSO** (Recovery Scope Objective) | Scope of operations and systems targeted for recovery |
| **MTD** (Maximum Tolerable Downtime) | Maximum interruption the business can endure (BIA-based) |
| **RCO/RCapO** | Communication/processing-capacity target during recovery |

## 3. DRS Build Types (Recovery Levels)

DRS types ultimately diverge based on the **balance between the RTO target and cost**. To recover quickly, a standby system must be kept running at all times, which incurs corresponding cost. A **Mirror Site** converges its RTO to 0 through real-time redundancy but is the most expensive, while a **Cold Site** provides only space and facilities—cheap but taking weeks to recover. Hot/Warm are compromises in between. The more critical the operation, the higher the type chosen; lower-priority operations use lower types, combined in this fashion.

| Type | RTO | Characteristics |
|---|---|---|
| **Mirror Site** | Immediate (0) | Real-time redundancy, highest cost |
| **Hot Site** | Hours | Standing by in a running state |
| **Warm Site** | Days | Only core resources partially configured |
| **Cold Site** | Weeks | Space and facilities only, lowest cost |

## 4. Key Considerations for Building a DRS

```mermaid
flowchart LR
  T[RTO/RPO targets] --> D[Inter-center distance]
  D --> C[Data replication method]
  C --> E[Failover/recovery procedures]
  E --> M[Drills and verification]
```

The most delicate trade-off in DRS design is the point where **inter-center distance and data replication method** intertwine. To prevent a disaster from striking both centers at once, the sites must be far enough apart, but greater distance increases the **transmission latency of synchronous replication**, degrading operational performance. Therefore, financial transactions requiring no loss (RPO=0) use synchronous replication while accepting the distance constraint, whereas latency-sensitive systems place a remote center using asynchronous replication that tolerates a little loss. Also, whether failover and failback procedures are automatic or manual, and whether they are documented in a RunBook, determines the success of recovery in an actual crisis.

| Consideration | Content |
|---|---|
| **RTO/RPO vs. cost** | Balance between target level and investment scale |
| **Inter-center distance** | Avoiding simultaneous damage (remote) vs. synchronous-replication latency (nearby) |
| **Data replication** | Synchronous (no loss, ↑ latency) / asynchronous (↑ performance, possible loss) |
| **Failover procedures** | Automatic/manual failover/failback, RunBook documentation |
| **Verification** | Periodic drills to demonstrate recoverability |

Above all, a DRS is **not finished once it is built**. Because the system configuration keeps changing, if you do not verify through periodic drills whether actual recovery happens within the target time, it can be useless in a crisis. A DR plan without drills is nothing more than "recovery on paper."

## 5. Considerations and Implications
- **Cost efficiency through cloud DR**: Cloud DR patterns such as pilot light and warm standby maintain only minimal resources in normal times and scale out during a disaster, achieving a higher recovery level at lower cost than a physical DR center.
- **Securing effectiveness through drills, not documents**: The value of BCP/DRS comes not from the plan document but from **periodic drills and verification**. Recovery procedures must be actually exercised and updated.
- **Linkage with cyber resilience**: To prepare for ransomware, design immutable backups and a network-segregated recovery environment together.
- **Continual recalculation of RTO/RPO**: Periodically update the BIA in step with business changes to keep the target metrics realistic.

---

> **In one line**: BCP plans business continuity with *BIA-based RTO, RPO, RSO, and MTD* metrics, and DRS is built with *recovery level (Mirror to Cold), inter-center distance, replication method, failover procedures, and drills* as key considerations—but its effectiveness is secured through periodic drills and verification, not documents.
