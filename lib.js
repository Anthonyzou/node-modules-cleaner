var { readdir, stat, unlink } = require('fs').promises;
var { resolve } = require('path');

if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(search, this_len) {
    if (this_len === undefined || this_len > this.length) {
      this_len = this.length;
    }
    return this.substring(this_len - search.length, this_len) === search;
  };
}

var getFiles = dir =>
  readdir(dir)
    .then(subdirs => subdirs.map(subdir => resolve(dir, subdir)))
    .then(files => files.filter(f => !f.includes('/node_modules/.bin/')))
    .then(subdirs => {
      return subdirs.map(subdir => {
        var res = resolve(dir, subdir);
        return stat(res).then(fStat =>
          fStat.isDirectory() ? getFiles(res) : res
        );
      });
    })
    .then(files => Promise.all(files))
    .then(files =>
      files.reduce((a, f) => a.concat(f), []).map(i => i.toLowerCase())
    );

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
      // remove mark down
      filtered = filtered.concat(files.filter(i => i.endsWith('.md')));
      // remove map files
      filtered = filtered.concat(files.filter(i => i.endsWith('.map')));
      // test folders
      filtered = filtered.concat(
        files.filter(i => i.includes('/test/') || i.includes('/tests/'))
      );
      // benchmark folders
      filtered = filtered.concat(files.filter(i => i.includes('/bench/')));
      // example folders
      filtered = filtered.concat(files.filter(i => i.includes('/example/')));
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

      return Promise.all([
        filtered,
        ...(dry == true ? [] : filtered.map(unlink)),
      ]);
    })
    .then(([filtered]) => filtered)
    .catch(e => console.error(e));
