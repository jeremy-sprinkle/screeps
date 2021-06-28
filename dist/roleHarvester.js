var path = require('funcMoveCreep');
var log = require('funcLogging');


var roleHarvester = {
    run: function (creep, sv, cv, rv) {
        var c = global.logging.roles
        var cpu = global.logging.cpu
        var cpuStart = Game.cpu.getUsed()

        //RESET TO HARVESTING AFTER DROPPING
        if (!creep.memory.harvesting && creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
            log(c, creep.name + " is resetting to harvesting after delivering.")
            creep.memory.harvesting = true;
        }
        if (creep.memory.harvesting && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            log(c, creep.name + " is resetting to delivering after harvesting.")
            creep.memory.harvesting = false;
        }

        var source = Game.getObjectById(creep.memory.target);
        var couriers = _.filter(Game.creeps, (c) => c.memory.role == "courier" && c.memory.workroom == creep.memory.workroom).length
        var container = source.pos.findInRange(FIND_STRUCTURES, 1,
            {filter: (structure) => structure.structureType == 'container'});
        //HARVESTING

        log(c, creep.name + " confirming harvesting mode: "+creep.memory.harvesting)

        if (creep.memory.harvesting) {
            log(c, creep.name + " is in harvesting mode.")

            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                log(c, creep.name + " is moving to harvest: " + source)
                path(creep, source)
            }
            if (container.length && couriers > 0) {
                log(c, creep.name + " is dropping energy onto a container..")
                creep.drop(RESOURCE_ENERGY, creep.store.getUsedCapacity(RESOURCE_ENERGY))
            }
            if (creep.pos.getRangeTo(source.pos) < 2 && !creep.memory.storeCreated) {
                log(c, creep.name + " is creating a container at it's source.")
                creep.pos.createConstructionSite(STRUCTURE_CONTAINER);
                creep.memory.storeCreated = true;
            }
        } else {

            log(c, creep.name + " is out of harvesting mode.")
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
                log(c, creep.name + " is looking to dump energy at: " + targets)
            } else {
                log(c, creep.name + " is looking to drop energy at spawn.")
                targets = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
            }
            var noSpawn = _.filter(creep.room.find(FIND_CONSTRUCTION_SITES), (site) => site.structureType == "spawn")
            if(noSpawn.length > 0){
                if(cree.build(noSpawn[0]) == ERR_NOT_IN_RANGE){
                    path(creep,noSpawn )
                }
            } else if (rv.roomEnergyPct >= 85 && couriers == 0) {
                if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    log(c, creep.name + " is looking to upgrade the room controller.")
                    path(creep, creep.room.controller)
                }
            } else if (container.length > 0 && container[0].hits < container[0].hitsMax) {
                log(c, creep.name + " is repairing a source container.")
                if (creep.repair(container[0]) == ERR_NOT_IN_RANGE) {
                    path(creep, container[0])
                }
            } else if (targets) {
                log(c, creep.name + " delivering to: " + targets)
                if (creep.transfer(targets, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE && targets.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    path(creep, targets)
                }
            }


        }
        var cpuEnd = Game.cpu.getUsed()

        log(cpu, creep.name + " is using " + (cpuEnd - cpuStart).toString().substring(0, 5) + " CPU.")
    }
};

module.exports = roleHarvester;