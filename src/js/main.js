require("./lib/social");
require("./lib/ads");
var shuffle = require("lodash.shuffle");
var initGallery = require("./lib/gallery.js");
var track = require("./lib/tracking");

var $ = require("jquery");
var ich = require("icanhaz");
var Share = require("share");

var questionTemplate = require("./_questionTemplate.html");
var overviewTemplate = require("./_overviewTemplate.html");
var galleryTemplate = require("../partials/_gallery.html");
var additionalResultsTemplate = require("./_additionalResults.html");
var gridTemplate = require("./_gridTemplate.html");

// Set up templates
ich.addTemplate("questionTemplate", questionTemplate);
ich.addTemplate("overviewTemplate", overviewTemplate);
ich.addTemplate("galleryTemplate", galleryTemplate);
ich.addTemplate("additionalResultsTemplate", additionalResultsTemplate);
ich.addTemplate("gridTemplate", gridTemplate);



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

var id = 8; //question number

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
  var options = [];
  for (var option in scores) {
    options.push({
      name: option,
      score: scores[option]
    });
  }

  options.sort((a,b) => b.score - a.score);

  var highest = [];
  var top = [];
  var target = options[0].score; //highest score
  for (var i = 0; i < options.length; i++) {
    var o = options[i];
    if (o.score == target) {
      top.push(o);
      highest.push(o);
    } else if (highest.length < 3) {
      highest.push(o);
    }
  }

  var final;

  if (top.length >= 3) {
    final = shuffle(top).slice(0, 3);
  } else if (top.length == 2) {
    final = shuffle(top);
    final.push(highest[2]);
  } else {
    final = highest;
  }

  final = final.map(function(o) {
    for (var i = 0; i < resultsData.length; i++) {
      var option = resultsData[i];
      if (option.id == o.name) return option;
    };
  });

  var first = final.shift();

  displayResult(first, final);
  $(".result-name").html(`You got: ${first.title}!`);

  new Share(".share-button", {
        description: "I got " + first.title + "! Which Seattle-area neighborhood are you?" + document.querySelector(`meta[property="og:description"]`).innerHTML,
        ui: {
          flyout: "bottom right",
          button_text: "Share results"
        },
        networks: {
          email: {
            description: "I got " + first.title + "! Which Seattle-area neighborhood are you?" + [document.querySelector(`meta[property="og:description"]`).innerHTML, window.location.href].join("\n")
          }
        }
      });

  $(".share-button").addClass("share-results");
};


var displayResult = function(first, final) {
  $(".quiz-box").html(ich.overviewTemplate(first));

  var photos = galleryData.filter(function(c) {
     return c.gallery == first.title;
  });
  photos.forEach((p, i) => p.index = i)
  photos[0].first = true;

  $(".results-image").html(ich.galleryTemplate({photos: photos, length: photos.length}));
  initGallery();

  if (final) $(".additional-results").html(ich.additionalResultsTemplate({first:final[0], second:final[1]}));
  $(".neighborhoods-grid").html(ich.gridTemplate({neighborhoods: resultsData}));

  $(".retake").removeClass("hidden");
};



showQuestion(id);
watchInput();

$(".quiz-box").on("click", function(e) {
  if ($(e.target).hasClass("additional-result")) {
    var neighborhood;
    resultsData.forEach(function(r) {
      if (r.title == e.target.id) {
        neighborhood = r;
      }
    })
    displayResult(neighborhood);
    $(".result-name").html(neighborhood.title);
  }

  if ($(e.target).hasClass("grid-card")) {
    var neighborhood;
    resultsData.forEach(function(r) {
      if (r.title == e.target.id) {
        neighborhood = r;
      }
    })
    displayResult(neighborhood);
    $(".result-name").html(neighborhood.title);
  }
})