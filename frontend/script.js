const API = `${API_URL}/api/students`;

const $ = (id) => document.getElementById(id);
const form = $('studentForm');
const fields = ['studentId', 'name', 'email', 'department', 'semester', 'contact'];

let msgTimer;
function showMessage(text, type = 'success') {
  const box = $('message');
  box.textContent = text;
  box.className = `message ${type}`;
  clearTimeout(msgTimer);
  msgTimer = setTimeout(() => box.classList.add('hidden'), 4000);
}

// safe text insert (XSS se bachne ke liye)
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function request(url, options = {}) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

async function loadStudents(search = '') {
  try {
    const url = search ? `${API}?search=${encodeURIComponent(search)}` : API;
    const { data } = await request(url);
    renderTable(data);
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

function renderTable(students) {
  $('tableBody').innerHTML = students
    .map(
      (s) => `<tr>
        <td>${esc(s.studentId)}</td><td>${esc(s.name)}</td><td>${esc(s.email)}</td>
        <td>${esc(s.department)}</td><td>${esc(s.semester)}</td><td>${esc(s.contact)}</td>
        <td><div class="row-actions">
          <button data-action="edit" data-id="${esc(s._id)}">Edit</button>
          <button class="danger" data-action="delete" data-id="${esc(s._id)}">Delete</button>
        </div></td></tr>`
    )
    .join('');
  $('emptyText').classList.toggle('hidden', students.length > 0);
}

$('tableBody').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  if (btn.dataset.action === 'edit') startEdit(btn.dataset.id);
  else removeStudent(btn.dataset.id);
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {};
  fields.forEach((f) => (payload[f] = $(f).value.trim()));
  payload.semester = Number(payload.semester);

  const id = $('recordId').value;
  try {
    const result = await request(id ? `${API}/${id}` : API, {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    });
    showMessage(result.message);
    resetForm();
    loadStudents();
  } catch (err) {
    showMessage(err.message, 'error');
  }
});

async function startEdit(id) {
  try {
    const { data } = await request(`${API}/${id}`);
    $('recordId').value = data._id;
    fields.forEach((f) => ($(f).value = data[f] ?? ''));
    $('formTitle').textContent = 'Edit Student';
    $('submitBtn').textContent = 'Update Student';
    $('cancelBtn').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

async function removeStudent(id) {
  if (!confirm('Pakka delete karna hai?')) return;
  try {
    const result = await request(`${API}/${id}`, { method: 'DELETE' });
    showMessage(result.message);
    loadStudents();
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

function resetForm() {
  form.reset();
  $('recordId').value = '';
  $('formTitle').textContent = 'Add Student';
  $('submitBtn').textContent = 'Add Student';
  $('cancelBtn').classList.add('hidden');
}

$('cancelBtn').addEventListener('click', resetForm);
$('searchBtn').addEventListener('click', () => loadStudents($('searchInput').value.trim()));
$('searchInput').addEventListener('keydown', (e) => e.key === 'Enter' && loadStudents(e.target.value.trim()));
$('resetBtn').addEventListener('click', () => {
  $('searchInput').value = '';
  loadStudents();
});

loadStudents();
