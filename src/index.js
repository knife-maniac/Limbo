document.addEventListener('DOMContentLoaded', async () => {
    // Loading state
    const state = await readState();
    state.buckets?.map(createBucket);
    state.tasks?.map(createTask);

    // Task Editor
    const taskEditor = document.getElementById('task_editor');
    taskEditor.querySelector('button').addEventListener('click', async () => {
        const title = taskEditor.querySelector('input').value;
        const bucket = taskEditor.getAttribute('data-bucket');
        createTask({ title, bucket });
        state.tasks.push({ title, bucket });
        await writeState(state);
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
    bucket.append(title, button, taskContainer);
    document.getElementById('main_container').append(bucket);
}

function createTask({ title, bucket }) {
    const task = createElement('div', { class: 'task', draggable: 'true' }, title);
    const taskContainer = document.querySelector(`#${bucket}_bucket .task_container`);
    taskContainer.prepend(task);
}

function openTaskEditor({ bucket }) {
    const taskEditor = document.getElementById('task_editor');
    taskEditor.setAttribute('data-bucket', bucket);
    taskEditor.style.display = '';
}

function closeTaskEditor() {
    const taskEditor = document.getElementById('task_editor');
    taskEditor.style.display = 'none';
    taskEditor.querySelector('input').value = '';
    taskEditor.removeAttribute('data-bucket');
}

// State
async function readState() {
    const response = await fetch('http://localhost:666/state', { method: 'GET' });
    return response.json();
}

async function writeState(state) {
    await fetch('http://localhost:666/state/',
        {
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify(state)
        });
}
