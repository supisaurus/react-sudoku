import React, { Component } from 'react';
import { knuthShuffle } from 'knuth-shuffle';
// import ReactDOM from 'react-dom';
import './App.css';

function validInRow(value, valueIndex, boxIndex, gameVar) {
  let rowStart = 0;
  switch(boxIndex) {
    case 3:
    case 4:
    case 5:
      rowStart = 3;
      break;
    case 6:
    case 7:
    case 8:
      rowStart = 6;
      break;
    default:
      rowStart = 0;
      break;
  };
  let relatedBoxes = gameVar.slice(rowStart, rowStart+3);
  let rowIndex = 0;
  if(valueIndex >= 6) {
    rowIndex = 2;
  }
  else if(valueIndex >= 3) {
    rowIndex = 1;
  }
  let rowValues = relatedBoxes.map(box => {
    if(box)
      return box[rowIndex];
    return [];
  }).flat();
  if(rowValues.indexOf(value) < 0)
    return true;
  return false;
}

function validInColumn(value, valueIndex, boxIndex, gameVar) {
  let columnStart = 0;
  switch(boxIndex) {
    case 1:
    case 4:
    case 7:
      columnStart = 1;
      break;
    case 2:
    case 5:
    case 8:
      columnStart = 2;
      break;
    default:
      columnStart = 0;
      break;
  };
  let relatedBoxes = [gameVar[columnStart], gameVar[columnStart+3], gameVar[columnStart+6]];
  let columnIndex = 0;
  switch(valueIndex) {
    case 1:
    case 4:
    case 7:
      columnIndex = 1;
      break;
    case 2:
    case 5:
    case 8:
      columnIndex = 2;
      break;
    default:
      columnIndex = 0;
      break;
  };
  let columnValues = relatedBoxes.map(box => {
    if(box)
      return [box[0][columnIndex], box[1][columnIndex], box[2][columnIndex]];
    return [];
  }).flat();
  if(columnValues.indexOf(value) < 0)
    return true;
  return false;
}

function validInBox(value, newBox) {
  if(newBox.indexOf(value) < 0)
    return true;
  return false;
}

function fillFull() {
  let shuffled = knuthShuffle([1,2,3,4,5,6,7,8,9]);
  return [shuffled.slice(0,3),shuffled.slice(3,6),shuffled.slice(6,9)]
}

function fillDependant(boxIndex, gameVar) {
  let newBox = [];
  for(var i = 0; i < 9; i++){
    for(var value = 1; value <= 9; value++){
      if(!validInBox(value, newBox))
        continue;
      if(validInRow(value, i, boxIndex, gameVar) && validInColumn(value, i, boxIndex, gameVar)){
        newBox[i] = value;
        break;
      }
    }
  }
  return newBox;
}

function fillRemaining(gameVar) {
  let game = Array.from(gameVar);
  for(var i = 0; i < 9; i++) {
    if(!game[i]){
      let newBox = fillDependant(i, game);
      game[i] = [newBox.slice(0,3), newBox.slice(3,6), newBox.slice(6,9)];
    }
  }
  return game;
}

function createSolution() {
  let game = [];
  game[0] = fillFull();
  game[4] = fillFull();
  game[8] = fillFull();
  game = fillRemaining(game);
  return game;
}

function createGame(solution, difficulty) {
  let game = JSON.parse(JSON.stringify(solution));
  let indexes = [];
  let counter = JSON.parse(JSON.stringify(difficulty));
  while ( counter > 0) {
    let randomBox = Math.round(0 + Math.random() * (8 - 0));
    let randomRow = Math.round(0 + Math.random() * (2 - 0));
    let randomColumn = Math.round(0 + Math.random() * (2 - 0));
    let randomIndex = [randomBox, randomRow, randomColumn];
    if (indexes.indexOf(randomIndex) === -1) {
      indexes.push(randomIndex);
      counter--;
    }
  }
  for(var i = 0; i < indexes.length; i++){
    let randomIndex = indexes[i];
    game[randomIndex[0]][randomIndex[1]][randomIndex[2]] = null;
  }
  return game;
}

function newGame(difficulty) {
  let solution = createSolution();
  while(solution.flat().flat().length < 81 ){ // :,)
    solution = createSolution();
  }
  // console.log(solution.flat().flat().every( x => typeof x === 'number' ));
  let game = createGame(solution, difficulty);
  return [game, solution];
}

