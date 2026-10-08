# 할 일 앱

로그인 없이 사용하는 공용 할 일 목록입니다. 모든 방문자가 같은 목록을 조회·추가·수정·삭제할 수 있습니다.

## 실행

기존 방식으로 `index.html`을 열거나 정적 웹 서버에서 실행하세요. 인터넷 연결이 필요합니다.
Supabase 프로젝트 `qpvbzzpsknaqabyagrsb`의 `public.todos` 테이블은 이미 생성했습니다.
`schema.sql`은 적용된 구조의 참고용 사본입니다. 기존 프로젝트에 다시 실행할 필요가 없습니다.

- `todo-db.js`: Supabase REST API 연결. 브라우저용 publishable key만 사용합니다.
- `app.js`: 초기 조회, 추가, 내용 수정, 완료 상태 변경, 삭제, 실패 안내 및 재시도.
- 같은 주소의 브라우저 저장소에 있는 기존 목록은 최초 접속 시 데이터베이스로 이전합니다.
- 다른 방문자의 변경은 페이지를 새로고침하면 불러옵니다.
- 저장 중에는 버튼을 잠그고, 서버 응답 성공 후에 화면을 갱신합니다.
- 응답 시간 초과 시 페이지를 새로고침해 저장 여부를 확인하세요.

## 검증

공개 API 키로 실제 추가 → 수정·완료 → 재조회 → 삭제를 확인했습니다.
중복 이전, 삭제된 항목 수정, 빈 내용 검증, 네트워크 실패 처리도 확인했습니다.
테스트 데이터는 삭제했습니다. JavaScript 문법 검사도 통과했습니다.

Supabase 성능 진단에는 경고가 없었습니다. 보안 진단에는 이번 작업에서 생성하지 않은
`public.rls_auto_enable()` 함수의 공개 실행 권한 경고가 남아 있습니다.
[Supabase 진단 설명](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)
