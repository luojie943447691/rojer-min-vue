import {h} from '../../lib/guide-mini-vue.esm.js'
import {Foo} from './Foo.js'

export const App = {
    render() {
      window.self = this
      // ui
      return h("div", 
      {
        id:"root"
      },
      [
        // h("div", {
        //   onClick(){
        //     console.log("click");
        //   }
        // }, "hi," + this.msg),
        h(Foo, {
          count: 1,
        }),
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