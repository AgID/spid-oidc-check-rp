import React, { Component } from 'react';
import { withRouter } from '../../withRouter';
import view from "./view.js";
import Utility from '../../utility';
import Services from '../../services';
import ReduxStore from "../../redux/store";
import Actions from "../../redux/main/actions";
import config_test from '../../../../config/test.json';


class OIDCReport extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
        report: {
          description: null,
          cases: {},
          lastlog: {}
        },
        detailview: false
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
          /*
          console.log(this.state);
          Object.keys(this.state.report.cases).map((c)=> {
            console.log(c);
          });
          */
        });
      }, 
      () => {
        Utility.blockUI(false); 
        Utility.showModal({
            title: "Warning",
            body: "It's not possible to show the report because a flow test has not been yet executed. \
                  Please first select a test case from the list and send the authentication request.",
            isOpen: true
        });
        this.props.navigate("/oidc/check");
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

  selectTest(testcase, hook, test) {
    let body = "<p><b>Description</b><br/>" + test.description + "</p>";
    if(test.result=='failure') {
      body += "<p><b>Error message</b><br/>" + test.message + "</p>";
    }

    Utility.showModal({
      title: "Test " + test.hook + " " + test.num,
      subtitle: "Result: " + ((test.validation=='automatic' || test.result=='success')? test.result.toUpperCase() : test.message),
      body: body,
      switch1: test.result=='success' || test.result=='failure',
      switch1Text: "Test EXECUTED",
      switch1Func: (test.validation=='self')? (e)=> {this.setExecuted(testcase, hook, test, e)} : null, 
      switch2: test.result=='success',
      switch2Text: "Test PASSED",
      switch2Func: (test.validation=='self')? (e)=> {this.setPassed(testcase, hook, test, e)} : null, 
      input: Utility.isObject(test.notes)? JSON.stringify(test.notes) : test.notes,
      inputVisible: true,
      inputEnabled: true, 
      inputFunc: (e)=> {this.setNotes(testcase, hook, test, e)},
      isOpen: true
    });
  }

  setExecuted(testcase, hook, test, executed) {
    this.setTestData(testcase, hook, test, {
      result: executed? 'failure' : 'warning'
    });
  }

  setPassed(testcase, hook, test, passed) {
    this.setTestData(testcase, hook, test, {
      result: passed? 'success' : 'failure'
    });
  }

  setNotes(testcase, hook, test, notes) {
    this.setTestData(testcase, hook, test, {
      notes: notes
    });
  }

  setTestData(testcase, hook, test, data) {
    let service = Services.getMainService();
    let store = ReduxStore.getMain();

    //Utility.blockUI(true);
    service.patchOIDCTest(
      testcase,
      hook,
      test.num, 
      data,
      (report) => { 
        //Utility.blockUI(false); 
        this.setState({
          report: report
        }, ()=> {
          /*
          console.log(this.state);
          Object.keys(this.state.report.cases).map((c)=> {
            console.log(c);
          });
          */
        });
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

  render() {    
	  return view(this);
  }
}

export default withRouter(OIDCReport);
