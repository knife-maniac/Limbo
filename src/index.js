document.addEventListener('DOMContentLoaded', async () => {
    // Loading state
    window.state = await readState();
    window.state.buckets.map(createBucket);
    window.state.tasks.map(createTask);

    // Drag and drop
    document.addEventListener('dragover', event => {
        event.preventDefault(); // Fires the 'drop' event as a fallback
    });

    // Task Editor
    const taskEditor = document.getElementById('task_editor');
    taskEditor.querySelector('button').addEventListener('click', async () => {
        const title = taskEditor.querySelector('input').value;
        const bucket = taskEditor.getAttribute('data-bucket');
        let id;
        const isEditing = taskEditor.hasAttribute('data-id');
        if (isEditing) {
            id = parseInt(taskEditor.getAttribute('data-id'));
            updateTask(id, { title, bucket });
        } else {
            id = Math.max(...window.state.tasks.map(task => task.id)) + 1;
            createTask({ id, title, bucket });
            window.state.tasks.push({ id, title, bucket });
        }
        await saveState();
        closeTaskEditor();
    });
    taskEditor.addEventListener('click', event => {
        if (event.target === taskEditor) {
            closeTaskEditor();
        }
    });
    document.addEventListener('keyup', event => {
        if (event.key === 'Escape') {
            closeTaskEditor();
        }
    });
});

function createElement(tag, attributes, textContent = '') {
    const element = document.createElement(tag);
    Object.entries(attributes).map(([key, value]) => {
        element.setAttribute(key, value);
    });
    element.textContent = textContent;
    return element;
}

function createBucket(name) {
    const bucket = createElement('div', { id: `${name}_bucket`, class: 'bucket' });
    const title = createElement('div', { class: 'title' }, name);
    const button = createElement('button', { class: 'create_task' }, '+');
    button.addEventListener('click', () => {
        openTaskEditor({ bucket: name });
    });
    const taskContainer = createElement('div', { class: 'task_container' });
    // taskContainer.addEventListener('dragover', () => {
    //     console.log('dragover');
    // });
    taskContainer.addEventListener('drop', event => {
        const sourceTask = window.dragged;
        sourceTask.parentNode.removeChild(sourceTask);
        // const targetTask = event.srcElement;
        // taskContainer.insertBefore(task, sourceTask);
        taskContainer.append(sourceTask);
        const sourceTaskId = parseInt(sourceTask.getAttribute('data-id'));
        updateTask(sourceTaskId, { bucket: name });
        saveState();
    });
    bucket.append(title, button, taskContainer);
    document.getElementById('main_container').append(bucket);
}

function createTask({ id, title, bucket }) {
    const task = createElement('div', { class: 'task', draggable: 'true', 'data-id': id }, title);
    task.addEventListener('click', () => {
        openTaskEditor({ id, title, bucket });
    });
    task.addEventListener('dragstart', () => {
        window.dragged = task;
    });
    task.addEventListener('dragend', () => {
        window.dragged = null;
    });
    const taskContainer = document.querySelector(`#${bucket}_bucket .task_container`);
    taskContainer.prepend(task);
}

function updateTask(id, { title, bucket }) {
    const task = window.state.tasks.filter(t => t.id === id)[0];
    const taskDiv = document.querySelector(`.task[data-id='${id}']`);
    if (title) {
        task.title = title
        taskDiv.textContent = title;
    }
    task.bucket = bucket;
}

function openTaskEditor({ id, title, bucket }) {
    const taskEditor = document.getElementById('task_editor');
    if (id !== undefined && title !== undefined) {
        taskEditor.querySelector('input').value = title;
        taskEditor.setAttribute('data-id', id);
    }
    taskEditor.setAttribute('data-bucket', bucket);
    taskEditor.style.display = '';
}

function closeTaskEditor() {
    const taskEditor = document.getElementById('task_editor');
    taskEditor.style.display = 'none';
    taskEditor.querySelector('input').value = '';
    taskEditor.removeAttribute('data-id');
    taskEditor.removeAttribute('data-bucket');
}

// State
async function readState() {
    const response = await fetch('http://localhost:666/state', { method: 'GET' });
    return response.json();
}

async function saveState() {
    await fetch('http://localhost:666/state/',
        {
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify(window.state)
        });
}
