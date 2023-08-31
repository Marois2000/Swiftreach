
let millis = 0
let formatTime = ""
let endTime
let timing = true

function startTimer() {
    let start = Date.now()
    timer = setInterval(function() {
        millis = Date.now() - start  
        const totalSeconds = Math.floor(millis / 1000)
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
        const millisLeftOver = millis % 1000

        formatTime = "" + minutes + ":" + seconds + ":" + millisLeftOver
    }, 1)
}

function compareTimes(time1, time2) {
    time1Val = time1.split(":", 3)
    time2Val = time2.split(":", 3)
    console.log(time1Val)
    console.log(time2Val)


    if(time1Val[0] < time2Val[0]) {
        return true
    } else if (time1Val[0] == time2Val[0] && time1Val[1] < time2Val[1]) {
        return true
    } else if (time1Val[0] == time2Val[0] && time1Val[1] == time2Val[1] && time1Val[2] <= time2Val[2]) {
        return true
    }

    return false
}


startTimer()




