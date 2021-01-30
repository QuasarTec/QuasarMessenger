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
import {_t} from "../../../../../languageHandler";
import * as sdk from "../../../../../index";

export default function NotificationUserSettingsTab(_props){
    const [serverResponse, setServerResponse] = useState(null);
    const isServerUnavailable = false; //убрать эту хуйню когда дадут API сервера

    const Field = sdk.getComponent('views.elements.Field');
    const AccessibleButton = sdk.getComponent("elements.AccessibleButton");

    //мне все еще надо убрать это
    const fetchAPI = () => {
        const response = { 
            status: 'success',
            response: 'Неверный ключ, попробуйте еще раз'
        };

        setServerResponse(response);
    }

    return (
        <div className="mx_SettingsTab mx_SyncUserSettingsTab">
            <div className="mx_SettingsTab_heading">{_t("Synchronization")}</div>
            <div className="mx_SettingsTab_SubHeading">
                {_t("QuasarMessenger supports the integration with different company services which provide extra functionality for your comfort while using Quasar products.")}
            </div>

            <div className="mx_SettingsTab_section" id="syncTab">
                <p>Сервис EasyStars предоставит возможность заработка посредством политики проекта. <a href="https://easy-stars.ru">Сайт</a></p>
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

                <div>
                <AccessibleButton onClick={ fetchAPI } kind='primary'>
                    Продолжить
                </AccessibleButton>
                </div>
            </div>
        </div>
    );
}
