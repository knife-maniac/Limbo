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
        const card = createElement('div', { class: 'task', draggable: 'true', 'data-id': this.id }, this.title);
        const taskContainer = this.bucket.div.querySelector('.task_container');
        card.addEventListener('dragstart', () => {
            Task.dragged = this;
            const dragPlaceholder = createElement('div', { id: 'task_placeholder', class: 'task' });
            dragPlaceholder.style.minHeight = `calc(${card.clientHeight}px - 2rem)`;
            taskContainer.append(dragPlaceholder);
            Task.dragPlaceholder = dragPlaceholder;
        });
        card.addEventListener('dragend', () => {
            window.dragged = null;
            Task.dragPlaceholder.remove();
        });
        card.addEventListener('click', () => {
            openTaskEditor(this);
        });
        taskContainer.prepend(card);
        this.card = card;
    }

    edit({ title, description }) {
        this.title = title;
        this.description = description;
        this.card.textContent = title;
    }

    delete() {
        Task.list = Task.list.filter(task => task != this);
        this.bucket.removeTask(this);
        this.card.remove();
    }
}