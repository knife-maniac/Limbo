function buildEditor() {
    const editor = document.getElementById('task_editor');
    editor.addEventListener('click', event => {
        if (event.target === editor) {
            closeTaskEditor();
        }
    });
    document.addEventListener('keyup', event => {
        if (event.key === 'Escape') {
            closeTaskEditor();
        }
    });

    editor.querySelector('button').addEventListener('click', saveTask);

    const labelSelectionDropdown = editor.querySelector('#labels');
    Label.list.map(label => {
        const labelOption = createElement('option', { value: label.id }, label.name);
        labelSelectionDropdown.append(labelOption);
    });
}

// Task editor
function openTaskEditor(task = null, bucketId = null) {
    const taskEditor = document.getElementById('task_editor');
    const action = task === null ? 'create' : 'edit';
    taskEditor.setAttribute('data-action', action);
    if (action === 'create') {
        taskEditor.setAttribute('data-bucket', bucketId);
    } else if (action === 'edit') {
        taskEditor.querySelector('#title').value = task.title;
        taskEditor.querySelector('#description').value = task.description;
        taskEditor.setAttribute('data-task', task.id);
    }
    taskEditor.style.display = '';
    taskEditor.querySelector('input#title').focus();
}

async function saveTask() {
    const taskEditor = document.getElementById('task_editor');
    const title = taskEditor.querySelector('#title').value;
    const description = taskEditor.querySelector('#description').value;
    const labelsIds = taskEditor.querySelector('#labels').value; // TODO: Change this to allow multiple label selection
    const labels = [labelsIds].map(idAsString => Label.getById(parseInt(idAsString)));
    const action = taskEditor.getAttribute('data-action');
    if (action === 'create') {
        const bucketId = parseInt(taskEditor.getAttribute('data-bucket'));
        const bucket = Bucket.getById(bucketId);
        new Task(title, description, bucket, labels);
    } else if (action === 'edit') {
        const taskId = parseInt(taskEditor.getAttribute('data-task'));
        const task = Task.getById(taskId);
        task.edit({ title, description, labels });
    }
    closeTaskEditor();
    await saveState();
}

function closeTaskEditor() {
    const taskEditor = document.getElementById('task_editor');
    taskEditor.style.display = 'none';
    taskEditor.querySelector('#title').value = '';
    taskEditor.querySelector('#description').value = '';
    taskEditor.removeAttribute('data-action');
    taskEditor.removeAttribute('data-task');
    taskEditor.removeAttribute('data-bucket');
    taskEditor.currentObject = null;
}
