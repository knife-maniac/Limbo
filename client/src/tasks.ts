import { saveState } from '.';
import { Bucket } from './buckets';
import { openTaskEditor } from './editor';
import { Label } from './labels';
import { createElement } from './utils';

export class Task {
    static list: Task[] = [];
    static dragged: Task;
    static dragPlaceholder: HTMLElement;

    id: number;
    title: string;
    description: string;
    labels: Label[];
    notes: string;
    bucket: Bucket;

    taskContainer: HTMLElement;
    wrapper: HTMLElement;
    card: HTMLElement;
    titleSpan: HTMLElement;
    descriptionSpan: HTMLElement;
    cardLabelsContainer: HTMLElement;

    static getById(id: number): Task {
        return Task.list.filter(b => b.id === id)[0];
    }

    constructor(title: string, description: string, labels: Label[], notes: string, bucket: Bucket) {
        this.title = title;
        this.description = description;
        this.labels = labels;
        this.notes = notes;
        this.bucket = bucket;
        if (Task.list.length === 0) {
            this.id = 0;
        } else {
            this.id = Math.max(...Task.list.map(bucket => bucket.id)) + 1;
        }
        Task.list.push(this);
        this.bucket.tasks.push(this);
        this.build();
    }

    build(): void {
        const taskWrapper: HTMLElement = createElement('div', { class: 'task_wrapper', 'data-id': `${this.id}` });
        const card: HTMLElement = createElement('div', { class: 'task', draggable: 'true' });
        const cardHeader: HTMLElement = createElement('div', { class: 'header' });
        const cardTitle: HTMLElement = createElement('span', { class: 'title' });
        const headerIcon: HTMLElement = createElement('div', { class: 'icon' });
        const cardDescription: HTMLElement = createElement('span', { class: 'description' });
        const cardLabelsContainer: HTMLElement = createElement('span', { class: 'labels_container' });
        cardHeader.append(cardTitle, headerIcon);
        card.append(cardHeader, cardDescription, cardLabelsContainer);
        taskWrapper.append(card);

        headerIcon.addEventListener('click', event => {
            event.stopPropagation();
            this.delete();
            saveState();
        });

        this.taskContainer = this.bucket.taskContainer;
        card.addEventListener('dragstart', () => {
            setTimeout(function () {
                taskWrapper.classList.add('dragged');
            }, 0);
            Task.dragged = this;
            const dragPlaceholder = createElement('div', { id: 'task_placeholder', class: 'task' });
            const paddingSize = '2rem';
            const borderSize = '0.2rem'
            dragPlaceholder.style.minHeight = `calc(${card.clientHeight}px - ${paddingSize} + ${borderSize})`;
            this.taskContainer.append(dragPlaceholder);
            Task.dragPlaceholder = dragPlaceholder;
        });
        card.addEventListener('dragend', () => {
            taskWrapper.classList.remove('dragged');
            Task.dragPlaceholder.remove();
        });
        taskWrapper.addEventListener('dragover', event => {
            if (event.offsetY < Math.min(Task.dragPlaceholder.clientHeight / 2, card.clientHeight / 2)) {
                // If above the top half, insert before
                this.taskContainer.insertBefore(Task.dragPlaceholder, taskWrapper);
            } else {
                // If above the bottom half, insert after
                this.taskContainer.insertBefore(Task.dragPlaceholder, taskWrapper.nextSibling);
            }
        });
        card.addEventListener('click', () => {
            openTaskEditor(this, this.bucket.id);
        });

        this.wrapper = taskWrapper;
        this.card = card;
        this.titleSpan = cardTitle;
        this.descriptionSpan = cardDescription;
        this.cardLabelsContainer = cardLabelsContainer;

        this.updateCard(this.title, this.description, this.labels, this.notes);
        this.taskContainer.prepend(taskWrapper);
    }

    updateCard(title: string, description: string, labels: Label[], notes: string): void {
        // Title
        this.titleSpan.textContent = title;
        this.title = title;

        // Description
        if (description) {
            this.descriptionSpan.style.display = '';
            this.descriptionSpan.textContent = description;
        } else {
            this.descriptionSpan.style.display = 'none';
        }
        this.description = description;

        // Labels
        this.cardLabelsContainer.innerHTML = '';
        if (labels.length > 0) {
            labels.map(label => {
                const labelTag = label.getTag();
                this.cardLabelsContainer.append(labelTag);
            });
            this.cardLabelsContainer.style.display = '';
        } else {
            this.cardLabelsContainer.style.display = 'none';
        }
        this.labels = labels;
        this.notes = notes;
    }

    delete() {
        Task.list = Task.list.filter(task => task != this);
        this.bucket.removeTask(this);
        this.wrapper.remove();
    }
}