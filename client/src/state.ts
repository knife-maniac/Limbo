import { sleep } from './utils';
import { Bucket } from './buckets';
import { Label } from './labels';
import { Task } from './tasks';


export interface IProjectState {
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


export async function restoreState(projectState: IProjectState) {
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

    const statusDiv: HTMLElement | null = document.getElementById('save-status');
    statusDiv?.setAttribute('data-status', 'success');
    await sleep(1000);
    statusDiv?.setAttribute('data-status', 'connected');
}



export async function getState(): Promise<IProjectState> {
    try {
        const response: Response = await fetch('/state', { method: 'GET' });
        return JSON.parse(await response.json());
    } catch (_err) {
        console.error('Failed to contact limbo server, going into demo mode');
        const state = window.localStorage.getItem('state');
        if (state) {
            return JSON.parse(state);
        } else {
            return demoState;
        }
    }
}


export async function saveState(): Promise<void> {
    const statusDiv: HTMLElement | null = document.getElementById('save-status');

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

    try {
        const response = await fetch('/state',
            {
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                method: 'POST',
                body: JSON.stringify(projectState)
            }).then(r => r.json());
        if (response.success) {
            statusDiv?.setAttribute('data-status', 'success');
            await sleep(1500);
            statusDiv?.setAttribute('data-status', 'connected');
        } else {
            statusDiv?.setAttribute('data-status', 'disconnected');
            alert('An error occured when trying to save the current state: ' + response.error.code);
        }
    } catch (_err) {
        window.localStorage.setItem('state', JSON.stringify(projectState));
        statusDiv?.setAttribute('data-status', 'disconnected');
    }
}


const demoState: IProjectState = {
    "name": "Limbo's Limbo",
    "theme": "limbo",
    "labels": [],
    "buckets": [
        {
            "name": "todo",
            "tasks": [
                {
                    "title": "🔄 Enable undo/redo actions",
                    "description": "",
                    "labels": [],
                    "notes": ""
                },
                {
                    "title": "🎨 Add color schemes support",
                    "description": "Ideas are in notes",
                    "labels": [],
                    "notes": "- Default (no fun)\n- Limbo\n- Hight contrast\n- Kiwi / Nectarine\n- Bladerunner 2048\n- \"I always preferred Trello anyway\" (Trello-like theme)\n\n"
                },
                {
                    "title": "📋 Add subtasks to tasks",
                    "description": "",
                    "labels": [],
                    "notes": ""
                },
                {
                    "title": "Enable multi-projects",
                    "description": "CRUD projects",
                    "labels": [],
                    "notes": ""
                }
            ]
        },
        {
            "name": "ongoing",
            "tasks": []
        },
        {
            "name": "done",
            "tasks": [
                {
                    "title": "🌱 Task addition",
                    "description": "",
                    "labels": [],
                    "notes": ""
                },
                {
                    "title": "✍🏻 Task edition",
                    "description": "",
                    "labels": [],
                    "notes": ""
                },
                {
                    "title": "🗑️ Task deletion",
                    "description": "",
                    "labels": [],
                    "notes": ""
                },
                {
                    "title": "💾 Make created tasks persistent",
                    "description": "",
                    "labels": [],
                    "notes": ""
                },
                {
                    "title": "Task drag-and-drop from bucket to bucket",
                    "description": "",
                    "labels": [],
                    "notes": ""
                },
                {
                    "title": "Move bucket and tasks to persistent state",
                    "description": "",
                    "labels": [],
                    "notes": ""
                },
                {
                    "title": "✅ Add save status indicator",
                    "description": "",
                    "labels": [],
                    "notes": ""
                },
                {
                    "title": "Enable task description",
                    "description": "Like this!",
                    "labels": [],
                    "notes": ""
                },
                {
                    "title": "Enable task notes",
                    "description": "",
                    "labels": [],
                    "notes": "Like that!"
                },
                {
                    "title": "Scroll up bucket when creating a NEW task",
                    "description": "",
                    "labels": [],
                    "notes": ""
                },
                {
                    "title": "🎨 Improve design system",
                    "description": "Move colors to CSS variables in a separate theme folder",
                    "labels": [],
                    "notes": ""
                },
                {
                    "title": "Improve task editor form submission",
                    "description": "On click dismiss, remove button?",
                    "labels": [],
                    "notes": ""
                },
                {
                    "title": "🌐 Switch to client/server web socket communication",
                    "description": "Use Express.js",
                    "labels": [],
                    "notes": "https://expressjs.com/"
                },
                {
                    "title": "Move frontend code from JavaScript to TypeScript + setup Vite",
                    "description": "",
                    "labels": [],
                    "notes": ""
                },
                {
                    "title": "🚀 Rewrite TaskEditor in OOP using the singleton design pattern",
                    "description": "",
                    "labels": [],
                    "notes": "https://en.wikipedia.org/wiki/Singleton_pattern"
                }
            ]
        }
    ]
};
