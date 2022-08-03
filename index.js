"use strict";

(function() {
  // MODULE GLOBAL VARIABLES, CONSTANTS, AND HELPER FUNCTIONS CAN BE PLACED HERE

  /**
  * Add a function that will be called when the window is loaded.
  */
  window.addEventListener("load", init);
  let totalQuestionsCounter = 0;
  let can;

  let setIntervalTimerIDs = [];
  let totalRoundCounter;
  let countingAnswerDiv;
  let countingAnswer;
  const COLORS = ["red", "blue", "green", "black", "purple", "pink", "orange"];
  const ANIMATIONS = ["growing", "spinning", "moving"];

  let peopleInHouse = 0;
  let totalIterations;
  let totalRoundCounterHousing;

  /**
  * CHANGE: Describe what your init function does here.
  */
  function init() {

    // window.localStorage.clear();

    if (window.localStorage.getItem("calculationsRules") != null) previousCalculationsRulesSetup();
    if (window.localStorage.getItem("countingRules") != null) previousCountingRulesSetup();
    if (window.localStorage.getItem("housingRules") != null) previousHousingRulesSetup();

    id("counting-button").addEventListener("click", menuToCounting);
    id("housing-button").addEventListener("click", menuToHousing);
    id("calculation-button").addEventListener("click", menuToCalculation);

    qs("#calculations-buttons .start").addEventListener("click", calculationRulesToGame);
    qs("#counting-buttons .start").addEventListener("click", countingRulesToGame);
    qs("#housing-buttons .start").addEventListener("click", housingRulesToGame);

    qs("#results button").addEventListener("click", calculationsResultsToMenu);
    qs("#counting-results button").addEventListener("click", countingResultsToMenu);
    let backButtons = qsa(".back-button");
    for (let i = 0; i < backButtons.length; i++) {
      backButtons[i].addEventListener("click", backToMenu);
    }

    let calculationSelectors = qsa("#calculations-rules p");
    for (let i = 0; i < calculationSelectors.length; i++) {
      calculationSelectors[i].addEventListener("click", calculationRulesSelector);
    }

    let countingSelectors = qsa("#counting-rules p");
    for (let i = 0; i < countingSelectors.length; i++) {
      countingSelectors[i].addEventListener("click", countingRulesSelector);
    }

    let housingSelectors = qsa("#housing-rules p");
    for (let i = 0; i < housingSelectors.length; i++) {
      housingSelectors[i].addEventListener("click", housingRulesSelector);
    }

    // setTimeout(() => {generatePeople()}, 5000);
  }

  function menuToCounting() {
    id("main-menu").classList.add("hidden");
    id("counting-menu").classList.remove("hidden");
  }

  function menuToHousing() {
    id("main-menu").classList.add("hidden");
    id("housing-menu").classList.remove("hidden");
  }

  function menuToCalculation() {
    id("main-menu").classList.add("hidden");
    id("calculations-menu").classList.remove("hidden");
  }

  function backToMenu() {
    id("main-menu").classList.remove("hidden");
    id("calculations-menu").classList.add("hidden");
    id("counting-menu").classList.add("hidden");
    id("housing-menu").classList.add("hidden");
  }

  function calculationRulesToGame() {
    let totalQuestions = qs("#amount").value;
    let maxNumber = qs("#max-number").value;
    let inputType = calculationsInputCheck();
    let operationsType = calculationsOperationsType();
    let termAmount = calculationsTermAmount();
    const MAXIMUM_QUESTIONS = 100;
    const MAXIMUM_NUMBER = 1000;

    // general check to see if all fields are filled out
    let filledOutCheck = totalQuestions === "" || inputType == null
    || operationsType.length === 0 || termAmount == null || maxNumber === "";

    // check if the question is within the limit
    let totalQuestionsCheck = Number(totalQuestions) < 0
    || Number(totalQuestions) > MAXIMUM_QUESTIONS;

    let maxNumberCheck = Number(maxNumber) < 0
    || Number(maxNumber) > MAXIMUM_NUMBER;

    if (filledOutCheck) {
      calculationsDisplayBlankValuesError();
    } else if (totalQuestionsCheck) {
      calculationsDisplayQuestionAmountError();
    } else if (maxNumberCheck) {
      calculationsMaxNumberError();
    } else {
      id("calculations-menu").classList.add("hidden");
      id("calculations-game").classList.remove("hidden");
      let converted = convertTextToSymbol(operationsType);
      setCalculationsRulesLocalStorage(totalQuestions, inputType, operationsType, termAmount, maxNumber);
      startCalculations(totalQuestions, inputType, converted, termAmount, maxNumber);
    }
  }

  function calculationsDisplayBlankValuesError() {
    qs("#calculations-buttons .start").removeEventListener("click", calculationRulesToGame);
    id("calculations-rules").classList.add("hidden");
    id("missing-error").classList.remove("hidden");
    setTimeout(() => {
      id("calculations-rules").classList.remove("hidden");
      id("missing-error").classList.add("hidden");
      qs("#calculations-buttons .start").addEventListener("click", calculationRulesToGame);
    }, 1000);
  }

  function calculationsDisplayQuestionAmountError() {
    qs("#calculations-buttons .start").removeEventListener("click", calculationRulesToGame);
    id("calculations-rules").classList.add("hidden");
    id("amount-error").classList.remove("hidden");
    setTimeout(() => {
      id("calculations-rules").classList.remove("hidden");
      id("amount-error").classList.add("hidden");
      qs("#calculations-buttons .start").addEventListener("click", calculationRulesToGame);
    }, 1000);
  }

  function calculationsMaxNumberError() {
    qs("#calculations-buttons .start").removeEventListener("click", calculationRulesToGame);
    id("calculations-rules").classList.add("hidden");
    id("max-number-error").classList.remove("hidden");
    setTimeout(() => {
      id("calculations-rules").classList.remove("hidden");
      id("max-number-error").classList.add("hidden");
      qs("#calculations-buttons .start").addEventListener("click", calculationRulesToGame);
    }, 1000);
  }

  function calculationsInputCheck() {
    let inputType;
    let inputs = qsa("#input-type p");
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].classList.contains("selected")) {
        inputType = inputs[i].textContent;
      } else if (inputType !== undefined && inputs[i].classList.contains("selected")) {
        console.error("Both inputs selected");
      }
    }
    return inputType;
  }

  function calculationsOperationsType() {
    let operationsType = [];
    let operationsOptions = qsa("#operations-type p");
    for (let i = 0; i < operationsOptions.length; i++) {
      if (operationsOptions[i].classList.contains("selected")) {
        operationsType.push(operationsOptions[i].textContent);
      }
    }
    return operationsType;
  }

  function calculationsTermAmount() {
    let termAmount;
    let termAmountSelector = qsa("#operations-amount p");
    for (let i = 0; i < termAmountSelector.length; i++) {
      if (termAmountSelector[i].classList.contains("selected")) {
        termAmount = termAmountSelector[i].textContent;
      } else if (termAmount !== undefined && termAmountSelector[i].classList.contains("selected")) {
        console.error("Multiple inputs selected");
      }
    }
    return termAmount;
  }

  function convertTextToSymbol(operationType) {
    let converted = [];
    for (let i = 0; i < operationType.length; i++) {
      if (operationType[i] === "Addition") converted.push("+");
      if (operationType[i] === "Subtraction") converted.push("-");
      if (operationType[i] === "Multiplication") converted.push("*");
      if (operationType[i] === "Division") converted.push("/");
    }
    return converted;
  }

  function calculationRulesSelector() {
    if (this.parentNode.id === "input-type") {
      let buttons = qsa("#input-type p");
      for (let i = 0; i < buttons.length; i++) {
        if (buttons[i] !== this) {
          buttons[i].classList.remove("selected");
        } else {
          this.classList.toggle("selected");
        }
      }
    } else if (this.parentNode.id === "operations-amount") {
      let buttons = qsa("#operations-amount p");
      for (let i = 0; i < buttons.length; i++) {
        if (buttons[i] !== this) {
          buttons[i].classList.remove("selected");
        } else {
          this.classList.toggle("selected");
        }
      }
     } else {
      this.classList.toggle("selected");
     }
  }

  function setCalculationsRulesLocalStorage(totalQuestions, inputType, operationsType, termAmount, maxNumber) {
    let rules = {
      "totalQuestions": totalQuestions,
      "inputType": inputType,
      "operationsType": operationsType,
      "termAmount": termAmount,
      "maxNumber": maxNumber
    }

    window.localStorage.setItem("calculationsRules", JSON.stringify(rules));
  }

  function previousCalculationsRulesSetup() {
    let rules = JSON.parse(window.localStorage.getItem("calculationsRules"));
    id("amount").value = rules["totalQuestions"];
    id("max-number").value = rules["maxNumber"];

    let inputsElement = qsa("#input-type p");
    for (let i = 0; i < inputsElement.length; i++) {
      if (inputsElement[i].textContent === rules["inputType"]) {
        inputsElement[i].classList.add("selected");
      }
    }

    let termAmountsElement = qsa("#operations-amount p");
    for (let i = 0; i < termAmountsElement.length; i++) {
      if (termAmountsElement[i].textContent === rules["termAmount"]) {
        termAmountsElement[i].classList.add("selected");
      }
    }

    let set = new Set();
    let operationsType = rules["operationsType"]
    let operationsTypeElements = qsa("#operations-type p");

    for (let i = 0; i < operationsType.length; i++) {
      set.add(operationsType[i]);
    }

    for (let i = 0; i < operationsTypeElements.length; i++) {
      if (set.has(operationsTypeElements[i].textContent)) operationsTypeElements[i].classList.add("selected");
    }
  }

  function startCalculations(totalQuestions, inputType, operationsType, termAmount, maxNumber) {

    // general rules to keep track of
    // - amount of questions
    // - input type
    // - operations
    // Maximum amount of Operations

    start();

    let parentElement = id("user-section");
    let displayedQuestionAmount = 10;

    displayEquations(operationsType, termAmount, displayedQuestionAmount, maxNumber);

    if (inputType === "Write") {
      let canvasElement = gen("canvas");
      canvasElement.id = "can";
      canvasElement.width = "500";
      canvasElement.height = "550";
      parentElement.prepend(canvasElement);
      can = new handwriting.Canvas(id("can"));

      can.setCallBack(function(data) {
        checkAnswer(data, can);
      });

      can.setOptions(
        {
          language: "en",
          numOfReturn: 5
        }
      );

      // id("can").addEventListener("click", () => {
      //   can.recognize();
      // });



      ["click", "touchend"].forEach(function(e) {
        id("can").addEventListener(e,() => {
          can.recognize();
        });
      });

      qs("#user-section button").addEventListener("click", () => {
        can.erase();
        clearCurrentQuestion();
      });

      qsa("#user-section button")[1].addEventListener("click", () =>  {
        can.erase();
        skipQuestion();
      });
    } else {
      let inputElement = gen("input");
      inputElement.type = "number";
      inputElement.id = "type-input";
      inputElement.name = "type-input";
      parentElement.prepend(inputElement);

      id("type-input").addEventListener("keyup", () => {
        let inputElementData = id("type-input").value;
        if (inputElementData !== "") {
          checkAnswer([inputElementData], null);
        } else {
          clearCurrentQuestion();
        }
      })

      qsa("#user-section button")[0].addEventListener("click", () => {
        id("type-input").value = "";
        clearCurrentQuestion();
      });

      qsa("#user-section button")[1].addEventListener("click", () => {
        id("type-input").value = "";
        skipQuestion();
      });


    }
  }

  function clearCurrentQuestion() {
    let currentQuestion = qs("#current-question h4");
    let currentQuestionText = currentQuestion.textContent.match(/^[^=]*/)[0];
    currentQuestion.textContent = currentQuestionText + "=";
  }

  function checkAnswer(data, can) {

    if (data == null) { //undefined and null
      return;
    }

    let parsedData = []; // only numbers
    let currentQuestion = qs("#current-question h4");

    //Gets rid of the "="
    let currentQuestionText = currentQuestion.textContent.match(/^[^=]*/)[0];
    let answer = math.evaluate(currentQuestionText);

    for (let i = 0; i < data.length; i++) {
      if (!isNaN(data[i])) {
        parsedData.push(data[i]);
      }
    }

    if (Number(parsedData[0]) === Number(answer) && parsedData.length > 0) {
      currentQuestion.textContent = currentQuestionText + "=" + parsedData[0];

      //endgame, checks if the last question
      if (id("current-question").nextElementSibling == null) {
        id("score").textContent = Number(id("score").textContent) + 1;
        appendCheckmark();
        playCorrectAnswerSound();
        calculationsEndgame();
        return;
      }

      if (can != null) {
        can.erase();
      } else {
        id("type-input").value = "";
      }


      playCorrectAnswerSound();
      id("score").textContent = Number(id("score").textContent) + 1;
      appendCheckmark();
      nextQuestion();
    } else if (parsedData.length > 0) {
      let newText = currentQuestionText + "=" + parsedData[0];
      currentQuestion.textContent = newText;
    } else {
      currentQuestion.textContent = currentQuestionText + "=";
    }

  }

  function nextQuestion() {

    //endgame might be better here. depends if you want to clear the input or not/
    let startSpace = qs("#questions div");
    if (startSpace.id === "start-space-0") {
      qs("#questions div").id = "start-space-1";
      moveCurrentQuestion();
    } else if (startSpace.id === "start-space-1") {
      qs("#questions div").id = "start-space-2";
      moveCurrentQuestion();
    } else {
      moveCurrentQuestion();
      moveQuestionScroll();
      clearAllEventListeners(qsa("#user-section button")[1])
      setTimeout(() => {
        let currentQuestion = id("current-question");
        let questions = currentQuestion.parentNode;
        let index = Array.prototype.indexOf.call(questions.children, currentQuestion);

        if (index >= 4) {
          moveQuestionScroll();
        }

        let input = getInputType();

        if (input.id === "can") {
          qsa("#user-section button")[1].addEventListener("click", () => {
            can.erase();
            skipQuestion();
          });
        } else if (input.id === "type-input") {
          qsa("#user-section button")[1].addEventListener("click", () => {
            id("type-input").value = "";
            skipQuestion();
          });
        }

      }, 500);
      //displays the next question, if no more questions, endgame happens
      displayEquations(convertTextToSymbol(calculationsOperationsType()), calculationsTermAmount(), 1, calculationsMaxNumber());
    }


  }

  function calculationsMaxNumber () {
    return id("max-number").value;
  }

  function moveCurrentQuestion() {
    let oldCurrentQuestion = id("current-question");
    let newCurrentQuestion = oldCurrentQuestion.nextElementSibling;
    id("current-question").id = "";
    newCurrentQuestion.id = "current-question";
  }

  function appendCheckmark() {
    let oldCurrentQuestion = id("current-question");
    let image = gen("img");
    image.src = "img/checkmark.png";
    image.alt = "green checkmark";
    image.classList.add("checkmark");
    oldCurrentQuestion.appendChild(image);
  }

  function playCorrectAnswerSound() {
    let sound = new Audio("sound/correct.mp3");
    sound.play();
  }

  function playSkipSound() {
    let sound = new Audio("sound/incorrect.mp3");
    sound.play();
  }

  function playWinSound() {
    let sound = new Audio("sound/win-sound.mp3");
    sound.play();
  }

  function generateQuestions(totalQuestions, operationsType, termAmount, maxNumber) {

    let equations = [];
    while (equations.length < totalQuestions) {
      let termOne = getRandomInt(maxNumber);
      let termTwo = getRandomInt(maxNumber);
      let termThree = getRandomInt(maxNumber);
      let termFour = getRandomInt(maxNumber);
      let operationOne = operationsType[getRandomInt(operationsType.length-1)];
      let operationTwo = operationsType[getRandomInt(operationsType.length-1)];
      let operationThree = operationsType[getRandomInt(operationsType.length-1)];

      let amountOfTerms = getRandomIntBetween(2, Number(termAmount) + 1);
      let currentEquation = termOne + operationOne + termTwo;

      if (amountOfTerms === 3) {
        currentEquation = termOne + operationOne + termTwo + operationTwo + termThree;
        if (currentEquation.includes("*") || currentEquation.includes("/")) {
          let zeroOrOne = getRandomInt(2);
          if (zeroOrOne === 0) {
            currentEquation = "(" + termOne + operationOne + termTwo + ")" + operationTwo + termThree;
          } else {
            currentEquation = termOne + operationOne + "(" + termTwo + operationTwo + termThree + ")";
          }
        }
      }

      if (amountOfTerms === 4) {
        currentEquation = "(" + termOne + operationOne + termTwo + ")"
        + operationTwo + "(" + termThree + operationThree + termFour + ")";
      }

      let result = math.evaluate(currentEquation);

      //forces only whole and actual answers to be in the question pool
      if (result !== Infinity && result % 1 === 0) {
        equations.push(currentEquation);
      }
    }

    return equations;
  }

  function displayEquations(operationsType, termAmount, questionAmount, maxNumber) {
    if (totalQuestionsCounter === 0 && qs(".equation") == null) {
      totalQuestionsCounter = id("amount").value;
    } else if (totalQuestionsCounter === 0) {
      return; // stop generating questions
    }

    let displayedQuestions = questionAmount;
    if (questionAmount >= totalQuestionsCounter) {
      displayedQuestions = totalQuestionsCounter;
    }

    let equations = generateQuestions(displayedQuestions, operationsType, termAmount, maxNumber);
    let questionBox = qs("#questions");
    for (let i = 0; i < displayedQuestions; i++) {
      let currentEquation = gen("div");
      let h4 = gen("h4");
      currentEquation.appendChild(h4);
      currentEquation.classList.add("equation");

      // checks if there is no questions
      if (i === 0 && qs(".equation") == null) {
        currentEquation.id = "current-question";
      }

      h4.textContent = equations[i] + "=";
      questionBox.appendChild(currentEquation);
    }

    totalQuestionsCounter = totalQuestionsCounter - displayedQuestions;
  }

  function calculationsEndgame() {
    playWinSound();
    stop();
    updateStats();
    clearCalculationState();
    transitionToResults();
  }

  function moveQuestionScroll() {
    let questions = qsa("#questions div");
    let transitionElement = qs("#questions div");
    transitionElement.id = "start-space-removed-transition";
    let topQuestion = questions[1];
    setTimeout(() => {
      transitionElement.style.transition = "0s";
      topQuestion.remove();
      transitionElement.id = "start-space-2";
    }, 500);
    transitionElement.style.transition = "0.25s";
  }

  function updateStats() {
    let questionAmount = id("amount").value;
    let inputType = calculationsInputCheck();
    let operationsType = calculationsOperationsType();
    let termAmount = calculationsTermAmount();
    let maxNumber = id("max-number").value;

    let endingTime = id("display-area").textContent;
    let score = id("score").textContent;
    let skips = Number(questionAmount) - Number(score);
    let rulesElements = qsa("#results div div span");
    let operationsString = operationsType.join(" ");


    rulesElements[0].textContent = questionAmount;
    rulesElements[1].textContent = inputType;
    rulesElements[2].textContent = operationsString;
    rulesElements[3].textContent = termAmount;
    rulesElements[4].textContent = maxNumber;

    let statsElements = qsa("#stats div");
    let scoreElement = statsElements[0];
    let timeElement = statsElements[1];
    let skipsElement = statsElements[2];

    scoreElement.children[1].textContent = score;
    timeElement.children[1].textContent = endingTime;
    skipsElement.children[1].textContent = skips;
  }

  function transitionToResults() {
    id("calculations-game").classList.add("hidden");
    id("results").classList.remove("hidden");
  }

  function skipQuestion() {
    appendX();
    nextQuestion();
    playSkipSound();
  }

  function appendX() {
    let oldCurrentQuestion = id("current-question");
    let image = gen("img");
    image.src = "img/x-mark.png";
    image.alt = "red letter X";
    image.classList.add("x-mark");
    oldCurrentQuestion.appendChild(image);
  }

  function calculationsResultsToMenu() {
    id("results").classList.add("hidden");
    id("main-menu").classList.remove("hidden");
  }

  function clearCalculationState() {
    stop();
    reset();
    id("questions").innerHTML = "";

    let spacingElement = gen("div");
    spacingElement.id = "start-space-0";

    id("questions").appendChild(spacingElement);
    id("score").textContent = 0;

    let inputType = getInputType();
    inputType.remove();

    let userButtons = qsa("#user-section button");

    for (let i = 0; i < userButtons.length; i++) {
      clearAllEventListeners(userButtons[i]);
    }

    can = undefined;

  }

  function getInputType() {
    let inputType;

    if(id("can") != null) inputType = id("can");
    if(id("type-input") != null) inputType = id("type-input");

    return inputType;
  }


  function housingRulesSelector() {
    let buttons;
    if (this.parentNode.id ===  "housing-input-type") {
      buttons = qsa("#housing-input-type p");
    } else {
      this.classList.toggle("selected");
      return;
    }

    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i] !== this) {
        buttons[i].classList.remove("selected");
      } else {
        this.classList.toggle("selected");
      }
    }
  }

  function countingRulesSelector() {

    // need to redo later, works but is sloppy. i.e need to make a universal function for all rule
    // pages to work with one function but would require a full rewrite of the function (?).

    let buttons;

    if (this.parentNode.id ===  "counting-input-type") {
      buttons = qsa("#counting-input-type p");
    } else if (this.parentNode.id === "counting-animations-check") {
      buttons = qsa("#counting-animations-check p");
    } else {
      this.classList.toggle("selected");
      return;
    }

    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i] !== this) {
        buttons[i].classList.remove("selected");
      } else {
        this.classList.toggle("selected");
      }
    }
  }

  function countingRulesToGame() {
    let roundAmount = id("rounds").value;
    let inputType = countingInputType();
    let animationCheck = countingAnimationsValueCheck();
    let filledOutCheck = roundAmount === "" || inputType == null || animationCheck == null;
    let roundAmountCheck = Number(roundAmount) <= 0;

    if (roundAmountCheck) {
      countingDisplayRoundError();
    } else if (filledOutCheck) {
      countingDisplayBlankValuesError();
    } else {
      id("counting-menu").classList.add("hidden");
      id("counting-game").classList.remove("hidden");
      setCountingRulesLocalStorage(roundAmount, inputType, animationCheck);
      startCounting(roundAmount, inputType, animationCheck);
    }
  }

  function setCountingRulesLocalStorage(roundAmount, inputType, animationCheck) {
    let rules = {
      "roundAmount": roundAmount,
      "inputType": inputType,
      "animationCheck": animationCheck
    }

    window.localStorage.setItem("countingRules", JSON.stringify(rules));
  }

  function previousCountingRulesSetup() {
    let rules = JSON.parse(window.localStorage.getItem("countingRules"));
    id("rounds").value = rules["roundAmount"];

    let inputsElement = qsa("#counting-input-type p");
    for (let i = 0; i < inputsElement.length; i++) {
      if (inputsElement[i].textContent === rules["inputType"]) {
        inputsElement[i].classList.add("selected");
      }
    }

    let animationText = "Disabled";
    if (rules["animationCheck"]) {
      animationText = "Enabled";
    }

    let animationElement = qsa("#counting-animations-check p");
    for (let i = 0; i < animationElement.length; i++) {
      if (animationElement[i].textContent === animationText) {
        animationElement[i].classList.add("selected");
      }
    }
  }

  function startCounting(roundAmount, inputType, animationCheck) {

    start();


    totalRoundCounter = Number(roundAmount);
    let parentElement = id("user-section-counting");


    displayRoundCounting(roundAmount, animationCheck);

    if (inputType === "Write") {
      let canvasElement = gen("canvas");
      canvasElement.id = "can";
      canvasElement.width = "500";
      canvasElement.height = "550";
      parentElement.prepend(canvasElement);
      can = new handwriting.Canvas(id("can"));

      can.setCallBack(function(data) {
        checkAnswerCounting(data, can);
      });

      can.setOptions(
        {
          language: "en",
          numOfReturn: 5
        }
      );

      ["click", "touchend"].forEach(function(e) {
        id("can").addEventListener(e,() => {
          can.recognize();
        });
      });

      qs("#user-section-counting button").addEventListener("click", () => {
        can.erase();
        clearCurrentQuestionCounting();
      });

      qsa("#user-section-counting button")[1].addEventListener("click", () =>  {
        can.erase();
        skipQuestionCounting();
      });
    } else {
      let inputElement = gen("input");
      inputElement.type = "number";
      inputElement.id = "type-input";
      inputElement.name = "type-input";
      parentElement.prepend(inputElement);

      id("type-input").addEventListener("keyup", () => {
        let inputElementData = id("type-input").value;
        if (inputElementData !== "") {
          checkAnswerCounting([inputElementData], null);
        } else {
          clearCurrentQuestionCounting();
        }
      })

      qsa("#user-section-counting button")[0].addEventListener("click", () => {
        id("type-input").value = "";
        clearCurrentQuestionCounting();
      });

      qsa("#user-section-counting button")[1].addEventListener("click", () => {
        id("type-input").value = "";
        skipQuestionCounting();
      });
    }
  }

  function displayRoundCounting(roundAmount, animations) {

    // if (Number(roundAmount) === 0) {
    //   countingEndgame();
    // }

    const MINIMUM_NUMBER = 5;
    const MAXIMUM_NUMBER = 20;

    let divAmount = getRandomIntBetween(MINIMUM_NUMBER, MAXIMUM_NUMBER);
    let divs = generateCountingDivs(divAmount, animations);

    for (let i = 0; i < divs.length; i++) {
      let currentDiv = divs[i];
      let pElement = currentDiv.children[0];

      id("questions-counting").appendChild(currentDiv);

      if (pElement.classList.contains("moving")) {
        movingDiv(pElement, pElement.style.left, pElement.style.top);
      }
    }

    getAnswerToQuestionPrompt();
  }

  function getAnswerToQuestionPrompt() {

    countingAnswer = null;

    let answerElement = countingAnswerDiv.cloneNode(true);
    let answerTextContent = answerElement.textContent;
    let answerFontColor = answerElement.style.color;

    let answerAnimation;
    for (let i = 0; i < ANIMATIONS.length; i++) {
      if (answerElement.classList.contains(ANIMATIONS[i])) answerAnimation = ANIMATIONS[i];
    }

    let words = qsa("#questions-counting div p");
    let counter = 0;
    for (let i = 0; i < words.length; i++) {
      let currentWord = words[i];
      let equals;

      if (answerAnimation == null) {

        let hasAnimationCheck = false;
        for (let i = 0; i < ANIMATIONS.length; i++) {
          if (currentWord.classList.contains(ANIMATIONS[i])) hasAnimationCheck = true;
        }

        equals = currentWord.textContent === answerTextContent &&
        !hasAnimationCheck &&
        currentWord.style.color === answerFontColor;
      } else {
        equals = currentWord.textContent === answerTextContent &&
        currentWord.classList.contains(answerAnimation) &&
        currentWord.style.color === answerFontColor;
      }

      if (equals) counter++;
    }

    countingAnswer = counter;
  }

  function generateCountingDivs(divAmount, animations) {
    let randomInt = getRandomIntBetween(3, divAmount);
    let basisDivs = [];

    for (let i = 0; i < randomInt; i++) {
      let currentDiv = gen("div");
      let currentP = gen("p");

      currentDiv.appendChild(currentP);
      currentP.textContent = COLORS[getRandomIndex(COLORS)];
      currentP.style.color = COLORS[getRandomIndex(COLORS)];

      if (animations && Math.random() < 0.5) {
        currentP.classList.add(ANIMATIONS[getRandomIndex(ANIMATIONS)]);
      }

      basisDivs.push(currentDiv);
    }

    let countingDivs = [];
    for (let i = 0; i < divAmount; i++) {
      let randomDiv = basisDivs[getRandomIndex(basisDivs)];
      let cloneDiv = randomDiv.cloneNode(true);
      countingDivs.push(cloneDiv);
    }

    let area = id("questions-counting");

    //positioning
    for (let i = 0; i < countingDivs.length; i++) {
      let element = countingDivs[i].children[0];
      let xPosition = getRandomIntBetween(1, area.clientWidth);

      while (xPosition + element.clientWidth + 100 >= area.clientWidth) {
        xPosition = getRandomIntBetween(1, area.clientWidth);
      }

      let yPosition = getRandomIntBetween(1, area.clientHeight);
      while (yPosition + element.clientHeight + 100 >= area.clientHeight || yPosition <= id("question-prompt").offsetHeight + 75) {
        yPosition = getRandomIntBetween(id("question-prompt").offsetHeight,area.clientHeight);
      }

      element.style.left = xPosition + "px";
      element.style.top = yPosition + "px";
    }

    generateQuestionPromptCounting(basisDivs, ANIMATIONS);
    return countingDivs;
  }

  function generateQuestionPromptCounting(basisDivs, animations) {
    let randomDiv = basisDivs[getRandomIndex(basisDivs)].cloneNode(true).children[0];
    let spanPrompts = qsa("#question-prompt span");
    let animationSpan = spanPrompts[0];
    let matchingSpan = spanPrompts[1];

    countingAnswerDiv = randomDiv.cloneNode(true);

    let randomDivAnimation;
    for (let i = 0; i < animations.length; i++) {
      if (randomDiv.classList.contains(animations[i])) {
        randomDivAnimation = animations[i];
        randomDiv.classList.remove(animations[i]);
      }
    }

    if (randomDivAnimation != null) {
      animationSpan.textContent = randomDivAnimation;
    } else {
      animationSpan.textContent = "motionless"; // could use static but static kinda a complex word
    }

    matchingSpan.appendChild(randomDiv);
  }

  function movingDiv(element, xPositionElement, yPositionElement) {
    const FPS = 75;
    let area = id("questions-counting");

    let xPosition = Number(xPositionElement.match(/^[0-9]+/)[0]);
    let yPosition = Number(yPositionElement.match(/^[0-9]+/)[0]);
    let xSpeed = getRandomIntBetween(1,5);
    let ySpeed = getRandomIntBetween(1,5);

    if (Math.random() < 0.5) xSpeed = -xSpeed;
    if (Math.random() < 0.5) ySpeed = -ySpeed;

    let timerID = setInterval(() => {
      element.id = timerID;
      if (xPosition + element.clientWidth > area.clientWidth - 10 || xPosition < 0) xSpeed = -xSpeed;
      if (yPosition + element.clientHeight > area.clientHeight - 50 || yPosition < id("question-prompt").clientHeight) ySpeed = -ySpeed;

      xPosition = xPosition + xSpeed;
      yPosition = yPosition + ySpeed;

      updatePosition(element, xPosition, yPosition);
    }, 1000/FPS);

    setIntervalTimerIDs.push(timerID);
  }

  function updatePosition(element, xPosition, yPosition) {
    element.style.left = xPosition + "px";
    element.style.top = yPosition + "px";
  }

  function checkAnswerCounting(data, can) {

    if (data == null) { //undefined and null
      return;
    }

    let parsedData = []; // only numbers
    for (let i = 0; i < data.length; i++) {
      if (!isNaN(data[i])) {
        parsedData.push(data[i]);
      }
    }

    if (Number(parsedData[0]) === Number(countingAnswer) && parsedData.length > 0) {

      if (can != null) {
        can.erase();
      } else {
        id("type-input").value = "";
      }

      playCorrectAnswerSound();
      id("counting-score").textContent = Number(id("counting-score").textContent) + 1;
      nextRound();
    } else if (parsedData.length > 0) {
      id("user-answer").textContent = parsedData[0];
    } else {
      id("user-answer").textContent = "";
    }
  }

  function nextRound() {
    totalRoundCounter = totalRoundCounter - 1;

    if (totalRoundCounter === 0) {
      countingEndgame();
      return;
    }

    clearCountingDivs();
    displayRoundCounting(totalRoundCounter, countingAnimationsValueCheck());
  }

  function clearCountingDivs() {
    clearAllSetIntervals();
    qs("#question-prompt span").textContent = "";
    qs("#question-prompt span p").remove();
    let countingDivs = qsa("#questions-counting div");
    for (let i = 0; i < countingDivs.length; i++) { countingDivs[i].remove(); }
  }

  function countingEndgame() {
    countingUpdateStats();
    clearCountingState();
    playWinSound();
    id("counting-game").classList.add("hidden");
    id("counting-results").classList.remove("hidden");
  }

  function clearCountingState() {
    clearCountingDivs();
    stop();
    reset();

    let inputType = getInputType();
    inputType.remove();

    let userButtons = qsa("#counting-user-section button");
    for (let i = 0; i < userButtons.length; i++) {
      clearAllEventListeners(userButtons[i]);
    }

    id("counting-score").textContent = "0";

    can = undefined;
  }

  function countingUpdateStats() {

    let roundAmount = id("rounds").value;
    let inputType = countingInputType();

    let animationCheck = countingAnimationsValueCheck();
    let animationText = "Disabled";
    if (animationCheck) { animationText = "Enabled"; }

    let endingTime = id("counting-display-area").textContent;
    let score = id("counting-score").textContent;
    let skips = Number(roundAmount) - Number(score);
    let rulesElements = qsa("#counting-results div div span");

    rulesElements[0].textContent = roundAmount;
    rulesElements[1].textContent = inputType;
    rulesElements[2].textContent = animationText;

    let statsElements = qsa("#counting-stats div");
    let scoreElement = statsElements[0];
    let timeElement = statsElements[1];
    let skipsElement = statsElements[2];

    scoreElement.children[1].textContent = score;
    timeElement.children[1].textContent = endingTime;
    skipsElement.children[1].textContent = skips;
  }

  function clearCurrentQuestionCounting() {
    id("user-answer").textContent = "";
    if (can) can.erase();
    if (id("type-input")) id("type-input").value = "";

  }

  function skipQuestionCounting() {
    playSkipSound();
    clearCurrentQuestionCounting();
    nextRound();
  }

  function countingInputType() {
    let inputType;
    let inputs = qsa("#counting-input-type p");
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].classList.contains("selected")) {
        inputType = inputs[i].textContent;
      } else if (inputType !== undefined && inputs[i].classList.contains("selected")) {
        console.error("Both inputs selected");
      }
    }
    return inputType;
  }

  function countingAnimationsValueCheck() {
    let animationCheck;
    let boolean = false;
    let inputs = qsa("#counting-animations-check p");
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].classList.contains("selected")) {
        animationCheck = inputs[i].textContent;
      } else if (animationCheck !== undefined && inputs[i].classList.contains("selected")) {
        console.error("Both inputs selected");
      }
    }

    if (animationCheck === "Enabled") {
      boolean = true;
    }

    return boolean;
  }

  function countingDisplayBlankValuesError() {
    qs("#counting-buttons .start").removeEventListener("click", countingRulesToGame);
    id("counting-rules").classList.add("hidden");
    id("counting-missing-error").classList.remove("hidden");
    setTimeout(() => {
      id("counting-rules").classList.remove("hidden");
      id("counting-missing-error").classList.add("hidden");
      qs("#counting-buttons .start").addEventListener("click", countingRulesToGame);
    }, 1000);
  }

  function countingDisplayRoundError() {
    qs("#counting-buttons .start").removeEventListener("click", countingRulesToGame);
    id("counting-rules").classList.add("hidden");
    id("round-number-error").classList.remove("hidden");
    setTimeout(() => {
      id("counting-rules").classList.remove("hidden");
      id("round-number-error").classList.add("hidden");
      qs("#counting-buttons .start").addEventListener("click", countingRulesToGame);
    }, 1000);
  }

  function countingResultsToMenu() {
    id("counting-results").classList.add("hidden");
    id("main-menu").classList.remove("hidden");
  }

  function housingInputCheck() {
    let inputType;
    let inputs = qsa("#housing-input-type p");
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].classList.contains("selected")) {
        inputType = inputs[i].textContent;
      } else if (inputType !== undefined && inputs[i].classList.contains("selected")) {
        console.error("Both inputs selected");
      }
    }
    return inputType;
  }

  function housingRulesToGame() {
    let roundAmount = id("rounds-housing").value;
    let inputType = housingInputCheck();

    let filledOutCheck = roundAmount === "" || inputType == null;
    let roundAmountCheck = Number(roundAmount) <= 0;

    if (roundAmountCheck) {
      housingDisplayRoundError();
    } else if (filledOutCheck) {
      housingDisplayBlankValuesError();
    } else {
      id("housing-menu").classList.add("hidden");
      id("housing-game").classList.remove("hidden");
      setHousingRulesLocalStorage(roundAmount, inputType);
      startHousing(roundAmount, inputType);
    }
  }


  function housingDisplayBlankValuesError() {
    qs("#housing-buttons .start").removeEventListener("click", housingRulesToGame);
    id("housing-rules").classList.add("hidden");
    id("housing-missing-error").classList.remove("hidden");
    setTimeout(() => {
      id("housing-rules").classList.remove("hidden");
      id("housing-missing-error").classList.add("hidden");
      qs("#housing-buttons .start").addEventListener("click", housingRulesToGame);
    }, 1000);
  }

  function housingDisplayRoundError() {
    qs("#housing-buttons .start").removeEventListener("click", housingRulesToGame);
    id("housing-rules").classList.add("hidden");
    id("housing-round-number-error").classList.remove("hidden");
    setTimeout(() => {
      id("housing-rules").classList.remove("hidden");
      id("housing-round-number-error").classList.add("hidden");
      qs("#housing-buttons .start").addEventListener("click", housingRulesToGame);
    }, 1000);
  }

  function setHousingRulesLocalStorage(roundAmount, inputType) {
    let rules = {
      "roundAmount": roundAmount,
      "inputType": inputType,
    }

    window.localStorage.setItem("housingRules", JSON.stringify(rules));
  }

  function previousHousingRulesSetup() {
    let rules = JSON.parse(window.localStorage.getItem("housingRules"));
    id("rounds-housing").value = rules["roundAmount"];

    let inputsElement = qsa("#housing-input-type p");
    for (let i = 0; i < inputsElement.length; i++) {
      if (inputsElement[i].textContent === rules["inputType"]) {
        inputsElement[i].classList.add("selected");
      }
    }
  }



  function startHousing() {

  }

  function generatePeople() {

    let randomAmountPeople = getRandomIntBetween(1,4);
    let people = gen("div");
    people.classList.add("people");

    for (let i = 0; i < randomAmountPeople; i++) {
      let person = generatePerson();
      people.appendChild(person);
    }

    id("questions-housing").appendChild(people);

  }

  function generatePerson() {
    let img = gen("img");
    img.src = "img/person.png";
    img.alt = "person";
    img.classList.add("person");
    return img;
  }

  /**
  * Make sure to always add a descriptive comment above
  * every function detailing what it's purpose is
  * Use JSDoc format with @param and @return.
  */
  function exampleFunction1() {
    /* SOME CODE */
  }

  /**
  * Make sure to always add a descriptive comment above
  * every function detailing what it's purpose is
  * @param {variabletype} someVariable This is a description of someVariable, including, perhaps, preconditions.
  * @returns {returntype} A description of what this function is actually returning
  */
  function exampleFunction2(someVariable) {
    /* SOME CODE */
    return something;
  }

  // written code snippet from https://stackoverflow.com/questions/26329900/how-do-i-display-millisecond-in-my-stopwatch
  let timeBegan = null
    , timeStopped = null
    , stoppedDuration = 0
    , started = null;

  function start() {
      if (timeBegan === null) {
          timeBegan = new Date();
      }

      if (timeStopped !== null) {
          stoppedDuration += (new Date() - timeStopped);
      }

      started = setInterval(clockRunning, 10);
  }

  function stop() {
      timeStopped = new Date();
      clearInterval(started);
  }

  function reset() {
      clearInterval(started);
      stoppedDuration = 0;
      timeBegan = null;
      timeStopped = null;
      document.getElementById("display-area").innerHTML = "00:00:00.000";
      document.getElementById("counting-display-area").innerHTML = "00:00:00.000";

  }

  function clockRunning(){
      let currentTime = new Date()
          , timeElapsed = new Date(currentTime - timeBegan - stoppedDuration)
          , hour = timeElapsed.getUTCHours()
          , min = timeElapsed.getUTCMinutes()
          , sec = timeElapsed.getUTCSeconds()
          , ms = timeElapsed.getUTCMilliseconds();

      if (document.getElementById("display-area")) {
        document.getElementById("display-area").innerHTML =
          (hour > 9 ? hour : "0" + hour) + ":" +
          (min > 9 ? min : "0" + min) + ":" +
          (sec > 9 ? sec : "0" + sec) + "." +
          (ms > 99 ? ms : ms > 9 ? "0" + ms : "00" + ms);
      }


      if (document.getElementById("counting-display-area")) {
        document.getElementById("counting-display-area").innerHTML =
          (hour > 9 ? hour : "0" + hour) + ":" +
          (min > 9 ? min : "0" + min) + ":" +
          (sec > 9 ? sec : "0" + sec) + "." +
          (ms > 99 ? ms : ms > 9 ? "0" + ms : "00" + ms);
      }

  };


  /** ------------------------------ Helper Functions  ------------------------------ */
  /**
  * Note: You may use these in your code, but remember that your code should not have
  * unused functions. Remove this comment in your own code.
  */

  /**
  * Returns the element that has the ID attribute with the specified value.
  * @param {string} idName - element ID
  * @returns {object} DOM object associated with id.
  */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
  * Returns the first element that matches the given CSS selector.
  * @param {string} selector - CSS query selector.
  * @returns {object} The first DOM object matching the query.
  */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
  * Returns the array of elements that match the given CSS selector.
  * @param {string} selector - CSS query selector
  * @returns {object[]} array of DOM objects matching the query.
  */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  /**
  * Returns a new element with the given tag name.
  * @param {string} tagName - HTML tag name for new DOM element.
  * @returns {object} New DOM object for given HTML tag.
  */
  function gen(tagName) {
    return document.createElement(tagName);
  }

  function clearAllEventListeners(element) {
    let oldElement = element
    let newElement = oldElement.cloneNode(true);
    oldElement.parentNode.replaceChild(newElement, oldElement);
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * (Number(max) + 1));
  }

  function getRandomIntBetween(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }

  function getRandomIndex(array) {
    return Math.floor(Math.random()*array.length);
  }

  function clearAllSetIntervals () {
    for (let i = 0; i < setIntervalTimerIDs.length; i++) {
      let timerID = setIntervalTimerIDs[i];
      clearInterval(timerID);
    }
  }

})();


// need to fix: skipping last question