var path = require('funcMoveCreep');
var roleBuilder = {

    /** @param {Creep} creep **/
    run: function (creep, sv) {

        if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
        }
        if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
            creep.memory.takingFromSpawn = false;
            creep.memory.building = true;
        }

        if (creep.memory.building) {
            var targets = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if (targets) {
                if (creep.build(targets) == ERR_NOT_IN_RANGE) {
                    //console.log(creep.name+" pathing to target: "+targets+", stalled for "+creep.memory.stallCount+" ticks.")
                    path(creep,targets);
                }
            } else {
                creep.memory.idle += 1
                if (creep.memory.idle >= 15 && creep.room.find(FIND_MY_SPAWNS)[0].recycleCreep(creep) == ERR_NOT_IN_RANGE) {
                    path(creep,creep.room.find(FIND_MY_SPAWNS)[0])
                }
            }
        } else {
            var t = _.filter(creep.room.find(FIND_STRUCTURES), (structure) => structure.structureType == 'container' && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 50);
            var targets = t.sort(function(a, b){return b.store.getUsedCapacity(RESOURCE_ENERGY)-a.store.getUsedCapacity(RESOURCE_ENERGY)})
            var dropped = creep.room.find(FIND_DROPPED_RESOURCES)
            var energyDif = creep.room.energyCapacityAvailable - creep.room.energyAvailable
            var spawn1 = Game.spawns['Spawn1']
            var creepsTakingFromSpawn = _.filter(Game.creeps, (creep) => creep.memory.takingFromSpawn == true)
            var damagedRoads = _.filter(sv.roads, (structure) => structure.hits < structure.hitsMax)
            if (energyDif > 0 && creepsTakingFromSpawn.length >= 1){
                creep.memory.takingFromSpawn = false;
            }
            dropped = dropped.sort(function(a, b){return b.amount-a.amount})


            if (dropped.length > 0) {
                if (creep.pickup(dropped[0])== ERR_NOT_IN_RANGE){
                    //console.log(creep.name+" pathing to dropped resources, stalled for "+creep.memory.stallCount+" ticks.")
                    path(creep,dropped)
                }
            } else if (energyDif == 0 && creepsTakingFromSpawn.length == 0) {
                creep.memory.takingFromSpawn = true;
                if (creep.withdraw(spawn1, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    //console.log(creep.name+" pathing to spawn, stalled for "+creep.memory.stallCount+" ticks.")
                    path(creep,spawn1)
                }
            } else if (targets.length > 0) {
                if (creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    //console.log(creep.name+" taking from most full container, stalled for "+creep.memory.stallCount+" ticks.")
                    path(creep,targets)
                }
            } else {
                creep.memory.idle += 1
                if (creep.memory.idle >= 15 && spawn1.recycleCreep(creep) == ERR_NOT_IN_RANGE) {
                    path(creep,spawn1)
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
                    creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#FF0000'}});
                }

            }*/


        }
    }

};

module.exports = roleBuilder;