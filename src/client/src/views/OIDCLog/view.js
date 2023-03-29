import React from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import BlockUi from 'react-block-ui';
import Sticky from 'react-sticky-el';
import AceEditor from '../../components/AceEditor/';
import moment from 'moment';
import "./style.css";

function view(me) { 
    return (
        <div id="OIDCLog" className="animated fadeIn">
            <p className="title h3">Authorization Code Flow Log</p>
            { me.state.report && me.state.report.lastlog && me.state.report.lastlog.details && (
            <div className="row">
                <div className="col-md-8">
                    <div className="main">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="row"> 
                                    <div className="col-sm-12">
                                        <p className="h4">Last execution log</p>
                                        <AceEditor code={me.state.report.lastlog.details} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">   
                    <Sticky stickyClassName="sticky-tools" topOffset={-50}>
                        <div className="tools">
                            <div className="col-sm-12">
                                {/*
                                <label className="switch switch-success me-3">
                                    <input type="checkbox" className="switch-input" 
                                        checked={me.state.detailview}
                                        onChange={(e)=>{me.setDetailView(e.target.checked)}}>
                                    </input>
                                    <span className="switch-slider"></span>
                                </label>
                                <span className="align-super">Visualizzazione dettaglio</span>
                                <hr/>
                                */}
                                <button type="button" className="btn btn-success"
                                    onClick={()=>{me.print()}}>
                                    <i className="fa fa-print" aria-hidden="true"></i> Print
                                </button>
                            </div>
                        </div>
                    </Sticky>
                </div>
            </div>
            )}

            { (!me.state.report || !me.state.report.lastlog || !me.state.report.lastlog.details) && (
            <div className="row">
                <div className="col-md-12">
                    <div className="main">
                        <i>The log is empty. Check if the authentication request was successfully completed.</i> 
                    </div>
                </div>
            </div>
            )}
        </div>
    );
}

export default view;                        
