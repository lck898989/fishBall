// panel/index.js, this filename needs to match the one registered in package.json
const fs = require("fire-fs");
const path = require("fire-path");
Editor.Panel.extend({
  // css style for panel
  style: fs.readFileSync(Editor.url("packages://map/panel/map/index.css"),'utf-8'),

  // html template for panel
  template: fs.readFileSync(Editor.url("packages://map/panel/map/index.html",'utf-8')),

  // element and variable binding
  $: {
    
  },

  // method executed when template and styles are successfully loaded and initialized
  ready () {
    
    new window.Vue({
      el: this.shadowRoot,
      data: {
        message: "hello"
      },
      methods: {
        
      }
    })
  },

  // register your ipc messages here
  messages: {
    'map:hello' (event) {
      this.$label.innerText = 'Hello!';
    }
  }
});