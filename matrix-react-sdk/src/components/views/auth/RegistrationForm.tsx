/*
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
Copyright 2015, 2016, 2017, 2018, 2019, 2020 The Matrix.org Foundation C.I.C.

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

import * as sdk from '../../../index';
import * as Email from '../../../email';
import { looksValid as phoneNumberLooksValid } from '../../../phonenumber';
import Modal from '../../../Modal';
import { _t } from '../../../languageHandler';
import SdkConfig from '../../../SdkConfig';
import { SAFE_LOCALPART_REGEX } from '../../../Registration';
import withValidation from '../elements/Validation';
import {ValidatedServerConfig} from "../../../utils/AutoDiscoveryUtils";
import PassphraseField from "./PassphraseField";
import CountlyAnalytics from "../../../CountlyAnalytics";
import Field from '../elements/Field';
import RegistrationEmailPromptDialog from '../dialogs/RegistrationEmailPromptDialog';
import stringify from '../../../modules/stringify';

enum RegistrationField {
    Email = "field_email",
    PhoneNumber = "field_phone_number",
    Username = "field_username",
    Password = "field_password",
    PasswordConfirm = "field_password_confirm",
    Referral = "field_referral"
}

const PASSWORD_MIN_SCORE = 3; // safely unguessable: moderate protection from offline slow-hash scenario.

interface IProps {
    // Values pre-filled in the input boxes when the component loads
    defaultEmail?: string;
    defaultPhoneCountry?: string;
    defaultPhoneNumber?: string;
    defaultUsername?: string;
    defaultPassword?: string;
    flows: {
        stages: string[];
    }[];
    serverConfig: ValidatedServerConfig;
    canSubmit?: boolean;

    onRegisterClick(params: {
        username: string;
        password: string;
        email?: string;
        phoneCountry?: string;
        phoneNumber?: string;
    }): Promise<void>;
    onEditServerDetailsClick?(): void;
}

interface IState {
    // Field error codes by field ID
    fieldValid: Partial<Record<RegistrationField, boolean>>;
    // The ISO2 country code selected in the phone number entry
    phoneCountry: string;
    username: string;
    email: string;
    phoneNumber: string;
    password: string;
    passwordConfirm: string;
    passwordComplexity?: number;
    referral: string,
    registerEmail: string,
    errors: string[]
}

/*
 * A pure UI component which displays a registration form.
 */
export default class RegistrationForm extends React.PureComponent<IProps, IState> {
    static defaultProps = {
        onValidationChange: console.error,
        canSubmit: true,
    };

    constructor(props) {
        super(props);

        this.state = {
            fieldValid: {},
            phoneCountry: this.props.defaultPhoneCountry,
            username: this.props.defaultUsername || "",
            email: this.props.defaultEmail || "",
            phoneNumber: this.props.defaultPhoneNumber || "",
            password: this.props.defaultPassword || "",
            passwordConfirm: this.props.defaultPassword || "",
            passwordComplexity: null,
            referral: '',
            registerEmail: '',
            errors: [],
        };

        CountlyAnalytics.instance.track("onboarding_registration_begin");
    }

    private tryToRegister = async (ev) => {
        ev.preventDefault();
        ev.persist();

        const isRegistered = await this.quasarRegister();

        if (isRegistered) {
            localStorage.setItem('username', this.state.username);
            await this.matrixRegister(ev);
        }
    }

