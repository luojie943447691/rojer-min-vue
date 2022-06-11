import { effect } from "../effect";
import { reactive } from "../reactive";

describe("effect",() =>{

    it("my effect", () =>{
        const user = reactive({
            age:10
        })

        let nextAge;
        
        effect(() =>{
            nextAge = user.age + 1
        })

        expect(nextAge).toBe(11)

        user.age++;
        expect(nextAge).toBe(12)

    })

    it.only("runner", () =>{
        // 1 effect(fn) => 会返回一个 function runner ，这个 runner 就是之前收集的 fn 函数
        let foo = 10;
        const runner:any = effect(() =>{
            foo++;
            return "foo"
        })
        expect(foo).toBe(11)

        const r = runner();

        expect(foo).toBe(12)
        expect(r).toBe("foo")
    })
})