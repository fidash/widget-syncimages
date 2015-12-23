"use strict";

import React, {Component, PropTypes} from "react";
import Rx from "rx";
import {connect} from "react-redux";
import {Label} from "react-bootstrap";
import ImageList from "../components/ImageList";
import Header from "../components/Header";
import Selector from "../components/Selector";
import {toggleVisibility, setImages, setLeft, setRight, clearLR, setRegion, setRegions, deleteImage, copyImage, replaceImage} from "../actions/index";
import {imageSelectors} from "../selectors/imageSelectors";

class App extends Component {

    constructor(props) {
        super(props);
        this.MashupPlatform = window.MashupPlatform;
        this.getOpenStackToken.call(this, this.getProjects);
        this.getAdminRegions.call(this);
        this.getImages();
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

                responseBody.organizations.forEach(function (organization) {
                    if (this.isAdmin(organization.roles)) {
                        adminRegions.push(organization.name.replace(" FIDASH", ""));
                    }
                }.bind(this));
                this.props.dispatch(setRegions(adminRegions));
                this.adminRegions = adminRegions;
                this.getImages.call(this);

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
                    this.getOpenStackToken(function (response) {

                        // For now we only have one cloud project per user so we don't
                        // control the case of several cloud projects.
                        this.scopeToken = tokenResponse.getHeader('x-subject-token');
                        this.getImages.call(this)
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

        const nRegions = this.adminRegions.length;
        let images

        let options = {
            method: "GET",
            requestHeaders: {
                "X-Auth-Token": this.scopeToken,
                "Accept": "application/json"
            },
            onSuccess: function (response) {
                let images = JSON.parse(response.responseText).images;
                this.props.dispatch(setImages(images));
            }.bind(this),
            onFailure: this.clearState.bind(this)
        };

        MashupPlatform.http.makeRequest(App.CLOUD_URL + "/Spain2/image/v1/detail", options);
    }

    synchronize( preferences) {
        const sub = this.makeRequest(preferences, "v1/images", "GET");

        sub.map(response => {
            return JSON.parse(response.response);
        }).map(data => data.images)
            .subscribe(data => {
                // Divide in public/private and set it
                const privateimages = data.filter(f => !f.public);
                const publicimages = data.filter(f => f.public);

                // On OK just dispatch everything :)
                // this.props.dispatch(setImages(data.images));
                this.props.dispatch(setImages(publicimages, privateimages));
                this.props.dispatch(clearLR());
            }, () => {
                // On error, clean everything!
                this.props.dispatch(setImages([], []));
                this.props.dispatch(clearLR());
            });
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
        const {privateimages,
               publicimages,
               left,
               right,
               dispatch,
               region,
               regions,
               filter,
               equalleft,
               equalright} = this.props;

        return (
            <div>
              <Header
                  canclear={left !== ""}
                  filter={filter}
                  onClearClick={() => dispatch(clearLR())}
                  onFilterClick={() => dispatch(toggleVisibility())}
                  onSyncImage={this.synchronize()}/>
              <div>
                <div style={divStyleL}>
                  <Label>Public Images</Label>
                  <ImageList
                      activeid={left}
                      equallist={equalleft}
                      list={publicimages}
                      onImageClick={this.handleImageClick(setLeft, {old: left, myname: "left", othername: "right", mylist: publicimages, otherlist: privateimages})}
                  />
                </div>

                <div style={divStyleR}>
                <Selector onChange={o => dispatch(setRegion(o.value))} options={regions} selected={region}/>
                  <ImageList
                      activeid={right}
                      equallist={equalright}
                      list={privateimages}
                      onImageClick={this.handleImageClick(setRight, {old: right, myname: "right", othername: "left", mylist: privateimages, otherlist: publicimages})}
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
App.propTypes = {
    dispatch: PropTypes.func.isRequired,
    equalleft: PropTypes.array.isRequired,
    equalright: PropTypes.array.isRequired,
    filter: PropTypes.bool.isRequired,
    left: PropTypes.string.isRequired,
    privateimages: PropTypes.array.isRequired,
    publicimages: PropTypes.array.isRequired,
    region: PropTypes.string,
    regions: PropTypes.array.isRequired,
    right: PropTypes.string.isRequired
};

export default connect(imageSelectors)(App);
