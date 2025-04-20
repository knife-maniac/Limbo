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
        const taskContainer = createElement('div', { class: 'task_container' });
        taskContainer.addEventListener('dragover', (event) => {
            // On drag over, update the position of the placeholder
            const draggedOver = event.srcElement;
            const dragPlaceholder = Task.dragPlaceholder;
            if (draggedOver.getAttribute('id') === 'task_placeholder') {
                // Above task placeholder, nothing to do
            } else if (draggedOver.classList.contains('task')) {
                // Above a task
                if (event.offsetY < draggedOver.clientHeight / 2) {
                    // If above the top half, insert before
                    taskContainer.insertBefore(dragPlaceholder, draggedOver);
                } else {
                    // If above the bottom half, insert after
                    taskContainer.insertBefore(dragPlaceholder, draggedOver.nextSibling);
                }
            } else {
                // Above the bucket, insert at the end
                taskContainer.append(dragPlaceholder);
            }
        });
        taskContainer.addEventListener('drop', () => {
            // On drop, replace placeholder with the card.
            const task = Task.dragged;
            const placeholder = Task.dragPlaceholder;
            taskContainer.insertBefore(task.card, placeholder);
            const allTasks = Array.prototype.slice.call(taskContainer.children);
            const indexOfDiv = allTasks.indexOf(placeholder) - 1;
            // Most recent tasks are at the top, so we need to reverse the index
            const indexOfTask = this.tasks.length - indexOfDiv;
            this.moveTaskTo(task, indexOfTask);
            saveState();
        });
        const footer = createElement('div', { class: 'footer' });
        div.append(title, button, taskContainer, footer);
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
    }

    delete() {
        Bucket.list = Bucket.list.filter(bucket => bucket != this);
        this.tasks.map(task => task.delete);
        this.div.remove();
    }
}