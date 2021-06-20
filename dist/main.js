var roleHarvester = require('roleHarvester');
var roleUpgrader = require('roleUpgrader');
var roleBuilder = require('roleBuilder');
var roleCourier = require('roleEnergyCourier');
var roleRampartRepair = require('roleRampartRepair');

var spawnHarvester = require('spawnHarvester');
var spawnBuilder = require('spawnBuilder');
var spawnCourier = require('spawnCourier');
var spawnMilitaryBuilder = require('spawnMilitaryBuilder');
var spawnRoomUpgrader = require('spawnRoomUpgrader');

Game.spawns['Spawn1'].memory.withdrawQueue = []
Game.spawns['Spawn1'].memory.cappedTime = 0

module.exports.loop = function () {
    console.log("------------------------TICK BOUNDARY----------------------------")

    //CLEAR DEAD CREEP MEMORY
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    //EXECUTE CODE FOR EACH ROOM ACTIVE
    for(var i in Game.rooms) {

        //ROOM VARIABLES
        var rv = {
            currentRoom : Game.rooms[i],
            roomName : Game.rooms[i].name,
            roomEnergy : Game.rooms[i].energyAvailable,
            roomEnergyCap : Game.rooms[i].energyCapacityAvailable,
            rcl : Game.rooms[i].controller.level,
            roomOwner : Game.rooms[i].controller.owner.username,
            ts : Game.time.toString().slice(5),
            energySources : Game.rooms[i].find(FIND_SOURCES),
        };

        //COUNTING WASTED SPAWN TIME
        if(rv.roomEnergy == rv.roomEnergyCap){
            Game.spawns['Spawn1'].memory.cappedTime++
        }

        console.log("RoomName: "+rv.roomName+" | Owner: "+rv.roomOwner+" " +
                    "| Energy: "+rv.roomEnergy+"/"+rv.roomEnergyCap+
                    " | TicksEnergyCapped: "+Game.spawns['Spawn1'].memory.cappedTime)
        
        //STRUCTURE VARIABLES
        var sv = {
            structures : Game.rooms[i].find(FIND_STRUCTURES),
            hostileStructures : Game.rooms[i].find(FIND_HOSTILE_STRUCTURES),
            containers : _.filter(Game.rooms[i].find(FIND_STRUCTURES), (structure) => structure.structureType == "container"),
            extensions : _.filter(Game.rooms[i].find(FIND_STRUCTURES), (structure) => structure.structureType == "extension"),
            ramparts : _.filter(Game.rooms[i].find(FIND_STRUCTURES), (structure) => structure.structureType == "rampart")
        }

        //CREEP VARIABLES
        var cv = {
            harvesters : _.filter(Game.creeps, (creep) => creep.memory.role == "harvester"),
            hMax : 0,
            upgraders : _.filter(Game.creeps, (creep) => creep.memory.role == "upgrader"),
            uMax : 0,
            builders : _.filter(Game.creeps, (creep) => creep.memory.role == "builder"),
            bMax : 0,
            couriers : _.filter(Game.creeps, (creep) => creep.memory.role == "courier"),
            cMax : 0,
            rampartRepairers : _.filter(Game.creeps, (creep) => creep.memory.role == "rampartrepair"),
            rrMax : 0
        }


        // ---------      MAIN CREEP AND BUILDING SPAWNING LOGIC      --------- //
        if(rv.roomOwner != 'TrickyMouse'){
            rv.rcl = -1
        }

        //---------------------------------------------//
        //-1: OCCUPIED ROOM - TO-DO: PVP CODE
        if(rv.rcl == -1){
            console.log("What are we doing in room owned by "+rv.roomOwner+"?")
            //attackRoom.run();
            break;
        }

        //---------------------------------------------//
        //LEVEL 0: TO-DO: EXPLOIT AND NAVIGATE NEW ROOMS
        if(rv.rcl == 0){
            console.log("Creeps appear to be lost in room "+rv.roomName+".")
            //exploitRoom.run();
            break;
        }


        //---------------------------------------------//
        //LEVEL 1: CREATE ONE HARVESTER PER SOURCE, ONE CONTAINER PER HARVESTER AT SOURCE, ONE UPGRADER, ONE BUILDER
        if(rv.rcl == 1){
            cv.hMax = rv.energySources.length //fix to remove hostile sources later
            cv.uMax = 1
            cv.bMax = 1

            //ENERGY HARVESTER<->SOURCE ASSIGNMENT - HARVESTERS CREATE CONTAINERS BY SOURCE
            for(i in rv.energySources) {
                spawnHarvester.run(rv.energySources[i],cv.hMax)
            }

            //UPGRADER SPAWNING
            spawnRoomUpgrader.run(rv,cv,sv);

            //BUILDER SPAWNING
            spawnBuilder.run(rv,cv,sv);

            //PRINT STATUS
            console.log('Harvesters: ' + cv.harvesters.length + " of "+cv.hMax+
                '\nUpgraders: ' + cv.upgraders.length + " of "+cv.uMax+
                '\nBuilders: ' + cv.builders.length + " of "+cv.bMax
            );
        }

        //---------------------------------------------//
        //LEVEL 2: CREATE 5 EXTENSIONS AND RAMPARTS
        //LEVEL 3: CREATE 5 EXTENSIONS AND TOWER

        if(rv.rcl > 1){
            cv.hMax = rv.energySources.length //fix to remove hostile sources later
            cv.uMax = 1
            cv.bMax = 1
            cv.cMax = 1
            cv.rrMax = sv.ramparts.length

            //ENERGY HARVESTER<->SOURCE ASSIGNMENT
            for(i in rv.energySources) {
                spawnHarvester.run(rv.energySources[i],cv.hMax)
            }
            //RAMPART REPAIRER SPAWNING
            spawnMilitaryBuilder.run(rv,cv,sv);
            //UPGRADER SPAWNING
            spawnRoomUpgrader.run(rv,cv,sv);

            //BUILDER SPAWNING
            spawnBuilder.run(rv,cv,sv);

            //COURIER SPAWNING
            spawnCourier.run(rv,cv,sv)

            //PRINT STATUS
            console.log('Harvesters: ' + cv.harvesters.length + " of "+cv.hMax+
                '\nCouriers: ' + cv.couriers.length + " of "+cv.cMax+
                '\nUpgraders: ' + cv.upgraders.length + " of "+cv.uMax+
                '\nBuilders: ' + cv.builders.length + " of "+cv.bMax+
                '\nRampartRepairers: ' +cv.rampartRepairers.length +" of "+cv.rrMax
            );

        }
    }

    if(Game.spawns['Spawn1'].spawning) { 
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            'Spawning' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x - 3,
            Game.spawns['Spawn1'].pos.y, 
            {align: 'left', opacity: 0.8});
    }

    var tower = Game.getObjectById('2b2ee15f51cf60db27a914aa'); //replace with generic tower code "for all towers yada yada"
    if(tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }

        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep,rv.rcl);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if(creep.memory.role == 'courier') {
            roleCourier.run(creep);
        }
        if(creep.memory.role == 'rampartrepair') {
            roleRampartRepair.run(creep,sv.ramparts);
        }
    }
}