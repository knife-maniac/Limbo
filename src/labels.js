class Label {
    static list = [];

    static getById(id) {
        return Label.list.filter(l => l.id === id)[0];
    }

    static getByName(name) {
        return Label.list.filter(l => l.name === name)[0];
    }

    constructor(name, color) {
        this.name = name;
        this.color = color;
        if (Label.list.length === 0) {
            this.id = 0;
        } else {
            this.id = Math.max(...Label.list.map(label => label.id)) + 1;
        }
        Label.list.push(this);
    }

    getTag() {
        const tag = createElement('div', { class: 'label_tag' }, this.name);
        tag.style.backgroundColor = this.color + '66'; // Adding transparency
        tag.style.borderColor = this.color;
        tag.style.color = this.color;
        return tag;
    }
}