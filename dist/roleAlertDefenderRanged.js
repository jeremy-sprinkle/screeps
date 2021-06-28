var path = require('funcMoveCreep');
var log = require('funcLogging')

var alertDefenderRanged = {
    run: function (creep) {
        var c = global.logging.roles

        var spawn1 = Game.spawns['Spawn1']
        var cpuStart = Game.cpu.getUsed()

        var nearbyEnemies = creep.room.find(FIND_HOSTILE_CREEPS)
        var flagPos = new RoomPosition(creep.memory.targetX, creep.memory.targetY, creep.memory.targetRoom)
        if (creep.room.name == creep.memory.targetRoom) {
            if (nearbyEnemies.length > 0) {
                log(c, creep.name + " spotted enemies: " +nearbyEnemies[0])
                log(c,creep.name + " attempting to shoot creep: "+creep.rangedAttack(nearbyEnemies[0]))
                if (creep.rangedAttack(nearbyEnemies[0] == ERR_NOT_IN_RANGE)) {
                    log(c, creep.name + " moving to engage.")
                    path(creep, nearbyEnemies)
                }
                if(creep.pos.getRangeTo(nearbyEnemies[0])<3){
                    log(c, creep.name+" too close to enemy, moving away.")
                    creep.moveTo(nearbyEnemies[0], {flee:true})
                }

            } else {
                global.alerts.splice[creep.memory.targetRoom - 1, creep.memory.targetRoom]
                path(creep, spawn1)
                log(c, creep.name + " moving to spawn.")
            }
        } else {
            log(c, creep.name + " moving to alert room.")

            var alerts = _.filter(global.alerts, (alert) => alert.room == flagPos.roomName)

            if (nearbyEnemies.length > 0) {
                log(c, creep.name + " spotted enemies: " +nearbyEnemies[0])
                log(c,creep.name + " moving attempting to shoot creep: "+rangedAttack(nearbyEnemies[0]))
                if (creep.rangedAttack(nearbyEnemies[0] == ERR_NOT_IN_RANGE)) {
                    log(c, creep.name + " moving to engage.")
                    path(creep, nearbyEnemies)
                }

            } else if (alerts.length > 0) {
                creep.moveTo(flagPos, {visualizePathStyle: {stroke: "#ffffff", opacity: 1, lineStyle: "dotted"}})
                //console.log(creep.name+ " moving to: "+flagPos+": "+creep.moveTo(flagPos, {visualizePathStyle: {stroke: "#ffffff", opacity: 1, lineStyle: "dotted"}}))
            } else {
                path(creep, spawn1)
                log(c, creep.name + " moving to spawn.")
            }

        }


        var cpuEnd = Game.cpu.getUsed()
        //console.log("CPU used by roleFlagHarvester - Reset: "+Math.floor(cpuEnd-cpu4))
    }
}

module.exports = alertDefenderRanged;