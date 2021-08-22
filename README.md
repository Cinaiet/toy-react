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




