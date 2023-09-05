const { Molecule, InvalidBond, LockedMolecule, UnlockedMolecule, EmptyMolecule, ElementUnknown } = require('../molecule2.js')
const chai = require('chai')
const assert = chai.assert

chai.config.truncateThreshold = 0;

describe('Basic tests', () => {
    it('Constructors', () => {
        var m = new Molecule
        assert.strictEqual(m.name, '', 'Should define the empty string as default name')

        m = new Molecule('banana')
        assert.strictEqual(m.name, 'banana', 'Even if...')
    })

    it('Simple carbohydrates', () => {
/* methane:
  H
  |
H-C-H   <=>  CH4
  |
  H
*/
        var methane = new Molecule("methane").brancher(1).closer()
        assert.strictEqual(methane.formula, 'CH4')
        assert.strictEqual(methane.molecularWeight, 16)


/* octane:
CH3-CH2-CH2-CH2-CH2-CH2-CH2-CH3
*/
        var octane = new Molecule('octane').brancher(8).closer()
        assert.strictEqual(octane.formula, 'C8H18')
        assert.strictEqual(octane.molecularWeight, 114)
    })
})

const str = it => it.toString()

describe('Atom class specifications (using methane)', () => {
    
    let methane,atoms
    beforeEach(()=>{
      methane = new Molecule('methane').brancher(1)
      atoms   = methane.atoms;
    })
    
    it('toString() implementation (basics 1): atom without bonds', () => {
        assert.strictEqual(str(atoms[0]), 'Atom(C.1)')
    })
    
    
    it("'element' and 'id' properties", () => {
        methane.closer()
        atoms = methane.atoms;

        assert.strictEqual(atoms.length, 5, 'Wrong number of atoms');

        [...'CHHHH'].forEach((elt, x) => {
            assert.strictEqual(atoms[x].element, elt, `Wrong atom at the index ${x} in self.atoms`)
            assert.strictEqual(atoms[x].id, x + 1, `Wrong id value ${x + 1} in self.atoms`)
        })
    })

    it('toString() implementation (basics 2)', () => {
        methane.closer()
        atoms = methane.atoms;

        assert.strictEqual(str(atoms[0]), 'Atom(C.1: H,H,H,H)')
        assert.strictEqual(str(atoms[atoms.length - 1]), 'Atom(H.5: C1)')
    })
})



const extractNoneHToStr = m => m.atoms.filter(it => it.element != 'H').map(str)

const testThisMolecule = (m, formula, mm, strNoH) => {
    assert.strictEqual(m.formula, formula, 'Testing raw formula')
    assert.strictEqual(m.molecularWeight, mm, 'Testing molecular weight')
    assert.deepEqual(extractNoneHToStr(m), strNoH, 'Checking bonds (for non-hydrogens)')
}




