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
    const defaultState = { buckets: [], tasks: [] }
    const state = fileExists ? (await readFile(stateFilePath)).toString() : JSON.stringify(defaultState);
    res.send(JSON.parse(state));
});

app.post('/state', async (req: any, res: any) => {
    await writeFile(stateFilePath, JSON.stringify(req.body, null, 4));
    res.send('Ok');
});

