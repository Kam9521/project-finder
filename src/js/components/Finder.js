"use strict";

import { settings } from "../settings.js";

class Finder {
  constructor(element) {
    const thisFinder = this;

    thisFinder.dom = {};
    thisFinder.dom.wrapper = element;

    // Stores all cells selected while drawing possible routes.
    thisFinder.selectedCells = [];

    // Stores the current application stage.
    thisFinder.stage = "drawing";

    // Stores the selected start and end points.
    thisFinder.startCell = null;
    thisFinder.endCell = null;

    thisFinder.renderGrid();
    thisFinder.initActions();
  }

  renderGrid() {
    const thisFinder = this;

    const grid = document.createElement("div");

    grid.classList.add("finder__grid");

    // Creates a grid based on rows and columns from settings.
    for (let row = 0; row < settings.grid.rows; row++) {
      for (let column = 0; column < settings.grid.columns; column++) {
        const cell = document.createElement("div");

        cell.classList.add("finder__cell");

        // Stores cell position directly in the DOM element.
        cell.dataset.row = row;
        cell.dataset.column = column;

        grid.appendChild(cell);
      }
    }

    thisFinder.dom.wrapper.appendChild(grid);
  }

  initActions() {
    const thisFinder = this;

    thisFinder.dom.grid = thisFinder.dom.wrapper.querySelector(".finder__grid");
    thisFinder.dom.message =
      thisFinder.dom.wrapper.querySelector(".finder__message");
    thisFinder.dom.button =
      thisFinder.dom.wrapper.querySelector(".finder__button");

    // Handles selecting route cells and choosing start/end points.
    thisFinder.dom.grid.addEventListener("click", function (event) {
      const clickedElement = event.target;

      if (!clickedElement.classList.contains("finder__cell")) {
        return;
      }

      const row = parseInt(clickedElement.dataset.row);
      const column = parseInt(clickedElement.dataset.column);

      const isSelected = clickedElement.classList.contains(
        "finder__cell--selected",
      );

      if (thisFinder.stage === "drawing") {
        if (isSelected) {
          thisFinder.removeSelectedCell(row, column, clickedElement);
        } else {
          thisFinder.addSelectedCell(row, column, clickedElement);
        }

        console.log(thisFinder.selectedCells);
        return;
      }

      if (thisFinder.stage === "start" && isSelected) {
        thisFinder.startCell = thisFinder.getCell(row, column);

        clickedElement.classList.add("finder__cell--start");

        thisFinder.stage = "end";
        thisFinder.dom.message.innerText = "Choose end point";
        thisFinder.dom.button.innerText = "Select destination";

        console.log(thisFinder.startCell);
        return;
      }

      if (thisFinder.stage === "end" && isSelected) {
        thisFinder.endCell = thisFinder.getCell(row, column);

        clickedElement.classList.add("finder__cell--end");

        thisFinder.stage = "result";
        thisFinder.dom.message.innerText =
          "Click compute to find the shortest path";
        thisFinder.dom.button.innerText = "Compute shortest path";

        console.log(thisFinder.endCell);
      }
    });

    // Handles changing application stages.
    thisFinder.dom.button.addEventListener("click", function () {
      if (thisFinder.stage === "drawing") {
        if (thisFinder.selectedCells.length < 2) {
          alert("Draw at least two route cells first.");

          return;
        }
        thisFinder.stage = "start";

        thisFinder.dom.message.innerText = "Choose start point";
        thisFinder.dom.button.innerText = "Compute";

        return;
      }

      if (thisFinder.stage === "result") {
        thisFinder.computePath();

        return;
      }

      if (thisFinder.stage === "finished") {
        thisFinder.resetFinder();
      }
    });
  }

  addSelectedCell(row, column, element) {
    const thisFinder = this;

    const canSelect = thisFinder.isCellNextToSelected(row, column);

    if (!canSelect) {
      alert("You can select only adjacent cells!");

      return;
    }

    const cellData = {
      row: row,
      column: column,
      element: element,
    };

    thisFinder.selectedCells.push(cellData);

    element.classList.add("finder__cell--selected");
  }

