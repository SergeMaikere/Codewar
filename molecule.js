
/*Molecule challenge 2kyu*/

class Exception extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = this.constructor.name;
    }
}

class Helper {

    static pipe = (...fns) => args => fns.reduce((f, g) => g(f), args);

    static getChain = (br, arr) => arr[br - 1];
    static getLastChain = arr => arr[arr.length - 1];

    static getAtom = (a, br, arr) => Helper.getChain(br, arr).getAtom(a);
    static getLastAtom = (br, arr) => Helper.getChain(br, arr).getLastAtom();
}

class Molecule {
    constructor (name = "") {
        this.name = name;
        this.branches = [];
        this.chains = [];
        this.atoms = {};
        this.locked = false;
    }

    get name () { return this._name };
    set name (newValue) { this._name = newValue };
    get branches () { return this._branches };
    set branches (newValue) { this._branches = newValue };
    get atoms () { return this._atoms };
    set atoms (newValue) { this._atoms = newValue };

    #addNewBranche = length => {
        this.branches.push( new Branche([...Array(length)].map( el => 'C'), {...this.atoms}) );
        this.atoms = Helper.getLastChain(this.branches).currAtoms;
    }

    #addNewChain = arrOfElt => this.chains.push( new Chain(arrOfElt, {...this.atoms}) );

    #replaceAtomInAtoms = (c, elt, id) => {
        this.atoms.C = this.atoms.C.filter(carbonID => carbonID !== id);
        this.addAtomToAtoms(elt, id, this.atoms);
    }

    #updateAtoms = ch => this.atoms = ch.currAtoms;

    #checkMoleculeIsLocked = () => {
        if(this.locked) throw new Exception('LockedMolecule');
    }

    #hydrate = arrOfChains => {
        arrOfChains.forEach(
            ch => {
                ch.addHydrogens(this.atoms);
                this.#updateAtoms(ch);
            }
        )
    }

    addAtomToAtoms = (elt, id, index) => index[elt] ? index[elt].push(id) : index[elt] = [ id ];

    link = (atom1, atom2) => {
        atom1.linkTo(atom2);
        atom2.linkTo(atom1);
    }

    brancher = (...n) => {
        this.#checkMoleculeIsLocked();

        n.forEach( br => this.#addNewBranche(br));
        return this;
    }

    bounder = (...arrays) => {
        this.#checkMoleculeIsLocked();

        arrays.forEach(
            array => {
                const [a1, br1, a2, br2] = array;
                this.link(Helper.getAtom(a1, br1, this.branches), Helper.getAtom(a2, br2, this.branches))
            }
        );
        return this;
    }

    mutate = (...arrays) => {
        this.#checkMoleculeIsLocked();

        arrays.forEach(
            array => {
                const [ c, br, elt ] = array;
                Helper.getChain(br, this.branches).mutate(c, elt);
                this.#replaceAtomInAtoms(c, elt, Helper.getAtom(c, br, this.branches).id)
            }
        )
        return this;
    }

    add = (...arrays) => {
        this.#checkMoleculeIsLocked();

        arrays.forEach(
            array => {
                const [ c, br, elt ] = array;
                Helper.getChain(br, this.branches).add(c, br, elt, this.atoms)
                this.addAtomToAtoms(elt, Helper.getAtom(c, br, this.branches).id, this.atoms);
            }
        )
        return this;
    }

    addChaining = (...args) => {
        this.#checkMoleculeIsLocked();

        const [ c, br ] = args.splice(0, 2);
        this.#addNewChain( args );
        this.link(Helper.getAtom(c, br, this.branches), Helper.getLastChain(this.chains).atoms[0]);
        this.#updateAtoms( Helper.getLastChain(this.chains) )
        return this;
    }

    closer = () => {
        this.#checkMoleculeIsLocked();

        this.#hydrate(this.branches);
        this.#hydrate(this.chains);
        this.locked = true;
    }
}


class Chain extends Molecule {

    #arrOfElt;

    constructor(_arrOfElt, _currAtoms, name = "") {
        super(name);
        this.#arrOfElt = _arrOfElt;
        this.currAtoms = _currAtoms;
        this.atoms = this.setAtoms();
    }

    get currAtoms () { return this._currAtoms };
    set currAtoms (newValue) { this._currAtoms = newValue };
    get atoms () { return this._atoms };
    set atoms (newValue) { this._atoms = newValue };

    getAtom = a => this.atoms[a - 1];

    getLastAtom = () => this.atoms[this.atoms.length - 1];

