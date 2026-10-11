(() => {
  'use strict';
  // Render에 배포한 백엔드 주소로 바꿔주세요. (끝에 / 없이)
  const DEPLOYED_API = 'https://todo-backend-XXXX.onrender.com';

  const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname) || location.protocol === 'file:';
  const url = `${isLocal ? 'http://localhost:5000' : DEPLOYED_API}/todos`;

  async function request(path = '', options = {}) {
    const controller = new AbortController();
    // Render 무료 서버는 잠들었다 깨어날 때 최대 1분 가까이 걸릴 수 있습니다.
    const timeout = setTimeout(() => controller.abort(), 60000);
    try {
      const response = await fetch(`${url}${path}`, {
        ...options,
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', ...options.headers }
      });
      if (response.status === 204) return null;
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '백엔드 요청에 실패했습니다.');
      return data;
    } finally { clearTimeout(timeout); }
  }

  function toTask(todo) {
    return {
      id: todo._id,
      text: todo.title,
      completed: todo.completed,
      created_at: todo.createdAt,
      updated_at: todo.updatedAt
    };
  }

  window.todoDB = {
    async list() {
      return (await request()).map(toTask);
    },
    async add(text) {
      return toTask(await request('', { method: 'POST', body: JSON.stringify({ title: text }) }));
    },
    async update(id, changes) {
      const body = {};
      if (Object.hasOwn(changes, 'text')) body.title = changes.text;
      if (Object.hasOwn(changes, 'completed')) body.completed = changes.completed;
      return toTask(await request(`/${encodeURIComponent(id)}`, {
        method: 'PATCH', body: JSON.stringify(body)
      }));
    },
    async remove(id) {
      await request(`/${encodeURIComponent(id)}`, { method: 'DELETE' });
    }
  };
})();
