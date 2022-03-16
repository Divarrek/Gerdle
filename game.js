var chars = ["a", "b", "d", "e", "f", "g", "i", "j", "k", "l", "m", "n", "o", "p", "r", "s", "t", "u", "v", "w", "y", "z"];
var startDate = new Date(2022, 0, 21, 0, 0, 0);

var lastKey = false;

var word = [];
var sortedWord = [];
var guess = [];
var guesses = 0;
var curTile = 0;
var won = false;
var result = '';
var grid = [];

var sendLetter = function (letter) {
    if (won) return;
    guess.push(letter);
    document.querySelectorAll("#board .game-row")[guesses].querySelectorAll(".game-tile")[curTile].textContent = letter;
    curTile++;
};

var getTheWord = function () {
    let curDate = new Date();
    let dateDiff = curDate - startDate;
    let wordId = (Math.floor(dateDiff / (3600 * 1000 * 24)));
    let theWord = dict[wordId].split("");
    for (let i = 0; i < theWord.length; i++) {
        if (theWord[i] == "q") {
            theWord[i] = "ch";
        }else if (theWord[i] == "x") {
            theWord[i] = "c'h";
        }
    }

    result = "Gerdle - Brezhoneg\nniv. " + (wordId + 1) + "\n";
    word = theWord;
    sortedWord = sortLetters(word);
};

var checkGuess = function () {
    let theGuess = guess.join("");
    if (theGuess == word.join("")) {
        won = true;

        for (let i = 0; i < guess.length; i++) {
            document.querySelectorAll("#board .game-row")[guesses].querySelectorAll(".game-tile")[i].classList.add("correct", "flipped");
        }
    } else if (guesses <= 6) {
        if (checkDict.indexOf(encodeWord(theGuess)) != -1) {
            let sortedGuess = sortLetters(guess);

            for (let i = 0; i < guess.length; i++) {
                if (guess[i] == word[i]) {
                    document.querySelectorAll("#board .game-row")[guesses].querySelectorAll(".game-tile")[i].classList.add("correct", "flipped");
                    $('.key[data-key="' + guess[i] + '"]').addClass("correct");
                    $('.key[data-key="' + guess[i] + '"]').removeClass("present");
                } else {
                    if (word.indexOf(guess[i]) != -1) {
                        if (sortedWord[guess[i]].length >= sortedGuess[guess[i]].length) {
                            document.querySelectorAll("#board .game-row")[guesses].querySelectorAll(".game-tile")[i].classList.add("present", "flipped");
                            $('.key[data-key="' + guess[i] + '"]').addClass("present");
                        } else {
                            let intersect = sortedWord[guess[i]].filter(value => sortedGuess[guess[i]].includes(value));
                            for (let j = 0; j < sortedWord[guess[i]].length; j++) {
                                if (i == sortedGuess[guess[i]][j] && j < sortedWord[guess[i]].length - intersect.length) {
                                    document.querySelectorAll("#board .game-row")[guesses].querySelectorAll(".game-tile")[i].classList.add("present", "flipped");
                                    $('.key[data-key="' + guess[i] + '"]').addClass("present");        
                                } else {
                                    document.querySelectorAll("#board .game-row")[guesses].querySelectorAll(".game-tile")[i].classList.add("incorrect", "flipped");
                                    $('.key[data-key="' + guess[i] + '"]').addClass("incorrect");
                                }
                            }
                        }
                    } else {
                        document.querySelectorAll("#board .game-row")[guesses].querySelectorAll(".game-tile")[i].classList.add("incorrect", "flipped");
                        $('.key[data-key="' + guess[i] + '"]').addClass("incorrect");
                    }
                } 
            }

            if (guesses == 5) {
                $('#error').removeClass('hidden');
                $('#error').text("Kollet ho peus, klaskit en dro warc'hoazh.");
            }
        } else {
            $('#error').removeClass('hidden');
            setTimeout(() => ($('#error').addClass('hidden')), 1000);
            for (let i = 0; i < guess.length; i++) {
                document.querySelectorAll("#board .game-row")[guesses].querySelectorAll(".game-tile")[i].textContent = "";
            }
            guess = [];
            curTile = 0;

            return;
        }
    } else {
        return;
    }

    if (guesses >= 5 || won) {
        if (won) {
            result += '' + (guesses + 1) + '\/ 6 \n';
            $("#modal-result p").text("Deuet eo ganeoc'h!");
        } else {
            result += 'X\/ 6 \n';
            $("#modal-result p").text("Klaskit en-dro warc'hoazh!");
        }

        for (let i = 0; i <= guesses; i++) {
            let line = '';
            for (let j = 0; j < document.querySelectorAll("#board .game-row")[i].querySelectorAll(".game-tile").length; j++) {
                if (document.querySelectorAll("#board .game-row")[i].querySelectorAll(".game-tile")[j].classList.contains('correct')) {
                    line += '🟩';
                } else if (document.querySelectorAll("#board .game-row")[i].querySelectorAll(".game-tile")[j].classList.contains('present')) {
                    line += '🟨';
                } else if (document.querySelectorAll("#board .game-row")[i].querySelectorAll(".game-tile")[j].classList.contains('incorrect')) {
                    line += '⬛';
                }
            }
            result += line + '\n';
        }
        result += '#bzhg';

        document.querySelector(".twitter-share-button").setAttribute("data-text", result);

        let s = document.createElement("script");
        s.type = "text/javascript";
        s.src = "share.js";
        $("body").append(s);
        
        $("#modal-result, #overlay").show();
    }

    grid.push(guess.slice(0));
    save();
    guess = [];
    guesses++;
    curTile = 0;
};

