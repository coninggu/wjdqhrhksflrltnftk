# 트랜잭션 격리 수준(Transaction Isolation Level)

## 1. 개요

### 가. 정의
> 동시에 실행되는 트랜잭션이 서로에게 **어느 정도 영향을 미치는지(격리 정도)** 를 규정하는 수준. ACID의 **격리성(Isolation)** 을 구현하며, 동시성과 일관성의 **트레이드오프**를 조절한다.

### 나. 필요성
- 격리↑ → 일관성↑·동시성↓ / 격리↓ → 동시성↑·이상현상 위험↑
- 업무 특성에 맞는 **적정 수준 선택**

## 2. 격리 수준별 이상현상

| 격리 수준 | Dirty Read | Non-repeatable | Phantom |
|---|---|---|---|
| **Read Uncommitted** | 발생 | 발생 | 발생 |
| **Read Committed** | 방지 | 발생 | 발생 |
| **Repeatable Read** | 방지 | 방지 | 발생(가능) |
| **Serializable** | 방지 | 방지 | 방지 |

```mermaid
flowchart LR
  A[Read Uncommitted<br/>격리 최저] --> B[Read Committed] --> C[Repeatable Read] --> D[Serializable<br/>격리 최고]
```

## 3. 이상현상 사례

| 수준 | 사례 |
|---|---|
| **Read Uncommitted** | A가 잔액 100→200 수정(미커밋), B가 200 조회 → A 롤백 시 **Dirty Read** |
| **Read Committed** | B 조회 중 A가 변경·커밋 → B가 다시 읽으면 값 상이(**Non-repeatable Read**) |
| **Repeatable Read** | 같은 행은 일관, 범위 조회 시 A가 새 행 삽입·커밋하면 건수 증가(**Phantom Read**) |
| **Serializable** | 완전 직렬화, 모든 이상현상 방지, 동시성 최저 |

## 4. 동시성 제어 기법

| 기법 | 내용 |
|---|---|
| **Lock 기반** | 공유·배타 락, 2PL(2단계 잠금) |
| **MVCC** | 스냅샷 버전으로 읽기-쓰기 충돌 최소화(Oracle·PostgreSQL) |
| **Snapshot Isolation** | 트랜잭션 시작 시점 스냅샷 읽기 |

## 5. 고려사항 및 시사점
- 대부분 DBMS 기본값은 **Read Committed**(Oracle) 또는 **Repeatable Read**(MySQL InnoDB)
- 금융 등 강한 일관성은 Serializable, 조회 위주는 낮은 수준으로 **성능·일관성 균형**
- 격리 수준↓ 시 애플리케이션 레벨 검증(낙관적 락)으로 보완

---

> **한 줄 요약**: 격리 수준은 *Read Uncommitted→Committed→Repeatable Read→Serializable* 로 갈수록 Dirty·Non-repeatable·Phantom Read를 차례로 차단하며, Lock·MVCC로 구현해 일관성과 동시성의 균형을 조절한다.
