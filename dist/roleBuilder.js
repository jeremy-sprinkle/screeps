var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep,rcl) {
        
        if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
  	    }
	    if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
            Game.spawns['Spawn1'].memory.withdrawQueue.pop(creep)
	        creep.memory.building = true;
	    }

	    if(creep.memory.building) {
	        var targets = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if(targets) {
                if(creep.build(targets) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                creep.say('IDLE')
            }
	    }
	    else {
	         var targets = _.filter(creep.room.find(FIND_STRUCTURES), (structure) => structure.structureType == 'container' && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 50);
            var dropped = creep.room.find(FIND_DROPPED_RESOURCES)
            var energyDif = creep.room.energyCapacityAvailable - creep.room.energyAvailable
            var spawn1 = Game.spawns['Spawn1']
            if(energyDif == 0){
                var creepInQueue = _.filter(Game.spawns['Spawn1'].memory.withdrawQueue, (c) => c == creep)
                if(!creepInQueue.length){
                    Game.spawns['Spawn1'].memory.withdrawQueue.push(creep)
                }
                if(Game.spawns['Spawn1'].memory.withdrawQueue[0] == creep){
                    creep.say('takespawn')
                    if(creep.withdraw(spawn1, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(spawn1, {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                }
            }else if(dropped.length > 0){
                if(creep.pickup(dropped[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(dropped[0], {visualizePathStyle: {stroke: '#ffaa00'}})
                }
            } else if(targets.length > 0){
                    if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
            }  else {
                creep.memory.idle += 1
                if(creep.memory.idle >= 15 && creep.room.find(FIND_MY_SPAWNS)[0].recycleCreep(creep) == ERR_NOT_IN_RANGE){
                    creep.moveTo(creep.room.find(FIND_MY_SPAWNS)[0])
                }
            }

	        /*var hostileStructures = creep.room.find(FIND_HOSTILE_STRUCTURES);
            var sources = creep.room.find(FIND_SOURCES);
            for(var i in sources){
                if(hostileStructures.length > 0 && sources[i].pos.getRangeTo(hostileStructures[0].pos) < 10) {
                            //console.log("Ignoring Source: "+sources[i].id+" Due To Hostile Presence");
                            continue;
                        }
                var fields = creep.room.lookForAtArea(LOOK_TERRAIN, sources[i].pos.y-1, sources[i].pos.x-1, sources[i].pos.y+1, sources[i].pos.x+1, true);
                var occupied = creep.room.lookForAtArea(LOOK_CREEPS, sources[i].pos.y-1, sources[i].pos.x-1, sources[i].pos.y+1, sources[i].pos.x+1, true);
                var accessibleFields = 9-_.countBy( fields , "terrain" ).wall;
                var spots = accessibleFields - occupied.length
                //console.log("Source: "+sources[i].id+" has: " + (accessibleFields-occupied.length) +" of "+accessibleFields+" available.")
                if(spots == 0 && sources[i].pos.getRangeTo(creep.pos)>1){
                    console.log(creep.name+ " Sees no available spots at Source: "+sources[i].id)
                    continue;
                } else if(creep.harvest(sources[i]) == ERR_NOT_IN_RANGE && spawn1.store.getUsedCapacity(RESOURCE_ENERGY) < 200) {
                    creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                }

            }*/


	    }
	}
};

module.exports = roleBuilder;