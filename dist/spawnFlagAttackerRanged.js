var spawnFlagAttacker = {
    run: function (flagPos, rv) {
        var faParts = [MOVE, RANGED_ATTACK]
        var cost = BODYPART_COST.move + BODYPART_COST.ranged_attack
        var faName = 'FA'
        var faAddParts = [MOVE, RANGED_ATTACK]
        var addCost = BODYPART_COST.move + BODYPART_COST.ranged_attack
        //scale when working
        var affordableParts = Math.floor((rv.currentRoom.energyCapacityAvailable - cost) / addCost)

        for (var parts = 0; parts < affordableParts; parts++) {
            faParts = faParts.concat(faAddParts)
            cost += addCost
        }
        var spawn1 = Game.spawns['Spawn1']
        var ts = Game.time.toString().slice(5)
        if (!spawn1.spawning) {
            console.log('Spawning new flag ranged attacker: ' + faName + ts + "(Spawn Energy: " + rv.roomEnergy + ", Required Energy: " + cost + ")");
            spawn1.spawnCreep(faParts, faName + ts,
                {
                    memory: {
                        role: 'flagrangedattacker',
                        targetX: flagPos.x,
                        targetY: flagPos.y,
                        targetRoom: flagPos.roomName
                    }
                });
        }
    }
}

module.exports = spawnFlagAttacker;