import { saveState } from '.';
import { Bucket } from './buckets';
import { TaskEditor } from './editor';
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
    iconsLine: HTMLElement;
    notesIcon: HTMLElement;

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
        this.wrapper = createElement('div', { class: 'task_wrapper', 'data-id': `${this.id}` });
        this.card = createElement('div', { class: 'task', draggable: 'true' });
        this.wrapper.append(this.card);

        const cardHeader: HTMLElement = createElement('div', { class: 'header' });
        this.titleSpan = createElement('span', { class: 'title' });
        const headerIcon: HTMLElement = createElement('div', { class: 'more icon' });
        cardHeader.append(this.titleSpan, headerIcon);

        this.descriptionSpan = createElement('span', { class: 'description' });
        this.cardLabelsContainer = createElement('span', { class: 'labels_container' });

        this.iconsLine = createElement('div', { class: 'icons_container' });
        this.notesIcon = createElement('div', { class: 'notes icon', title: 'This task has notes' });
        this.iconsLine.append(this.notesIcon);

        this.card.append(cardHeader, this.descriptionSpan, this.cardLabelsContainer, this.iconsLine);

        headerIcon.addEventListener('click', event => {
            event.stopPropagation();
            this.delete();
            saveState();
        });

        this.taskContainer = this.bucket.taskContainer;
        this.card.addEventListener('dragstart', () => {
            setTimeout(function () {
                this.wrapper.classList.add('dragged');
            }, 0);
            Task.dragged = this;
            const dragPlaceholder = createElement('div', { id: 'task_placeholder', class: 'task' });
            const paddingSize = '2rem';
            const borderSize = '0.2rem'
            dragPlaceholder.style.minHeight = `calc(${this.card.clientHeight}px - ${paddingSize} + ${borderSize})`;
            this.taskContainer.append(dragPlaceholder);
            Task.dragPlaceholder = dragPlaceholder;
        });
        this.card.addEventListener('dragend', () => {
            this.wrapper.classList.remove('dragged');
            Task.dragPlaceholder.remove();
        });
        this.wrapper.addEventListener('dragover', event => {
            if (event.offsetY < Math.min(Task.dragPlaceholder.clientHeight / 2, this.card.clientHeight / 2)) {
                // If above the top half, insert before
                this.taskContainer.insertBefore(Task.dragPlaceholder, this.wrapper);
            } else {
                // If above the bottom half, insert after
                this.taskContainer.insertBefore(Task.dragPlaceholder, this.wrapper.nextSibling);
            }
        });
        this.card.addEventListener('click', () => {
            TaskEditor.instance.openTaskEdition(this);
        });

        this.updateCard(this.title, this.description, this.labels, this.notes);
        this.taskContainer.prepend(this.wrapper);
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

        // Notes
        this.notesIcon.style.display = this.notes ? '' : 'none';
        this.iconsLine.style.display = this.notes ? '' : 'none';
        this.notes = notes;
    }

    delete() {
        Task.list = Task.list.filter(task => task != this);
        this.bucket.removeTask(this);
        this.wrapper.remove();
    }
}