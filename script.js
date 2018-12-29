//initial variables
let threadId = -1;
let inputData;
let population;
let populationSize;
let elite;
let eliteSize;
let numberOfTasks;
let numberOfProcess;
let maxTimeOfProcess;
let mutationProbability;
let crossedElements;
let nextGeneration;
let bestTime = 0;
let bestTimeTab = [];
let bestTimeTabExecuteTime = ['00:00:00'];
let worstTime = 0;
let optimization = 0;
let progressbar;
let generation = 0;
let generationTab = [];
let generationSize;
let startTime;
let displayHour = 0;
let displayMinute = 0;
let displaySecond = 0;

/**
 * Assign random tasks to processors
 *
 * @param populationSize integer
 * @returns {Array}
 */
function assignRandomTasksToProcessors(populationSize = null) {
    let result = [];

    for (let i = 0; i < populationSize; i++) {
        //creates an object, size depends on the number of processes
        let processorTasks = createTaskAllocationArray();

        for (let key in inputData.tasks) {
            let randomProcessor = Math.floor((Math.random() * Object.getOwnPropertyNames(processorTasks).length));
            processorTasks[randomProcessor].push(inputData.tasks[key]);
        }
        result.push(processorTasks);
    }

    return result;
}

/**
 * Selects the  best times from the population
 *
 * @param population integer
 * @param eliteSize integer
 * @returns {Array}
 */
function getEliteFromPopulation(population, eliteSize = null) {
    let elite = [];

    for (let currentPopulation = 0; currentPopulation < populationSize; currentPopulation++) {
        //first 10 result save as elite
        if (currentPopulation < eliteSize) {
            elite.push(population[currentPopulation]);
        } else {
            elite.forEach(function (el, i, arr) {
                //compare execute task time and ascribe to elite if time is best than worst time in elite
                if (timeOnProcessor(population[currentPopulation]) < timeOnProcessor(el)) {
                    //removing the worst time
                    arr.splice(i, 1);
                    arr.push(population[currentPopulation]);
                }
            });
        }
    }

    return elite;
}

/**
 * Calculate execute task time on processors
 *
 * @param currentPopulation object
 * @returns integer
 */
function timeOnProcessor(currentPopulation = null) {
    let time = [];
    for (let currentProcessor = 0; currentProcessor < inputData.numberOfProcess; currentProcessor++) {
        time[currentProcessor] = 0;
        for (let task in currentPopulation[currentProcessor]) {
            time[currentProcessor] += currentPopulation[currentProcessor][task]['timeOnProcessor' + currentProcessor];
        }
    }

    //return execute task time on processors
    return time.reduce((a, b) => a + b);
}

/**
 * Select the best time execute task from elite
 *
 * @param elite object
 * @returns integer
 */
function bestTimeOnProcessor(elite) {
    let bestTime = timeOnProcessor(elite['0']);

    for (let i = 0; i < eliteSize; i++) {
        if (timeOnProcessor(elite[i]) < bestTime) {
            bestTime = timeOnProcessor(elite[i]);
        }
    }

    return bestTime;
}

/**
 * Crossing each of each elite elements, return next population
 *
 * @param elite object
 * @returns Array
 */
function crossingEliteElements(elite = null) {
    let nextPopulation = [];

    for (let currentElement = 0; currentElement < elite.length; currentElement++) {
        for (let nextElement = 0; nextElement < elite.length; nextElement++) {
            if (currentElement !== nextElement) {
                nextPopulation.push(reproduction(elite[currentElement], elite[nextElement]));
            }
        }
    }

    return nextPopulation;
}

/**
 * Create object, size depend on the number of process
 *
 * @return Array
 */
function createTaskAllocationArray() {
    let array = {};
    for (let i = 0; i < inputData.numberOfProcess; i++) {
        array[i] = [];
    }

    return array;
}

/**
 * Creation of a child from mother and father through crossing them
 *
 * @param mother object
 * @param father object
 * @return Object
 */
