var path = require('funcMoveCreep')
var roleFlagBuilder = {
    run: function(creep) {
        var cpuStart = Game.cpu.getUsed()

        if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            //console.log(creep.name+" should fetch energy now.")
            creep.memory.building = false;

        }
        if (!creep.memory.building && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            //console.log(creep.name+" should build target now.")
            creep.memory.building = true;
        }

        var flagPos = new RoomPosition(creep.memory.targetX,creep.memory.targetY,creep.memory.targetRoom)

        if(creep.room.name == creep.memory.targetRoom){

            //console.log(creep.name+ " is in target room!")
            //console.log(creep.name+ " building: "+ creep.memory.building)

            if(creep.memory.building){
                console.log(creep.name + " building!")
                var targets = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES,flagPos)
                console.log(creep.name+ " found target: " + targets)
                if(targets){
                    let build = creep.build(targets[0])
                    if(build == ERR_NOT_IN_RANGE){
                        //console.log(creep.name+ " moving to build:" +targets[0])
                        path(creep, targets)
                    }
                }
                 else {
                    console.log(creep.name+ " doing nuffin' mate, supposed to be buildin' but I just don't wanna.")
                }

            } else {
                //console.log(creep.name + " harvesting!")
                var target = creep.pos.findClosestByPath(FIND_SOURCES)
                if (target){
                    let harvest = creep.harvest(target)
                    if(harvest == ERR_NOT_IN_RANGE){
                        //console.log(creep.name+ " moving to harvest:" +target)
                        path(creep, target)
                    }
                } else {
                    console.log(creep.name+ " doing nuffin' mate, supposed to be harvestin' but I just don't wanna.")
                }
            }
        } else {
            //console.log(creep.name+ " moving to build at: "+flagPos)
            creep.moveTo(flagPos)
        }

        var cpuEnd = Game.cpu.getUsed()
        //console.log("roleFlagBuilder used "+Math.floor(cpuEnd-cpuStart)+" CPU")
    }
}

module.exports = roleFlagBuilder;