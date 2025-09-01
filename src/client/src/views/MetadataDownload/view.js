import React from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import { BlockUI } from 'primereact/blockui';
import AceEditor from '../../components/AceEditor/';
import Sticky from 'react-sticky-el';
import "./style.css";

function view(me) { 
    return (
        <div id="MetadataDownload" className="animated fadeIn">
            <p className="title h3">Metadata OIDC Relying Party</p>
            <div className="row">
                <div className="col-md-8">
                    <div className="main">
                        <div className="row">
                            <div className="col-sm-12 mb-3">
                                <label className="mb-3">
                                    URL Type
                                </label>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="radio" name="check-type" id="type-configuration" 
                                        checked={me.state.type=='configuration'} 
                                        onChange={()=> { me.setType('configuration') }} />
                                    <label class="form-check-label" for="flexRadioDefault1">
                                        <strong>URL OIDC Core Configuration</strong> (.well-known/openid-configuration)
                                    </label>
                                </div>
                                <div class="form-check mb-5">
                                    <input class="form-check-input" type="radio" name="check-type" id="type-federation" 
                                        checked={me.state.type=='federation'}
                                        onChange={()=> { me.setType('federation') }} />
                                    <label class="form-check-label" for="flexRadioDefault2">
                                        <strong>URL OpenID Federation</strong> (.well-known/openid-federation)
                                    </label>
                                </div>
                                
                                <label for="input-metadata" className="mb-3">
                                    URL { (me.state.type=='configuration')? '.well-known/openid-configuration' : '.well-known/openid-federation' }
                                </label>
                                <input id="input-metadata"
                                    type="text"
                                    ref="inputMetadata"
                                    className="metadata me-3"
                                    placeholder={me.state.url} />
                            </div>
                        </div>
                        { me.state.configuration!=null && me.state.configuration!="" && 
                        <div className="row">
                            <div className="col-sm-12 code">
                                <AceEditor code={me.state.configuration} />
                            </div>
                        </div>
                        }
                    </div>
                </div>
                <div className="col-md-4">   
                    <Sticky stickyClassName="sticky-tools" topOffset={-50}>
                        <div className="tools">
                            <div className="col-sm-12">
                                <button type="button" className="btn btn-primary" 
                                    onClick={(e)=>{me.downloadMetadata(me.refs.inputMetadata.value)}}>
                                    <i className="fa fa-arrow-down" aria-hidden="true"></i> Download
                                </button>
                                <button type="button" className="btn btn-primary" 
                                    onClick={(e)=>{me.downloadMetadata(me.state.url)}}>
                                    <i className="fa fa-refresh" aria-hidden="true"></i> Update
                                </button>
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
