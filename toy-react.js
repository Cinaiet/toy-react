class elementWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }

  setAttribute(name, value) {
    this.root.setAttribute(name, value)
  }

  appendChild(component) {
    this.root.appendChild(component.root)
  }
  
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content)
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

  // for(let child of childrens) {
  //   if(typeof child === 'string') {
  //     child = new TextWrapper(child)
  //   }
  //   ele.appendChild(child)
  // }

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
  parentEle.appendChild(component.root)
}