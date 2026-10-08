(() => {
  'use strict';
  const url = 'http://localhost:5000/todos';

  async function request(path = '', options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
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
