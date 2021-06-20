var roleRampartRepair = {

    /** @param {Creep} creep **/
    run: function(creep,ramparts) {
        var spawn1 = Game.spawns['Spawn1']
        
        if(creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.repairing = false;
            creep.say('🔄 fetching');
	    }
	    if(!creep.memory.repairing && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
	        creep.memory.repairing = true;
	        creep.say('⚡ repair');
	    }

	    if(creep.memory.repairing) {
            if(creep.repair(ramparts[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(ramparts[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
           var targets = _.filter(creep.room.find(FIND_STRUCTURES), (structure) => structure.structureType == 'container' && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 50);
            var dropped = creep.room.find(FIND_DROPPED_RESOURCES)
            var energyDif = creep.room.energyCapacityAvailable - creep.room.energyAvailable

            if(energyDif < 48){

                if(creep.withdraw(spawn1, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(spawn1, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            } else if(dropped.length > 0){
                if(creep.pickup(dropped[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(dropped[0], {visualizePathStyle: {stroke: '#ffaa00'}})
                }
            } else if(targets.length > 0){
                if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                 }
            }   else {
                creep.say('IDLE')
            }
           
            
          /*  var hostileStructures = creep.room.find(FIND_HOSTILE_STRUCTURES);
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
                    console.log("No available spots at Source: "+sources[i].id)
                    continue;
                } else if(creep.harvest(sources[i]) == ERR_NOT_IN_RANGE && spawn1.store.getUsedCapacity(RESOURCE_ENERGY) < 200) {
                    creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                }    
            
            }*/
        }
	}
};

module.exports = roleRampartRepair;