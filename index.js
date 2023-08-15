const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

//parse boundary walls
const wallMap = []
for(let i = 0; i < walls.length; i += 100) {
    wallMap.push(walls.slice(i, i + 100));
}

//parse spikes
const spikeMap = []
for(let i = 0; i < spikedata.length; i += 100) {
    spikeMap.push(spikedata.slice(i, i + 100))
}

const pointMap = []
for(let i = 0; i < pointdata.length; i += 100) {
    pointMap.push(pointdata.slice(i, i + 100))
}



const image = new Image();
image.src = './world/dungeon crawl.png';

const playerRightImage = new Image();
playerRightImage.src = './character/player right.png';

const playerLeftImage = new Image();
playerLeftImage.src = './character/player left.png';

const foregroundImage = new Image();
foregroundImage.src = './world/foreground.png'

const keyImage = new Image()
keyImage.src = './world/key.png'

const chestClosedImage = new Image()
chestClosedImage.src = './world/chest closed.png'

const chestOpenImage = new Image()
chestOpenImage.src = './world/chest open.png'


const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: image
});

const player = new Sprite({
    position: {
      x: canvas.width / 2 - 192 / 8,
      y: ((canvas.height / 4) * 3) - 68 / 8  
    }, 
    image: playerRightImage,
    frames: {
        max: 4
    },
    sprites: {
        left: playerLeftImage,
        right: playerRightImage
    }
})

const foreground = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: foregroundImage
})

const key = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: keyImage
})

const chestClosed = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: chestClosedImage
})

const chestOpen = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: chestOpenImage
})

const boundaries = []
wallMap.forEach((row, i) => {
    row.forEach((tile, j) => {
        if(tile === 271) {
            boundaries.push(new Boundary({
                position: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y
                },
                damage: false
            }))
        }
    })
})

const spikes = []
spikeMap.forEach((row, i) => {
    row.forEach((spike, j) => {
        if(spike === 271) {
            spikes.push(new Boundary({
                position: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y
                }, 
                damage: true
            }))
        }
    })
})

const points = []
pointMap.forEach((row, i) => {
    row.forEach((point, j) => {
        if(point === 271) {
            points.push(new Boundary({
                position: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y
                }, 
                damage: false,
                key: true,
                chest: false
            }))
        } else if(point === 272) {
            points.push(new Boundary({
                position: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y
                }, 
                damage: false,
                key: false,
                chest: true
            }))
        } 
    })
})


const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    space: {
        pressed: false
    }
}


const movables = [background, ...boundaries, foreground, ...spikes, ...points, key, chestClosed, chestOpen]

function rectangularCollision({rectangle1, rectangle2}) {

    let collided = rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
    rectangle1.position.y + rectangle1.height -3 >= rectangle2.position.y

    let damage = false
    let key = false
    let chest = false

    if(collided) {
        damage = rectangle2.damage
        key = rectangle2.key
        chest = rectangle2.chest
    }

    return ( {
            collided: collided,
            damage: damage,
            key: key,
            chest: chest
        }    
    )
}

function grounded( {player, surface} ) {
    return (
        player.position.y + player.height >= surface.position.y - 3 &&
        player.position.y + player.height <= surface.position.y + 3 &&
        player.position.y <= surface.position.y + surface.height &&
        player.position.x + (player.width / 2) >= surface.position.x &&
        player.position.x + (player.width / 2) <= surface.position.x + surface.width
    )
}

function hittingCeiling( {player, surface} ) {
    return (
        player.position.y <= surface.position.y + surface.height + 3 &&
        player.position.y >= surface.position.y + surface.height - 3 &&
        player.position.x + (player.width / 2) >= surface.position.x &&
        player.position.x + (player.width / 2) <= surface.position.x + surface.width
    )
}


let yVelocity = 0
let xVelocity = 50
const maxSpeed = -3

let keyCollected = false
let win = false

let lastTime = 0
let globalDT = 0

