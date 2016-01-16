"use strict";

import React, {Component, PropTypes} from "react";
import Rx from "rx";
import {connect} from "react-redux";
import {Label} from "react-bootstrap";
import ImageList from "../components/ImageList";
import Header from "../components/Header";
import Selector from "../components/Selector";
import {toggleVisibility, setImages, setLeft, setRight, clearLR, setRegion, setRegions, changeSyncState} from "../actions/index";
import {imageSelectors} from "../selectors/imageSelectors";
import ImageJoiner from "./ImageJoiner";

class App extends Component {

    constructor(props) {
        super(props);
        this.MashupPlatform = window.MashupPlatform;
        this.getOpenStackToken.call(this, this.getProjects);
        this.getAdminRegions.call(this);
    }

    clearState() {
        this.props.dispatch(setImages([], []));
        this.props.dispatch(clearLR());
    }

    getpreferences() {
        return {
            serverUrl: this.MashupPlatform.prefs.get("serverUrl"),
            user: this.MashupPlatform.prefs.get("user"),
            password: this.MashupPlatform.prefs.get("password")
        };
    }

    isAdmin(roles) {
        let found = false;
        for (let i=0; i<roles.length && !found; i++) {
            if (roles[i].name === "InfrastructureOwner") {
                found = true;
            }
        }
        return found;
    }

    getAdminRegions() {

        let options = {
            method: "GET",
            requestHeaders: {
                "X-FI-WARE-OAuth-Token": "true",
                "x-fi-ware-oauth-get-parameter": "access_token",
                "Accept": "application/json"
            },
            onSuccess: function (response) {

                let responseBody = JSON.parse(response.responseText);
                let adminRegions = [];
                let region;

                responseBody.organizations.forEach(function (organization) {
                    region = organization.name.replace(" FIDASH", "");
                    if (this.isAdmin(organization.roles) && region !== App.REFERENCE_REGION) {
                        adminRegions.push(region);
                    }
                }.bind(this));
                this.props.dispatch(setRegions(adminRegions));
                this.adminRegions = adminRegions;
                this.getImages.call(this);
                this.checkSync.call(this, true);

            }.bind(this),
            onFailure: this.clearState.bind(this)
        };

        MashupPlatform.http.makeRequest(App.IDM_URL + "/user", options);
    }

    getOpenStackToken(success, projectId) {

        let postBody = {
            "auth": {
                "identity": {
                    "methods": [
                        "oauth2"
                    ],
                    "oauth2": {
                        "access_token_id": "%fiware_token%"
                    }
                }
            }
        };

        // Add scope if any
        if (projectId) {
            postBody.auth.scope = {
                "project":{
                    "id": projectId
                 }
            };
        }

        let options = {
            method: "POST",
            requestHeaders: {
                "X-FI-WARE-OAuth-Token": "true",
                "X-FI-WARE-OAuth-Token-Body-Pattern": "%fiware_token%",
                "Accept": "application/json"
            },
            contentType: "application/json",
            postBody: JSON.stringify(postBody),
            onSuccess: success.bind(this),
            onFailure: this.clearState.bind(this)
        };

        MashupPlatform.http.makeRequest(App.CLOUD_URL + "/keystone/v3" + "/auth/tokens", options);
    }

    getProjects(response) {
        const generalToken = response.getHeader('x-subject-token');
        let username = MashupPlatform.context.get('username');
        let options = {
            method: "GET",
            requestHeaders: {
                "X-Auth-Token": generalToken,
                "Accept": "application/json"
            },
            onSuccess: function (response) {
                let responseBody = JSON.parse(response.responseText);
                responseBody.role_assignments.forEach(function (role) {
                    let project = role.scope.project.id;
                    this.getProjectPermissions(project, generalToken);
                }.bind(this));
            }.bind(this),
            onFailure: this.clearState.bind(this)
        };

        MashupPlatform.http.makeRequest(App.CLOUD_URL + "/keystone/v3" + "/role_assignments?user.id=" + username, options);
    }