    setArrayOfAtoms = arrOfElt => arrOfElt.map( elt => this.#setNewAtom(elt) );

    #setNewAtom = elt => {
        const newId = this.getNextIdOfElt(elt); 
        this.addAtomToAtoms(elt, newId, this.currAtoms);
        return new Atom(elt, newId);
    }

    getNextIdOfElt = elt => this.currAtoms?.[elt]?.[this.currAtoms?.[elt]?.length - 1] + 1 || 1 ;

    linkAtoms = arr => {
        [...Array(arr.length)].forEach( (a, i) => i < arr.length - 1 && this.link(arr[i], arr[i + 1]) );
        return arr;
    }

    setAtoms = () =>{ 
        return Helper.pipe(
            this.setArrayOfAtoms,
            this.linkAtoms
        )([...this.#arrOfElt]);
    }

    addHydrogens = molAtoms => {
        this.currAtoms = molAtoms;

        this.atoms.forEach( 
            a =>{ 
                [...Array(a.getFreeSpots())]
                .map( spot => this.#setNewAtom('H') )
                .map( h => { this.link(a, h); return h; } )
                .forEach( a => this.atoms.push(a) )
            }
        )
    }

        
    toString = () => `Branche of length ${this.#arrOfElt.length}, elements : ${this.atoms.map(a => `${a.element}.${a.id}`).join(',')}`;
}




class Branche extends Chain {
    constructor (arrOfElt, currAtoms) {
        super(arrOfElt, currAtoms);
    }

    mutate = (c, elt) => {
        this.atoms[c - 1] = new Atom(elt, this.atoms[c - 1].id);
        this.linkAtoms([this.atoms[c - 2], this.atoms[c - 1], this.atoms[ c ]]);
    }

    add = (c, br, elt) => {
        this.link(this.atoms[c - 1], new Atom(elt, this.getNextIdOfElt(elt)));
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

    get element () { return this._element }
    set element (newValue) { this._element = newValue }
    get id () { return this._id }
    set id (newValue) { this._id = newValue }
    get valence () { return this._valence }
    set valence (newValue) { this._valence = newValue }
    get weight () { return this._weight }
    set weight (newValue) { this._weight = newValue }
    get linkedTo () { return this._linkedTo }
    set linkedTo (newValue) { this._linkedTo = newValue }

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
        if (!this.#isLinkLegit(atom) || this.#isSameAtom(atom)) throw new Exception('InvalidBond');
        this.linkedTo[atom.element] ? this.linkedTo[atom.element].push(atom.id) : this.linkedTo[atom.element] = [atom.id];
    }

    getFreeSpots = () => this.valence - Object.keys(this.linkedTo).length;

    #isLinkLegit = atom => Object.keys(this.linkedTo).length + 1 <= this.valence;

    #isSameAtom = atom => atom.id === this.id && atom.element === this.element;

    #getHighestIdOfElt = elt => [...this.linkedTo[elt]].sort((a,b) => a>b).pop();

    #formatLinkedToElt = arrOfElt => arrOfElt.map( elt => `${elt}${this.#getHighestIdOfElt(elt)}` );

    #moveHToLastPos = arrOfElt => {
        const indexOfH = Object.keys(this.linkedTo).indexOf('H');
        if ( indexOfH !== -1 ) myAtoms.push( myAtoms.splice(indexOfH, 1)[0] );
    } 

    #formatLinkedTo = () => {
        // const myElements = Object.keys(this.linkedTo);
        // let myAtoms = myElements.map( elt => `${elt}${this.#getHighestIdOfElt(elt)}` );

        // const indexOfH = myElements.indexOf('H');
        // if ( indexOfH ) myAtoms.push( myAtoms.splice(indexOfH, 1)[0] );
        return Helper.pipe( this.formatLinkedToElt, moveHToLastPos )(Object.keys(this.linkedTo)).join(',')
        //return myAtoms.join(',');
    }

    #isElement = elt => {
        if (Atom.VALID_ATOMS[elt]) return elt;  
        throw new Exception('Unrecognized element');
    }

    toString = () => `Atom(${this.element}.${this.id}${Object.keys(this.linkedTo).length > 0 ? ': ' + this.#formatLinkedTo() : ''})`;
}


const m = new Molecule('sergium');
console.log(m.name)
m.brancher(10);
//m.bounder([2,1,7,1]);
//m.mutate([6, 1, 'O'])
//m.add([5, 1, 'O'])
//m.addChaining(2, 1, "N", "P", "C", "Mg", "Br")
m.closer();
console.log(m.atoms)
console.log(m.branches[0].toString())
// console.log(m.branches[1].toString())
// console.log(m.branches[2].toString())
// console.log(m.chains[0].toString())
//console.log(m.chains[0].atoms)


