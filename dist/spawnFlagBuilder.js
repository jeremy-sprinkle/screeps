var flagBuilder = {
    run: function (flagPos, rv, sv, cv) {

        var fbParts = [MOVE, CARRY, WORK]
        var cost = BODYPART_COST.move + BODYPART_COST.carry + BODYPART_COST.work
        var fbName = 'FB'
        var AddParts = [MOVE, CARRY, WORK]
        var AddCost = BODYPART_COST.move + BODYPART_COST.carry + BODYPART_COST.work
        var workParts = Math.floor((rv.currentRoom.energyCapacityAvailable - 51) / AddCost)
        if(workParts>4){
            workParts=4
        }
        for (var parts = 0; parts < workParts; parts++) {
            fbParts = fbParts.concat(AddParts)
            cost += AddCost
        }

        var spawn1 = Game.spawns['Spawn1']
        var ts = Game.time.toString().slice(5)
        if (!spawn1.spawning) {
            console.log('Adding new flag builder to spawn queue: '+ "(Spawn Energy: " + rv.roomEnergy + ", Required Energy: " + cost + ")");
            spawn1.spawnCreep(fbParts, fbName + ts,
                {
                    memory: {
                        role: 'flagbuilder',
                        targetX: flagPos.x,
                        targetY: flagPos.y,
                        targetRoom: flagPos.roomName,
                    }
                });
        }
    }
}

module.exports = flagBuilder;