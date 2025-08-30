const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const dateInput = document.getElementById('todo-date');
const priorityInput = document.getElementById('todo-priority');
const list = document.getElementById('todo-list');
const filter = document.getElementById('filter');
const search = document.getElementById('search');

// Simpan ke localStorage
function saveTodos() {
  const todos = [];
  document.querySelectorAll('#todo-list li').forEach(li => {
    todos.push({
      text: li.querySelector('.task-text').textContent,
      date: li.querySelector('.date')?.textContent || "",
      priority: li.querySelector('.priority')?.dataset.priority || "low",
      completed: li.classList.contains('completed')
    });
  });
  localStorage.setItem('todos', JSON.stringify(todos));
}

// Load dari localStorage
function loadTodos() {
  const todos = JSON.parse(localStorage.getItem('todos')) || [];
  todos.forEach(todo => addTodo(todo.text, todo.date, todo.priority, todo.completed));
}

// Tambah todo
function addTodo(text, date = "", priority = "low", completed = false) {
  const li = document.createElement('li');
  li.draggable = true;

  const details = document.createElement('div');
  details.classList.add('details');

  const span = document.createElement('span');
  span.classList.add('task-text');
  span.textContent = text;
  if (completed) li.classList.add('completed');

  span.addEventListener('click', () => {
    li.classList.toggle('completed');
    saveTodos();
  });

  const priorityTag = document.createElement('span');
  priorityTag.classList.add('priority', priority);
  priorityTag.dataset.priority = priority;
  priorityTag.textContent = priority.toUpperCase();

  const dateTag = document.createElement('div');
  dateTag.classList.add('date');
  if (date) dateTag.textContent = `Due: ${date}`;

  details.appendChild(span);
  details.appendChild(priorityTag);
  details.appendChild(dateTag);

  const actions = document.createElement('div');
  actions.classList.add('actions');

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.addEventListener('click', () => {
    editTask(li, span, dateTag, priorityTag);
  });

  const delBtn = document.createElement('button');
  delBtn.textContent = 'Hapus';
  delBtn.classList.add('delete');
  delBtn.addEventListener('click', () => {
    li.remove();
    saveTodos();
  });

  actions.appendChild(editBtn);
  actions.appendChild(delBtn);

  li.appendChild(details);
  li.appendChild(actions);
  list.appendChild(li);

  saveTodos();

  // Drag & Drop
  li.addEventListener('dragstart', () => li.classList.add('dragging'));
  li.addEventListener('dragend', () => {
    li.classList.remove('dragging');
    saveTodos();
  });
}

// Edit Inline
function editTask(li, span, dateTag, priorityTag) {
  const inputEdit = document.createElement('input');
  inputEdit.type = 'text';
  inputEdit.value = span.textContent;

  const dateEdit = document.createElement('input');
  dateEdit.type = 'date';
  dateEdit.value = dateTag.textContent.replace("Due: ", "") || "";

  const priorityEdit = document.createElement('select');
  ["low", "medium", "high"].forEach(p => {
    const opt = document.createElement('option');
    opt.value = p;
    opt.textContent = p.charAt(0).toUpperCase() + p.slice(1);
    if (priorityTag.dataset.priority === p) opt.selected = true;
    priorityEdit.appendChild(opt);
  });

  const saveBtn = document.createElement('button');
  saveBtn.textContent = "✔";
  saveBtn.classList.add('save');
  saveBtn.addEventListener('click', () => {
    span.textContent = inputEdit.value;
    dateTag.textContent = dateEdit.value ? `Due: ${dateEdit.value}` : "";
    priorityTag.textContent = priorityEdit.value.toUpperCase();
    priorityTag.dataset.priority = priorityEdit.value;
    priorityTag.className = `priority ${priorityEdit.value}`;
    li.querySelector('.actions').innerHTML = "";
    li.querySelector('.actions').append(editBtn, delBtn);
    saveTodos();
  });

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = "✖";
  cancelBtn.classList.add('cancel');
  cancelBtn.addEventListener('click', () => {
    li.querySelector('.actions').innerHTML = "";
    li.querySelector('.actions').append(editBtn, delBtn);
  });

  const { editBtn, delBtn } = li.querySelector('.actions').children;

  li.querySelector('.details').innerHTML = "";
  li.querySelector('.details').append(inputEdit, priorityEdit, dateEdit);
  li.querySelector('.actions').innerHTML = "";
  li.querySelector('.actions').append(saveBtn, cancelBtn);
}

// Filter & Search
filter.addEventListener('change', applyFilters);
search.addEventListener('input', applyFilters);

function applyFilters() {
  const keyword = search.value.toLowerCase();
  const status = filter.value;

  document.querySelectorAll('#todo-list li').forEach(li => {
    const text = li.querySelector('.task-text').textContent.toLowerCase();
    const isCompleted = li.classList.contains('completed');

    let show = true;

    if (keyword && !text.includes(keyword)) show = false;
    if (status === 'completed' && !isCompleted) show = false;
    if (status === 'pending' && isCompleted) show = false;

    li.style.display = show ? "flex" : "none";
  });
}

// Drag & Drop list
list.addEventListener('dragover', e => {
  e.preventDefault();
  const afterElement = getDragAfterElement(list, e.clientY);
  const dragging = document.querySelector('.dragging');
  if (afterElement == null) {
    list.appendChild(dragging);
  } else {
    list.insertBefore(dragging, afterElement);
  }
});

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Tambah todo baru
form.addEventListener('submit', e => {
  e.preventDefault();
  addTodo(input.value, dateInput.value, priorityInput.value);
  input.value = '';
  dateInput.value = '';
  priorityInput.value = 'low';
});

// Jalankan saat load
loadTodos();
