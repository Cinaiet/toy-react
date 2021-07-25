import { Component, render, wgwCreateElement } from './toy-react'


class MyComponent extends Component{
  render() {
    return (
      <div>
        <div>my component</div>
          {this.children}
      </div>
    )
  }
}


render(<MyComponent class="class" id="id" >
  <div>123</div>
  <div></div>
  <div></div>
</MyComponent>, document.body)
