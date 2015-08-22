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
    });
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
    $("#next-problem").hide();

    // calculate answer
    var answer = multiply_out_dictionary(problem);

    // empty duh divs
    $("#prime-btns").empty();

    // make buttons
    for (var i = 0; i < num_primes; i++) {
        makeButton(prime_nums[i], 'add-prime btn-success', "#prime-btns");
    }

    $("#problem").html(answer);

    // button handlers
    $(".add-prime").click(function () {
        var prime = $(this).html();
        // update user solution
        if (problem[prime] > 0) {
            problem[prime] -= 1;
            answer /= prime;
            if (answer == 1) {
                updateScore(score + 10);
                $("#next-problem").show();
            }
        } else {
            updateScore(score - 1);
        }
        $("#problem").html(answer);
    });

}

var score = 0;
function updateScore(newscore) {
    score = newscore;
    $("#score").html(score);
}

function makeButton(prime, additionalClass, parentEle, id) {
    if (id === undefined) id = "";
    var buttonHTML = "<button " + id + "class='btn " + additionalClass + " prime-btn'>" + prime + "</button>";
    $(parentEle).append(buttonHTML);
}

init();
