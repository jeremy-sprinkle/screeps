var path = require('funcMoveCreep')
var roleFlagAttacker = {
    run: function (creep) {
        var cpuStart = Game.cpu.getUsed()
        var flagPos = new RoomPosition(creep.memory.targetX, creep.memory.targetY, creep.memory.targetRoom)
        if (creep.room.name == creep.memory.targetRoom) {
            var targets = creep.room.lookForAt(LOOK_STRUCTURES, flagPos)
            if (targets.length > 0 && creep.rangedAttack(targets[0]) == ERR_NOT_IN_RANGE) {
                //console.log(creep.name+ " moving to shoot:" +targets[0])
                path(creep, targets)
            }
            if (targets.length == 0) {
                var newTargets = creep.room.find(FIND_HOSTILE_STRUCTURES)
                if (newTargets.length > 0 && creep.rangedAttack(targets[0]) == ERR_NOT_IN_RANGE) {
                    //console.log(creep.name+ " moving to shoot:" +targets[0])
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