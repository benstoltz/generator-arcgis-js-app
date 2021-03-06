'use strict';
var yeoman = require('yeoman-generator');
var _ = require('underscore.string');
var esprima = require('esprima-fb');
var eswalk = require('esprima-walk');
var escodegen = require('escodegen');
var fsx = require('fs-extra');

module.exports = yeoman.generators.NamedBase.extend({
  askForModuleName: function() {
    var prompts = [{
      type: 'input',
      name: 'name',
      default: 'core',
      message: 'The Component name?',
    }];
  },
  writing: function () {
    this.on('end', function () {
      var p = this.destinationPath('tests/intern.js');
      var f = this.read(p, 'utf-8');
      var tree = esprima.parse(f);
      var t = 'tests/unit/components' + _.dasherize(this.name) + '-view';
      eswalk(tree, function(node) {
        if (node.type === 'Property' && node.key.name === 'suites') {
          node.value.elements.push({
            type: 'Literal',
            value: t,
            raw: t
          });
        }
      }.bind(this));
      var code = escodegen.generate(tree);
      fsx.outputFile(p, code);
    }.bind(this));
    var name = this.name.toLowerCase();
    var cname = _.camelize(this.name);
    this.fs.copyTpl(
      this.templatePath('src/components/_view/View.js'),
      this.destinationPath('src/app/components/'+name+'/View.js'),
      {_:_, name: this.name}
    );
    this.fs.copyTpl(
      this.templatePath('src/components/_view/templates/_Component.html'),
      this.destinationPath('src/app/components/' + name + '/templates/'+cname+'.html'),
      {_:_, name: this.name}
    );
    this.fs.copyTpl(
      this.templatePath('src/components/_view/css/_Component.styl'),
      this.destinationPath('src/app/components/' + name + '/css/'+cname+'.styl'),
      {_:_, name: this.name}
    );
    // nls breaks dojo build in this app
    // leave it up to user to include nls strings
    /*
    this.fs.copyTpl(
      this.templatePath('src/components/_view/nls/_Component.js'),
      this.destinationPath('src/app/components/' + name + '/nls/'+cname+'.js'),
      {_:_, name: this.name}
    );
    */
    // tests
    this.fs.copyTpl(
      this.templatePath('tests/_Component.js'),
      this.destinationPath('tests/unit/components' + _.dasherize(this.name) + '-view.js'),
      {_:_, name: this.name}
    );
  }
});
