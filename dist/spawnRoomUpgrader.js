var spawnRoomUpgrader = {
    run: function (rv, cv, sv) {
        var spawn1 = Game.spawns['Spawn1']
        var uParts = [MOVE, CARRY]
        var cost = BODYPART_COST.move + BODYPART_COST.carry
        var workParts = Math.floor((rv.currentRoom.energyCapacityAvailable - 51) / BODYPART_COST.work)
        for (var parts = 0; parts < workParts; parts++) {
            uParts.push(WORK)
            cost += BODYPART_COST.work
        }
        if (cv.upgraders.length < cv.uMax && !spawn1.spawning && cv.harvesters.length == cv.hMax) {
            console.log('Spawning new upgrader: ' + "U+" + rv.ts + " (SpawnEnergy: "+spawn1.store.getUsedCapacity(RESOURCE_ENERGY)+" Cost: " + cost + ")");
            spawn1.spawnCreep(uParts, "U+" + rv.ts,
                {
                    memory: {
                        role: 'upgrader',
                        workroom: rv.roomName
                    }
                })
        }
    }
}

module.exports = spawnRoomUpgrader;