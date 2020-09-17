var { readdir, stat, unlink, writeFile } = require('fs').promises;
var { resolve } = require('path');

var diff = (arrA, arrB) => {
  return arrA
    .filter(x => !arrB.includes(x))
    .concat(arrB.filter(x => !arrA.includes(x)));
};

var nmc = require('./package.json').nmc;

var getFiles = dir =>
  readdir(dir)
    .then(subdirs => subdirs.map(subdir => resolve(dir, subdir)))
    .then(files => files.filter(f => !f.includes('/node_modules/.bin/')))
    .then(subdirs =>
      subdirs.map(subdir => {
        var res = resolve(dir, subdir);
        return stat(res).then(fStat =>
          fStat.isDirectory() ? getFiles(res) : res
        );
      })
    )
    .then(files => Promise.all(files))
    .then(files => {
      var results = files
        .reduce((a, f) => a.concat(f), [])
        .map(i => i.toLowerCase());
      if (nmc.ignore) {
        nmc.ignore.map(ignore => {
          results = results.filter(result => !result.includes(ignore));
        });
        return results;
      }
      return results;
    });

module.exports = dry =>
  getFiles('node_modules')
    .then(files => {
      var filtered = [];
      // remove hidden files, except .yarn-integrity
      filtered = filtered.concat(
        files.filter(i => {
          const hiddenFile = i.split('/').pop()[0];
          return hiddenFile === '.' && hiddenFile !== '.yarn-integrity';
        })
      );
      // remove license files
      filtered = filtered.concat(files.filter(i => i.includes('/license')));
      // remove txt files
      filtered = filtered.concat(files.filter(i => i.endsWith('.txt')));
      // remove shell files
      filtered = filtered.concat(files.filter(i => i.endsWith('.sh')));
      // remove yaml files
      filtered = filtered.concat(
        files.filter(i => i.endsWith('.yml') || i.endsWith('.yaml'))
      );
      // remove ts build info
      filtered = filtered.concat(files.filter(i => i.endsWith('.tsbuildinfo')));
      // remove mark down
      filtered = filtered.concat(
        files.filter(i => i.endsWith('.md') || i.endsWith('.markdown'))
      );
      // remove map files
      filtered = filtered.concat(files.filter(i => i.endsWith('.map')));
      // test folders
      filtered = filtered.concat(
        files.filter(i => i.includes('/test/') || i.includes('/tests/'))
      );
      // benchmark folders
      filtered = filtered.concat(files.filter(i => i.includes('/bench/')));
      // example folders
      filtered = filtered.concat(
        files.filter(i => i.includes('/example/') || i.includes('/examples/'))
      );
      // doc folders
      filtered = filtered.concat(
        files.filter(i => i.includes('/doc/') || i.includes('/docs/'))
      );
      // Files without extensions
      filtered = filtered.concat(files.filter(i => !i.includes('.')));
      // C++
      filtered = filtered.concat(
        files.filter(
          i => i.endsWith('.cpp') || i.endsWith('.cc') || i.endsWith('.h')
        )
      );
      filtered = filtered.filter((elem, pos) => filtered.indexOf(elem) == pos);
      if (dry) {
        var strangeFiles = diff(files, filtered).filter(
          file =>
            !file.endsWith('.js') &&
            !file.endsWith('.json') &&
            !file.endsWith('.jst') &&
            !file.endsWith('.dylib') &&
            !file.endsWith('.node') &&
            !file.endsWith('.html') &&
            !file.endsWith('.css') &&
            !file.endsWith('.flow') &&
            !file.endsWith('.png') &&
            !file.endsWith('.ts')
        );
        console.log(`strange files:`, strangeFiles);
      }
      return Promise.all([
        filtered,
        ...(dry == true
          ? [writeFile('removed.json', JSON.stringify(filtered, null, 2))]
          : filtered.map(unlink)),
      ]);
    })
    .then(([filtered]) => filtered)
    .catch(e => console.error(e));