describe('Create carbohydrates and bound them correctly (id tracking, raw formula and molecular weight tested)', () => {

const config = [

[/* cyclohexane:
CH2-CH2-CH2
|       |
CH2-CH2-CH2
*/,
'cyclohexane',
[6],
[[1,1,6,1]],
'C6H12',
84,
['Atom(C.1: C2,C6,H,H)', 'Atom(C.2: C1,C3,H,H)', 'Atom(C.3: C2,C4,H,H)', 'Atom(C.4: C3,C5,H,H)', 'Atom(C.5: C4,C6,H,H)', 'Atom(C.6: C1,C5,H,H)']],


[/* 1,1-dimethyl-2-propylcyclohexane:
            CH3   CH3
               \ /
CH3-CH2-CH2-CH2-CH2-CH2
            |       |
            CH2-CH2-CH2
*/,
'2-propyl-1,1-dimethylcyclohexane',
[9,1,1],
[[4,1,9,1], [5,1,1,2], [5,1,1,3]],
'C11H22',
154,
['Atom(C.1: C2,H,H,H)', 'Atom(C.2: C1,C3,H,H)', 'Atom(C.3: C2,C4,H,H)', 'Atom(C.4: C3,C5,C9,H)', 'Atom(C.5: C4,C6,C10,C11)', 'Atom(C.6: C5,C7,H,H)', 'Atom(C.7: C6,C8,H,H)', 'Atom(C.8: C7,C9,H,H)', 'Atom(C.9: C4,C8,H,H)', 'Atom(C.10: C5,H,H,H)', 'Atom(C.11: C5,H,H,H)']],


[/* cubane (something like that, with one more 'CH' group at the back of the cube...):
       CH-----CH
      /      /|
     /      / |
    CH-----CH CH
    |      | /
    |      |/
    CH-----CH
*/,'cubane - one branch',
[8],
[[3,1,6,1], [2,1,7,1], [1,1,8,1], [4,1,1,1], [5,1,8,1]],
'C8H8',
104,
['Atom(C.1: C2,C4,C8,H)', 'Atom(C.2: C1,C3,C7,H)', 'Atom(C.3: C2,C4,C6,H)', 'Atom(C.4: C1,C3,C5,H)', 'Atom(C.5: C4,C6,C8,H)', 'Atom(C.6: C3,C5,C7,H)', 'Atom(C.7: C2,C6,C8,H)', 'Atom(C.8: C1,C5,C7,H)']],


[/* cubane again: same than the one above!
*/,
'cubane - two branches',
[4,4],
[[1,1,4,1], [1,2,4,2], [1,1,1,2], [2,1,2,2], [3,1,3,2], [4,1,4,2]],
'C8H8',
104,
['Atom(C.1: C2,C4,C5,H)', 'Atom(C.2: C1,C3,C6,H)', 'Atom(C.3: C2,C4,C7,H)', 'Atom(C.4: C1,C3,C8,H)', 'Atom(C.5: C1,C6,C8,H)', 'Atom(C.6: C2,C5,C7,H)', 'Atom(C.7: C3,C6,C8,H)', 'Atom(C.8: C4,C5,C7,H)']],

[/* benzene:
 CH-CH
//   \\
CH    CH
\    /
 CH=CH
*/,
'benzene: double bonds',
[2,2,2],
[[1,1,2,1], [1,2,2,2], [1,3,2,3], [2,1,1,2], [2,2,1,3], [2,3,1,1]],
'C6H6',
78,
['Atom(C.1: C2,C2,C6,H)', 'Atom(C.2: C1,C1,C3,H)', 'Atom(C.3: C2,C4,C4,H)', 'Atom(C.4: C3,C3,C5,H)', 'Atom(C.5: C4,C6,C6,H)', 'Atom(C.6: C1,C5,C5,H)']],

]
    config.forEach(([_, name, branch, bonds, formula, mm, carbToStr]) => {
        it(name, () => {
            const m = new Molecule(name).brancher(...branch).bounder(...bonds).closer()
            testThisMolecule(m, formula, mm, carbToStr)
        })
    })
})





describe('Mutating, adding and valence numbers consistencies', () => {

const config = [
[/* Furane:
    O
  /   \
CH     CH
 \\   //
  CH-CH
*/,
'Furane: no additional hydrogens while closing after mutation',
[5],
[[5,1,1,1], [5,1,4,1], [2,1,3,1]],
[[1,1,'O']],
'C4H4O',
68,
['Atom(O.1: C2,C5)', 'Atom(C.2: C3,C3,O1,H)', 'Atom(C.3: C2,C2,C4,H)', 'Atom(C.4: C3,C5,C5,H)', 'Atom(C.5: C4,C4,O1,H)']],


[/* isopropylmagnesium bromide:
CH3
  \
   CH-Mg-Br
  /
CH3
*/,
'isopropylmagnesium bromide',
[4, 1],
[[2,1,1,2]],
[[3,1,'Mg'], [4,1,'Br']],
'C3H7BrMg',
147.3,
['Atom(C.1: C2,H,H,H)', 'Atom(C.2: C1,C5,Mg3,H)', 'Atom(Mg.3: C2,Br4)', 'Atom(Br.4: Mg3)', 'Atom(C.5: C2,H,H,H)']]
]

    config.forEach(([_, name, branch, bonds, mut, formula, mm, carbToStr]) => {
        it(name, () => {
            const m = new Molecule(name).brancher(...branch).bounder(...bonds).mutate(...mut).closer()
            testThisMolecule(m, formula, mm, carbToStr)
        })
    })
})


