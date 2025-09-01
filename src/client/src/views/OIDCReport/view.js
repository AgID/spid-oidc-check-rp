import React from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import { BlockUI } from 'primereact/blockui';
import Sticky from 'react-sticky-el';
import AceEditor from '../../components/AceEditor/';
import moment from 'moment';
import "./style.css";

function view(me) { 
    return (
        <div id="OIDCReport" className="animated fadeIn">
            <p className="title h3">Authorization Code Flow Report</p>
            <div className="row">
                <div className="col-md-8">
                    <div className="main">
                        <div className="row">
                            {!me.state.detailview &&
                                <div className="col-md-12 mb-5">
                                    {me.state.report.cases!=null && 
                                        <div className="row">
                                        {Object.keys(me.state.report.cases).map((c, i)=> {
                                            return (
                                                <div className="col-sm-12 mb-5" key={i} >
                                                    <p className="h4">{me.state.report.cases[c].name}</p>
                                                    <br/><span>Description:</span> {me.state.report.cases[c].description}
                                                    <br/><span>Referements:</span> {me.state.report.cases[c].ref}
                                                    <br/><span>Validation datetime:</span> {moment(me.state.report.cases[c].datetime).format('DD/MM/YYYY HH:mm:ss')}
                                                    <div className="col-sm-12 mt-3">
                                                        {Object.keys(me.state.report.cases[c].hook).map((h)=> {
                                                            return (
                                                                Object.keys(me.state.report.cases[c].hook[h]).map((t, i)=> {
                                                                    return(
                                                                        <a key={i} 
                                                                            onClick={()=>me.selectTest(c, h, me.state.report.cases[c].hook[h][t])}
                                                                            className={(me.state.report.cases[c].hook[h][t].result=="success")? ((me.state.report.cases[c].hook[h][t].validation=="self")? "test-success-self" : "test-success") : (me.state.report.cases[c].hook[h][t].result=="warning")? "test-warning" : "test-fail" }
                                                                            title={me.state.report.cases[c].hook[h][t].description + (me.state.report.cases[c].hook[h][t].notes? ": " + JSON.stringify(me.state.report.cases[c].hook[h][t].notes) : "")}> 
                                                                            {me.state.report.cases[c].hook[h][t].num} 
                                                                        </a> 
                                                                    );
                                                                })
                                                            );
                                                        })}

                                                    </div>  
                                                </div> 
                                            );                                   
                                        })}
                                        </div> 
                                    }
                                </div>
                            }
                            {me.state.detailview &&
                                <div className="col-md-12 mb-5">
                                    {me.state.report.cases!=null && 
                                        <div className="row">      
                                            {Object.keys(me.state.report.cases).map((c, i)=> {
                                            return (
                                                <div className="col-sm-12 mb-5 table-responsive" key={i} >
                                                    <p className="h4">{me.state.report.cases[c].name}</p>
                                                    <br/><span>Description:</span> {me.state.report.cases[c].description}
                                                    <br/><span>Referements:</span> {me.state.report.cases[c].ref}
                                                    <br/><span>Validation datetime:</span> {moment(me.state.report.cases[c].datetime).format('DD/MM/YYYY HH:mm:ss')}
                                                    <table className="table detail-table mt-3">
                                                        <thead>
                                                        <tr className="detail-header">
                                                            <th className="detail-num">#</th>
                                                            <th className="detail-description">Test</th>
                                                            <th className="detail-result">Result</th>
                                                            <th className="detail-note">Note</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {Object.keys(me.state.report.cases[c].hook).map((h)=> {
                                                            return (
                                                                Object.keys(me.state.report.cases[c].hook[h]).map((t, i)=> {
                                                                    return(
                                                                        <tr key={i} className="detail-row"
                                                                            onClick={()=>me.selectTest(c, h, me.state.report.cases[c].hook[h][t])}>
                                                                            <td className={(me.state.report.cases[c].hook[h][t].result=="success")? ((me.state.report.cases[c].hook[h][t].validation=="self")? "detail-num test-success-self-dm" : "detail-num test-success-dm") : 
                                                                                                (me.state.report.cases[c].hook[h][t].result=="warning")? "detail-num test-warning-dm" : "detail-num test-fail-dm" }>{me.state.report.cases[c].hook[h][t].num}</td>
                                                                            <td className="detail-description">{me.state.report.cases[c].hook[h][t].description}</td>
                                                                            <td className={(me.state.report.cases[c].hook[h][t].result=="success")? ((me.state.report.cases[c].hook[h][t].validation=="self")? "detail-result test-success-self-dm" : "detail-result test-success-dm") : 
                                                                                                (me.state.report.cases[c].hook[h][t].result=="warning")? "detail-result test-warning-dm" : "detail-result test-fail-dm" }>

                                                                                {(me.state.report.cases[c].hook[h][t].result=="success")? 
                                                                                    ((me.state.report.cases[c].hook[h][t].validation=="self")? 
                                                                                        "SUCCESS (SELF ASSESSMENT)" : "SUCCESS"
                                                                                    ) 
                                                                                    : 
                                                                                    (me.state.report.cases[c].hook[h][t].message)?
                                                                                        ((me.state.report.cases[c].hook[h][t].result=="failure")? 
                                                                                            "FAILURE: " + JSON.stringify(me.state.report.cases[c].hook[h][t].message) : JSON.stringify(me.state.report.cases[c].hook[h][t].message)
                                                                                        )
                                                                                        :
                                                                                        "FAILURE"
                                                                                }
                                                                            </td>
                                                                            <td className="detail-notes"> 
                                                                                {me.state.report.cases[c].hook[h][t].notes? JSON.stringify(me.state.report.cases[c].hook[h][t].notes) : ''}
                                                                            </td>
                                                                        </tr>
                                                                );
                                                                })
                                                            );
                                                        })}
                                                        </tbody>
                                                    </table>  
                                                </div> 
                                            );                                   
                                            })}
                                        </div>
                                    }
                                </div>
                            }
                        </div>
                    </div>
                </div>

                <div className="col-md-4">   
                    <Sticky stickyClassName="sticky-tools" topOffset={-50}>
                        <div className="tools">
                            <div className="col-sm-12">
                                <label className="switch switch-success me-3">
                                    <input type="checkbox" className="switch-input" 
                                        checked={me.state.detailview}
                                        onChange={(e)=>{me.setDetailView(e.target.checked)}}>
                                    </input>
                                    <span className="switch-slider"></span>
                                </label>
                                <span className="align-super">Details</span>
                                <hr/>
                                <button type="button" className="btn btn-success"
                                    onClick={()=>{me.print()}}>
                                    <i className="fa fa-print" aria-hidden="true"></i> Print
                                </button>
                            </div>
                        </div>
                    </Sticky>
                </div>
            </div>
        </div>
    );
}

export default view;                        
