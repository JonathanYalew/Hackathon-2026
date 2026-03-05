/**
 * MedGuide — Patient smart display flow
 * Simulates: reminder → instructions → camera verification → completion
 * Includes wristband vibration simulation and incomplete-task handling.
 */

(function () {
  'use strict';

  const PATIENT_ID = localStorage.getItem('medguide_patient_id') || 'P-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  localStorage.setItem('medguide_patient_id', PATIENT_ID);

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const DEMO_MEDICATION = {
    name: 'Morning medication',
    dosage: 'One tablet with water',
    doseText: 'one tablet',
    time: '8:00 AM',
    nextTime: '8:00 PM'
  };

  const screens = {
    home: document.getElementById('screen-home'),
    reminder: document.getElementById('screen-reminder'),
    instructions: document.getElementById('screen-instructions'),
    camera: document.getElementById('screen-camera'),
    complete: document.getElementById('screen-complete'),
    incomplete: document.getElementById('screen-incomplete')
  };

  const wristbandIndicator = document.getElementById('wristband-indicator');
  const patientBadge = document.getElementById('patient-badge');
  const patientIdValue = document.getElementById('patient-id-value');

  let currentMedication = { ...DEMO_MEDICATION };
  let inactivityTimer = null;
  let reminderSoundInterval = null;
  const INACTIVITY_MS = 25000;
  const REMINDER_SOUND_INTERVAL_MS = 8000;

  function showScreen(id) {
    Object.keys(screens).forEach(function (key) {
      const el = screens[key];
      if (!el) return;
      if (screens[key].id === 'screen-' + id) {
        el.classList.add('active');
        el.hidden = false;
      } else {
        el.classList.remove('active');
        el.hidden = true;
      }
    });
  }

  function updateClocks() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateStr = DAYS[now.getDay()] + ', ' + now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    document.querySelectorAll('.big-time').forEach(function (el) { el.textContent = timeStr; });
    document.querySelectorAll('.big-date').forEach(function (el) { el.textContent = dateStr; });
  }

  function showWristbandVibrating(show) {
    if (show) {
      wristbandIndicator.classList.remove('hidden');
    } else {
      wristbandIndicator.classList.add('hidden');
    }
  }

  function showPatientBadge(show) {
    if (patientIdValue) patientIdValue.textContent = PATIENT_ID;
    if (show) {
      patientBadge.classList.remove('hidden');
    } else {
      patientBadge.classList.add('hidden');
    }
  }

  function clearInactivityTimer() {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }
    if (reminderSoundInterval) {
      clearInterval(reminderSoundInterval);
      reminderSoundInterval = null;
    }
  }

  function startInactivityTimer() {
    clearInactivityTimer();
    inactivityTimer = setTimeout(function () {
      recordMissedEvent();
      showWristbandVibrating(true);
      showScreen('incomplete');
      reminderSoundInterval = setInterval(function () {
        showWristbandVibrating(true);
      }, REMINDER_SOUND_INTERVAL_MS);
    }, INACTIVITY_MS);
  }

  function recordMissedEvent() {
    const log = JSON.parse(localStorage.getItem('medguide_log') || '[]');
    log.push({
      patientId: PATIENT_ID,
      medication: currentMedication.name,
      completedAt: new Date().toISOString(),
      status: 'missed'
    });
    localStorage.setItem('medguide_log', JSON.stringify(log));
  }

  function fillMedicationInfo(med) {
    const nameEl = document.getElementById('instruction-med-name');
    const dosageEl = document.getElementById('instruction-dosage');
    const timeEl = document.getElementById('instruction-time');
    const doseTextEl = document.getElementById('instruction-dose-text');
    if (nameEl) nameEl.textContent = med.name;
    if (dosageEl) dosageEl.textContent = med.dosage;
    if (timeEl) timeEl.textContent = 'Scheduled: ' + med.time;
    if (doseTextEl) doseTextEl.textContent = med.doseText;

    const incName = document.getElementById('incomplete-med-name');
    const incDosage = document.getElementById('incomplete-dosage');
    if (incName) incName.textContent = med.name;
    if (incDosage) incDosage.textContent = med.dosage;
  }

  function triggerReminder() {
    currentMedication = { ...DEMO_MEDICATION };
    showPatientBadge(true);
    showWristbandVibrating(true);
    showScreen('reminder');
    updateClocks();
    document.getElementById('reminder-time').textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    document.getElementById('reminder-date').textContent = DAYS[new Date().getDay()] + ', ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function goToInstructions() {
    clearInactivityTimer();
    showWristbandVibrating(false);
    fillMedicationInfo(currentMedication);
    showScreen('instructions');
    updateClocks();
    startInactivityTimer();
  }

  function goToCamera() {
    clearInactivityTimer();
    showScreen('camera');
    document.getElementById('camera-verified').classList.add('hidden');
    setTimeout(function () {
      document.getElementById('camera-verified').classList.remove('hidden');
    }, 1500);
    startInactivityTimer();
  }

  function goToComplete() {
    clearInactivityTimer();
    showWristbandVibrating(false);
    showScreen('complete');
    updateClocks();
    var nextEl = document.getElementById('next-med-hint');
    if (nextEl) nextEl.textContent = 'Your next reminder is at ' + (currentMedication.nextTime || 'the next scheduled time') + '.';
    recordMedicationEvent();
  }

  function goToIncomplete() {
    showWristbandVibrating(true);
    fillMedicationInfo(currentMedication);
    showScreen('incomplete');
  }

  function resumeFromIncomplete() {
    clearInactivityTimer();
    showWristbandVibrating(false);
    goToInstructions();
  }

  function recordMedicationEvent() {
    const log = JSON.parse(localStorage.getItem('medguide_log') || '[]');
    log.push({
      patientId: PATIENT_ID,
      medication: currentMedication.name,
      completedAt: new Date().toISOString(),
      status: 'completed'
    });
    localStorage.setItem('medguide_log', JSON.stringify(log));
  }

  function simulateWalkAway() {
    clearInactivityTimer();
    recordMissedEvent();
    showWristbandVibrating(true);
    showScreen('incomplete');
    reminderSoundInterval = setInterval(function () {
      showWristbandVibrating(true);
    }, REMINDER_SOUND_INTERVAL_MS);
  }

  function bindButtons() {
    var demoWalkAway = document.getElementById('demo-walk-away');
    if (demoWalkAway) demoWalkAway.addEventListener('click', simulateWalkAway);

    var btnAck = document.getElementById('btn-ack-reminder');
    if (btnAck) btnAck.addEventListener('click', goToInstructions);

    var btnCamera = document.getElementById('btn-ready-camera');
    if (btnCamera) btnCamera.addEventListener('click', goToCamera);

    var btnComplete = document.getElementById('btn-complete');
    if (btnComplete) btnComplete.addEventListener('click', goToComplete);

    var btnBackHome = document.getElementById('btn-back-home');
    if (btnBackHome) btnBackHome.addEventListener('click', function () {
      showScreen('home');
      showPatientBadge(false);
    });

    var btnResume = document.getElementById('btn-resume');
    if (btnResume) btnResume.addEventListener('click', resumeFromIncomplete);
  }

  function init() {
    updateClocks();
    setInterval(updateClocks, 1000);
    showPatientBadge(false);
    bindButtons();

    var demoTrigger = document.getElementById('demo-trigger');
    if (demoTrigger) {
      demoTrigger.addEventListener('click', function () {
        triggerReminder();
      });
    }
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === '1') {
      setTimeout(triggerReminder, 2000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.MedGuide = {
    triggerReminder: triggerReminder,
    getPatientId: function () { return PATIENT_ID; }
  };
})();
