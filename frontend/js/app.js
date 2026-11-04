// ========================================================
// Student Information Management System - Main Application Logic
// Professional Human-Crafted Architecture Client
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  let students = [];
  let isCheckingHealth = false;
  let activeStudentForEdit = null;

  // DOM Elements
  const statusPill = document.getElementById('connection-status-pill');
  const statusText = document.getElementById('connection-status-text');
  const coldStartAlert = document.getElementById('cold-start-alert');
  const backendUrlDisplay = document.getElementById('backend-url-display');
  const dbStatusBadge = document.getElementById('db-status-badge');

  // Metrics
  const statTotalStudents = document.getElementById('stat-total-students');
  const statTotalDepts = document.getElementById('stat-total-depts');
  const statAvgSemester = document.getElementById('stat-avg-semester');

  // Form & Table Elements
  const addStudentForm = document.getElementById('add-student-form');
  const studentsTableBody = document.getElementById('students-table-body');
  const tableStateContainer = document.getElementById('table-state');
  const searchInput = document.getElementById('search-input');
  const filterDept = document.getElementById('filter-dept');
  const refreshBtn = document.getElementById('refresh-btn');

  // Modals
  const editModal = document.getElementById('edit-modal');
  const editForm = document.getElementById('edit-student-form');
  const closeEditModalBtn = document.getElementById('close-edit-modal');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');

  const settingsModal = document.getElementById('settings-modal');
  const settingsBtn = document.getElementById('settings-btn');
  const closeSettingsBtn = document.getElementById('close-settings-modal');
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  const resetSettingsBtn = document.getElementById('reset-settings-btn');
  const apiUrlInput = document.getElementById('api-url-input');

  // Toast Container
  const toastContainer = document.getElementById('toast-container');

  // ========================================================
  // Notification Toast Helper
  // ========================================================
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const labelMap = {
      success: 'SUCCESS',
      error: 'ERROR',
      warning: 'NOTICE',
      info: 'INFO',
    };

    toast.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:2px;">
        <span style="font-size:0.7rem;font-weight:700;letter-spacing:0.05em;opacity:0.75;">${labelMap[type] || 'INFO'}</span>
        <span>${message}</span>
      </div>
      <button style="background:none;border:none;cursor:pointer;color:inherit;font-size:18px;margin-left:12px;opacity:0.6;">&times;</button>
    `;

    toast.querySelector('button').addEventListener('click', () => toast.remove());
    toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 4500);
  }

  // ========================================================
  // Health & Connection Monitor
  // ========================================================
  async function checkServerHealth(quiet = false) {
    if (isCheckingHealth) return;
    isCheckingHealth = true;

    const currentUrl = API.getBaseUrl();
    if (backendUrlDisplay) {
      backendUrlDisplay.textContent = currentUrl;
    }

    statusPill.className = 'status-pill connecting';
    statusText.textContent = 'Connecting...';

    try {
      const data = await API.checkHealth();

      statusPill.className = 'status-pill online';
      statusText.textContent = 'Backend Active';
      coldStartAlert.classList.remove('active');

      if (dbStatusBadge && data.tiers && data.tiers.database) {
        dbStatusBadge.textContent = `MongoDB: ${data.tiers.database.status}`;
      }

      if (!quiet) {
        showToast('Backend and database connection verified.', 'success');
      }
    } catch (err) {
      statusPill.className = 'status-pill offline';
      statusText.textContent = 'Backend Offline';
      coldStartAlert.classList.add('active');

      if (dbStatusBadge) {
        dbStatusBadge.textContent = 'MongoDB: Reconnecting';
      }

      if (!quiet) {
        showToast(
          'Backend is initializing from idle mode. Please allow up to 45 seconds.',
          'warning'
        );
      }
    } finally {
      isCheckingHealth = false;
    }
  }

  // ========================================================
  // Render Students Table & Stats
  // ========================================================
  function updateStats(data) {
    statTotalStudents.textContent = data.length;

    const uniqueDepts = new Set(data.map((s) => s.department).filter(Boolean));
    statTotalDepts.textContent = uniqueDepts.size;

    if (data.length > 0) {
      const sumSem = data.reduce((acc, curr) => acc + (Number(curr.semester) || 0), 0);
      const avg = (sumSem / data.length).toFixed(1);
      statAvgSemester.textContent = avg;
    } else {
      statAvgSemester.textContent = '-';
    }
  }

  function renderStudents(data) {
    studentsTableBody.innerHTML = '';

    if (!data || data.length === 0) {
      tableStateContainer.style.display = 'block';
      tableStateContainer.innerHTML = `
        <div class="state-message">
          <h4>No student records found</h4>
          <p style="font-size:0.85rem;margin-top:4px;">No records match your current criteria. Register a student or clear filters.</p>
        </div>
      `;
      return;
    }

    tableStateContainer.style.display = 'none';

    data.forEach((student) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="student-badge">${escapeHtml(student.studentId)}</span></td>
        <td><strong>${escapeHtml(student.name)}</strong></td>
        <td><a href="mailto:${escapeHtml(student.email)}" style="color:var(--text-gold);text-decoration:none;">${escapeHtml(student.email)}</a></td>
        <td><span class="dept-pill">${escapeHtml(student.department)}</span></td>
        <td>Sem ${escapeHtml(String(student.semester))}</td>
        <td>${escapeHtml(student.contact || '—')}</td>
        <td>
          <div class="btn-group">
            <button class="btn btn-secondary btn-sm edit-btn" data-id="${escapeHtml(student.studentId || student._id)}">
              Edit
            </button>
            <button class="btn btn-danger btn-sm delete-btn" data-id="${escapeHtml(student.studentId || student._id)}" data-name="${escapeHtml(student.name)}">
              Delete
            </button>
          </div>
        </td>
      `;
      studentsTableBody.appendChild(tr);
    });

    // Attach row action listeners
    document.querySelectorAll('.edit-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openEditModal(id);
      });
    });

    document.querySelectorAll('.delete-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const name = e.currentTarget.getAttribute('data-name');
        handleDeleteStudent(id, name);
      });
    });
  }

  // Load students from API
  async function loadStudents() {
    tableStateContainer.style.display = 'block';
    tableStateContainer.innerHTML = `
      <div class="state-message">
        <div class="spinner"></div>
        <p style="margin-top:12px;font-size:0.85rem;">Retrieving student records from database...</p>
      </div>
    `;

    try {
      const search = searchInput.value.trim();
      const department = filterDept.value;
      const res = await API.getAllStudents(search, department);

      students = res.data || [];
      renderStudents(students);
      updateStats(students);
    } catch (err) {
      tableStateContainer.style.display = 'block';
      tableStateContainer.innerHTML = `
        <div class="state-message">
          <h4>Failed to load student records</h4>
          <p style="color:var(--danger);font-size:0.85rem;">${escapeHtml(err.message)}</p>
          <button id="retry-load-btn" class="btn btn-primary btn-sm" style="margin-top:12px;">Retry Request</button>
        </div>
      `;
      const retryBtn = document.getElementById('retry-load-btn');
      if (retryBtn) retryBtn.addEventListener('click', loadStudents);
    }
  }

  // ========================================================
  // Form Submission: Add Student
  // ========================================================
  addStudentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = addStudentForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px;"></span> Saving...';

    const newStudent = {
      studentId: document.getElementById('student-id').value.trim(),
      name: document.getElementById('student-name').value.trim(),
      email: document.getElementById('student-email').value.trim(),
      department: document.getElementById('student-dept').value.trim(),
      semester: Number(document.getElementById('student-semester').value),
      contact: document.getElementById('student-contact').value.trim(),
    };

    try {
      const res = await API.createStudent(newStudent);
      showToast(res.message || 'Student registered successfully.', 'success');
      addStudentForm.reset();
      await loadStudents();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });

  // ========================================================
  // Edit Student Modal & Update
  // ========================================================
  async function openEditModal(id) {
    try {
      const res = await API.getStudentById(id);
      const student = res.data;
      activeStudentForEdit = student;

      document.getElementById('edit-student-id').value = student.studentId;
      document.getElementById('edit-student-name').value = student.name;
      document.getElementById('edit-student-email').value = student.email;
      document.getElementById('edit-student-dept').value = student.department;
      document.getElementById('edit-student-semester').value = student.semester;
      document.getElementById('edit-student-contact').value = student.contact || '';

      editModal.classList.add('active');
    } catch (err) {
      showToast(`Error retrieving student: ${err.message}`, 'error');
    }
  }

  function closeEditModal() {
    editModal.classList.remove('active');
    activeStudentForEdit = null;
    editForm.reset();
  }

  closeEditModalBtn.addEventListener('click', closeEditModal);
  cancelEditBtn.addEventListener('click', closeEditModal);

  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activeStudentForEdit) return;

    const id = activeStudentForEdit.studentId || activeStudentForEdit._id;
    const updatedData = {
      name: document.getElementById('edit-student-name').value.trim(),
      email: document.getElementById('edit-student-email').value.trim(),
      department: document.getElementById('edit-student-dept').value.trim(),
      semester: Number(document.getElementById('edit-student-semester').value),
      contact: document.getElementById('edit-student-contact').value.trim(),
    };

    try {
      const res = await API.updateStudent(id, updatedData);
      showToast(res.message || 'Student record updated successfully.', 'success');
      closeEditModal();
      await loadStudents();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // ========================================================
  // Delete Student
  // ========================================================
  async function handleDeleteStudent(id, name) {
    const confirmDelete = window.confirm(
      `Are you sure you want to remove student "${name}" (ID: ${id})?\n\nThis will permanently delete the record from the database.`
    );

    if (!confirmDelete) return;

    try {
      const res = await API.deleteStudent(id);
      showToast(res.message || `Student ${id} removed successfully.`, 'success');
      await loadStudents();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // ========================================================
  // Search & Filter Events
  // ========================================================
  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      loadStudents();
    }, 300);
  });

  filterDept.addEventListener('change', () => {
    loadStudents();
  });

  refreshBtn.addEventListener('click', () => {
    checkServerHealth(false);
    loadStudents();
  });

  // ========================================================
  // Settings Modal (Configuring API URL)
  // ========================================================
  settingsBtn.addEventListener('click', () => {
    apiUrlInput.value = API.getBaseUrl();
    settingsModal.classList.add('active');
  });

  closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('active');
  });

  saveSettingsBtn.addEventListener('click', async () => {
    const url = apiUrlInput.value.trim();
    if (!url) {
      showToast('Please provide a valid URL', 'warning');
      return;
    }

    window.APP_CONFIG.setApiUrl(url);
    settingsModal.classList.remove('active');
    showToast(`API URL updated to: ${url}`, 'info');

    await checkServerHealth(false);
    await loadStudents();
  });

  resetSettingsBtn.addEventListener('click', async () => {
    window.APP_CONFIG.resetApiUrl();
    apiUrlInput.value = window.APP_CONFIG.DEFAULT_API_URL;
    settingsModal.classList.remove('active');
    showToast('API URL reset to default configuration.', 'info');

    await checkServerHealth(false);
    await loadStudents();
  });

  // Utility to escape HTML and prevent XSS
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial Load
  checkServerHealth(true);
  loadStudents();

  // Periodic health check every 45 seconds to keep connection live
  setInterval(() => {
    checkServerHealth(true);
  }, 45000);
});
