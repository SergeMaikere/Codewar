class Exception extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = this.constructor.name;
    }
}

class H {

    static linkAtoms = (a1, a2) => {
        if ( ![a1, a2].every( H.isAtom ) ) return;
        a1.linkTo(a2)
        a2.linkTo(a1)
    }

    static isAtom = a => a.element !== 'Null' && a.id !== 0

    static isArrOfEltValid = arrOfElt => arrOfElt.every( elt => Atom.isAtomValid(elt) )

    static isBranch = (branchs, id) => Array.isArray(branchs[id])

    static isCorrectNumberOfArgs = (n, args) => args.length === n

    static isArray = arr => Array.isArray(arr)

    static isIntBtOrEq1 = n => Number.isInteger(n) && n >= 1
    
    static validateInput = (filter, condition, input) => condition( filter(input) )

    static validationWithFilteredInput = (filter, condition) => H.curry(H.validateInput)(filter, condition)

    static pipe = (...fns) => arg => fns.reduce( (f, g) => g(f), arg )

    static map = f => function* (iterator) { 
        let i = 0
        for (const x of iterator){ 
            yield f(x, i) 
            i++
        }
    }

    static forEach = f => iterator => { for (let x of iterator) f(x) }

    static curry = fn => {
        const curried = (...args) => {
            if (args.length >= fn.length) return fn.apply(this, args)
            return (...args2) => curried.apply(this, args.concat(args2))
        }
        return curried
    }

    static findLast = arr => arr[ arr.length - 1 ]

    static logger = x => {
        console.log(x)
        return x
    }
}

class AtomsOfMolecule {
    constructor () {
        this.safe = []
        this.atomIndex = {}
    }

    add = atom => {
        this.#addToAtomIndex(atom)
        this.safe.push(atom)
    }

    #addToAtomIndex = a => a.element in this.atomIndex ? this.atomIndex[a.element].push(a.id) : this.atomIndex[a.element] = [ a.id ]

    #removeFromAtomIndex = (elt, id) => {
        if ( !(elt in this.atomIndex) ) return
        this.atomIndex[elt] = [...this.atomIndex[elt]].filter( eltId => eltId !== id )
        if (this.atomIndex.length === 0) delete this.atomIndex[elt]
    }

    remove = (elt, id) => {
        this.#removeFromAtomIndex(elt, id)
        this.safe = [...this.safe].filter( a => a.element !== elt || a.id !== id )
    }

    findPreviousSameElt = a => a.element in this.atomIndex ? H.findLast(this.atomIndex[a.element]) : new NullAtom()

    findPreviousInLine = () => this.safe[this.safe.length - 2]

    getLastIdOfElt = elt => elt in this.atomIndex ? H.findLast(this.atomIndex?.[elt]) : 0

    getAtom = (elt, id) => this.safe.find( a => a.element === elt && a.id === id ) || new NullAtom()

    toString = () => {
        this.safe.forEach(
            a => {
                console.log(a.toString())
                console.log(a.linkedTo.links)
                console.log('_____________________')
                console.log('')
            }
        )
    }
}

class LinksOfAtom {
    constructor () {
        this.links = {}
        this.length = 0
        this.total = 0
    }

    set length (v) { this._length = v }
    get length () { return Object.keys(this.links).length }

    set total (v) { this._total = v }
    get total () { return Object.keys(this.links).reduce( (acc, elt) => acc += this.links[elt].length, 0 ) }

    hasElement = elt => elt in this.links && this.links[elt].length !== 0

    getHighestIdOfLinkedElt = elt => [...this.links[elt]].sort((a,b) => a>b).pop()

    getIndexOfElt = elt => Object.keys(this.links).indexOf(elt)

    hasLink = a => a.element in this.links && this.links[a.element].includes(a.id) 

    isLonely = () => JSON.stringify(this.links) === '{}'

    add = (elt, id) => this.links[elt] ? this.links[elt].push(id) : this.links[elt] = [id]

    remove = (elt, id) => {
        this.links[elt] = [...this.links[elt]].filter( linkedId => id !== linkedId  )
        if (this.links[elt].length === 0) delete this.links[elt]
    }
}

class Validation {

    constructor (_validations) {
        this.validation = _validations
    }

    isInputValid = input => this.validation.every( f => f(input) )

    checkValidation = input => { 
        if (!this.isInputValid(input)) throw new Exception('Invalid Input') 
    }
}

class Molecule {

    constructor (_name = '') {
        this.name = _name
        this.branchs = [ [] ]
        this.chains = [ [] ]
        this.hydrogens = [ ]
        this.formula = ''
        this.molecularWeight = 0
        this.atoms = new AtomsOfMolecule()
        this.locked = false
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
        const linkBranchs = new LinkBranchsCommand(this.branchs, this.atoms)
        n.forEach( n => {
                try {
                    linkBranchs.execute(n)
                } catch(e) {
                    console.log(e)
                    linkBranchs.undo(n)
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
                    mutateCarbon.undo(n)
                }
            } 
        )
        return this
    } 

