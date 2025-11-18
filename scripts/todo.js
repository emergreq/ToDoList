const taskList = document.getElementById("taskList");

const todoForm = document.querySelector(".todo-form");
const SVG_NS = "http://www.w3.org/2000/svg";

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

//написать функцию addTask

function addTask() {
  const taskText = input_form.value.trim();

  if (taskText) {
    // Создаём элемент списка
    const listItem = document.createElement("li");
    listItem.classList.add("task-item");

    // Создаём чекбокс удаления
    const taskCheckbox = document.createElement("input");
    taskCheckbox.type = "checkbox";
    taskCheckbox.classList.add("task-checkbox");

    // Создаём текст задачи
    const taskSpan = document.createElement("span");
    taskSpan.textContent = taskText;
    taskSpan.classList.add("task-text");

    // Собираем элемент: чекбокс + текст
    listItem.appendChild(taskCheckbox);
    listItem.appendChild(taskSpan);

    const handleRemoval = () => {
      taskCheckbox.disabled = true;
      listItem.classList.add("task-removing");
      listItem.addEventListener(
        "animationend",
        (event) => {
          if (event.animationName === "task-slide-out") {
            if (taskList.contains(listItem)) {
              taskList.removeChild(listItem);
            }
          }
        },
        { once: true }
      );
    };

    taskCheckbox.addEventListener("change", () => {
      if (taskCheckbox.checked) {
        handleRemoval();
      }
    });

    // Добавляем в список
    taskList.appendChild(listItem);

    // Очищаем поле ввода
    input_form.value = "";
  }
}

add_button.addEventListener("click", addTask);

// Обработчик на форму (чтобы работал Enter)
add_form.addEventListener("submit", (e) => {
  e.preventDefault();
  addTask();
});
