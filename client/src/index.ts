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
    const themeDropdown = <HTMLInputElement>document.getElementById('theme-selector');
    themeDropdown?.addEventListener('change', () => {
        const selectedTheme: string = themeDropdown.value;
        document.documentElement.setAttribute('data-theme', selectedTheme);
        saveState();
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
    statusDiv.setAttribute('data-status', 'success');
    await sleep(1000);
    statusDiv.setAttribute('data-status', 'connected');
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


    (<HTMLInputElement>document.getElementById('theme-selector')).value = projectState.theme;
    document.documentElement.setAttribute('data-theme', projectState.theme);
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

export async function saveState(): Promise<void> {
    const projectState: IProjectState = {
        name: (<HTMLInputElement>document.getElementById('project-name'))?.value,
        theme: document.documentElement.getAttribute('data-theme') || 'default',
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
            statusDiv.setAttribute('data-status', 'success');
            await sleep(1500);
            statusDiv.setAttribute('data-status', 'connected');
        } else {
            statusDiv.setAttribute('data-status', 'disconnected');
            alert('An error occured when trying to save the current state: ' + response.error.code);
        }
    } catch (_error) {
        statusDiv.className = 'error';
        alert('The limbo server could not be contacted. The state will not be saved.');
    }
}