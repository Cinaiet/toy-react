for (let i of [1, 2, 3]) {
  console.log(i)
}

function wgwCreateElement(tagName, attributes, ...childrens) {
  let ele = document.createElement(tagName)
  for(let attr in attributes) {
    ele.setAttribute(attr, attributes[attr])
  }

  for(let child of childrens) {
    if(typeof child === 'string') {
      child = document.createTextNode(child)
    }
    ele.appendChild(child)
  }
  return ele
}
window.a = <div class="class" id="id" >
  <div>123</div>
  <div></div>
  <div></div>
</div>