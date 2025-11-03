import React from 'react';
import { BlockUI } from "ns-react-block-ui";
import './style.css';


function view(me) { 
    return (
		<div id="Worksave" className="container container-login animated fadeIn">
			<img className="img-fluid img-logo" src="img/logo.png" />
			{ me.state.available_stores && me.state.available_stores.length>0 && (
				<div className="justify-content-center row mb-5 section-selector">
					{ /*me.state.available_stores && me.state.available_stores.length==1 && (
					<div className="title mb-3">È stato selezionato il...</div>
					) */}
					{ /*me.state.available_stores && me.state.available_stores.length>1 && (
					<div className="title mb-3">Seleziona il metadata da utilizzare...</div>
					) */}
					{ me.isTypeAvailable('test') && (
						<div className="col col-12 col-md-12 col-lg-4">
							<div className={`btn ${me.state.selected_type=='test'? "btn-selector btn-selector-active" : "btn-selector"}`}
								onClick={()=>{me.setType('test')}}>

								<img src="/img/metadata-test.svg" />
								<span className="d-sm-inline">Test Metadata</span>
							</div>
						</div>
					)}
					{ me.isTypeAvailable('prod') && (
						<div className="col col-12 col-md-12 col-lg-4">
							<div className={`btn ${me.state.selected_type=='prod'? "btn-selector btn-selector-active" : "btn-selector"}`}
								onClick={()=>{me.setType('prod')}}>

								<img src="/img/metadata-prod.svg" />
								<span className="d-sm-inline">Production Metadata</span>
							</div>
						</div>
					)}
				</div>
			)}
			<div className="justify-content-center row">
				<div className="title mb-3">Please choice if you want to continue a previous report or start a new one...</div>
				<div className="col col-12 col-md-12 col-lg-4">
					<div className="card worksave-card" 
						onClick={()=>{me.startContinue()}}>

						<div className="card-body">
							<h1><img className="img-fluid worksave-img-continue" src="/img/continue.png" />Continue</h1>
							<p className="worksave-text-muted">Continue to work on the report from the previous session keeping all the stored test results</p>
						</div>
					</div>
				</div>
				<div className="col col-12 col-md-12 col-lg-4">
					<div className="card worksave-card"
						onClick={(e)=>{me.startNew()}}>

						<div className="card-body">
							<h1><img className="img-fluid worksave-img-new" src="/img/new.png" />Start New</h1>
							<p className="worksave-text-muted">Start a new session to work on a blank report resetting all the previous stored results</p>
						</div>
					</div>
				</div>
			</div>
		</div>
    );
}

export default view;                        
