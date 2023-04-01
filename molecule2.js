class Exception extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = this.constructor.name;
    }
}


class H {
    static pipe = (...fns) => arg => fns.reduce( (f, g) => g(f), arg )

    static linkAtoms = (a1, a2) => {
        if ( ![a1, a2].every(H.isAtom) ) return;
        a1.linkTo(a2)
        a2.linkTo(a1)
    }

    static isAtom = a => a.element !== 'Null' && a.id !== 0

    static isBranch = (branchs, id) => id <= branchs.length

    static isCorrectNumberOfArgs = (n, args) => args.length === n
}


class AtomsOfMolecule {
    constructor () {
        this.atoms = []
    }

    getLastIdOfElt = elt => [...this.atoms].filter( a => a.element === elt )?.pop()?.id || 0

    add = atom => this.atoms.push(atom)

    findPrevious = a => this.getAtom( a.element, a.id - 1 )

    getAtom = (elt, id) => this.atoms.find( a => a.element === elt && a.id === id ) || new NullAtom()

    removeAtom = (elt, id) => this.atoms.filter( a => a.elt !== elt && a.id !== id )
}

class Molecule {

    constructor (_name = '') {
        this.name = _name
        this.branchs = [ [] ]
        this.chains = []
        this.locked = false
        this.formula = ''
        this.molecularWeight = 0
        this.atoms = new AtomsOfMolecule()
    }

    brancher = (...n) => {
        const addBranch = new AddBranchCommand(this.branchs, this.atoms)
        n.forEach( n => {
                try {
                    addBranch.execute(n)
                } catch(e) {
                    console.log(e)
                    addBranch.undo()
                }
            } 
        )
        return this
    }

    bounder = (...n) => {
        const LinkBranchs = new LinkBranchsCommand(this.branchs, this.atoms)
        n.forEach( n => {
                try {
                    LinkBranchs.execute(n)
                } catch(e) {
                    console.log(e)
                    LinkBranchs.undo()
                }
            } 
        )
        return this
    }

    mutate = (...n) => {
        const mutateCarbon = new MutateCarbonCommand(this.branchs, this.atoms)
        n.forEach( n => {
                try {
                    mutateCarbon.execute(n)
                } catch(e) {
                    console.log(e)
                    mutateCarbon.undo()
                }
            } 
        )
        return this
    } 
}

class AddBranchCommand {
    constructor (branchs, atoms) {
        this.branchs = branchs
        this.branch = [{}]
        this.atoms = atoms
    }

    map = f => function* (iterator) { for (const x of iterator) yield f(x) }

    forEach = f => iterator => { for (let x of iterator) f(x) }

    createCarbon = (a) => {
        return new Atom('C', this.atoms.getLastIdOfElt('C') + 1)
    }

    updateAtoms = (a) => {
        this.atoms.add(a); 
        return a
    }

    addToBranch = (a) => {
        this.branch.push(a.id); 
        return a
    }

    linkBranchAtoms = (a) => {
        H.linkAtoms(a, this.atoms.findPrevious(a))
        return a
    }

    updateBranchs = () => this.branchs.push(this.branch)

    purgeBranch = () => this.branch = [{}]

    execute = length => {
        console.log({length})
        H.pipe(
            this.map( this.createCarbon ),
            this.map( this.updateAtoms ),
            this.map( this.addToBranch ),
            this.map( this.linkBranchAtoms ),
            this.forEach( (a) => console.log(`Element ${a.element} was created with id ${a.id} in branch ${this.branchs.length}`) )
        )([...Array(length)])

        this.updateBranchs()
        this.purgeBranch();
    }

    undo = () => {
        if ( !H.isBranch(this.branchs, this.id) ) return true
        this.branchs[this.id].forEach( id => this.atoms.filter( a => a.id !== id && a.element!== 'C' ) )
        this.branchs.pop()
        return true
    }
}

class LinkBranchsCommand {
    constructor (branchs, atoms) {
        this.branchs = branchs
        this.atoms = atoms
        this.atomIds = []
    }

    findAtoms = arr => [arr.splice(0, 2), arr].map( args => this.atoms.getAtom('C', this.branchs?.[args[1]]?.[args[0]]) )

