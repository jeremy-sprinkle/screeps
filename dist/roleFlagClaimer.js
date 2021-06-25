var path = require('funcMoveCreep')
var roleFlagClaimer = {
    run: function(creep) {
        var cpuStart = Game.cpu.getUsed()
        var flagPos = new RoomPosition(creep.memory.targetX,creep.memory.targetY,creep.memory.targetRoom)
        if(creep.room.name == creep.memory.targetRoom){
            var targets = creep.room.lookForAt(LOOK_STRUCTURES,flagPos)
            if(targets.length > 0 && creep.claimController(targets[0]) == ERR_NOT_IN_RANGE){
                console.log(creep.name+ " moving to claim:" +targets[0])
                path(creep, targets)
            }
        } else {
            console.log(creep.name+ " moving to claim at: "+flagPos)
            creep.moveTo(flagPos)
        }
        var cpuEnd = Game.cpu.getUsed()
        //console.log("roleFlagClaimer used "+Math.floor(cpuEnd-cpuStart)+" CPU")
    }
}

module.exports = roleFlagClaimer;