  removeSelectedCell(row, column, element) {
    const thisFinder = this;

    thisFinder.selectedCells = thisFinder.selectedCells.filter(function (cell) {
      return !(cell.row === row && cell.column === column);
    });

    element.classList.remove("finder__cell--selected");
  }

  isCellNextToSelected(row, column) {
    const thisFinder = this;

    // First selected cell can be placed anywhere.
    if (thisFinder.selectedCells.length === 0) {
      return true;
    }

    // Every next selected cell must touch an already selected cell by edge.
    return thisFinder.selectedCells.some(function (cell) {
      const rowDifference = Math.abs(cell.row - row);
      const columnDifference = Math.abs(cell.column - column);

      return (
        (rowDifference === 1 && columnDifference === 0) ||
        (rowDifference === 0 && columnDifference === 1)
      );
    });
  }
  computePath() {
    const thisFinder = this;

    const queue = [];
    const visited = [];
    const parents = new Map();

    queue.push(thisFinder.startCell);

    while (queue.length > 0) {
      const currentCell = queue.shift();

      console.log("CURRENT:", currentCell);
      if (
        currentCell.row === thisFinder.endCell.row &&
        currentCell.column === thisFinder.endCell.column
      ) {
        console.log("PATH FOUND!");

        const shortestPath = thisFinder.buildPath(parents);

        console.log(shortestPath);
        thisFinder.dom.message.innerText = "Shortest path found";
        thisFinder.dom.button.innerText = "Start again";
        thisFinder.stage = "finished";

        break;
      }

      visited.push(currentCell);

      const neighbors = thisFinder.getNeighbors(currentCell);
      for (let neighbor of neighbors) {
        const alreadyVisited = visited.includes(neighbor);
        const alreadyInQueue = queue.includes(neighbor);

        if (!alreadyVisited && !alreadyInQueue) {
          parents.set(neighbor, currentCell);
          queue.push(neighbor);
        }
      }

      console.log("NEIGHBORS:", neighbors);
    }
  }
  buildPath(parents) {
    const thisFinder = this;

    const path = [];
    let currentCell = thisFinder.endCell;

    while (currentCell) {
      path.unshift(currentCell);

      currentCell = parents.get(currentCell);
    }

    console.log("SHORTEST PATH:", path);

    for (let cell of path) {
      console.log(cell);

      cell.element.classList.add("finder__cell--path");
    }

    return path;
  }
  resetFinder() {
    const thisFinder = this;

    thisFinder.selectedCells = [];

    thisFinder.startCell = null;
    thisFinder.endCell = null;

    thisFinder.stage = "drawing";

    const allCells = thisFinder.dom.grid.querySelectorAll(".finder__cell");

    for (let cell of allCells) {
      cell.classList.remove(
        "finder__cell--selected",
        "finder__cell--start",
        "finder__cell--end",
        "finder__cell--path",
      );
    }

    thisFinder.dom.message.innerText = "Draw routes";
    thisFinder.dom.button.innerText = "Finish drawing";
  }
  getCell(row, column) {
    const thisFinder = this;

    return thisFinder.selectedCells.find(function (cell) {
      return cell.row === row && cell.column === column;
    });
  }
  getNeighbors(cell) {
    const thisFinder = this;

    const possibleNeighbors = [
      { row: cell.row - 1, column: cell.column },
      { row: cell.row + 1, column: cell.column },
      { row: cell.row, column: cell.column - 1 },
      { row: cell.row, column: cell.column + 1 },
    ];

    return possibleNeighbors
      .map(function (neighbor) {
        return thisFinder.getCell(neighbor.row, neighbor.column);
      })
      .filter(function (neighbor) {
        return neighbor !== undefined;
      });
  }
}

export default Finder;