describe('Fail when it should, building molecules', () => {

    it('Invalid basic builds', () => {

const config = [
['No self-bonding',
[6],
[[1,1,1,1]]],

['Should fail when exceeding the valence number adding new alkyls to the same atom',
[3,1,1,1],
[[2,1,1,2], [2,1,1,3], [2,1,1,4]]],

['Should fail when exceeding the valence number with multiple bonds',
[4],
[[2,1,3,1], [2,1,3,1], [2,1,3,1]]],

]
        config.forEach(([descript, branch, bonds]) => {
            assert.throws(
              () => {new Molecule('').brancher(...branch).bounder(...bonds).closer()},
              InvalidBond, '',
              descript
            )
        })
    })
})



describe('Invalid mutations and additions', () => {

    const config = [
        ['Should fail when mutating a carbon with three atoms already linked to an oxygen',
        [3,1],
        [[2,1,1,2]],
        'mutate', [2,1,'O']],

        ['Should fail when mutating a carbon with two double bonds to nitrogen',
        [3],
        [[1,1,2,1], [3,1,2,1]],
        'mutate', [2,1,'N']],

        ['Should fail when adding a new hydrogen to a carbon with already 4 bonds',
        [3],
        [[1,1,2,1], [3,1,2,1]],
        'add', [2,1,'H']],


        ['Should fail when mutating an atom and then adding too much atoms on it',
        [3],
        [[1,1,2,1]],
        'mutadd', [[2,1,'N'], [2,1,'O']]],

    ]
    config.forEach(([descript, branch, bonds, mutadd, inp]) => {
        it(descript, () => {
            const m = new Molecule('').brancher(...branch).bounder(...bonds)
            var func
            if (mutadd === 'mutate') func = () => m.mutate(inp).closer()
            else if (mutadd === 'add') func = () => m.add(inp).closer()
            else if (mutadd === 'mutadd') func = () => m.mutate(inp[0]).add(inp[1]).closer()
            else throw new Error('Wrong configuration of the tests')

            assert.throws(func, InvalidBond)
        })
    })
})

describe(
    'Mutating, adding and valence numbers consistencies', () => {
        it(
            'Atom.toString() specs, part 2', () => {
                let m = new Molecule()
                .brancher(5)
                .mutate([2,1,'N'])
                .add([3,1,'Br'], [3,1,'O'])
                .addChaining(4,1,'S','C','B')
                .closer()

                const links = m.atoms.filter( a => a.element !== 'H' ).map( a => a.toString() )
                assert.deepEqual(
                    links,
                    [ 
                        'Atom(C.1: N2,H,H,H)', 
                        'Atom(N.2: C1,C3,H)', 
                        'Atom(C.3: C4,O7,Br6,N2)', 
                        'Atom(C.4: C3,C5,S8,H)', 
                        'Atom(C.5: C4,H,H,H)', 
                        'Atom(Br.6: C3)', 
                        'Atom(O.7: C3,H)', 
                        'Atom(S.8: C4,C9)', 
                        'Atom(C.9: B10,S8,H,H)', 
                        'Atom(B.10: C9,H,H)' 
                    ],
                    'Checking bonds for non hydrogens'
                )
            }
        )
    }
)

describe(
    'Invalid mutations/additions and molecule integrity', () => {
        it( 
            'Should fail when chaining atoms after any monovalent atom', () => {
                let m = new Molecule()
                assert.throws( () => m.brancher(3).addChaining(3,1,'C','C','F','H'), InvalidBond)
                let links = m.atoms.map( a => a.toString() )
                assert.deepEqual(links, [ 'Atom(C.1: C2)', 'Atom(C.2: C1,C3)', 'Atom(C.3: C2)' ])
            }
        )
    }
)


describe(
    'Molecule integrity: keeps the valid arguments but does not execute those after the one raising an exception', () => {
        it(
            'Invalid add command resulting in tetrachloromethane with valid operations', 
            () => {
                let m = new Molecule()
                const func = () => m.brancher(1).add([1,1,'Cl'],[1,1,'Cl'],[1,1,'Cl'],[1,1,'Cl'],[1,1,'Cl'])
                assert.throws(func, InvalidBond)
                let links = m.atoms.map( a => a.toString() )
                assert.deepEqual(links, [ 'Atom(C.1: Cl2,Cl3,Cl4,Cl5)', 'Atom(Cl.2: C1)', 'Atom(Cl.3: C1)', 'Atom(Cl.4: C1)', 'Atom(Cl.5: C1)' ])
            }
        )
    }
)

