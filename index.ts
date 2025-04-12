import express from 'express';
import {readFile, stat, writeFile} from 'fs/promises';

const app = express();
app.use(express.static(__dirname));

const port: number = 666;
const stateFilePath = 'state.json';

app.listen(port, () => {
    console.log('http://localhost:' + port);
});

app.get('/', (_req: any, res: any) => {
    res.send('Hello world!');
});

app.get('/planner', (_req: any, res: any) => {
    res.sendFile('index.html', { root: __dirname });
});

app.get('/readState', async (_req: any, res: any) => {
    const fileExists = !!(await stat(stateFilePath).catch(e => false));
    const state = fileExists ? (await readFile(stateFilePath)).toString() : '{}';
    res.send(JSON.parse(state));
});

app.get('/writeState/:state', async (req: any, res: any) => {
    await writeFile(stateFilePath, req.params.state);
    res.send('Ok');
});

