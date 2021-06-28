var log = require('funcLogging');

var spawnRoomUpgrader = {
    run: function (rv, cv, sv) {
        var spawn1 = sv.spawns[0]

        if (sv.links.length < 2) {
            var uParts = [MOVE, CARRY, WORK], addParts = [MOVE, CARRY, WORK]
            var cost = BODYPART_COST.move + BODYPART_COST.carry + BODYPART_COST.work,
                addCost = BODYPART_COST.move + BODYPART_COST.carry + BODYPART_COST.work
            var workParts = Math.floor((rv.currentRoom.energyCapacityAvailable - cost) / addCost)
            for (var parts = 0; parts < workParts; parts++) {
                uParts = uParts.concat(addParts)
                cost += addCost
            }
        }
        if (sv.links.length == 2) {
            var uParts = [MOVE, CARRY, WORK], addParts = [WORK, WORK]
            var cost = BODYPART_COST.move + BODYPART_COST.carry + BODYPART_COST.work, addCost = BODYPART_COST.work * 2
            var workParts = Math.floor((rv.currentRoom.energyCapacityAvailable - cost) / addCost)
            if (workParts > 4) {
                workParts = 4
            }
            for (var parts = 0; parts < workParts; parts++) {
                uParts = uParts.concat(addParts)
                cost += addCost
            }
        }

        if (cv.upgraders.length < cv.uMax && !spawn1.spawning && cv.harvesters.length == cv.hMax) {
            console.log('Spawning new upgrader: ' + "U" + rv.ts + " (SpawnEnergy: " + rv.roomEnergy + " Cost: " + cost + ")");
            spawn1.spawnCreep(uParts, "U" + rv.ts,
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