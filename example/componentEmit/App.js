import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
  name: "App",
  render() {
    // ui
    return h("div",
      {
        id: "root"
      },
      [
        h(Foo, {
          count: 1,
          onChangeFoo:this.change,
        }),
      ]
    );
  },

  setup() {
    const change = (value,value1) =>{
      console.log(value,value1);
    }
    return {
      msg: "mini-vue",
      change
    };
  },
};