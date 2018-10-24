

class Visualizer {
    width = 12;
    height = 12;

    constructor(Width, Height) {
        this.width = Width;
        this.height = Height;
    }

    draw() {
        fill(204, 101, 192, 127);
        rect(0, 0, this.width, this.height);
    }
}

export default Visualizer;