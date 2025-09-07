import { getState, IProjectState, restoreState, saveState } from './state';

console.log('regular index called...');


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

    // Restoring state
    const projectState: IProjectState = await getState();
    restoreState(projectState);
});
