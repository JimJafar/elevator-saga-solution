{
    init: function(elevators, floors) {
        var queueIt = function(elevator, floorNum) {
            /*
            console.log('queueing floor '+floorNum);
            if (elevator.destinationQueue.indexOf(floorNum) === -1) {
                elevator.destinationQueue.push(floorNum);
                elevator.destinationQueue.sort(function(a, b) {
                    return (Math.abs(elevator.currentFloor-a) < Math.abs(elevator.currentFloor-b)) ? -1 : 1;
                });
                elevator.checkDestinationQueue();
            }
            */
            elevator.goToFloor(floorNum);
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
                    return (Math.abs(a.currentFloor-floor.floorNum) < Math.abs(b.currentFloor-floor.floorNum())) ? -1 : 1;
                });
                var closestElevator = null;
                for (var i=0; i<elevators.length; i++) {
                    if (elevators[i].currentFloor === floor.floorNum() || 
                        (elevators[i].currentFloor > floor.floorNum() && elevators[i].goingDownIndicator()) ||
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