    add = (...n) => {
        const addAtom = new AddAtomCommand(this.branchs, this.atoms)
        n.forEach( n => {
                try {
                    addAtom.execute(n)
                } catch(e) {
                    console.log(e)
                    addAtom.undo(n)
                }
            } 
        )
        return this
    }

    addChain = (...n) => {
        const addChain = new AddChainCommand(this.chains, this.atoms, this.branchs)
            try {
                addChain.execute(n)
            } catch(e) {
                console.log(e)
                addChain.undo(n)
            }
        return this
    }

    closer = () => {
        const moleculeLock = new LockMoleculeCommand(this.hydrogens, this.atoms)
        moleculeLock.execute()
        return this
    }

    unlock = () => {
        const moleculeUnlock = new LockMoleculeCommand(this.hydrogens, this.atoms)
        moleculeUnlock.undo()
        return this
    }
}

class AddBranchCommand {

    constructor (branchs, atoms) {
        this.branchs = branchs
        this.atoms = atoms
        this.branch = [{}]
        this.validation = new Validation([ H.isIntBtOrEq1 ])
    }

    createAtom = () => new Atom('C', this.atoms.getLastIdOfElt('C') + 1)

    addToAtoms = a => {
        this.atoms.add(a); 
        return a
    }

    removeFromAtoms = () => {
        this.branchs[this.branchs.length].forEach( 
            obj => this.atoms = [...this.atoms].filter( a => a.id !== obj.id && a.element!== obj.elt ) 
        )
    }

    addToBranch = a => {
        this.branch.push({elt: a.element, id: a.id}); 
        return a
    }

    purgeBranch = () => this.branch = [{}]

    linkAtom = (a, i) => {
        if (i > 0) H.linkAtoms(a, this.atoms.findPreviousInLine(a))
        return a
    }

    success = a => console.log(`Atom ${a.element} was created with id ${a.id} in branch ${this.branchs.length}`)

    addToBranchs = () => this.branchs.push(this.branch)

    removeFromBranchs = () => this.branchs.pop()

    handleAddingBranch = arr => {
        H.pipe(
            H.map( this.createAtom ),
            H.map( this.addToAtoms ),
            H.map( this.addToBranch ),
            H.map( this.linkAtom ),
            H.forEach( this.success )
        )(arr)
    }

    execute = length => {
        this.validation.checkValidation(length)

        this.handleAddingBranch( [...Array(length)] )
        this.addToBranchs()
        this.purgeBranch();
    }

    undo = () => {
        if ( !H.isBranch(this.branchs, this.branchs.length) ) return
        this.removeFromAtoms()
        this.removeFromBranchs()
    }
}

class LinkBranchsCommand {
    constructor (branchs, atoms) {
        this.branchs = branchs
        this.atoms = atoms
        this.atomIds = []
        this.validations = new Validation( [H.curry(H.isCorrectNumberOfArgs)(4), H.isArray] )
    }

    #findAtoms = arr => [arr.splice(0, 2), arr].map( args => this.atoms.getAtom('C', this.branchs?.[args[1]]?.[args[0]].id) )

    #checkAtoms = arr => { 
        if ( !arr.some( H.isAtom ) ) { throw new Exception('Atom is inexistant') }
        return arr
    } 

    #setAtomsIds = arr => arr.map( a => {this.atomIds.push(a.id); return a} )

    #linkAtom = arr => H.linkAtoms(arr[0], arr[1])

    #removeLink = () => {
        if (this.atomIds.length !== 2) return

        this.atomIds
        .map( atomId => this.atoms.getAtom('C', atomId) )
        .forEach( (a, i) => a.linkedTo.remove('C', this.atomIds[ i === 0 ? 1 : 0 ]) )
    }

    execute = arr => {
        this.validations.checkValidation(arr)
        H.pipe( 
            this.#findAtoms, 
            this.#checkAtoms, 
            this.#setAtomsIds, 
            this.#linkAtom 
        )(arr)
    }

    undo = arr => this.#removeLink()
}

class MutateCarbonCommand {
    constructor (branchs, atoms) {
        this.branchs = branchs
        this.atoms = atoms
        this.validations = new Validation( [H.curry(H.isCorrectNumberOfArgs)(3), H.isArray] )
    }

