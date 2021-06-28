var path = require('funcMoveCreep');
var log = require('funcLogging')
var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function (creep, sv, cv, rv) {
        var c = global.logging.roles
        var cpu = global.logging.cpu
        var cpuStart = Game.cpu.getUsed()

        var spawn1 = Game.rooms[creep.room.name].find(FIND_MY_SPAWNS)[0]

        if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            log(c, creep.name + " has finished upgrading and is looking for energy.")
            creep.memory.upgrading = false;
        }
        if (!creep.memory.upgrading && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            log(c, creep.name + " has found energy and is upgrading.")
            creep.memory.upgrading = true;
        }

        if (creep.memory.upgrading) {
            log(c, creep.name + " is upgrading.")
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                path(creep, creep.room.controller)
            }
        } else {
            var t = _.filter(sv.overflowContainers, (structure) => structure.structureType == 'container' && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 50);
            var targets = t.sort(function (a, b) {
                return b.store.getUsedCapacity(RESOURCE_ENERGY) - a.store.getUsedCapacity(RESOURCE_ENERGY)
            })
            var bt = _.filter(creep.room.find(FIND_STRUCTURES), (structure) => structure.structureType == 'container' && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 50);
            var badTargets = bt.sort(function (a, b) {
                return b.store.getUsedCapacity(RESOURCE_ENERGY) - a.store.getUsedCapacity(RESOURCE_ENERGY)
            })
            var dropped = creep.room.find(FIND_DROPPED_RESOURCES)

            if (sv.links.length == 2) {
                var link = sv.links.sort(function (a, b) {
                    return creep.pos.getRangeTo(a.pos) - creep.pos.getRangeTo(b)
                })[0]
            }
            if (link && cv.linkMonkeys.length > 0) {
                log(c, creep.name + " is taking from link.")
                if (creep.withdraw(Game.getObjectById("60d8a928dc57cf6743034b32"), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    path(creep, Game.getObjectById("60d8a928dc57cf6743034b32"))
                }
            } else if (targets.length > 0) {
                log(c, creep.name + " is moving to withdraw from secondary source: " + targets[0])
                if (creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    path(creep, targets)
                }
            } else if (badTargets.length > 0) {
                log(c, creep.name + " is moving to withdraw from tertiary source: " + badTargets[0])
                if (creep.withdraw(badTargets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    path(creep, badTargets)
                }
            } else if (rv.energyAvailable == rv.energyCapacity || rv.controller.ticksToDowngrade < 10000) {
                if (cv.harvesters < cv.hMax) {
                    log(c, creep.name + " wants to take energy from spawn.")
                    if (creep.withdraw(spawn1, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        path(creep, spawn1)
                    }
                }
            } else {
                log(c, creep.name + " wants to take a nap.")
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

        var cpuEnd = Game.cpu.getUsed()

        log(cpu, creep.name + " is using " + (cpuEnd - cpuStart).toString().substring(0, 5) + " CPU.")
    }
};

module.exports = roleUpgrader;