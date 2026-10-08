(() => {
  'use strict';

  const addForm = document.querySelector('#add-form');
  const newTask = document.querySelector('#new-task');
  const list = document.querySelector('#task-list');
  const emptyMessage = document.querySelector('#empty-message');
  const status = document.querySelector('#status');
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  let tasks = [];
  let filter = 'all';
  let editingId = null;

  const retry = document.querySelector('#retry');
  let busy = false;
  let ready = false;

  function setBusy(value) {
    busy = value;
    document.querySelector('main').setAttribute('aria-busy', String(value));
    document.querySelectorAll('main input, main button').forEach(element => {
      element.disabled = value || (!ready && element !== retry);
    });
  }

  async function change(action, message, after) {
    if (busy || !ready) return;
    setBusy(true);
    status.textContent = '저장 중이에요…';
    try {
      await action();
      status.textContent = message;
      render();
      setBusy(false);
      after?.();
    } catch (error) {
      status.textContent = error.name === 'AbortError'
        ? '응답이 지연되고 있어요. 새로고침해 저장 여부를 확인해 주세요.'
        : '저장하지 못했어요. 연결을 확인하고 다시 시도해 주세요.';
      console.error(error);
    } finally { setBusy(false); }
  }

  async function initialize() {
    if (busy) return;
    ready = false;
    retry.hidden = true;
    setBusy(true);
    status.textContent = '할 일을 불러오는 중이에요…';
    try {
      tasks = await window.todoDB.list();
      ready = true;
      render();
      status.textContent = '할 일을 불러왔어요.';
    } catch (error) {
      status.textContent = '목록을 불러오지 못했어요. 연결을 확인하고 다시 시도해 주세요.';
      retry.hidden = false;
      console.error(error);
    } finally { setBusy(false); }
  }

  function button(text, className, action) {
    const element = document.createElement('button');
    element.type = 'button';
    element.className = className;
    element.textContent = text;
    element.addEventListener('click', action);
    return element;
  }

  function render() {
    list.replaceChildren();
    document.querySelector('#remaining').textContent = `${tasks.filter(task => !task.completed).length}개 남음`;
    document.querySelector('#total-count').textContent = tasks.length;
    filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item.dataset.filter === filter)));
    const visible = tasks.filter(task => filter === 'all' || (filter === 'completed' ? task.completed : !task.completed));
    emptyMessage.hidden = visible.length > 0;
    if (tasks.length === 0) {
      emptyMessage.textContent = '아직 할 일이 없어요. 위에서 첫 할 일을 추가해 보세요.';
    } else {
      emptyMessage.textContent = filter === 'completed' ? '완료한 할 일이 없어요.' : '남은 할 일이 없어요.';
    }

    visible.forEach(task => {
      const row = document.createElement('li');
      row.className = `task-row${task.completed ? ' completed' : ''}`;
      if (editingId === task.id) {
        const form = document.createElement('form');
        form.className = 'edit-form';
        const input = document.createElement('input');
        input.type = 'text';
        input.value = task.text;
        input.maxLength = 200;
        input.required = true;
        input.setAttribute('aria-label', '할 일 수정');
        input.addEventListener('input', () => input.setCustomValidity(''));
        const submit = document.createElement('button');
        submit.type = 'submit';
        submit.className = 'primary';
        submit.textContent = '저장';
        const cancel = () => {
          editingId = null;
          render();
          focusEdit(task.id);
        };
        form.append(input, submit, button('취소', 'secondary', cancel));
        form.addEventListener('submit', event => {
          event.preventDefault();
          const text = input.value.trim();
          if (!text) {
            input.setCustomValidity('할 일을 입력해 주세요.');
            input.reportValidity();
            return;
          }
          void change(async () => {
            const updated = await window.todoDB.update(task.id, { text });
            Object.assign(task, updated);
            editingId = null;
          }, '할 일을 수정했어요.', () => focusEdit(task.id));
        });
        input.addEventListener('keydown', event => {
          if (event.key === 'Escape' && !event.isComposing && !busy) cancel();
        });
        row.append(form);
      } else {
        const label = document.createElement('label');
        label.className = 'task-label';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => {
          const completed = checkbox.checked;
          checkbox.checked = task.completed;
          void change(async () => {
            Object.assign(task, await window.todoDB.update(task.id, { completed }));
          }, completed ? '완료했어요.' : '미완료로 변경했어요.', () => {
            const replacement = [...list.children].find(item => item.dataset.id === task.id);
            (replacement?.querySelector('input') || filterButtons.find(item => item.dataset.filter === filter)).focus();
          });
        });
        const text = document.createElement('span');
        text.className = 'task-text';
        text.textContent = task.text;
        label.append(checkbox, text);
        const actions = document.createElement('div');
        actions.className = 'actions';
        const edit = button('수정', 'secondary edit-button', () => {
          editingId = task.id;
          render();
          const input = list.querySelector('.edit-form input');
          input.focus();
          input.select();
        });
        edit.setAttribute('aria-label', `${task.text} 수정`);
        const remove = button('삭제', 'secondary delete', () => {
          void change(async () => {
            await window.todoDB.remove(task.id);
            tasks = tasks.filter(item => item.id !== task.id);
          }, '할 일을 삭제했어요.', () => newTask.focus());
        });
        remove.setAttribute('aria-label', `${task.text} 삭제`);
        actions.append(edit, remove);
        row.append(label, actions);
      }
      row.dataset.id = task.id;
      list.append(row);
    });
  }

  function focusEdit(id) {
    [...list.children].find(row => row.dataset.id === id)?.querySelector('.edit-button')?.focus();
  }

  newTask.addEventListener('input', () => newTask.setCustomValidity(''));
  addForm.addEventListener('submit', event => {
    event.preventDefault();
    const text = newTask.value.trim();
    if (!text) {
      newTask.setCustomValidity('할 일을 입력해 주세요.');
      newTask.reportValidity();
      return;
    }
    void change(async () => {
      const task = await window.todoDB.add(text);
      tasks.unshift(task);
      filter = filter === 'completed' ? 'all' : filter;
      editingId = null;
      newTask.value = '';
    }, '할 일을 추가했어요.', () => newTask.focus());
  });

  filterButtons.forEach(item => item.addEventListener('click', () => {
    filter = item.dataset.filter;
    editingId = null;
    render();
  }));

  retry.addEventListener('click', initialize);
  void initialize();
})();