    #checkAtomExists = c => {
        if (!H.isAtom(c)) { throw new Exception('Atom is inexistant') }
        return c
    }

    #checkValenceRespected = (elt, c) => {
        c.valence = elt
        if ( c.getFreeSpots() < 0 ) { throw new Exception('InvalidBond') }
        return c
    }

    #mutateCarbon = (elt, c) => {
        c.element = elt;
        c.valence = elt
        c.weight = elt
        return c
    }

    #updateAtomsLinkedTo = (eltToAdd, eltToRemove, c) => {
        for (let key in c.linkedTo.links) {
            for (const id of c.linkedTo.links[key]) {
                this.atoms.getAtom(key, id).linkedTo.remove(eltToRemove, c.id)
                this.atoms.getAtom(key, id).linkedTo.add(eltToAdd, c.id)
            }
        }
    }

    #handleMutation = arr => {
        const [c, b, elt] = arr
        H.pipe(
            this.#checkAtomExists,
            H.curry(this.#checkValenceRespected)(elt),
            H.curry(this.#mutateCarbon)(elt),
            H.curry(this.#updateAtomsLinkedTo)(elt, 'C')
        )(this.atoms.getAtom('C', this.branchs?.[b]?.[c].id))
    }

    #reverseMutation = arr => {
        const [c, b, elt] = arr
        if ( !H.isAtom(this.atoms.getAtom(elt, this.branchs?.[b]?.[c].id)) ) return

        H.pipe( 
            H.curry(this.#mutateCarbon)('C'), 
            H.curry(this.#updateAtomsLinkedTo)('C', elt) 
        )(this.atoms.getAtom(elt, this.branchs?.[b]?.[c].id))
    }

    execute = arr => {
        this.validations.checkValidation(arr)
        this.#handleMutation(arr)
    }

    undo = arr => {
        if ( !this.validations.isInputValid(arr) ) return
        this.#reverseMutation(arr)
    }
}

class AddAtomCommand {
    constructor (branchs, atoms) {
        this.branchs = branchs
        this.atoms = atoms
        this.id = 0
        this.validations = new Validation( [H.curry(H.isCorrectNumberOfArgs)(3), H.isArray] )
    }

    #checkAtomExists = a => {
        if (!H.isAtom(a)) { throw new Exception('Atom is inexistant') }
        return a
    }

    #setId = a => {this.id = a.id; return a}

    #linkCarbonToNewElement = (elt, c) => {
        const atom = new Atom(elt, this.atoms.getLastIdOfElt(elt) + 1)
        H.linkAtoms( c, atom )
        return atom
    }

    #removeNewElementFromCarbonLinks = (elt, id, c) => c.linkedTo.remove(elt, id)

    #addToAtoms = a => this.atoms.add(a)

    #removeFromAtoms = a => this.atoms.remove(a)

    #handleAddition = arr => {
        const [ c, b, elt ] = arr
        H.pipe(
            this.#checkAtomExists,
            H.curry(this.#linkCarbonToNewElement)(elt),
            this.#setId,
            this.#addToAtoms
        )(this.atoms.getAtom('C', this.branchs?.[b]?.[c].id))
    }

    #reverseAddition = arr => {
        const [c, b, elt] = arr
        const [carbon, atom] = [this.atoms.getAtom('C', this.branchs?.[b]?.[c].id), this.atoms.getAtom(elt, this.id)]

        if ( !H.isAtom(carbon) || !H.isAtom(atom) ) return
        this.#removeNewElementFromCarbonLinks(elt, this.id, carbon)
        this.#removeFromAtoms(atom)
    }

    execute = arr => {
        this.validations.checkValidation(arr)
        this.#handleAddition(arr)
    }

    undo = arr => {
        if( !this.validations.isInputValid(arr) ) return
        this.#reverseAddition(arr)
    }
}

class AddChainCommand extends AddBranchCommand {
    constructor (branchs, atoms, cBranchs) {
        super(branchs, atoms)
        this.cBranchs = cBranchs
        this.validations = new Validation(
            [
                H.isArray,
                H.validationWithFilteredInput(this.filterPos, H.isAtom),
                H.validationWithFilteredInput(this.filterElements, H.isArrOfEltValid)
            ]
        )
    }

    filterPos = arr => {
        const pos = [...arr].splice(0, 2)
        return this.atoms.getAtom('C', this.cBranchs?.[arr[1]]?.[arr[0]].id)
    }

    filterElements = arr => [...arr].splice(2)

    createAtom = elt => new Atom(elt, this.atoms.getLastIdOfElt(elt) + 1)

    success = a => console.log(`Atom ${a.element} was created with id ${a.id} in chain ${this.branchs.length}`)

    linkToCarbon = pos => {
        const [ c, x ] = [ 
            this.atoms.getAtom('C', this.cBranchs[pos[1]][pos[0]].id), 
            this.atoms.getAtom(this.branch[1].elt, this.branch[1].id ) 
        ]
        H.linkAtoms( c, x ) 
    }
    execute = arr => {
        this.validations.checkValidation(arr)
        const [ pos, elements ] = [ arr.splice(0, 2), arr]
        this.handleAddingBranch(elements)
        this.linkToCarbon(pos)
        this.addToBranchs()
        this.purgeBranch();
    }
}

