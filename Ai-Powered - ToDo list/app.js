let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let recording = false;
let recognition;
let interimText = "";

const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priority");
const taskList = document.getElementById("taskList");
const micBtn = document.getElementById("micBtn");
const preview = document.getElementById("preview");
const langSelect = document.getElementById("language");

function updateLocalStorage() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = task.completed ? "completed" : "";

    li.innerHTML = `
      <strong>Task #${index + 1}</strong>
      <div>${task.text}</div>
      ${!task.completed ? `<div>Priority: ${task.priority}</div>` : ""}
      <div class="text-xs">${task.timestamp}</div>
      <div class="task-actions">
        ${!task.completed ? `<button class="complete" onclick="completeTask(${index})">✔</button>` : ""}
        <button class="delete" onclick="deleteTask(${index})">🗑️</button>
      </div>
    `;

    taskList.appendChild(li);
  });
}

function addTask() {
  const text = taskInput.value.trim();
  const priority = parseInt(priorityInput.value);
  if (!text) return;

  const date = new Date();
  const timestamp = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  const newTask = { text, priority, timestamp, completed: false };
  tasks.push(newTask);
  tasks.sort((a, b) => a.priority - b.priority);
  taskInput.value = "";
  preview.innerText = "";
  updateLocalStorage();
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  updateLocalStorage();
  renderTasks();
}

function completeTask(index) {
  tasks[index].completed = true;
  updateLocalStorage();
  renderTasks();
}

function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech Recognition not supported in this browser.");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = langSelect.value;

  recognition.onresult = (event) => {
    let finalTranscript = "";
    interimText = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + " ";
      } else {
        interimText += transcript;
      }
    }

    taskInput.value += finalTranscript;
    preview.innerText = taskInput.value + interimText;
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event?.error || event);
    if (event.error === "not-allowed") {
      alert("Microphone permission was denied.");
    }
  };
}

function toggleRecording() {
  if (!recognition) return;

  if (recording) {
    recognition.stop();
    recording = false;
    micBtn.classList.remove("recording");
  } else {
    taskInput.value = "";
    preview.innerText = "";
    recognition.lang = langSelect.value;
    recognition.start();
    recording = true;
    micBtn.classList.add("recording");
  }
}

document.getElementById("addBtn").addEventListener("click", addTask);
micBtn.addEventListener("click", toggleRecording);
langSelect.addEventListener("change", () => {
  if (recognition) recognition.lang = langSelect.value;
});

initSpeechRecognition();
renderTasks();
