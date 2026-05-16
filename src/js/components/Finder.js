"use strict";

import { settings } from "../settings.js";

class Finder {
  constructor(element) {
    const thisFinder = this;

    thisFinder.dom = {};
    thisFinder.dom.wrapper = element;
    thisFinder.selectedCells = [];

    thisFinder.renderGrid();
    thisFinder.initActions();
  }

  renderGrid() {
    const thisFinder = this;

    const grid = document.createElement("div");

    grid.classList.add("finder__grid");

    for (let row = 0; row < settings.grid.rows; row++) {
      for (let column = 0; column < settings.grid.columns; column++) {
        const cell = document.createElement("div");

        cell.classList.add("finder__cell");

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

    thisFinder.dom.grid.addEventListener("click", function (event) {
      const clickedElement = event.target;

      if (clickedElement.classList.contains("finder__cell")) {
        const row = parseInt(clickedElement.dataset.row);
        const column = parseInt(clickedElement.dataset.column);

        const isSelected = clickedElement.classList.contains(
          "finder__cell--selected",
        );

        if (isSelected) {
          thisFinder.selectedCells = thisFinder.selectedCells.filter(
            function (cell) {
              return !(cell.row === row && cell.column === column);
            },
          );

          clickedElement.classList.remove("finder__cell--selected");
        } else {
            const canSelect = thisFinder.isCellNextToSelected(row, column);

            if (!canSelect) {
              alert("You can select only adjacent cells!");

              return;
            }
          const cellData = {
            row: row,
            column: column,
            element: clickedElement,
          };

          thisFinder.selectedCells.push(cellData);

          clickedElement.classList.add("finder__cell--selected");
        }

        console.log(thisFinder.selectedCells);
      }
    });
  }
  isCellNextToSelected(row, column) {
    const thisFinder = this;

    if (thisFinder.selectedCells.length === 0) {
      return true;
    }

    return thisFinder.selectedCells.some(function (cell) {
      const rowDifference = Math.abs(cell.row - row);
      const columnDifference = Math.abs(cell.column - column);

      return (
        (rowDifference === 1 && columnDifference === 0) ||
        (rowDifference === 0 && columnDifference === 1)
      );
    });
  }
}

export default Finder;
