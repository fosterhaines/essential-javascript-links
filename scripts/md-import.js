/*
  How it _should_ work:
  - if the old/additional json exists, open and index it (by href)
  - open and cleanup the markdown
  - iterate over lines:
    - case category: allCategories.push, make current
    - case link: merge with old meta, link.categories.push[cat], allLinks.push
  - stringify and write
 */

;(function md_import() {
  var FS = require('fs'),
      Path = require('path'),
      _ = require('lodash');

  var argv = process.argv,
      cfg = {
        linksID: 'links',
        catsID: 'categories',
        spaces: 2,
        source: argv[2],
        destination: argv[3]
      },
      oldLinks, newTree, md;

  // check cli arguments
  if ( !(cfg.source) || !(cfg.destination) )
    return console.error('Usage: <source.md> <destination.json>');

  // try and import the old JSON data (or at leas create structure)
  oldLinks = readOldLinks(Path.resolve(cfg.destination));

  // read and parse markdown (merging the old JSON)
  md = getMdLines(Path.resolve(cfg.source));
  newTree = parseMarkdown(md, oldLinks);

  // write the JSON
  writeJson(cfg.destination, newTree, cfg.spaces);


  function readOldLinks(file) {
    var links;

    try {
      links = JSON.parse(FS.readFileSync(file, {encoding: 'utf8'}))[cfg.linksID];
    }
    catch (e) {
      links = [];
    }

    return links;
  }

  function getMdLines(file) {
    var buffer = '';

    try {
      buffer = FS.readFileSync(file, {encoding: 'UTF-8', flag: 'r'});
    }
    catch (e) {
      console.error('Couldn\'t open ' + Path.resolve(file));
      process.exit(1);
    }

    return inputCleanup(buffer).split(/\r?\n/);
  }

  function inputCleanup(string) {
    var replacementPairs = [
      { searchFor: /'d\b/g, replaceWith: "\u2019d"},               // I'd
      { searchFor: /'ll\b/g, replaceWith: "\u2019ll"},             //  you'll
      { searchFor: /'m\b/g, replaceWith: "\u2019m"},               //  I'm
      { searchFor: /'re\b/g, replaceWith: "\u2019re"},             //  you're
      { searchFor: /'s\b/g, replaceWith: "\u2019s"},               //  it's
      { searchFor: /s'(\s)/g, replaceWith: "s\u2019$1"},           //  plural possessive
      { searchFor: /'t\b/g, replaceWith: "\u2019t"},               //  don't
      { searchFor: /'ve\b/g, replaceWith: "\u2019ve"},             //  I've
      { searchFor: /(\s)'(\d\ds)/g, replaceWith: "$1\u2019$2"},    //  '90s
      { searchFor: /O'([A-Z])/g, replaceWith: "O\u2019$1"},        //  O'Reilly
      { searchFor: /",/g, replaceWith: ',\u201D'},                 // comma outside quote mark
      { searchFor: /"\./g, replaceWith: '.\u201D'},                // period outside quote mark (transpose only)
      { searchFor: /"\b/g, replaceWith: '\u201C'},                 //  open quote (eg, precedes a 'word boundary')
      { searchFor: /\b"/g, replaceWith: '\u201D'},                 //  close quote (eg, is preceded by a 'word boundary')
      { searchFor: /\b([\.|,|\?|!|;|:|-|—])"/g, replaceWith: '$1\u201D'},    //  close quote after punctuation (which is itself preceded by a 'word boundary')
      { searchFor: / - /g, replaceWith: " — "}                //  em dash with spaces surrounding it
    ];

    replacementPairs.forEach(function(replacement) {
      string = string.replace(replacement.searchFor, replacement.replaceWith);
    })
    return string;
  }

  function parseMarkdown(lines, oldLinks) {
    var categories = [],
        links = [],
        cat = '-',
        tree = {},
        linksIndex = {},
        oldLinksIndex = _.indexBy(oldLinks, 'href'),
        catCounters = {};

    lines.forEach(parseLine);
    tree[cfg.linksID] = links;
    // Only include the non-empty category candidates.
    // We can't know if a header is a category header until we count its links.
    tree[cfg.catsID] = _.filter(categories, function(c) {return catCounters[c]});
    return tree;


    function parseLine(line) {
      var match, link, meta, href;

      if ( match = line.match(/^\s*#+\s(.*)$/) ) {
        // Category header
        categories.push(cat = match[1]);
        catCounters[cat] = 0;
      } else if ( match = line.match(/^\s*[\*\+\-]\s+\[(.+?)\]\((.+?)\)(\s+(.*))?$/) ) {
        href = match[2];

        // check for dupes
        if (_.has(linksIndex, href)) {
          if (!(_.includes(categories, cat))) {
            // we've seen the link, but not under this category
            linksIndex[href].categories.push(cat);
            catCounters[cat]++;
          }
          return;
        }

        link = {
          title: match[1],
          href:  href,
          short_description: match[4],
          categories: [cat]
        };

        // merge old meta
        if (meta = oldLinksIndex[href]) {
          meta.categories = []; // lodash merge is deep — not what we want
          link = _.merge(meta, link);
        }

        // console.log(href, meta);

        links.push(link);
        linksIndex[href] = link;
        catCounters[cat]++;
      }
    }
  }

  function writeJson(file, tree, spaces) {
    spaces || (spaces = 2);
    var theBigString = JSON.stringify(tree, null, spaces);

    try {
      FS.writeFileSync(file, theBigString, {encoding: 'utf8'});
    }
    catch (e) {
      console.error('Couldn\'t write' + Path.resolve(jsonOutPath));
      process.exit(1);
    }
  }

})();