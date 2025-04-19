document.addEventListener('DOMContentLoaded', async () => {
    // Loading and restoring previous state
    window.state = await readState();
    window.state.buckets.map(bucketData => {
        const bucket = new Bucket(bucketData.name);
        bucketData.tasks.map(taskData => {
            new Task(taskData.title, taskData.description, bucket);
        });
    });

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
        closeTaskEditor();
        await saveState();
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

async function sleep(ms) {
    return new Promise((resolve, _reject) => {
        setTimeout(resolve, ms);
    });
}

async function saveState() {
    const statusDiv = document.getElementById('save-status');
    statusDiv.className = 'loading';
    const response = await fetch('http://localhost:666/state/',
        {
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify(window.state)
        });
    if (response.ok) {
        statusDiv.className = 'success';
        await sleep(2000);
        statusDiv.className = '';
    } else {
        statusDiv.className = 'error';
    }
}
