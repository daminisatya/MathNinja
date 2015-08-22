var choices;
function init() {
    // generate four initial choices
    choices = Array(4);
    for (var i = 0; i < 4; i++) {
        choices[i] = Math.round(10 + Math.random() * 89);
    }
    start_problem(choices);
    start_timer();
}

function start_timer() {
    tick();
    window.setInterval(tick, 1000);
}

Array.prototype.randomChoice = function () {
    return this[Math.floor(Math.random() * this.length)]
}

OPERATIONS = {
    "+": function (a, ans) { return ans - a; },
    "-": function (a, ans) { return a - ans; },
    "/": function (a, ans) { return a / ans; },
    "*": function (a, ans) { return ans / a; },
};

function make_problem(answer) {
    // randomly choose an operation
    var operation = Object.keys(OPERATIONS).randomChoice();
    var iters = 0;
    while (true) {
        if (iters == 100) {
            return make_problem(answer);
        }
        // randomly choose first number
        var firstOperand = Math.round(10 + Math.random() * 89);
        // solve for second operand
        var secondOperand = OPERATIONS[operation](firstOperand, answer);
        var isNegative = secondOperand < 0;
        var isComplexDecimal = (Math.round(secondOperand * 10) / 10) != secondOperand;
        if (isNegative || isComplexDecimal)
            iters++;
        else
            break;
    }
    return firstOperand + " " + operation + " " + secondOperand;
}

function start_problem() {
    var answer = choices.randomChoice();
    var problem = make_problem(answer);

    // show question
    $("#problem").html(problem);

    // show choices
    $("#choices").empty();
    for (var i = 0; i < choices.length; i++) {
        $("#choices").append("<a class='btn btn-success'>" + choices[i] + "</a>")
    }
    $("#choices a").click(function () {
        var guess = parseInt($(this).html(), 10);
        if (guess == answer) {
            // correct! remove choice, and next problem
            updateScore(score + 1);
            var answerIndex = choices.indexOf(answer);
            choices[answerIndex] = Math.round(10 + Math.random() * 89);
            start_problem();
        } else {
            // wrong!
            updateScore(score - 1);
        }
    });
}

var score = 0;
function updateScore(newscore) {
    score = newscore;
    $("#score").html(score);
}

function on_timer_end() {
    var message = "Your time is up!";
    $("#choices").html(message);
}

var time_left = 30;
function tick() {
    $("#time").html(time_left);
    time_left -= 1;
    if (time_left == 0) {
        on_timer_end();
    }
}

init();