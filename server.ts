import express from 'express';
import { readFile, stat, writeFile } from 'fs/promises';
import { WebSocketServer } from 'ws';

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const port: number = 666;
const stateFilePath = 'state/state.json';

app.listen(port, () => {
    console.log('\x1b[31m' + `http://localhost:${port}/limbo` + '\x1b[0m');
    const wss = new WebSocketServer({ port: 667 });

    wss.on('connection', async function connection(ws) {
        const state = await getState();
        ws.send(state);
        ws.on('message', setState);
    });
});

app.get('/', (_req: any, res: any) => {
    res.redirect('/limbo');
});

app.get('/limbo', (_req: any, res: any) => {
    res.sendFile('src/index.html', { root: __dirname });
});

async function getState() {
    const fileExists = !!(await stat(stateFilePath).catch(e => false));
    const defaultState = {
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
