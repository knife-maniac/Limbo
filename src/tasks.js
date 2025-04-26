class Task {
    static list = [];

    static getById(id) {
        return Task.list.filter(b => b.id === id)[0];
    }

    constructor(title, description, bucket) {
        this.title = title;
        this.description = description;
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

    build() {
        const taskWrapper = createElement('div', { class: 'task_wrapper', 'data-id': this.id });
        const card = createElement('div', { class: 'task', draggable: 'true' });
        const cardHeader = createElement('div', { class: 'header' });
        const cardTitle = createElement('span', { class: 'title' }, this.title);
        const headerIcon = createElement('div', { class: 'icon' });
        const cardDescription = createElement('span', { class: 'description' }, this.description);
        cardHeader.append(cardTitle, headerIcon);
        card.append(cardHeader, cardDescription);
        taskWrapper.append(card);

        headerIcon.addEventListener('click', event => {
            event.stopPropagation();
            this.delete();
            saveState();
        });

        this.taskContainer = this.bucket.div.querySelector('.task_container');
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
            window.dragged = null;
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
            openTaskEditor(this);
        });

        this.taskContainer.prepend(taskWrapper);
        this.wrapper = taskWrapper;
        this.card = card;
        this.titleSpan = cardTitle;
        this.descriptionSpan = cardDescription;
    }

    edit({ title, description }) {
        this.title = title;
        this.description = description;
        this.titleSpan.textContent = title;
        this.descriptionSpan.textContent = description
    }

    delete() {
        Task.list = Task.list.filter(task => task != this);
        this.bucket.removeTask(this);
        this.wrapper.remove();
    }
}