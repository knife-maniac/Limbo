class Bucket {
    static list = [];

    constructor(name) {
        this.name = name;
        this.id = Math.max(...Bucket.list.map(bucket => bucket.id)) + 1;
        this.tasks = [];
        this.build();
    }

    build() {
        const div = createElement('div', { 'data-id': this.id, class: 'bucket' });
        const title = createElement('div', { class: 'title' }, this.name);
        const button = createElement('button', { class: 'create_task' }, '+');
        button.addEventListener('click', () => {
            openTaskEditor({ bucket: this.name });
        });
        const taskContainer = createElement('div', { class: 'task_container' });
        taskContainer.addEventListener('dragover', (event) => {
            const drag_placeholder = window.dragPlaceholder;
            if (event.srcElement.classList.contains('task')) {
                console.log('#1');
                taskContainer.insertBefore(drag_placeholder, event.srcElement);
            } else { // Dragging over task container
                console.log('#2');
                taskContainer.append(drag_placeholder);
            }
        });
        taskContainer.addEventListener('drop', event => {
            const sourceTask = window.dragged;
    
            // Moving div
            sourceTask.parentNode.removeChild(sourceTask);
            if (event.srcElement.classList.contains('task')) {
                taskContainer.insertBefore(sourceTask, event.srcElement);
            } else { // Dragging over task container
                taskContainer.append(sourceTask);
            }
    
            // Updating task
            const sourceTaskId = parseInt(sourceTask.getAttribute('data-id'));
            updateTask(sourceTaskId, { bucket: name });
            saveState();
        });
        const footer = createElement('div', { class: 'footer' });
        div.append(title, button, taskContainer, footer);
        document.getElementById('main_container').append(div);  
        this.div = div;  
    }

    delete() {
        Bucket.list = Bucket.list.filter(bucket => bucket != this);
        this.tasks.map(task => task.delete);
        this.div.remove();
    }
}