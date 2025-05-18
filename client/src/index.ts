import { Bucket } from './buckets';
import { TaskEditor } from './editor';
import { Label } from './labels';
import { Task } from './tasks';
import { sleep } from './utils';

document.addEventListener('DOMContentLoaded', async () => {
    // Drag and drop
    document.addEventListener('dragover', event => {
        event.preventDefault(); // Fires the 'drop' event as a fallback
    });
    connectToServer();
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

interface ILabelData {
    name: string,
    color: string
}

interface ITaskData {
    title: string,
    description: string,
    labels: string[],
    notes: string
}

interface IBucketData {
    name: string,
    tasks: ITaskData[]
}

async function restoreState(state) {
    // Restoring previous state
    // state.labels.map((labelData: ILabelData) => {
    //     new Label(labelData.name, labelData.color);
    // });
    state.buckets.map((bucketData: IBucketData) => {
        const bucket = new Bucket(bucketData.name);
        bucketData.tasks.map((taskData: ITaskData) => {
            // const labels = taskData.labels.map(name => Label.getByName(name));
            const labels: Label[] = [];
            new Task(taskData.title, taskData.description, labels, taskData.notes, bucket);
        });
    });
}

export async function saveState(): Promise<void> {
    const state = {
        labels: Label.list.map((label: Label): ILabelData => {
            return {
                name: label.name,
                color: label.color
            }
        }),
        buckets: Bucket.list.map((bucket: Bucket): IBucketData => {
            return {
                name: bucket.name,
                tasks: bucket.tasks.map((task: Task): ITaskData => {
                    return {
                        title: task.title,
                        description: task.description,
                        labels: task.labels.map(l => l.name),
                        notes: task.notes
                    }
                })
            }
        })
    };
    webSocket.send(JSON.stringify(state));
}