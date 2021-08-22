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

