//take creep and structure info, find best container to withdraw from by capacity/distance return target for use in pathing
function getCourierWithdraw(creep, sv) {
    var cpuStart = Game.cpu.getUsed()
    //WITHDRAW FROM SOURCE CONTAINERS

    var t = _.filter(sv.sourceContainers, (structure) => structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0);
    t = t.concat(creep.room.find(FIND_TOMBSTONES))
    var targets = t.sort(function (a, b) {
        return b.store.getUsedCapacity(RESOURCE_ENERGY) - a.store.getUsedCapacity(RESOURCE_ENERGY)
    })

    //FIND DROPPED ENERGY
    var dropped = _.filter(creep.room.find(FIND_DROPPED_RESOURCES), (dropped) => dropped.amount > 100)
    if (dropped.length > 0) {
        var wD = []
        for (var d in dropped) {
            var pathLength = creep.room.findPath(creep.pos, dropped[d].pos, {ignoreCreeps: true}).length
            var weight = dropped[d].amount / pathLength
            wD.push({weight: weight, source: dropped[d]})
        }
        var weightedDropped = wD.sort(function (a, b) {
            return b.weight - a.weight
        })
        var target = weightedDropped[0].source;
    } else if (targets.length > 0) {
        var wT = []
        for (var sc in targets) {
            var pathLength = creep.room.findPath(creep.pos, targets[sc].pos, {ignoreCreeps: true}).length
            var weight = targets[sc].store.getUsedCapacity(RESOURCE_ENERGY) / pathLength
            wT.push({weight: weight, source: targets[sc]})
        }
        var weightedTargets = wT.sort(function (a, b) {
            return b.weight - a.weight
        })
        var target = weightedTargets[0].source;
    } else if (sv.storage) {
        if (sv.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            var target = sv.storage;
        }
    }

    //creep.memory.movingTo = target.id
    var cpuEnd = Game.cpu.getUsed()
    //console.log("CPU used byfuncGetCourierWithdraw: "+Math.floor(cpuEnd-cpuStart))
    return target;

}

module.exports = getCourierWithdraw;