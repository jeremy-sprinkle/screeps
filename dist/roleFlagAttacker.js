var path = require('funcMoveCreep')
var roleFlagAttacker = {
    run: function (creep) {
        var cpuStart = Game.cpu.getUsed()
        var flagPos = new RoomPosition(creep.memory.targetX, creep.memory.targetY, creep.memory.targetRoom)

        var nearbyEnemies = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 15)
        if (nearbyEnemies.length > 0) {
            if (_.filter(global.alerts, (alert) => alert.room == creep.room.name).length == 0) {
                global.alerts.push({"room": creep.room.name, "timer": nearbyEnemies[0].ticksToLive, "time":Game.time})
            }
            console.log(creep.moveTo(Game.spawns['Spawn1']))
            return;
        }


        if (creep.room.name == creep.memory.targetRoom) {
            var targets = creep.room.lookForAt(LOOK_STRUCTURES, flagPos)
            if (targets.length > 0 && creep.dismantle(targets[0]) == ERR_NOT_IN_RANGE) {
                //console.log(creep.name+ " moving to dismantle:" +targets[0])
                path(creep, targets)
            }
            if (targets.length == 0) {
                var newTargets = creep.room.find(FIND_HOSTILE_STRUCTURES)
                if (newTargets.length > 0 && creep.dismantle(targets[0]) == ERR_NOT_IN_RANGE) {
                    //console.log(creep.name+ " moving to dismantle:" +targets[0])
                    path(creep, targets)
                }
            }
        } else {
            //do move
            //console.log(creep.name+ " moving to attack at: "+flagPos)
            creep.moveTo(flagPos)
        }
        var cpuEnd = Game.cpu.getUsed()
        //console.log("roleFlagAttacker used "+Math.floor(cpuEnd-cpuStart)+" CPU")
    }
}

module.exports = roleFlagAttacker;