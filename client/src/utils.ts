export async function sleep(ms: number): Promise<void> {
    return new Promise((resolve, _reject) => {
        setTimeout(resolve, ms);
    });
}

export function createElement(tag: string, attributes: { [key: string]: string }, textContent: string = ''): HTMLElement {
    const element: HTMLElement = document.createElement(tag);
    Object.entries(attributes).map(([key, value]) => {
        element.setAttribute(key, value);
    });
    element.textContent = textContent;
    return element;
}