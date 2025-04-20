async function sleep(ms) {
    return new Promise((resolve, _reject) => {
        setTimeout(resolve, ms);
    });
}

function createElement(tag, attributes, textContent = '') {
    const element = document.createElement(tag);
    Object.entries(attributes).map(([key, value]) => {
        element.setAttribute(key, value);
    });
    element.textContent = textContent;
    return element;
}
