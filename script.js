const taskInput = document.getElementById('taskInput');
const categoryInput = document.getElementById('categoryInput');
const priorityInput = document.getElementById('priorityInput');
const dueDateInput = document.getElementById('dueDateInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');

const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterSelect');
const filterCategory = document.getElementById('filterCategory');

const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const pendingCount = document.getElementById('pendingCount');

const themeToggleBtn = document.getElementById('themeToggleBtn');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let isDarkMode = localStorage.getItem('theme') !== 'light';

if (!isDarkMode) document.body.classList.replace('dark-mode', 'light-mode');

themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
    isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    themeToggleBtn.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateStats();
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    totalCount.textContent = total;
    completedCount.textContent = completed;
    pendingCount.textContent = total - completed;
}

function renderTasks() {
    taskList.innerHTML = '';

    const searchText = searchInput.value.toLowerCase();
    const filterValue = filterSelect.value;
    const categoryValue = filterCategory.value;

    tasks.forEach((task, index) => {
        const matchesSearch = task.text.toLowerCase().includes(searchText);
        const matchesStatus = 
            filterValue === 'all' ||
            (filterValue === 'completed' && task.completed) ||
            (filterValue === 'pending' && !task.completed);
        const matchesCategory = categoryValue === 'all' || task.category === categoryValue;

        if (matchesSearch && matchesStatus && matchesCategory) {
            const li = document.createElement('li');
            li.className = `priority-${task.priority} ${task.completed ? 'completed' : ''}`;

            let formattedDate = 'No due date';
            if (task.dueDate) {
                const parts = task.dueDate.split('-');
                if (parts.length === 3) {
                    formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
            }

            if (task.isEditing) {
                li.innerHTML = `
                    <div class="task-info">
                        <input type="text" id="edit-input-${index}" class="edit-input" value="${task.text}">
                    </div>
                    <div class="task-actions">
                        <button class="action-btn save-btn" onclick="saveEdit(${index})"><i class="fas fa-check"></i></button>
                    </div>
                `;
            } else {
                li.innerHTML = `
                    <div class="task-info">
                        <span class="task-text">${task.text}</span>
                        <div class="task-meta">
                            <span class="badge">${task.category}</span>
                            <span><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="action-btn complete-btn" onclick="toggleComplete(${index})"><i class="fas fa-check-circle"></i></button>
                        <button class="action-btn edit-btn" onclick="enableEdit(${index})"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete-btn" onclick="deleteTask(${index})"><i class="fas fa-trash"></i></button>
                    </div>
                `;
            }
            taskList.appendChild(li);
        }
    });

    updateStats();
}

function addTask() {
    const text = taskInput.value.trim();
    if (!text) return alert('Please enter a task name!');

    tasks.push({
        text,
        category: categoryInput.value,
        priority: priorityInput.value,
        dueDate: dueDateInput.value,
        completed: false,
        isEditing: false
    });

    taskInput.value = '';
    dueDateInput.value = '';
    saveTasks();
    renderTasks();
}

function toggleComplete(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
}

function enableEdit(index) {
    tasks[index].isEditing = true;
    renderTasks();
    const editInput = document.getElementById(`edit-input-${index}`);
    if (editInput) editInput.focus();
}

function saveEdit(index) {
    const editInput = document.getElementById(`edit-input-${index}`);
    if (editInput && editInput.value.trim() !== '') {
        tasks[index].text = editInput.value.trim();
    }
    tasks[index].isEditing = false;
    saveTasks();
    renderTasks();
}

function deleteTask(index) {
    if (confirm('Delete this task?')) {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    }
}

addTaskBtn.addEventListener('click', addTask);
searchInput.addEventListener('input', renderTasks);
filterSelect.addEventListener('change', renderTasks);
filterCategory.addEventListener('change', renderTasks);

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

renderTasks();