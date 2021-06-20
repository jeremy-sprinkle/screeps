var spawnCourier = {
    run: function(rv,cv,sv){

        var spawn1 = Game.spawns['Spawn1']
        var cParts = [MOVE,CARRY]
        var cost = BODYPART_COST.move + BODYPART_COST.carry
        var workParts = Math.floor((rv.currentRoom.energyCapacityAvailable-51)/BODYPART_COST.carry)
        for(var parts = 0; parts < workParts; parts++){
            cParts.push(CARRY)
            cost += BODYPART_COST.CARRY
        }

        if(cv.couriers.length < cv.cMax && !spawn1.spawning && cv.harvesters.length == cv.hMax && rv.roomEnergy == rv.roomEnergyCap) {
            var newName = 'C1-' + rv.ts;
            console.log('Spawning new courier: ' + newName+ " (Cost: "+cost+")");
            spawn1.spawnCreep(cParts, newName,
                {memory: {role: 'courier',
                        workroom: rv.roomName}});
        }
    }
}

module.exports = spawnCourier;