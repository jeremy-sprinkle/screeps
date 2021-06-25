var roleHarvester = require('roleHarvester');
var roleUpgrader = require('roleUpgrader');
var roleBuilder = require('roleBuilder');
var roleCourier = require('roleEnergyCourier');
var roleRampartRepair = require('roleRampartRepair');
var roleFlagHarvester = require('roleFlagHarvester');
var roleFlagAttacker = require('roleFlagAttacker');
var roleFlagAttackerRanged = require('roleFlagAttackerRanged');
var roleFlagClaimer = require('roleFlagClaimer');
var roleFlagBuilder = require('roleFlagBuilder');

var spawnFlagHarvester = require('spawnFlagHarvester');
var spawnHarvester = require('spawnHarvester');
var spawnBuilder = require('spawnBuilder');
var spawnCourier = require('spawnCourier');
var spawnMilitaryBuilder = require('spawnMilitaryBuilder');
var spawnRoomUpgrader = require('spawnRoomUpgrader');
var spawnFlagAttacker = require('spawnFlagAttacker');
var spawnFlagAttackerRanged = require('spawnFlagAttackerRanged');
var spawnFlagClaimer = require('spawnFlagClaimer');
var spawnFlagBuilder = require('spawnFlagBuilder');

var E34N47energyChange = []
var E34N47levelChange = []


//WIP DECLARING USEFUL ARRAYS AND OBJECTS TO STORE ACROSS MULTIPLE TICKS, SAVING ON FIND CALLS
var myRooms = _.filter(Game.rooms, (room) => room.controller.owner && room.controller.owner == "TrickyMouse")
var mySources = [] //Expect {"room":[source1,source2]}
var energyTrackers = []
var levelTrackers = []

