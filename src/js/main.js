require("./lib/social");
require("./lib/ads");
var initGallery = require("./lib/gallery.js");
var track = require("./lib/tracking");

var $ = require("jquery");
var ich = require("icanhaz");
var Share = require("share");

var questionTemplate = require("./_questionTemplate.html");
var overviewTemplate = require("./_overviewTemplate.html");
var galleryTemplate = require("../partials/_gallery.html");
var additionalResultsTemplate = require("../partials/_additionalResults.html");

// Set up templates
ich.addTemplate("questionTemplate", questionTemplate);
ich.addTemplate("overviewTemplate", overviewTemplate);
ich.addTemplate("galleryTemplate", galleryTemplate);
ich.addTemplate("additionalResultsTemplate", additionalResultsTemplate);



new Share(".share-button", {
  ui: {
    flyout: "top center"
  },
  networks: {
    email: {
      description: [document.querySelector(`meta[property="og:description"]`).innerHTML, window.location.href].join("\n")
    }
  }
});

//create new question from template
var showQuestion = function(id) {
  $(".question-box").html(ich.questionTemplate(quizData[id]));
  $(".question .index").html(id + " of " + Object.keys(quizData).length);
};

// show next button when answer is selected
var watchInput = function() {
  $(".quiz-box").on("click", "input", (function(){
    $(".submit").addClass("active");
    $(".submit").attr("disabled", false);
  }));
};

var id = 1;



  var scores = {};

  $(".question-box").on("click", ".submit", function() {
      // score answer
      var options = $("input:checked").val().split(" ");
      options.forEach(function(option) {
        if (option === "") return;
        if (!scores[option]) { scores[option] = 0 }
        scores[option] += 1;
      });

      if (id < Object.keys(quizData).length) {
        // move on to next question
        id += 1;
        showQuestion(id);
        $(".submit").removeClass("active");
        $(".submit").attr("disabled", true);
        // Change button text on last question
        if (id == Object.keys(quizData).length) {
          $(".submit").html("Finish");
        }
      } else {
        calculateResult();
      }
    });

  var calculateResult = function() {
    // find highest match(es)
    var highestScore = 0;
    for (var option in scores) {
      if (scores[option] >= highestScore) {
        highestScore = scores[option];
      }
    }

    //loop again to find ties
    var highestOptions = [];
    for (var option in scores) {
      if (scores[option] == highestScore) {
        highestOptions.push(option);
      }
      console.log(highestOptions)
    }

    var random = Math.round(Math.random() * (highestOptions.length - 1));
    var resultId = highestOptions[random];
    var result;
    resultsData.forEach(function(option) {
      if (option.id != resultId) return;
      result = option;
    });

    // display result
    $(".quiz-box").html(ich.overviewTemplate(result));

    var photos = galleryData.filter(function(c) {
       return c.gallery == result.title;
    });
    photos.forEach((p, i) => p.index = i)
    photos[0].first = true;

    $(".results-image").html(ich.galleryTemplate({photos: photos, length: photos.length}));
    initGallery();

    $(".additional-results").html(ich.additionalResultsTemplate());

    $(".retake").removeClass("hidden");
    new Share(".share-button", {
          description: "I got " + result.title + "! Which Seattle-area neighborhood are you?" + document.querySelector(`meta[property="og:description"]`).innerHTML,
          ui: {
            flyout: "bottom right",
            button_text: "Share results"
          },
          networks: {
            email: {
              description: "I got " + result.title + "! Which Seattle-area neighborhood are you?" + [document.querySelector(`meta[property="og:description"]`).innerHTML, window.location.href].join("\n")
            }
          }
        });

    $(".share-button").addClass("share-results");
  };



showQuestion(id);
watchInput();