function Cell(props) {
  return (
    <button className="cell" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

function StaticCell(props) {
  return (
    <button className="cell static">
      {props.value}
    </button>
  );
}

function NumberButton(props) {
  return (
    <button className="number-button" onClick={props.onClick}>
      {props.value}
    </button>
  )
}

class Modal extends React.Component { //note to self: refs?
    onClick(e, value) {
      //this.props.modalData.target.value = value;
      this.close(e, value, this.props.modalData.boxIndex, this.props.modalData.row, this.props.modalData.column);
    }

    renderNumberButton(value) {
      return (
        <NumberButton
          value={value}
          onClick={(e) => this.onClick(e, value)}
        />
      );
    }

    render() {
      if (this.props.isOpen === false)
        return null
      return (
        <div className="number-button-row">
          {this.renderNumberButton(1)}
          {this.renderNumberButton(2)}
          {this.renderNumberButton(3)}
          {this.renderNumberButton(4)}
          {this.renderNumberButton(5)}
          {this.renderNumberButton(6)}
          {this.renderNumberButton(7)}
          {this.renderNumberButton(8)}
          {this.renderNumberButton(9)}
        </div>
      )
    }

    close(e, value, boxIndex, row, column) {
      e.preventDefault()
      if (this.props.onClose) {
        this.props.onClose(e, value, boxIndex, row, column)
      }
    }
  }

class App extends Component {
  constructor(props) {
    super(props);
    let difficulty = 20; //TODO
    let newG = newGame(difficulty);
    let solution = newG[1];
    let game = newG[0];
    this.state = {
      solution: solution,
      cells: game,
      original: JSON.parse(JSON.stringify(game)),
      showModal: false,
      modalData: {},
    };
  }

  startNew() {
    let difficulty = 20; //TODO
    let newG = newGame(difficulty);
    let solution = newG[1];
    let game = newG[0];
    this.setState({
      solution: solution,
      cells: game,
      original: JSON.parse(JSON.stringify(game)),
      showModal: false,
      modalData: {},
    });
  }

  solve() {
    this.setState({
      cells: Array.from(this.state.solution),
    });
  }

  onClick(e, boxIndex, row, column) {
    let data = {
      pageX: e.pageX,
      pageY: e.pageY,
      boxIndex: boxIndex,
      row: row,
      column: column,
      target: e.target,
    }
    this.showModal(data);
  }

  showModal(data) {
    this.setState({ showModal: true, modalData: data });
  };

  hideModal(e, value, boxIndex, row, column) {
    let updatedCells = this.state.cells;
    updatedCells[boxIndex][row][column] = value;
    this.setState({
      showModal: false,
      cells: JSON.parse(JSON.stringify(updatedCells)),
     });
  };

  renderCell(boxIndex, row, column) {
    if(!this.state.original[boxIndex][row][column]){
      return (
        <Cell
          value={this.state.cells[boxIndex][row][column]}
          onClick={(e) => this.onClick(e, boxIndex, row, column)}
        />
      );
    };
    return (
      <StaticCell
        value={this.state.cells[boxIndex][row][column]}
      />
    );
  }

  renderBox(i) {
    return (
      <div className="box">
        <div className="cell-row">
          {this.renderCell(i,0,0)}
          {this.renderCell(i,0,1)}
          {this.renderCell(i,0,2)}
        </div>
        <div className="cell-row">
          {this.renderCell(i,1,0)}
          {this.renderCell(i,1,1)}
          {this.renderCell(i,1,2)}
        </div>
        <div className="cell-row">
          {this.renderCell(i,2,0)}
          {this.renderCell(i,2,1)}
          {this.renderCell(i,2,2)}
        </div>
      </div>
    );
  }

  render() {
    /*
    let loadingMessage;
    if (this.state.loading)
      loadingMessage = 'Generating...';
    else
      loadingMessage = '';
    */
    return (
      <div className="app">
      <div className="controls">
        <button className="control-button" onClick={() => this.startNew()}>New</button><br/>
        <button className="control-button" onClick={() => this.solve()}>Solve</button>
      </div>
      <div className="sudoku">
        <div className="box-row">
          {this.renderBox(0)}
          {this.renderBox(3)}
          {this.renderBox(6)}
        </div>
        <div className="box-row">
          {this.renderBox(1)}
          {this.renderBox(4)}
          {this.renderBox(7)}
        </div>
        <div className="box-row">
          {this.renderBox(2)}
          {this.renderBox(5)}
          {this.renderBox(8)}
        </div>
      </div>
      <Modal isOpen={this.state.showModal} modalData={this.state.modalData} onClose={(e, value, boxIndex, row, column) => this.hideModal(e, value, boxIndex, row, column)}>
      </Modal>
      </div>
    );
  }
}

export default App;
