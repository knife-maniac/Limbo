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
        this.taskContainer = this.bucket.div.querySelector('.task_container');
        card.addEventListener('dragstart', event => {
            setTimeout(function () {
                card.classList.add('dragged');
            }, 0);
            Task.dragged = this;
            const dragPlaceholder = createElement('div', { id: 'task_placeholder', class: 'task' });
            const paddingSize = '2rem';
            const borderSize = '0.2rem'
            dragPlaceholder.style.minHeight = `calc(${card.clientHeight}px - ${paddingSize} + ${borderSize})`;
            this.taskContainer.append(dragPlaceholder);
            Task.dragPlaceholder = dragPlaceholder;
        });
        card.addEventListener('dragover', event => {
            if (event.offsetY < card.clientHeight / 2) {
                // If above the top half, insert before
                this.taskContainer.insertBefore(Task.dragPlaceholder, card);
            } else {
                // If above the bottom half, insert after
                this.taskContainer.insertBefore(Task.dragPlaceholder, card.nextSibling);
            }
        });
        card.addEventListener('dragend', event => {
            card.classList.remove('dragged');
            window.dragged = null;
            Task.dragPlaceholder.remove();
        });
        card.addEventListener('click', () => {
            openTaskEditor(this);
        });
        this.taskContainer.prepend(card);
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