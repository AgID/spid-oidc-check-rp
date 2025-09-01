import React from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import { BlockUI } from 'primereact/blockui';
import Sticky from 'react-sticky-el';
import "./style.css";

function view(me) { 
    return (
        <div id="MetadataCheck" className="animated fadeIn">
            <p className="title h3">Metadata Service Provider Report</p>
            {me.state.report && 
            <p className="subtitle h4">Last validation date: <strong>{me.state.datetime}</strong></p>
            }
            
            {me.state.report && 
            <div className="row">

                {!me.state.detailview &&
                    <div className="col-md-8">
                        <div className="main">
                            {me.state.report!=null && 
                                <div className="row"> 
                                    <div className="col-sm-12">
                                        <div>
                                            <div>Check: <span className="first-upper">{me.state.testcase}</span></div> 
                                            {me.state.description!=null && <div>Description: {me.state.description}</div> }
                                            {me.state.referements!=null && <div>Referements: {me.state.referements}</div> }
                                        </div>

                                        <div className="mt-3">
                                            {me.state.report.map((t, i)=> {
                                                return(
                                                    <a key={i} 
                                                        className={(t.result=="success")? ((t.validation=="self")? "test-success-self" : "test-success") : ((t.result=="warning")? "test-warning" : "test-fail")}
                                                        title={t.description + (t.message? ": " + t.message : "")}
                                                        onClick={()=>me.selectTest(t)}
                                                        > 
                                                        {t.num} 
                                                    </a> 
                                                );
                                            })}
                                        </div>

                                    </div>                                      
                                </div> 
                            }
                        </div>
                    </div>
                }

                {me.state.detailview &&
                    <div className="col-md-8">
                        <div className="main">
                            {me.state.report!=null && 
                                <div className="row"> 
                                    <div className="col-sm-12 table-responsive">
                                    <div>
                                        <div>Check: <span className="first-upper">{me.state.testcase}</span></div> 
                                        {me.state.description!=null && <div>Description: {me.state.description}</div> }
                                        {me.state.referements!=null && <div>Referements: {me.state.referements}</div> }
                                    </div>
                                        
                                        <table className="table detail-table mt-3">
                                            <tr className="detail-header">
                                                <th className="detail-num">#</th>
                                                <th className="detail-description">Test</th>
                                                <th className="detail-result">Result</th>
                                                <th className="detail-result">Notes</th>
                                            </tr>
                                            {me.state.report.map((t, i)=> {
                                                return(
                                                    <tr key={i} className="detail-row"
                                                        onClick={()=>me.selectTest(t)}>
                                                        <td className={(t.result=="success")? ((t.validation=="self")? "detail-num test-success-self-dm" : "detail-num test-success-dm") : ((t.result=="warning")? "detail-num test-warning-dm" : "detail-num test-fail-dm")}>{t.num}</td>
                                                        <td className="detail-description">{t.description}</td>
                                                        <td className={(t.result=="success")? ((t.validation=="self")? "detail-result test-success-self-dm" : "detail-result test-success-dm") : ((t.result=="warning")? "detail-result test-warning-dm" : "detail-result test-fail-dm")}>
                                                            {(t.result=="success")? ((t.validation=="self")? "SUCCESS (SELF ASSESSMENT)" : "SUCCESS") : ((t.result=="failure")? "FAILURE: " + t.message : t.message)}
                                                        </td>
                                                        <td>{JSON.stringify(t.notes)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </table>
                                    </div>                                      
                                </div> 
                            }
                        </div>
                    </div>
                }


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
                                <button type="button" className="btn btn-primary"
                                    onClick={()=>{me.checkMetadata()}}>
                                    <i className="fa fa-refresh" aria-hidden="true"></i> New check
                                </button>
                            </div>
                        </div>
                    </Sticky>
                </div>
            </div> 
            }
        </div>
    );
}

export default view;                        
