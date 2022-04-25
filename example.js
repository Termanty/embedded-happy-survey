/*
 * Version 1.0
 * Release Date: Monday Nov 19th, 2012
 * Author: Ben Hall
 * Copyright 2012 nps Software.
 * URL: http://www.nps.com
 *
 */

//////////////////////
///  VARIABLES
//////////////////////

//Other URLS
var nps_url_root = "https://www.dimbal.com/";
var nps_url_ajax = "not-set-yet";
var nps_ajax_load = "not-set-yet";
var nps_loaded = false;

/////////////////////////
///  DOCUMENT LOADER
/////////////////////////

document.addEventListener(
  "DOMContentLoaded",
  function () {
    if (nps_loaded == false) {
      nps_loaded = true;

      //Setup and element function if one does not exist
      if (document.getElementsByClassName == undefined) {
        document.getElementsByClassName = function (className) {
          var hasClassName = new RegExp("(?:^|\\s)" + className + "(?:$|\\s)");
          var allElements = document.getElementsByTagName("*");
          var results = [];

          var element;
          for (var i = 0; (element = allElements[i]) != null; i++) {
            var elementClass = element.className;
            if (
              elementClass &&
              elementClass.indexOf(className) != -1 &&
              hasClassName.test(elementClass)
            )
              results.push(element);
          }

          return results;
        };
      }

      //Get the script element and setup the Domain Name
      var scriptEl = document.getElementById("npsScript");
      if (scriptEl == undefined) {
        //This should not happen
      } else {
        var scriptPath = scriptEl.src;
        //console.log("scriptPath: "+scriptPath);
        var scriptFolder = scriptPath.substr(
          0,
          scriptPath.lastIndexOf("/") + 1
        );
        var scriptDomain = scriptPath.substr(
          0,
          scriptPath.indexOf("/m/nps/nps.js") + 1
        );
        if (scriptDomain == "https://localhost-dimbal:8899/") {
          nps_url_root = scriptDomain;
        }
      }

      //console.log("nps_url_root: "+nps_url_root);

      //Now fill in the rest of the URL's
      nps_aws_url = "https://s3.amazonaws.com/dimbal/m/nps/";
      nps_url_ajax = nps_url_root + "m/nps/nps.php";
      nps_ajax_load =
        "<img src='https://s3.amazonaws.com/dimbal/public/images/loading/loading2.gif' />";

      //Get the initial elements
      //npsLoadJsCssFile(nps_aws_url+"tinybox2/tinybox.js", "js");
      //npsLoadJsCssFile(nps_aws_url+"tinybox2/style.css", "css");
      npsLoadJsCssFile(nps_aws_url + "nps.css", "css");
      setTimeout(function () {
        npsPrepSurvey();
      }, 300);
    }
  },
  false
);

///////////////////////////////////////
///  COMMON GENERIC FUNCTIONS
///////////////////////////////////////

// IE8 and Earlier needs the Date.now function
if (!Date.now) {
  Date.now = function () {
    return new Date().getTime();
  };
}

var npsIsValidNumber = function (o) {
  return !isNaN(o - 0) && o != "";
};

var npsShuffleArray = function (o) {
  for (
    var j, x, i = o.length;
    i;
    j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x
  );
  return o;
};

function npsLoadJsCssFile(filename, filetype) {
  if (filetype == "js") {
    //if filename is a external JavaScript file
    var fileref = document.createElement("script");
    fileref.setAttribute("type", "text/javascript");
    fileref.setAttribute("src", filename);
  } else if (filetype == "css") {
    //if filename is an external CSS file
    var fileref = document.createElement("link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", filename);
  }
  if (typeof fileref != "undefined") {
    document.getElementsByTagName("head")[0].appendChild(fileref);
  }
  return true;
}

