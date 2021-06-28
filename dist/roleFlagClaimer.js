var path = require('funcMoveCreep')
var log = require('funcLogging')
var roleFlagClaimer = {
    run: function (creep) {
        var c = global.logging.roles
        var cpu = global.logging.cpu
        var cpuStart = Game.cpu.getUsed()

        var nearbyEnemies = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 10)
        var knownEnemies = Game.memory.knownEnemies
        if (nearbyEnemies.length > 0) {
            var knownEnemies = Game.memory.knownEnemies
            if (_.filter(knownEnemies, (enemy) => enemy.id == nearbyEnemies[0].id).length > 0) {

            }
            console.log(creep.moveTo(Game.spawns['Spawn1']))
            return;
        }

        var flagPos = new RoomPosition(creep.memory.targetX, creep.memory.targetY, creep.memory.targetRoom)
        if (creep.room.name == creep.memory.targetRoom) {
            var targets = creep.room.lookForAt(LOOK_STRUCTURES, flagPos)
            if (targets.length > 0 && creep.attackController(targets[0]) != ERR_INVALID_ARGS) {
                log(c, creep.name + " moving to attack:" + targets[0])
                path(creep, targets)
            } else if (targets.length > 0 && creep.claimController(targets[0]) == ERR_NOT_IN_RANGE) {
                log(c, creep.name + " moving to claim:" + targets[0])
                path(creep, targets)
            }
        } else if (_.filter(global.alerts, (alert) => alert.room.name == flagPos.roomName).length == 0) {
            log(c, creep.name + " moving to claim at: " + flagPos)
            creep.moveTo(flagPos)
        }
        var cpuEnd = Game.cpu.getUsed()
        log(cpu, creep.name + " is using " + (cpuEnd - cpuStart).toString().substring(0, 5) + " CPU.")
    }
}

module.exports = roleFlagClaimer;