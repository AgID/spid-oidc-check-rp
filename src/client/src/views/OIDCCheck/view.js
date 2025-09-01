import React from 'react';
import { BlockUI } from 'primereact/blockui';
import Select from 'react-select';
import Sticky from 'react-sticky-el';
import './switches.css';
import './style.css';

function view(me) { 
    return (
        <div id="OIDCCheck" className="animated fadeIn">
            <p className="title h3">Authorization Code Flow Check</p>
            <div className="row">
                <div className="col-md-8">
                    <div className="main">
                        <div className="row">
                            <div className="col-sm-12 mb-5">
                                <label for="testcase-selector" className="mb-3">
                                    Select the testcase to check and click on start check
                                </label>
                                <Select id="testcase-selector"
                                    name="testcase-selector"
                                    options={me.state.cases}
                                    value={me.state.selected}
                                    onChange={(val)=> {me.selectCase(val)}}
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12 mb-3">
                                <h4>Description</h4>
                                <p className="test-description mb-5">{me.state.selected.value.description}</p>
                                <h4>Sequence Diagram</h4>
                                <img className="testcase-diagram mb-5" src={"../img/testcase/" + me.state.selected.id + ".svg"} /> 

                                <h4>Test List</h4>
                                {me.state.selected &&
                                    me.state.selected.value &&
                                    me.state.selected.value.hook &&
                                    Object.keys(me.state.selected.value.hook).map((h, i)=> {
                                        return (
                                            <div key={i} className="mt-3">
                                                <h5>{h}</h5>
                                                <div className="table-responsive">
                                                    <table className="table table-test">
                                                        <tr className="table-test-header">
                                                            <th className="table-test-num">#</th>
                                                            <th className="table-test-description">Description</th>
                                                        </tr>
                                                        {me.state.selected.value.hook[h].map((t, j)=> {
                                                            return(
                                                                <tr key={j} className="table-test-row">
                                                                    <td className="table-test-row-num">{t.num}</td>
                                                                    <td className="table-test-row-description">{t.description}</td>
                                                                </tr>
                                                            );
                                                        })} 
                                                    </table>
                                                </div>
                                            </div>
                                        );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <Sticky stickyClassName="sticky-tools" topOffset={-50}>
                        <div className="tools">
                            <div className="col-sm-12">
                                <button className="btn btn-lg btn-send btn-primary w-100"
                                    onClick={()=> {me.startCheck()}}> 
                                    <i className="fa fa-paper-plane-o me-2" aria-hidden="true"></i>
                                    Start Check
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
