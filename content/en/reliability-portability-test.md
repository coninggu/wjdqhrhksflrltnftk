# Types of Software Testing and Reliability · Portability Testing

## 1. Overview

### A. Definition
> Software testing is a verification and validation activity performed throughout development and operation to **find defects and confirm that required quality is met**. Among these, **reliability and portability testing** from the perspective of **ISO/IEC 25010 quality characteristics** assure, respectively, stability during operation and adaptability to diverse environments.

### B. Background and Need
Tests that only check whether functions work as specified cannot prevent failures that occur in actual operation. Whether a system runs non-stop for days, whether service is maintained even if some nodes die, and whether it works correctly after moving to a new OS or browser are **non-functional (quality) requirements** that do not appear in functional specifications. As cloud, multi-platform, and 24/365 services have become commonplace, such reliability and portability have become key conditions for service sustainability, and tests that define and verify them as quantitative targets (SLA, MTBF, RTO) have become essential.

## 2. Types of Software Testing

```mermaid
flowchart LR
  U[Unit] --> I[Integration] --> S[System] --> A[Acceptance]
```

Tests are classified by several criteria, which are not mutually exclusive but different axes. **Test levels** widen the scope of verification from small to large (unit → integration → system → acceptance), with each stage catching, from a different perspective, defects missed by the previous stage. **Test techniques** are divided into black-box, which verifies only inputs and outputs without looking at internal structure, and white-box, which examines code paths. **Non-functional tests** target quality characteristics such as performance, reliability, and portability rather than functionality, and **change-related tests** confirm that modifications have not broken existing functions (regression).

| Classification criterion | Types | Focus |
|---|---|---|
| **Test level** | Unit · integration · system · acceptance | Expanding verification scope |
| **Test technique** | Black-box (specification) · white-box (structure) · experience-based | Whether internal structure is observed |
| **Non-functional (quality characteristics)** | Performance · load · security · reliability · portability · usability · compatibility | Quality of behavior |
| **Change-related** | Regression · smoke · confirmation | Stability after change |

## 3. Reliability Test

> Reliability is **the ability to continue performing functions without failure for a specified period under stated conditions**. Reliability testing verifies this ability by sub-characteristic.

Reliability divides into two axes: "how rarely does it fail" and "how well does it withstand and recover when it does fail". The former is covered by maturity, and the latter by fault tolerance and recoverability. It is important that each sub-characteristic is **judged by quantitative metrics**, not by qualitative confirmation.

| Sub-characteristic | Description | Verification method · metric |
|---|---|---|
| **Maturity** | How rarely failures due to defects occur | Defect occurrence rate · MTBF (mean time between failures), reliability growth model |
| **Fault Tolerance** | Maintains specified performance despite failures · erroneous input | Redundancy · failover tests, fault injection |
| **Recoverability** | Recovery of data · state after failure | RTO/RPO verification, backup · recovery tests |
| **Availability** | Ability to operate continuously for long periods | Soak (endurance) · long-duration load tests |

For example, fault tolerance verification forcibly takes down a specific server (fault injection) in a production-like environment and measures whether failover occurs within a few seconds and whether request failures during that time stay below target. Recoverability is verified against RTO (recovery time objective) and RPO (tolerable data loss), assuming a disaster scenario and checking how quickly and losslessly restoration from backup occurs. In this way, reliability testing decides pass/fail not by "it looks stable" but by numbers such as "MTBF 10,000 hours, RTO 30 minutes".

## 4. Portability Test

> Portability is **the ability to transfer and adapt software to other environments (HW, OS, browser, platform)**. Portability testing verifies the ability to adapt, install, replace, and co-exist in response to environmental changes.

Portability has become important because today's software does not run in just one fixed environment. To lower the cost and risk of migration in environments that move from on-premises to cloud, from a specific OS to containers, and across multiple browsers and devices, portability must be in place.

| Sub-characteristic | Description | Verification method |
|---|---|---|
| **Adaptability** | Adapts to various environments without major modification | Operation tests on different OS · HW |
| **Installability** | Correct installation · upgrade · removal | Installation script · rollback verification |
| **Replaceability** | Replaces · is compatible with existing SW of the same purpose | Data · interface compatibility tests |
| **Co-existence** | Co-exists without conflict with other SW · multiple environments | Cross-browsing · multi-OS cross-verification |

Specifically, co-existence (compatibility) verification of a web service uses **cross-browsing** to cross-check that the same screens and functions appear on multiple browsers such as Chrome, Edge, and Safari and on Windows, macOS, and Android devices. Installability examines whether the entire process of installing, upgrading, and removing a deployment package on a new server works without errors and can be rolled back. Adaptability tests, for example, whether an application verified on x86 works without code changes when moved to an ARM-based cloud instance.

## 5. Considerations and Implications
- **Judgment against quantitative targets**: Non-functional tests must use contractual/target figures such as SLA, MTBF, and RTO/RPO as pass criteria, not subjective judgment, so that results are accepted without dispute.
- **Growing importance of portability due to environmental diversification**: With the spread of cloud, multi-platform, and containers, the scope of portability and compatibility verification has widened, requiring automated cross-environment test pipelines.
- **Linkage with operations and chaos engineering**: Reliability does not end with pre-deployment testing but must be linked with APM monitoring during operation, and it is evolving toward continuously verifying fault tolerance through **chaos engineering**, which intentionally injects failures into the actual production system.

---

> **In one line**: Tests are classified by level, technique, non-functional, and change-related categories; reliability testing verifies maturity, fault tolerance, recoverability, and availability, and portability testing verifies adaptability, installability, replaceability, and co-existence against quantitative targets such as MTBF and RTO, extending into operational monitoring and chaos engineering.
