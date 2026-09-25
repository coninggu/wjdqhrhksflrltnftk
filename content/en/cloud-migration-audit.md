# Phased Audit of Cloud Migration Projects

## 1. Overview

### A. Definition
> An information systems audit activity that controls risk by inspecting and evaluating, at each project stage, whether a cloud migration project **conforms to its goals, requirements, security, and quality criteria**.

The point where a cloud migration audit differs from a general SW audit is that its control target is **risk arising from the change in ownership and operation of the infrastructure**. In on-premises, the ordering organization controlled all layers, but moving to the cloud applies a **shared responsibility model** in which the physical infrastructure and part of security shift to the cloud service provider's (CSP's) responsibility. The audit independently verifies, from a third-party perspective, the data, security, performance, and cost risks arising at this boundary, controlling the migration so that it does not stop at "we moved it, at least" but achieves the target quality.

### B. Necessity
The migration process latently carries hard-to-reverse risks such as loss/corruption of data during migration, exposure due to wrong security settings, and larger-than-expected cloud costs. In particular, public-sector and large projects are large in scale and directly connected to citizen services, so adequacy and risk must be inspected **in advance at each stage** rather than after the project ends, to correct problems early. The audit's independence and expertise serve as an objective quality-assurance mechanism that is not biased toward either the ordering organization or the performing company.

## 2. Per-Stage Audit Methods and Review Items

```mermaid
flowchart LR
  P[Planning/analysis] --> D[Design] --> M[Migration/implementation] --> O[Operation/stabilization]
```

The audit follows the project lifecycle, with a different focus at each stage. This section describes what is examined at each stage and why.

**A. Planning and analysis stage** — the key question of this stage is "**what, and why, are we moving to the cloud in the first place**." By reviewing the current state and requirements and conducting stakeholder interviews, it examines whether the selection of the systems to be migrated is valid, whether each system is suitable for the cloud (6R judgment), whether TCO/ROI have been calculated with grounds, and whether security requirements were reflected from the start. Because if the direction goes wrong here every subsequent stage goes astray, this is the most upstream control point.

**B. Design stage** — it verifies "**whether the picture of what to move has been drawn properly**" by reviewing the deliverables and architecture. It inspects the cloud architecture and network-separation design, the data-migration method, the disaster-recovery (DR) design prepared against failures, and compliance with relevant standards. Because moving the on-premises structure as-is can fail to leverage cloud benefits and only increase cost, architecture adequacy is an important review target.

**C. Migration and implementation stage** — it verifies via test results whether the actual implementation proceeds as planned, and in particular whether **data integrity and consistency** are maintained. It inspects whether the data count and values match before and after migration, whether the target performance is met, whether there is a **rollback plan** to revert if a problem occurs, and whether security settings (CSAP, etc.) are correct. As the stage where hard-to-reverse work is concentrated, its risk is greatest.

**D. Operation and stabilization stage** — since migration is not the end, it examines "**whether it is operated and handed over stably**." It inspects availability/performance SLA satisfaction, cost optimization (FinOps), handover to the operations organization, and the security-monitoring system. Skipping the audit of this stage can leave failures and cost surges unaddressed right after migration.

| Stage | Audit method | Key review items |
|---|---|---|
| Planning/analysis | Current-state/requirement review, interviews | Target adequacy, cloud suitability (6R), TCO/ROI, security requirements |
| Design | Deliverable/architecture review | Architecture/network separation, data-migration design, DR, standards compliance |
| Migration/implementation | Implementation inspection, test review | Data integrity/consistency, performance, rollback, security settings (CSAP) |
| Operation/stabilization | Operations inspection, monitoring review | Availability/performance SLA, cost optimization, operations handover, security monitoring |

## 3. The 6R Migration Strategies (Suitability Review Criteria)

The audit judges, via the 6R framework, whether the strategy chosen to migrate each system is valid. The reason this choice matters is that **cost, duration, and cloud benefit differ greatly per strategy**. Rehost is fast and cheap but yields little cloud benefit, while Refactor yields large benefit but costs much in money and time. For example, if there is a plan to expensively Refactor a system that is aged and about to be retired, the audit must point this out.

| Strategy | Content | Characteristics |
|---|---|---|
| Rehost | Move as-is (Lift & Shift) | Fast, low-cost, little benefit |
| Replatform | Move after partial optimization | Intermediate |
| Refactor | Cloud-native redesign | Large benefit, high cost |
| Repurchase/Retire/Retain | Repurchase, retire, retain | Chosen per target characteristics |

## 4. Key Inspection Risks

The areas that repeatedly become problems in migration audits are data, security, performance, and cost. For **data**, loss or inconsistency during migration directly undermines service trust, so integrity/consistency verification is the top priority. For **security**, the ordering organization's share of settings (access control, network separation) in the shared responsibility model is prone to being neglected, so for public-sector cases, satisfying CSAP certification requirements must be confirmed. For **performance**, latency can actually increase after moving to the cloud, so SLA satisfaction is verified with load tests. For **cost**, the pay-as-you-go nature causes surges if left unmanaged, so optimization from a FinOps perspective and TCO verification are needed.

| Area | Inspection content |
|---|---|
| Data | Migration integrity/consistency verification, loss prevention |
| Security | CSAP/network separation/access control, shared-responsibility-model boundary check |
| Performance | Target performance/SLA satisfaction, load testing |
| Cost | Billing model/optimization (FinOps), expected TCO |

## 5. Considerations and Implications
- **Early control based on independence and expertise**: The value of an audit lies not in pointing out problems after the project ends but in finding risks early at each stage. In particular, design adequacy must be finalized before the hard-to-reverse migration/implementation stage.
- **Clarifying the shared responsibility model**: If the boundary of security responsibility between the CSP and the ordering organization is not clarified in documents, a blind spot of "the other side will surely take care of it" arises. Confirming this boundary is the core unique to cloud audits.
- **Extending scope to operations and governance**: Because migration is not an end but a beginning, include operations handover, cost governance, and continuous security monitoring in the audit scope to ensure post-migration stability.

---

> **In one line**: A cloud migration audit is an activity that independently inspects, per *planning → design → migration → operation* stage, suitability (6R), data integrity, security (CSAP, shared responsibility), performance, and cost, to control hard-to-reverse migration risks early and assure quality through post-migration operations and governance.
