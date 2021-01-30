/*
Copyright 2019 New Vector Ltd

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

import React, { useState } from 'react';
import classNames from "classnames";

import * as sdk from '../../../index';
import AuthPage from "./AuthPage";
import {_td} from "../../../languageHandler";
import SettingsStore from "../../../settings/SettingsStore";
import {UIFeature} from "../../../settings/UIFeature";

export default function EasyStarsSync(props){
    const [serverResponse, setServerResponse] = useState(null);
    const isServerUnavailable = true; //убрать эту хуйню когда дадут API сервера

    const AuthHeader = sdk.getComponent("auth.AuthHeader");
    const AccessibleButton = sdk.getComponent("elements.AccessibleButton");
    const Field = sdk.getComponent('views.elements.Field');

    //и эту особенно
    const fetchAPI = () => {
        const response = { 
            status: 'success',
            reponse: 'Неверный ключ, попробуйте еще раз'
        };

        if(response.status === 'success'){
            props.removeSyncWindow();
        }
        else setServerResponse(response);
    }

    return (
        <AuthPage>
            <AuthHeader />
            <div className={classNames("mx_AuthBody", {
                mx_WelcomePage_registrationDisabled: !SettingsStore.getValue(UIFeature.Registration),
            })}>
                <h2>Синхронизация</h2>
                <p>Синхронизировать аккаунт QuasarMessenger с аккаунтом EasyStars</p>
                <Field label="Ключ EasyStars"/>

                { serverResponse?.response && 
                    <p className={ serverResponse.status === 'error' ? 'mx_Login_error' : 'mx_Login_success' }>
                        { serverResponse.response }
                    </p> 
                }

                { isServerUnavailable &&
                    <p className="mx_Login_error mx_Login_serverError mx_Login_serverErrorNonFatal">
                        На данный момент сервера EasyStars недоступны. Вы хотите продолжить регистрацию, чтобы потом 
                        подключить интеграцию с сервисом в настройках или попробовать еще раз?
                    </p>
                }

                <AccessibleButton className="mx_Login_submit" onClick={ fetchAPI }>
                    Продолжить
                </AccessibleButton>

                <AccessibleButton kind="danger" onClick={ props.removeSyncWindow }>
                    Пропустить
                </AccessibleButton>
            </div>
        </AuthPage>
    );
}
