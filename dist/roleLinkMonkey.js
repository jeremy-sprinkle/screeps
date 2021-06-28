var path = require('funcMoveCreep');
var log = require('funcLogging');


var roleLinkMonkey = {
    run: function (creep, sv, cv, rv) {
        var c = global.logging.roles
        var cpu = global.logging.cpu
        var cpuStart = Game.cpu.getUsed()

        if (!creep.memory.fetching && creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
            log(c, creep.name + " fetching energy.")
            creep.memory.fetching = true;
        }
        if (creep.memory.fetching && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            log(c, creep.name + " delivering energy.")
            creep.memory.fetching = false;
        }

        if (creep.memory.fetching) {
            log(c, creep.name + " grabbing from storage.")

            if (creep.withdraw(sv.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                path(creep, sv.storage)
            }
        }

        if (!creep.memory.fetching) {
            var link = _.filter(creep.pos.findInRange(FIND_STRUCTURES, 3), (struct) => struct.structureType == "link")
            log(c, creep.name + " putting energy in: " + link[0])
            if (creep.transfer(link[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                path(creep, link)
            }
        }

        var cpuEnd = Game.cpu.getUsed()
        log(cpu, creep.name + " is using " + (cpuEnd - cpuStart).toString().substring(0, 5) + " CPU.")
    }
};

module.exports = roleLinkMonkey;