// ERROR HANDLING

/**
 * This class describes an invalid bond.
 *
 * @class      InvalidBond (name)
 */
class InvalidBond extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}


/**
 * This class describes an unlocked molecule.
 *
 * @class      UnlockedMolecule (name)
 */
class UnlockedMolecule extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}


/**
 * This class describes a locked molecule.
 *
 * @class      LockedMolecule (name)
 */
class LockedMolecule extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}


/**
 * This class describes an empty molecule.
 *
 * @class      EmptyMolecule (name)
 */
class EmptyMolecule extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}


// OPTIONAL ERROR HANDLING
 
/**
 * This class describes an element unknown.
 *
 * @class      ElementUnknown (name)
 */
class ElementUnknown extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}


/**
 * This class describes an invalid input.
 *
 * @class      InvalidInput (name)
 */
class InvalidInput extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}


/**
 * Helper static class
 *
 */
class H {


    /**
     * Links atoms.
     *
     * @param      atom  a1      
     * @param      atom  a2     
     */
    static linkAtoms = (a1, a2) => {
        if ( ![a1, a2].every( H.isAtom ) ) return
        if ( !H.isValenceRespected([a1, a2]) ) {
            throw new InvalidBond(`${a1.element}${a1.id} cannot connect to ${a2.element}${a2.id}`)
        }
        a1.linkTo(a2)
        a2.linkTo(a1)
    }


    /**
     * Determines whether the specified a is atom.
     *
     * @param      atom a
     * @return     boolean True if the specified a is atom, False otherwise.
     */
    static isAtom = a => a.element !== 'Null' && a.id !== 0


    /**
     * Determines whether the 2 atoms can be linked according to the rules of the known universe
     *
     * @param      Array   arr     array of 2 atoms
     * @return     boolean True if the liaison is chemistry-law proof
     */
    static isValenceRespected = arr => {
        const [a1, a2] = arr
        return a1.linkedTo.total + 1 <= a1.valence && a2.linkedTo.total + 1 <= a2.valence
    }


    /**
     * Determines if branch exists
     *
     * @param      Array of objects branchs
     * @param      Integer id The identifier
     * @return     boolean True if branch, False otherwise.
     */
    static isBranch = (branchs, id) => Array.isArray(branchs[id])

    /**
     * Determines whether the specified arr is array.
     *
     * @param      Array arr The arr
     * @return     boolean True if the specified arr is array, False otherwise.
     */
    static isArray = arr => Array.isArray(arr)


    /**
     * Determines whether the specified object is empty
     *
     * @param      Object obj  The object
     * @return     boolean True if the specified object is empty
     */
    static isLonelyObject = obj => JSON.stringify(obj) === '{}'
    

    /**
     * Optional function to verify input validity
     *
     * @param      Function filter returns transformed input
     * @param      Function condition  returns True if condition is statisfied
     * @param      (boolean|number|string) input The user input
     * @return     boolean  True if input is valide
     */
    static validateInput = (filter, condition, input) => condition( filter(input) )


    /**
     * Curried function of validateInput where filter and condition are already known
     */
    static validationWithFilteredInput = (filter, condition) => H.curry(H.validateInput)(filter, condition)


    /*
    * Arg is transformed by an Array of functions
    */
    static pipe = (...fns) => arg => fns.reduce( (f, g) => g(f), arg )


    /*
    * A generator version of map
    */
    static map = f => function* (iterator) { 
        let i = 0
        for (const x of iterator){ 
            yield f(x, i) 
            i++
        }
    }


    /*
    * Classic forEach wrapped in a function
    */
    static forEach = f => iterator => { for (let x of iterator) f(x) }


    /*
    * Returns a function with saved arguments until number of arguments is met
    */
    static curry = fn => {
        const curried = (...args) => {
            if (args.length >= fn.length) return fn.apply(this, args)
            return (...args2) => curried.apply(this, args.concat(args2))
        }
        return curried
    }


    
    static findLast = arr => arr[ arr.length - 1 ]


    /**
     * Log argument passé dans un pipe
     *
     * @param      {<type>}  x      
     * @return     {<type>}  x
     */
    static logger = x => {
        console.log(x)
        return x
    }


    /**
     * Sets elements in an array of elements in front.
     *
     * @param      Array  frontElt  The array of elements to move to the front 
     * @param      Array  arrOfElt  The arr of element
     * @return     Array  modified array of elements
     */
    static setEltFront = (frontElt, arrOfElt) => {
        const front = frontElt.reduce( (acc, elt) => acc.concat(H.getEltFromArray(arrOfElt, elt)) , [] ) 
        return front.concat(arrOfElt)
    }


