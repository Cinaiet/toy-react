import { Component, render, wgwCreateElement } from './toy-react'


class MyComponent extends Component{
  constructor() {
    super()
    this.state = {
      a: '1'
    }
  }
  render() {
    return (
      <div>
        <div>
          <div> my component</div>
          <span>{this.state.a}</span>
        </div>
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