    private quasarRegister = async () => {
        const { registerEmail: email, username: rawUsername, password, referral } = this.state;

        const username = rawUsername[0] === '@' ? rawUsername : '@' + rawUsername;

        const body: any = { username, email, password }
        if (referral) body.referral = referral;

        const query = stringify(body);

        const res = await fetch(`https://api.quasaria.ru/api/query/user/register`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded',
            },
            body: query,
        });

        const result = await res.json();

        if (result.status === 'error'
            && (Object.keys(result.response_text).length === 1 || Object.keys(result.response_text).length === 2)) {
            if ( result.response_text?.username?.[0] === 'Пользователь с таким логином уже зарегистрирован'
                || result.response_text?.email?.[0] === 'Пользователь с такой электронной почтой уже зарегистрирован') {
                return true;
            }
        }

        if (result.status === 'error') {
            const response = result.response_text;
            const keys = Object.keys(response);

            const resErrors: string[] = [];

            for (const key of keys) {
                response[key].map((err: string) => {
                    resErrors.push(err);
                });
            }

            this.setState({
                errors: resErrors,
            });
            return false;
        }

        return true;
    }

    private matrixRegister = async ev => {
        if (!this.props.canSubmit) return;

        const allFieldsValid = await this.verifyFieldsBeforeSubmit();
        if (!allFieldsValid) {
            CountlyAnalytics.instance.track("onboarding_registration_submit_failed");
            return;
        }

        if (this.state.email === '') {
            if (this.showEmail()) {
                CountlyAnalytics.instance.track("onboarding_registration_submit_warn");
                Modal.createTrackedDialog("Email prompt dialog", '', RegistrationEmailPromptDialog, {
                    onFinished: async (confirmed: boolean, email?: string) => {
                        if (confirmed) {
                            this.setState({
                                email,
                            }, () => {
                                this.doSubmit(ev);
                            });
                        }
                    },
                });
            } else {
                // user can't set an e-mail so don't prompt them to
                this.doSubmit(ev);
                return;
            }
        } else {
            this.doSubmit(ev);
        }
    };

    private doSubmit(ev) {
        const email = this.state.email.trim();

        CountlyAnalytics.instance.track("onboarding_registration_submit_ok", {
            email: !!email,
        });

        const promise = this.props.onRegisterClick({
            username: this.state.username.trim(),
            password: this.state.password.trim(),
            email: email,
            phoneCountry: this.state.phoneCountry,
            phoneNumber: this.state.phoneNumber,
        });

        if (promise) {
            ev.target.disabled = true;
            promise.finally(function() {
                ev.target.disabled = false;
            });
        }
    }

    private async verifyFieldsBeforeSubmit() {
        // Blur the active element if any, so we first run its blur validation,
        // which is less strict than the pass we're about to do below for all fields.
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement) {
            activeElement.blur();
        }

        const fieldIDsInDisplayOrder = [
            RegistrationField.Username,
            RegistrationField.Password,
            RegistrationField.PasswordConfirm,
            RegistrationField.Email,
            RegistrationField.PhoneNumber,
        ];

        // Run all fields with stricter validation that no longer allows empty
        // values for required fields.
        for (const fieldID of fieldIDsInDisplayOrder) {
            const field = this[fieldID];
            if (!field) {
                continue;
            }
            // We must wait for these validations to finish before queueing
            // up the setState below so our setState goes in the queue after
            // all the setStates from these validate calls (that's how we
            // know they've finished).
            await field.validate({ allowEmpty: false });
        }

        // Validation and state updates are async, so we need to wait for them to complete
        // first. Queue a `setState` callback and wait for it to resolve.
        await new Promise(resolve => this.setState({}, resolve));

        if (this.allFieldsValid()) {
            return true;
        }

        const invalidField = this.findFirstInvalidField(fieldIDsInDisplayOrder);

        if (!invalidField) {
            return true;
        }

        // Focus the first invalid field and show feedback in the stricter mode
        // that no longer allows empty values for required fields.
        invalidField.focus();
        invalidField.validate({ allowEmpty: false, focused: true });
        return false;
    }

    /**
     * @returns {boolean} true if all fields were valid last time they were validated.
     */
    private allFieldsValid() {
        const keys = Object.keys(this.state.fieldValid);
        for (let i = 0; i < keys.length; ++i) {
            if (!this.state.fieldValid[keys[i]]) {
                return false;
            }
        }
        return true;
    }

    private findFirstInvalidField(fieldIDs: RegistrationField[]) {
        for (const fieldID of fieldIDs) {
            if (!this.state.fieldValid[fieldID] && this[fieldID]) {
                return this[fieldID];
            }
        }
        return null;
    }

    private markFieldValid(fieldID: RegistrationField, valid: boolean) {
        const { fieldValid } = this.state;
        fieldValid[fieldID] = valid;
        this.setState({
            fieldValid,
        });
    }

    private onEmailChange = ev => {
        this.setState({
            registerEmail: ev.target.value,
        });
    };

    private onReferralChange = ev => {
        this.setState({
            referral: ev.target.value,
        });
    };

    private onEmailValidate = async fieldState => {
        const result = await this.validateEmailRules(fieldState);
        this.markFieldValid(RegistrationField.Email, result.valid);
        return result;
    };

    private onReferralValidate = async fieldState => {
        const result = await this.validateReferralRules(fieldState);
        this.markFieldValid(RegistrationField.Referral, result.valid);
        return result;
    };

    private validateReferralRules = withValidation({
        description: () => "Используйте его, чтобы указать ник вашего пригласителя",
        hideDescriptionIfValid: true,
        rules: [
            {
                key: "referral",
                test: ({ value }) => !value || value[0] === '@',
                invalid: () => "Ник должен начинаться с \"@\"",
            },
        ],
    });

    private validateEmailRules = withValidation({
        description: () => _t("Use an email address to recover your account"),
        hideDescriptionIfValid: true,
        rules: [
            {
                key: "required",
                test(this: RegistrationForm, { value, allowEmpty }) {
                    return allowEmpty || !this.authStepIsRequired('m.login.email.identity') || !!value;
                },
                invalid: () => _t("Enter email address (required on this homeserver)"),
            },
            {
                key: "email",
                test: ({ value }) => !value || Email.looksValid(value),
                invalid: () => _t("Doesn't look like a valid email address"),
            },
        ],
    });

    private onPasswordChange = ev => {
        this.setState({
            password: ev.target.value,
        });
    };

    private onPasswordValidate = result => {
        this.markFieldValid(RegistrationField.Password, result.valid);
    };

    private onPasswordConfirmChange = ev => {
        this.setState({
            passwordConfirm: ev.target.value,
        });
    };

    private onPasswordConfirmValidate = async fieldState => {
        const result = await this.validatePasswordConfirmRules(fieldState);
        this.markFieldValid(RegistrationField.PasswordConfirm, result.valid);
        return result;
    };

    private validatePasswordConfirmRules = withValidation({
        rules: [
            {
                key: "required",
                test: ({ value, allowEmpty }) => allowEmpty || !!value,
                invalid: () => _t("Confirm password"),
            },
            {
                key: "match",
                test(this: RegistrationForm, { value }) {
                    return !value || value === this.state.password;
                },
                invalid: () => _t("Passwords don't match"),
            },
        ],
    });

    private onPhoneCountryChange = newVal => {
        this.setState({
            phoneCountry: newVal.iso2,
        });
    };

    private onPhoneNumberChange = ev => {
        this.setState({
            phoneNumber: ev.target.value,
        });
    };

    private onPhoneNumberValidate = async fieldState => {
        const result = await this.validatePhoneNumberRules(fieldState);
        this.markFieldValid(RegistrationField.PhoneNumber, result.valid);
        return result;
    };

    private validatePhoneNumberRules = withValidation({
        description: () => _t("Other users can invite you to rooms using your contact details"),
        hideDescriptionIfValid: true,
        rules: [
            {
                key: "required",
                test(this: RegistrationForm, { value, allowEmpty }) {
                    return allowEmpty || !this.authStepIsRequired('m.login.msisdn') || !!value;
                },
                invalid: () => _t("Enter phone number (required on this homeserver)"),
            },
            {
                key: "email",
                test: ({ value }) => !value || phoneNumberLooksValid(value),
                invalid: () => _t("That phone number doesn't look quite right, please check and try again"),
            },
        ],
    });

    private onUsernameChange = ev => {
        this.setState({
            username: ev.target.value,
        });
    };

    private onUsernameValidate = async fieldState => {
        const result = await this.validateUsernameRules(fieldState);
        this.markFieldValid(RegistrationField.Username, result.valid);
        return result;
    };

    private validateUsernameRules = withValidation({
        description: () => _t("Use lowercase letters, numbers, dashes and underscores only"),
        hideDescriptionIfValid: true,
        rules: [
            {
                key: "required",
                test: ({ value, allowEmpty }) => allowEmpty || !!value,
                invalid: () => _t("Enter username"),
            },
            {
                key: "safeLocalpart",
                test: ({ value }) => !value || SAFE_LOCALPART_REGEX.test(value),
                invalid: () => _t("Some characters not allowed"),
            },
        ],
    });

    /**
     * A step is required if all flows include that step.
     *
     * @param {string} step A stage name to check
     * @returns {boolean} Whether it is required
     */
    private authStepIsRequired(step: string) {
        return this.props.flows.every((flow) => {
            return flow.stages.includes(step);
        });
    }

    /**
     * A step is used if any flows include that step.
     *
     * @param {string} step A stage name to check
     * @returns {boolean} Whether it is used
     */
    private authStepIsUsed(step: string) {
        return this.props.flows.some((flow) => {
            return flow.stages.includes(step);
        });
    }

    private showEmail() {
        if (!this.authStepIsUsed('m.login.email.identity')) {
            return false;
        }
        return true;
    }

    private showPhoneNumber() {
        const threePidLogin = !SdkConfig.get().disable_3pid_login;
        if (!threePidLogin || !this.authStepIsUsed('m.login.msisdn')) {
            return false;
        }
        return true;
    }

    private renderEmail() {
        const emailPlaceholder = _t("Email")
        return <Field
            ref={field => this[RegistrationField.Email] = field}
            type="text"
            label={emailPlaceholder}
            value={this.state.registerEmail}
            onChange={this.onEmailChange}
            onValidate={this.onEmailValidate}
        />;
    }

    private renderReferral() {
        return <Field
            ref={field => this[RegistrationField.Referral] = field}
            type="text"
            label={'Telegram ник вашего реферала'}
            value={this.state.referral}
            onValidate={this.onReferralValidate}
            onChange={this.onReferralChange}
        />;
    }

    private renderPassword() {
        return <PassphraseField
            id="mx_RegistrationForm_password"
            fieldRef={field => this[RegistrationField.Password] = field}
            minScore={PASSWORD_MIN_SCORE}
            value={this.state.password}
            onChange={this.onPasswordChange}
            onValidate={this.onPasswordValidate}
            onFocus={() => CountlyAnalytics.instance.track("onboarding_registration_password_focus")}
            onBlur={() => CountlyAnalytics.instance.track("onboarding_registration_password_blur")}
        />;
    }

    renderPasswordConfirm() {
        return <Field
            id="mx_RegistrationForm_passwordConfirm"
            ref={field => this[RegistrationField.PasswordConfirm] = field}
            type="password"
            autoComplete="new-password"
            label={_t("Confirm password")}
            value={this.state.passwordConfirm}
            onChange={this.onPasswordConfirmChange}
            onValidate={this.onPasswordConfirmValidate}
            onFocus={() => CountlyAnalytics.instance.track("onboarding_registration_passwordConfirm_focus")}
            onBlur={() => CountlyAnalytics.instance.track("onboarding_registration_passwordConfirm_blur")}
        />;
    }

    renderPhoneNumber() {
        if (!this.showPhoneNumber()) {
            return null;
        }
        const CountryDropdown = sdk.getComponent('views.auth.CountryDropdown');
        const phoneLabel = this.authStepIsRequired('m.login.msisdn') ?
            _t("Phone") :
            _t("Phone (optional)");
        const phoneCountry = <CountryDropdown
            value={this.state.phoneCountry}
            isSmall={true}
            showPrefix={true}
            onOptionChange={this.onPhoneCountryChange}
        />;
        return <Field
            ref={field => this[RegistrationField.PhoneNumber] = field}
            type="text"
            label={phoneLabel}
            value={this.state.phoneNumber}
            prefixComponent={phoneCountry}
            onChange={this.onPhoneNumberChange}
            onValidate={this.onPhoneNumberValidate}
        />;
    }

    renderUsername() {
        return <Field
            id="mx_RegistrationForm_username"
            ref={field => this[RegistrationField.Username] = field}
            type="text"
            autoFocus={true}
            label={"Ваш telegram ник без \"@\""}
            placeholder={"Ваш telegram ник без \"@\""}
            value={this.state.username}
            onChange={this.onUsernameChange}
            onValidate={this.onUsernameValidate}
            onFocus={() => CountlyAnalytics.instance.track("onboarding_registration_username_focus")}
            onBlur={() => CountlyAnalytics.instance.track("onboarding_registration_username_blur")}
        />;
    }

    render() {
        const registerButton = (
            <input className="mx_Login_submit" type="submit" value={_t("Register")} disabled={!this.props.canSubmit} />
        );

        let emailHelperText = null;
        if (this.showEmail()) {
            if (this.showPhoneNumber()) {
                emailHelperText = <div>
                    {
                        _t("Add an email to be able to reset your password.")
                    } {
                        _t("Use email or phone to optionally be discoverable by existing contacts.")
                    }
                </div>;
            } else {
                emailHelperText = <div>
                    {
                        _t("Add an email to be able to reset your password.")
                    } {
                        _t("Use email to optionally be discoverable by existing contacts.")
                    }
                </div>;
            }
        }

        const { errors } = this.state;

        return (
            <div>
                <form onSubmit={this.tryToRegister}>
                    <div className="mx_AuthBody_fieldRow">
                        {this.renderUsername()}
                    </div>
                    <div className="mx_AuthBody_fieldRow">
                        {this.renderPassword()}
                        {this.renderPasswordConfirm()}
                    </div>
                    <div className="mx_AuthBody_fieldRow">
                        {this.renderEmail()}
                        {this.renderPhoneNumber()}
                    </div>
                    <div className="mx_AuthBody_fieldRow">
                        {this.renderReferral()}
                    </div>
                    { emailHelperText }
                    { errors.length > 0 && errors.map(error => (
                        <p className="mx_Login_error" key={error}>{ error }</p>
                    )) }
                    { registerButton }
                </form>
            </div>
        );
    }
}
