import { watch } from "../watch";
import { reactive } from "../reactive";

describe("watch", () => {
  it("happy path", () => {
    const user = reactive({
      age: 1,
    });

    watch(user,(oldValue,newValue) =>{
        console.log("newValue----",newValue);
        console.log("oldValue----",oldValue);
    },{
        // immediate:true
    });

    user.age++
  });

});
