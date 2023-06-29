class InvalidBond extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

class UnlockedMolecule extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

class LockedMolecule extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

class EmptyMolecule extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

class ElementUnknown extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

class AtomNotInMolecule extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

class InvalidInput extends Error {
    constructor(message) {
        super(message);
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

    static setEltFront = (frontElt, arrOfElt) => {
        const front = frontElt.reduce( (acc, elt) => acc.concat(H.moveEltInFront(arrOfElt, elt)) , [] ) 
        return front.concat(arrOfElt)
    }

    static moveEltInFront = (arrOfElt, elt) => {
        const i = arrOfElt.indexOf( arrOfElt.find(str => str === elt) )
        return i !== - 1 ? arrOfElt.splice( i , 1 ) : []
    }
}

class AtomsOfMolecule {
    constructor () {
        this.safe = []
        this.atomIndex = {}
        this.length = 0
    }

    get length () { return this.safe.length }

    set length (newVal) { this._length = newVal } 

    add = atom => {
        this.addToAtomIndex(atom)
        this.safe.push(atom)
    }

    addToAtomIndex = a => a.element in this.atomIndex ? this.atomIndex[a.element].push(a.id) : this.atomIndex[a.element] = [ a.id ]

    removeFromAtomIndex = (elt, id) => {
        if ( !(elt in this.atomIndex) ) return
        this.atomIndex[elt] = [...this.atomIndex[elt]].filter( eltId => eltId !== id )
        if (this.atomIndex[elt].length === 0) delete this.atomIndex[elt]
    }

    remove = (elt, id) => {
        this.removeFromAtomIndex(elt, id)
        this.safe = [...this.safe].filter( a => a.element !== elt || a.id !== id )
    }

    findPreviousSameElt = a => a.element in this.atomIndex ? H.findLast(this.atomIndex[a.element]) : new NullAtom()

    findPreviousInLine = () => this.safe[this.safe.length - 2]

    getLastId = () => H.findLast(this.safe)?.id || 0

    getAtom = (elt, id) => this.safe.find( a => a.element === elt && a.id === id ) || new NullAtom()

    setContinuousId = () => [...this.safe].forEach( (a, i) => new MutateAtomId(a, i+1, this ).mutateAtomId() ) 

    getTotalWeight = () => this.safe.reduce( (total, a) => total += a.weight, 0 )

    #sortAlphabeticaly = arrOfElt => arrOfElt.sort()

    #setNumbersByAtoms = arrOfElt => arrOfElt.map( 
        elt => {
            const n = this.atomIndex[elt].length
            return `${elt}${n > 1 ? n : ''}`
        } 
    )

    getFormula = () => {
        return H.pipe(
            this.#sortAlphabeticaly,
            H.curry(H.setEltFront)(['C','H','O']),
            this.#setNumbersByAtoms,
        )( Object.keys(this.atomIndex) ).join('')
    }

    toString = () => this.safe.map( a => a.toString() ).join('\r\n')
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

    updateElement = (oldElt, newElt, id) => {
        if (!this.links[oldElt]) return

        this.#addNewElt(oldElt, newElt, id)
        this.remove(oldElt, id)
    }

    #addNewElt = (oldElt, newElt, id) => [...this.links[oldElt]]
        .filter( linkedId => id === linkedId )
        .forEach( linkedId => this.add(newElt, id) )

    updateId = (a, newId) => {
        this.remove(a.element, a.id)
        this.add(a.element, newId)
    }

    add = (elt, id) => this.links[elt] ? this.links[elt].push(id) : this.links[elt] = [id]

    remove = (elt, id) => {
        this.links[elt] = [...this.links[elt]].filter( linkedId => id !== linkedId  )
        if (this.links[elt].length === 0) delete this.links[elt]
    }
}

class BranchsOfMolecule {
    constructor () {
        this.safe = [ [] ]
        this.length = 0
    }

    get length () { return this.safe.length }
    set length (newVal) { this._length = newVal }

    add = b => this.safe.push(b)

    removeLast = () => this.safe.pop()

    getAtom = (branchIndex, atomIndex) => this.safe?.[branchIndex]?.[atomIndex]

    removeEmptyBranches = () => this.safe = [...this.safe].filter( b => this.hasBranchLeaves(b) || b.length == 1 )

    removeHydrogenFromBranchs = () => this.safe = [...this.safe].map( b => b.filter( a => a.elt !== 'H' || JSON.stringify(a) === '{}' ) )

    hasBranchLeaves = b => b.every( a => !this.atomsManager.getAtom(a.elt, a.id).linkedTo.isLonely() )

    checkIsMoleculeEmpty = () => { 
        if ( this.safe.every(b => b.length === 0) ) {
            throw new EmptyMolecule('No branchs left')
        } 
    }
}

