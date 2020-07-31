import React from 'react';
import './Game.css';

// size of the grid and the current generation count
const CELL_SIZE = 20;
// var WIDTH = 1000;
// var HEIGHT = 1000;
var currentgeneration = 0


class Cell extends React.Component {

    render() {
        const { x, y } = this.props;
        return (
            <div className="Cell" style={{
                left: `${CELL_SIZE * x + 1}px`,
                top: `${CELL_SIZE * y + 1}px`,
                width: `${CELL_SIZE - 1}px`,
                height: `${CELL_SIZE - 1}px`,
            }} />
        );
    }
}


class Game extends React.Component {

    constructor() {
        super();
        this.rows = this.state.HEIGHT / CELL_SIZE;
        this.cols = this.state.WIDTH / CELL_SIZE;

        this.board = this.makeEmptyBoard();
    }

    state = {
        WIDTH : 1000,
        HEIGHT : 1000,
        cells: [],
        isRunning: false,
        interval: 100,
    }

    // handleWidthChange = (event) => {
    //     this.setState({ WIDTH: event.target.value })
    // }

    // handleHeightChange = (event) => {
    //     this.setState({ HEIGHT: event.target.value })
    // }


    makeEmptyBoard() {
        let board = [];
        for (let y = 0; y < this.rows; y++) {
            board[y] = [];
            for (let x = 0; x < this.cols; x++) {
                board[y][x] = false;
            }
        }

        return board;
    }

    getElementOffset() {
        const rect = this.boardRef.getBoundingClientRect();
        const doc = document.documentElement;

        return {
            x: (rect.left + window.pageXOffset) - doc.clientLeft,
            y: (rect.top + window.pageYOffset) - doc.clientTop,
        };
    }

    makeCells() {
        let cells = [];
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.board[y][x]) {
                    cells.push({ x, y });
                }
            }
        }

        return cells;
    }

    handleClick = (event) => {

        const elemOffset = this.getElementOffset();
        const offsetX = event.clientX - elemOffset.x;
        const offsetY = event.clientY - elemOffset.y;
        
        const x = Math.floor(offsetX / CELL_SIZE);
        const y = Math.floor(offsetY / CELL_SIZE);

        if (x >= 0 && x <= this.cols && y >= 0 && y <= this.rows) {
            this.board[y][x] = !this.board[y][x];
        }

        this.setState({ cells: this.makeCells() });
    }

    // starts running the game
    runGame = () => {
        this.setState({ isRunning: true });
        this.runIteration();
    }

    runOneIteration = () => {
        this.runIteration()
        this.stopGame()
    }

    // pauses the game
    stopGame = () => {
        this.setState({ isRunning: false });
        if (this.timeoutHandler) {
            window.clearTimeout(this.timeoutHandler);
            this.timeoutHandler = null;
        }
    }

    runIteration() {
        let newBoard = this.makeEmptyBoard();
        currentgeneration++

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                let neighbors = this.calculateNeighbors(this.board, x, y);
                if (this.board[y][x]) {
                    if (neighbors === 2 || neighbors === 3) {
                        newBoard[y][x] = true;
                    } else {
                        newBoard[y][x] = false;
                    }
                } else {
                    if (!this.board[y][x] && neighbors === 3) {
                        newBoard[y][x] = true;
                    }
                }
            }
        }

        this.board = newBoard;
        this.setState({ cells: this.makeCells() });

        this.timeoutHandler = window.setTimeout(() => {
            this.runIteration();
        }, this.state.interval);
    }

    /**
     * Calculate the number of neighbors at point (x, y)
     * @param {Array} board 
     * @param {int} x 
     * @param {int} y 
     */
    calculateNeighbors(board, x, y) {
        let neighbors = 0;
        const dirs = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];
        for (let i = 0; i < dirs.length; i++) {
            const dir = dirs[i];
            let y1 = y + dir[0];
            let x1 = x + dir[1];

            if (x1 >= 0 && x1 < this.cols && y1 >= 0 && y1 < this.rows && board[y1][x1]) {
                neighbors++;
            }
        }

        return neighbors;
    }

    // handles any changes made by the user to the speed of the game
    handleIntervalChange = (event) => {
        this.setState({ interval: event.target.value });
    }

    // clears the board
    handleClear = () => {
        currentgeneration = 0
        this.board = this.makeEmptyBoard();
        this.setState({ cells: this.makeCells() });
    }
    
    // randomizes the board
    handleRandom = () => {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                this.board[y][x] = (Math.random() >= 0.5);
            }
        }

        this.setState({ cells: this.makeCells() });
    }

    render() {
        const { cells, interval, isRunning } = this.state;
        return (
            <div>
                <div>Current Generation: {currentgeneration}</div>
                <div className="Board"
                    style={{ width: this.state.WIDTH, height: this.state.HEIGHT, backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`}}
                    onClick={this.handleClick}
                    ref={(n) => { this.boardRef = n; }}>

                    {cells.map(cell => (
                        <Cell x={cell.x} y={cell.y} key={`${cell.x},${cell.y}`}/>
                    ))}
                </div>

                <div className="controls">
                    {/* Change the grid Width <input value={this.state.WIDTH} onChange={this.handleWidthChange} />
                    and the grid Height <input value={this.state.HEIGHT} onChange={this.handleHeightChange} /> */}
                    Update every <input value={this.state.interval} onChange={this.handleIntervalChange} /> milliseceonds
                    {isRunning ?
                        <button className="button" onClick={this.stopGame}>Stop the Game</button> :
                        <button className="button" onClick={this.runGame}>Run the Game</button>
                    }
                    {isRunning ?
                    null :
                    <button className="button" onClick={this.runOneIteration}>Run a Single Generation</button>
                    }
                    <button className="button" onClick={this.handleRandom}>Random Board</button>
                    <button className="button" onClick={this.handleClear}>Clear the Board</button>
                </div>
                <div>
                    <h1>Rules</h1>
                    <p>Any live cell with two or three live neighbours survives.</p>
                    <p>Any dead cell with three live neighbours becomes a live cell.</p>
                    <p>All other live cells die in the next generation. Similarly, all other dead cells stay dead.</p>
                </div>
            </div>
        );
    }
}


export default Game;