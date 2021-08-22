
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
  [REDDER_TO_DOM](range) { // 私有函数
    // Range 接口表示一个包含节点与文本节点的一部分的文档片段。可将文本插入到指定位置
    this._range = range
    this.tempVdom = this.vdom

    this.tempVdom[REDDER_TO_DOM](range)
  }

  update() {
    // 只对比对应位置的vdom是不是同一类型的节点
    // 更高层级的修改，如两个dom的顺序调换，在真是的react中会采用更好的vdom算法，
    // 此处只是为了讲解vdom的原理，不做深层次的展开


    /***
     * isSameNode
     * 比较根节点是否一致，返回bool
     * 
     *  
     * */ 
    let isSameNode = (oldNode, newNode) => {
      // 类型不同
      if(oldNode.type !== newNode.type ) return false
      
      // props 不同
      for(let name in newNode.props) {
        if(newNode.props[name] !== oldNode.props[name]) return false
      }

      // 旧dom比新dom props多的话
      if(Object.keys(oldNode.props).length !== Object.keys(oldNode.props).length) return false

      // 文本节点
      if(newNode.type === '#text') {
        if(newNode.content !== oldNode.content) return false
      }
      return true
    }
    /*
     * diff type
     * diff props
     * diff children （真实的react中，children的对比有很多种不同的diff算法，此处也不再展开,使用最土的同位置比较方法）
     * 类型为 #text 时需要对比content是否发生了更改
     */
    let updater = (oldNode, newNode) => {
      
      if(!isSameNode(oldNode, newNode)) {
        // 新节点替换掉旧节点
        newNode[REDDER_TO_DOM](oldNode._range)
        return 
      }
      newNode._range = oldNode._range

      // children中有可能放的是compoent,所以需要一个虚拟的children
      let newChildren = newNode.vchildren
      let oldChildren = oldNode.vchildren

      if(!newChildren || !newChildren.length) return

      let tailRange = oldNode.vchildren[oldNode.vchildren.length - 1]._range

      for(let i = 0; i < newChildren.length; i++) {
        let newChild = newChildren[i]
        let oldChild = oldChildren[i]
        // newChildren.len > oldChildren.leng时
        if(i < oldChildren.length) {
          updater(oldChild, newChild)
        } else {
          let range = document.createRange()
          range.setStart(tailRange.endContainer, tailRange.endOffset)
          range.setEnd(tailRange.endContainer, tailRange.endOffset)
          newChild[REDDER_TO_DOM](range)
          tailRange = range
          // todo
        }
      }
    }

    let vdom = this.vdom
    updater(this.tempVdom, vdom)

    this.tempVdom = vdom // 至此默认为已经完成了dom的update,替换掉旧的vdom

  }

  // rerender() {
  //   let oldRange = this._range
    
  //   let range = document.createRange()
  //   range.setStart(oldRange.startContainer, oldRange.startOffset)
  //   range.setEnd(oldRange.startContainer, oldRange.startOffset)
  //   this[REDDER_TO_DOM](range)

  //   oldRange.setStart(range.endContainer, range.endOffset)
  //   oldRange.deleteContents()
  // }

  setState(newState) {
    if(this.state === null || typeof this.state !== 'object') {
      // 不是一个对象时
      this.state = newState
      this.update()
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
    this.update()
  }
}
class elementWrapper extends Component{
  constructor(type) {
    super(type)
    this.type = type
  }

  [REDDER_TO_DOM](range) {
    this._range = range

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

    !this.vchildren && (this.vchildren = this.children.map(child => child.vdom))

    // 插入 this.children
    for(let child of this.vchildren) {
      let childRange = document.createRange()
      childRange.setStart(root, root.childNodes.length)
      childRange.setEnd(root, root.childNodes.length)
      childRange.deleteContents()
      child[REDDER_TO_DOM](childRange)
    }

    replaceContent(range, root)
  }

  get vdom() {

    // 保证每个vdom树中取出来的children都有vchildren属性
    this.vchildren = this.children.map(child => child.vdom)

    // 如果对象上没有方法，不能够完成重绘
    return this
  }
  
}

class TextWrapper extends Component{
  constructor(content) {
    super(content)
    this.type = "#text"
    this.content = content
    this._range = null
  }

  get vdom() {
    return this
    /* {
      type: '#text',
      content: this.content
    } */
  }
  [REDDER_TO_DOM](range) { // 私有函数
    this._range = range
    let root = document.createTextNode(this.content)
    replaceContent(range, root)
  }
}

function replaceContent(range, node) {
  range.insertNode(node)
  range.setStartAfter(node)
  range.deleteContents()

  range.setStartBefore(node)
  range.setEndAfter(node)

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