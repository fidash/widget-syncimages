"use strict";

import React, {PropTypes} from "react";
import {Nav, NavItem} from "react-bootstrap";

// Stateless component: https://facebook.github.io/react/blog/2015/09/10/react-v0.14-rc1.html#stateless-function-components
const ImageList = props => {
    const {activeid, equallist, list, onImageClick, syncStates} = props;
    const inEqualList = elemid => equallist.filter(x => x === elemid).length > 0;
    const getSyncState = id => syncStates ? syncStates[id] : "";
    const items = list ? list.map(e =>
        <NavItem
            className={
                (inEqualList(e.id)) ? "itemequal " + getSyncState(e.id) : getSyncState(e.id)
            }
            eventKey={e.id}
            key={e.id}
            onMouseDown={ev => ev.preventDefault()}>
          {e.name}
        </NavItem>) : [];

    return (<Nav activeKey={activeid} bsStyle="pills" onSelect={onImageClick} stacked>
            {items}
            </Nav>);
};

ImageList.propTypes = {
    activeid: PropTypes.string.isRequired,
    equallist: PropTypes.array.isRequired,
    list: PropTypes.array.isRequired,
    onImageClick: PropTypes.func.isRequired,
    syncStates: PropTypes.object
};

export default ImageList;
