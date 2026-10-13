const taskInput = document.getElementById("taskInput");
const dueDate = document.getElementById("dueDate");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const themeBtn = document.getElementById("themeBtn");

let tasks = [];

try {
    const savedTasks = JSON.parse(
        localStorage.getItem("myTasks") || "[]"
    );

    if (Array.isArray(savedTasks)) {
        tasks = savedTasks.filter(task =>
            task &&
            typeof task.text === "string" &&
            typeof task.completed === "boolean" &&
            typeof task.id === "string"
        );
    }
} catch {
    tasks = [];
}

let currentFilter = "all";

function saveTasks() {
    localStorage.setItem("myTasks", JSON.stringify(tasks));
}

function addTask() {
    const text = taskInput.value.trim();

    if (text === "") {
        alert("Please enter a task!");
        taskInput.focus();
        return;
    }

    tasks.push({
        id: crypto.randomUUID(),
        text: text,
        date: dueDate.value,
        completed: false
    });

    taskInput.value = "";
    dueDate.value = "";

    saveTasks();
    renderTasks();
    taskInput.focus();
}

function renderTasks() {
    taskList.replaceChildren();

    const searchText = searchInput.value.toLowerCase();

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.text.toLowerCase()
            .includes(searchText);

        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "pending" && !task.completed) ||
            (currentFilter === "completed" && task.completed);

        return matchesSearch && matchesFilter;
    });

    filteredTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item";

        if (task.completed) {
            li.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Mark task completed");

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const textContainer = document.createElement("div");
        textContainer.className = "task-text";

        const taskName = document.createElement("span");
        taskName.textContent = task.text;

        textContainer.appendChild(taskName);

        if (task.date) {
            const dateLabel = document.createElement("span");
            dateLabel.className = "task-date";
            dateLabel.textContent = "Due: " + task.date;

            if (
                task.date < new Date().toLocaleDateString("en-CA") &&
                !task.completed
            ) {
                dateLabel.classList.add("overdue");
                dateLabel.textContent += " (Overdue)";
            }

            textContainer.appendChild(dateLabel);
        }

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "edit-btn";

        editBtn.addEventListener("click", () => {
            const updatedText = prompt("Edit your task:", task.text);

            if (updatedText === null) return;

            if (updatedText.trim() === "") {
                alert("Task cannot be empty!");
                return;
            }

            task.text = updatedText.trim().slice(0, 200);
            saveTasks();
            renderTasks();
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-btn";

        deleteBtn.addEventListener("click", () => {
            if (confirm("Do you want to delete this task?")) {
                tasks = tasks.filter(item => item.id !== task.id);
                saveTasks();
                renderTasks();
            }
        });

        li.append(checkbox, textContainer, editBtn, deleteBtn);
        taskList.appendChild(li);
    });

    document.getElementById("totalCount").textContent = tasks.length;

    document.getElementById("completedCount").textContent =
        tasks.filter(task => task.completed).length;

    document.getElementById("pendingCount").textContent =
        tasks.filter(task => !task.completed).length;

    document.getElementById("emptyMessage").hidden =
        filteredTasks.length !== 0;

    document.getElementById("emptyMessage").textContent =
        tasks.length === 0
            ? "No tasks yet. Add your first task! 🎯"
            : "No matching tasks found.";
}

addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        addTask();
    }
});

searchInput.addEventListener("input", renderTasks);

document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        document.querySelectorAll(".filter").forEach(filter => {
            filter.classList.remove("active");
        });

        button.classList.add("active");
        renderTasks();
    });
});

document.getElementById("clearCompleted").addEventListener("click", () => {
    const completedTasks = tasks.filter(task => task.completed);

    if (completedTasks.length === 0) {
        alert("There are no completed tasks to clear.");
        return;
    }

    if (confirm("Delete all completed tasks?")) {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
    }
});

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");

    themeBtn.textContent = isDark ? "☀️" : "🌙";

    localStorage.setItem("darkMode", isDark ? "true" : "false");
});

if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
    themeBtn.textContent = "☀️";
}

renderTasks();