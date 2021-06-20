var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep,rcl) {
        var source = Game.getObjectById(creep.memory.target);
        if(creep.store.getFreeCapacity() > 0 && creep.memory.harvesting) {
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                creep.say('->Harvest');
            }
            if(creep.pos.getRangeTo(source.pos) < 2 && !creep.memory.storeCreated) {
                creep.say('PLACING')
                creep.pos.createConstructionSite(STRUCTURE_CONTAINER);
                creep.memory.storeCreated = true;
            }
        }
        else {
            //REPAIR CONTAINER OR TRANSFER TO STORAGE
            creep.memory.harvesting = false;
            var couriers = _.filter(Game.creeps, (creep) => creep.memory.role == "courier").length
            var targets
            if(couriers > 0 ){
                  targets = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER ||
                                structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER) && 
                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;}
                  });
            } else {
                  targets = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN) && 
                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;}
                  });
            }
            var container = source.pos.findInRange(FIND_STRUCTURES, 3,
                {filter: (structure) => structure.structureType == 'container'});
            if(container.length > 0 && container[0].hits < container[0].hitsMax){
                creep.repair(container[0]);
            } else if(targets) {
                if(creep.transfer(targets, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE && targets.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    creep.moveTo(targets, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }

            //RESET TO HARVESTING AFTER DROPPING
            if(creep.store.getFreeCapacity(RESOURCE_ENERGY) == creep.store.getCapacity(RESOURCE_ENERGY)) {
                creep.memory.harvesting = true;
            }
        }
	}
};

module.exports = roleHarvester;