describe(
    'Behaviors about the unlock method', () => {
        it(
            'Unlock properly a molecule, removing hydrogens and updating id numbers)',
            () => {
                let m = new Molecule().brancher(3).add([2,1,'H']).brancher(1).bounder([2,1,1,2]).closer().unlock()
                const links = m.atoms.map( a => a.toString() )
                assert.deepEqual(
                    links, 
                    [ 'Atom(C.1: C2)', 'Atom(C.2: C1,C3,C4)', 'Atom(C.3: C2)', 'Atom(C.4: C2)' ],
                    'All hydrogens should have been removed after closing/unlocking and carbons ids modified accordingly'
                )
            }
        )
        it(
            'Handle unlocking while a carbon from the branches has been mutated to an hydrogen before',
            () => {
                let m = new Molecule()
                .brancher(8,5)
                .bounder([2,2,5,2], [4,2,2,1])
                .mutate([1,2,'H'])
                .bounder([3,2,4,1])
                .closer()
                .unlock()
                .display()
                .add([2,2,'B'])

                const links = m.atoms.map( a => a.toString() )
                assert.deepEqual(
                    links,
                    [ 
                        'Atom(C.1: C2)', 
                        'Atom(C.2: C1,C3,C11)', 
                        'Atom(C.3: C2,C4)', 
                        'Atom(C.4: C3,C5,C10)', 
                        'Atom(C.5: C4,C6)', 
                        'Atom(C.6: C5,C7)', 
                        'Atom(C.7: C6,C8)', 
                        'Atom(C.8: C7)', 
                        'Atom(C.9: C10,C12)', 
                        'Atom(C.10: C4,C9,C11,B13)', 
                        'Atom(C.11: C2,C10,C12)', 
                        'Atom(C.12: C9,C11)', 
                        'Atom(B.13: C10)' 
                    ],
                    'The carbone (1,2) mutated to hydrogen before has been removed when unlocking the molecule: it should have been removed from the branches structure too'
                )
            }
        )

        it(
            'Remove empty branches, after unlocking', () => {
                let m =  new Molecule()
                let f = () => m
                .brancher(1,5)
                .bounder([2,2,5,2], [4,2,1,1])
                .mutate([1,1,'H'])
                .closer()
                .unlock()
                .add([2,2,'P'])

                assert.throws(f, InvalidBond)
            }
        )
    }
)


