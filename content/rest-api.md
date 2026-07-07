# REST API(Representational State Transfer API)

## 1. 개요

### 가. 정의
> HTTP 기반으로 **자원(Resource)을 URI로 식별**하고, **HTTP 메서드로 행위**를 표현하며, 자원의 상태(표현, Representation)를 JSON·XML로 주고받는 **아키텍처 스타일**의 API.

### 나. 등장 배경
- 이기종 시스템 간 **표준적·경량 연동** 필요(SOAP의 복잡성 대체)
- 웹·모바일·MSA 확산에 따른 **개방형 API·플랫폼** 요구

## 2. REST 6대 아키텍처 제약조건

```mermaid
flowchart LR
  CS[Client-Server] --- ST[Stateless]
  ST --- CA[Cacheable]
  CA --- UI[Uniform Interface]
  UI --- LS[Layered System]
  LS --- COD[Code on Demand]
```

| 원칙 | 내용 |
|---|---|
| **Client-Server** | UI와 데이터 저장 관심사 분리 |
| **Stateless** | 요청 간 상태 미보관, 각 요청 자기완결 |
| **Cacheable** | 응답 캐시 가능 여부 명시 |
| **Uniform Interface** | 일관된 인터페이스(URI·메서드·표현·HATEOAS) |
| **Layered System** | 계층 구조(프록시·게이트웨이 허용) |
| **Code on Demand**(선택) | 실행 코드 전송 가능 |

## 3. 구성 요소와 메서드

| 요소 | 설명 |
|---|---|
| **자원(Resource)** | URI로 식별 (예: `/users/1`) |
| **행위(Verb)** | GET(조회)·POST(생성)·PUT/PATCH(수정)·DELETE(삭제) |
| **표현(Representation)** | JSON·XML 등 자원 상태 |

| 메서드 | 의미 | 멱등성 |
|---|---|---|
| GET | 조회 | O |
| POST | 생성 | X |
| PUT | 전체 수정 | O |
| PATCH | 부분 수정 | X |
| DELETE | 삭제 | O |

## 4. 성숙도 모델(Richardson Maturity Model)

| 레벨 | 내용 |
|---|---|
| **Level 0** | HTTP 터널링(단일 URI) |
| **Level 1** | 자원 분리(URI) |
| **Level 2** | HTTP 메서드·상태코드 활용 |
| **Level 3** | HATEOAS(하이퍼미디어) — 진정한 REST |

## 5. 설계 시 고려사항
- URI는 **명사(계층적)**, 행위는 **메서드**로 표현
- 적절한 **상태코드**(2xx·4xx·5xx), **버전관리**(URI/헤더)
- **보안**(OAuth2·JWT·HTTPS), 페이징·필터, 문서화(OpenAPI)

## 6. 시사점
- MSA·개방형 플랫폼의 표준 연동 방식, GraphQL·gRPC와 상호 보완

---

> **한 줄 요약**: REST API는 *자원을 URI로 식별하고 HTTP 메서드로 행위를 표현* 하는 무상태·균일 인터페이스 기반 아키텍처 스타일 API로, 6대 제약조건과 성숙도 모델(HATEOAS)로 설명된다.
