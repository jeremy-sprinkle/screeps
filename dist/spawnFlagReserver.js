var log = require('funcLogging')

var flagReserver = {
    run: function (flagPos, rv, sv, cv) {

        var frParts = [MOVE, MOVE, CLAIM, CLAIM]
        var cost = BODYPART_COST.move * 2 + BODYPART_COST.claim * 2
        var frName = 'FR'

        var spawn1 = Game.spawns['Spawn1']
        var ts = Game.time.toString().slice(5)
        if (!spawn1.spawning) {
            console.log('Adding new flag reserver to spawn queue: ' + "(Spawn Energy: " + rv.roomEnergy + ", Required Energy: " + cost + ")");
            spawn1.spawnCreep(frParts, frName + ts,
                {
                    memory: {
                        role: 'flagreserver',
                        targetX: flagPos.x,
                        targetY: flagPos.y,
                        targetRoom: flagPos.roomName,
                    }
                });
        }
    }
}

module.exports = flagReserver;