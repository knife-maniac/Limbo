document.addEventListener('DOMContentLoaded', async () => {
    // Drag and drop
    document.addEventListener('dragover', event => {
        event.preventDefault(); // Fires the 'drop' event as a fallback
    });
    connectToServer();
    buildEditor();
});


async function connectToServer() {
    window.socket = new WebSocket('ws://localhost:667');
    const statusDiv = document.getElementById('save-status');

    window.socket.addEventListener('open', async () => {
        statusDiv.className = 'connected';
    });

    window.socket.addEventListener('message', async event => {
        statusDiv.className = 'loading';
        const state = JSON.parse(event.data);
        restoreState(state);
        statusDiv.className = 'success';
        await sleep(1000);
        statusDiv.className = 'connected';
    });

    window.socket.addEventListener('close', () => {
        statusDiv.className = 'disconnected';
    });

    window.socket.addEventListener('error', () => {
        statusDiv.className = 'disconnected';
    });
}

async function restoreState(state) {
    // Restoring previous state
    state.buckets.map(bucketData => {
        const bucket = new Bucket(bucketData.name);
        bucketData.tasks.map(taskData => {
            // const labels = taskData.labels.map(name => Label.getByName(name));
            const labels = [];
            new Task(taskData.title, taskData.description, bucket, labels);
        });
    });
    // state.labels.map(labelData => {
    //     new Label(labelData.name, labelData.color);
    // });
}

async function saveState() {
    const state = {
        labels: Label.list.map(label => {
            return {
                name: label.name,
                color: label.color
            }
        }),
        buckets: Bucket.list.map(bucket => {
            return {
                name: bucket.name,
                tasks: bucket.tasks.map(task => {
                    return {
                        title: task.title,
                        description: task.description,
                        labels: task.labels.map(l => l.name)
                    }
                })
            }
        })
    };
    window.socket.send(JSON.stringify(state));
}
