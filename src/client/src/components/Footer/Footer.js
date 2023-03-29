import React, {Component, version} from 'react';
import Services from '../../services';
import Utility from '../../utility';

class Footer extends Component {

  constructor(props) {
    super(props);

    this.state = {
      package_name: "...",
      package_version: "..."
    }

    let service = Services.getMainService();

    let info = service.getServerInfo(
      (info) => { 
        this.setState(
          { 
            package_name: info.package_name,
            package_version: info.package_version
          })
      }, 
      ()=> {
        Utility.log("Session not found");
      },
      (error)   => { 
        Utility.error("Error on call Server Info API");
      }
    );
  }

  render() {
    return (
      <footer className="app-footer">
        <span>
          {this.state.package_name} - v.{this.state.package_version}
        </span>
        <span className="ms-auto">AgID - Agenzia per l'Italia Digitale</span>
      </footer>
    )
  }
}

export default Footer;
