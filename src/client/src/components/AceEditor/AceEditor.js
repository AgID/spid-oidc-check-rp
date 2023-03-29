import { Component } from 'react';
import view from "./view.js";
import Utility from '../../utility';

class AceEditor extends Component {
    
  constructor(props) {
    super(props);
    this.state = {code: (props.code!=null)? JSON.stringify(props.code, null, 4):""};
  }  

  static getDerivedStateFromProps(props, state) {
    Utility.log("State", props.code)
    return {
      code: (props.code!=null)? JSON.stringify(props.code, null, 4):""
    }
  }  

  render() { return view(this); }
}

export default AceEditor;
