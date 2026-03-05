/**
 * MedGuide — Caregiver Dashboard
 * Register patients (Patient ID only), schedules, caregivers; view medication logs.
 * Data stored in localStorage to simulate backend; shared with patient display.
 */

(function () {
  'use strict';

  const STORAGE_PATIENTS = 'medguide_patients';
  const STORAGE_SCHEDULES = 'medguide_schedules';
  const STORAGE_CAREGIVERS = 'medguide_caregivers';
  const STORAGE_LOG = 'medguide_log';

  function getPatients() {
    return JSON.parse(localStorage.getItem(STORAGE_PATIENTS) || '[]');
  }

  function setPatients(arr) {
    localStorage.setItem(STORAGE_PATIENTS, JSON.stringify(arr));
  }

  function getSchedules() {
    return JSON.parse(localStorage.getItem(STORAGE_SCHEDULES) || '[]');
  }

  function setSchedules(arr) {
    localStorage.setItem(STORAGE_SCHEDULES, JSON.stringify(arr));
  }

  function getCaregivers() {
    return JSON.parse(localStorage.getItem(STORAGE_CAREGIVERS) || '[]');
  }

  function setCaregivers(arr) {
    localStorage.setItem(STORAGE_CAREGIVERS, JSON.stringify(arr));
  }

  function getLog() {
    return JSON.parse(localStorage.getItem(STORAGE_LOG) || '[]');
  }

  function ensureCurrentPatientInList() {
    var patientId = localStorage.getItem('medguide_patient_id');
    if (!patientId) return;
    var patients = getPatients();
    if (!patients.some(function (p) { return p.id === patientId; })) {
      patients.push({ id: patientId, wristbandId: 'WB-linked', lastActivity: new Date().toISOString() });
      setPatients(patients);
    }
  }

  function renderPatients() {
    ensureCurrentPatientInList();
    var patients = getPatients();
    var tbody = document.getElementById('patients-tbody');
    var selectSchedule = document.getElementById('schedule-patient');
    var selectCaregiver = document.getElementById('caregiver-patient');
    if (!tbody) return;

    tbody.innerHTML = patients.map(function (p) {
      return '<tr><td>' + escapeHtml(p.id) + '</td><td>' + escapeHtml(p.wristbandId || '—') + '</td><td class="status-ok">Active</td><td>' + formatDate(p.lastActivity) + '</td></tr>';
    }).join('');

    var options = '<option value="">— Select patient —</option>' + patients.map(function (p) {
      return '<option value="' + escapeHtml(p.id) + '">' + escapeHtml(p.id) + '</option>';
    }).join('');
    if (selectSchedule) selectSchedule.innerHTML = options;
    if (selectCaregiver) selectCaregiver.innerHTML = options;
  }

  function renderSchedules() {
    var schedules = getSchedules();
    var tbody = document.getElementById('schedules-tbody');
    if (!tbody) return;
    tbody.innerHTML = schedules.length === 0
      ? '<tr><td colspan="4">No schedules yet. Add one above.</td></tr>'
      : schedules.map(function (s) {
          return '<tr><td>' + escapeHtml(s.patientId) + '</td><td>' + escapeHtml(s.medName) + '</td><td>' + escapeHtml(s.dosage) + '</td><td>' + escapeHtml(s.time) + '</td></tr>';
        }).join('');
  }

  function renderCaregivers() {
    var caregivers = getCaregivers();
    var tbody = document.getElementById('caregivers-tbody');
    if (!tbody) return;
    tbody.innerHTML = caregivers.length === 0
      ? '<tr><td colspan="2">No caregivers added yet.</td></tr>'
      : caregivers.map(function (c) {
          return '<tr><td>' + escapeHtml(c.patientId) + '</td><td>' + escapeHtml(c.caregiverId) + '</td></tr>';
        }).join('');
  }

  function renderLogs() {
    var log = getLog();
    var tbody = document.getElementById('logs-tbody');
    var missedDiv = document.getElementById('missed-alerts');
    if (!tbody) return;

    var sorted = log.slice().sort(function (a, b) {
      return new Date(b.completedAt) - new Date(a.completedAt);
    });

    tbody.innerHTML = sorted.length === 0
      ? '<tr><td colspan="4">No medication events yet. Complete a flow on the patient display.</td></tr>'
      : sorted.slice(0, 50).map(function (e) {
          var statusClass = e.status === 'completed' ? 'status-ok' : 'status-missed';
          return '<tr><td>' + escapeHtml(e.patientId) + '</td><td>' + escapeHtml(e.medication) + '</td><td class="' + statusClass + '">' + escapeHtml(e.status) + '</td><td>' + formatDate(e.completedAt) + '</td></tr>';
        }).join('');

    var missed = sorted.filter(function (e) { return e.status === 'missed'; });
    if (missedDiv) {
      if (missed.length === 0) {
        missedDiv.innerHTML = '<p class="status-ok">No missed medication alerts.</p>';
      } else {
        missedDiv.innerHTML = '<div class="alert-badge alert-urgent">Missed: ' + missed.length + ' — Patient ID ' + escapeHtml(missed[0].patientId) + '</div>';
      }
    }
  }

  function escapeHtml(s) {
    if (s == null) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function formatDate(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function showRegisterForm(show) {
    var el = document.getElementById('register-form');
    if (!el) return;
    if (show) el.classList.remove('hidden'); else el.classList.add('hidden');
  }

  function registerPatient() {
    var idInput = document.getElementById('new-patient-id');
    var wristInput = document.getElementById('wristband-id');
    var id = (idInput && idInput.value) ? idInput.value.trim() : '';
    var wrist = (wristInput && wristInput.value) ? wristInput.value.trim() : '';
    if (!id) {
      alert('Please enter a Patient ID.');
      return;
    }
    var patients = getPatients();
    if (patients.some(function (p) { return p.id === id; })) {
      alert('This Patient ID is already registered.');
      return;
    }
    patients.push({ id: id, wristbandId: wrist || '—', lastActivity: new Date().toISOString() });
    setPatients(patients);
    idInput.value = '';
    if (wristInput) wristInput.value = '';
    showRegisterForm(false);
    renderPatients();
  }

  function addSchedule() {
    var patientSelect = document.getElementById('schedule-patient');
    var medName = document.getElementById('schedule-med-name');
    var dosage = document.getElementById('schedule-dosage');
    var timeInput = document.getElementById('schedule-time');
    var patientId = patientSelect && patientSelect.value ? patientSelect.value : '';
    if (!patientId) {
      alert('Please select a patient.');
      return;
    }
    var time = timeInput && timeInput.value ? timeInput.value : '08:00';
    var h = parseInt(time.slice(0, 2), 10);
    var m = time.slice(3, 5);
    var timeStr = (h > 12 ? h - 12 : h === 0 ? 12 : h) + ':' + m + ' ' + (h >= 12 ? 'PM' : 'AM');
    var schedules = getSchedules();
    schedules.push({
      patientId: patientId,
      medName: (medName && medName.value) ? medName.value.trim() : 'Scheduled medication',
      dosage: (dosage && dosage.value) ? dosage.value.trim() : 'As prescribed',
      time: timeStr
    });
    setSchedules(schedules);
    if (medName) medName.value = '';
    if (dosage) dosage.value = '';
    renderSchedules();
  }

  function addCaregiver() {
    var patientSelect = document.getElementById('caregiver-patient');
    var nameInput = document.getElementById('caregiver-name');
    var patientId = patientSelect && patientSelect.value ? patientSelect.value : '';
    var name = (nameInput && nameInput.value) ? nameInput.value.trim() : '';
    if (!patientId || !name) {
      alert('Please select a patient and enter a caregiver identifier.');
      return;
    }
    var caregivers = getCaregivers();
    caregivers.push({ patientId: patientId, caregiverId: name });
    setCaregivers(caregivers);
    if (nameInput) nameInput.value = '';
    renderCaregivers();
  }

  function bind() {
    var btnRegister = document.getElementById('btn-register-patient');
    var btnSave = document.getElementById('btn-save-patient');
    var btnCancel = document.getElementById('btn-cancel-register');
    if (btnRegister) btnRegister.addEventListener('click', function () { showRegisterForm(true); });
    if (btnSave) btnSave.addEventListener('click', registerPatient);
    if (btnCancel) btnCancel.addEventListener('click', function () { showRegisterForm(false); });

    var btnAddSchedule = document.getElementById('btn-add-schedule');
    if (btnAddSchedule) btnAddSchedule.addEventListener('click', addSchedule);

    var btnAddCaregiver = document.getElementById('btn-add-caregiver');
    if (btnAddCaregiver) btnAddCaregiver.addEventListener('click', addCaregiver);
  }

  function init() {
    ensureCurrentPatientInList();
    renderPatients();
    renderSchedules();
    renderCaregivers();
    renderLogs();
    bind();
    setInterval(renderLogs, 5000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
