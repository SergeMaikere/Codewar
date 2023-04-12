class Exception extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = this.constructor.name;
    }
}

class H {
    static pipe = (...fns) => arg => fns.reduce( (f, g) => g(f), arg )

    static linkAtoms = (a1, a2) => {
        if ( ![a1, a2].every( H.isAtom ) ) return;
        a1.linkTo(a2)
        a2.linkTo(a1)
    }

    static isAtom = a => a.element !== 'Null' && a.id !== 0

    static isBranch = (branchs, id) => Array.isArray(branchs[id])

    static isCorrectNumberOfArgs = (n, args) => args.length === n

    static isArray = arr => Array.isArray(arr)

    static isIntBtOrEq1 = n => Number.isInteger(n) && n >= 1

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

    static validateInput = (filter, condition, input) => condition( filter(input) )

    static validationWithFilteredInput = (filter, condition) => H.curry(H.validateInput)(filter, condition)

    static logger = (...x) => {
        for (n in x) console.log(n)
        return x
    }
}

class AtomsOfMolecule {
    constructor () {
        this.atoms = []
    }

    add = atom => this.atoms.push(atom)

    remove = (elt, id) => this.atoms = [...this.atoms].filter( a => a.elt !== elt && a.id !== id )

    findPreviousSameElt = a => this.getAtom( a.element, a.id - 1 )

    findPreviousInLine = () => this.atoms[this.atoms.length - 2]

    getLastIdOfElt = elt => [...this.atoms].filter( a => a.element === elt )?.pop()?.id || 0

    getAtom = (elt, id) => this.atoms.find( a => a.element === elt && a.id === id ) || new NullAtom()

