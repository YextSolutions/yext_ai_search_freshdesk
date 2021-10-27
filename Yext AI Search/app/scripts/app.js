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
    if (document.getElementById("answers-container")) {
      return;
    }
    let answers = document.createElement("div");
    answers.id = "answers-container";

    let script = document.createElement("script");
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

    script.onload = function() {
      AnswersExperienceFrame.runtimeConfig.set('linkTarget', '_blank');
      client.data.get("ticket").then(function(data) {
        if (data.ticket["subject"] && autoFillSearchBar) {
          document.getElementById("answers-container").firstElementChild.src += "&query=" + data.ticket["subject"];
        }
      });
    };

    let content = document.getElementById("content");
    content.append(answers);
    content.append(script);
}

function handleErr(err) {
  console.error(`Error occured. Details:`, err);
}
