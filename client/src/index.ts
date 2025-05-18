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
    // Theme dropdown
    document.querySelectorAll('#theme-selector.dropdown .option').forEach((option: Element) => {
        option.addEventListener('click', () => {
            const selectedTheme: string = option.getAttribute('data-value') || 'default';
            document.body.setAttribute('data-theme', selectedTheme);
            saveState();
        })
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
        statusDiv.setAttribute('data-status', 'connected');
    });

    webSocket.addEventListener('message', async event => {
        statusDiv.setAttribute('data-status', 'loading');
        const state = JSON.parse(event.data);
        restoreState(state);
        statusDiv.setAttribute('data-status', 'success');
        await sleep(1000);
        statusDiv.setAttribute('data-status', 'connected');
    });

    webSocket.addEventListener('close', () => {
        statusDiv.setAttribute('data-status', 'disconnected');
    });

    webSocket.addEventListener('error', () => {
        statusDiv.setAttribute('data-status', 'disconnected');
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
    document.body.setAttribute('data-theme', state.theme);
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
        theme: document.body.getAttribute('data-theme') || 'default',
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

    // TODO: Wait for response from websocket...
    const statusDiv: HTMLElement | null = document.getElementById('save-status');
    if (statusDiv === null) {
        return;
    }
    statusDiv.setAttribute('data-status', 'success');
    await sleep(1000);
    statusDiv.setAttribute('data-status', 'connected');
}