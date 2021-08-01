
const REDDER_TO_DOM = Symbol('render to dom')
class elementWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }

  setAttribute(name, value) {
    this.root.setAttribute(name, value)
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
  }

  setAttribute(name, value) {
    this.props[name] = value
  }

  appendChild(component) {
    this.children.push(component)
  }

  [REDDER_TO_DOM](range) { // 私有函数
    // Range 接口表示一个包含节点与文本节点的一部分的文档片段。可将文本插入到指定位置

    this.render()[REDDER_TO_DOM](range)
  }

  rerender() {
    range.deleteContents()
    this[REDDER_TO_DOM](this._range)
  }

  get root() {
    if(!this._root) {
      this._root = this.render().root // 如果render出来的是一个comp那么就会发生递归直到变成一个eleWrapper
    }
    return this._root
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