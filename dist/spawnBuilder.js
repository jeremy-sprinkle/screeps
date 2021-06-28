var spawnBuilder = {
    run: function (rv, cv, sv) {
        var spawn1 = sv.spawns[0]
        var bParts = [MOVE, CARRY, WORK], addParts = [WORK, CARRY, MOVE]
        var cost = BODYPART_COST.move + BODYPART_COST.carry + BODYPART_COST.work,
            addCost = BODYPART_COST.move + BODYPART_COST.carry + BODYPART_COST.work

        var workParts = Math.floor((rv.currentRoom.energyCapacityAvailable - cost) / addCost)

        if (workParts > 4) {
            workParts = 4
        }

        for (var parts = 0; parts < workParts; parts++) {
            bParts = bParts.concat(addParts)
            cost += addCost
        }


        if (cv.builders.length < cv.bMax && !spawn1.spawning && cv.harvesters.length == cv.hMax) {
            var newName = 'B-' + rv.ts;
            console.log('Spawning new builder: ' + newName + " (Cost: " + cost + ")");
            spawn1.spawnCreep(bParts, newName,
                {
                    memory: {
                        role: 'builder',
                        workroom: rv.roomName
                    }
                });
        }
    }
}

module.exports = spawnBuilder;

