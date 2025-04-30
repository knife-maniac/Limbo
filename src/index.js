document.addEventListener('DOMContentLoaded', async () => {
    // Loading and restoring previous state
    const state = await readState();
    state.labels.map(labelData => {
        new Label(labelData.name, labelData.color);
    });
    state.buckets.map(bucketData => {
        const bucket = new Bucket(bucketData.name);
        bucketData.tasks.map(taskData => {
            const labels = taskData.labels.map(name => Label.getByName(name));
            new Task(taskData.title, taskData.description, bucket, labels);
        });
    });

    // Drag and drop
    document.addEventListener('dragover', event => {
        event.preventDefault(); // Fires the 'drop' event as a fallback
    });

    buildEditor();
});


// State
async function readState() {
    const response = await fetch('http://localhost:666/state', { method: 'GET' });
    return response.json();
}

async function saveState() {
    const statusDiv = document.getElementById('save-status');
    statusDiv.className = 'loading';
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
    try {
        const response = await fetch('http://localhost:666/state/',
            {
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                method: 'POST',
                body: JSON.stringify(state)
            }).then(r => r.json());
        if (response.success) {
            statusDiv.className = 'success';
            await sleep(2000);
            statusDiv.className = '';
        } else {
            statusDiv.className = 'error';
            alert('An error occured when trying to save the current state.');
        }
    } catch (_error) {
        statusDiv.className = 'error';
        alert('The limbo server could not be contacted. The state will not be saved.');
    }
}
