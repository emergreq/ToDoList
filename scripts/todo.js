const taskList = document.getElementById("taskList");
const STORAGE_KEY = "todo-items";
const SVG_NS = "http://www.w3.org/2000/svg";

let tasksData = [];
let currentTaskId = null;

const todoForm = document.querySelector(".todo-form");

//создаем кнопку add note
const add_button = document.createElement("button");
add_button.type = "button";
add_button.classList.add("add-button"); //создали новый класс add-button

const addButtonLabel = document.createElement("span");
addButtonLabel.classList.add("add-button__label");
addButtonLabel.textContent = "add task";

const addButtonIcon = document.createElement("span");
addButtonIcon.classList.add("add-button__icon");
addButtonIcon.setAttribute("aria-hidden", "true");

const svgIcon = document.createElementNS(SVG_NS, "svg");
svgIcon.setAttribute("width", "28");
svgIcon.setAttribute("height", "28");
svgIcon.setAttribute("viewBox", "0 -960 960 960");
svgIcon.setAttribute("fill", "none");

const svgPath = document.createElementNS(SVG_NS, "path");
svgPath.setAttribute(
  "d",
  "M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q65 0 123 19t107 53l-58 59q-38-24-81-37.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q32 0 62-6t58-17l60 61q-41 20-86 31t-94 11Zm280-80v-120H640v-80h120v-120h80v120h120v80H840v120h-80ZM424-296 254-466l56-56 114 114 400-401 56 56-456 457Z"
);
svgPath.setAttribute("fill", "#f3f2ff");

svgIcon.appendChild(svgPath);
addButtonIcon.appendChild(svgIcon);

add_button.appendChild(addButtonLabel);
add_button.appendChild(addButtonIcon);
todoForm.appendChild(add_button);

//создаем форму
const add_form = document.createElement("form");
add_form.classList.add("add-form");
todoForm.appendChild(add_form);

//создаем возможность ввода текста в форму

const input_form = document.createElement("input");
input_form.type = "text";
input_form.placeholder = "input your task here";
input_form.classList.add("animated-input");
add_form.appendChild(input_form);

const {
  overlay: taskModalOverlay,
  modalTitle,
  subtasksList,
  subtaskInput,
  subtaskForm,
  closeButton: modalCloseButton,
} = createTaskModal();

function generateId() {
  return (
    Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
  );
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksData));
}

function restoreTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      tasksData = [];
      return;
    }
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      tasksData = [];
      return;
    }
    tasksData = parsed
      .map((entry) => normalizeTask(entry))
      .filter(Boolean);
  } catch (error) {
    console.error("Failed to restore tasks:", error);
    tasksData = [];
  }
}

function normalizeTask(entry) {
  if (typeof entry === "string") {
    const text = entry.trim();
    return text
      ? {
          id: generateId(),
          text,
          subtasks: [],
        }
      : null;
  }

  if (!entry || typeof entry !== "object") return null;

  const text = typeof entry.text === "string" ? entry.text.trim() : "";
  if (!text) return null;

  const subtasks = Array.isArray(entry.subtasks)
    ? entry.subtasks
        .map((subtask) => {
          if (!subtask || typeof subtask.text !== "string") return null;
          const subtaskText = subtask.text.trim();
          return subtaskText
            ? {
                id: subtask.id || generateId(),
                text: subtaskText,
              }
            : null;
        })
        .filter(Boolean)
    : [];

  return {
    id: entry.id || generateId(),
    text,
    subtasks,
  };
}

//написать функцию addTask

function addTask(presetText = null, options = {}) {
  const taskTextSource =
    typeof presetText === "string" ? presetText : input_form.value;
  const taskText = taskTextSource.trim();
  const skipSave = Boolean(options.skipSave);

  if (!taskText) return;

  const newTask = {
    id: options.id || generateId(),
    text: taskText,
    subtasks: Array.isArray(options.subtasks) ? options.subtasks : [],
  };

  tasksData.push(newTask);
  renderTasks();

  if (presetText === null) {
    input_form.value = "";
  }

  if (!skipSave) {
    saveTasks();
  }
}

add_button.addEventListener("click", addTask);

// Обработчик на форму (чтобы работал Enter)
add_form.addEventListener("submit", (e) => {
  e.preventDefault();
  addTask();
});

modalCloseButton.addEventListener("click", closeTaskModal);
taskModalOverlay.addEventListener("click", (event) => {
  if (event.target === taskModalOverlay) {
    closeTaskModal();
  }
});

subtaskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!currentTaskId) return;
  const text = subtaskInput.value.trim();
  if (!text) return;
  const task = tasksData.find((entry) => entry.id === currentTaskId);
  if (!task) return;
  task.subtasks.push({
    id: generateId(),
    text,
  });
  subtaskInput.value = "";
  renderSubtasks(task);
  saveTasks();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeTaskModal();
  }
});

