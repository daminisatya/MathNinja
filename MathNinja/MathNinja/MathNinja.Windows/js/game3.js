var NUMBER_OF_PRIMES_ENABLED = $("#difficulty").val();
var NUMBER_OF_PRIMES_TO_CHOOSE = $("#difficulty").val();
var prime_nums = [2, 3, 5, 7, 11, 13, 17, 19, 23];

function choose_how_many_primes() {
    var lower = 4;
    var upper = NUMBER_OF_PRIMES_TO_CHOOSE;
    return lower + (Math.random() * (upper - lower));
}

function choose_which_primes(num_primes) {
    var res = {};
    for (var i = 0; i < num_primes; i++) {
        var index = Math.floor(Math.random() * NUMBER_OF_PRIMES_ENABLED);
        var chosen_prime = prime_nums[index];
        if (res[chosen_prime] === undefined) res[chosen_prime] = 0;
        res[chosen_prime] += 1;
    }
    return res;
}

function init() {
    $("#difficulty").change(function (nval) {
        var nval = $(this).val();;
        NUMBER_OF_PRIMES_ENABLED = parseInt(nval, 10);
        NUMBER_OF_PRIMES_TO_CHOOSE = parseInt(nval, 10);
    });
    start_problem();
    $("#next-problem").click(function () {
        start_problem();
        start_timer();
    });
}

function start_timer() {
    tick();
    window.setInterval(tick, 1000);
}

function multiply_out_dictionary(dict) {
    var answer = 1;
    primes = Object.keys(dict);
    for (var i = 0; i < primes.length; i++) {
        // calculate answer
        answer *= Math.pow(primes[i], dict[primes[i]]);
    }
    return answer;
}

function start_problem() {
    var num_primes = choose_how_many_primes();
    var problem = choose_which_primes(num_primes);

    var user_guess = {};

    // calculate answer
    var answer = multiply_out_dictionary(problem);

    // empty duh divs
    $("#add-prime-btns").empty();
    $("#remove-prime-btns").empty();
    $("#user-vals").empty();

    // make buttons
    for (var i = 0; i < num_primes; i++) {
        makeButton(prime_nums[i], 'add-prime btn-success', "#add-prime-btns");
        makeButton(0, "user-guess-btn btn disabled", "#user-vals", "id='user-guess-" + prime_nums[i] + "'");
        makeButton(prime_nums[i], 'remove-prime btn-danger', "#remove-prime-btns");
        user_guess[prime_nums[i]] = 0;
    }

    $("#problem").html(answer);
    // button handlers
    $(".add-prime").click(function () {
        var prime = $(this).html();
        // update user solution
        user_guess[prime] += 1;
        $("#user-guess-" + prime).html(user_guess[prime]);
        var user_answer = multiply_out_dictionary(user_guess);
        $("#user-solution").html(user_answer);
        if (user_answer == answer) {
            alert("You won! You're so cool!");
        }
    });

    $(".remove-prime").click(function () {
        var prime = $(this).html();
        // update user solution
        user_guess[prime] -= 1;
        user_guess[prime] = Math.max(0, user_guess[prime]);
        $("#user-guess-" + prime).html(user_guess[prime]);
        $("#user-solution").html(multiply_out_dictionary(user_guess));
    });

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
function makeButton(prime, additionalClass, parentEle, id) {
    if (id === undefined) id = "";
    var buttonHTML = "<button " + id + "class='btn " + additionalClass + " prime-btn'>" + prime + "</button>";
    $(parentEle).append(buttonHTML);
}

init();
