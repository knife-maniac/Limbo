import { readFile, stat, writeFile } from 'fs/promises';

import { description, port, version } from './package.json';

import express from 'express';
import { createServer } from 'vite';


const stateFilePath = 'state/state.json';

const app = express();

app.use(express.json());
app.use(express.static(__dirname + '/client'));

app.get('/state', async (_req, res) => {
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
    res.json(state);
});


app.post('/state', async (req, res) => {
    try {
        const state = JSON.stringify(req.body, null, 4);
        await writeFile(stateFilePath, state);
        // await backupState(state); // TODO: Decide when to backup state
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
});

async function backupState(state: any) {
    const date = new Date().toISOString();
    await writeFile(`state/backup-${date}.json`, state);
}


(async () => {
    if (process.env.NODE_ENV === 'development') {
        const viteDevServer = await createServer({
            server: {
                middlewareMode: true
            },
            root: 'client',
            base: '/',
        });
        app.use(viteDevServer.middlewares);
    } else {
        app.get('/', (_req, res) => {
            res.sendFile('/client/index.html', { root: __dirname });
        });
    }

    app.listen(port, () => {
        console.clear();
        process.stdout.write('\x1b[32m' + '\n  ➜  ' + '\x1b[0m');
        process.stdout.write(`Limbo ${version} running on `);
        process.stdout.write('\x1b[36m' + `http://localhost:${`${'\x1b[1m' + port + '\x1b[0m' + '\x1b[36m'}`}/\n` + '\x1b[0m');
        process.stdout.write('\x1b[90m' + '\x1b[3m' + `     ${description}\n` + '\x1b[0m');
    });
})();
