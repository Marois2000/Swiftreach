const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
const music = new Audio("sounds/Dungeon Theme.mp3")
const footSteps = new Audio("sounds/one step.mp3")
const jump = new Audio("sounds/jump.mp3")
const keyJingle = new Audio("sounds/key pickup.mp3")
const stab = new Audio("sounds/stab.mp3")
const winSound = new Audio("sounds/win.mp3")

const startButton = document.getElementById("start")
const startMenu = document.getElementById("startmenu")

const keyIcon = document.querySelector(".key")
const currentTime = document.getElementById("current")
const fastestTime = document.getElementById("fast")
const recentTime = document.getElementById("last")
const winBanner = document.getElementById("winId")
const play = document.getElementById("replay")

play.addEventListener("click", () => {
    location.reload()
})

startButton.addEventListener("click", () => {
    startMenu.style.display = "none"
    music.play()
    startTimer()
})

winBanner.style.display = "none"


if(localStorage.getItem("fastTime") == null) {
    fastestTime.innerHTML = "--:--"
} else {
    fastestTime.innerHTML = localStorage.getItem("fastTime")
}

if(localStorage.getItem("LastTime") == null) {
    recentTime.innerHTML = "--:--"
} else {
    recentTime.innerHTML = localStorage.getItem("LastTime")
}



music.loop = true
music.volume = 0.2
jump.volume = 0.6

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
    image: image,
    initialPosition: {
        x: offset.x,
        y: offset.y
    }
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
    image: foregroundImage,
    initialPosition: {
        x: offset.x,
        y: offset.y
    }
})

const key = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: keyImage,
    initialPosition: {
        x: offset.x,
        y: offset.y
    }
})

const chestClosed = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: chestClosedImage,
    initialPosition: {
        x: offset.x,
        y: offset.y
    }
})

const chestOpen = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: chestOpenImage,
    initialPosition: {
        x: offset.x,
        y: offset.y
    }
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
                damage: false,
                initialPosition: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y
                }
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
                damage: true,
                initialPosition: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y
                }
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
                chest: false,
                initialPosition: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y
                }
            }))
        } else if(point === 272) {
            points.push(new Boundary({
                position: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y
                }, 
                damage: false,
                key: false,
                chest: true,
                initialPosition: {
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
        player.position.y + player.height >= surface.position.y - 10 &&
        player.position.y + player.height <= surface.position.y + 10 &&
        player.position.y <= surface.position.y + surface.height &&
        player.position.x + (player.width / 2) >= surface.position.x &&
        player.position.x + (player.width / 2) <= surface.position.x + surface.width
    )
}

function hittingCeiling( {player, surface} ) {
    return (
        player.position.y <= surface.position.y + surface.height + 5 &&
        player.position.y >= surface.position.y + surface.height - 5  &&
        player.position.x + (player.width / 2) >= surface.position.x &&
        player.position.x + (player.width / 2) <= surface.position.x + surface.width
    )
}


let yVelocity = 0
let xVelocity = 55
const maxSpeed = -10

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
    

    if(!win) {
        let moving = true;
        player.moving = false
        if(keys.a.pressed && lastKey === 'a') {
            if(isGrounded) {
                footSteps.play()
            }
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
            if(isGrounded) {
                footSteps.play()
            }
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
            takeDamage()
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
            pickupKey()
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
                winGame()
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
        yVelocity -= 2.5 * deltaTime
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
        yVelocity = -2
    }

    movables.forEach((movable) => {
        movable.position.y += yVelocity
    })


    currentTime.innerHTML = formatTime
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
        
            if(isGrounded && !win) {
                jump.play()
                yVelocity += 65 * globalDT
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



//Quality functions

function takeDamage() {
    stab.play()
    keyCollected = false
    keyIcon.src = ""
    movables.forEach(movable => {
        movable.reset()
    });
}

function winGame() {
    winSound.loop = false
    music.pause()
    winSound.play()
    setTimeout(function() {
        winSound.pause()
    }, 7000)
    endTime = formatTime
    clearInterval(timer)
    winBanner.style.display = "flex"

    localStorage.setItem("LastTime", endTime)
    if(localStorage.getItem("fastTime") == null) {
        localStorage.setItem("fastTime", endTime)
    } else {
        let currentFastest = localStorage.getItem("fastTime")
        if(compareTimes(endTime, currentFastest)) {
            localStorage.setItem("fastTime", endTime)
        }
    }
    currentTime.innerHTML = endTime
}

function pickupKey() {
    keyIcon.src = "./icons/key icon.png"
    keyCollected = true
    music.pause()
    keyJingle.play()
    setTimeout(function() {
        music.play()
    }, 3000)
}