class LockMoleculeCommand {

    constructor (branch, atoms) {
        this.hBranch = branch
        this.atoms = atoms
    }

    createAtom = () => new Atom( 'H', this.atoms.getLastIdOfElt('H') + 1 )

    addToAtoms = a => {this.atoms.add(a); return a}

    addToBranch = (a, i) => {
        this.hBranch.push(a.id); 
        return a
    }

    linkAtom = (a, h) => { H.linkAtoms(a, h); return h }

    closeSuccess = (a, h) => console.log(`H.${h.id} has been created and addded to ${a.element}.${a.id}`)

    findHydrogen = id => this.atoms.getAtom('H', id)

    removeAllLinks = h => {
        for ( let key in h.linkedTo.links ) {
            for ( let id of h.linkedTo.links[key] ) {
                this.atoms.getAtom(key, id).linkedTo.remove(h.element, h.id)
            }
        }
        return h
    }

    removeHydrogen = h => {
        this.atoms.remove('H', h.id); 
        return h
    }

    openSuccess = h => console.log(`H.${h.id} has been removed from molecule`)

    execute = () => {
        this.atoms.safe.forEach( 
            a => {
                H.pipe(
                    H.map(this.createAtom),
                    H.map(this.addToAtoms),
                    H.map(this.addToBranch),
                    H.map( H.curry(this.linkAtom)(a) ),
                    H.forEach( H.curry(this.closeSuccess)(a) )
                )( [...Array(a.getFreeSpots())] )
            }
        )
    }

    undo = () => {
        H.pipe(
            H.map(this.findHydrogen),
            H.map(this.removeAllLinks),
            H.map(this.removeHydrogen),
            H.forEach(this.openSuccess)
        )( [...this.hBranch] )
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
        this.valence = elt
        this.weight = elt
        this.linkedTo = new LinksOfAtom()
        this.validations = new Validation(
            [
                H.isAtom,
                this.#isValenceRespected,
                this.#isDifferentAtom, 
                this.#isNewLink
            ]
        )
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

    static isAtomValid = elt => elt in Atom.VALID_ATOMS

    get element () { return this._element }
    set element (v) {
        if (!Atom.VALID_ATOMS[v]) throw new Exception('Unrecognized element')
        this._element = v
    }

    get valence () { return this._valence }
    set valence (v) { 
        if (!Atom.VALID_ATOMS[v]) throw new Exception('Unrecognized element')
        this._valence = Atom.VALID_ATOMS[v].valence 
    }

    get weight () { return this._weight }
    set weight (v) { 
        if (!Atom.VALID_ATOMS[v]) throw new Exception('Unrecognized element')
        this._weight = Atom.VALID_ATOMS[v].weight
    }

    linkTo = a => {
        if ( !this.validations.isInputValid(a) ) throw new Exception('InvalidBond');
        this.linkedTo.add(a.element, a.id);
    }

    getFreeSpots = () => this.valence - this.linkedTo.total

    #isValenceRespected = () => this.linkedTo.total + 1 <= this.valence

    #isDifferentAtom = a => a.id !== this.id || a.element !== this.element

    #isNewLink = a => !this.linkedTo.hasLink(a)

    #formatLinkedToElt = arrOfElt => arrOfElt
        .filter( elt => this.linkedTo.hasElement(elt) )
        .map( elt => `${elt}${this.linkedTo.getHighestIdOfLinkedElt(elt)}` )

    #moveHToLastPos = arrOfElt => {
        const indexOfH = this.linkedTo.getIndexOfElt('H')
        if ( indexOfH !== -1 ) arrOfElt.push( arrOfElt.splice(indexOfH, 1)[0] )
        return arrOfElt;
    } 

    #formatLinkedTo = () => H.pipe( this.#formatLinkedToElt, this.#moveHToLastPos )(Object.keys(this.linkedTo.links)).join(', ')

    toString = () => `Atom(${this.element}.${this.id}${ !this.linkedTo.isLonely() ? ': ' + this.#formatLinkedTo() : '' })`
}

// let biotin = new Molecule('biotin')
// biotin.brancher(14,14,14)
// biotin.bounder([2,1,1,2],
//                [10,1,1,3],
//                [8,1,12,1], [7,1,14,1])
// biotin.mutate( [1,1,'O'], [1,2,'O'], [1,3,'O'],
//                [11,1,'N'], [9,1,'N'], [14,1,'S'])
// biotin.add([6,1,'H']).addChain(3, 1, "N", "C", "C", "Mg", "Br").closer()

// biotin.atoms.toString()
// biotin.unlock()
// biotin.atoms.toString()
