var path = require('funcMoveCreep');
var roleHarvester = {

    /** @param {Creep} creep **/
    run: function (creep) {
        var source = Game.getObjectById(creep.memory.target);
        var couriers = _.filter(Game.creeps, (creep) => creep.memory.role == "courier").length
        var container = source.pos.findInRange(FIND_STRUCTURES, 1,
            {filter: (structure) => structure.structureType == 'container'});

        //HARVESTING
        if (creep.store.getFreeCapacity() > 0) {
            if (couriers == 0 && container.length &&container[0].store.getUsedCapacity(RESOURCE_ENERGY) > 50){
                if(creep.withdraw(container[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.say("Courier")
                    path(creep,container)
                }
            } else if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.say("Harvest")
                path(creep,source)
            }
            if(container.length && couriers > 0){
                creep.drop(RESOURCE_ENERGY,creep.store.getUsedCapacity(RESOURCE_ENERGY))
            }
            if (creep.pos.getRangeTo(source.pos) < 2 && !creep.memory.storeCreated) {
                creep.say('Placing')
                creep.pos.createConstructionSite(STRUCTURE_CONTAINER);
                creep.memory.storeCreated = true;
            }
        } else {
            //REPAIR CONTAINER OR TRANSFER TO STORAGE
            creep.memory.harvesting = false;
            var targets
            if (couriers > 0) {
                targets = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER ||
                            structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_TOWER) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
            } else {
                targets = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
            }
            if (container.length > 0 && container[0].hits < container[0].hitsMax) {
                creep.say("Repair")
                creep.repair(container[0]);
            } else if (targets) {
                if (creep.transfer(targets, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE && targets.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    path(creep,targets)
                }
            }

            //RESET TO HARVESTING AFTER DROPPING
            if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == creep.store.getCapacity(RESOURCE_ENERGY)) {
                creep.memory.harvesting = true;
            }
        }
    }
};

module.exports = roleHarvester;