    checkAtoms = arr => { 
        if ( arr.every( a => H.isAtom(a)) ) {
            return arr
        }
        else {
            throw  new Exception('Atom is inexistant')
        }
    } 

    setAtomsIds = arr => arr.map( a => {this.atomIds.push(a.id); return a} )

    linkBranchAtoms = arr => H.linkAtoms(arr[0], arr[1])

    removeLink = () => this.atomIds
        .map( atomId => this.atoms.getAtom('C', atomId) )
        .forEach( (a, i) => a.linkedTo.C.filter( id => id !== this.atomIds[ i === 0 ? 1 : 0 ] ) )

    execute = arr => {
        if( !H.isCorrectNumberOfArgs(4, arr) ) { throw new Exception('Invalid Number of arguments') }

        H.pipe( 
            this.findAtoms, 
            this.checkAtoms, 
            this.setAtomsIds, 
            this.linkBranchAtoms 
        )(arr)
    }

    undo = () => {
        if (this.atomIds.length === 0) return
        this.removeLink();
    }
}

class MutateCarbonCommand {
    constructor (branchs, atoms) {
        this.branchs = branchs
        this.atoms = atoms
        this.linkedTo = {}
    }

    execute = arr => {
        if( !H.isCorrectNumberOfArgs(3, arr) ) { throw new Exception('Invalid Number of arguments') }

        const [c, b, elt] = arr
        const carbon = this.atoms.getAtom('C', this.branchs?.[b]?.[c])
        if (!H.isAtom(carbon)) { throw new Exception('Atom is inexistant') }
        this.linkedTo = carbon.linkedTo
        Object.keys(this.linkedTo).forEach( elt => this.linkedTo[elt].forEach( id => this.atoms.getAtom(elt, id).removeLink(elt, carbon.id) ) )

    }

    undo = () => {

    }
}

class NullAtom {
    constructor () {
        this.element = 'Null'
        this.id = 0
    }
}

class Atom {
    constructor(elt, _id) {
        this.element = elt;
        this.id = _id;
        this.valence = Atom.VALID_ATOMS[this.element].valence;
        this.weight = Atom.VALID_ATOMS[this.element].weight;
        this.linkedTo = {}
    }

    get element () { return this._element }

    set element (newValue) {
        if (Atom.VALID_ATOMS[newValue]) this._element = newValue
        if (!Atom.VALID_ATOMS[newValue]) throw new Exception('Unrecognized element')
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
        if ( !this.#isLinkLegit(atom) || this.#isSameAtom(atom) ) throw new Exception('InvalidBond');
        this.linkedTo[atom.element] ? this.linkedTo[atom.element].push(atom.id) : this.linkedTo[atom.element] = [atom.id];
    }

    removeLinkTo = (elt, id) => this.linkedTo[elt].filter( eltId => eltId !== id )

    #getTotalLinkedTo = () => Object.keys(this.linkedTo).reduce( (acc, elt) => acc += this.linkedTo[elt].length, 0 );

    getFreeSpots = () => this.valence - this.#getTotalLinkedTo();

    #isLinkLegit = atom => Object.keys(this.linkedTo).length + 1 <= this.valence;

    #isSameAtom = atom => atom.id === this.id && atom.element === this.element;

    #getHighestIdOfElt = elt => [...this.linkedTo[elt]].sort((a,b) => a>b).pop();

    #formatLinkedToElt = arrOfElt => arrOfElt.map( elt => `${elt}${this.#getHighestIdOfElt(elt)}` );

    #moveHToLastPos = arrOfElt => {
        const indexOfH = Object.keys(this.linkedTo).indexOf('H');
        if ( indexOfH !== -1 ) arrOfElt.push( arrOfElt.splice(indexOfH, 1)[0] );
        return arrOfElt;
    } 

    #formatLinkedTo = () => H.pipe( this.#formatLinkedToElt, this.#moveHToLastPos )(Object.keys(this.linkedTo)).join(',');


    toString = () => `Atom(${this.element}.${this.id}${Object.keys(this.linkedTo).length > 0 ? ': ' + this.#formatLinkedTo() : ''})`;
}


const m = new Molecule('sergium')
m.brancher(4,5,7).bounder([1,3,5,3])
console.log(m)
m.atoms.atoms.forEach( 
    a => {
        console.log(a.toString())
        console.log(a.linkedTo)
    }
)