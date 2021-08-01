import { Component, render, wgwCreateElement } from './toy-react'


class MyComponent extends Component{
  constructor() {
    super()
    this.state = {
      a: 1
    }
  }
  render() {
    return (
      <div>
        <button onclick={() => {this.state.a++; this.rerender()}}>add a ++</button>
        <div>
        {this.state.a.toString()}
        </div>
      </div>
    )
  }
}


render(<MyComponent class="class" id="id" >
  <div>123</div>
  <div></div>
  <div></div>
</MyComponent>, document.body)
