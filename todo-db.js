(() => {
  'use strict';
  const url = 'https://qpvbzzpsknaqabyagrsb.supabase.co/rest/v1/todos';
  // Browser-safe publishable key; RLS controls table access.
  const key = 'sb_publishable_C2TjAOWq2eBy5-nxBuknkg_PMwY77a5';
  async function request(query = '', options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`${url}?${query}`, {
        ...options, signal: controller.signal,
        headers: { apikey: key, 'Content-Type': 'application/json',
          Prefer: 'return=representation', ...options.headers }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || '데이터베이스 요청 실패');
      return data;
    } finally { clearTimeout(timeout); }
  }
  function one(rows) {
    if (rows.length !== 1) throw new Error('할 일이 변경되거나 삭제되었어요. 새로고침 후 다시 시도해 주세요.');
    return rows[0];
  }
  window.todoDB = {
    async list() {
      const rows = [];
      let page;
      do {
        page = await request(`select=*&order=created_at.desc,id.desc&limit=1000&offset=${rows.length}`);
        rows.push(...page);
      } while (page.length === 1000);
      return rows;
    },
    async add(text) {
      return one(await request('', { method: 'POST', body: JSON.stringify({ text }) }));
    },
    async update(id, changes) {
      return one(await request(`id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH', body: JSON.stringify(changes)
      }));
    },
    async remove(id) {
      return one(await request(`id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' }));
    },
    async import(rows) {
      await request('on_conflict=id', { method: 'POST', body: JSON.stringify(rows),
        headers: { Prefer: 'resolution=ignore-duplicates,return=representation' } });
    }
  };
})();