module.exports.loop = function () {
    console.log("------------------------TICK BOUNDARY----------------------------")

    var names = []
    for(var roomi in Game.rooms){
        names.push(Game.rooms[roomi].name)
    }

    console.log("Rooms Active: "+names)

    //CLEAR DEAD CREEP MEMORY
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

     for(var c in Game.creeps){
        if(Game.creeps[c].ticksToLive < 25){
            console.log("Creep: "+ Game.creeps[c]+" expiring soon.")
        }
    }

    var GameCreeps = Object.values(Game.creeps)
    var cpuUsedPreLoops = Game.cpu.getUsed()


    //EXECUTE CODE FOR EACH OWNED ROOM ACTIVE
    var GameRooms = Object.values(Game.rooms)
      for (var i in GameRooms) {
          if (GameRooms[i].controller.owner && GameRooms[i].controller.owner.username == "TrickyMouse") {
              console.log("TRACE1 EXPECT")

              //ROOM VARIABLES

              console.log("ROOM TRACE EXPECT 2: " + GameRooms[i].name)
              var rv = null
              var rv = {
                  gameRooms: GameRooms,
                  controller: GameRooms[i].controller,
                  currentRoom: GameRooms[i],
                  roomName: GameRooms[i].name,
                  roomEnergy: GameRooms[i].energyAvailable,
                  roomEnergyCap: GameRooms[i].energyCapacityAvailable,
                  roomEnergyPct: (GameRooms[i].energyAvailable / GameRooms[i].energyCapacityAvailable) * 100,
                  totalRoomEnergyPct: 0,
                  rcl: GameRooms[i].controller.level,
                  roomOwner: GameRooms[i].controller.owner,
                  ts: Game.time.toString().slice(5),
                  energySources: GameRooms[i].find(FIND_SOURCES),
              };
              console.log("TRACE2 EXPECT RV: " + rv.currentRoom + rv)

              var c = _.filter(GameRooms[i].find(FIND_STRUCTURES), (structure) => structure.structureType == "container")
              var s = _.filter(GameRooms[i].find(FIND_STRUCTURES), (structure) => structure.structureType == "storage")
              var total = rv.roomEnergyCap
              var current = rv.roomEnergy
              if (s.length) {
                  total += s[0].store.getCapacity(RESOURCE_ENERGY)
                  current += s[0].store.getUsedCapacity(RESOURCE_ENERGY)
              }
              for (var con in c) {
                  total += c[con].store.getCapacity(RESOURCE_ENERGY)
                  current += c[con].store.getUsedCapacity(RESOURCE_ENERGY)
              }

              rv.totalRoomEnergyPct = Math.floor((current / total) * 100)


              //TRACKING ROOM ENERGY
              //FIX TO TRACK MULTIPLE ROOMS

              /*energyTrackers.push({current})
              if (tracker.length > 200) {
                  tracker.shift()
              }

              var difEnergy
              var lastEnergy
              var trackedEnergyChange = 0
              var displayEnergyChange
              if (tracker.length > 1) {
                  for (var t in tracker) {
                      difEnergy = tracker[t] - lastEnergy
                      if (difEnergy > 0 || difEnergy < 0) {
                          trackedEnergyChange += difEnergy
                          if (trackedEnergyChange > 0) {
                              displayEnergyChange = "+" + trackedEnergyChange.toString()
                          } else {
                              displayEnergyChange = trackedEnergyChange
                          }
                      }
                      lastEnergy = tracker[t]
                  }
              }

              //TRACKING ROOM UPGRADE LEVEL
              var ltracker = E34N47levelChange
              ltracker.push(rv.controller.progress)
              if (ltracker.length > 200) {
                  ltracker.shift()
              }

              var difLevel
              var lastLevel
              var trackedLevelChange = 0
              var displayLevelChange
              if (ltracker.length > 1) {
                  for (var l in ltracker) {
                      difLevel = ltracker[l] - lastLevel
                      if (difLevel > 0 || difLevel < 0) {
                          trackedLevelChange += difLevel
                          if (trackedLevelChange > 0) {
                              displayLevelChange = "+" + trackedLevelChange.toString()
                          } else {
                              displayLevelChange = trackedLevelChange
                          }
                      }
                      lastLevel = ltracker[l]
                  }
              }
*/
              //STRUCTURE VARIABLES
              var sv = null
              var sv = {
                  structures: GameRooms[i].find(FIND_STRUCTURES),
                  hostileStructures: GameRooms[i].find(FIND_HOSTILE_STRUCTURES),
                  containers: _.filter(GameRooms[i].find(FIND_STRUCTURES), (structure) => structure.structureType == "container"),
                  sourceContainers: _.filter(GameRooms[i].find(FIND_STRUCTURES), (structure) => structure.structureType == 'container'
                      && structure.pos.findInRange(FIND_SOURCES, 1).length),
                  overflowContainers: _.filter(_.filter(GameRooms[i].find(FIND_STRUCTURES), (structure) => structure.structureType == "container"),
                      (container) => container.pos.findInRange(FIND_SOURCES, 1) == 0),
                  extensions: _.filter(GameRooms[i].find(FIND_STRUCTURES), (structure) => structure.structureType == "extension"),
                  ramparts: _.filter(GameRooms[i].find(FIND_STRUCTURES), (structure) => structure.structureType == "rampart"),
                  damagedRamparts: _.filter(_.filter(GameRooms[i].find(FIND_STRUCTURES), (structure) => structure.structureType == "rampart"),
                      (rampart) => rampart.hits < (rampart.hitsMax * 0.8)),
                  towers: _.filter(GameRooms[i].find(FIND_STRUCTURES), (struc) => struc.structureType == "tower"),
                  roads: _.filter(GameRooms[i].find(FIND_STRUCTURES), (struc) => struc.structureType == "road"),
                  storage: GameRooms[i].storage,
                  spawns: _.filter(GameRooms[i].find(FIND_STRUCTURES), (struc) => struc.structureType == "spawn"),
              }

              //CREEP VARIABLES
              var cv = null
              var cv = {
                  gameCreeps: GameCreeps,
                  harvesters: _.filter(GameCreeps, (creep) => creep.memory.role == "harvester" && creep.memory.workroom == rv.currentRoom.name),
                  hMax: 0,
                  upgraders: _.filter(GameCreeps, (creep) => creep.memory.role == "upgrader" && creep.memory.workroom == rv.currentRoom.name),
                  uMax: 0,
                  builders: _.filter(GameCreeps, (creep) => creep.memory.role == "builder" && creep.memory.workroom == rv.currentRoom.name),
                  bMax: 0,
                  couriers: _.filter(GameCreeps, (creep) => creep.memory.role == "courier" && creep.memory.workroom == rv.currentRoom.name),
                  cMax: 0,
                  rampartRepairers: _.filter(GameCreeps, (creep) => creep.memory.role == "rampartrepair" && creep.memory.workroom == rv.currentRoom.name),
                  rrMax: 0,
                  roamingHarvesters: _.filter(GameCreeps, (creep) => creep.memory.role == "roamingharvester" && creep.memory.workroom == rv.currentRoom.name),
                  rhMax: 0
              }

              console.log(rv.currentRoom + " : " + Object.values(sv))


              console.log("------------------------ROOM: " + rv.roomName + " | RCL: " + rv.controller.level + "----------------------------")
              console.log("|-- Spawn Energy: " + rv.roomEnergy + "/" + rv.roomEnergyCap +
                  " | Room Energy: " + current + "/" + total + "(" + rv.totalRoomEnergyPct + "%)" +
             /*     " | Energy Change(" + tracker.length + "/200 ticks): " + displayEnergyChange +
                  " | Average Change: " + Math.floor(trackedEnergyChange / tracker.length) +
                  " | Level Change(" + ltracker.length + "/200 ticks): " + displayLevelChange +
                  " | Average Change: " + Math.floor(trackedLevelChange / ltracker.length)*/
                  + " --|"
              )


              // ---------      MAIN CREEP AND BUILDING SPAWNING LOGIC      --------- //
              if (rv.roomOwner != 'TrickyMouse') {
                  rv.rcl = -1
              }

              //---------------------------------------------//
              //-1: OCCUPIED ROOM - TO-DO: PVP CODE
              if (rv.rcl == -1) {
                  //console.log("What are we doing in room owned by " + rv.roomOwner + "?")
                  //attackRoom.run();
              }

              //---------------------------------------------//
              //LEVEL 0: TO-DO: EXPLOIT AND NAVIGATE NEW ROOMS
              if (rv.rcl == 0) {
                  //console.log("Creeps appear to be lost in room " + rv.roomName + ".")
                  //exploitRoom.run();
              }

              //---------------------------------------------//
              //LEVEL 1: CREATE ONE HARVESTER PER SOURCE, ONE CONTAINER PER HARVESTER AT SOURCE, ONE UPGRADER, ONE BUILDER
              if (rv.rcl == 1) {
                  cv.hMax = rv.energySources.length //fix to remove hostile sources later
                  cv.uMax = 1
                  cv.bMax = 1

                  //ENERGY HARVESTER<->SOURCE ASSIGNMENT - HARVESTERS CREATE CONTAINERS BY SOURCE
                  console.log("printing sources in room 2:" + rv.energySources)
                  for (i in rv.energySources) {
                      console.log("sv just before spawn harv: " + sv)
                      spawnHarvester.run(rv.energySources[i], cv.hMax, sv)
                  }

                  //BUILDER SPAWNING
                  spawnBuilder.run(rv, cv, sv);

                  //UPGRADER SPAWNING
                  spawnRoomUpgrader.run(rv, cv, sv);


                  //PRINT STATUS
                  console.log('Harvesters: ' + cv.harvesters.length + " of " + cv.hMax +
                      '\nUpgraders: ' + cv.upgraders.length + " of " + cv.uMax +
                      '\nBuilders: ' + cv.builders.length + " of " + cv.bMax
                  );
              }

              //---------------------------------------------//
              //LEVEL 2: CREATE 5 EXTENSIONS AND RAMPARTS
              //LEVEL 3: CREATE 5 EXTENSIONS AND TOWER

              if (rv.rcl > 1) {
                  cv.hMax = rv.energySources.length //fix to remove hostile sources later
                  cv.uMax = 1
                  cv.bMax = 1
                  cv.cMax = 1
                  cv.rrMax = 0//sv.damagedRamparts.length

                  if (!rv.currentRoom.storage) {
                      if (rv.totalRoomEnergyPct > 90) {
                          cv.uMax = 2
                          cv.bMax = 2
                          if (rv.totalRoomEnergyPct > 95) {
                              cv.uMax = 3
                              if (rv.totalRoomEnergyPct >= 99) {
                                  cv.uMax = 4
                              }
                          }
                      }
                  } else {
                      if (rv.totalRoomEnergyPct > 10) {
                          cv.uMax = 2
                          cv.bMax = 2
                          if (rv.totalRoomEnergyPct > 15) {
                              cv.uMax = 3
                          }
                      }
                  }


                  if (rv.currentRoom.find(FIND_CONSTRUCTION_SITES).length == 0) {
                      cv.bMax = 0
                  }

                  //ENERGY HARVESTER<->SOURCE ASSIGNMENT
                  for (var source in rv.energySources) {
                      spawnHarvester.run(rv.energySources[source], cv.hMax, sv)
                  }
                  //COURIER SPAWNING
                  spawnCourier.run(rv, cv, sv)
                  //BUILDER SPAWNING
                  spawnBuilder.run(rv, cv, sv);
                  //RAMPART REPAIRER SPAWNING
                  spawnMilitaryBuilder.run(rv, cv, sv);
                  //UPGRADER SPAWNING
                  spawnRoomUpgrader.run(rv, cv, sv);


                  //PRINT STATUS
                  console.log('Harvesters: ' + cv.harvesters.length + " of " + cv.hMax +
                      '\nCouriers: ' + cv.couriers.length + " of " + cv.cMax +
                      '\nUpgraders: ' + cv.upgraders.length + " of " + cv.uMax +
                      '\nBuilders: ' + cv.builders.length + " of " + cv.bMax
                  );


                  //Creep behaviour
                  for (var name in GameCreeps) {
                      var preHCPU = Game.cpu.getUsed()
                      var creep = GameCreeps[name];
                      if (creep.memory.role == 'harvester' && !creep.spawning && creep.memory.workroom == rv.currentRoom.name) {
                          roleHarvester.run(creep);
                      }
                      var hCPU = Game.cpu.getUsed()
                      //console.log("Harvester CPU: "+Math.floor(hCPU-preHCPU))
                      if (creep.memory.role == 'upgrader' && !creep.spawning && creep.memory.workroom == rv.currentRoom.name) {
                          roleUpgrader.run(creep, sv);
                      }
                      var uCPU = Game.cpu.getUsed()
                      //console.log("Upgrader CPU: "+Math.floor(uCPU-hCPU))
                      if (creep.memory.role == 'builder' && !creep.spawning && creep.memory.workroom == rv.currentRoom.name) {
                          roleBuilder.run(creep, sv);
                      }
                      var bCPU = Game.cpu.getUsed()
                      //console.log("Builder CPU: "+Math.floor(bCPU-uCPU))
                      if (creep.memory.role == 'courier' && !creep.spawning && creep.memory.workroom == rv.currentRoom.name) {
                          console.log(creep.room + " courier has sv: " + sv)
                          roleCourier.run(creep, rv, sv);
                      }
                      var cCPU = Game.cpu.getUsed()
                      //console.log("Courier CPU: "+Math.floor(cCPU-bCPU))
                      if (creep.memory.role == 'rampartrepair' && !creep.spawning && creep.memory.workroom == rv.currentRoom) {
                          roleRampartRepair.run(creep, sv.ramparts, rv);
                      }
                      var mbCPU = Game.cpu.getUsed()
                      //console.log("Mil. Builder CPU: "+Math.floor(mbCPU-cCPU))
                  }
                  var cpuUsedPostRoles = Game.cpu.getUsed()
              }
          }
      }
    var cpuUsedPostLoops = Game.cpu.getUsed()


    //MANUAL FLAG MANAGEMENT

    var sourceFlags = _.filter(Game.flags, (flag) => flag.name.includes("source"))
    var claimFlags = _.filter(Game.flags, (flag) => flag.name.includes("claim"))
    var buildFlags = _.filter(Game.flags, (flag) => flag.name.includes("build"))
    var weightedFlags = []
    //TODO: for all spawns, get distance to all flags, closest pairs passed to spawning function
    for(var sflag in sourceFlags){
        var name = sourceFlags[sflag].pos.roomName
        var distance = Game.map.getRoomLinearDistance("E34N47", name)
        weightedFlags.push({distance: distance, flag: sourceFlags[sflag]})
    }
    var sortedFlags = weightedFlags.sort(function(a,b){return a.distance-b.distance})
    for(var flag in sortedFlags){
        if(_.filter(GameCreeps, (creep) => creep.memory.targetRoom == sortedFlags[flag].flag.pos.roomName
                                        && creep.memory.targetX == sortedFlags[flag].flag.pos.x &&
                                            creep.memory.targetY == sortedFlags[flag].flag.pos.y
        ).length > 0){
            continue;
        } else {
            spawnFlagHarvester.run(sortedFlags[flag].flag.pos,rv,sv,cv)
        }
    }
    var attackFlags = _.filter(Game.flags, (flag) => flag.name.includes("attack"))
    console.log("Active Flags( Sources: "+sourceFlags.length+
        " | Offences: "+attackFlags.length+
        " | Claims: "+claimFlags.length+
        " )"
    )

    for(var flag in attackFlags){
        if(attackFlags[flag].room != undefined){
            var victim = attackFlags[flag].pos.lookFor(LOOK_STRUCTURES)[0]
            if(victim){
                console.log("Attack underway on: "+victim+" with "+victim.hits+" hits left.")
            }
        }
        if(_.filter(GameCreeps, (creep) => creep.memory.targetRoom == attackFlags[flag].pos.roomName
            && creep.memory.targetX == attackFlags[flag].pos.x &&
            creep.memory.targetY == attackFlags[flag].pos.y
        ).length >= attackFlags.length*3 && _.filter(GameCreeps, (creep) => creep.memory.role == "flagrangedattacker").length >= attackFlags.length*6){
            continue;
        } else {
            if(_.filter(GameCreeps, (creep) => creep.memory.role == "flagattacker").length < attackFlags.length*3){
                //spawnFlagAttacker.run(attackFlags[flag].pos,rv,sv,cv)
            }
            if(_.filter(GameCreeps, (creep) => creep.memory.role == "flagrangedattacker").length < attackFlags.length*3){
                //spawnFlagAttackerRanged.run(attackFlags[flag].pos,rv,sv,cv)
            }

        }
    }

    for(var flag in claimFlags) {
        if (_.filter(GameCreeps, (creep) => creep.memory.targetRoom == claimFlags[flag].pos.roomName
            && creep.memory.targetX == claimFlags[flag].pos.x &&
            creep.memory.targetY == claimFlags[flag].pos.y
        ).length >= claimFlags.length) {
            continue;
        } else {
            if (_.filter(GameCreeps, (creep) => creep.memory.role == "flagclaimer").length < claimFlags.length) {
                spawnFlagClaimer.run(claimFlags[flag].pos, rv, sv, cv)
            }
        }
    }
    for(var flag in buildFlags) {
        var flagCreeps = _.filter(GameCreeps, (creep) => creep.memory.targetRoom == buildFlags[flag].pos.roomName
            && creep.memory.targetX == buildFlags[flag].pos.x &&
            creep.memory.targetY == buildFlags[flag].pos.y)
        if (flagCreeps.length >= buildFlags.length) {
            continue;
        } else {
            if (_.filter(GameCreeps, (creep) => creep.memory.role == "flagbuilder").length < buildFlags.length) {
                console.log("No flag creep found - spawning")
                spawnFlagBuilder.run(buildFlags[flag].pos, rv, sv, cv)
            } else if (flagCreeps[0].ticksToLive < 100){
                console.log("Flag creep low ticks left - spawning")
                spawnFlagBuilder.run(buildFlags[flag].pos, rv, sv, cv)
            }
        }
    }




    for(var cName in GameCreeps){
        var creep = GameCreeps[cName]
        if (creep.memory.role == 'roamingharvester'&& !creep.spawning){
            roleFlagHarvester.run(creep)
        }
        var fhCPU = Game.cpu.getUsed()
        //console.log("Flag Harvester CPU: "+Math.floor(fhCPU-mbCPU))

        if (creep.memory.role == 'flagattacker'&& !creep.spawning){
            roleFlagAttacker.run(creep)
        }
        var faCPU = Game.cpu.getUsed()
        //console.log("Flag Attacker CPU: "+Math.floor(faCPU-fhCPU))

        if (creep.memory.role == 'flagrangedattacker'&& !creep.spawning){
            roleFlagAttackerRanged.run(creep)
        }
        var farCPU = Game.cpu.getUsed()
        //console.log("Flag Attacker Ranged CPU: "+Math.floor(farCPU-faCPU))

        if (creep.memory.role == 'flagclaimer'&& !creep.spawning){
            roleFlagClaimer.run(creep)
        }
        var fcCPU = Game.cpu.getUsed()
        //console.log("Flag Claimer CPU: "+Math.floor(fcCPU-farCPU))

        if (creep.memory.role == 'flagbuilder'&& !creep.spawning){
            roleFlagBuilder.run(creep)
        }
        var fbCPU = Game.cpu.getUsed()
        //console.log("Flag Claimer CPU: "+Math.floor(fbCPU-fcCPU))

    }

    var cpuUsedPostFlags = Game.cpu.getUsed()
    //Spawn labelling
    for(var sp in sv.spawns){
        if (sv.spawns[sp].spawning) {
            var spawningCreep = Game.creeps[sv.spawns[sp].spawning.name];
            sv.spawns[sp].room.visual.text(
                'Spawning ' + spawningCreep.memory.role,
                sv.spawns[sp].pos.x - 3,
                sv.spawns[sp].pos.y,
                {align: 'left', opacity: 0.8});
        }
    }

    //Tower behaviour - move to separate module?
    for(var t in sv.towers){
        if (sv.towers[t] && sv.towers[t].store.getUsedCapacity(RESOURCE_ENERGY) > 0) {

            var closestHostile = sv.towers[t].pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (closestHostile) {
                sv.towers[t].attack(closestHostile);
                console.log("Tower attacking "+closestHostile)
            } else if(rv.totalRoomEnergyPct > 15){

                var closestFriend = sv.towers[t].pos.findClosestByRange(FIND_MY_CREEPS);
                var closestDamagedStructure = sv.towers[t].pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => structure.hits < structure.hitsMax
                        && structure.structureType != "road" && structure.structureType != "constructedWall"
                });
                var secondRateDamagedStructure = sv.towers[t].pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => structure.hits < structure.hitsMax && structure.structureType != "constructedWall"
                });
                if(closestFriend && closestFriend.hits < closestFriend.hitsMax) {
                    sv.towers[t].heal(closestFriend);

                    console.log("Tower healing "+closestFriend)
                }else if (closestDamagedStructure) {
                    sv.towers[t].repair(closestDamagedStructure);
                    //console.log("Tower repairing "+closestDamagedStructure+".")
                } else if (secondRateDamagedStructure && rv.totalRoomEnergyPct > 10) {
                    sv.towers[t].repair(secondRateDamagedStructure);
                }
            }


        }
    }
    var cpuUsedPostTowersAndSpawns = Game.cpu.getUsed()

    console.log("CPU used by main.js: " + "Total: "+Math.floor(cpuUsedPostRoles-cpuUsedPreLoops) +
                " | GameLoop: "+Math.floor(cpuUsedPostLoops-cpuUsedPreLoops) +
                " | Flags: "+Math.floor(cpuUsedPostFlags-cpuUsedPostLoops) +
                " | Spawns And Towers: "+Math.floor(cpuUsedPostTowersAndSpawns-cpuUsedPostFlags) +
                " | Roles: "+Math.floor(cpuUsedPostRoles-cpuUsedPostTowersAndSpawns)
    )
    console.log("CPU Bucket: "+Game.cpu.bucket)
    if(Game.cpu.bucket == 10000){
        if(Game.cpu.generatePixel() == OK)
            console.log("Converted 10,000 CPU to 1 Pixel.")
    }
}