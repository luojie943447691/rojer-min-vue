import { h } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  setup(props,{emit}) {

    const click = () =>{
      emit("change-foo",1,2)
    }
    return {
      click
    }
  },
  render() {
    return h("div", {
      onClick:this.click
    }, "foo: " + this.count);
  },
};
