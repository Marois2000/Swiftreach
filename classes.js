class Sprite {
    constructor({position, image, frames = { max: 1}, sprites, initialPosition }) {
        this.position = position
        this.image = image
        this.frames = {...frames, val: 0, elapsed: 0}

        this.image.onload = () => {
            this.width = this.image.width / this.frames.max
            this.height = this.image.height
        }
        this.moving = false;
        this.sprites = sprites
        this.initialPosition = initialPosition
    }

    draw() {
        c.drawImage(this.image,
            this.frames.val * this.width,
            0,
            this.image.width / this.frames.max,
            this.image.height,
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max,
            this.image.height
         )

         if(!this.moving) return

         if(this.frames.max > 1) {
            this.frames.elapsed++
         }

         if(this.frames.elapsed % 7 ===0) {
            if(this.frames.val < this.frames.max - 1) {
                this.frames.val++
             } else {
                this.frames.val = 0
             }
         }
    }

    reset() {
        this.position = {
            x: this.initialPosition.x,
            y: this.initialPosition.y
        }
    }
}

class Boundary {
    static width = 64
    static height = 64
    constructor({position, damage, key, chest, initialPosition}) {
        this.position = position
        this.width = 64
        this.height = 64
        this.damage = damage
        this.key = key,
        this.chest = chest
        this.initialPosition = initialPosition
    }

    draw() {
        c.fillStyle = "rgba(255, 0, 0, 0)"
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }

    reset() {
        this.position = {
            x: this.initialPosition.x,
            y: this.initialPosition.y
        }
    }
}



const offset = {
    x: 0,
    y: -1025
}