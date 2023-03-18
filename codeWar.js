
/*The line Challenge 3kyu*/

const grid = [ 
    [ ' ', ' ', ' ', '+', '-', '-', '-', '-', '-', '+', ' ', ' ' ],
    [ ' ', ' ', ' ', '|', '+', '-', '-', '-', '+', '|', ' ', ' ' ],
    [ ' ', ' ', ' ', '|', '|', '+', '-', '+', '|', '|', ' ', ' ' ],
    [ ' ', ' ', ' ', '|', '|', '|', 'X', '+', '|', '|', ' ', ' ' ],
    [ ' ', ' ', ' ', 'X', '|', '+', '-', '-', '+', '|', ' ', ' ' ],
    [ ' ', ' ', ' ', ' ', '+', '-', '-', '-', '-', '+', ' ', ' ' ] 
];

//Check where is the next charachter in rapport of current position
const isNorth = (grid, pos) => pos.row !== 0 && !isHyphen(grid, pos) && /X|\||\+/.test(grid[pos.row - 1][pos.col]);
const isEast = (grid, pos) => pos.col !== grid[0].length - 1 && !isLadder(grid, pos) && /X|\+|\-/.test(grid[pos.row][pos.col + 1]);
const isSouth = (grid, pos) => pos.row !== grid.length - 1 && !isHyphen(grid, pos) && /X|\||\+/.test(grid[pos.row + 1][pos.col]);
const isWest = (grid, pos) => pos.col !== 0 && !isLadder(grid, pos) && /X|\+|\-/.test(grid[pos.row][pos.col - 1]);

//Check if is specific charachter for validation rules (e.g: no charchters north of a hyphen)
const isPlus = (grid, pos) => /\+/.test(grid[pos.row][pos.col]);
const isHyphen = (grid, pos) => /\-/.test(grid[pos.row][pos.col]);
const isLadder = (grid, pos) => /\|/.test(grid[pos.row][pos.col]);

//Check if next charachter is not already in the line
const isNewPosition = (positions, newPos) => positions.every(oldPos => oldPos !== newPos);

//If charachter is '+' check if there is a legitimate turn (e.g: -+- is heresy)
const isWrongTurn = (grid, pos, newPos, oldPos, direction) => {
    if (!isPlus(grid, pos)) return false;

    if (direction === 'north') return oldPos.row === pos.row + 1;
    if (direction === 'east') return oldPos.col === pos.col - 1;
    if (direction === 'south') return oldPos.row === pos.row - 1;
    if (direction === 'west') return oldPos.col === pos.col + 1;
}

const isThisTheEnd = (end, pos) => end === pos; //Check we reached the end the line

//Check if all charachters present in the grid are used
const isAllCharUsed = (grid, parcours) => {
    return [...grid]
    .map( (row, i) => getAllPositions(row, i) )
    .reduce( (acc, arr) => acc.concat(arr), [] )
    .every( pos => parcours.includes(pos) );
}

//Get all the stringify coordinates of the charachters in the grid
const getAllPositions = (row, i) => row.map( (char, j) => char !== ' ' ? `${i}.${j}` : null ).filter( pos => pos );

//Get the coordinates of the 2 X in the grid
const getStartPositions = (row, i) => row.map( (char, j) => char === 'X' ? `${i}.${j}` : null).filter( start => start );

//Transform string position into object
const parsePos = str => { 
    if (!str) return false;
    const [ row, col] = str.split('.').map(num => Number(num));
    return { row, col };
}

//Transform position object into string
const stringifyPos = pos => `${pos.row}.${pos.col}`;

//Get next potential positions based on current position
const getNextPos = pos => (  
    {
        north: { row: pos.row - 1, col: pos.col },
        east: { row: pos.row, col: pos.col + 1 },
        south: { row: pos.row + 1, col: pos.col },
        west: { row: pos.row, col: pos.col - 1 },
    }
);

//Get next position based on current position
const findPath = (grid, parcours) => {
    const pos = parsePos(parcours[parcours.length - 1]);
    const oldPos = parsePos(parcours[parcours.length - 2]);
    const compas = getNextPos(pos);
    let nextStep = [];

    if ( isNorth(grid, pos) && 
            isNewPosition(parcours, stringifyPos(compas.north)) && 
                !isWrongTurn(grid, pos, compas.north, oldPos, 'north') ) 

        nextStep.push(stringifyPos(compas.north));

    if ( isEast(grid, pos) && 
            isNewPosition(parcours, stringifyPos(compas.east)) && 
                !isWrongTurn(grid, pos, compas.east, oldPos, 'east') ) 

        nextStep.push(stringifyPos(compas.east));

    if ( isSouth(grid, pos) && 
            isNewPosition(parcours, stringifyPos(compas.south)) && 
                !isWrongTurn(grid, pos, compas.south, oldPos, 'south') ) 

        nextStep.push(stringifyPos(compas.south));

    if ( isWest(grid, pos) && 
            isNewPosition(parcours, stringifyPos(compas.west)) && 
                !isWrongTurn(grid, pos, compas.west, oldPos, 'west') ) 

        nextStep.push(stringifyPos(compas.west));
    
    return nextStep.length !== 1 ? false : nextStep[0]; //If 0 or more than 1 valid positions exist than entire line is invalid
}

//Recursive function that adds next position to the line until X is reached or aborts when line is deemed invalid
const isParcourValide = (grid, end, parcours) => {
    if (!parcours[parcours.length - 1]) return false; //Exits the loop if line invalid
    if (isThisTheEnd(end, parcours[parcours.length - 1])) return isAllCharUsed(grid, parcours); //If end is reached verifies all charachters is the grid are used

    const curr = findPath(grid, parcours); //Get next position
    return isParcourValide(grid, end, [...parcours, curr]); //Adds new position to the line
}

const line = grid => {
    const start = [...grid] //Get the positions of the 2 X
    .map( (row, i) => getStartPositions(row, i) )
    .reduce( (acc, arr) => acc.concat(arr), [] );

    return start.length !== 2 ? false : //if less or more than 2 X line is invalidated
        ( !isParcourValide(grid, start[1], [start[0]]) ? isParcourValide(grid, start[0], ([start[1]])) : true ); //If line is invalid do it again in reverse
}

//console.log(line(grid));