    /**
     * Get single element from array of elements
     *
     * @param      Array   arrOfElt  The arr of element
     * @param      String   elt       The element
     * @return     Array  array of a single element
     */
    static getEltFromArray = (arrOfElt, elt) => {
        const i = arrOfElt.indexOf( arrOfElt.find(str => str === elt) )
        return i !== - 1 ? arrOfElt.splice( i , 1 ) : []
    }
}



/**
 * Great repository of atoms in the molecule
 *
 */
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

    setContinuousId = branchs => [...this.safe].forEach( (a, i) => new MutateAtomId(a, i+1, this ).mutateAtomId(branchs) ) 

    getTotalWeight = () => this.safe.reduce( (total, a) => total += a.weight, 0 )


    /**
     * Sort the atoms alphabeticaly for the molecule's formula
     */
    #sortAlphabeticaly = arrOfElt => arrOfElt.sort()


    /**
     * Add numbers to the molecule's formula
     */
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


/**
 * Great index in every atoms of their links to other atoms
 *
 */
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


    /**
     * Returns true if atom has no link
     */
    isLonely = () => JSON.stringify(this.links) === '{}'

    updateElement = (oldElt, newElt, id) => {
        if (!this.links[oldElt]) return

        this.#addNewElt(oldElt, newElt, id)
        this.remove(oldElt, id)
    }

    #addNewElt = (oldElt, newElt, id) => this.add(newElt, id)

    updateId = (a, newId) => {

        this.links[a.element] = [...this.links[a.element]].map(
            id => {
                if (id === a.id) return newId
                return id
            }
        )
    }

    add = (elt, id) => this.links[elt] ? this.links[elt].push(id) : this.links[elt] = [id]

    remove = (elt, id) => {
        if ( !this.links[elt] ) return
        const i = [...this.links[elt]].findIndex( linkedId => id === linkedId )
        this.links[elt].splice(i,1)
        if (this.links[elt].length === 0) delete this.links[elt]
    }
}



class BranchsOfMolecule {
    constructor (atoms) {
        this.atoms = atoms
        this.safe = [ [] ]
        this.length = 0
    }

    get length () { return this.safe.length }
    set length (newVal) { this._length = newVal }

    add = b => this.safe.push(b)

    removeLast = () => this.length > 1 && this.safe.pop()

    getAtom = (branchIndex, atomIndex) => this.safe?.[branchIndex]?.[atomIndex]

    removeEmptyBranches = () => {
        this.safe = [...this.safe].filter((b, i) => i === 0 ? true : !this.isEmptyBranch(b))
    }

    isEmptyBranch = b => b.length === 1

    removeHydrogenFromBranchs = () => this.safe = [...this.safe].map( b => b.filter( a => a.elt !== 'H' || H.isLonelyObject(a) ) )

    checkIsMoleculeEmpty = () => { 
        if ( this.safe.every(b => b.length === 0) ) {
            throw new EmptyMolecule('No branchs left')
        } 
    }
}


/**
 * Optional class for input a validation.
 *
 */
class Validation {

    constructor (_validations) {
        this.validation = _validations
    }

    isInputValid = input => this.validation.every( f => f(input) )

    checkValidation = input => { 
        if (!this.isInputValid(input)) { throw new InvalidInput('Unacceptable Input. Try again.') } 
    }
}


/**
 * Class handles creation and removal of branches
 *
 */
class AddBranchCommand {

    constructor (branchs, atoms) {
        this.branchs = branchs
        this.atoms = atoms
        this.branch = [{}]
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
        console.log(`\nCOMMAND: .brancher(${length})`)
        this.handleAddingBranch( [...Array(length)] )
        this.addToBranchs()
        this.purgeBranch()
    }

    undo = () => {
        this.removeFromAtoms()
        this.removeFromBranchs()
    }
}



/**
 * Class handles the addition or removal of links between 2 atoms of branches
 *
 */
class LinkBranchsCommand {
    constructor (branchs, atoms) {
        this.branchs = branchs
        this.atoms = atoms
        this.atomsToLink = []
        this.atomIds = []
    }

    #findAtoms = arr => [arr.splice(0, 2), arr]
    .map( 
        args => {
            const aData = this.branchs.getAtom(args[1], args[0])
            return this.atoms.getAtom(aData?.elt, aData?.id)
        } 
    )

    #setAtomsToLink = arr => arr.map( a => {this.atomsToLink.push({elt: a.element, id: a.id}); return a} )

    #linkAtom = arr => { H.linkAtoms(arr[0], arr[1]); return arr }

    #purgeAtomsToLink = () => this.atomsToLink = []

