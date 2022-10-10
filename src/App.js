import './App.css';
import React, { useEffect, useState } from 'react';
import _ from 'lodash';


class Square extends React.Component {
  render() {
    let square;
    if (this.props.isHead) {
      square = <div className='box snake-head'></div>
    } else if (this.props.isSnake) {
      square = <div className='box snake'></div>
    } else if (this.props.isApple) {
      square = <div className='box apple'></div>
    } else {
      square = <div className='box'></div>
    }
    return square
  }
}

function Button(props) {
  return (
    <button type='button' onClick={props.onClick}>Start</button>
  )
}

function generateBoard(boardSize) {
  var board = Array(board).fill(null);
  for (const i in [...Array(boardSize).keys()]) {
    board[i] = Array(boardSize).fill({content: null});
  }
  return board
}

function spawnApple(boardDim, snakePosition) {
  var notSpawned = true;
  let rowVal;
  let colVal
  while (notSpawned) {
    rowVal = Math.floor(Math.random() * boardDim);
    colVal = Math.floor(Math.random() * boardDim);
    notSpawned = false;
    for (const i in snakePosition) {
      const currentVal = [rowVal, colVal].toString()
      if (currentVal === snakePosition[i].toString()) {
        notSpawned = true
        console.log('failed to spawn apple')
        break
      }
    }
  }
  console.log('spawned apple')
  return [rowVal, colVal]
}

function spawnSnake() {
  return [[2, 5], [3, 5], [4, 5], [5, 5], [6, 5]]
}

class Board extends React.Component {
  constructor(props) {
    super(props);
    const dim = 15;
    const initialSnakePosition = spawnSnake();
    this.state = {
      dim: dim,
      count: 0,
      board: generateBoard(dim),
      snakePosition: initialSnakePosition,
      currentOrientation: 'down',
      nextOrientation: 'down',
      gameInProgress: false,
      applePosition: spawnApple(dim, initialSnakePosition),
      applesEaten: 0,
      resetGame: false,
    }
  }

  isCollision(snakePosition) {
    // check if the snake will collide with itself
    var positions = new Set();
    for (const i in snakePosition) {
      const part = snakePosition[i].toString();
      if (positions.has(part)) {
        return true
      } else {
        positions.add(part);
      }
    }
    return false
  }

  isOutOfBounds(snakePosition) {
    // check if the snake will leave the board
    for (const i in snakePosition) {
      const part = snakePosition[i];
      if ((0 > part[0]) || (0 > part[1]) || (this.state.dim - 1 < part[0]) || (this.state.dim - 1 < part[1])) {
        return true
      }
    }
    return false
  }

  addSnakeHead() {
    let newSnakePosition = _.cloneDeep(this.state.snakePosition);
    let prevHead = newSnakePosition.at(-1)
    
    if (this.state.currentOrientation == 'down') {
      newSnakePosition.push([prevHead[0] + 1, prevHead[1]]);
    } else if (this.state.currentOrientation == 'up') {
      newSnakePosition.push([prevHead[0] - 1, prevHead[1]]);
    } else if (this.state.currentOrientation == 'left') {
      newSnakePosition.push([prevHead[0], prevHead[1] - 1]);
    } else if (this.state.currentOrientation == 'right') {
      newSnakePosition.push([prevHead[0], prevHead[1] + 1]);
    } else {
      console.log('invalid currentOrientation:', this.state.currentOrientation)
    }
    return newSnakePosition
  }

  isEatingApple(newSnakePosition) {
    const snakeHead = newSnakePosition.at(-1)
    return (snakeHead[0] === this.state.applePosition[0]) && (snakeHead[1] === this.state.applePosition[1])
  }

