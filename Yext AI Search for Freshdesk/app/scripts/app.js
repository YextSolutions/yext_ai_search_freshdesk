document.onreadystatechange = function() {
  if (document.readyState === 'interactive') renderApp();

  function renderApp() {
    var onInit = app.initialized();

    onInit.then(getClient).catch(handleErr);

    function getClient(_client) {
      window.client = _client;
      client.events.on('app.activated', onAppActivate);
    }
  }
};

function onAppActivate() {
  resize();
  populateAnswersExperience();
}

function resize() {
  client.instance.resize({
    height: "700px"
  });
}

function populateAnswersExperience() {
  var params = client.iparams.get();
  params.then(configureParams).catch(handleErr);
}

function configureParams(params) {
  (function(d, script, answers) {
    answers = d.createElement("div");
    answers.id = "answers-container";

    script = d.createElement("script");
    script.async = true;

    let url = params["answersUrl"];
    if (!url.includes("iframe.js")) {
      if (!url.endsWith("/")) {
        url += "/";
      }
      url += "iframe.js";
    }
    script.src = url;

    let autoFillSearchBar = params["autoFillSearchBar"];

    if (autoFillSearchBar) {
      client.events.on("ticket.propertiesUpdated", eventCallback);
    }

    script.onload = function() {
      AnswersExperienceFrame.runtimeConfig.set('linkTarget', '_blank');
      client.data.get("ticket").then(function(data) {
        if (data.ticket["subject"] && autoFillSearchBar) {
          document.getElementById("answers-container").firstElementChild.src += "&query=" + data.ticket["subject"];
        }
      });
    };

    d.getElementById("content").append(answers);
    d.getElementById("content").append(script);
  }(document));
}

var eventCallback = function(event) {
  if (event.data.changedAttributes["subject"]) {
    let newQuery = event.data.changedAttributes["subject"][1];
    let msg = JSON.stringify({
      "action": "setQuery",
      "value": newQuery
    });
    let frameEl = document.getElementById("answers-frame");
    frameEl.contentWindow.postMessage(msg, "*");
  }
  event.helper.done();
};

function handleErr(err) {
  console.error(`Error occured. Details:`, err);
}