
const REDDER_TO_DOM = Symbol('render to dom')


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

  get vdom() {
    return this.render().vdom
  }

  get vchildren() {
    return this.children.map(child => this.child.vdom)
  }

  [REDDER_TO_DOM](range) { // 私有函数
    // Range 接口表示一个包含节点与文本节点的一部分的文档片段。可将文本插入到指定位置
    this._range = range
    this.render()[REDDER_TO_DOM](range)
  }

  rerender() {
    let oldRange = this._range
    
    let range = document.createRange()
    range.setStart(oldRange.startContainer, oldRange.startOffset)
    range.setEnd(oldRange.startContainer, oldRange.startOffset)
    this[REDDER_TO_DOM](range)

    oldRange.setStart(range.endContainer, range.endOffset)
    oldRange.deleteContents()
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
class elementWrapper extends Component{
  constructor(type) {
    super(type)
    this.type = type
    // this.root = document.createElement(type)
  }

  // setAttribute(name, value) {
  //   if(name.match(/^on([\s\S]+)/)) {
  //     this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/, val => val.toLowerCase()), value)
  //   } else {
  //     if(name === 'className') {
  //       this.root.setAttribute('class', value)
  //     } else {
  //       this.root.setAttribute(name, value)
  //     }
  //   }
  // }

  // appendChild(component) {
  //   let range = document.createRange()
  //     range.setStart(this.root, this.root.childNodes.length)
  //     range.setEnd(this.root, this.root.childNodes.length)
  //     range.deleteContents()
  //     component[REDDER_TO_DOM](range)
  // }

  [REDDER_TO_DOM](range) {
    range.deleteContents()

    let root = document.createElement(this.type) // 创建root

    // 插入this.props
    for(let name in this.props) {
      let value = this.props[name]

      if(name.match(/^on([\s\S]+)/)) {
        root.addEventListener(RegExp.$1.replace(/^[\s\S]/, val => val.toLowerCase()), value)
      } else {
        if(name === 'className') {
          root.setAttribute('class', value)
        } else {
          root.setAttribute(name, value)
        }
      }
    }

    // 插入 this.children
    for(let child of this.children) {
      let childRange = document.createRange()
      childRange.setStart(root, root.childNodes.length)
      childRange.setEnd(root, root.childNodes.length)
      childRange.deleteContents()
      child[REDDER_TO_DOM](childRange)
    }

    range.insertNode(root)
  }

  get vdom() {
    // 如果对象上没有方法，不能够完成重绘
    return this
    // {
    //   type: this.type,
    //   props: this.props,
    //   children: this.children.map(item => item.vdom)
    // }
  }
  
}

class TextWrapper extends Component{
  constructor(content) {
    super(content)
    this.type = "#text"
    this.content = content
    this.root = document.createTextNode(content)
  }

  get vdom() {
    return this
    /* {
      type: '#text',
      content: this.content
    } */
  }
  [REDDER_TO_DOM](range) { // 私有函数
    range.deleteContents()
    range.insertNode(this.root)
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
      if(child === null) continue
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