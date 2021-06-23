var spawnMilitaryBuilder = {
    run: function (rv, cv, sv) {
        var spawn1 = Game.spawns['Spawn1']
        if (cv.rampartRepairers.length < cv.rrMax && sv.damagedRamparts.length && !spawn1.spawning) {
            var newName = 'RR1-' + rv.ts;
            console.log('Spawning new rampart repairer: ' + newName);
            spawn1.spawnCreep([MOVE, CARRY, WORK], newName,
                {
                    memory: {
                        role: 'rampartrepair',
                        workroom: rv.roomName
                    }
                });
        }
    }
}

module.exports = spawnMilitaryBuilder;