function reproduction(mother = null, father = null) {
    let child = createTaskAllocationArray();

    //if random number is smaller than 0.5 then take assign task to processor from mother else from father
    for (let i = 1; i <= inputData.numberOfTasks; i++) {
        if (Math.random() < 0.5) {
            let task = findTaskByNumberTask(mother, i);
            //mutation child
            let processorMutation = mutation(task.currentProcessor);
            //create child
            child[processorMutation].push(mother[task.currentProcessor][task.currentTask]);
        } else {
            let task = findTaskByNumberTask(father, i);
            let processorMutation = mutation(task.currentProcessor);
            child[processorMutation].push(father[task.currentProcessor][task.currentTask]);
        }
    }

    return child;
}

/**
 * Find task by number task
 *
 * @param parent object
 * @param i integer
 * @return object
 */
function findTaskByNumberTask(parent, i) {
    for (let currentProcessor = 0; currentProcessor < inputData.numberOfProcess; currentProcessor++) {
        for (let currentTask in parent[currentProcessor]) {
            if (parent[currentProcessor][currentTask]['numberTask'] === i) {
                return {
                    currentProcessor: currentProcessor,
                    currentTask: parseInt(currentTask)
                };
            }
        }
    }
}

/**
 * Mutation child
 *
 * @param currentProcessor object
 * @return integer
 */
function mutation(currentProcessor) {
    let processor;

    //if random number is smaller than mutation probability then assign random number of processor else leave current processor unchanged
    if (Math.random() < mutationProbability) {
        processor = Math.floor(Math.random() * inputData.numberOfProcess);
    } else {
        processor = currentProcessor;
    }

    return processor;
}

/**
 * Generate input data to optimization
 *
 * @param numberOfTasks integer
 * @param numberOfProcess integer
 * @return object
 */
function generateInputData(numberOfTasks = null, numberOfProcess = null) {
    let initialData = {
        numberOfTasks: numberOfTasks,
        numberOfProcess: numberOfProcess,
        tasks: []
    };

    //generate tasks, size depend of number of tasks and number od processors
    for (let i = 1; i <= numberOfTasks; i++) {
        let tasks = {};
        tasks = Object.assign({}, {numberTask: i});

        for (let j = 0; j < numberOfProcess; j++) {
            tasks = Object.assign(tasks, {['timeOnProcessor' + j]: Math.floor(Math.random() * maxTimeOfProcess)});
        }

        initialData.tasks.push(tasks);
    }

    return initialData;
}

/**
 * Adding zero to the number if number is less than 10
 *
 * @param num integer
 * @return object
 */
function prettyTimeString(num) {
    return (num < 10 ? "0" : "") + num;
}

/**
 * Calculating execution time of the script
 *
 * @return {{hour: *, minute: *, second: *}}
 */
function stopwatch() {
    let currentTime = new Date();
    //execution script time in milliseconds
    let totalMilliseconds = currentTime - startTime;

    let currentHour = Math.floor(totalMilliseconds / 360000000);
    totalMilliseconds = totalMilliseconds % 360000000;

    let currentMinute = Math.floor(totalMilliseconds / 60000);
    totalMilliseconds = totalMilliseconds % 60000;

    let currentSecond = Math.floor(totalMilliseconds / 1000);

    if (displayHour != currentHour) {
        $('#hour').text(prettyTimeString(currentHour));
        displayHour = currentHour;
    }
    if (displayMinute != currentMinute) {
        $('#minute').text(prettyTimeString(currentMinute));
        displayMinute = currentMinute;
    }
    if (displaySecond != currentSecond) {
        $('#second').text(prettyTimeString(currentSecond));
        displaySecond = currentSecond;
    }

    return {
        hour: prettyTimeString(currentHour),
        minute: prettyTimeString(currentMinute),
        second: prettyTimeString(currentSecond)
    };
}

/**
 * Main function of script
 */
