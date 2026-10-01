# Study & Invest
정적 호스팅(GitHub Pages 등)에 올리면 PWA로 동작합니다.

- data.js: 자산/mock 시세 (`fetchPrices`를 실제 API 프록시로 교체)
- storage.js: localStorage, 데모/신규 데이터
- portfolio.js / transactions.js / study.js: 계산, 매매, 공부 급여
- charts.js: 선·도넛 차트, mock 시계열 (`series`)
- market.js: 종목 상세 (`info`를 API로 교체), news.js: 뉴스·지표
- bank.js / stats.js / plan.js / game.js, views.js, app.js

## 실시간 시세 (worker v2)
1. `worker/worker.js`를 Cloudflare Workers에 붙여넣고 Deploy (무료, 키 불필요). **이전에 배포했다면 코드를 새 버전으로 교체해야 합니다.**
2. 앱 더보기 > 실시간 시세에 `*.workers.dev` 주소 입력

| 데이터 | 출처 | 갱신 |
|---|---|---|
| BTC/ETH | Binance WebSocket (Worker 불필요) | 틱 단위 |
| 한국 종목·ETF 현재가/시고저/거래량 | 네이버 증권 (`/kr`) | 2.5초 |
| 한국 종목 PER·PBR·EPS·배당·시총 | 네이버 증권 (`/krinfo`) | 10분 캐시 |
| 미국 주식·ETF·금·은·환율 | Yahoo (`/q`) | 4초 |
| 차트(전 종목·지수) | Yahoo (`/chart`) | 기간 변경 시 |
| 지수·유가·VIX·미국10Y | Yahoo (`/q`) | 15초 |
| 재무제표 | 한국: 네이버(손익·주요 지표), 미국: Yahoo(손익·재무상태·현금흐름) | 기간 전환 시 |
| 미국 기준금리·CPI | FRED (`/fred`) | 1시간 |
| 뉴스 | Google News RSS (`/news`) | 5분 |

실제 연결이 안 되는 항목(채권, 한국 기준금리, 한국 종목의 재무상태표·현금흐름표)은 시뮬레이션 값입니다. 모든 외부 소스는 비공식이라 막히거나 형식이 바뀔 수 있고, 실패 시 mock으로 돌아갑니다.
