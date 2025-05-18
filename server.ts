import { readFile, stat, writeFile } from 'fs/promises';
import { WebSocketServer } from 'ws';

const stateFilePath = 'state/state.json';

const wss = new WebSocketServer({ port: 666 });

wss.on('connection', async function connection(ws) {
    const state = await getState();
    ws.send(state);
    ws.on('message', setState);
});

async function getState() {
    const fileExists = !!(await stat(stateFilePath).catch(e => false));
    const defaultState = {
        name: 'New project',
        theme: 'default',
        labels: [],
        buckets: [
            { name: 'Todo', tasks: [] },
            { name: 'Ongoing', tasks: [] },
            { name: 'Done', tasks: [] }
        ]
    }
    const state = fileExists ? (await readFile(stateFilePath)).toString() : JSON.stringify(defaultState);
    return state;
}

async function setState(state: any) {
    try {
        await writeFile(stateFilePath, state);
        // await backupState(state); // TODO: Decide when to backup state
        return { success: true };
    } catch (error) {
        return { success: false, message: error };
    }
}

async function backupState(state: any) {
    const date = new Date().toISOString();
    await writeFile(`state/backup-${date}.json`, state);
}
