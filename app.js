const flipButton = document.querySelector('#flip-button')
const gamesboardContainer = document.querySelector('#gameboard-container')
const optionContainer = document.querySelector('.option-container')
const startButton = document.querySelector('#start-button')
const infoDisplay = document.querySelector('#info')
const turnDisplay = document.querySelector('#turn-display')

// Choosing options
let angle = 0;
function flip () {

    const optionShips = Array.from(optionContainer.children)

    angle = angle === 0 ? 90 : 0

    optionShips.forEach(optionShip => optionShip.style.transform = `rotate(${angle}deg)`)
}

flipButton.addEventListener('click', flip)

// Creating Boards
const width = 10

function createBoard(boardColor, user) {
    const gameboardContainer = document.createElement(`div`)

    gameboardContainer.classList.add('game-board')
    gameboardContainer.style.backgroundColor = boardColor
    gameboardContainer.id = user

    for(let i=0; i < width * width; i++) {
        const block = document.createElement('div')

        block.classList.add('block')
        block.id = i
        gameboardContainer.append(block)
    }

    gamesboardContainer.append(gameboardContainer)
}

createBoard(`yellow`, `player`)
createBoard(`pink`, `computer`)

// Creating Ships

class Ship {
    constructor(name, length) {
        this.name = name
        this.length = length
    }
}

const destroyer = new Ship('destroyer', 2)
const submarine = new Ship('submarine', 3)
const cruiser = new Ship('cruiser', 3)
const battleship = new Ship('battleship', 4)
const carrier = new Ship('carrier', 5)

const ships = [destroyer, submarine, cruiser, battleship, carrier]
let notDropped

function getValidity(allBoardBlocks, isHorizontal, startIndex, ship) {

    let validStart = isHorizontal ? startIndex <= width * width - ship.length ? startIndex :
    width * width - ship.length : 
    // handle vertical start
    startIndex <= width * width - width * ship.length ? startIndex :
    startIndex - ship.length * width + width

   let shipBlocks = [];

    for(let i=0; i < ship.length; i++){
        if(isHorizontal) {
            shipBlocks.push(allBoardBlocks[Number(validStart) + i])
        } else {
            shipBlocks.push(allBoardBlocks[Number(validStart) + i * width])
        }
    }

    let valid

    if(isHorizontal) {
        shipBlocks.every((_shipBlock, index) =>
            valid = shipBlocks[0].id % width !== width - (shipBlocks.length - (index + 1)))
    } else {
        shipBlocks.every((_shipBlock, index) =>
            valid = shipBlocks[0].id < 90 + (width * index + 1)
        )
    }

    const notTaken = shipBlocks.every(shipBlock => !shipBlock.classList.contains('taken'))

    return {shipBlocks, valid, notTaken}
}
function addShipPiece(user, ship, startID) {
   const allBoardBlocks = document.querySelectorAll(`#${user} div`)
   let randomBoolean = Math.random() < 0.5
   let isHorizontal = user === 'player' ? angle === 0 : randomBoolean
   let randomStartIndex = Math.floor(Math.random() * width * width)

   let startIndex = startID ? startID : randomStartIndex

   const {shipBlocks, valid, notTaken } = getValidity(allBoardBlocks, isHorizontal, startIndex, ship)

    if (valid && notTaken) {
        shipBlocks.forEach(shipBlock => {
            shipBlock.classList.add(ship.name)
            shipBlock.classList.add('taken')
        })
    } else {
        if(user === 'computer') addShipPiece(user, ship, startID)
        if(user === 'player') notDropped = true
    }
   
}

ships.forEach(ship => addShipPiece('computer', ship))

// Drag player ships

let draggedShip
const optionShips = Array.from(optionContainer.children)

optionShips.forEach(optionShip => optionShip.addEventListener('dragstart', dragStart))

const allPlayerBlocks = document.querySelectorAll('#player div')

allPlayerBlocks.forEach(playerBlock => {
    playerBlock.addEventListener('dragover', dragOver)
    playerBlock.addEventListener('drop', dropShip)
}
)

function dragStart(e) {
    notDropped = false
    draggedShip = e.target
}

function dragOver(e) {
    e.preventDefault()
    const ship = ships[draggedShip.id]
    highlightArea(e.target.id, ship)
}

function dropShip(e) {
    const startID = e.target.id
    const ship = ships[draggedShip.id]
    addShipPiece('player', ship, startID)

    if (!notDropped) {
        draggedShip.remove()
    }
}

// Add highlight
function highlightArea(startIndex, ship) {
    const allBoardBlocks = document.querySelectorAll('#player div')
    let isHorizontal = angle == 0

    const { shipBlocks, valid, notTaken } = getValidity(allBoardBlocks, isHorizontal, startIndex, ship)

    if (valid && notTaken) {
        shipBlocks.forEach(shipBlock => {
            shipBlock.classList.add('hover')
            setTimeout( () => shipBlock.classList.remove('hover'), 500)
        })
    }
}

// Game Logic

let gameOver = false
let playerTurn

// Start Game
function startGame() {
    if (optionContainer.children.length != 0) {
        infoDisplay.textContent = 'Please place all your pieces first.'
    } else {
        const allBoardBlocks = document.querySelectorAll('#computer div')
        allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))
    }
}

startButton.addEventListener('click', startGame)

let playerHits = []
let computerHits = []

function handleClick(e) {
    if (!gameOver) {
        if (e.target.classList.contains('taken')) {
            e.target.classList.add('boom')
            infoDisplay.textContent = `You've hit!`
            let classes = Array.from(e.target.classList)
            classes.filter(className => className !== 'block')
            classes.filter(className => className !== 'boom')
            classes.filter(className => className !== 'taken')
            playerHits.push(...classes)
        }
    }

    if (!e.target.classList.contains('taken')) {
        infoDisplay.textContent = `Missed`
        e.target.classList.add('empty')
    }

    playerTurn = false
    const allBoardBlocks = document.querySelectorAll('#computer div')
    allPlayerBlocks.forEach(block => block.replaceWith(block.cloneNode(true)))

    setTimeout(computerGo, 3000)
}

// Computer Turn
function computerGo() {
    if (!gameOver) {
        turnDisplay.textContent = `Computer's Turn`
        infoDisplay.textContent = `Computer thinking...`

        setTimeout( () => {
            let randomGo = Math.floor(Math.random() * width * width)

            const allBoardBlocks = document.querySelectorAll('#player div')

            if  (allBoardBlocks[randomGo].classList.contains('taken') &&
                allBoardBlocks[randomGo].classList.contains('boom')) {
                    computerGo()
                    return
                } else if (allBoardBlocks[randomGo].classList.contains('taken') &&
                !allBoardBlocks[randomGo].classList.contains('boom')) {
                    allBoardBlocks[randomGo].classList.add('boom')
                    infoDisplay.textContent = `You've been hit!`

                    let classes = Array.from(e.target.classList)
                    classes.filter(className => className !== 'block')
                    classes.filter(className => className !== 'boom')
                    classes.filter(className => className !== 'taken')
                    computerHits.push(...classes)
                } else {
                    infoDisplay.textContent = "Computer missed"
                    allBoardBlocks[randomGo].classList.add('empty')
                }
        }, 3000)
    }

    setTimeout(() => {
        playerTurn = true
        turnDisplay.textContent = `Your turn`
        infoDisplay.textContent = 'Please take your shot'

        const allBoardBlocks = document.querySelectorAll('#computer div')
        allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))
    }, 6000)
}

