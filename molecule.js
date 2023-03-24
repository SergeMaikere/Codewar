
/*Molecule challenge 2kyu*/

class Exception extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = this.constructor.name;
    }
}

class Helper {
    static link = (atom1, atom2) => {
        atom1.linkTo(atom2);
        atom2.linkTo(atom1);
    }

    static pipe = (...fns) => args => fns.reduce((f, g) => g(f), args);
}

class Molecule {
    constructor (name = "") {
        this.name = name;
        this.branches = [];
        this.atoms = {'C': []};
    }

    get name () { return this._name };
    set name (newValue) { this._name = newValue };
    get branches () { return this._branches };
    set branches (newValue) { this._branches = newValue };
    get atoms () { return this._atoms };
    set atoms (newValue) { this._atoms = newValue };

    #addNewBrancheIds = () => this.atoms.C.concat(this.branches[this.branches.length - 1][0].getAllIds());

    #linkNewBranchAtoms = () => this.branches[this.branches.length -1][0]

    #addNewBranche = length => {
        const atoms = this.atoms.C;
        this.branches.push([new Branche(length, this.atoms.C[this.atoms.C.length -1])]);
        this.atoms.C = this.#addNewBrancheIds();

    }

    #addAtomToAtoms = (elt, id) =>  {
        if (this.atoms[elt]) this.atoms[elt].push(id);
        if (!this.atoms[elt]) this.atoms[elt] = [ id ];
    }

    #replaceAtomInAtoms = (c, br, elt, id) => {
        this.atoms['C'] = this.atoms['C'].filter(carbonID => carbonID !== id);
        this.#addAtomToAtoms(elt, id);
    }

    brancher = (...n) => {
        n.forEach( br => this.#addNewBranche(br));
        return this;
    }

    bounder = (...arrays) => {
        arrays.forEach(
            array => {
                const [a1, br1, a2, br2] = array;
                Helper.link(this.branches[br1 - 1][0].carbons[a1 - 1], this.branches[br2 - 1][0].carbons[a2 - 1])
            }
        );
        return this;
    }

    mutate = (...arrays) => {
        arrays.forEach(
            array => {
                const [ c, br, elt ] = array;
                this.branches[br - 1][0].carbons[c - 1] = new Atom(elt, this.branches[br - 1][0].carbons[c - 1].id);
                this.#replaceAtomInAtoms(c, br, elt, this.branches[br - 1][0].carbons[c - 1].id)
            }
        )
        return this;
    }

    add = (...arrays) => {
        arrays.forEach(
            array => {
                const [ c, br, elt ] = array;
                const id = 
                Helper.link(this.branches[br - 1][0].carbons[c - 1], new Atom(elt, this.atoms?.[elt]?.length + 1 || 1));
                this.#addAtomToAtoms(elt, this.atoms?.[elt]?.length + 1 || 1);
            }
        )
        return this;
    }

    addChaining = (...args) => {
        
    }
}

class Branche {
    constructor (length, _lastId = 0) {
        this.length = length;
        this.lastId = _lastId;
        this.carbons = this.#setCarbons();
    }

    get length () { return this._length };
    set length (newValue) { this._length = newValue };
    get lastId () { return this._lastId };
    set lastId (newValue) { this._lastId = newValue };
    get carbons () { return this._carbons };
    set carbons (newValue) { this._carbons = newValue };

    #setCarbons = () => Helper.pipe(
        this.#setArrayOfCarbons,
        this.#linkCarbons
    )([...Array(this.length)]);

    #setArrayOfCarbons = arr => arr
    .map( (a, i) => this.lastId + i + 1 )
    .map( id => new Atom('C', id) );
    
    #linkCarbons = arr => {
        [...Array(this.length)].forEach( (a, i) => i < this.length - 1 && Helper.link(arr[i], arr[i + 1]) );
        return arr;
    }

    getAllIds = () => this.carbons.map(c => c.id);

    toString = () => `Branche of length ${this.length}, carbons : ${this.carbons.map(c => `${c.element}.${c.id}`).join(',')}`;
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
        this.linkedTo[atom.element] ? this.linkedTo[atom.element].push(atom.id) : this.linkedTo[atom.element] = [atom.id];
        
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


const m = new Molecule('sergium');
// console.log(m.name)
m.brancher(5, 7, 12);
m.bounder([2,1,3,2], [1,2,2,3]);
m.mutate([2, 2, 'O'])
m.add([5, 2, 'O'])
console.log(m.branches)
console.log(m.atoms)
console.log(m.branches[0].toString())
console.log(m.branches[1].toString())
console.log(m.branches[2].toString())


