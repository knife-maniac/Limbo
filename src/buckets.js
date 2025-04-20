class Bucket {
    static list = [];

    static getById(id) {
        return Bucket.list.filter(b => b.id === id)[0];
    }

    constructor(name) {
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

    build() {
        const div = createElement('div', { 'data-id': this.id, class: 'bucket' });
        const title = createElement('div', { class: 'title' }, this.name);
        const button = createElement('button', { class: 'create_task' }, '+');
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
            const task = Task.dragged;
            const placeholder = Task.dragPlaceholder;
            this.taskContainer.insertBefore(task.card, placeholder);
            const allTasks = Array.prototype.slice.call(this.taskContainer.children);
            const indexOfDiv = allTasks.indexOf(placeholder) - 1;
            // Most recent tasks are at the top, so we need to reverse the index
            const indexOfTask = this.tasks.length - indexOfDiv;
            this.moveTaskTo(task, indexOfTask);
            saveState();
        });
        const footer = createElement('div', { class: 'footer' });
        div.append(title, button, this.taskContainer, footer);
        document.getElementById('main_container').append(div);
        this.div = div;
    }

    addTask(task, index) {
        this.tasks = this.tasks.toSpliced(index, 0, task);
    }

    removeTask(task) {
        const index = this.tasks.indexOf(task);
        if (index > -1) {
            this.tasks.splice(index, 1);
        }
    }

    moveTaskTo(task, index) {
        task.bucket.removeTask(task);
        this.addTask(task, index);
        task.bucket = this;
        task.taskContainer = this.taskContainer;
    }

    delete() {
        Bucket.list = Bucket.list.filter(bucket => bucket != this);
        this.tasks.map(task => task.delete);
        this.div.remove();
    }
}