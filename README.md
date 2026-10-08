# 할 일 앱

이 화면은 `http://localhost:5000/todos` 백엔드 API를 통해 MongoDB의 할 일을 조회·추가·수정·삭제합니다.

## 실행

1. `todo-backend` 폴더에서 `.env`의 `MONGODB_URI`를 설정합니다.
2. `todo-backend` 폴더에서 `npm start`를 실행합니다.
3. 브라우저에서 `http://localhost:5000`을 엽니다. 백엔드가 이 폴더의 화면과 CSS·JavaScript를 함께 제공합니다.

백엔드가 실행 중이어야 합니다. 로컬 페이지와 파일 직접 열기에 필요한 CORS 처리는 백엔드에 포함되어 있습니다.

- `index.html`: 화면 및 스크립트 로딩
- `app.js`: 목록 표시, 추가, 수정, 완료 상태 변경, 삭제
- `todo-db.js`: localhost:5000 API 요청 및 화면 데이터 형식 변환

## API

| 작업 | 요청 |
| --- | --- |
| 목록 조회 | `GET /todos` |
| 개별 조회 | `GET /todos/:id` |
| 추가 | `POST /todos`, `{ "title": "장보기" }` |
| 내용 수정 | `PATCH /todos/:id`, `{ "title": "산책하기" }` |
| 완료 상태 변경 | `PATCH /todos/:id`, `{ "completed": true }` |
| 삭제 | `DELETE /todos/:id` |

프런트엔드의 `id`와 `text`는 연결 파일에서 백엔드의 `_id`와 `title`로 변환합니다. 삭제 성공은 본문 없는 `204` 응답입니다.

이전에 사용한 Supabase 및 localStorage 데이터는 자동 이전하지 않습니다. 브라우저 저장소의 기존 값은 지우지 않습니다. `schema.sql`은 과거 Supabase 구조의 참고 파일입니다.

