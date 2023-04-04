// Copyright (c) 2018, Gordon Lam
"use strict";

(function(){
  var root;
  root = this;
  var XRegExp;

  if (typeof require !== "undefined"){
     XRegExp = require('xregexp/src/xregexp.js');
  }
  else
    XRegExp = root.XRegExp;

  var parser = {};
  var MatchedAddress = {};

  var Street_Type = {
    Alley:'AL',
    Arcade:'ARC',
    Avenue:'AVE',
    Boulevard:'BLV',
    Bend:'BND',
    Bypass:'BPS',
    Brace:'BR',
    Circuit:'CCT',
    Chase:'CH',
    Circle:'CIR',
    Close:'CL',
    Common:'CMN',
    Concourse:'CNC',
    Corner:'CNR',
    Circus:'CRC',
    Crescent:'CRS',
    Crossing:'CSG',
    Corso:'CSO',
    Court:'CT',
    Centre:'CTR',
    Cove:'CVE',
    Causeway:'CWY',
    Drive:'DR',
    Driveway:'DRY',
    Entrance:'ENT',
    Esplanade:'ESP',
    Expressway:'EXP',
    Fairway:'FAY',
    Frontage:'FR',
    Freeway:'FWY',
    Garden:'GDN',
    Glade:'GL',
    Glen:'GLN',
    Grange:'GRA',
    Ground:'GRD',
    Green:'GRN',
    Gate:'GTE',
    Grove:'GVE',
    Heights:'HTS',
    Highway:'HWY',
    Junction:'JN',
    Key:'KEY',
    Lane:'LA',
    Link:'LK',
    Loop:'LP',
    Mall:'ML',
    Mount:'MT',
    Mews:'MW',
    Motorway:'MWY',
    Nook:'NK',
    Outlook:'OUT',
    Parade:'PDE',
    Place:'PL',
    Plaza:'PLZ',
    Point:'PNT',
    Promenade:'PRM',
    Pass:'PSS',
    Path:'PT',
    Parkway:'PWY',
    Quadrant:'QD',
    Quadrangle:'QDG',
    Quay:'QY',
    Road:'RD',
    Ridge:'RDG',
    Roadway:'RDY',
    Reserve:'RES',
    Rise:'RI',
    Round:'RN',
    Row:'ROW',
    Rest:'RST',
    Retreat:'RT',
    Route:'RTE',
    'Right of Way':'RTW',
    Siding:'SDG',
    Square:'SQ',
    Street:'ST',
    STS:'ST',
    Streets:'STS',
    Terrace:'TCE',
    Track:'TR',
    Trail:'TRL',
    Tollway:'TWY',
    View:'VW',
    Way:'WAY',
    Walk:'WK',
    Walkway:'WKY',
    Wynd:'WND'
  };

  var State_Code = {
    "New South Wales": "NSW",
    "Northern Territory	": "NT",
    "Queensland": "QLD",
    "South Australia": "SA",
    "Tasmania": "TAS",
    "Victoria": "VIC",
    "Western Australia": "WA",
    "Australian Capital Territory": "ACT",
  };

  var Direction_Code;
  var initialized = false;

  var Normalize_Map = {
    type: Street_Type,
    type1: Street_Type,
    type2: Street_Type,
    state: State_Code,
  }

  function capitalize(s){
    return s && s[0].toUpperCase() + s.slice(1);
  }
  function keys(o){
    return Object.keys(o);
  }
  function values(o){
    var v = [];
    keys(o).forEach(function(k){
      v.push(o[k]);
    });
    return v;
  }
  function each(o,fn){
    keys(o).forEach(function(k){
      fn(o[k],k);
    });
  }
  function invert(o){
    var o1= {};
    keys(o).forEach(function(k){
      o1[o[k]] = k;
    });
    return o1;
  }
  function flatten(o){
    return keys(o).concat(values(o));
  }
  function lazyInit(){
    if (initialized) {
      return;
    }
    initialized = true;

    MatchedAddress = {
      type    : flatten(Street_Type).sort().filter(function(v,i,arr){return arr.indexOf(v)===i }).join('|'),
      fraction : '\\d+\\/\\d+',
      state   : '\\b(?:' + keys(State_Code).concat(values(State_Code)).map(XRegExp.escape).join('|') + ')\\b',
      postcode     : '(?<postcode>\\d{4})[- ]?(?<plus4>\\d{4})?',
      corner  : '(?:\\band\\b|\\bat\\b|&|\\@)',
    };

    MatchedAddress.streetNameNumber = '(?<streetNumber>\\d+-?\\d*)(?=\\D)';

    MatchedAddress.streetName = '                                       \n\
      (?:                                                       \n\
        (?:(?<streetName_0>'+MatchedAddress.direct+')\\W+               \n\
           (?<streetType_0>'+MatchedAddress.type+')\\b                    \n\
        )                                                       \n\
        |                                                       \n\
        (?:(?<prefix_0>'+MatchedAddress.direct+')\\W+)?               \n\
        (?:                                                     \n\
          (?<streetName_1>[^,]*\\d)                                 \n\
          (?:[^\\w,]*(?<suffix_1>'+MatchedAddress.direct+')\\b)     \n\
          |                                                     \n\
          (?<streetName_2>[^,]+)                                    \n\
          (?:[^\\w,]+(?<streetType_2>'+MatchedAddress.type+')\\b)         \n\
          (?:[^\\w,]+(?<suffix_2>'+MatchedAddress.direct+')\\b)?    \n\
          |                                                     \n\
          (?<street_3>[^,]+?)                                   \n\
          (?:[^\\w,]+(?<streetType_3>'+MatchedAddress.type+')\\b)?        \n\
          (?:[^\\w,]+(?<suffix_3>'+MatchedAddress.direct+')\\b)?    \n\
        )                                                       \n\
      )';

    MatchedAddress.unitType_numbered = '             \n\
      (?<unitType_1>su?i?te                      \n\
        |p\\W*[om]\\W*b(?:ox)?                        \n\
        |(?:ap|dep)(?:ar)?t(?:me?nt)?                 \n\
        |ro*m                                         \n\
        |flo*r?                                       \n\
        |uni?t                                        \n\
        |bu?i?ldi?n?g                                 \n\
        |ha?nga?r                                     \n\
        |lo?t                                         \n\
        |pier                                         \n\
        |slip                                         \n\
        |spa?ce?                                      \n\
        |stop                                         \n\
        |tra?i?le?r                                   \n\
        |PO box                                   \n\
        |P.O. box)(?![a-z]                                 \n\
      )                                               \n\
      ';

    MatchedAddress.unitType_unnumbered = '           \n\
      (?<unitType_2>ba?se?me?n?t                 \n\
        |fro?nt                                       \n\
        |lo?bby                                       \n\
        |lowe?r                                       \n\
        |off?i?ce?                                    \n\
        |pe?n?t?ho?u?s?e?                             \n\
        |rear                                         \n\
        |side                                         \n\
        |uppe?r                                       \n\
      )\\b';

    MatchedAddress.sec_unit = '                               \n\
      (?:                               #fix3             \n\
        (?:                             #fix1             \n\
          (?:                                             \n\
            (?:'+MatchedAddress.unitType_numbered+'\\W*) \n\
            |(?<unitType_3>\\#)\\W*                  \n\
          )                                               \n\
          (?<unitNumber_1>[\\w-]+)                      \n\
        )                                                 \n\
        |                                                 \n\
        '+MatchedAddress.unitType_unnumbered+'           \n\
      )';

    MatchedAddress.suburb_and_state = '                       \n\
      (?:                                               \n\
        (?<suburb>[^\\d,]+?)\\W+                          \n\
        (?<state>'+MatchedAddress.state+')                  \n\
      )                                                 \n\
      ';

    MatchedAddress.place = '                                \n\
      (?:'+MatchedAddress.suburb_and_state+'\\W*)?            \n\
      (?:'+MatchedAddress.postcode+')?                           \n\
      ';

    MatchedAddress.address = XRegExp('                      \n\
      ^                                                 \n\
      [^\\w\\#]*                                        \n\
      ('+MatchedAddress.streetNameNumber+')\\W*                       \n\
      (?:'+MatchedAddress.fraction+'\\W*)?                  \n\
         '+MatchedAddress.streetName+'\\W+                      \n\
      (?:'+MatchedAddress.sec_unit+')?\\W*          #fix2   \n\
         '+MatchedAddress.place+'                           \n\
      \\W*$','ix');

    var sep = '(?:\\W+|$)'; // no support for \Z

    MatchedAddress.informal_address = XRegExp('                   \n\
      ^                                                       \n\
      \\s*                                                    \n\
      (?:'+MatchedAddress.sec_unit+sep+')?                        \n\
      (?:'+MatchedAddress.streetNameNumber+')?\\W*                          \n\
      (?:'+MatchedAddress.fraction+'\\W*)?                        \n\
         '+MatchedAddress.streetName+sep+'                            \n\
      (?:'+MatchedAddress.sec_unit.replace(/_\d/g,'$&1')+sep+')?  \n\
      (?:'+MatchedAddress.place+')?                               \n\
      ','ix');

    MatchedAddress.intersection = XRegExp('                     \n\
      ^\\W*                                                 \n\
      '+MatchedAddress.streetName.replace(/_\d/g,'1$&')+'\\W*?      \n\
      \\s+'+MatchedAddress.corner+'\\s+                         \n\
      '+MatchedAddress.streetName.replace(/_\d/g,'2$&') + '\\W+     \n\
      '+MatchedAddress.place+'\\W*$','ix');
  }
  parser.normalize_address = function(parts){
    lazyInit();
    if(!parts)
      return null;
    var parsed = {};

    Object.keys(parts).forEach(function(k){
      if(['input','index'].indexOf(k) !== -1 || isFinite(k))
        return;
      var key = isFinite(k.split('_').pop())? k.split('_').slice(0,-1).join('_'): k ;
      if(parts[k])
        parsed[key] = parts[k].trim().replace(/^\s+|\s+$|[^\w\s\-#&]/g, '');
    });
    each(Normalize_Map, function(map,key) {
      if(parsed[key] && map[parsed[key].toLowerCase()]) {
        parsed[key] = map[parsed[key].toLowerCase()];
      }
    });

    ['type', 'type1', 'type2'].forEach(function(key){
      if(key in parsed)
        parsed[key] = parsed[key].charAt(0).toUpperCase() + parsed[key].slice(1).toLowerCase();
    });

    // Handle post box address
    if(typeof parsed.unitType !== "undefined"){
        if(parsed.unitType.replace(/\s/g, '').toLowerCase()=='pobox'){
            parts.input = parts.input.replace(/\./g, "");
            var suburbAndState = 'street' + parts.input.replace(parsed.unitType,'').replace(parsed.unitNumber,'');
            var postBoxLocation = parser.parseLocation(suburbAndState);
            delete postBoxLocation.streetNumber;
            delete postBoxLocation.street;
            postBoxLocation.propertyName = parsed.unitType + ' ' + parsed.unitNumber;
            return postBoxLocation;
        }
    }

    if (typeof parsed.streetType !== "undefined") parsed.streetType = shortenStreetType(parsed.streetType);
    if (typeof parsed.streetType1 !== "undefined") parsed.streetType1 = shortenStreetType(parsed.streetType1);
    if (typeof parsed.streetType2 !== "undefined") parsed.streetType2 = shortenStreetType(parsed.streetType2);

    // Handle Intersection
    if (typeof parsed.streetName1 !== "undefined" || typeof parsed.streetName2 !== "undefined" || typeof parsed.streetType1 !== "undefined" || typeof parsed.streetType2 !== "undefined" ){

        if(typeof parsed.streetType1 == "undefined" && typeof parsed.streetType2 !== "undefined"){
          parsed.streetType1 = parsed.streetType2;
          if(typeof parsed.streetName1 == "undefined" && typeof parsed.street1 !== "undefined"){
            parsed.streetName1 = parsed.street1;
            delete(parsed.street1)
          }
        }
        parsed.streetName1 = parsed.streetName1.replace(/^(Crn|Cnr of|Cnr|Corner)/g, "");
        parsed.streetName = parsed.streetName1 + ' ' +  parsed.streetType1 + ' & ' + parsed.streetName2 + ' ' + parsed.streetType2;
    }

    if(parsed.suburb){
      parsed.suburb = titleCase(parsed.suburb);
      parsed.suburb = XRegExp.replace(parsed.suburb,
        XRegExp('^(?<dircode>'+MatchedAddress.dircode+')\\s+(?=\\S)','ix'),
        function(match){
          return capitalize(Direction_Code[match.dircode.toUpperCase()]) +' ';
        });
    }

    Object.keys(parsed).forEach(function(key){
      if (typeof parsed[key] !== "undefined") parsed[key] = parsed[key].trim();
    })

    return parsed;
  };

  parser.parseAddress = function(address){
    lazyInit();
    var parts = XRegExp.exec(address,MatchedAddress.address);
    return parser.normalize_address(parts);
  };
  parser.parseInformalAddress = function(address){
    lazyInit();
    var parts = XRegExp.exec(address,MatchedAddress.informal_address);
    return parser.normalize_address(parts);
  };
  parser.parseLocation = function(address){
    address = optimiseAddress(address);
    lazyInit();
    if (XRegExp(MatchedAddress.corner,'xi').test(address)) {
        return parser.parseIntersection(address);
    }
    return parser.parseAddress(address)
        || parser.parseInformalAddress(address);
  };
  parser.parseIntersection = function(address){
    lazyInit();
    var parts = XRegExp.exec(address,MatchedAddress.intersection);
    parts = parser.normalize_address(parts);
    // if(parts){
    //     // parts.type2 = parts.type2 || '';
    //     // parts.type1 = parts.type1 || '';
    //     if (parts.type2 && !parts.type1 || (parts.type1 === parts.type2)) {
    //         var type = parts.type2;
    //         type = XRegExp.replace(type,/s\W*$/,'');
    //         if (XRegExp('^'+MatchedAddress.type+'$','ix').test(type)) {
    //             parts.type1 = parts.type2 = type;
    //         }
    //     }
    // }

    return parts;
  };

  function optimiseAddress(address){   
    // If there is a unit character
    if (!isNaN(address.substr(0,address.indexOf(' '))[0])){
        var unitNumber = address.match(/\d+([a-zA-Z]?)/)[0];
        var unitChracter = address.match(/\d+([a-zA-Z]?)/)[1];
        if (unitChracter!=''){

          address = 'unit '+unitChracter+' '+address.substr(address.indexOf(' ')+1);
        }
    }


    //  Remove brankets and contents in address
    return address.replace(/\s*\([^)]*\)/g, "").replace(/\s-\s/g,"-");
  }

  function shortenStreetType(streetType){
    // Street_Type.map((s)=>{
    //   console.log(s);
    // })
    if (typeof Street_Type[streetType] !== "undefined") return Street_Type[streetType];
    return streetType;
  }

  function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    // Directly return the joined string
    return splitStr.join(' '); 
  }

  // AMD / RequireJS
  if (typeof define !== 'undefined' && define.amd) {
      define([], function () {
          return parser;
      });
  }
  // Node.js
  else if (typeof exports !== "undefined") {
    exports.parseIntersection = parser.parseIntersection;
    exports.parseLocation = parser.parseLocation;
    exports.parseInformalAddress = parser.parseInformalAddress;
    exports.parseAddress = parser.parseAddress;
  }
  // included directly via <script> tag
  else {
      root.addressParser = root.addressParser || parser;
  }

}());