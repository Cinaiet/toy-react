
class EleWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }

  setAttribute(name, val) {
    if(name.match(/^on([\s\S]+)$/)) {
      let eventName = RegExp.$1.replace(/^[\s\S]/, s => s.toLowerCase())
      this.root.addEventListener(eventName, val)
    }
    if(name === 'className') {
      name = 'class'
    }
    this.root.setAttribute(name, val)
  }

  appendChild(vchild) {
    let range = document.createRange()
    if(this.root.children.length) {
      range.setStartAfter(this.root.lastChild)
      range.setEndAfter(this.root.lastChild)
    }  else {
      range.setStart(this.root, 0)
      range.setEnd(this.root, 0)
    }

    vchild.mountTo(range)

  }

  mountTo(range) {
    range.deleteContents()
    range.insertNode(this.root)
    
  }
}

class TextWrapper {
  constructor(text) {
    this.text = document.createTextNode(text)
  }

  mountTo(range) {
    range.deleteContents()
    range.insertNode(this.text)
  }

}

export class Component {
  constructor() {
    this.children = []
    this.props = Object.create(null) 
  }
  setAttribute(name, val){
    
    this.props[name] = val
    this[name] = val
  }

  mountTo(range) {
    this.range = range
    this.update()
  }
  appendChild(vchild) {
    this.children.push(vchild)
    
  }
  update() {
    let placholder = document.createComment('placholder')
    let range = document.createRange()
    range.setStart(this.range.endContainer, this.range.endOffset)
    range.setEnd(this.range.endContainer, this.range.endOffset)

    range.insertNode(placholder)

    this.range.deleteContents()
    let vdom = this.render()
    vdom.mountTo(this.range)

    // placholder.parentNode.removeChild(placholder)
  }

  setState(state) {

    // let merge = (oldState, {payload}) => {
    //   for(let p in newState) {
    //     if(typeof p === 'object') {
    //       if(typeof newState[p] !== 'object') {
    //         oldState[p] = {}
    //       }
    //       merge(oldState[p], newState[p])
    //     } else {
    //       oldState[p] = newState[p]
    //     }
    //   }
    //  }
    // }

    let mergeState = (oldState, newState) => {
      return {
        ...oldState,
        ...newState
      }
    }

    if(!this.state && state) {
      state = {}
    }

    this.state = mergeState(this.state, state)

    console.log(this.state)
    this.update()
  }

}

export let ToyReact = {
  createElement(type, attributes, ...children){
    
    // debugger;
    let ele
    if(typeof type  === 'string')
      ele = new EleWrapper(type)
    else
      ele = new type

    for(let name in attributes) {
      ele.setAttribute(name, attributes[name])
    }


    let insertChildren = (children) => {
      
      for(let child of children) {
        if(typeof child === 'object' && child instanceof Array) {
          insertChildren(child)
        } else {
          if(!(child instanceof Component)
              && !(child instanceof EleWrapper)
              && !(child instanceof TextWrapper))
            child = String(child)
          if(typeof child  === 'string') 
            child = new TextWrapper(child)
          ele.appendChild(child)
        }
      }
    }

    insertChildren(children)

    return ele
  },
  render(vdom, ele) {
    let range = document.createRange()
    if(ele.children.length) {
      range.setStartAfter(ele.lastChild)
      range.setEndAfter(ele.lastChild)
    }  else {
      range.setStart(ele, 0)
      range.setEnd(ele, 0)
    }

    vdom.mountTo(range)
  }
}