describe(
    '60 random tests', () => {
        let m
        beforeEach( () => m = new Molecule() )

        it(
            'throws an InvalidBond', () => {
                m.brancher(2,2)
                .mutate([1,2,'S'])
                .addChaining(1,2,'O','Mg','C')

                const links = m.atoms.map(a => a.toString())
                assert.deepEqual(
                    links,
                    [ 
                        'Atom(C.1: C2)', 
                        'Atom(C.2: C1)', 
                        'Atom(S.3: C4,O5)', 
                        'Atom(C.4: S3)', 
                        'Atom(O.5: Mg6,S3)', 
                        'Atom(Mg.6: C7,O5)', 
                        'Atom(C.7: Mg6)' 
                    ]
                )
            }
        )
        it(
            'Ignores full atoms during hydration', () => {

                const fn1 = () => m.brancher(2,4).add([2,1,'P']).addChaining(2,1,'F','N')
                assert.throws(fn1, InvalidBond)

                const fn2 = () => m.closer().unlock().mutate([2,2,'H'])
                assert.throws(fn2, InvalidBond)

                const fn3 = () => m.mutate([1,2,'F']).addChaining(2,1,'Br','C')
                assert.throws(fn3, InvalidBond)

                m.brancher(2,3,5).closer()

                const links = m.atoms.map(a => a.toString())
                assert.deepEqual(
                    links,
                    [
                      'Atom(C.1: C2,H,H,H)',
                      'Atom(C.2: C1,P7,H,H)',
                      'Atom(F.3: C4)',
                      'Atom(C.4: C5,F3,H,H)',
                      'Atom(C.5: C4,C6,H,H)',
                      'Atom(C.6: C5,H,H,H)',
                      'Atom(P.7: C2,H,H)',
                      'Atom(C.8: C9,H,H,H)',
                      'Atom(C.9: C8,H,H,H)',
                      'Atom(C.10: C11,H,H,H)',
                      'Atom(C.11: C10,C12,H,H)',
                      'Atom(C.12: C11,H,H,H)',
                      'Atom(C.13: C14,H,H,H)',
                      'Atom(C.14: C13,C15,H,H)',
                      'Atom(C.15: C14,C16,H,H)',
                      'Atom(C.16: C15,C17,H,H)',
                      'Atom(C.17: C16,H,H,H)',
                      'Atom(H.18: C1)',
                      'Atom(H.19: C1)',
                      'Atom(H.20: C1)',
                      'Atom(H.21: C2)',
                      'Atom(H.22: C2)',
                      'Atom(H.23: C4)',
                      'Atom(H.24: C4)',
                      'Atom(H.25: C5)',
                      'Atom(H.26: C5)',
                      'Atom(H.27: C6)',
                      'Atom(H.28: C6)',
                      'Atom(H.29: C6)',
                      'Atom(H.30: P7)',
                      'Atom(H.31: P7)',
                      'Atom(H.32: C8)',
                      'Atom(H.33: C8)',
                      'Atom(H.34: C8)',
                      'Atom(H.35: C9)',
                      'Atom(H.36: C9)',
                      'Atom(H.37: C9)',
                      'Atom(H.38: C10)',
                      'Atom(H.39: C10)',
                      'Atom(H.40: C10)',
                      'Atom(H.41: C11)',
                      'Atom(H.42: C11)',
                      'Atom(H.43: C12)',
                      'Atom(H.44: C12)',
                      'Atom(H.45: C12)',
                      'Atom(H.46: C13)',
                      'Atom(H.47: C13)',
                      'Atom(H.48: C13)',
                      'Atom(H.49: C14)',
                      'Atom(H.50: C14)',
                      'Atom(H.51: C15)',
                      'Atom(H.52: C15)',
                      'Atom(H.53: C16)',
                      'Atom(H.54: C16)',
                      'Atom(H.55: C17)',
                      'Atom(H.56: C17)',
                      'Atom(H.57: C17)'
                    ]
                )
            }
        )

        it(
            'Is a mysterious bug', () => {

                const f1 = () => m
                .brancher(6,8,2)
                .add([1,1,'Cl'], [1,1,'Cl'])
                .closer()
                .unlock()
                .addChaining(1,1,'H','F','C')
                assert.throws(f1, InvalidBond)

                const f2 = () => m.brancher(1,7,3).addChaining(1,6,'Br','O')
                assert.throws(f2, InvalidBond)

                const f3 = () => m.addChaining(1,1,'S','H','P')
                assert.throws(f3, InvalidBond)

                const f4 = () => m.brancher(4).addChaining(1,3,'Cl','H')
                assert.throws(f4, InvalidBond)

                const f5 = () => m
                .bounder([2,7,7,2])
                .brancher(7)
                .add([5,8,'C'], [6,5,'S'])
                .addChaining(1,1,'O')
                .add([3,7,'B'], [5,8,'P'], [2,3,'H'], [4,7,'P'], [5,5,'Mg'], [4,7,'B'])
                .mutate([7,5,'P'],[6,5,'Mg'])
                assert.throws(f5, InvalidBond)

                m.mutate([1,4,'F']).bounder([1,4,3,1], [1,3,3,8], [2,3,6,5])

            }
        )

        it(
            'Can mutate same atom twice', () => {
                m.brancher(4).mutate([4,1,'Mg'], [4,1,'O'])
                const links = m.atoms.map(a=>a.toString())
                assert.deepEqual(
                    links,
                    [
                        'Atom(C.1: C2)',
                        'Atom(C.2: C1,C3)',
                        'Atom(C.3: C2,O4)',
                        'Atom(O.4: C3)'
                    ]
                )
            }
        )

        it(
            'handles properly double-linked atoms after closing and unlocking', () => {
                
                f = () => m
                .brancher(1,2,2)
                .add([1,3,'Br'],[2,3,'F'],[2,2,'S'])
                .mutate([2,3,'S'],[1,1,'S'])
                .bounder([1,1,1,2],[1,2,2,2],[1,1,1,1])
                assert.throws(f, InvalidBond)

                f2 = () => m.addChaining(1,1,'N','P').add([1,3,'C']).addChaining(1,1,'B')
                assert.throws(f2, InvalidBond)

                f3 = () => m.addChaining(1,1,'F')
                assert.throws(f3, InvalidBond)

                f4 = () => m.bounder([1,3,1,1])
                assert.throws(f4, InvalidBond)

                f5 = () => m.addChaining(1,1,'N','N')
                assert.throws(f5, InvalidBond)

                m.closer().unlock()

                const links = m.atoms.map(a=>a.toString())
                assert.deepEqual(
                    links,
                    [ 
                        'Atom(S.1: C2,N9)', 
                        'Atom(C.2: C3,C3,S1)', 
                        'Atom(C.3: C2,C2,S8)', 
                        'Atom(C.4: C11,Br6,S5)', 
                        'Atom(S.5: C4,F7)', 
                        'Atom(Br.6: C4)', 
                        'Atom(F.7: S5)', 
                        'Atom(S.8: C3)', 
                        'Atom(N.9: P10,S1)', 
                        'Atom(P.10: N9)', 
                        'Atom(C.11: C4)' 
                    ]
                )
            }
        )

        it(
            'Does a mysterious thing', () => {
                m.brancher(2)
                .mutate([2,1,'P'],[2,1,'N'],[2,1,'F'])
                .brancher(9,2,7)
                .bounder([3,4,7,4],[1,1,2,3],[2,3,3,2])
                .add([2,2,'B'],[3,4,'F'],[4,2,'O'])
                .bounder([6,2,1,3],[5,4,7,4],[3,2,1,2],[1,1,2,4],[4,2,1,2])
                .brancher(1,8,1)
                .addChaining(1,5,'B')
                .closer().unlock()
                .bounder([4,4,1,3],[1,7,1,5],[1,5,9,2])

                const links = m.atoms.map(a => a.toString())
                assert.deepEqual(
                    links,
                    [ 
                        'Atom(C.1: C13,C15,F2)', 
                        'Atom(F.2: C1)', 
                        'Atom(C.3: C4,C5,C6)', 
                        'Atom(C.4: C3,C5,B21)', 
                        'Atom(C.5: C3,C4,C6,C13)', 
                        'Atom(C.6: C3,C5,C7,O23)', 
                        'Atom(C.7: C6,C8)', 
                        'Atom(C.8: C7,C9,C12)', 
                        'Atom(C.9: C8,C10)', 
                        'Atom(C.10: C9,C11)', 
                        'Atom(C.11: C10,C24)', 
                        'Atom(C.12: C8,C13,C17)', 
                        'Atom(C.13: C1,C5,C12)', 
                        'Atom(C.14: C15)', 
                        'Atom(C.15: C1,C14,C16)', 
                        'Atom(C.16: C15,C17,C20,F22)', 
                        'Atom(C.17: C12,C16,C18)', 
                        'Atom(C.18: C17,C19,C20)', 
                        'Atom(C.19: C18,C20)', 
                        'Atom(C.20: C16,C18,C19)', 
                        'Atom(B.21: C4)', 
                        'Atom(F.22: C16)', 
                        'Atom(O.23: C6)', 
                        'Atom(C.24: C11,C33,B34)', 
                        'Atom(C.25: C26)', 
                        'Atom(C.26: C25,C27)', 
                        'Atom(C.27: C26,C28)', 
                        'Atom(C.28: C27,C29)', 
                        'Atom(C.29: C28,C30)', 
                        'Atom(C.30: C29,C31)', 
                        'Atom(C.31: C30,C32)', 
                        'Atom(C.32: C31)', 
                        'Atom(C.33: C24)', 
                        'Atom(B.34: C24)' 
                    ]
                )
            }
        )
    }
)