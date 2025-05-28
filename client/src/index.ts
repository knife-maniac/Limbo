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

    // Project name
    document.getElementById('project-name')?.addEventListener('change', (event) => {
        saveState();
        const newProjectName: string = (<HTMLInputElement>event.target).value;
        document.title = newProjectName;
    });

    const statusDiv: HTMLElement | null = document.getElementById('save-status');
    if (statusDiv === null) {
        return;
    }

    // Restoring state
    const response: Response = await fetch('/state', { method: 'GET' });
    const projectState = JSON.parse(await response.json());
    restoreState(projectState);
    statesHistory.push(projectState);
    statusDiv.setAttribute('data-status', 'success');
    await sleep(1000);
    statusDiv.setAttribute('data-status', 'connected');


    // Undo
    document.addEventListener('keydown', (event) => {
        if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
            statesHistory.pop();
            const previousState = statesHistory[statesHistory.length - 1];
            if (previousState) {
                restoreState(previousState);
                saveState(false);
            }
        }
    });
});


interface IProjectState {
    name: string,
    theme: string,
    labels: ILabelData[],
    buckets: IBucketData[]
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

async function restoreState(projectState: IProjectState) {
    // Clean up
    Label.clean();
    Bucket.clean();
    Task.clean();

    (<HTMLInputElement>document.getElementById('project-name'))!.value = projectState.name;
    document.title = projectState.name;
    document.body.setAttribute('data-theme', projectState.theme);
    // Restoring previous state
    // projectState.labels.map((labelData: ILabelData) => {
    //     new Label(labelData.name, labelData.color);
    // });
    projectState.buckets.map((bucketData: IBucketData) => {
        const bucket = new Bucket(bucketData.name);
        bucketData.tasks.map((taskData: ITaskData) => {
            // const labels = taskData.labels.map(name => Label.getByName(name));
            const labels: Label[] = [];
            new Task(taskData.title, taskData.description, labels, taskData.notes, bucket);
        });
    });
}

const statesHistory: IProjectState[] = [];

export async function saveState(addToHistory: boolean = true): Promise<void> {
    const projectState: IProjectState = {
        name: (<HTMLInputElement>document.getElementById('project-name'))?.value,
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

    if (addToHistory) {
        statesHistory.push(projectState);
    }

    const statusDiv: HTMLElement | null = document.getElementById('save-status');
    if (statusDiv === null) {
        return;
    }

    try {
        const response = await fetch('/state',
            {
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                method: 'POST',
                body: JSON.stringify(projectState)
            }).then(r => r.json());
        if (response.success) {
            statusDiv.className = 'success';
            await sleep(2000);
            statusDiv.className = '';
        } else {
            statusDiv.className = 'error';
            alert('An error occured when trying to save the current state: ' + response.error.code);
        }
    } catch (_error) {
        statusDiv.className = 'error';
        alert('The limbo server could not be contacted. The state will not be saved.');
    }
}