    #success = arr => {
        const [ a1, a2 ] = arr
        console.log( `${a1.element}${a1.id} is now linked to ${a2.element}${a2.id}` )
    }

    #removeLink = arr => {
        if (this.atomsToLink.length !== 2) return
        if (this.atomsToLink[0].id === this.atomsToLink[1].id) return

        [ arr.splice(0,2), arr ]
        .map( pos => this.branchs.getAtom(pos[1], pos[0]) )
        .map( aData => this.atoms.getAtom(aData.elt, aData.id) )
        .forEach( 
            (a, i) => {
                const otherAtom = this.atomsToLink[ i === 0 ? 1 : 0 ]
                a.linkedTo.remove(otherAtom.element, otherAtom.id) 
            }
        )
    }

    execute = arr => {
        console.log(`\nCOMMAND: .bounder(${arr})`)
        H.pipe( 
            this.#findAtoms, 
            this.#setAtomsToLink, 
            this.#linkAtom,
            this.#success 
        )([...arr])
        this.#purgeAtomsToLink()
    }

    undo = arr => this.#removeLink(arr)
}


/**
 * Class handles the mutation of atoms of branches
 *
 */
class MutateCarbonCommand {
    constructor (branchs, atoms) {
        this.branchs = branchs
        this.atoms = atoms
    }

