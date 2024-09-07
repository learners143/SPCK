// Select necessary elements
const addTaskBtn = document.getElementById('add-task-btn');
const newTaskInput = document.getElementById('new-task');
const todoList = document.getElementById('todo-list');

// Load tasks from localStorage on page load
window.addEventListener('DOMContentLoaded', loadTasksFromLocalStorage);

// Add task functionality
addTaskBtn.addEventListener('click', () => {
    const taskText = newTaskInput.value.trim();

    if (taskText) {
        const taskItem = createTaskElement(taskText);
        todoList.appendChild(taskItem);
        saveTaskToLocalStorage(taskText);
        newTaskInput.value = ''; // Clear the input
    }
});

// Create a new task item
function createTaskElement(taskText) {
    const taskItem = document.createElement('li');
    taskItem.classList.add('todo-item');
    taskItem.setAttribute('draggable', true);

    taskItem.innerHTML = `
        <span>${taskText}</span>
        <button class="delete-btn">Delete</button>
    `;

    // Delete task functionality
    const deleteBtn = taskItem.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
        taskItem.remove();
        removeTaskFromLocalStorage(taskText);
    });

    // Add drag-and-drop functionality (desktop and mobile)
    addDragAndDrop(taskItem);

    return taskItem;
}

// Add drag-and-drop functionality to a task item with delay
function addDragAndDrop(taskItem) {
    let dragTimeout; // To handle the delay
    let isDragging = false; // To track if dragging is allowed

    // For desktop (using drag events with delay)
    taskItem.addEventListener('mousedown', (e) => {
        dragTimeout = setTimeout(() => {
            isDragging = true;
            taskItem.classList.add('dragging');
        }, 300); // 300ms delay before dragging starts
    });

    taskItem.addEventListener('mouseup', () => {
        clearTimeout(dragTimeout); // Clear the timeout if mouse is released before delay
        if (isDragging) {
            taskItem.classList.remove('dragging');
            isDragging = false;
        }
    });

    taskItem.addEventListener('dragend', () => {
        if (isDragging) {
            taskItem.classList.remove('dragging');
            isDragging = false;
        }
    });

    todoList.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggingTask = document.querySelector('.dragging');
        const afterElement = getDragAfterElement(todoList, e.clientY);

        if (draggingTask && afterElement === null) {
            todoList.appendChild(draggingTask);
        } else if (draggingTask) {
            todoList.insertBefore(draggingTask, afterElement);
        }
    });

    // For mobile (using touch events with delay)
    taskItem.addEventListener('touchstart', (e) => {
        dragTimeout = setTimeout(() => {
            isDragging = true;
            taskItem.classList.add('dragging');
        }, 300); // 300ms delay before dragging starts
    });

    taskItem.addEventListener('touchend', () => {
        clearTimeout(dragTimeout); // Clear the timeout if touch is released before delay
        if (isDragging) {
            taskItem.classList.remove('dragging');
            isDragging = false;
        }
    });

    taskItem.addEventListener('touchmove', (e) => {
        if (isDragging) {
            e.preventDefault();
            const touchY = e.touches[0].clientY;
            const draggingTask = document.querySelector('.dragging');
            const afterElement = getDragAfterElement(todoList, touchY);

            if (afterElement === null) {
                todoList.appendChild(draggingTask);
            } else {
                todoList.insertBefore(draggingTask, afterElement);
            }
        }
    });
}

// Helper function to determine where to place the dragged element
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.todo-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Save task to localStorage
function saveTaskToLocalStorage(taskText) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(taskText);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Remove task from localStorage
function removeTaskFromLocalStorage(taskText) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(task => task !== taskText);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load tasks from localStorage
function loadTasksFromLocalStorage() {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(taskText => {
        const taskItem = createTaskElement(taskText);
        todoList.appendChild(taskItem);
    });
}
