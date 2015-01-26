{
    init: function(elevators, floors) {
        var queueIt = function(elevator, floorNum) {
            
            if (elevator.destinationQueue.indexOf(floorNum) === -1) {
                console.log('queueing floor '+floorNum);
                
                elevator.destinationQueue.push(floorNum);
                
                if(elevator.destinationQueue.length === 1) {
                    return;
                }
                
                var higher = elevator.destinationQueue.filter(function(num) { return num > floorNum; });
                var lower = elevator.destinationQueue.filter(function(num) { return num <= floorNum; });
                higher.sort();
                lower.sort();
                lower.reverse();
                
                elevator.destinationQueue = (elevator.goingUpIndicator()) ? higher.concat(lower) : lower.concat(higher);
                
                elevator.checkDestinationQueue();
                console.log(elevator.destinationQueue);
            }
        };
        
        elevators.forEach(function(elevator) {
            elevator.on("idle", function() {
                elevator.goToFloor(0);
            });
            elevator.on('floor_button_pressed', function(floorNum) {
                queueIt(elevator, floorNum);
            });
            elevator.on("passing_floor", function(floorNum, direction) {
                
            });
        });
        
        floors.forEach(function(floor) {
            var handleFloorButtonPress = function(direction) {
                if (elevators.filter(function(elevator) { return elevator.destinationQueue.indexOf(floor.floorNum) !== -1; }).length > 0) {
                    return;
                }
                
                var selectedElevator = null;
                
                var potentialElevators = elevators.filter(function(elevator) {
                    return elevator.loadFactor() < 0.7 &&
                           ((direction === 'up' && elevator.currentFloor < floor.floorNum && elevator.goingUpIndicator()) ||
                           (direction === 'down' && elevator.currentFloor > floor.floorNum && elevator.goingDownIndicator()));
                });
                
                if (potentialElevators.length === 0) {
                    selectedElevator = elevators.sort(function(a,b) {
                        return (Math.abs(a.currentFloor-floor.floorNum) < Math.abs(b.currentFloor-floor.floorNum())) ? -1 : 1;
                    })[0];
                } else if (potentialElevators.length === 1) {
                    selectedElevator = potentialElevators[0];
                } else {
                    selectedElevator = potentialElevators.sort(function(a,b) {
                        return (Math.abs(a.currentFloor-floor.floorNum) < Math.abs(b.currentFloor-floor.floorNum())) ? -1 : 1;
                    })[0];
                }
                
                queueIt(selectedElevator, floor.floorNum());
            };
            floor.on("up_button_pressed", function() {
                handleFloorButtonPress('up');
            });
            floor.on("down_button_pressed", function() {
                handleFloorButtonPress('down');
            });
        });
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}
