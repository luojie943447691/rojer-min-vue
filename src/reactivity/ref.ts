import { reactive } from "./reactive";


class RefImpl{
    public value;
    constructor(value){
        this.value = value
        return reactive(this)
    }


}


export function ref(value){
    return new RefImpl(value)
}