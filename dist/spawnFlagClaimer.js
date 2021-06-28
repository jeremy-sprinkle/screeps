var flagClaimer = {
    run: function (flagPos, rv, sv, cv) {

        var fcParts = [MOVE, CLAIM]
        var cost = BODYPART_COST.move + BODYPART_COST.claim
        var fcName = 'FC'

        var spawn1 = Game.spawns['Spawn1']
        var ts = Game.time.toString().slice(5)
        if (!spawn1.spawning) {
            console.log('Adding new flag claimer to spawn queue: ' + "(Spawn Energy: " + rv.roomEnergy + ", Required Energy: " + cost + ")");
            spawn1.spawnCreep(fcParts, fcName + ts,
                {
                    memory: {
                        role: 'flagclaimer',
                        targetX: flagPos.x,
                        targetY: flagPos.y,
                        targetRoom: flagPos.roomName,
                    }
                });
        }
    }
}

module.exports = flagClaimer;