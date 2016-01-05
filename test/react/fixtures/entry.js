import Greeting from './Component';

let App = React.createClass({
  render() {
    return <div>hello there <Greeting name={this.props.name}/></div>
  }
})
