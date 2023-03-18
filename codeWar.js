const grid = [ 
    [ ' ', ' ', ' ', '+', '-', '-', '-', '-', '-', '+', ' ', ' ' ],
    [ ' ', ' ', ' ', '|', '+', '-', '-', '-', '+', '|', ' ', ' ' ],
    [ ' ', ' ', ' ', '|', '|', '+', '-', '+', '|', '|', ' ', ' ' ],
    [ ' ', ' ', ' ', '|', '|', '|', 'X', '+', '|', '|', ' ', ' ' ],
    [ ' ', ' ', ' ', 'X', '|', '+', '-', '-', '+', '|', ' ', ' ' ],
    [ ' ', ' ', ' ', ' ', '+', '-', '-', '-', '-', '+', ' ', ' ' ] 
];

const isNorth = (grid, pos) => pos.row !== 0 && !isHyphen(grid, pos) && /X|\||\+/.test(grid[pos.row - 1][pos.col]);
const isEast = (grid, pos) => pos.col !== grid[0].length - 1 && !isLadder(grid, pos) && /X|\+|\-/.test(grid[pos.row][pos.col + 1]);
const isSouth = (grid, pos) => pos.row !== grid.length - 1 && !isHyphen(grid, pos) && /X|\||\+/.test(grid[pos.row + 1][pos.col]);
const isWest = (grid, pos) => pos.col !== 0 && !isLadder(grid, pos) && /X|\+|\-/.test(grid[pos.row][pos.col - 1]);

const isPlus = (grid, pos) => /\+/.test(grid[pos.row][pos.col]);
const isHyphen = (grid, pos) => /\-/.test(grid[pos.row][pos.col]);
const isLadder = (grid, pos) => /\|/.test(grid[pos.row][pos.col]);

const isEmptyRow = row => row.every( char => /^[\s]$/.test(char) );

const isThisTheEnd = (end, pos) => end === pos;

const isNewPosition = (positions, newPos) => positions.every(oldPos => oldPos !== newPos);

const isWrongTurn = (grid, pos, newPos, oldPos, direction) => {
    if (!isPlus(grid, pos)) return false;

    if (direction === 'north') return oldPos.row === pos.row + 1;
    if (direction === 'east') return oldPos.col === pos.col - 1;
    if (direction === 'south') return oldPos.row === pos.row - 1;
    if (direction === 'west') return oldPos.col === pos.col + 1;
}

const isAllCharUsed = (grid, parcours) => {
    return [...grid]
    .map( (row, i) => isEmptyRow(row) ? [] : getAllPositions(row, i) )
    .reduce( (acc, arr) => acc.concat(arr), [] )
    .filter( pos => pos )
    .every( pos => parcours.includes(pos) );
}

const getAllPositions = (row, i) => row.map( (char, j) => char !== ' ' ? `${i}.${j}` : null );

const getStartPosition = (row, i) => {
    if (!/X/.test([...row].join())) return [];

    return row.reduce( 
        (acc, char, j) => { 
            if (char === 'X') acc.push( `${i}.${j}` );
            return acc;
        }, [] 
    );
}

const parsePos = str => {
    if (!str) return false;
    const [ row, col] = str.split('.').map(num => Number(num));
    return { row, col }
}

const simplifyPos = pos => `${pos.row}.${pos.col}`;

const getNext = pos => (  
    {
        north: { row: pos.row - 1, col: pos.col },
        east: { row: pos.row, col: pos.col + 1 },
        south: { row: pos.row + 1, col: pos.col },
        west: { row: pos.row, col: pos.col - 1 },
    }
);


const findPath = (grid, parcours) => {
    const pos = parsePos(parcours[parcours.length - 1]);
    const oldPos = parsePos(parcours[parcours.length - 2]);
    const compas = getNext(pos);
    let nextStep = [];

    if (isNorth(grid, pos) && isNewPosition(parcours, simplifyPos(compas.north)) && !isWrongTurn(grid, pos, compas.north, oldPos, 'north')) 
        nextStep.push(simplifyPos(compas.north));
    if (isEast(grid, pos) && isNewPosition(parcours, simplifyPos(compas.east)) && !isWrongTurn(grid, pos, compas.east, oldPos, 'east')) 
        nextStep.push(simplifyPos(compas.east));
    if (isSouth(grid, pos) && isNewPosition(parcours, simplifyPos(compas.south)) && !isWrongTurn(grid, pos, compas.south, oldPos, 'south')) 
        nextStep.push(simplifyPos(compas.south));
    if (isWest(grid, pos) && isNewPosition(parcours, simplifyPos(compas.west)) && !isWrongTurn(grid, pos, compas.west, oldPos, 'west')) 
        nextStep.push(simplifyPos(compas.west));
    
    return nextStep.length !== 1 ? false : nextStep[0];
}

const isParcourValide = (grid, end, parcours) => {
    if (!parcours[parcours.length - 1]) return false;
    if (isThisTheEnd(end, parcours[parcours.length - 1])) return isAllCharUsed(grid, parcours);

    const curr = findPath(grid, parcours);
    return isParcourValide(grid, end, [...parcours, curr])
}

const line = grid => {
    const start = [...grid]
    .map( (row, i) => isEmptyRow(row) ? [] : getStartPosition(row, i) )
    .reduce( (acc, arr) => acc.concat(arr), [] )

    return start.length !== 2 ? false : 
        ( !isParcourValide(grid, start[1], [start[0]]) ? isParcourValide(grid, start[0], ([start[1]])) : true );
}