    #checkAtomExists = c => {
        if (!H.isAtom(c)) { throw new InvalidBond(`${c.element}${c.id} is inexistant`) }
        return c
    }

    #isSameElt = (oldElt, newElt) => oldElt === newElt

    #checkValenceRespected = (elt, c) => {
        c.valence = elt
        if ( c.getFreeSpots() < 0 ) { 
            c.valence = c.element
            throw new InvalidBond(`${c.element}${c.id} cannot mutate into ${elt}${c.id}`) 
        }
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

    #success = (elt, a) => console.log( `${elt}${a.id} has been mutated into ${a.element}${a.id}` )

    #handleMutation = arr => {
        console.log(`\nCOMMAND: .mutate(${arr})`)
        const [c, b, elt] = arr
        const aData = this.branchs.getAtom(b, c)

        if ( this.#isSameElt(aData.elt, elt) ) {
            console.log(`${aData.elt}${aData.id} is already a ${aData.elt}`)
            return
        }

        H.pipe(
            this.#checkAtomExists,
            H.curry(this.#checkValenceRespected)(elt),
            H.curry(this.#mutateCarbon)(elt),
            H.curry(this.#updateAtomsLinkedTo)(elt, aData.elt),
            this.#updateAtomIndex,
            H.curry(this.#updateBranchs)(c, b),
            H.curry(this.#success)(aData.elt)
        )(this.atoms.getAtom(aData.elt, aData.id))
    }

    #reverseMutation = arr => {
        const [c, b, elt] = arr
        const aData = this.branchs.getAtom(b, c)
        if ( !H.isAtom(this.atoms.getAtom(elt, aData.id)) ) return

        H.pipe( 
            H.curry(this.#mutateCarbon)(aData.elt), 
            H.curry(this.#updateAtomsLinkedTo)(aData.elt, elt) 
        )(this.atoms.getAtom(elt, aData.id))
    }

    execute = arr => this.#handleMutation(arr) 

    undo = arr => this.#reverseMutation(arr)
}


/**
 * Class handles changing an atom's id
 *
 */
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

    #setNewIdBranchs = (branchs, atom) => {
        branchs.safe.forEach(
            b => {
                if (b.length === 0 ) return
                b.forEach( 
                    a =>  {
                        if ( a?.elt === this.atom.element && a?.id === this.atom.id ) {
                            a.id = atom.id
                        }
                    }
                )
            }
        )
        return atom
    }

    mutateAtomId = branchs => {
        H.pipe(
            this.#setLinkedTo,
            this.#setNewIdInAtomsOfMolecule,
            H.curry(this.#setNewIdBranchs)(branchs),
            this.#setNewIdInLinksOfAtoms
        )(new Atom(this.atom.element, this.newId))
    }
}


/**
 * Class handles adding an atom to a branch's atom
 *
 */
class AddAtomCommand {
    constructor (branchs, atoms) {
        this.branchs = branchs
        this.atoms = atoms
        this.id = 0
    }

    #checkAtomExists = a => {
        if (!H.isAtom(a)) { throw new InvalidBond(`${a.element}${a.id} is inexistant`) }
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

    #purgeId = () => this.id = 0

    #success = (a, newA) => console.log( `${newA.element}${newA.id} has been added to ${a.elt}${a.id}` )

    #removeFromAtoms = a => this.atoms.remove(a)

    #handleAddition = arr => {
        console.log(`\nCOMMAND: .add(${arr})`)
        const [ c, b, elt ] = arr
        const branchAtom = this.branchs.getAtom(b, c)
        H.pipe(
            this.#checkAtomExists,
            H.curry(this.#linkAtomToNewElement)(elt),
            this.#setId,
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
        this.#handleAddition(arr) 
        this.#purgeId()
    }

    undo = arr => this.#reverseAddition(arr) 
}


/**
 * Class handles creation and removal of a chain and its addition to the branch
 *
 */
class AddChainCommand extends AddBranchCommand {
    constructor (branchs, atoms, cBranchs) {
        super(branchs, atoms)
        this.cBranchs = cBranchs
    }

    createAtom = elt => new Atom(elt, this.atoms.getLastId() + 1 )
    success = a => console.log(`Atom ${a.element} was created with id ${a.id} in chain ${this.branchs.length}`)

    linkToCarbon = pos => {
        const aData = this.cBranchs.getAtom(pos[1], pos[0])
        const [ c, x ] = [ 
            this.atoms.getAtom(aData.elt, aData.id), 
            this.atoms.getAtom(this.branch[1].elt, this.branch[1].id ) 
        ]
        H.linkAtoms( c, x ) 
    }

    chainSuccess = pos => {
        const cDatas = this.cBranchs.getAtom(pos[1], pos[0])
        console.log(`Chain ${this.branchs.length - 1} is connected to ${cDatas.elt}${cDatas.id}`)
    }

    execute = arr => {
        console.log(`\nCOMMAND: .addChaining(${arr})`)
        const [ pos, elements ] = [ arr.splice(0, 2), arr]
        this.handleAddingBranch(elements)
        this.linkToCarbon(pos)
        this.addToBranchs()
        this.purgeBranch()
        this.chainSuccess(pos)
    }
}


/**
 * Class handles the locking/hydration and the unlicking/dehydration of the molecule
 *
 */
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
        console.log(`\nCOMMAND: .closer()`)
        this.atoms.safe.forEach( 
            a => {
                if ( a.getFreeSpots() <= 0 ) return
                H.pipe(
                    H.map(this.createAtom),
                    H.map(this.addToAtoms),
                    H.map(this.addToBranch),
                    H.map( H.curry(this.linkAtom)(a) ),
                    H.forEach( h => h )
                )( [...Array(a.getFreeSpots())] )
            }
        )
        console.log('Molecule LOCKED')
    }

    undo = () => {
        console.log(`\nCOMMAND: .unlock()`)
        H.pipe(
            H.map(this.removeAllLinks),
            H.map(this.removeHydrogen),
            H.forEach( h => h )
        )( [...this.atoms.safe].filter(a => a.element === 'H') )

        this.branchs.removeHydrogenFromBranchs()
        this.atoms.setContinuousId(this.branchs)
        console.log('Molecule UNLOCKED')
    }
}


/**
 * This class describes a null atom (returned when atom dosen't exists)
 *
 */
class NullAtom {
    constructor () {
        this.element = 'Null'
        this.id = 0
    }

    toString = () => console.log(`Atom not found`)
}


/**
 * This class describes an atom.
 *
 */
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
        if ( !this.validations.isInputValid(a) ) {
            throw new InvalidBond(`${this.element}${this.id} cannot connect to ${a.element}${a.id}`)
        }
        else {
            this.linkedTo.add(a.element, a.id)
        }
    }


    /**
     * Gets the free spots where hysdrogen can be linked
     *
     * @return     Int  The free spots.
     */
    getFreeSpots = () => this.valence - this.linkedTo.total

    #isDifferentAtom = a => a.id !== this.id || a.element !== this.element

    /**
     * Sort array of elements alphabeticaly
     * 
     * @return    Array    ordered array of elements
     */
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


/**
 * This class describes a molecule.
 *
 */
class Molecule {

    constructor (_name) {
        this.name = _name || ''
        this.atomsManager = new AtomsOfMolecule()
        this.atoms = []
        this.branchsManager = new BranchsOfMolecule(this.atomsManager)
        this.chains = new BranchsOfMolecule(this.atomsManager)
        this.branchs = [ [] ]
        this.hydrogens = [ ]
        this.formula = ''
        this.molecularWeight = 0
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
        this.branchsManager.removeEmptyBranches()
        this.branchsManager.checkIsMoleculeEmpty()
        this.#toggleClose()
        return this
    }

    display = () => {
        console.log('\r\n')
        console.log('DISPLAY')
        console.log('---------------------')
        console.log( this.atomsManager.toString() )
        console.log('\r\n')

        return this
    }
}

module.exports = { Molecule, InvalidBond, LockedMolecule, UnlockedMolecule, EmptyMolecule, ElementUnknown }


