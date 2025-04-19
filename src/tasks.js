class Task {
    static list = [];

    constructor(title, description, bucket) {
        this.title = title;
        this.description = description;
        this.bucket = bucket;
        this.id = Math.max(...Task.list.map(t => t.id)) + 1;
        Task.list.push(this);
        this.build();
    }

    build() {
        const card = createElement('div', { class: 'task', draggable: 'true', 'data-id': this.id }, this.title);
        const taskContainer = this.bucket.div.querySelector('.task_container');
        card.addEventListener('click', () => {
            openTaskEditor({ id: this.id, title, bucket });
        });
        card.addEventListener('dragstart', () => {
            window.dragged = card;
            const dragPlaceholder = createElement('div', { id: 'drag_placeholder', class: 'task' });
            dragPlaceholder.style.minHeight = `calc(${card.clientHeight}px - 2rem)`;
            taskContainer.append(dragPlaceholder);
            window.dragPlaceholder = dragPlaceholder
        });
        card.addEventListener('dragend', () => {
            window.dragged = null;
            window.dragPlaceholder.remove();
        });
        taskContainer.prepend(card);
        this.card = card;
    }


    edit({ title, description }) {
        this.title = title;
        this.description = description;
        this.card.textContent = title;
    }

    moveTo(bucket, index) {
        //TODO
    }

    delete() {
        Task.list = Task.list.filter(task => task != this);
        this.card.remove();
    }
}