function main() {
    let stopwatchTime = stopwatch();
    $('#generation').text(generation++);
    crossedElements = crossingEliteElements(elite);
    nextGeneration = getEliteFromPopulation(crossedElements, eliteSize);
    let tmpTime = bestTimeOnProcessor(nextGeneration);

    if (generation == 1) $('#worstTime').text(worstTime + ' sek.');

    if (bestTime > tmpTime) {
        bestTime = tmpTime;
        generationTab.push(generation);
        bestTimeTab.push(bestTime);
        bestTimeTabExecuteTime.push(stopwatchTime.hour + ':' + stopwatchTime.minute + ':' + stopwatchTime.second);
        optimization = worstTime - bestTime;
        progressbar = ((bestTime * 100) / worstTime).toFixed(2);
        progressbar = 100 - parseInt(progressbar);

        //update fields in frontend
        $('#bestTime').text(bestTime + ' sek.');
        $('#optimization').text(optimization + ' sek.');
        $('#progressBar').text(progressbar + '%');
        $('#progressBar').css('width', progressbar + '%');
    } else if (worstTime < tmpTime) {
        worstTime = tmpTime;
        optimization = worstTime - bestTime;
        progressbar = ((bestTime * 100) / worstTime).toFixed(2);
        progressbar = 100 - parseInt(progressbar);

        //update fields in frontend
        $('#worstTime').text(worstTime + ' sek.');
        $('#optimization').text(optimization + ' sek.');
        $('#progressBar').text(progressbar + '%');
        $('#progressBar').css('width', progressbar + '%');
    }
}

/**
 * Start function
 */
function start() {
    //assigning initial variables form frontend
    numberOfTasks = $('#numberOfTasks').val();
    numberOfProcess = $('#numberOfProcessors').val();
    maxTimeOfProcess = $('#maxTimeOfProcess').val();
    populationSize = $('#populationSize').val();
    eliteSize = $('#eliteSize').val();
    mutationProbability = $('#mutationProbability').val();
    generationSize = $('#generationSize').val();
    startTime = new Date();

    //resetting variables
    generation = 0;
    $('#generation').text('0');
    $('#hh').text('00');
    $('#mm').text('00');
    $('#ss').text('00');
    $('#bestTime').text('0 sek.');
    $('#worstTime').text('0 sek.');
    $('#optimization').text('0 sek.');
    $('#progressBar').text('0%');
    $('#progressBar').css('width', '0%');

    //generate input data to optimization
    inputData = generateInputData(numberOfTasks, numberOfProcess);

    //create first(random) population from initial data
    population = assignRandomTasksToProcessors(populationSize);
    //get elite from population
    elite = getEliteFromPopulation(population, eliteSize);

    //get the best time on processor first elite
    bestTime = bestTimeOnProcessor(elite);
    worstTime = bestTimeOnProcessor(elite);

    //save result to array for chart
    bestTimeTab.push(bestTime);
    generationTab.push(generation);

    //stop condition
    if (threadId != -1) {
        stop();
    }

    //looping function "main()", this method allows refreshing the content of frontend elements during the execution of the script
    threadId = setInterval("main()", 0);
}


/**
 * Stop working script and update chart
 */
function stop() {
    clearInterval(threadId);
    window.myLine.update();
}

//config for chartJS
let config = {
    type: 'line',
    data: {
        labels: generationTab,
        datasets: [{
            label: 'Czas wykonania(sek)',
            backgroundColor: '#ffc107',
            borderColor: '#ffc107',
            data: bestTimeTab,
            fill: false,
        }]
    },
    options: {
        responsive: true,
        title: {
            display: true,
            text: 'Historia najlepszych wyników',
            fontSize: 18,
        },
        tooltips: {
            callbacks: {
                title: function (tooltipItem) {
                    return 'Generacja: ' + tooltipItem['0']['xLabel'];
                },
                label: function (tooltipItem) {
                    return 'Czas wykonania: ' + tooltipItem['yLabel'] + ' sek.';
                },
                afterLabel: function (tooltipItem) {
                    return 'W czasie: ' + bestTimeTabExecuteTime[tooltipItem['index']];
                }
            },
            intersect: false,
        },
        hover: {
            mode: 'nearest',
            intersect: true
        },
        scales: {
            xAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Generacja'
                }
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Najlepsze czasy wykonania'
                }
            }]
        }
    }
};

//draw chart in canvas field
window.onload = function () {
    let ctx = document.getElementById('canvas').getContext('2d');
    window.myLine = new Chart(ctx, config);
};