function animate(timestamp) {
    window.requestAnimationFrame(animate);

    const deltaTime = (timestamp - lastTime) / 100
    lastTime = timestamp
    globalDT = deltaTime


    background.draw();
    boundaries.forEach((boundary) => {
        boundary.draw();
    })
    player.draw()
    spikes.forEach((spike) => {
        spike.draw();
    })
    points.forEach((point) => {
        point.draw();
    })
    if(!keyCollected) {
        key.draw()
    }

    if(win) {
        chestOpen.draw()
    } else {
        chestClosed.draw()
    }
    
    foreground.draw()
    
    

    let moving = true;
    player.moving = false
    if(keys.a.pressed && lastKey === 'a') {
        player.moving = true
        player.image = player.sprites.left
        for(let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if(rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x + xVelocity * deltaTime,
                    y: boundary.position.y
                }}
            }).collided) {
                moving = false;
                break
            }
        }

        if(moving) {
            movables.forEach((movable) => {
                movable.position.x += xVelocity * deltaTime;
            })
        }
        
    } else if(keys.d.pressed && lastKey === 'd') {
        player.moving = true
        player.image = player.sprites.right
        for(let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if(rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x - xVelocity * deltaTime,
                    y: boundary.position.y
                }}
            }).collided) {
                moving = false;
                break
            }
        }

        if(moving) {
            movables.forEach((movable) => {
                movable.position.x -= xVelocity * deltaTime;
            })
        }
    }

    for(let i = 0; i < spikes.length; i++) {
        const spike = spikes[i]
        if(rectangularCollision({
            rectangle1: player,
            rectangle2: {...spike, position: {
                x: spike.position.x + xVelocity * deltaTime ,
                y: spike.position.y
            }}
        }).damage) {
            location.reload()
            break
        }
    }

    for(let i = 0; i < points.length; i++) {
        const point = points[i]
        if(rectangularCollision({
            rectangle1: player,
            rectangle2: {...point, position: {
                x: point.position.x + xVelocity * deltaTime,
                y: point.position.y
            }}
        }).key) {
            keyCollected = true
            break
        } else if(rectangularCollision({
            rectangle1: player,
            rectangle2: {...point, position: {
                x: point.position.x + xVelocity * deltaTime,
                y: point.position.y
            }}
        }).chest) {
            if(keyCollected) {
                win = true
            }
            break
        }
    }

    

    isGrounded = false
    for(let i = 0; i < boundaries.length; i++) {
        if(grounded({
            player: player,
            surface: boundaries[i]
        })) {
            yVelocity = 0
            isGrounded = true;
            keys.space.pressed = false;
            break
        } 
    }

    if(!isGrounded) {
        yVelocity -= 0.6 * deltaTime
    }

    if(yVelocity < maxSpeed) {
        yVelocity = maxSpeed
    }

    isHittingCeiling = false
    for(let i = 0; i < boundaries.length; i++) {
        if(hittingCeiling({
            player: player,
            surface: boundaries[i]
        })) {
            yVelocity = 0
            isHittingCeiling = true;
            break
        } 
    }

    if(isHittingCeiling) {
        yVelocity = -0.5
    }

    movables.forEach((movable) => {
        movable.position.y += yVelocity
    })
}

animate(0);

let lastKey = ' ';
window.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "d":
            keys.d.pressed = true
            lastKey = 'd';
            break;

        case "a":
            keys.a.pressed = true
            lastKey = 'a';
            
            break;

        case " ":
            isGrounded = false
            for(let i = 0; i < boundaries.length; i++) {
                if(grounded({
                    player: player,
                    surface: boundaries[i]
                })) {
                    yVelocity = 0
                    isGrounded = true;
                    keys.space.pressed = false;
                    break
                } 
            }
        
            if(isGrounded) {
                yVelocity += 3.2
                movables.forEach((movable) => {
                    movable.position.y += yVelocity
                })
            }
            break;

        default:
            break;
    }
})

window.addEventListener("keyup", (e) => {
    switch (e.key) {
        case "d":
            keys.d.pressed = false
            break;
    

        case "a":
            keys.a.pressed = false
            break;

        case " ":
            keys.space.pressed = false
            break;

        default:
            break;
    }
})