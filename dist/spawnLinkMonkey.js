var log = require('funcLogging');

var spawnLinkMonkey = {
    run: function (rv, cv, sv) {
        var s = global.logging.spawns
        var cpu = global.logging.cpu
        var cpuStart = Game.cpu.getUsed()

        if (cv.linkMonkeys.length > 0) {
            log(s, "Link Monkey Active:" + rv.currentRoom + ":" + cv.linkMonkeys);
            return;

        } else if (cv.linkMonkeys.length < cv.lmMax && sv.storage) {

            var body = [MOVE, CARRY, CARRY, CARRY]
            var cost = BODYPART_COST.move + BODYPART_COST.carry * 3
            var name = 'M' + rv.ts

            var spawn1 = sv.spawns[0]

            if (!spawn1.spawning
                && rv.currentRoom.energyAvailable >= cost) {
                console.log('Spawning new link monkey: ' + name);
                spawn1.spawnCreep(body, name,
                    {
                        memory: {
                            role: 'linkmonkey',
                            workroom: rv.currentRoom.name
                        }
                    });
            } else {
                console.log("Spawning Link Monkey Failing (Spawn Energy: " + rv.currentRoom.energyAvailable + ", Required Energy: " + cost + ")")
            }
        }

    }
}

module.exports = spawnLinkMonkey;