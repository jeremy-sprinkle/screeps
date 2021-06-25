var spawnBuilder = {
    run: function (rv, cv, sv) {
        var spawn1 = sv.spawns[0]
        var bParts = [MOVE, CARRY]
        var cost = BODYPART_COST.move + BODYPART_COST.carry
        var workParts = Math.floor((rv.currentRoom.energyCapacityAvailable - 101) / (BODYPART_COST.work*2+BODYPART_COST.move))
        for (var parts = 0; parts < workParts; parts++) {
            bParts = bParts.concat([WORK,WORK,MOVE])
            cost += BODYPART_COST.work*2 + BODYPART_COST.move
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

