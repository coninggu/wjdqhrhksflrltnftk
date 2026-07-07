# REST API(Representational State Transfer API)

## 1. 개요

### 가. 정의
> HTTP 기반으로 **자원(Resource)을 URI로 식별**하고, **HTTP 메서드로 행위**를 표현하며, 자원의 상태(표현, Representation)를 주고받는 아키텍처 스타일의 API.

### 나. 특징
- **자원 중심** 설계, **Stateless(무상태)**, **Cacheable**, **Uniform Interface**

## 2. REST 6대 원칙(제약조건)

| 원칙 | 내용 |
|---|---|
| **Client-Server** | 관심사 분리(UI ↔ 데이터) |
| **Stateless** | 요청 간 상태 미보관, 각 요청 자기완결 |
| **Cacheable** | 응답 캐시 가능 명시 |
| **Uniform Interface** | 일관된 인터페이스(URI·메서드·표현) |
| **Layered System** | 계층 구조(프록시·게이트웨이 허용) |
| **Code on Demand**(선택) | 실행 코드 전송 가능 |

## 3. 구성 요소

| 요소 | 설명 |
|---|---|
| **자원(Resource)** | URI로 식별 (예: `/users/1`) |
| **행위(Verb)** | GET(조회)·POST(생성)·PUT/PATCH(수정)·DELETE(삭제) |
| **표현(Representation)** | JSON·XML 등 자원 상태 표현 |

## 4. 성숙도 모델(Richardson) 및 고려사항
- **Level 0**: HTTP 터널링 → **Level 3**: HATEOAS(하이퍼미디어)
- URI는 **명사**, 행위는 **메서드**로 / 적절한 **상태코드**·버전관리·보안(OAuth) 고려

---

> **한 줄 요약**: REST API는 *자원을 URI로 식별하고 HTTP 메서드로 행위를 표현* 하는 무상태·균일 인터페이스 기반의 아키텍처 스타일 API다.