restoreTasks();
renderTasks();

function renderTasks() {
  taskList.innerHTML = "";

  tasksData.forEach((task) => {
    const listItem = document.createElement("li");
    listItem.classList.add("task-item");
    listItem.dataset.taskId = task.id;

    const taskCheckbox = document.createElement("input");
    taskCheckbox.type = "checkbox";
    taskCheckbox.classList.add("task-checkbox");

    const taskContentButton = document.createElement("button");
    taskContentButton.type = "button";
    taskContentButton.classList.add("task-content");

    const taskSpan = document.createElement("span");
    taskSpan.textContent = task.text;
    taskSpan.classList.add("task-text");

    taskContentButton.append(taskSpan);

    taskCheckbox.addEventListener("change", () => {
      if (taskCheckbox.checked) {
        handleRemoval(task.id, listItem);
      }
    });

    taskContentButton.addEventListener("click", () => {
      openTaskModal(task.id);
    });

    listItem.append(taskCheckbox, taskContentButton);
    taskList.appendChild(listItem);
  });
}

function handleRemoval(taskId, listItem) {
  listItem.classList.add("task-removing");
  listItem.addEventListener(
    "animationend",
    (event) => {
      if (event.animationName === "task-slide-out") {
        tasksData = tasksData.filter((task) => task.id !== taskId);
        if (currentTaskId === taskId) {
          closeTaskModal();
        }
        saveTasks();
        renderTasks();
      }
    },
    { once: true }
  );
}

function openTaskModal(taskId) {
  const task = tasksData.find((entry) => entry.id === taskId);
  if (!task) return;

  currentTaskId = taskId;
  modalTitle.textContent = task.text;
  renderSubtasks(task);
  subtaskInput.value = "";

  taskModalOverlay.classList.add("is-visible");
  document.body.classList.add("modal-open");
}

function closeTaskModal() {
  taskModalOverlay.classList.remove("is-visible");
  document.body.classList.remove("modal-open");
  currentTaskId = null;
}

function renderSubtasks(task) {
  subtasksList.innerHTML = "";
  if (!task.subtasks.length) {
    const placeholder = document.createElement("li");
    placeholder.classList.add("subtasks-empty");
    placeholder.textContent = "Подзадач пока нет";
    subtasksList.appendChild(placeholder);
    return;
  }

  task.subtasks.forEach((subtask) => {
    const subtaskItem = document.createElement("li");
    subtaskItem.classList.add("subtask-item");

    const subtaskCheckbox = document.createElement("input");
    subtaskCheckbox.type = "checkbox";
    subtaskCheckbox.classList.add("subtask-checkbox");

    const subtaskText = document.createElement("span");
    subtaskText.textContent = subtask.text;

    subtaskItem.append(subtaskCheckbox, subtaskText);
    subtasksList.appendChild(subtaskItem);

    subtaskCheckbox.addEventListener("change", () => {
      if (subtaskCheckbox.checked) {
        subtaskItem.classList.add("subtask-removing");
        subtaskCheckbox.disabled = true;
        subtaskItem.addEventListener(
          "animationend",
          (event) => {
            if (event.animationName === "subtask-fade-out") {
              task.subtasks = task.subtasks.filter(
                (entry) => entry.id !== subtask.id
              );
              saveTasks();
              renderSubtasks(task);
            }
          },
          { once: true }
        );
      }
    });
  });
}

function createTaskModal() {
  const overlay = document.createElement("div");
  overlay.classList.add("task-modal-overlay");

  const modal = document.createElement("div");
  modal.classList.add("task-modal");

  const header = document.createElement("div");
  header.classList.add("task-modal__header");

  const title = document.createElement("h2");
  title.classList.add("task-modal__title");
  title.textContent = "Задача";

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.classList.add("task-modal__close");
  closeButton.setAttribute("aria-label", "Закрыть");
  closeButton.textContent = "×";

  const subtasksTitle = document.createElement("p");
  subtasksTitle.classList.add("subtasks-title");
  subtasksTitle.textContent = "Подзадачи";

  const subtasksList = document.createElement("ul");
  subtasksList.classList.add("subtasks-list");

  const subtaskForm = document.createElement("form");
  subtaskForm.classList.add("subtask-form");

  const subtaskInput = document.createElement("input");
  subtaskInput.type = "text";
  subtaskInput.placeholder = "add subtask";
  subtaskInput.classList.add("subtask-input");

  const subtaskButton = document.createElement("button");
  subtaskButton.type = "submit";
  subtaskButton.classList.add("subtask-submit");
  subtaskButton.textContent = "Add";

  subtaskForm.append(subtaskInput, subtaskButton);
  header.append(title, closeButton);
  modal.append(header, subtasksTitle, subtasksList, subtaskForm);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  return {
    overlay,
    modalTitle: title,
    subtasksList,
    subtaskInput,
    subtaskForm,
    closeButton,
  };
}
