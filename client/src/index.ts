import { Bucket } from "./buckets";
import { buildEditor } from "./editor";
import { Label } from "./labels";
import { Task } from "./tasks";
import { sleep } from "./utils";

document.addEventListener('DOMContentLoaded', async () => {
    // Drag and drop
    document.addEventListener('dragover', event => {
        event.preventDefault(); // Fires the 'drop' event as a fallback
    });
    connectToServer();
    buildEditor();
});

const webSocket: WebSocket = new WebSocket('ws://localhost:666');

async function connectToServer() {
    const statusDiv: HTMLElement | null = document.getElementById('save-status');
    if (statusDiv === null) {
        return;
    }

    webSocket.addEventListener('open', async () => {
        statusDiv.className = 'connected';
    });

    webSocket.addEventListener('message', async event => {
        statusDiv.className = 'loading';
        const state = JSON.parse(event.data);
        restoreState(state);
        statusDiv.className = 'success';
        await sleep(1000);
        statusDiv.className = 'connected';
    });

    webSocket.addEventListener('close', () => {
        statusDiv.className = 'disconnected';
    });

    webSocket.addEventListener('error', () => {
        statusDiv.className = 'disconnected';
    });
}

interface ITaskData {
    title: string,
    description: string,
    labels: Label[]
}

interface IBucketData {
    name: string,
    tasks: ITaskData[]
}

async function restoreState(state) {
    // Restoring previous state
    state.buckets.map((bucketData: IBucketData) => {
        const bucket = new Bucket(bucketData.name);
        bucketData.tasks.map((taskData: ITaskData) => {
            // const labels = taskData.labels.map(name => Label.getByName(name));
            const labels: Label[] = [];
            new Task(taskData.title, taskData.description, bucket, labels);
        });
    });
    // state.labels.map(labelData => {
    //     new Label(labelData.name, labelData.color);
    // });
}

export async function saveState(): Promise<void> {
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
    webSocket.send(JSON.stringify(state));
}