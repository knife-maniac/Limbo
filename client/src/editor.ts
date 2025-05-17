import { saveState } from ".";
import { Bucket } from "./buckets";
import { Label } from "./labels";
import { Task } from "./tasks";

export function buildEditor(): void {
    const editor: HTMLElement | null = document.getElementById('task_editor');
    if (editor === null) {
        return;
    }

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

    editor.querySelector('button')?.addEventListener('click', saveTask);

    // const labelSelectionDropdown = editor.querySelector('#labels');
    // Label.list.map(label => {
    //     const labelOption = createElement('option', { value: label.id }, label.name);
    //     labelSelectionDropdown.append(labelOption);
    // });
}

// Task editor
export function openTaskEditor(task: Task | null, bucketId: number): void {
    const taskEditor: HTMLElement | null = document.getElementById('task_editor');
    if (taskEditor === null) {
        return;
    }
    const action = task === null ? 'create' : 'edit';
    taskEditor.setAttribute('data-action', action);
    if (task === null) {
        taskEditor.setAttribute('data-bucket', `${bucketId}`);
    } else {
        (<HTMLInputElement>taskEditor.querySelector('#title')).value = task.title;
        (<HTMLInputElement>taskEditor.querySelector('#description')).value = task.description;
        taskEditor.setAttribute('data-task', `${task.id}`);
    }
    taskEditor.style.display = '';
    (<HTMLInputElement>taskEditor.querySelector('input#title')).focus();
}

async function saveTask(): Promise<void> {
    const taskEditor: HTMLElement | null = document.getElementById('task_editor');
    if (taskEditor === null) {
        return;
    }
    const title: string = (<HTMLInputElement>taskEditor.querySelector('#title')).value;
    const description: string = (<HTMLInputElement>taskEditor.querySelector('#description')).value;
    // const labelsIds = taskEditor.querySelector('#labels').value; // TODO: Change this to allow multiple label selection
    // const labels = [labelsIds].map(idAsString => Label.getById(parseInt(idAsString)));
    const labels: Label[] = [];
    const action = taskEditor.getAttribute('data-action');
    if (action === 'create') {
        const bucketId: number = parseInt(taskEditor.getAttribute('data-bucket') || '');
        const bucket: Bucket = Bucket.getById(bucketId);
        new Task(title, description, bucket, labels);
        bucket.taskContainer.scrollTop = 0;
    } else if (action === 'edit') {
        const taskId = parseInt(taskEditor.getAttribute('data-task') || '');
        const task = Task.getById(taskId);
        task.updateCard(title, description, labels);
    }
    closeTaskEditor();
    await saveState();
}

function closeTaskEditor() {
    const taskEditor: HTMLElement | null = document.getElementById('task_editor');
    if (taskEditor === null) {
        return;
    }
    taskEditor.style.display = 'none';
    (<HTMLInputElement>taskEditor.querySelector('#title')).value = '';
    (<HTMLInputElement>taskEditor.querySelector('#description')).value = '';
    taskEditor.removeAttribute('data-action');
    taskEditor.removeAttribute('data-task');
    taskEditor.removeAttribute('data-bucket');
}