import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
  name: "App",
  render() {
    return h("div",
      {},
      [
        h("div", {}, "App"),
        h(Foo, {},
          {
            header: ({age}) => [h("p", {}, "header" + age),h("p", {}, "header1")],
            footer:() => h("p", {}, "footer"),
          }
          // [
          //   h("p", {}, "Foooo" + this.msg),
          //   h("p", {}, "234")
          // ]
        ),
      ]
    );
  },

  setup() {
    return {
      msg: "hi mini-vue"
    };
  },
};