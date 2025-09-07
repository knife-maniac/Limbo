import { saveState } from './state';
import { Bucket } from './buckets';
import { Label } from './labels';
import { Task } from './tasks';
import { createElement } from './utils';

enum TaskEditorState {
    Closed,
    Creation,
    Edition
}

export class TaskEditor {
    static #instance: TaskEditor;

    state: TaskEditorState;
    task: Task | null;
    bucket: Bucket | null;

    div: HTMLElement;
    card: HTMLElement;
    title: HTMLElement;
    description: HTMLElement;
    labels: HTMLElement;
    notes: HTMLElement;
    button: HTMLElement;

    private constructor() {
        this.state = TaskEditorState.Closed;
        this.build();
    }

    static get instance(): TaskEditor {
        if (!TaskEditor.#instance) {
            TaskEditor.#instance = new TaskEditor();
        }
        return TaskEditor.#instance;
    }

    build() {
        this.div = createElement('div', { id: 'task_editor', style: 'display: none;' });
        document.body.append(this.div);
        this.card = createElement('div', { id: 'task_editor_card' });
        this.div.append(this.card);

        this.title = createElement('input', { id: 'title', placeholder: 'Title...' })
        this.description = createElement('input', { id: 'description', placeholder: 'Description...' })
        this.labels = createElement('input', { id: 'labels', placeholder: 'Labels...' })
        this.notes = createElement('textarea', { id: 'notes', placeholder: 'Notes...' })
        this.button = createElement('button', {}, 'Create / Update task');
        this.card.append(this.title, this.description, this.labels, this.notes, this.button);

        [this.title, this.description, this.labels, this.notes].map((input: HTMLElement) => {
            // Input value change --> Save changes and keep open
            input.addEventListener('change', () => {
                this.saveTask();
            });
        });

        this.button.addEventListener('click', () => {
            // Button clicked --> Save changes and close
            this.saveTask();
            this.close();
        });

        this.div.addEventListener('mousedown', event => {
            // Click outside the editor --> Save changes and close
            if (event.target === this.div) {
                this.saveTask();
                this.close();
            }
        });

        document.addEventListener('keyup', event => {
            // Escape key pressed --> Discard changes and close
            if (event.key === 'Escape') {
                event.preventDefault();
                this.close();
            }
        });

        // const labelSelectionDropdown = editor.querySelector('#labels');
        // Label.list.map(label => {
        //     const labelOption = createElement('option', { value: label.id }, label.name);
        //     labelSelectionDropdown.append(labelOption);
        // });
    }

    openTaskCreation(bucket: Bucket): void {
        if (this.state === TaskEditorState.Closed) {
            this.state = TaskEditorState.Creation;
            this.task = null;
            this.bucket = bucket;
            this.div.style.display = '';
            this.title.focus();
        }
    }

    openTaskEdition(task: Task) {
        if (this.state === TaskEditorState.Closed) {
            this.state = TaskEditorState.Edition;
            this.task = task;
            this.bucket = task.bucket;
            (<HTMLInputElement>this.title).value = task.title;
            (<HTMLInputElement>this.description).value = task.description;
            (<HTMLInputElement>this.notes).value = task.notes;
            this.div.style.display = '';
        }
    }

    async saveTask(): Promise<void> {
        const title: string = (<HTMLInputElement>this.title).value;
        const description: string = (<HTMLInputElement>this.description).value;
        // const labelsIds = taskEditor.querySelector('#labels').value; // TODO: Change this to allow multiple label selection
        // const labels = [labelsIds].map(idAsString => Label.getById(parseInt(idAsString)));
        const labels: Label[] = [];
        const notes: string = (<HTMLInputElement>this.notes).value;

        if (!title && !description && !labels.length && !notes) {
            return; // Not saving empty tasks
        }

        if (this.state === TaskEditorState.Creation && this.bucket) {
            const task = new Task(title, description, labels, notes, this.bucket);
            this.bucket.taskContainer.scrollTop = 0;
            this.state = TaskEditorState.Edition;
            this.task = task;
        } else if (this.state === TaskEditorState.Edition && this.task) {
            this.task.updateCard(title, description, labels, notes);
        }
        await saveState();
    }

    close() {
        this.div.style.display = 'none';
        (<HTMLInputElement>this.title).value = '';
        (<HTMLInputElement>this.description).value = '';
        (<HTMLInputElement>this.notes).value = '';
        this.task = null;
        this.bucket = null;
        this.state = TaskEditorState.Closed;
    }
}
