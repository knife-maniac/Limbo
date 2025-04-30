import express from 'express';
import { readFile, stat, writeFile } from 'fs/promises';

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const port: number = 666;
const stateFilePath = 'state/state.json';

app.listen(port, () => {
    console.log('\x1b[31m' + `http://localhost:${port}/limbo` + '\x1b[0m');
});

app.get('/', (_req: any, res: any) => {
    res.redirect('/limbo');
});

app.get('/limbo', (_req: any, res: any) => {
    res.sendFile('src/index.html', { root: __dirname });
});

app.get('/state', async (_req: any, res: any) => {
    const fileExists = !!(await stat(stateFilePath).catch(e => false));
    const defaultState = { labels: [], buckets: [] }
    const state = fileExists ? (await readFile(stateFilePath)).toString() : JSON.stringify(defaultState);
    res.send(JSON.parse(state));
});

app.post('/state', async (req: any, res: any) => {
    try {
        const state = JSON.stringify(req.body, null, 4);
        await writeFile(stateFilePath, state);
        // await backupState(state); // TODO: Decide when to backup state
        res.status = 200;
        res.send({ success: true })
    } catch (error) {
        res.status = 500;
        res.send({ success: false, message: error });
    }

});

async function backupState(state: any) {
    const date = new Date().toISOString();
    await writeFile(`state/backup-${date}.json`, state);
}
