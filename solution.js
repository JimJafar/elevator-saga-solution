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
            var handleFloorButtonPress = function() {
                elevators.sort(function(a,b) {
                    if (a.loadFactor() > 0.6) { return 1; }
                    return (Math.abs(a.currentFloor-floor.floorNum) < Math.abs(b.currentFloor-floor.floorNum())) ? -1 : 1;
                });
                var closestElevator = null;
                for (var i=0; i<elevators.length; i++) {
                    if ((elevators[i].currentFloor > floor.floorNum() && elevators[i].goingDownIndicator()) ||
                        (elevators[i].currentFloor < floor.floorNum() && elevators[i].goingUpIndicator())) {
                       closestElevator = elevators[i];
                       break;
                    }
                }
                if(!closestElevator) {
                    closestElevator = elevators[0];
                }
                queueIt(closestElevator, floor.floorNum());
            };
            floor.on("up_button_pressed", function() {
                handleFloorButtonPress();
            });
            floor.on("down_button_pressed", function() {
                handleFloorButtonPress();
            });
        });
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}
