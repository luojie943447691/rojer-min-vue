import { h, renderSlot } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  setup(props, { emit }) {

    return {
    }
  },
  render() {
    const foo = h("p", {}, "foo")
    const age = 123
    return h("div", {},
      [
        renderSlot(this.$slots, "header",{age}),
        foo,
        renderSlot(this.$slots, "footer")

      ]);
  },
};