  tick() {
    var newSnakePosition = this.addSnakeHead();
    if (this.isCollision(newSnakePosition) || this.isOutOfBounds(newSnakePosition)) {
      clearInterval(this.interval);
      this.setState({
        gameInProgress: false
      })
      return
    }

    let newApplePosition;
    var newApplesEaten = this.state.applesEaten;
    if (this.isEatingApple(newSnakePosition)) {
      newApplesEaten = newApplesEaten + 1;
      newApplePosition = spawnApple(this.state.dim, newSnakePosition)
    } else {
      newApplePosition = this.state.applePosition
      newSnakePosition = newSnakePosition.slice(1) // remove tail
    }

    this.setState({
      count: this.state.count + 1,
      snakePosition: newSnakePosition,
      currentOrientation: this.state.nextOrientation,
      applePosition: newApplePosition,
      applesEaten: newApplesEaten,
    })
  }

  downHandler({ key }) {
    let newOrientation;
    if (key === 'ArrowDown') {
      newOrientation = ['left', 'right'].includes(this.state.currentOrientation) ? 'down' : this.state.currentOrientation
    } else if (key === 'ArrowLeft') {
      newOrientation = ['up', 'down'].includes(this.state.currentOrientation) ? 'left' : this.state.currentOrientation
    } else if (key === 'ArrowUp') {
      newOrientation = ['left', 'right'].includes(this.state.currentOrientation) ? 'up' : this.state.currentOrientation
    } else if (key === 'ArrowRight') {
      newOrientation = ['up', 'down'].includes(this.state.currentOrientation) ? 'right' : this.state.currentOrientation
    } else {
      newOrientation = this.state.currentOrientation
    }
    this.setState({
      nextOrientation: newOrientation
    })
  }

  componentDidMount() {
    window.addEventListener('keydown', (e) => this.downHandler(e))
  }

  componentWillUnmount() {
    window.removeEventListener('downHandler', this.downHandler)
    // clearInterval(this.interval);
  }

  isSnake(rowNum, colNum) {
    for (const i in this.state.snakePosition) {
      const snake = this.state.snakePosition[i];
      if (snake[0] == rowNum && snake[1] == colNum) {
        return true
      }
    }
    return false
  }

  isHead(rowNum, colNum) {
    const head = this.state.snakePosition[this.state.snakePosition.length - 1];
    return head[0] == rowNum && head[1] == colNum ? true : false;
  }

  isApple(rowNum, colNum) {
    return (this.state.applePosition[0] === rowNum) && (this.state.applePosition[1] === colNum)
  }

  renderRow(rowNum) {
    const squares = [...Array(this.state.board.length).keys()].map(
      (colNum) => (
        <Square
          key={rowNum + '-' + colNum}
          isHead={this.isHead(rowNum, colNum)}
          isSnake={this.isSnake(rowNum, colNum)}
          isApple={this.isApple(rowNum, colNum)}
        />
      )
    )
    return (
      <div key={rowNum} className='board-row'>
        {squares}
      </div>
    )
  }

  startGame(rowNum) {
    let snakePosition = spawnSnake();
    clearInterval(this.interval);
    this.interval = setInterval(() => this.tick(), 200);
    this.setState({
      gameInProgress: true,
      resetGame: true,
      snakePosition: snakePosition,
      currentOrientation: 'down',
      nextOrientation: 'down',
      count: 0,
      applesEaten: 0,
      applePosition: spawnApple(this.state.dim, snakePosition),
    });
  }

  render() {
    const rows = [...Array(this.state.board.length).keys()].map((i) => {
      return (
        <div key={i} className='board-row'>
          {this.renderRow(i)}
        </div>
      )
    })

    return (
      <>
        <Button onClick={() => this.startGame()} />
        <h3>{this.state.gameInProgress ? 'Woot woot!' : 'Game Over.'}</h3>
        <h3>Apples: {this.state.applesEaten}</h3>
        <div className='board'>
          { rows }
        </div>
      </>
    )
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  render() {
    return (
      <>
        <div className="App">
          <h1>Snake Game</h1>
        </div>
        <Board />
      </>
    );
  }
}

export default App;
