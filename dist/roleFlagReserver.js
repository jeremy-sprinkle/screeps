var path = require('funcMoveCreep')
var log = require('funcLogging')
var roleFlagReserver = {
    run: function (creep) {
        var cpu = global.logging.cpu
        var c = global.logging.roles
        var cpuStart = Game.cpu.getUsed()

        var nearbyEnemies = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 10)
        if (nearbyEnemies.length > 0) {
            if (_.filter(global.alerts, (alert) => alert.room == creep.room.name).length == 0) {
                global.alerts.push({"room": creep.room.name, "timer": nearbyEnemies[0].ticksToLive, "time":Game.time})
            }
            log(c,creep.name + " fleeing to Spawn1")
            creep.moveTo(Game.spawns['Spawn1'])
            return;
        }

        var flagPos = new RoomPosition(creep.memory.targetX, creep.memory.targetY, creep.memory.targetRoom)
        if (creep.room.name == creep.memory.targetRoom) {
            var targets = creep.room.lookForAt(LOOK_STRUCTURES, flagPos)
            if (targets.length > 0 && creep.reserveController(targets[0]) == ERR_NOT_IN_RANGE) {
                log(c, creep.name + " moving to reserve:" + targets[0])
                path(creep, targets)
            }
        } else if (_.filter(global.alerts, (alert) => alert.room == flagPos.roomName).length == 0) {
            log(c, creep.name + " moving to reserve at: " + flagPos)
            creep.moveTo(flagPos)
        } else {
            log(c, creep.moveTo(Game.spawns['Spawn1']))
         /*   creep.memory.idle += 1
            log(c, creep.name + " is bored and wants to die.")
            if (creep.memory.idle >= 30 && Game.spawns['Spawn1'].recycleCreep(creep) == ERR_NOT_IN_RANGE) {
                path(creep, spawn1)
            }*/
        }
        var cpuEnd = Game.cpu.getUsed()
        log(cpu, creep.name + " is using " + (cpuEnd - cpuStart).toString().substring(0, 5) + " CPU.")
    }
}

module.exports = roleFlagReserver;