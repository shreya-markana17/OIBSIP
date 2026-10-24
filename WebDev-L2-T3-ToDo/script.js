const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");

const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");

const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");
const totalCount = document.getElementById("totalCount");

const pendingBadge = document.getElementById("pendingBadge");
const completedBadge = document.getElementById("completedBadge");

const pendingEmpty = document.getElementById("pendingEmpty");
const completedEmpty = document.getElementById("completedEmpty");

const progressPercent = document.getElementById("progressPercent");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

const dateDisplay = document.getElementById("dateDisplay");

let tasks = JSON.parse(localStorage.getItem("taskflowTasks")) || [];

/* =========================
   INITIAL SETUP
========================= */

displayCurrentDate();
renderTasks();

/* =========================
   ADD TASK
========================= */

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addTask();
  }
});

function addTask() {
  const text = taskInput.value.trim();

  if (text === "") {
    taskInput.focus();
    return;
  }

  const newTask = {
    id: Date.now(),
    text: text,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };

  tasks.unshift(newTask);

  saveTasks();
  renderTasks();

  taskInput.value = "";
  taskInput.focus();
}

/* =========================
   RENDER TASKS
========================= */

function renderTasks() {
  pendingTasks.innerHTML = "";
  completedTasks.innerHTML = "";

  const pending = tasks.filter((task) => !task.completed);
  const completed = tasks.filter((task) => task.completed);

  pending.forEach((task) => {
    pendingTasks.appendChild(createTaskElement(task));
  });

  completed.forEach((task) => {
    completedTasks.appendChild(createTaskElement(task));
  });

  updateEmptyStates(pending, completed);
  updateCounts(pending, completed);
  updateProgress(pending, completed);
}

/* =========================
   CREATE TASK CARD
========================= */

function createTaskElement(task) {
  const taskCard = document.createElement("article");

  taskCard.className = "task-card";

  if (task.completed) {
    taskCard.classList.add("completed");
  }

  /* Complete button */

  const completeButton = document.createElement("button");

  completeButton.className = "complete-btn";
  completeButton.type = "button";
  completeButton.textContent = task.completed ? "✓" : "";

  completeButton.setAttribute(
    "aria-label",
    task.completed ? "Mark as pending" : "Mark as complete",
  );

  completeButton.addEventListener("click", () => {
    toggleTask(task.id);
  });

  /* Task content */

  const taskContent = document.createElement("div");

  taskContent.className = "task-content";

  const taskText = document.createElement("p");

  taskText.className = "task-text";
  taskText.textContent = task.text;

  const taskTime = document.createElement("span");

  taskTime.className = "task-time";

  if (task.completed && task.completedAt) {
    taskTime.textContent = `Completed ${formatDate(task.completedAt)}`;
  } else {
    taskTime.textContent = `Added ${formatDate(task.createdAt)}`;
  }

  taskContent.appendChild(taskText);
  taskContent.appendChild(taskTime);

  /* Actions */

  const taskActions = document.createElement("div");

  taskActions.className = "task-actions";

  /* Edit button */

  const editButton = document.createElement("button");

  editButton.className = "task-action";
  editButton.type = "button";
  editButton.textContent = "✎";
  editButton.title = "Edit task";
  editButton.setAttribute("aria-label", "Edit task");

  editButton.addEventListener("click", () => {
    startEditing(task, taskContent);
  });

  /* Delete button */

  const deleteButton = document.createElement("button");

  deleteButton.className = "task-action delete-action";
  deleteButton.type = "button";
  deleteButton.textContent = "×";
  deleteButton.title = "Delete task";
  deleteButton.setAttribute("aria-label", "Delete task");

  deleteButton.addEventListener("click", () => {
    deleteTask(task.id);
  });

  taskActions.appendChild(editButton);
  taskActions.appendChild(deleteButton);

  taskCard.appendChild(completeButton);
  taskCard.appendChild(taskContent);
  taskCard.appendChild(taskActions);

  return taskCard;
}

/* =========================
   COMPLETE / UNCOMPLETE
========================= */

function toggleTask(id) {
  tasks = tasks.map((task) => {
    if (task.id === id) {
      const isCompleting = !task.completed;

      return {
        ...task,
        completed: isCompleting,
        completedAt: isCompleting ? new Date().toISOString() : null,
      };
    }

    return task;
  });

  saveTasks();
  renderTasks();
}

/* =========================
   EDIT TASK
========================= */

function startEditing(task, taskContent) {
  taskContent.innerHTML = "";

  const editInput = document.createElement("input");

  editInput.className = "edit-input";
  editInput.type = "text";
  editInput.value = task.text;
  editInput.maxLength = 120;

  taskContent.appendChild(editInput);

  editInput.focus();
  editInput.select();

  let saved = false;

  function saveEdit() {
    if (saved) {
      return;
    }

    const updatedText = editInput.value.trim();

    if (updatedText === "") {
      renderTasks();
      return;
    }

    saved = true;

    tasks = tasks.map((item) => {
      if (item.id === task.id) {
        return {
          ...item,
          text: updatedText,
        };
      }

      return item;
    });

    saveTasks();
    renderTasks();
  }

  editInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      saveEdit();
    }

    if (event.key === "Escape") {
      renderTasks();
    }
  });

  editInput.addEventListener("blur", saveEdit);
}

/* =========================
   DELETE TASK
========================= */

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);

  saveTasks();
  renderTasks();
}

/* =========================
   EMPTY STATES
========================= */

function updateEmptyStates(pending, completed) {
  if (pending.length === 0) {
    pendingTasks.appendChild(pendingEmpty);
  }

  if (completed.length === 0) {
    completedTasks.appendChild(completedEmpty);
  }
}

/* =========================
   COUNTS
========================= */

function updateCounts(pending, completed) {
  const pendingTotal = pending.length;
  const completedTotal = completed.length;
  const total = pendingTotal + completedTotal;

  pendingCount.textContent = pendingTotal;
  completedCount.textContent = completedTotal;
  totalCount.textContent = total;

  pendingBadge.textContent = pendingTotal;
  completedBadge.textContent = completedTotal;
}

/* =========================
   PROGRESS
========================= */

function updateProgress(pending, completed) {
  const total = pending.length + completed.length;

  if (total === 0) {
    progressPercent.textContent = "0%";
    progressBar.style.width = "0%";
    progressText.textContent = "No completed tasks yet";
    return;
  }

  const percentage = Math.round((completed.length / total) * 100);

  progressPercent.textContent = `${percentage}%`;
  progressBar.style.width = `${percentage}%`;

  if (completed.length === total) {
    progressText.textContent = "Everything is complete. Great work!";
  } else {
    progressText.textContent = `${completed.length} of ${total} tasks completed`;
  }
}

/* =========================
   DATE
========================= */

function displayCurrentDate() {
  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  dateDisplay.textContent = formattedDate;
}

/* =========================
   TIME FORMAT
========================= */

function formatDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/* =========================
   LOCAL STORAGE
========================= */

function saveTasks() {
  localStorage.setItem("taskflowTasks", JSON.stringify(tasks));
}