    getProjectPermissions(project, generalToken) {
        let options = {
            method: "GET",
            requestHeaders: {
                "X-Auth-Token": generalToken,
                "Accept": "application/json"
            },
            onSuccess: function (response) {
                let responseBody = JSON.parse(response.responseText);
                if (responseBody.project.is_cloud_project) {
                    this.getOpenStackToken(function (tokenResponse) {

                        // For now we only have one cloud project per user so we don't
                        // control the case of several cloud projects.
                        this.scopeToken = tokenResponse.getHeader('x-subject-token');
                        this.getImages.call(this);
                    }, project);
                }
            }.bind(this),
            onFailure: this.clearState.bind(this)
        };

        MashupPlatform.http.makeRequest(App.CLOUD_URL + "/keystone/v3" + "/projects/" + project, options);
    }

    makeRequest(preferences, url, method, postBody) {
        let baseURL = preferences.serverUrl;
        const sub = new Rx.AsyncSubject();
        const onsucc = response => {
            sub.onNext(response);
            sub.onCompleted();
        };
        const onfail = response => {list.indexOf(target)
            sub.onError(response);
            sub.onCompleted();
        };

        if (baseURL[baseURL.length - 1] !== "/") {
            baseURL += "/";
        }
        baseURL += url;

        const options = {
            method: method,
            requestHeaders: {
                user: preferences.user,
                password: preferences.password,
                Accept: "application/json"
            },
            onSuccess: onsucc,
            onFailure: onfail
        };

        if (postBody) {
            options.postBody = postBody;
        }

        this.MashupPlatform.http.makeRequest(baseURL, options);
        return sub.asObservable();
    }

    getImages() {
        if (!this.adminRegions || !this.scopeToken) {
            return;
        }

        const nRegions = this.adminRegions.length + 1;
        let imageJoiner = new ImageJoiner(nRegions, this.props.dispatch, setImages);
        let options = {
            method: "GET",
            requestHeaders: {
                "X-Auth-Token": this.scopeToken,
                "Accept": "application/json"
            },
            onFailure: error => {
                console.log(error);
                imageJoiner.deductCounter();
            }
        };

        this.adminRegions.forEach(region => {
            options.onSuccess = response => {
                const images = JSON.parse(response.responseText).images;
                imageJoiner.addImages(images, region);
            };
            MashupPlatform.http.makeRequest(App.CLOUD_URL + "/" + region + "/image/v1/images/detail?limit=100", options);
        });

        options.onSuccess = response => {
            const images = JSON.parse(response.responseText).images;
            imageJoiner.addImages(images, "Spain2");
        };
        MashupPlatform.http.makeRequest(App.CLOUD_URL + "/Spain2/image/v1/images/detail", options);
    }

    synchronize() {
        let tryCount = 0;
        const options = {
            method: "POST",
            requestHeaders: {
                "X-Auth-Token": this.scopeToken,
                "Accept": "application/json"
            },
            contentType: "application/json",
            onFailure: error => {
                this.errorHandler(error, this.synchronize.bind(this));
            }.bind(this),
            onSuccess: response => {
                this.checkSync.call(this, false);
            }.bind(this)
        };

        MashupPlatform.http.makeRequest(App.SYNC_URL + "/regions/" + this.props.region, options);
    }

    checkSync(autoRefresh) {
        const options = {
            method: "GET",
            requestHeaders: {
                "X-Auth-Token": this.scopeToken,
                "Accept": "application/json"
            },
            onFailure: error => {
                this.errorHandler(error, this.checkSync.bind(this, autoRefresh));
            }.bind(this),
            onSuccess: response => {
                const images = JSON.parse(response.responseText).images;
                let allOk = true;
                images.forEach(image => {
                    const status = image.status.split("_")[0];
                    this.props.dispatch(changeSyncState(image.id, status));

                    if (status !== "ok") {
                        allOk = false;
                    }
                }.bind(this));

                const delay = allOk ? App.POLL_DELAY_OK : App.POLL_DELAY_SYNC;
                if (allOk) {
                    this.getImages.call(this);
                }

                if (autoRefresh) {
                    setTimeout(() => {
                        this.checkSync.call(this, autoRefresh);
                    }.bind(this), delay);
                }
            }.bind(this)
        };

        MashupPlatform.http.makeRequest(App.SYNC_URL + "/regions/" + this.props.region, options);
    }

