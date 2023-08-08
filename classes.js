class Sprite {
    constructor({position, image, frames = { max: 1} }) {
        this.position = position
        this.image = image
        this.frames = frames

        this.image.onload = () => {
            this.width = this.image.width / this.frames.max
            this.height = this.image.height
            console.log(this.position.y + this.height)
        }
    }

    draw() {
        c.drawImage(this.image,
            0,
            0,
            this.image.width / this.frames.max,
            this.image.height,
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max,
            this.image.height
         )
    }
}

// canvas.width / 2 - this.image.width / 8, 
//             ((canvas.height / 4) * 3) - this.image.height / 8,

class Boundary {
    static width = 64
    static height = 64
    constructor({position}) {
        this.position = position
        this.width = 64
        this.height = 64
    }

    draw() {
        c.fillStyle = "rgba(255, 0, 0, 0)"
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}

const offset = {
    x: 0,
    y: -1050
}