    toString = () => {
        this.atoms.forEach(
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

    isEmpty = elt => this.links[elt].length === 0

    getHighestIdOfLinkedElt = elt => [...this.links[elt]].sort((a,b) => a>b).pop()

    hasLink = a => this.links?.[a.element]?.includes(a.id) 

    add = (elt, id) => this.links[elt] ? this.links[elt].push(id) : this.links[elt] = [id]

    remove = (elt, id) => this.links[elt] = [...this.links[elt]].filter( linkedId => id !== linkedId  )
}

class Molecule {

    constructor (_name = '') {
        this.name = _name
        this.branchs = [ [] ]
        this.chains = [ [] ]
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
        const addChain = new addChainCommand(this.chains, this.atoms, this.branchs)
            try {
                addChain.execute(n)
            } catch(e) {
                console.log(e)
                addChain.undo(n)
            }
        return this
    }
}

class AddBranchCommand {

    constructor (branchs, atoms) {
        this.branchs = branchs
        this.atoms = atoms
        this.branch = [{}]
        this.validation = [ H.isIntBtOrEq1 ]
    }

    isInputValid = input => this.validation.every( f => f(input) )

    createAtom = (elt, a, i) => new Atom(elt, this.atoms.getLastIdOfElt(elt) + 1)

    createCarbon =  H.curry( this.createAtom )('C')

    addToAtoms = (a, i) => {
        this.atoms.add(a); 
        return a
    }

    removeFromAtoms = () => {
        this.branchs[this.branchs.length].forEach( 
            obj => this.atoms = [...this.atoms].filter( a => a.id !== obj.id && a.element!== obj.elt ) 
        )
    }

    addToBranch = (a, i) => {
        this.branch.push({elt: a.element, id: a.id}); 
        return a
    }

    purgeBranch = () => this.branch = [{}]

    linkBranchAtoms = (a, i) => {
        if ( i > 0 ) H.linkAtoms(a, this.atoms.findPreviousInLine(a))
        return a
    }

    success = a => console.log(`Atom ${a.element} was created with id ${a.id} in branch ${this.branchs.length}`)

    addToBranchs = () => this.branchs.push(this.branch)

    removeFromBranchs = () => this.branchs.pop()

    handleAddingBranch = arr => {
        H.pipe(
            H.map( this.createCarbon ),
            H.map( this.addToAtoms ),
            H.map( this.addToBranch ),
            H.map( this.linkBranchAtoms ),
            H.forEach( this.success )
        )(arr)
    }

    execute = length => {
        if ( !this.isInputValid(length) ) { throw new Exception('Invalid arguments') }

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
    }

    #findAtoms = arr => [arr.splice(0, 2), arr].map( args => this.atoms.getAtom('C', this.branchs?.[args[1]]?.[args[0]].id) )

    #checkAtoms = arr => { 
        if ( !arr.some( H.isAtom ) ) { throw new Exception('Atom is inexistant') }
        return arr
    } 

    #setAtomsIds = arr => arr.map( a => {this.atomIds.push(a.id); return a} )

    #linkBranchAtoms = arr => H.linkAtoms(arr[0], arr[1])

    #removeLink = () => this.atomIds
        .map( atomId => this.atoms.getAtom('C', atomId) )
        .forEach( (a, i) => a.linkedTo.remove('C', this.atomIds[ i === 0 ? 1 : 0 ]) )

    execute = arr => {
        if( !H.isCorrectNumberOfArgs(4, arr), !H.isArray(arr) ) { throw new Exception('Invalid arguments') }

        H.pipe( 
            this.#findAtoms, 
            this.#checkAtoms, 
            this.#setAtomsIds, 
            this.#linkBranchAtoms 
        )(arr)
    }

    undo = arr => {
        if( H.isCorrectNumberOfArgs(3, arr) || H.isArray(arr) ) return
        this.#removeLink();
    }
}

class MutateCarbonCommand {
    constructor (branchs, atoms) {
        this.branchs = branchs
        this.atoms = atoms
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
                this.#removeLinkToThisAtom(this.atoms.getAtom(key, id), eltToRemove, c.id)
                this.#addLinkToThisAtom(this.atoms.getAtom(key, id), eltToAdd, c.id)
            }
        }
    }

    #removeLinkToThisAtom = (a, elt, id) => a.linkedTo.remove(elt, id)

    #addLinkToThisAtom = (a, elt, id) => a.linkedTo.add(elt, id)

    execute = arr => {
        if( !H.isCorrectNumberOfArgs(3, arr) || !H.isArray(arr) ) { throw new Exception('Invalid arguments') }

        const [c, b, elt] = arr
        H.pipe(
            this.#checkAtomExists,
            H.curry(this.#checkValenceRespected)(elt),
            H.curry(this.#mutateCarbon)(elt),
            H.curry(this.#updateAtomsLinkedTo)(elt, 'C')
        )(this.atoms.getAtom('C', this.branchs?.[b]?.[c].id))
    }

    undo = arr => {
        if( H.isCorrectNumberOfArgs(3, arr) || H.isArray(arr) ) return

        const [c, b, elt] = arr
        if ( !H.isAtom(this.atoms.getAtom(elt, this.branchs?.[b]?.[c].id)) ) return
        H.pipe( 
            H.curry(this.#mutateCarbon)('C'), 
            H.curry(this.#updateAtomsLinkedTo)('C', elt) 
        )(this.atoms.getAtom(elt, this.branchs?.[b]?.[c].id))
    }
}

class AddAtomCommand {
    constructor (branchs, atoms) {
        this.branchs = branchs
        this.atoms = atoms
        this.id = 0
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

    execute = arr => {
        if( !H.isCorrectNumberOfArgs(3, arr) || !H.isArray(arr) ) { throw new Exception('Invalid arguments') }

        const [ c, b, elt ] = arr
        H.pipe(
            this.#checkAtomExists,
            H.curry(this.#linkCarbonToNewElement)(elt),
            this.#setId,
            this.#addToAtoms
        )(this.atoms.getAtom('C', this.branchs?.[b]?.[c].id))
    }

    undo = arr => {
        if( H.isCorrectNumberOfArgs(3, arr) || H.isArray(arr) ) return

        const [c, b, elt] = arr
        const [carbon, atom] = [this.atoms.getAtom('C', this.branchs?.[b]?.[c].id), this.atoms.getAtom(elt, this.id)]

        if ( !H.isAtom(carbon) || !H.isAtom(atom) ) return
        this.#removeNewElementFromCarbonLinks(elt, this.id, carbon)
        this.#removeFromAtoms(atom)
    }
}

class addChainCommand extends AddBranchCommand {
    constructor (branchs, atoms, cBranchs) {
        super(branchs, atoms)
        this.cBranchs = cBranchs
        this.validation = [
            H.isArray,
            H.validationWithFilteredInput(this.filterPos, H.isAtom),
            H.validationWithFilteredInput(this.filterElements, this.isArrOfEltValid)
        ]
    }

    filterPos = arr => {
        const pos = [...arr].splice(0, 2)
        return this.atoms.getAtom('C', this.cBranchs?.[arr[1]]?.[arr[0]].id)
    }

    filterElements = arr => [...arr].splice(2)

    isArrOfEltValid = arrOfElt => arrOfElt.every( elt => Atom.isAtomValid(elt) ) 

    success = a => console.log(`Atom ${a.element} was created with id ${a.id} in chain ${this.branchs.length}`)

    handleAddingBranch = arr => {
        H.pipe(
            H.map( this.createAtom ),
            H.map( this.addToAtoms ),
            H.map( this.addToBranch ),
            H.map( this.linkBranchAtoms ),
            H.forEach( this.success )
        )(arr)
    }

    linkToCarbon = pos => {
        const [ c, x ] = [ 
            this.atoms.getAtom('C', this.cBranchs[pos[1]][pos[0]]), 
            this.atoms.getAtom(this.branch[1].elt, this.branch[1].id ) 
        ]
        H.linkAtoms( c, x ) 
    }
    execute = arr => {
        if ( !this.isInputValid(arr) ) { throw new Exception('Invalid arguments') }
        
        const [ pos, elements ] = [ arr.splice(0, 2), arr]
        this.handleAddingBranch(elements)
        this.linkToCarbon(pos)
        this.addToBranchs()
        this.purgeBranch();
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
    }

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

    #linkValidations = () => [
        this.#isNotAtom,
        this.#isValenceDefiant,
        this.#isSameAtom, 
        this.#isAlreadyLinked
    ]

    linkTo = a => {
        if (this.#linkValidations().some(f => f(a))) throw new Exception('InvalidBond');
        this.linkedTo.add(a.element, a.id);
    }

    removeLinkTo = (elt, id) => this.linkedTo.remove(elt, id)

    getFreeSpots = () => this.valence - this.linkedTo.total

    #isValenceDefiant = () => this.linkedTo.length + 1 > this.valence

    #isSameAtom = a => a.id === this.id && a.element === this.element

    #isAlreadyLinked = a => this.linkedTo.hasLink(a)

    #isNotAtom = a => !H.isAtom(a)

    #formatLinkedToElt = arrOfElt => arrOfElt
    .filter( elt => !this.linkedTo.isEmpty(elt) )
    .map( elt => `${elt}${this.linkedTo.getHighestIdOfLinkedElt(elt)}` )

    #moveHToLastPos = arrOfElt => {
        const indexOfH = Object.keys(this.linkedTo.links).indexOf('H')
        if ( indexOfH !== -1 ) arrOfElt.push( arrOfElt.splice(indexOfH, 1)[0] )
        return arrOfElt;
    } 

    #formatLinkedTo = () => H.pipe( this.#formatLinkedToElt, this.#moveHToLastPos )(Object.keys(this.linkedTo.links)).join(', ')

    toString = () => `Atom(${this.element}.${this.id}${Object.keys(this.linkedTo).length > 0 ? ': ' + this.#formatLinkedTo() : ''})`
}

let biotin = new Molecule('biotin')
biotin.brancher(14,1,1)
biotin.bounder([2,1,1,2],
               [10,1,1,3],
               [8,1,12,1], [7,1,14,1])
biotin.mutate( [1,1,'O'], [1,2,'O'], [1,3,'O'],
               [11,1,'N'], [9,1,'N'], [14,1,'S'])
biotin.add([6,1,'H']).addChain(3, 1, "N", "C", "C", "Mg", "Br")
// // biotin.closer()

// console.log(biotin)
biotin.atoms.atoms.forEach( 
    a => {
        console.log(a.toString())
        console.log(a.linkedTo.links)
        console.log('_____________________')
        console.log('')
    }
)

// The clue for step 2 is:
// Does this one take the form of a magical creature, or perhaps he is just a housecat. As clever as his owner? Revelio!
// 
// The clue for step 3 is:
// This biography of the irrational may help if lost at sea with an Indian cat.
// 
// The clue for step 4 is:
// A matriarchal-sounding cat tours Japan in these moving diaries.
// 
// The clue for step 5 is:
// A marsupial's classic that features
// Some useful and talented creatures.
// How poetic!
// 
// Step: #6
// The boss has a cocktail and a demonic, chess-playing cat in this Soviet satire.
// 
// The clue for step 7 is:
// Miscellaneous relations of this tomcat roam the forests of Lancre.
// 
// The clue for step 8 is:
// Verbing weirds language. Do we need to clue you in further?
// NB For the sake of the quiz setters' sanity, collections have also been included in the valid answers for this one.
// 
// The clue for step 9 is:
// It may help to start at the end of this eulc.
// 
// The clue for step 10 is:
// No littering! Here, the very opposite is sought. Burrow away to discover the correct Tab for this saga in deepest Hampshire.