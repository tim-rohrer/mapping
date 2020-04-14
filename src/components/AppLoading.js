import React from 'react';
import loadingLogo from '../assets/img/loadingLogo@2x.png';
import LinearProgress from 'material-ui/LinearProgress';

const AppLoading = (props) => {
    return (
        <div className="loading-cont">
            <div className="loading-inner-cont">
                <img className="logo-loading" src={loadingLogo} alt="Wanders Loading" />
                <LinearProgress mode="indeterminate" style={{ width: '50px', margin: '5px auto 0 auto' }} />
            </div>
        </div>
    )
}
export default AppLoading;