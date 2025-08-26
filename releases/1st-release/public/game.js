export default function createGame() {
    const state = {
        players: {},
        fruits: {},
        screen: {}
    }

    const observers = []

    function start() {
        const frequency = 5000

        setInterval(addFruit, frequency)
    }

    function subscribe(observerFunction) {
        observers.push(observerFunction)
    }

    function unsubscribe() {
        observers.length = 0
    }

    function notifyAll(command) {
        for (const observerFunction of observers) {
            observerFunction(command)
        }
    }

    function setState(newState) {
        Object.assign(state, newState)
    }

    function setScreenSize(screenSize) {
        state.screen = {
            width: screenSize.width,
            height: screenSize.height
        }
    }

    function addPlayer(command) {
        const playerId = command.playerId
        const playerX = command.playerX ?? Math.floor(Math.random() * state.screen.width)
        const playerY = command.playerY ?? Math.floor(Math.random() * state.screen.height)

        state.players[playerId] = {
            x: playerX,
            y: playerY,
            score: 0
        }

        notifyAll({
            type: "add-player",
            playerId: playerId,
            playerX: playerX,
            playerY: playerY
        })
    }

    function removePlayer(command) {
        const playerId = command.playerId

        delete state.players[playerId]

        notifyAll({
            type: "remove-player",
            playerId: playerId
        })
    }

    function addFruit(command = {}) {
        const fruitId = Math.floor(Math.random() * 10000000)
        const fruitX = command.fruitX ?? Math.floor(Math.random() * state.screen.width)
        const fruitY = command.fruitY ?? Math.floor(Math.random() * state.screen.height)

        state.fruits[fruitId] = {
            x: fruitX,
            y: fruitY
        }

        notifyAll({
            type: "add-fruit",
            fruitId: fruitId,
            fruitX: fruitX,
            fruitY: fruitY
        })
    }

    function removeFruit(command) {
        const fruitId = command.fruitId

        delete state.fruits[fruitId]

        notifyAll({
            type: "remove-fruit",
            fruitId: fruitId
        })
    }

    function movePlayer(command) {
        notifyAll(command)

        const acceptedMoves = {
            ArrowUp(player) {
                if (player.y > 0) {
                    player.y = player.y - 1
                }
            },
            ArrowRight(player) {
                if (player.x < state.screen.width - 1) {
                    player.x = player.x + 1
                }
            },
            ArrowDown(player) {
                if (player.y < state.screen.height - 1) {
                    player.y = player.y + 1
                }
            },
            ArrowLeft(player) {
                if (player.x > 0) {
                    player.x = player.x - 1
                }
            }
        }

        const keyPressed = command.keyPressed
        const player = state.players[command.playerId]
        const playerId = command.playerId
        const moveFunction = acceptedMoves[keyPressed]

        if (player && moveFunction) {
            moveFunction(player)
            checkForFruitCollision(playerId)
        }
    }

    function score(playerId) {
        state.players[playerId].score += 1
        
        notifyAll({
            type: "score",
            playerId: playerId,
            score: state.players[playerId].score
        })
    }

    function checkForFruitCollision(playerId) {
        const player = state.players[playerId]

        for (const fruitId in state.fruits) {
            const fruit = state.fruits[fruitId]

            if (player.x === fruit.x && player.y === fruit.y) {
                score(playerId)
                removeFruit({ fruitId: fruitId })
            }
        }
    }

    return {
        addFruit,
        removeFruit,
        addPlayer,
        removePlayer,
        movePlayer,
        state,
        setState,
        subscribe,
        start,
        setScreenSize,
        unsubscribe
    }
}