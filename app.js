const flipButton = document.querySelector('#flip-button')
const gamesboardContainer = document.querySelector('#gameboard-container')
const optionContainer = document.querySelector('.option-container')

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