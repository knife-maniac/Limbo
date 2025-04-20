document.addEventListener('DOMContentLoaded', async () => {
    // Loading and restoring previous state
    const state = await readState();
    state.buckets.map(bucketData => {
        const bucket = new Bucket(bucketData.name);
        bucketData.tasks.map(taskData => {
            const task = new Task(taskData.title, taskData.description, bucket);
            task.card.addEventListener('click', () => {
                openTaskEditor(task);
            });
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
        buckets: Bucket.list.map(bucket => {
            return {
                name: bucket.name,
                tasks: bucket.tasks.map(task => {
                    return {
                        title: task.title,
                        description: task.description
                    }
                })
            }
        })
    };
    const response = await fetch('http://localhost:666/state/',
        {
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify(state)
        });
    if (response.ok) {
        statusDiv.className = 'success';
        await sleep(2000);
        statusDiv.className = '';
    } else {
        statusDiv.className = 'error';
    }
}