var encodeWord = function (word) {
    word = word.replaceAll(/c'h/g, "x");
    word = word.replaceAll(/ch/g, "q");
    return word;
};

var backspace = function () {
    lastKey = false;
    document.querySelectorAll("#board .game-row")[guesses].querySelectorAll(".game-tile")[curTile - 1].textContent = "";
    guess.pop();
    curTile--;
};

var sortLetters = function (word) {
    let theWord = [];
    for (let i = 0; i < word.length; i++) {
        if (typeof theWord[word[i]] === 'undefined') {
            theWord[word[i]] = [];
        }

        theWord[word[i]].push(i);
    }
    return theWord;
};

$(function() {
    getTheWord();

    $(document).on("keydown", function(e) {
        if (e.which == 8 && guesses < 6) {
            lastKey = false;
            if (lastKey == 99 || lastKey == 39 || guess.length == 0) { return; }
            backspace();
        }
    });

    $(".open-modal-help").on("click", function(e) {
        e.preventDefault();

        $("#modal-help, #overlay").show();
    });
    
    $("#overlay, .close-modal").on("click", function(e) {
        e.preventDefault();

        $(".modal, #overlay").hide();
    });

    $('.copy-result').on('click', function(e) {
        e.preventDefault();
        navigator.clipboard.writeText(result);
    });

    $(".key").on("click", function() {
        let that = $(this);
        if (guesses < 6) {
            switch (that.data("key")) {
                case "backspace" : backspace(); break;
                case "enter" : 
                    lastKey = false;
                    if (guess.length == 5) {
                        checkGuess();
                    }
                break;
                default : 
                    if (guess.length < 5) {
                        sendLetter(that.data("key"));
                    }
                break;
            }
        }
    });

    $(document).on("keypress", function(e) {
        if (guesses < 6) {
            switch (e.which) {
                case 13 :
                //return
                lastKey = false;
                if (guess.length == 5) {
                    checkGuess();
                }
                break;
                case 99 :
                //c
                if (guess.length < 5) {
                    lastKey = 99;
                }
                break;
                case 39 :
                // '
                e.preventDefault();
                if (lastKey == 99 && guess.length < 5) {
                    lastKey = 39;
                }
                break;
                case 104 :
                // h
                if (guess.length < 5) {
                    if (lastKey == 99) {
                        //ch
                        sendLetter("ch");
                    } else if (lastKey == 39) {
                        //c'h
                        sendLetter("c'h");
                    } else {
                        //h
                        sendLetter("h");
                    }
                }
                lastKey = false;
                break;
                default :
                    if (chars.indexOf(String.fromCharCode(e.which)) != -1 && guess.length < 5) {
                        sendLetter(String.fromCharCode(e.which));
                    }
                    lastKey = false;
                break;
            }
        }
    });
    load();
});

var save = function() {
    let today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    window.localStorage.setItem('grid', JSON.stringify(grid));
    window.localStorage.setItem('valable', today.getTime());
};

var load = function() {
    if (window.localStorage.getItem('grid') !== null &&window.localStorage.getItem('valable') !== null) {
        let valable = new Date(parseInt(window.localStorage.getItem('valable')));
        let today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
        if (valable.getTime() === today.getTime()) {
            var grid = JSON.parse(window.localStorage.getItem('grid'));
            for (let row in grid) {
                for (let cell in grid[row]) {
                    sendLetter(grid[row][cell]);
                }
                checkGuess();
            }
        }
    }
};