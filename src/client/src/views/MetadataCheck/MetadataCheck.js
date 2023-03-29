import React, { Component } from 'react';
import { withRouter } from '../../withRouter';
import view from './view.js';
import Utility from '../../utility';
import Services from '../../services';
import ReduxStore from '../../redux/store';
import Actions from '../../redux/main/actions';
import moment from 'moment';


class MetadataCheck extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
        testcase: props.testcase,
        description: null,
        referements: null,
        report: null,
        datetime: null,
        detailview: false
    };  
  }	

  componentDidMount() { 
    this.getLastCheck();
  }
  
  getLastCheck() {
    let service = Services.getMainService(); 
    Utility.blockUI(true);
    service.getLastCheck(
      this.state.testcase,
      (check) => { 
        Utility.blockUI(false); 
        this.setState({
          testcase: check.testcase,
          description: check.description,
          referements: check.referements,
          report: check.report,
          datetime: moment(check.datetime).format('DD/MM/YYYY HH:mm:ss')
        });
      }, 
      () => {
        this.checkMetadata();
      },
      (error) => { 
        Utility.blockUI(false); 
        this.setState({
          description: null,
          referements: null,
          report: null,
          datetime: null
        });
        Utility.showModal({
            title: "Error",
            body: error,
            isOpen: true
        });
      }
    );
  }

  checkMetadata() {
    let service = Services.getMainService();
    let store = ReduxStore.getMain();

    Utility.blockUI(true);
    service.checkMetadata(
      this.state.testcase,
      (check) => { 
        Utility.blockUI(false); 
        this.setState({
          testcase: check.testcase,
          description: check.description,
          referements: check.referements,
          report: check.report,
          datetime: moment(check.datetime).format('DD/MM/YYYY HH:mm:ss')
        });
      }, 
      (error) => { 
        Utility.blockUI(false);
        this.setState({
          description: null,
          referements: null,
          report: null,
          datetime: null
        });
        Utility.showModal({
            title: "Error",
            body: error,
            isOpen: true
        });
        this.props.navigate('/metadata/download');
      }
    );
  }
  
  setDetailView(detailed) {
      this.setState({
          detailview: detailed
      });
  }

  print() {
      Utility.print("metadata-" + this.state.testcase);
  }
  
  selectTest(test) {
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
      switch1Func: (test.validation=='self')? (e)=> {this.setExecuted(test, e)} : null, 
      switch2: test.result=='success',
      switch2Text: "Test PASSED",
      switch2Func: (test.validation=='self')? (e)=> {this.setPassed(test, e)} : null, 
      input: (typeof test.notes === 'object')? JSON.stringify(test.notes) : test.notes,
      inputVisible: true,
      inputEnabled: true, 
      inputFunc: (e)=> {this.setNotes(test, e)},
      isOpen: true
    });
  }

  setExecuted(test, executed) {
    this.setTestData(test, {
      result: executed? 'failure' : 'warning'
    });
  }

  setPassed(test, passed) {
    this.setTestData(test, {
      result: passed? 'success' : 'failure'
    });
  }

  setNotes(test, notes) {
    this.setTestData(test, {
      notes: notes
    });
  }

  setTestData(test, data) {
    let service = Services.getMainService();
    let store = ReduxStore.getMain();

    //Utility.blockUI(true);
    service.patchMetadataTest(
      this.state.testcase,
      test.num, 
      data,
      (check) => { 
        //Utility.blockUI(false); 
        this.setState({
          testcase: check.testcase,
          description: check.description,
          referements: check.referements,
          report: check.report,
          datetime: moment(check.datetime).format('DD/MM/YYYY HH:mm:ss')
        });
      }, 
      (error) => { 
        //Utility.blockUI(false);
        this.setState({
          description: null,
          referements: null,
          report: null,
          datetime: null
        });
        Utility.showModal({
            title: "Error",
            body: error,
            isOpen: true
        });
        this.props.navigate('/metadata/download');
      }
    );
  }


  render() {    
	  return view(this);
  }
}

export default withRouter(MetadataCheck);
