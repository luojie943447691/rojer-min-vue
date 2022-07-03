export const initEmits = (instance,name,...args) =>{
    // console.log("props",props);
    // console.log("name",args);
    const {props} = instance
    // 组合 eventName 
    const handelKeys = (value) =>{
        return  value ? "on" + value.slice(0,1).toUpperCase() + value.slice(1) : ""
    }

    const handleName = (value) => {
        return value.replace(/\-(\w)/,(_,c) => {
            return c.toUpperCase()
        } )
    }

    const eventName = handelKeys(handleName(name))
    if(eventName in props){
        props[eventName].apply(null, args)
    }
}