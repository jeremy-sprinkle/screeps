var spawnAlertDefenderRanged = {
    run: function (alertRoom, rv) {
        var parts = [MOVE, RANGED_ATTACK, RANGED_ATTACK]
        var cost = BODYPART_COST.move + BODYPART_COST.ranged_attack * 2
        var name = 'AD'
   /*     var addParts = [MOVE, RANGED_ATTACK, RANGED_ATTACK]
        var addCost = BODYPART_COST.move + BODYPART_COST.ranged_attack * 2
        //scale when working
        var affordableParts = Math.floor((rv.currentRoom.energyCapacityAvailable - cost) / addCost)

        for (var p = 0; p < affordableParts; p++) {
            parts = parts.concat(addParts)
            cost += addCost
        }*/

        var spawn1 = Game.spawns['Spawn1']
        var ts = Game.time.toString().slice(5)
        if (!spawn1.spawning) {
            console.log("Spawning new alert defender ranged: (Spawn Energy: " + rv.roomEnergy + ", Required Energy: " + cost + ")");
            spawn1.spawnCreep(parts, name + ts,
                {
                    memory: {
                        role: 'alertdefender',
                        targetRoom: alertRoom
                    }
                });
        }
    }
}

module.exports = spawnAlertDefenderRanged;