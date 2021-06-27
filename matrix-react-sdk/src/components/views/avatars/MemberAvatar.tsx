/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2019 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react';
import {RoomMember} from "matrix-js-sdk/src/models/room-member";

import dis from "../../../dispatcher/dispatcher";
import {Action} from "../../../dispatcher/actions";
import {MatrixClientPeg} from "../../../MatrixClientPeg";
import BaseAvatar from "./BaseAvatar";
import SdkConfig from "../../../SdkConfig";

interface IProps extends Omit<React.ComponentProps<typeof BaseAvatar>, "name" | "idName" | "url"> {
    member: RoomMember;
    fallbackUserId?: string;
    width: number;
    height: number;
    resizeMethod?: string;
    // The onClick to give the avatar
    onClick?: React.MouseEventHandler;
    // Whether the onClick of the avatar should be overriden to dispatch `Action.ViewUser`
    viewUserOnClick?: boolean;
    title?: string;
    mxEvent?: any, // event whose sender we're showing
}

interface IState {
    name: string;
    title: string;
    imageUrl?: string;
}

export default class MemberAvatar extends React.Component<IProps, IState> {
    public static defaultProps = {
        width: 40,
        height: 40,
        resizeMethod: 'crop',
        viewUserOnClick: false,
    };

    constructor(props: IProps) {
        super(props);

        this.state = MemberAvatar.getState(props);
    }

    public static getDerivedStateFromProps(nextProps: IProps): IState {
        return MemberAvatar.getState(nextProps);
    }

    private static getState(props: IProps): IState {
        if (props.member && props.member.name) {
            return {
                name: props.member.name,
                title: props.title || props.member.userId,
                imageUrl: props.member.getAvatarUrl(
                    MatrixClientPeg.get().getHomeserverUrl(),
                    Math.floor(props.width * window.devicePixelRatio),
                    Math.floor(props.height * window.devicePixelRatio),
                    props.resizeMethod,
                    false,
                    false,
                ),
            };
        } else if (props.fallbackUserId) {
            return {
                name: props.fallbackUserId,
                title: props.fallbackUserId,
            };
        } else {
            console.error("MemberAvatar called somehow with null member or fallbackUserId");
        }
    }

    render() {
        let {member, fallbackUserId, onClick, viewUserOnClick, ...otherProps} = this.props;
        const userId = member ? member.userId : fallbackUserId;

        const brandRoomId = SdkConfig.get()?.['brand_room_id'];
        let roomId;

        if (this.props.mxEvent) {
            roomId = this.props.mxEvent.getRoomId();
        }

        if (viewUserOnClick) {
            onClick = () => {
                dis.dispatch({
                    action: Action.ViewUser,
                    member: this.props.member,
                });
            };
        }

        return (
            <BaseAvatar {...otherProps} name={this.state.name} title={this.state.title}
                isBrandRoom={this.props.mxEvent && brandRoomId === roomId}
                idName={userId} url={this.state.imageUrl} onClick={onClick} />
        );
    }
}
