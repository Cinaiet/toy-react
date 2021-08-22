## vdom

对于 wgwCreateElement中，ElementWrapper和TextWrapper 基本上都是针对于root的操作。

### ElementWrapper

针对与ElementWrapper上所有的方法，可以理解为都是root这个真实dom的一个代理。

实现vdom虚拟dom的话，就需要将这些真实dom的代理去掉。

#### 创建ElementWrapper vdom

主要包含三样: `type`, `props`, `children`。

- type 在构造函数中将type存起来；
- props 改写当前setAttribute 
- children 改写当前children

```

// 为了看到vdom比较干净才这样写，后续将重构
get vdom() {
    return {
      type: this.type,
      props: this.props,
      children: this.children.map(item => item.vdom)
    }
  }
```
### TextWrapper

```
get vdom() {
  return {
    type: '#text',
    content: this.content
  }
}
```


如果对象上没有方法，是不能够完成dom的重绘的，需要改写vdom

### 使用vdom创建一个新的dom树

1. 去除this.root 的实dom操作;
2. vdom return this
3. 在render to dom 中的创建this.root


```
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
   
  }
```
### vdom比对

因为dom要更新，所以会使用到renderToDom函数。
及想要实现vdom的比对，需要在render之前进行。

#### 核心
- 只对比对应位置的vdom是不是同一类型的节点
- 更高层级的修改，如两个dom的顺序调换，在真是的react中会采用更好的vdom算法，
- 此处只是为了讲解vdom的原理，不做深层次的展开


```
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
```


在真实的react中，事件是由一个事件管理中心的方式去处理的，对DOM的依赖更小，能做到更精准的去更新位置。

以上。写的有点着急了，后续有时间了再扩展完善。