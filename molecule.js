
/*Molecule challenge 2kyu*/

class Exception extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = this.constructor.name;
    }
}

class Atom {
    constructor(elt, _id) {
        this.element = this.#isElement(elt);
        this.id = _id;
        this.valence = Atom.VALID_ATOMS[this.element].valence;
        this.weight = Atom.VALID_ATOMS[this.element].weight;
        this.linkedTo = {};
    }

    static VALID_ATOMS = {
        'H': {valence: 1, weight: 1.0},    
        'B': {valence: 3, weight: 10.8},    
        'C': {valence: 4, weight: 12.0},     
        'N': {valence: 3, weight: 14.0},
        'O': {valence: 2, weight: 16.0},     
        'F': {valence: 1, weight: 19.0},     
        'Mg': {valence: 2, weight: 24.3},     
        'P': {valence: 3, weight: 31.0},     
        'S': {valence: 2, weight: 32.1},     
        'Cl': {valence: 1, weight: 35.5},     
        'Br': {valence: 1, weight: 80.0}
    }


    linkTo = atom => {
        if (!this.isLinkLegit(atom)) throw new Exception('Linkage is against the laws of physics');
        if (this.linkedTo[atom.element]) {
            this.linkedTo[atom.element].push(atom.id)
        }
        else {
            this.linkedTo[atom.element] = [atom.id]
        }
    }

    isLinkLegit = atom => Object.keys(this.linkedTo).length + 1 < this.valence;

    #getHighestIdOfElt = elt => [...this.linkedTo[elt]].sort((a,b) => a>b).pop();

    #formatLinkedTo = () => {
        const myElements = Object.keys(this.linkedTo);
        let myAtoms = myElements.map( elt => `${elt}${this.#getHighestIdOfElt(elt)}` );

        const indexOfH = myElements.indexOf('H');
        if ( indexOfH ) myAtoms.push( myAtoms.splice(indexOfH, 1)[0] );

        return myAtoms.join(',');
    }

    #isElement = elt => {
        if (Atom.VALID_ATOMS[elt]) return elt;  
        throw new Exception('Unrecognized element');
    }

    toString = () => `Atom(${this.element}.${this.id}${Object.keys(this.linkedTo).length > 0 ? ': ' + this.#formatLinkedTo() : ''})`;
}


class Branche {
    constructor (length, _lastId = 0) {
        this.length = length;
        this.lastId = _lastId;
        this.carbons = this.#setCarbons();
    }

    static pipe = (...fns) => args => fns.reduce((f, g) => g(f), args);

    #setCarbons = () => Branche.pipe(
        this.#setArrayOfCarbons,
        this.#arrayToObject,
        this.#linkCarbons
    )([...Array(this.length)]);

    #setArrayOfCarbons = arr => arr
    .map( (a, i) => this.lastId + i + 1 )
    .map( id => new Atom('C', id) );

    #arrayToObject = arr => arr.reduce( 
        (acc, atom, i) => {
            acc[i] = atom;
            return acc;
        }, {} 
    );
    
    #linkCarbons = myCarbons => Object.keys(myCarbons)
    .map( i => this.#linkWithNext(i, myCarbons) )
    .map( i => this.#objectToArray(i, myCarbons));

    #linkWithNext = (key, obj) => {
        if ( key < this.length - 1 ){            
            obj[key].linkTo(obj[`${Number(key) + 1}`]);
            obj[`${Number(key) + 1}`].linkTo(obj[key]);
        }
        return key;
    }

    #objectToArray = (key, obj) => obj[key];

    getAllIds = () => this.carbons.map(c => c.id);

    toString = () => `Branche of length ${this.length}, carbons : ${this.carbons.map(c => `C.${c.id}`).join(',')}`;
}

class Molecule {
    constructor (name = "") {
        this.name = name;
        this.branches = [[]];
        this.atoms = {'C': []};
    }

    #addNewBrancheIds = () => this.atoms.C.concat(this.branches[this.branches.length - 1][0].getAllIds());

    #linkNewBranchAtoms = () => this.branches[this.branches.length -1][0]

    #addNewBranche = length => {
        const atoms = this.atoms.C;
        this.branches.push([new Branche(length, this.atoms.C[this.atoms.C.length -1])]);
        this.atoms.C = this.#addNewBrancheIds();

    }

    brancher = (...n) => n.forEach( br => this.#addNewBranche(br));
}


const m = new Molecule('sergium');
// console.log(m.name)
m.brancher(5, 7, 12);
console.log(m.branches)
console.log(m.atoms)
console.log(m.branches[1].toString())
console.log(m.branches[2].toString())
console.log(m.branches[3].toString())


