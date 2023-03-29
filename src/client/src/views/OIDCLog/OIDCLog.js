import React, { Component } from 'react';
import { withRouter } from '../../withRouter';
import view from "./view.js";
import Utility from '../../utility';
import Services from '../../services';
import ReduxStore from "../../redux/store";
import Actions from "../../redux/main/actions";
import config_test from '../../../../config/test.json';


class OIDCLog extends Component {

  constructor(props, context) {
    super(props);

    this.state = {
        report: {
          lastlog: {}
        },
        detailview: false,
        redirect: false
    };  
  }	

  componentDidMount() { 
      this.getReport();
  }

  getReport() {
    let service = Services.getMainService(); 
    Utility.blockUI(true);
    service.getReport(
      (report) => { 
        Utility.blockUI(false); 
        this.setState({
          report: report
        }, ()=> {
          console.log(this.state);
          if(this.state.report.cases) {
            Object.keys(this.state.report.cases).map((c)=> {
              console.log(c);
            });
          }
        });
      }, 
      () => {
        Utility.blockUI(false); 
        Utility.showModal({
            title: "Warning",
            body: "It's not possible to show the log because a flow test case has not been executed yet. \
                    Please first select a test case from the list and send the authentication request.",
            isOpen: true
        });
        //window.location = "oidc/check";

        this.props.navigate('/oidc/check');

      }, 
      (error) => { 
        Utility.blockUI(false); 
        this.setState({
            report: {},
            detailview: false
        });
        Utility.showModal({
            title: "Error",
            body: error,
            isOpen: true
        });
      }
    );
  }

    setDetailView(detailed) {
        this.setState({
            detailview: detailed
        });
    }

    print() {
        Utility.print("response");
    }

  render() {    
    if(this.state.redirect) {
      const navigate = useNavigate();
      navigate(this.state.redirect, { replace: true });
    }

	  return view(this);
  }
}

export default withRouter(OIDCLog);