class Validation {

    constructor (_validations) {
        this.validation = _validations
    }

    isInputValid = input => this.validation.every( f => f(input) )

    checkValidation = input => { 
        if (!this.isInputValid(input)) { throw new InvalidInput('Unacceptable Input. Try again.') } 
    }
}

class AddBranchCommand {

    constructor (branchs, atoms) {
        this.branchs = branchs
        this.atoms = atoms
        this.branch = [{}]
        this.validation = new Validation([ H.isIntBtOrEq1 ])
    }

    createAtom = () => new Atom('C', this.atoms.getLastId() + 1)

    addToAtoms = a => {
        this.atoms.add(a); 
        return a
    }

    removeFromAtoms = () => {
        this.branch.forEach( a => Object.keys(a).length !== 0 && this.atoms.remove(a.elt, a.id) )
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

    addToBranchs = () => this.branchs.add(this.branch)

    removeFromBranchs = () => this.branchs.removeLast() 

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

    #findAtoms = arr => [arr.splice(0, 2), arr].map( 
        args => this.atoms.getAtom('C', this.branchs.getAtom(args[1], args[0])?.id) 
    )

    #checkAtoms = arr => { 
        if ( !arr.some( H.isAtom ) ) { throw new Exception('Atom is inexistant') }
        return arr
    } 

    #setAtomsIds = arr => arr.map( a => {this.atomIds.push(a.id); return a} )

    #linkAtom = arr => { H.linkAtoms(arr[0], arr[1]); return arr }

    #success = arr => {
        const [ a1, a2 ] = arr
        console.log( `${a1.element}${a1.id} is now linked to ${a2.element}${a2.id}` )
    }

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
            this.#linkAtom,
            this.#success 
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
        if (!H.isAtom(c)) { throw new AtomNotInMolecule('Atom is inexistant') }
        return c
    }

    #checkValenceRespected = (elt, c) => {
        c.valence = elt
        if ( c.getFreeSpots() < 0 ) { throw new InvalidBond(`${elt} cannot connect to ${c.element}${c.id}`) }
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
                this.atoms.getAtom(key, id).linkedTo.updateElement(eltToRemove, eltToAdd, c.id)
            }
        }
        return c
    }

    #updateAtomIndex = a => {
        this.atoms.removeFromAtomIndex('C', a.id)
        this.atoms.addToAtomIndex(a)
        return a
    }

    #updateBranchs = (c, b, a) => { this.branchs.getAtom(b, c).elt = a.element; return a }

    #success = a => console.log( `C.${a.id} has been mutated into ${a.element}${a.id}` )

    #handleMutation = arr => {
        const [c, b, elt] = arr
        H.pipe(
            this.#checkAtomExists,
            H.curry(this.#checkValenceRespected)(elt),
            H.curry(this.#mutateCarbon)(elt),
            H.curry(this.#updateAtomsLinkedTo)(elt, 'C'),
            this.#updateAtomIndex,
            H.curry(this.#updateBranchs)(c, b),
            this.#success
        )(this.atoms.getAtom('C', this.branchs.getAtom(b, c)?.id))
    }

    #reverseMutation = arr => {
        const [c, b, elt] = arr
        if ( !H.isAtom(this.atoms.getAtom(elt, this.branchs.getAtom(b, c)?.id)) ) return

        H.pipe( 
            H.curry(this.#mutateCarbon)('C'), 
            H.curry(this.#updateAtomsLinkedTo)('C', elt) 
        )(this.atoms.getAtom(elt, this.branchs.getAtom(b, c)?.id))
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

class MutateAtomId {
    constructor (atom, newId, atoms) {
        this.atom = atom
        this.newId = newId
        this.atoms = atoms
    }

    #setLinkedTo = a => {
        a.linkedTo.links = this.atom.linkedTo.links
        return a
    }

    #setNewIdInAtomsOfMolecule = a => {
        this.atoms.remove(a.element, this.atom.id)
        this.atoms.add(a)
        return a
    }

    #setNewIdInLinksOfAtoms = a => {
        for (let key in a.linkedTo.links) {
            for (const id of a.linkedTo.links[key]) {
                this.atoms.getAtom(key, id).linkedTo.updateId(this.atom, this.newId)
            }
        }
    }

    mutateAtomId = () => {
        H.pipe(
            this.#setLinkedTo,
            this.#setNewIdInAtomsOfMolecule,
            this.#setNewIdInLinksOfAtoms
        )(new Atom(this.atom.element, this.newId))
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
        if (!H.isAtom(a)) { throw new AtomNotInMolecule('Atom is inexistant') }
        return a
    }

    #setId = a => {this.id = a.id; return a}

    #linkAtomToNewElement = (elt, c) => {
        const atom = new Atom(elt, this.atoms.getLastId() + 1)
        H.linkAtoms( c, atom )
        return atom
    }

    #removeNewElementFromCarbonLinks = (elt, id, c) => c.linkedTo.remove(elt, id)

    #addToAtoms = a => { this.atoms.add(a); return a }

    #success = (a, newA) => console.log( `${newA.element}${newA.id} has been added to ${a.elt}${a.id}` )

    #removeFromAtoms = a => this.atoms.remove(a)

    #handleAddition = arr => {
        const [ c, b, elt ] = arr
        const branchAtom = this.branchs.getAtom(b, c)
        H.pipe(
            this.#checkAtomExists,
            this.#setId,
            H.curry(this.#linkAtomToNewElement)(elt),
            this.#addToAtoms,
            H.curry(this.#success)(branchAtom)
        )(this.atoms.getAtom(branchAtom?.elt, branchAtom?.id))
    }

    #reverseAddition = arr => {
        const [c, b, elt] = arr
        const [carbon, atom] = [this.atoms.getAtom('C', this.branchs.getAtom(b, c)?.id), this.atoms.getAtom(elt, this.id)]

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
        return this.atoms.getAtom('C', this.cBranchs.getAtom(arr[1], arr[0])?.id)
    }

    filterElements = arr => [...arr].splice(2)

    createAtom = elt => new Atom(elt, this.atoms.getLastId() + 1 )
    success = a => console.log(`Atom ${a.element} was created with id ${a.id} in chain ${this.branchs.length}`)

    linkToCarbon = pos => {
        const [ c, x ] = [ 
            this.atoms.getAtom('C', this.cBranchs.getAtom(pos[1], pos[0]).id), 
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

    constructor (hBranch, atoms, branchs) {
        this.branchs = branchs
        this.hBranch = hBranch
        this.atoms = atoms
    }

    createAtom = () => new Atom( 'H', this.atoms.getLastId() + 1 )

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
            H.map(this.removeAllLinks),
            H.map(this.removeHydrogen),
            H.forEach(this.openSuccess)
        )( [...this.atoms.safe].filter(a => a.element === 'H') )
        this.branchs.removeHydrogenFromBranchs()
        this.atoms.setContinuousId()
    }
}

class NullAtom {
    constructor () {
        this.element = 'Null'
        this.id = 0
    }

    toString = () => console.log(`Atom not found`)
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
                this.#isDifferentAtom
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
        if (!Atom.VALID_ATOMS[v]) throw new ElementUnknown('Unless you are the new Mendeliev, try again')
        this._element = v
    }

    get valence () { return this._valence }
    set valence (v) { 
        if (!Atom.VALID_ATOMS[v]) throw new ElementUnknown('Unless you are the new Mendeliev, try again')
        this._valence = Atom.VALID_ATOMS[v].valence 
    }

    get weight () { return this._weight }
    set weight (v) { 
        if (!Atom.VALID_ATOMS[v]) throw new ElementUnknown('Unless you are the new Mendeliev, try again')
        this._weight = Atom.VALID_ATOMS[v].weight
    }

    linkTo = a => {
        if ( !this.validations.isInputValid(a) ) throw new InvalidBond(`${this.element}${this.id} cannot connect to ${a.element}${a.id}`);
        this.linkedTo.add(a.element, a.id);
    }

    getFreeSpots = () => this.valence - this.linkedTo.total

    #isValenceRespected = () => this.linkedTo.total + 1 <= this.valence

    #isDifferentAtom = a => a.id !== this.id || a.element !== this.element

    #isNewLink = a => !this.linkedTo.hasLink(a) 

    #sort = arrOfElt => arrOfElt.sort( (a,b) => a.localeCompare(b) )

    #formatLinkedTo = () => H.pipe( 
        this.#sort,
        H.curry(H.setEltFront)(['C','O']),
        this.#moveHToLastPos, 
        this.#formatLinkedToElt 
    )(Object.keys(this.linkedTo.links) ).join(',')

    #formatLinkedToElt = arrOfElt => arrOfElt
        .reduce(
            (acc, elt) => acc.concat(
                [...this.linkedTo.links[elt]]
                .sort((a,b) => a - b)
                .map(id => `${elt}${elt !== 'H' ? id : ''}`) 
            ), [] 
        )

    #moveHToLastPos = arrOfElt => {
        const indexOfH = arrOfElt.indexOf('H')
        if ( indexOfH !== -1 ) arrOfElt.push( arrOfElt.splice(indexOfH, 1)[0] )
        return arrOfElt;
    }

    toString = () => `Atom(${this.element}.${this.id}${ !this.linkedTo.isLonely() ? ': ' + this.#formatLinkedTo() : '' })`
}

