var roleCourier = {

    /** @param {Creep} creep **/
    run: function(creep,rcl) {



        //take energy from containers with memory.source
        //place energy in extensions before spawn
        //if spawn full, place energy in containers with memory.stockpile
        
        var nearbyEnemies = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 10)
        var nearbyTowers = creep.room.find(FIND_STRUCTURES, (structures) => structures.structureType == 'tower')
        if(nearbyEnemies.length > 0) {
            if(nearbyTowers.length){
                console.log("Creep: "+creep.name+" fleeing to "+nearbyTowers[0].id)
                creep.moveTo(nearbyTowers[0], {visualizePathStyle: {stroke: '#ffffff'}})
            } else {
                console.log("Creep: "+creep.name+" fleeing to Spawn1")
                creep.moveTo(Game.spawns['Spawn1'], {visualizePathStyle: {stroke: '#ffffff'}})
            }
            
        }
      

        if(creep.memory.delivering && creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
            creep.memory.delivering = false;
	    }
	    if(!creep.memory.delivering && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
	        creep.memory.delivering = true;
	    }

	    if(creep.memory.delivering) {
	        var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER) && 
                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
            });
            if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }
        
        } else {
            var targets = _.filter(creep.room.find(FIND_STRUCTURES), (structure) => structure.structureType == 'container' && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 50);
            var dropped = creep.room.find(FIND_DROPPED_RESOURCES)
            if(dropped.length > 0){
                if(creep.pickup(dropped[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(dropped[0], {visualizePathStyle: {stroke: '#ffaa00'}})
                }
            } else if(targets.length > 0){
                if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                 }
            } else {
                
                creep.say('IDLE')
            }
            
        }
        
    }
        
};

module.exports = roleCourier;