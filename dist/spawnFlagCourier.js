var spawnFlagCourier = {
    run: function (flagPos, rv, sv, cv) {

        var parts = [MOVE, CARRY, WORK]
        var cost = BODYPART_COST.move + BODYPART_COST.carry + BODYPART_COST.work
        var name = 'FC'
        var addParts = [MOVE, CARRY, WORK]
        var addCost = BODYPART_COST.move + BODYPART_COST.carry + BODYPART_COST.work

        var affordableParts = Math.floor((rv.currentRoom.energyCapacityAvailable - cost) / addCost)

        if (affordableParts > 2) {
            affordableParts = 2
        }
        for (var p = 0; p < affordableParts; p++) {
            parts = parts.concat(addParts)
            cost += addCost
        }
        var spawn1 = Game.spawns['Spawn1']

        if (!spawn1.spawning) {
            console.log('Adding new flag courier to spawn queue: ' + "(Spawn Energy: " + rv.roomEnergy + ", Required Energy: " + cost + ")");
            spawn1.spawnCreep(parts, name + rv.ts,
                {
                    memory: {
                        role: 'flagcourier',
                        targetX: flagPos.x,
                        targetY: flagPos.y,
                        targetRoom: flagPos.roomName,
                    }
                });
        }
    }
}

module.exports = spawnFlagCourier;