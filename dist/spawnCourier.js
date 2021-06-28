var spawnCourier = {
    run: function (rv, cv, sv) {

        var spawn1 = sv.spawns[0]
        var cParts = [MOVE, CARRY, CARRY]
        var addParts = [MOVE, CARRY, CARRY]
        var cost = BODYPART_COST.move + BODYPART_COST.carry * 2
        var addCost = BODYPART_COST.move + BODYPART_COST.carry * 2
        var workParts = Math.floor((rv.currentRoom.energyAvailable / 2) - cost / addCost)
        if (workParts > 5) {
            workParts = 5
        }
        for (var parts = 0; parts < workParts; parts++) {
            cParts = cParts.concat([MOVE, CARRY, CARRY])
            cost += (BODYPART_COST.carry + BODYPART_COST.carry + BODYPART_COST.move)
        }

        if (cv.couriers.length < cv.cMax && !spawn1.spawning && cv.harvesters.length >= 1) {
            var newName = 'C1-' + rv.ts;
            console.log('Spawning new courier: ' + newName + " (Cost: " + cost + ")");
            spawn1.spawnCreep(cParts, newName,
                {
                    memory: {
                        role: 'courier',
                        workroom: rv.roomName
                    }
                });
        }
    }
}

module.exports = spawnCourier;