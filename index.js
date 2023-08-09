const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

//parse boundary walls
const wallMap = []
for(let i = 0; i < walls.length; i += 100) {
    wallMap.push(walls.slice(i, i + 100));
}

const image = new Image();
image.src = './world/dungeon crawl.png';

const playerRightImage = new Image();
playerRightImage.src = './character/player right.png';

const playerLeftImage = new Image();
playerLeftImage.src = './character/player left.png';

const foregroundImage = new Image();
foregroundImage.src = './world/foreground.png'


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

const boundaries = []
wallMap.forEach((row, i) => {
    row.forEach((tile, j) => {
        if(tile === 271) {
            boundaries.push(new Boundary({
                position: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y
                }
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


const movables = [background, ...boundaries, foreground]

function rectangularCollision({rectangle1, rectangle2}) {
    return (
        rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
        rectangle1.position.y + rectangle1.height -3 >= rectangle2.position.y
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


let yVelocity = 0
let xVelocity = 3
const maxSpeed = 3
function animate() {
    window.requestAnimationFrame(animate);
    background.draw();
    boundaries.forEach((boundary) => {
        boundary.draw();
    })
    player.draw()
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
                    x: boundary.position.x + xVelocity,
                    y: boundary.position.y
                }}
            })) {
                moving = false;
                break
            }
        }

        if(moving) {
            movables.forEach((movable) => {
                movable.position.x += xVelocity;
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
                    x: boundary.position.x - xVelocity,
                    y: boundary.position.y
                }}
            })) {
                moving = false;
                break
            }
        }

        if(moving) {
            movables.forEach((movable) => {
                movable.position.x -= xVelocity;
            })
        }
    }

    //fix falling through floor glitch
    for(let i = 0; i < boundaries.length; i++) {
        if(player.x >= boundaries[i].position.x &&
        player.x <= boundaries[i].position.x + boundaries[i].width && 
        player.y + player.height >= boundaries[i].position.y &&
        player.y + player.height <= boundaries[i].position.y + boundaries[i].height) {
            movables.position.y += 3
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
        yVelocity -= 0.035
    }

    if(yVelocity > maxSpeed) {
        yVelocity = maxSpeed
    }

    movables.forEach((movable) => {
        movable.position.y += yVelocity
    })
    
}

animate();

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
                yVelocity += 3
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