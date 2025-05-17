import { saveState } from ".";
import { openTaskEditor } from "./editor";
import { Task } from "./tasks";
import { createElement } from "./utils";

export class Bucket {
    static list: Bucket[] = [];

    id: number;
    name: string;
    tasks: Task[];
    div: HTMLElement;
    taskContainer: HTMLElement;

    static getById(id: number): Bucket {
        return Bucket.list.filter(b => b.id === id)[0];
    }

    constructor(name: string) {
        this.name = name;
        this.tasks = [];
        if (Bucket.list.length === 0) {
            this.id = 0;
        } else {
            this.id = Math.max(...Bucket.list.map(bucket => bucket.id)) + 1;
        }
        Bucket.list.push(this);
        this.build();
    }

    build(): void {
        const div: HTMLElement = createElement('div', { 'data-id': `${this.id}`, class: 'bucket' });
        const title: HTMLElement = createElement('div', { class: 'title' }, this.name);
        const button: HTMLElement = createElement('button', { class: 'create_task' }, '+ Add a task');
        button.addEventListener('click', () => {
            openTaskEditor(null, this.id);
        });
        this.taskContainer = createElement('div', { class: 'task_container' });
        this.taskContainer.addEventListener('dragover', (event) => {
            if (event.target === this.taskContainer) {
                this.taskContainer.append(Task.dragPlaceholder);
            }
        });
        this.taskContainer.addEventListener('drop', () => {
            // On drop, replace placeholder with the card.
            const task: Task = Task.dragged;
            const placeholder: HTMLElement = Task.dragPlaceholder;
            this.taskContainer.insertBefore(task.wrapper, placeholder);
            const followingCardId: string | null = (<HTMLElement>placeholder.nextSibling)?.getAttribute('data-id');
            let indexOfTask: number = 0;
            if (followingCardId !== null) {
                // Append before the following task
                const followingTask: Task = Task.getById(parseInt(followingCardId));
                let tasksList: Task[] = this.tasks;
                // If the task being dropped is from this bucket, filter it out
                if (task.bucket.id === this.id) {
                    tasksList = tasksList.filter(t => t.id != task.id);
                }
                // Most recent tasks are at the top, so we insert at the next index
                indexOfTask = tasksList.indexOf(followingTask) + 1;
            }
            this.moveTaskTo(task, indexOfTask);
            saveState();
        });
        const footer: HTMLElement = createElement('div', { class: 'footer' });
        div.append(title, button, this.taskContainer, footer);
        document.getElementById('main_container')?.append(div);
        this.div = div;
    }

    addTask(task: Task, index: number): void {
        this.tasks.splice(index, 0, task);
    }

    removeTask(task: Task): void {
        const index: number = this.tasks.indexOf(task);
        if (index > -1) {
            this.tasks.splice(index, 1);
        }
    }

    moveTaskTo(task: Task, index: number): void {
        task.bucket.removeTask(task);
        this.addTask(task, index);
        task.bucket = this;
        task.taskContainer = this.taskContainer;
    }

    delete(): void {
        Bucket.list = Bucket.list.filter(bucket => bucket != this);
        this.tasks.map(task => task.delete);
        this.div.remove();
    }
}