var npsXmlhttpPost = function (npsStrURL, postFunctionHook) {
  console.log("inside the XMLRequest : " + npsStrURL);
  var xmlHttpReq = false;
  // Mozilla/Safari
  if (window.XMLHttpRequest) {
    xmlHttpReq = new XMLHttpRequest();
  }
  // IE
  else if (window.ActiveXObject) {
    xmlHttpReq = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlHttpReq.open("POST", nps_url_ajax, true);
  xmlHttpReq.setRequestHeader(
    "Content-Type",
    "application/x-www-form-urlencoded"
  );
  xmlHttpReq.onreadystatechange = function () {
    if (xmlHttpReq.readyState == 4) {
      console.log(xmlHttpReq.responseText);
      npsUpdatePage(xmlHttpReq.responseText, postFunctionHook);
    } else {
      console.log("wait response");
      console.log(xmlHttpReq.responseText);
    }
  };
  xmlHttpReq.send(npsStrURL);
};

var npsUpdatePage = function (npsStr, postFunctionHook) {
  if (postFunctionHook != undefined) {
    window[postFunctionHook](npsStr);
  }
};

//////////////////////
///  NPS SURVEY
//////////////////////

var npsPrepSurvey = function () {
  //console.log("Inside npsPrepSurvey");
  var elements = document.getElementsByClassName("npsWrapper");
  for (var i = 0; i < elements.length; i++) {
    //Get needed attributes
    //console.log("Found an Element named npsWrapper");
    var npsQueryString;
    var element = elements[i];
    var npsPropertyId = element.getAttribute("npsPropertyId");
    var npsClientId = element.getAttribute("npsClientId");
    var npsClientStartDate = element.getAttribute("npsClientStartDate");
    var npsClientForce = element.getAttribute("npsClientForce");
    var elementId = element.getAttribute("id");
    var callingUrl = window.location.href;

    /*
        // http://stackoverflow.com/questions/10926880/using-javascript-to-detect-whether-the-url-exists-before-display-in-iframe
        // Didn't work due to cross domain issues
        // First test to see if the Max Exceeded File exists for the given property
        //console.log("NPS CLient Force ["+npsClientForce+"]");
        if(!npsClientForce){
            //console.log("Inside the Block to Check Files - Force was not enabled.");
            var request;
            var timestamp = new Date(new Date().setHours(0,0,0,0)); // Standardize to Midnight in the past
            var timestamp = Math.floor(timestamp / 1000);   // Change from milliseconds to seconds
            var maxExceededUrl = nps_url_root+"m/nps/hitCounts/maxExceeded_"+timestamp+"_pid_"+npsPropertyId+".txt";
            if(window.XMLHttpRequest){
                request = new XMLHttpRequest();
            }else{
                request = new ActiveXObject("Microsoft.XMLHTTP");
            }
            request.open('GET', maxExceededUrl, false);
            request.send(); // there will be a 'pause' here until the response to come. the object request will be actually modified
            //console.log("MAX URL: ["+maxExceededUrl+"] Status ["+request.status+"]");
            if (request.status === 404) {
                //console.log("Max Exceeded File Exists - Exiting");
                return;
            }
        }else{
            //console.log("Passed the Block to Check Files - Force was enabled.");
        }
*/

    //First enter an ID if one does not exist (required for Ajax response)
    if (elementId == undefined || elementId == "") {
      elementId = "npsElemId_" + i;
      elements[i].setAttribute("id", elementId);
    }

    npsQueryString = "ac=1&npsElemId=" + elementId;

    //Now get the Survey
    if (
      npsPropertyId != undefined &&
      npsPropertyId != "" &&
      npsPropertyId != null
    ) {
      npsQueryString += "&propertyId=" + npsPropertyId;
    }
    if (npsClientId != undefined && npsClientId != "" && npsClientId != null) {
      npsQueryString += "&clientId=" + npsClientId;
    }
    if (
      npsClientStartDate != undefined &&
      npsClientStartDate != "" &&
      npsClientStartDate != null
    ) {
      npsQueryString += "&clientStartDate=" + npsClientStartDate;
    }
    if (
      npsClientForce != undefined &&
      npsClientForce != "" &&
      npsClientForce != null
    ) {
      npsQueryString += "&npsClientForce=" + npsClientForce;
    }

    npsQueryString += "&locationHostname=" + location.hostname;

    //var npsUrl = nps_url_ajax + "?" + npsQueryString;

    //Doing Ajax through TINY does not work -- because the ajax might return a FALSE
    npsXmlhttpPost(npsQueryString, "npsDisplaySurvey");

    // Need to have Throttling logic in place in the JS client  Mod by the time of day?? Something like that
  }
};

var npsDisplaySurvey = function (returnString) {
  if (returnString != undefined && returnString.length > 5) {
    TINY.box.show({
      html: returnString,
      width: 600,
      height: 350,
      opacity: 90,
      boxid: "npsTinyBox",
    });
  } else {
    //console.log("Return String for NPS was undefined or too short -- doing nothing : ("+returnString+")");
  }
};

var npsSubmitSurvey = function (elemId) {
  //Get the Primary Wrapper ID
  var wrapperElement = document.getElementById(elemId);
  var elementId = wrapperElement.getAttribute("id");

  //Get the Survey ID
  var propertyId = document.getElementById("npsPropertyId").value;
  //console.log("propertyId ("+propertyId+")");

  //Get the Comments
  var npsComments = document.getElementById("npsComments").value;
  //console.log("npsComments ("+npsComments+")");

  //Get the Client ID
  var npsClientId = document.getElementById("npsClientId").value;
  //console.log("npsClientId ("+npsClientId+")");

  //Get the Client Start Date
  var npsClientStartDate = document.getElementById("npsClientStartDate").value;
  //console.log("npsClientStartDate ("+npsClientStartDate+")");

  //Get the selected Choice
  var npsScoreObject = document.getElementsByName("npsScore");
  var radioLength = npsScoreObject.length;
  if (radioLength == undefined) {
    if (npsScoreObject.checked) {
      npsScore = npsScoreObject.value;
    }
  }
  for (var i = 0; i < radioLength; i++) {
    if (npsScoreObject[i].checked) {
      npsScore = npsScoreObject[i].value;
    }
  }
  //console.log("npsScore ("+npsScore+")");

  //Send off the AJAX request
  var queryString =
    "ac=2&propertyId=" +
    propertyId +
    "&npsScore=" +
    npsScore +
    "&npsClientId=" +
    npsClientId +
    "&npsClientStartDate=" +
    npsClientStartDate +
    "&npsComments=" +
    npsComments;
  conssole.log(queryString);
  npsXmlhttpPost(queryString, null);

  npsCloseSurvey(elemId);
};

var npsCountInterval = null;
var npsCloseSurvey = function (elemId) {
  var elem = document.getElementById(elemId);
  elem.innerHTML =
    "<div style='text-align:center;'><br /><br /><br /><h1 style='text-align:center;'>Thank you for submitting your feedback</h1><div>Window will close in <div id='npsCountInterval' style='display:inline-block;'>5</div> seconds.</div><br /><div class='npsButton' onclick='javascript:npsFadeOutSurvey();'>Close Window</div></div>";

  npsCountInterval = setInterval(function () {
    ciElem = document.getElementById("npsCountInterval");
    if (ciElem == null || ciElem == undefined) {
      // Happens when the buttons closes or the element is otherwise lost
      clearInterval(npsCountInterval);
      return;
    }
    var count = ciElem.innerHTML;
    count = count - 1;
    ciElem.innerHTML = count;
    if (count <= 0) {
      clearInterval(npsCountInterval);
      npsFadeOutSurvey();
      return;
    }
  }, 1000);
};

var npsFadeOutSurvey = function () {
  FX.fadeOut(document.getElementById("npsTinyBox"), {
    duration: 500,
    complete: function () {
      TINY.box.hide();
      //console.log('Complete');
    },
  });
};

var npsRedrawChart = function (npsContentId) {
  var testChartElement = document.getElementById(
    "npsChartCanvas_" + npsContentId
  );
  if (testChartElement != undefined) {
    var parentWrapper = testChartElement.parentNode;
    var npsChartData = parentWrapper.getAttribute("npschartdata");
    var npsChartLabels = parentWrapper.getAttribute("npschartlabels");
    var npsColors = [
      "#F0B400",
      "#1E6C0B",
      "#00488C",
      "#D84000",
      "#B30023",
      "#965136",
      "#59955C",
      "#800080",
    ];
    npsColors = npsShuffleArray(npsColors);
    npsChartData = npsChartData.split(",");
    var pieTotal = 0;
    for (var i = 0; i < npsChartData.length; i++) {
      npsChartData[i] = parseInt(npsChartData[i]);
      pieTotal += npsChartData[i];
    }
    npsChartLabels = npsChartLabels.split(",");
    var npsChart = new AwesomeChart("npsChartCanvas_" + npsContentId);
    //npsChart.chartType = "pie";
    npsChart.chartType = "horizontal bars";
    npsChart.pieTotal = pieTotal;
    npsChart.data = npsChartData;
    npsChart.labels = npsChartLabels;
    npsChart.colors = npsColors;
    npsChart.draw();
  }
};

//////////////////////////
///  HTML ENTITY DECODE
//////////////////////////

function html_entity_decode(string, quote_style) {
  // Convert all HTML entities to their applicable characters
  //
  // version: 1109.2015
  // discuss at: http://phpjs.org/functions/html_entity_decode
  // -    depends on: get_html_translation_table
  // *     example 1: html_entity_decode('Kevin &amp; van Zonneveld');
  // *     returns 1: 'Kevin & van Zonneveld'
  // *     example 2: html_entity_decode('&amp;lt;');
  // *     returns 2: '&lt;'
  var hash_map = {},
    symbol = "",
    tmp_str = "",
    entity = "";
  tmp_str = string.toString();

  if (
    false ===
    (hash_map = this.get_html_translation_table("HTML_ENTITIES", quote_style))
  ) {
    return false;
  }

  // fix &amp; problem
  // http://phpjs.org/functions/get_html_translation_table:416#comment_97660
  delete hash_map["&"];
  hash_map["&"] = "&amp;";

  for (symbol in hash_map) {
    entity = hash_map[symbol];
    tmp_str = tmp_str.split(entity).join(symbol);
  }
  tmp_str = tmp_str.split("&#039;").join("'");

  return tmp_str;
}

function get_html_translation_table(table, quote_style) {
  // Returns the internal translation table used by htmlspecialchars and htmlentities
  //
  // version: 1109.2015
  // discuss at: http://phpjs.org/functions/get_html_translation_table
  // %          note: It has been decided that we're not going to add global
  // %          note: dependencies to php.js, meaning the constants are not
  // %          note: real constants, but strings instead. Integers are also supported if someone
  // %          note: chooses to create the constants themselves.
  // *     example 1: get_html_translation_table('HTML_SPECIALCHARS');
  // *     returns 1: {'"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;'}
  var entities = {},
    hash_map = {},
    decimal;
  var constMappingTable = {},
    constMappingQuoteStyle = {};
  var useTable = {},
    useQuoteStyle = {};

  // Translate arguments
  constMappingTable[0] = "HTML_SPECIALCHARS";
  constMappingTable[1] = "HTML_ENTITIES";
  constMappingQuoteStyle[0] = "ENT_NOQUOTES";
  constMappingQuoteStyle[2] = "ENT_COMPAT";
  constMappingQuoteStyle[3] = "ENT_QUOTES";

  useTable = !isNaN(table)
    ? constMappingTable[table]
    : table
    ? table.toUpperCase()
    : "HTML_SPECIALCHARS";
  useQuoteStyle = !isNaN(quote_style)
    ? constMappingQuoteStyle[quote_style]
    : quote_style
    ? quote_style.toUpperCase()
    : "ENT_COMPAT";

  if (useTable !== "HTML_SPECIALCHARS" && useTable !== "HTML_ENTITIES") {
    throw new Error("Table: " + useTable + " not supported");
    // return false;
  }

  entities["38"] = "&amp;";
  if (useTable === "HTML_ENTITIES") {
    entities["034"] = "&#34;";
    entities["060"] = "&#60;";
    entities["062"] = "&#62;";
    entities["160"] = "&nbsp;";
    entities["161"] = "&iexcl;";
    entities["162"] = "&cent;";
    entities["163"] = "&pound;";
    entities["164"] = "&curren;";
    entities["165"] = "&yen;";
    entities["166"] = "&brvbar;";
    entities["167"] = "&sect;";
    entities["168"] = "&uml;";
    entities["169"] = "&copy;";
    entities["170"] = "&ordf;";
    entities["171"] = "&laquo;";
    entities["172"] = "&not;";
    entities["173"] = "&shy;";
    entities["174"] = "&reg;";
    entities["175"] = "&macr;";
    entities["176"] = "&deg;";
    entities["177"] = "&plusmn;";
    entities["178"] = "&sup2;";
    entities["179"] = "&sup3;";
    entities["180"] = "&acute;";
    entities["181"] = "&micro;";
    entities["182"] = "&para;";
    entities["183"] = "&middot;";
    entities["184"] = "&cedil;";
    entities["185"] = "&sup1;";
    entities["186"] = "&ordm;";
    entities["187"] = "&raquo;";
    entities["188"] = "&frac14;";
    entities["189"] = "&frac12;";
    entities["190"] = "&frac34;";
    entities["191"] = "&iquest;";
    entities["192"] = "&Agrave;";
    entities["193"] = "&Aacute;";
    entities["194"] = "&Acirc;";
    entities["195"] = "&Atilde;";
    entities["196"] = "&Auml;";
    entities["197"] = "&Aring;";
    entities["198"] = "&AElig;";
    entities["199"] = "&Ccedil;";
    entities["200"] = "&Egrave;";
    entities["201"] = "&Eacute;";
    entities["202"] = "&Ecirc;";
    entities["203"] = "&Euml;";
    entities["204"] = "&Igrave;";
    entities["205"] = "&Iacute;";
    entities["206"] = "&Icirc;";
    entities["207"] = "&Iuml;";
    entities["208"] = "&ETH;";
    entities["209"] = "&Ntilde;";
    entities["210"] = "&Ograve;";
    entities["211"] = "&Oacute;";
    entities["212"] = "&Ocirc;";
    entities["213"] = "&Otilde;";
    entities["214"] = "&Ouml;";
    entities["215"] = "&times;";
    entities["216"] = "&Oslash;";
    entities["217"] = "&Ugrave;";
    entities["218"] = "&Uacute;";
    entities["219"] = "&Ucirc;";
    entities["220"] = "&Uuml;";
    entities["221"] = "&Yacute;";
    entities["222"] = "&THORN;";
    entities["223"] = "&szlig;";
    entities["224"] = "&agrave;";
    entities["225"] = "&aacute;";
    entities["226"] = "&acirc;";
    entities["227"] = "&atilde;";
    entities["228"] = "&auml;";
    entities["229"] = "&aring;";
    entities["230"] = "&aelig;";
    entities["231"] = "&ccedil;";
    entities["232"] = "&egrave;";
    entities["233"] = "&eacute;";
    entities["234"] = "&ecirc;";
    entities["235"] = "&euml;";
    entities["236"] = "&igrave;";
    entities["237"] = "&iacute;";
    entities["238"] = "&icirc;";
    entities["239"] = "&iuml;";
    entities["240"] = "&eth;";
    entities["241"] = "&ntilde;";
    entities["242"] = "&ograve;";
    entities["243"] = "&oacute;";
    entities["244"] = "&ocirc;";
    entities["245"] = "&otilde;";
    entities["246"] = "&ouml;";
    entities["247"] = "&divide;";
    entities["248"] = "&oslash;";
    entities["249"] = "&ugrave;";
    entities["250"] = "&uacute;";
    entities["251"] = "&ucirc;";
    entities["252"] = "&uuml;";
    entities["253"] = "&yacute;";
    entities["254"] = "&thorn;";
    entities["255"] = "&yuml;";
  }

  if (useQuoteStyle !== "ENT_NOQUOTES") {
    entities["34"] = "&quot;";
  }
  if (useQuoteStyle === "ENT_QUOTES") {
    entities["39"] = "&#39;";
  }
  entities["60"] = "&lt;";
  entities["62"] = "&gt;";

  // ascii decimals to real symbols
  for (decimal in entities) {
    if (entities.hasOwnProperty(decimal)) {
      hash_map[String.fromCharCode(decimal)] = entities[decimal];
    }
  }

  return hash_map;
}

/* JAVASCRIPT BASED FADE IN AND FADE OUT */
(function () {
  var FX = {
    easing: {
      linear: function (progress) {
        return progress;
      },
      quadratic: function (progress) {
        return Math.pow(progress, 2);
      },
      swing: function (progress) {
        return 0.5 - Math.cos(progress * Math.PI) / 2;
      },
      circ: function (progress) {
        return 1 - Math.sin(Math.acos(progress));
      },
      back: function (progress, x) {
        return Math.pow(progress, 2) * ((x + 1) * progress - x);
      },
      bounce: function (progress) {
        for (var a = 0, b = 1, result; 1; a += b, b /= 2) {
          if (progress >= (7 - 4 * a) / 11) {
            return (
              -Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2)
            );
          }
        }
      },
      elastic: function (progress, x) {
        return (
          Math.pow(2, 10 * (progress - 1)) *
          Math.cos(((20 * Math.PI * x) / 3) * progress)
        );
      },
    },
    animate: function (options) {
      var start = new Date();
      var id = setInterval(function () {
        var timePassed = new Date() - start;
        var progress = timePassed / options.duration;
        if (progress > 1) {
          progress = 1;
        }
        options.progress = progress;
        var delta = options.delta(progress);
        options.step(delta);
        if (progress == 1) {
          clearInterval(id);
          options.complete();
        }
      }, options.delay || 10);
    },
    fadeOut: function (element, options) {
      var to = 1;
      this.animate({
        duration: options.duration,
        delta: function (progress) {
          progress = this.progress;
          return FX.easing.swing(progress);
        },
        complete: options.complete,
        step: function (delta) {
          element.style.opacity = to - delta;
        },
      });
    },
    fadeIn: function (element, options) {
      var to = 0;
      this.animate({
        duration: options.duration,
        delta: function (progress) {
          progress = this.progress;
          return FX.easing.swing(progress);
        },
        complete: options.complete,
        step: function (delta) {
          element.style.opacity = to + delta;
        },
      });
    },
  };
  window.FX = FX;
})();

