import Modal from '../../Modal';
import * as sdk from "../../index";
import EasyStars from '../../EasyStars'

export default async function DonationMenu(updateState, warning, isInputEnabled, currentCurrency){
    const currencies = ['RUB', 'USD'];

    const Field = sdk.getComponent('views.elements.Field');
    const Dropdown = sdk.getComponent('views.elements.Dropdown');

    const onSubmit = async(e) => {
        e.preventDefault();

        const form = document.getElementsByClassName('mx_DonationMenu');
        const { value } = form[0].sum;

        if(!value || value < 1){
            dialog.close();

            return updateState({
                donationWarning: "Сумма должна быть не меньше, чем 1."
            });
        }
        else{
            if(EasyStars.logOutEmptyStorage()){
                dialog.close();
                return;
            }

            const { username } = EasyStars.getDataFromStorage();
            const password = EasyStars.decryptPassword();

            const payment = await EasyStars.postData('quasar/payeer/get_pay_link', username, password, {
                m_amount: value,
                m_curr: currentCurrency
            });

            window.ipcRenderer.send('open_link', payment.response.link);
        }
    }

    const donationDialog = () => (
        <form className="mx_DonationMenu" onSubmit={ onSubmit }>
            <h2>Введите сумму пополнения: </h2>
            <Field name="sum" label="Сумма"/>

            <Dropdown id="currencyDropdown" 
                      label="Валюта" 
                      name="currency"
                      className="mx_currencyDropdown"
                      value={ currentCurrency }
                      onOptionChange={ key => {
                        dialog.close();
                        updateState({ currency: key });
                      }}
            >
                { currencies.map(currency => {
                    return(
                        <div className="mx_CountryDropdown_option" key={ currency }>
                            { currency }
                        </div>
                    )
                }) }
            </Dropdown>

            { isInputEnabled && <Field name="password" label="Пароль" /> }

            { warning && <p className="warning">{ warning }</p> }

            <input type="submit" value="Пополнить"/>
        </form>
    );

    const dialog = Modal.createDialog(donationDialog);
}