import {h} from '../../lib/guide-mini-vue.esm.js'

export const App = {
    render() {
      window.self = this
      // ui
      return h("div", 
      {
        id:"root"
      },
      [
        h("div", {
          onClick(){
            console.log("click");
          }
        }, "hi," + this.msg),
        h("div", {
          count: 1,
        },
        "123"
        ),
      ]
      // "hi, " + this.msg
      // "hi, mini-vue"
      // [h("p", { class:"red"}, "hi"), h("p", {class:"blue"}, "mini-vue")]
      );
    },
  
    setup() {
      return {
        msg: "mini-vue",
      };
    },
  };