TINY = {};

TINY.box = (function () {
  var j,
    m,
    b,
    g,
    v,
    p = 0;
  return {
    show: function (o) {
      v = {
        opacity: 70,
        close: 1,
        animate: 1,
        fixed: 1,
        mask: 1,
        maskid: "",
        boxid: "",
        topsplit: 2,
        url: 0,
        post: 0,
        height: 0,
        width: 0,
        html: 0,
        iframe: 0,
      };
      for (s in o) {
        v[s] = o[s];
      }
      if (!p) {
        j = document.createElement("div");
        j.className = "tbox";
        p = document.createElement("div");
        p.className = "tinner";
        b = document.createElement("div");
        b.className = "tcontent";
        m = document.createElement("div");
        m.className = "tmask";
        g = document.createElement("div");
        g.className = "tclose";
        g.v = 0;
        document.body.appendChild(m);
        document.body.appendChild(j);
        j.appendChild(p);
        p.appendChild(b);
        m.onclick = g.onclick = TINY.box.hide;
        window.onresize = TINY.box.resize;
      } else {
        j.style.display = "none";
        clearTimeout(p.ah);
        if (g.v) {
          p.removeChild(g);
          g.v = 0;
        }
      }
      p.id = v.boxid;
      m.id = v.maskid;
      j.style.position = v.fixed ? "fixed" : "absolute";
      if (v.html && !v.animate) {
        p.style.backgroundImage = "none";
        b.innerHTML = v.html;
        b.style.display = "";
        p.style.width = v.width ? v.width + "px" : "auto";
        p.style.height = v.height ? v.height + "px" : "auto";
      } else {
        b.style.display = "none";
        if (!v.animate && v.width && v.height) {
          p.style.width = v.width + "px";
          p.style.height = v.height + "px";
        } else {
          p.style.width = p.style.height = "100px";
        }
      }
      if (v.mask) {
        this.mask();
        this.alpha(m, 1, v.opacity);
      } else {
        this.alpha(j, 1, 100);
      }
      if (v.autohide) {
        p.ah = setTimeout(TINY.box.hide, 1000 * v.autohide);
      } else {
        document.onkeyup = TINY.box.esc;
      }
    },
    fill: function (c, u, k, a, w, h) {
      if (u) {
        if (v.image) {
          var i = new Image();
          i.onload = function () {
            w = w || i.width;
            h = h || i.height;
            TINY.box.psh(i, a, w, h);
          };
          i.src = v.image;
        } else if (v.iframe) {
          this.psh(
            '<iframe src="' +
              v.iframe +
              '" width="' +
              v.width +
              '" frameborder="0" height="' +
              v.height +
              '"></iframe>',
            a,
            w,
            h
          );
        } else {
          var x = window.XMLHttpRequest
            ? new XMLHttpRequest()
            : new ActiveXObject("Microsoft.XMLHTTP");
          x.onreadystatechange = function () {
            if (x.readyState == 4 && x.status == 200) {
              p.style.backgroundImage = "";
              TINY.box.psh(x.responseText, a, w, h);
            }
          };
          if (k) {
            x.open("POST", c, true);
            x.setRequestHeader(
              "Content-type",
              "application/x-www-form-urlencoded"
            );
            x.send(k);
          } else {
            x.open("GET", c, true);
            x.send(null);
          }
        }
      } else {
        this.psh(c, a, w, h);
      }
    },
    psh: function (c, a, w, h) {
      if (typeof c == "object") {
        b.appendChild(c);
      } else {
        b.innerHTML = c;
      }
      var x = p.style.width,
        y = p.style.height;
      if (!w || !h) {
        p.style.width = w ? w + "px" : "";
        p.style.height = h ? h + "px" : "";
        b.style.display = "";
        if (!h) {
          h = parseInt(b.offsetHeight);
        }
        if (!w) {
          w = parseInt(b.offsetWidth);
        }
        b.style.display = "none";
      }
      p.style.width = x;
      p.style.height = y;
      this.size(w, h, a);
    },
    esc: function (e) {
      e = e || window.event;
      if (e.keyCode == 27) {
        TINY.box.hide();
      }
    },
    hide: function () {
      TINY.box.alpha(j, -1, 0, 3);
      document.onkeypress = null;
      if (v.closejs) {
        v.closejs();
      }
    },
    resize: function () {
      TINY.box.pos();
      TINY.box.mask();
    },
    mask: function () {
      m.style.height = this.total(1) + "px";
      m.style.width = this.total(0) + "px";
    },
    pos: function () {
      var t;
      if (typeof v.top != "undefined") {
        t = v.top;
      } else {
        t = this.height() / v.topsplit - j.offsetHeight / 2;
        t = t < 20 ? 20 : t;
      }
      if (!v.fixed && !v.top) {
        t += this.top();
      }
      j.style.top = t + "px";
      j.style.left =
        typeof v.left != "undefined"
          ? v.left + "px"
          : this.width() / 2 - j.offsetWidth / 2 + "px";
    },
    alpha: function (e, d, a) {
      clearInterval(e.ai);
      if (d) {
        e.style.opacity = 0;
        e.style.filter = "alpha(opacity=0)";
        e.style.display = "block";
        TINY.box.pos();
      }
      e.ai = setInterval(function () {
        TINY.box.ta(e, a, d);
      }, 20);
    },
    ta: function (e, a, d) {
      var o = Math.round(e.style.opacity * 100);
      if (o == a) {
        clearInterval(e.ai);
        if (d == -1) {
          e.style.display = "none";
          e == j
            ? TINY.box.alpha(m, -1, 0, 2)
            : (b.innerHTML = p.style.backgroundImage = "");
        } else {
          if (e == m) {
            this.alpha(j, 1, 100);
          } else {
            j.style.filter = "";
            TINY.box.fill(
              v.html || v.url,
              v.url || v.iframe || v.image,
              v.post,
              v.animate,
              v.width,
              v.height
            );
          }
        }
      } else {
        var n = a - Math.floor(Math.abs(a - o) * 0.5) * d;
        e.style.opacity = n / 100;
        e.style.filter = "alpha(opacity=" + n + ")";
      }
    },
    size: function (w, h, a) {
      if (a) {
        clearInterval(p.si);
        var wd = parseInt(p.style.width) > w ? -1 : 1,
          hd = parseInt(p.style.height) > h ? -1 : 1;
        p.si = setInterval(function () {
          TINY.box.ts(w, wd, h, hd);
        }, 20);
      } else {
        p.style.backgroundImage = "none";
        if (v.close) {
          p.appendChild(g);
          g.v = 1;
        }
        p.style.width = w + "px";
        p.style.height = h + "px";
        b.style.display = "";
        this.pos();
        if (v.openjs) {
          v.openjs();
        }
      }
    },
    ts: function (w, wd, h, hd) {
      var cw = parseInt(p.style.width),
        ch = parseInt(p.style.height);
      if (cw == w && ch == h) {
        clearInterval(p.si);
        p.style.backgroundImage = "none";
        b.style.display = "block";
        if (v.close) {
          p.appendChild(g);
          g.v = 1;
        }
        if (v.openjs) {
          v.openjs();
        }
      } else {
        if (cw != w) {
          p.style.width = w - Math.floor(Math.abs(w - cw) * 0.6) * wd + "px";
        }
        if (ch != h) {
          p.style.height = h - Math.floor(Math.abs(h - ch) * 0.6) * hd + "px";
        }
        this.pos();
      }
    },
    top: function () {
      return document.documentElement.scrollTop || document.body.scrollTop;
    },
    width: function () {
      return (
        self.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth
      );
    },
    height: function () {
      return (
        self.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight
      );
    },
    total: function (d) {
      var b = document.body,
        e = document.documentElement;
      return d
        ? Math.max(
            Math.max(b.scrollHeight, e.scrollHeight),
            Math.max(b.clientHeight, e.clientHeight)
          )
        : Math.max(
            Math.max(b.scrollWidth, e.scrollWidth),
            Math.max(b.clientWidth, e.clientWidth)
          );
    },
  };
})();