    errorHandler(error, retryFunction) {
        console.log(error);
        if (tryCount < App.TRY_LIMIT) {
            setTimeout(() => {
                retryFunction();
                tryCount += 1;
            }, App.RETRY_DELAY);
        }
        //TODO else display error message
    }

    handleImageClick(dispatchf, data) {
        const {old, myname, othername, mylist, otherlist} = data;
        const filterflav = ({vcpus, ram, disk, name}) => ({vcpus, ram, disk, name});

        return function handler(id) {
            if (id === old) {
                this.props.dispatch(dispatchf("")); // Click in the same, clean it.
                return;
            }
            this.props.dispatch(dispatchf(id)); // dispatch the original one!

            // Send it!
            if (this.props[othername] !== "") {
                const otherobj = otherlist.find(x => x.id === this.props[othername]);
                const myobj = mylist.find(x => x.id === id);
                let tosend = {};

                if (typeof myobj === "undefined" || typeof otherobj === "undefined") {
                    window.console.error("Not find?");
                    return;
                }

                if (myname === "left") {
                    tosend = {
                        to: filterflav(myobj),
                        from: filterflav(otherobj)
                    };
                } else {
                    tosend = {
                        to: filterflav(otherobj),
                        from: filterflav(myobj)
                    };
                }

                this.MashupPlatform.wiring.pushEvent("compare", JSON.stringify(tosend));
            }
        }.bind(this);
    }

    getSelectedImage(list) {
        return list.find(x => x.class === "active");
    }

    render() {
        const buildDivStyle = float => {
            return {
                float: float,
                textAlign: "center",
                width: "50%"
            };
        };
        const divStyleL = buildDivStyle("left");
        const divStyleR = buildDivStyle("right");
        const {ownerImages,
               referenceImages,
               left,
               right,
               dispatch,
               region,
               regions,
               filter,
               equalleft,
               equalright,
               syncStates} = this.props;

        return (
            <div>
              <Header
                  canclear={left !== ""}
                  filter={filter}
                  onClearClick={() => dispatch(clearLR())}
                  onFilterClick={() => dispatch(toggleVisibility())}
                  onSyncImage={this.synchronize.bind(this)}/>
              <div>
                <div style={divStyleL}>
                  <Label>Reference (Spain2)</Label>
                  <ImageList
                      activeid={left}
                      equallist={equalleft}
                      list={referenceImages}
                      onImageClick={this.handleImageClick(setLeft, {old: left, myname: "left", othername: "right", mylist: referenceImages, otherlist: ownerImages})}
                  />
                </div>

                <div style={divStyleR}>
                <Selector onChange={o => dispatch(setRegion(o.value))} options={regions} selected={region}/>
                  <ImageList
                      activeid={right}
                      equallist={equalright}
                      list={ownerImages}
                      onImageClick={this.handleImageClick(setRight, {old: right, myname: "right", othername: "left", mylist: ownerImages, otherlist: referenceImages})}
                      syncStates={syncStates}
                  />
                </div>
              </div>
                </div>);
        // <Button bsStyle="info" className="compareBtn" disabled={left === "" || right === ""}
        // onMouseDown={ev => ev.preventDefault()}>Compare</Button>
    }
}

App.CLOUD_URL = "https://cloud.lab.fiware.org";
App.IDM_URL = "https://account.lab.fiware.org";
App.SYNC_URL = "http://private-anon-7cf62f491-glancesync.apiary-mock.com";
App.REFERENCE_REGION = "Spain2";
App.TRY_LIMIT = 15;
App.RETRY_DELAY = 2000;
App.POLL_DELAY_OK = 30000;
App.POLL_DELAY_SYNC = 2000;
App.propTypes = {
    dispatch: PropTypes.func.isRequired,
    equalleft: PropTypes.array.isRequired,
    equalright: PropTypes.array.isRequired,
    filter: PropTypes.bool.isRequired,
    left: PropTypes.string.isRequired,
    ownerImages: PropTypes.array.isRequired,
    referenceImages: PropTypes.array.isRequired,
    region: PropTypes.string,
    regions: PropTypes.array.isRequired,
    right: PropTypes.string.isRequired,
    syncStates: PropTypes.object
};

export default connect(imageSelectors)(App);
