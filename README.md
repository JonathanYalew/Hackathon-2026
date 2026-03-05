# MedGuide — Smart Medication Reminder (Prototype)

A front-end prototype for a **smart medication reminder and guidance application** designed for dementia patients (e.g. Alzheimer’s). It simulates how a patient interacts with a home-based AI medication system using a **touchscreen smart display** and a **connected wearable wristband**.

## Purpose

- Guide dementia patients **step-by-step** through their medication routine.
- Reduce risk of forgetting or taking incorrect medication.
- Support **low-resource** and home settings with minimal caregiver supervision.

## What’s Included

### 1. Patient interface (smart display)

Runs on `index.html` — simulates a central home device (e.g. Echo Show / Nest Hub).

**Screens:**

| Screen | Purpose |
|--------|--------|
| **Home** | Current time, day, hint that medicine is in the box next to the screen. |
| **Medication reminder** | Alert at scheduled time; wristband “vibration” indicator; large “I’m here” button. |
| **Medication instructions** | Medication name, dosage, step-by-step list, medication station location. |
| **Camera verification** | Simulated “stand in front of camera” and “put medicine back” step. |
| **Completion** | Confirmation that the dose was recorded. |
| **Incomplete task** | Shown if the patient leaves mid-flow; reminder sound + wristband prompts to return. |

**Design (dementia-friendly):**

- Large text and high contrast.
- Minimal clutter, simple icons.
- Step progress (1–2–3–4).
- Voice guidance indicator.
- Clear “medication box” location prompts.

**Wristband simulation:**

- On-screen “Wristband vibrating” when a reminder is active or task is incomplete.
- Patient ID badge (minimal PII).

### 2. Caregiver dashboard

Runs on `caregiver.html`.

- **Register patient** — assign Patient ID and optional Wristband ID.
- **Medication schedules** — by Patient ID: medication name, dosage, time.
- **Authorized caregivers** — list who can retrieve medication (by Patient ID).
- **Medication logs** — completed and missed events; **missed medication alerts**.

Data is stored in `localStorage` (no backend) so the patient display and dashboard stay in sync in the same browser.

### 3. Privacy and identity

- **Unique Patient IDs** only (no names or other PII in the UI).
- **Wristband** used for authentication and alerts (simulated in the UI).

## How to run

1. Open the project folder and serve the files with any static server (or open the HTML files directly; some features use `localStorage`).
2. **Patient flow:** open `index.html`.
   - Click **“Start medication reminder”** on the home screen to simulate a reminder.
   - Follow: Reminder → Instructions → Camera → Completion (or wait to see the Incomplete screen).
3. **Caregiver:** open `caregiver.html`.
   - Register a patient, add schedules and caregivers, and check **Medication logs** and **Missed medication alerts**.

**Demo shortcut:** add `?demo=1` to the patient URL (e.g. `index.html?demo=1`) to auto-trigger a reminder after 2 seconds.

## File structure

```
Hackathon-2026-main/
├── index.html       # Patient smart display (all screens)
├── caregiver.html   # Caregiver dashboard
├── styles.css       # Shared, accessibility-focused styles
├── app.js           # Patient flow, wristband simulation, timers
├── caregiver.js     # Dashboard logic, localStorage sync
└── README.md
```

## Design priorities

- **Accessibility** — large touch targets, clear labels, semantic HTML.
- **Simplicity** — one main action per screen where possible.
- **Cognitive ease** — clear steps, repeated cues (time, day, medication box location).
- **Visual confirmation** — progress steps and “All done” screen.

## Goal of the prototype

Demonstrate how an AI-assisted system could help dementia patients safely manage medication at home while reducing the need for constant caregiver supervision, especially in low-resource settings. The prototype focuses on the **full patient journey**: reminder → instructions → verification → completion (or incomplete and return).