class Molecule {

    constructor (_name) {
        this.name = _name || ''
        this.branchsManager = new BranchsOfMolecule()
        this.branchs = [ [] ]
        this.chains = new BranchsOfMolecule()
        this.hydrogens = [ ]
        this.formula = ''
        this.molecularWeight = 0
        this.atomsManager = new AtomsOfMolecule()
        this.atoms = []
        this.locked = false
    }

    get molecularWeight () {
        this.#checkMoleculeIsLocked()
        return this.atomsManager.getTotalWeight()
    }

    set molecularWeight (newVal) { this._molecularWeight = newVal }

    get formula () {
        this.#checkMoleculeIsLocked()
        return this.atomsManager.getFormula()
    }

    set formula (newVal) { this._molecularWeight = newVal }

    get atoms () { return this.atomsManager.safe }

    set atoms (newVal) { this._atoms = newVal }

    get branchs () { return this.branchsManager.safe }

    set branchs (newVal) { this._branchs = newVal }

    #toggleClose = () => this.locked = !this.locked

    #checkMoleculeIsLocked = () => { if (!this.locked) {throw new UnlockedMolecule('Molecule must be locked first')} }

    #checkMoleculeIsUnLocked = () => { if (this.locked) {throw new LockedMolecule('Molecule must be unlocked first')} }

