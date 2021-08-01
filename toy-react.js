
const REDDER_TO_DOM = Symbol('render to dom')
class elementWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }

  setAttribute(name, value) {
    if(name.match(/^on([\s\S]+)/)) {
      this.root.addEventListener(RegExp.$1.replace(/^[/s/S]/, val => val.toLowerCase()), value)
    } else {
      this.root.setAttribute(name, value)
    }
  }

  appendChild(component) {
    let range = document.createRange()
      range.setStart(this.root, this.root.childNodes.length)
      range.setEnd(this.root, this.root.childNodes.length)
      range.deleteContents()
      component[REDDER_TO_DOM](range)
  }

  [REDDER_TO_DOM](range) { 
    range.deleteContents()
    range.insertNode(this.root)
  }
  
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content)
  }
  [REDDER_TO_DOM](range) { // 私有函数
    range.deleteContents()
    range.insertNode(this.root)
  }
}

export class Component {
  constructor() {
    this.props = Object.create(null) // 创建一个纯净的空对象
    this.children = []
    this._root = null
    this._range = null
  }

  setAttribute(name, value) {
    this.props[name] = value
  }

  appendChild(component) {
    this.children.push(component)
  }

  [REDDER_TO_DOM](range) { // 私有函数
    // Range 接口表示一个包含节点与文本节点的一部分的文档片段。可将文本插入到指定位置
    this._range = range
    this.render()[REDDER_TO_DOM](range)
  }

  rerender() {
    this._range.deleteContents()
    this[REDDER_TO_DOM](this._range)
  }

  setState(newState) {
    if(this.state === null || typeof this.state !== 'object') {
      // 不是一个对象时
      this.state = newState
      this.rerender()
      return 
    }
    let merge = (oldState, newState) => {
      for(let item in newState) {
        if(oldState[item] === null || typeof oldState[item] !== 'object') {
          oldState[item] = newState[item]
        } else {
          merge(oldState[item], newState[item])
        }
      }
      
    }

    merge(this.state, newState)
    this.rerender()
  }

}

export function wgwCreateElement(type, attributes, ...childrens) {
  let ele;
  if(typeof type === 'string') {
    ele = new elementWrapper(type)
  } else {
    ele = new type
  }

  for(let attr in attributes) {
    ele.setAttribute(attr, attributes[attr])
  }

  let insertChild = (childrens) => {
    for(let child of childrens) {
      if(typeof child === 'string') {
        child = new TextWrapper(child)
      }
      if((typeof child === 'object') && (child instanceof Array)) {
        insertChild(child)
      } else {
        ele.appendChild(child)
      }
      
    }
  }

  insertChild(childrens)
  return ele
}


export function render(component, parentEle) {
  let range = document.createRange()
  range.setStart(parentEle, 0)
  range.setEnd(parentEle, parentEle.childNodes.length)
  range.deleteContents()
  component[REDDER_TO_DOM](range)
}