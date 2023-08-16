const { Molecule, InvalidBond, LockedMolecule, UnlockedMolecule, EmptyMolecule, InvalidInput } = require('../molecule2.js')
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
    '60 random tests',
    it(
        'Invalid addChaining command is ignored',
        () => {

            let m = new Molecule()
            const f = () => m
            .brancher(1,8)
            .addChaining(1,2,'S','Br', 'Cl')
            .add([6,2,'Mg'], [4,2,'O'], [1,1,'C'])
            .addChaining([6,2,'Br','B'])
            .mutate([7,2,'S'], [1,1,'H'])

            assert.throws(f, InvalidBond)
            const links = m.atoms.map( a => a.toString() )
            assert.deepEqual(
                links,
                [ 
                    'Atom(C.2: C3)', 
                    'Atom(C.3: C2,C4)', 
                    'Atom(C.4: C3,C5)', 
                    'Atom(C.5: C4,C6,O11)', 
                    'Atom(C.6: C5,C7)', 
                    'Atom(C.7: C6,Mg10,S8)', 
                    'Atom(S.8: C7,C9)', 
                    'Atom(C.9: S8)', 
                    'Atom(Mg.10: C7)', 
                    'Atom(O.11: C5)', 
                    'Atom(C.12: H)' 
                ]
            )
        }
    )
)



