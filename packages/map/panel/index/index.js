// panel/index.js, this filename needs to match the one registered in package.json
const fs = require("fire-fs");
const path = require("fire-path");
Editor.Panel.extend({
  // css style for panel
  style: fs.readFileSync(Editor.url("packages://map/panel/index/index.css"),'utf-8'),

  // html template for panel
  template: fs.readFileSync(Editor.url("packages://map/panel/index/index.html",'utf-8')),

  // element and variable binding
  $: {
    // btn: '#btn',
    // label: '#label',
  },

  // method executed when template and styles are successfully loaded and initialized
  ready () {
    // this.$btn.addEventListener('confirm', () => {
    //   Editor.Ipc.sendToMain('map:clicked');
    // });
    this.plugin = new window.Vue({
      el: this.shadowRoot,
      data: {
        message: "hello"
      },
      methods: {
        sendToMain() {
          Editor.Ipc.sendToMain('map:clicked');
        }
      }
    })
  },

  // register your ipc messages here
  messages: {
    'map:hello' (event) {
      this.plugin.message = "hello-world"
    }
  }
});