    #removeEmptyBranches = () => this.branchs = [...this.branchs].filter( branch => this.#hasBranchLeaves(branch) || branch.length == 1 )

    #hasBranchLeaves = b => {
        console.log({b})
        return b.every( a => !this.atomsManager.getAtom(a.elt, a.id)?.linkedTo?.isLonely() )
    }

    #checkIsMoleculeEmpty = () => { 
        if ( this.branchs.every(branch => branch.length === 0) ) {
            throw new EmptyMolecule('No branchs left')
        } 
    }

    brancher = (...n) => {
        this.#checkMoleculeIsUnLocked()
        const addBranch = new AddBranchCommand(this.branchsManager, this.atomsManager)
        n.forEach( n => {
                try {
                    addBranch.execute(n)
                } catch(e) {
                    console.log(`${e.name}: ${e.message}`)
                    addBranch.undo()
                    throw e
                }
            } 
        )
        return this
    }

    bounder = (...n) => { 
        this.#checkMoleculeIsUnLocked()
        const linkBranchs = new LinkBranchsCommand(this.branchsManager, this.atomsManager)
        n.forEach( n => {
                try {
                    linkBranchs.execute(n)
                } catch(e) {
                    console.log(`${e.name}: ${e.message}`)
                    linkBranchs.undo(n)
                    throw e
                }
            } 
        )
        return this
    }

    mutate = (...n) => {
        this.#checkMoleculeIsUnLocked()
        const mutateCarbon = new MutateCarbonCommand(this.branchsManager, this.atomsManager)
        n.forEach( n => {
                try {
                    mutateCarbon.execute(n)
                } catch(e) {
                    console.log(`${e.name}: ${e.message}`)
                    mutateCarbon.undo(n)
                    throw e
                }
            } 
        )
        return this
    } 

    add = (...n) => {
        this.#checkMoleculeIsUnLocked()
        const addAtom = new AddAtomCommand(this.branchsManager, this.atomsManager)
        n.forEach( n => {
                try {
                    addAtom.execute(n)
                } catch(e) {
                    console.log(`${e.name}: ${e.message}`)
                    addAtom.undo(n)
                    throw e
                }
            } 
        )
        return this
    }

    addChaining = (...n) => {
        this.#checkMoleculeIsUnLocked()
        const addChain = new AddChainCommand(this.chains, this.atomsManager, this.branchsManager)
            try {
                addChain.execute(n)
            } catch(e) {
                console.log(`${e.name}: ${e.message}`)
                addChain.undo()
                throw e
            }
        return this
    }

    closer = () => {
        this.#checkMoleculeIsUnLocked()
        const moleculeLock = new LockMoleculeCommand(this.hydrogens, this.atomsManager, this.branchsManager)
        moleculeLock.execute()
        this.#toggleClose()
        return this
    }

    unlock = () => {
        this.#checkMoleculeIsLocked()
        const moleculeUnlock = new LockMoleculeCommand(this.hydrogens, this.atomsManager, this.branchsManager)
        moleculeUnlock.undo()
        this.#removeEmptyBranches()
        this.#checkIsMoleculeEmpty()
        this.#toggleClose()
        return this
    }
}

module.exports = { Molecule, InvalidBond, LockedMolecule, UnlockedMolecule, EmptyMolecule }


// let m = new Molecule()
// .brancher(1,5)
// .bounder([2,2,5,2], [4,2,1,1])
// .mutate([1,1,'H'])
// .closer()
// .unlock()
// .add([2,2,'P'])